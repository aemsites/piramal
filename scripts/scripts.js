/* eslint-disable no-param-reassign */

import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  fetchPlaceholders,
  toClassName,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter(
        (attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'),
      ),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(
        `${window.hlx.codeBasePath}/blocks/modal/modal.js`
      );
      openModal(origin.href);
    }
  });
}

function decorateImageIcons(element, prefix = '') {
  const anchors = element.querySelectorAll('a');

  anchors.forEach((anchor) => {
    const { href } = anchor;
    let imageName = '';

    if (href.includes('play.google.com')) {
      imageName = 'playstore';
    } else if (href.includes('apps.apple.com')) {
      imageName = 'appstore';
    }

    if (imageName) {
      anchor.textContent = '';
      const img = document.createElement('img');
      img.src = `${window.hlx.codeBasePath}${prefix}/images/${imageName}.webp`;
      img.alt = anchor.title;
      anchor.appendChild(img);
    }
  });
}

async function fetchLoanData(prefix = 'default') {
  window.loanData = window.loanData || {};
  if (!window.loanData[prefix]) {
    window.loanData[prefix] = new Promise((resolve) => {
      fetch(`${prefix === 'default' ? '' : prefix}/loan-key-features.json`)
        .then((resp) => (resp.ok ? resp.json() : {}))
        .then((json) => {
          const loanData = json.data
            .filter(({ id }) => Boolean(id))
            .reduce((acc, { id, ...rest }) => {
              const newEntries = Object.keys(rest).map((key) => [
                toClassName(key),
                rest[key],
              ]);
              return { ...acc, [id]: Object.fromEntries(newEntries) };
            }, {});
          window.loanData[prefix] = loanData;
          resolve(loanData);
        })
        .catch(() => {
          // error loading loanData
          window.loanData[prefix] = {};
          resolve(window.loanData[prefix]);
        });
    });
  }
  return window.loanData[`${prefix}`];
}

export function formatPlaceholder(context, placeholderName, placeholderValue) {
  const locale = document.querySelector('html')?.lang || 'en-IN';
  const twoDigitOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (placeholderName.indexOf('rate') >= 0) {
    // apply percentage formatting to number
    const numericValue = parseFloat(placeholderValue);
    if (!Number.isNaN(numericValue)) {
      placeholderValue = `${numericValue.toLocaleString(
        locale,
        twoDigitOptions,
      )}%`;
    }
  }
  if (placeholderName.indexOf('amount') >= 0) {
    // apply currency formatting to number
    context = context.closest('[class*="currency-format-"]');
    const numericValue = parseInt(placeholderValue, 10);
    if (context && !Number.isNaN(numericValue)) {
      const currencyFormat = [...context.classList]
        .find((cls) => cls.startsWith('currency-format-'))
        .substring(16);
      if (currencyFormat === 'long') {
        // add thousand separators
        while (/(\d+)(\d{3})/.test(placeholderValue)) {
          placeholderValue = placeholderValue.replace(/(\d+)(\d{3})/, '$1,$2');
        }
      }
      if (currencyFormat === 'short' || currencyFormat === 'phonetic') {
        const crores = numericValue / 10000000;
        const lakhs = numericValue / 100000;
        if (crores >= 1) {
          const suffix = currencyFormat === 'phonetic' ? 'Crore' : 'Cr';
          placeholderValue = `${crores.toFixed(0)} ${suffix}`;
        } else {
          const suffix = currencyFormat === 'phonetic' ? 'Lakhs' : 'L';
          if (lakhs >= 1) {
            placeholderValue = `${lakhs.toFixed(0)} ${suffix}`;
          } else {
            placeholderValue = `${lakhs.toLocaleString(
              locale,
              twoDigitOptions,
            )} ${suffix}`;
          }
        }
      }
    }
  }

  return placeholderValue;
}

export async function replacePlaceholders(el) {
  async function fetchAndReplace(context, placeholder) {
    context = context.closest('[class*="loan-type-"]');

    if (context) {
      // give a loan-type-* context we try to find the placeholder in the loan data
      const loanType = [...context.classList]
        .find((cls) => cls.startsWith('loan-type-'))
        .substring(10);
      const allLoanData = await fetchLoanData();
      const loadData = allLoanData?.[loanType];
      if (loadData && loadData[placeholder]) {
        return loadData[placeholder];
      }
    }

    const placeholders = fetchPlaceholders();
    return placeholders[placeholder] || '';
  }

  const filter = ({ nodeValue }) => (nodeValue.trim()
    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT);
  const treeWalker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    filter,
  );
  const replacements = [];
  let currentNode;
  // eslint-disable-next-line no-cond-assign
  while ((currentNode = treeWalker.nextNode()) !== null) {
    const { nodeValue: text } = currentNode;
    const parent = currentNode.parentElement;
    const matches = [...text.matchAll(/{([a-z0-9-]+)}/g)];
    const nodes = [];
    for (let i = 0; i < matches.length; i += 1) {
      const match = matches[i];
      const { index } = match;
      const [fullMatch, placeholder] = match;
      if (i === 0 && index > 0) {
        // prefix only for the first match
        nodes.push(document.createTextNode(text.slice(0, index)));
      }
      const span = document.createElement('span');
      span.dataset.placeholder = placeholder;
      // eslint-disable-next-line no-await-in-loop
      span.textContent = await fetchAndReplace(parent, placeholder);
      span.textContent = formatPlaceholder(
        parent,
        placeholder,
        span.textContent,
      );
      nodes.push(span);
      if (index + fullMatch.length < text.length) {
        let nextNode;
        if (i + 1 < matches.length) {
          const nextMatch = matches[i + 1];
          nextNode = document.createTextNode(
            text.slice(index + fullMatch.length, nextMatch.index),
          );
        } else {
          nextNode = document.createTextNode(
            text.slice(index + fullMatch.length),
          );
        }
        nodes.push(nextNode);
      }
    }
    if (nodes.length) replacements.push({ currentNode, nodes });
  }
  // eslint-disable-next-line no-shadow
  replacements.forEach(({ currentNode, nodes }) => currentNode.replaceWith(...nodes));
}

function autoOpenLinksInNewTab(element, include = ['/vidya']) {
  const anchors = element.querySelectorAll('a');

  anchors.forEach((anchor) => {
    const { href } = anchor;
    if (include.some((path) => href.includes(path))) anchor.target = '_blank';
  });
}

export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('img')) {
          const imgs = [...col.querySelectorAll('img')];
          if (imgs.length === 1) {
            value = imgs[0].src;
          } else {
            value = imgs.map((img) => img.src);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else if (val.tagName === 'UL') {
            // Convert each li in the ul to a button
            Array.from(val.children).forEach((li) => {
              if (li.tagName === 'LI') {
                const button = document.createElement('button');
                button.className = 'tabs-tab';
                button.innerText = li.innerText;
                button.setAttribute('role', 'tab');
                button.type = 'button';
                colEl.appendChild(button);
              }
            });
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

function buildTabs(main) {
  const tabs = [...main.querySelectorAll(':scope > div')]
    .map((section) => {
      const sectionMeta = section.querySelector('div.section-metadata');
      if (sectionMeta) {
        const meta = readBlockConfig(sectionMeta);
        if (meta.tabtitle) {
          return [section, meta.tabtitle];
        }
      }
      return null;
    })
    .filter((el) => !!el);
  if (tabs.length) {
    const section = document.createElement('div');
    section.className = 'section';
    const ul = document.createElement('ul');
    ul.append(...tabs
      .map(([, tab]) => {
        const li = document.createElement('li');
        li.innerText = tab;
        return li;
      }));
    const tabsBlock = buildBlock('tabs', [[ul]]);
    section.append(tabsBlock);
    tabs[0][0].insertAdjacentElement('beforebegin', section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // TODO: add auto block, if needed
    buildTabs(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateImageIcons(main);
  autoOpenLinksInNewTab(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    document.body.classList.add('breadcrumbs-enabled');
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
