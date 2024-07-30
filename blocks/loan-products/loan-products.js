import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
// eslint-disable-next-line no-unused-vars
const setupKeyFeatureListeners = (block) => {};

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const cards = block.querySelectorAll(':scope > div');
  const hasKeyFeatures = block.classList.contains('key-features');

  block.setAttribute('key-features-visibility', 'hidden');

  cards.forEach((card) => {
    card.classList.add('product-card');
    const [loanType, content, url, keyFeatures] = card.querySelectorAll(':scope > div');
    const [img, title, description] = content.querySelectorAll(':scope > *');
    const newTitle = document.createElement('a');

    newTitle.textContent = title.textContent;
    moveInstrumentation(title, newTitle);

    title.replaceWith(newTitle);

    img.classList.add('product-img');
    newTitle.classList.add('product-title');

    description.classList.add('product-description');
    loanType.classList.add('loan-type');
    content.classList.add('content');
    url.classList.add('url');

    const articleRedirect = document.createElement('img');
    articleRedirect.src = `${window.hlx.codeBasePath}/images/moreProductsArrow.webp`;
    articleRedirect.alt = 'view more products arrow';
    articleRedirect.classList.add('article-redirect');
    img.append(articleRedirect);

    const link = document.createElement('a');
    link.href = url.textContent;
    newTitle.href = url.textContent;
    link.classList.add('product-link');

    content.append(link);

    if (keyFeatures) {
      keyFeatures.classList.add('key-features-container');
    }

    // if (hasKeyFeatures) {
    //   //insert another div before keyFeatures
    //   const keyFeaturesDropdown = document.createElement('details');
    //   keyFeaturesDropdown.classList.add('key-features-dropdown');
    //   keyFeaturesDropdown.innerHTML = `
    //     <summary>
    //       <span>Key Features</span>
    //       <span> + </span>
    //     </summary>
    //     `;
    //   card.insertBefore(keyFeaturesDropdown, keyFeatures);
    //   keyFeaturesDropdown.append(...keyFeatures.children);
    // }
  });
  if (hasKeyFeatures) setupKeyFeatureListeners(block);
}
