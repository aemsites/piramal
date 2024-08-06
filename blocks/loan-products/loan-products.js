import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * @param {Element} block
 */
const decorateKeyFeatureCtr = (block) => {
  const children = [...block.children];
  const newChildren = [];
  children.forEach((child, index) => {
    if (index % 3 === 0) newChildren.push(document.createElement('div'));
    newChildren[newChildren.length - 1].append(child);
    newChildren[newChildren.length - 1].classList.add('key-features-row');
  });
  newChildren.forEach((child) => {
    const [, title, desc] = child.querySelectorAll(':scope > *');
    const content = document.createElement('div');
    content.append(title, desc);
    content.classList.add('key-features-content');
    child.append(content);
  });
  block.replaceChildren(...newChildren);
};

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const cards = block.querySelectorAll(':scope > div');
  const hasKeyFeatures = block.classList.contains('key-features');

  block.ariaHidden = 'true';

  cards.forEach((card) => {
    card.classList.add('product-card');
    // eslint-disable-next-line operator-linebreak
    const [loanType, content, keyFeaturesTitle, keyFeaturesCtr] =
      card.querySelectorAll(':scope > div');
    const [img, title, description, url] = content.querySelectorAll(':scope > *');
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

    if (keyFeaturesTitle) {
      keyFeaturesTitle.classList.add('key-features-title');
      keyFeaturesCtr.classList.add('key-features-container');
    }

    if (hasKeyFeatures) {
      decorateKeyFeatureCtr(keyFeaturesCtr);
      keyFeaturesCtr.ariaHidden = 'true';
      const keyFeaturesVisibility = () => {
        const kfContainers = block.querySelectorAll('.key-features-container');
        const visibility = keyFeaturesCtr.ariaHidden === 'true';
        kfContainers.forEach((kf) => {
          kf.ariaHidden = !visibility ? 'true' : 'false';
        });
      };
      keyFeaturesTitle.addEventListener('click', keyFeaturesVisibility);
      keyFeaturesCtr.addEventListener('click', keyFeaturesVisibility);
    }
  });
}
