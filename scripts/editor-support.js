/* eslint-disable no-restricted-syntax */
import { showSlide, startAutoScroll } from '../blocks/hero-carousel/hero-carousel.js';
import { showTestimony, startScroll } from '../blocks/testimonies/testimonies.js';
import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadBlocks,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain, moveInstrumentation } from './scripts.js';

function getState(block) {
  if (block.matches('.accordion')) {
    return [...block.querySelectorAll('details[open]')]
      .map((details) => details.dataset.aueResource);
  }

  // store the slide index
  if (block.matches('.hero-carousel')) {
    return block.dataset.activeSlide;
  }
  if (block.matches('.testimonies')) {
    return block.dataset.selectedIndex;
  }
  return null;
}

function setState(block, state) {
  if (block.matches('.accordion')) {
    block.querySelectorAll('details').forEach((details) => {
      details.open = state.includes(details.dataset.aueResource);
    });
  }

  // restore the active slide
  if (block.matches('.hero-carousel')) {
    // dont start scrolling after edit
    clearInterval(block.dataset.heroInterval);
    // make sure its visible or observer will not work correctly
    block.style.display = null;
    showSlide(block, state);
  }
  if (block.matches('.testimonies')) {
    clearInterval(block.dataset.testimoniesInterval);
    block.dataset.testimoniesInterval = '';
    showTestimony(block, state);
  }
}

// set the filter for an UE editable
function setUEFilter(element, filter) {
  element.dataset.aueFilter = filter;
}

/**
 * See:
 * https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/attributes-types#data-properties
 */
function updateUEInstrumentation() {
  const main = document.querySelector('main');

  // ----- if calculator pages, identified by theme
  if (document.querySelector('body[class^=calculator]')) {
    // update section filter
    main.querySelectorAll('.section').forEach((elem) => {
      setUEFilter(elem, 'calculator-section');
    });
  }
}

async function applyChanges(event) {
  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  const parsedUpdate = new DOMParser().parseFromString(content, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadBlocks(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const state = getState(block);
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        await loadBlock(newBlock);
        block.remove();
        setState(newBlock, state);
        newBlock.style.display = null;
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadBlocks(parentElement);
          element.remove();
          newSection.style.display = null;
        } else {
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
        }
        return true;
      }
    }
  }

  return false;
}

function handleSelection(event) {
  const { detail } = event;
  const resource = detail?.resource;

  if (resource) {
    const element = document.querySelector(`[data-aue-resource="${resource}"]`);
    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');

    if (block && block.matches('.accordion')) {
      // close all details
      block.querySelectorAll('details').forEach((details) => {
        details.open = false;
      });
      const details = element.matches('details') ? element : element.querySelector('details');
      details.open = true;
    }

    // if a hero carousel slide was selected (or anything inside)
    if (block && block.matches('.hero-carousel') && detail.selected && !element.classList.contains('block')) {
      if (block.dataset.activeSlide !== element.dataset.slideIndex) {
        showSlide(block, element.dataset.slideIndex);
      }
    }
    if (block && block.matches('.testimonies') && detail.selected) {
      showTestimony(block, element.dataset.index);
    }
  }
}

function findComponentDef(componentDefinitions, filter) {
  for (const group of componentDefinitions.groups) {
    for (const component of group.components) {
      const template = component?.plugins?.xwalk?.page?.template;
      if (template && filter(template)) {
        return component;
      }
    }
  }
  return null;
}

/**
 * For components that are implemented by the same block, the Content Tree and the labels would
 * be the block name. This is not inuitive as the author did add a specific configuration of that
 * block to the page. This function finds the used component definition for a given model and
 * block name and updates the data-aue-label accordingly.
 *
 * @param {*} main
 * @param {*} blocks
 */
async function rewriteBlockLabels(main, blocks = ['Table']) {
  // fetch component definitions
  const componentDefinitionsRes = await fetch(`${window.hlx.codeBasePath}/component-definition.json`);
  if (componentDefinitionsRes.ok) {
    const componentDefinitions = await componentDefinitionsRes.json();
    blocks.forEach((blockName) => main.querySelectorAll(`[data-aue-label="${blockName}"]`).forEach((block) => {
      const { aueModel } = block.dataset;
      // eslint-disable-next-line arrow-body-style
      const component = findComponentDef(componentDefinitions, ({ name, model }) => {
        return name === blockName && model === aueModel;
      });
      if (component) {
        block.dataset.aueLabel = component.title;
      }
    }));
  }
}

function attachEventListners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    const applied = await applyChanges(event);
    if (!applied) window.location.reload();
    else {
      rewriteBlockLabels(main);
      updateUEInstrumentation();
    }
  }));

  main?.addEventListener('aue:ui-select', handleSelection);

  // turn on/off autoscrolling for hero carousel if in edit or preview
  document.querySelectorAll('.hero-carousel').forEach((heroCarousel) => {
    // when entering edit mode stop scrolling
    document.addEventListener('aue:ui-edit', () => {
      clearInterval(heroCarousel.dataset.heroInterval);
    });

    // when entering preview mode start scrolling
    document.addEventListener('aue:ui-preview', () => {
      startAutoScroll(heroCarousel);
    });
  });
  document.querySelectorAll('.testimonies').forEach((testimonies) => {
    // when entering edit mode stop scrolling
    document.addEventListener('aue:ui-edit', () => {
      clearInterval(testimonies.dataset.testimoniesInterval);
      testimonies.dataset.testimoniesInterval = '';
    });

    // when entering preview mode start scrolling
    document.addEventListener('aue:ui-preview', () => {
      if (testimonies.dataset.testimoniesInterval
        && testimonies.dataset.testimoniesInterval.length === 0
      ) startScroll(testimonies);
    });
  });
}

function removeInstrumentation(editable) {
  moveInstrumentation(editable, null);
}

function observePlaceholders(main) {
  new MutationObserver((mutations) => mutations.forEach(({ addedNodes }) => {
    const placeholderSpan = [...addedNodes].find((node) => node.tagName === 'SPAN' && node.dataset.placeholder);
    if (placeholderSpan) {
      // remove instrumentation from the closes richtext or text
      const editable = placeholderSpan.closest('[data-aue-type="richtext"],[data-aue-type="text"]');
      removeInstrumentation(editable);
    }
  })).observe(main, { subtree: true, childList: true });
}

const m = document.querySelector('main');
attachEventListners(m);
rewriteBlockLabels(m);
observePlaceholders(m);
updateUEInstrumentation();
