import { replacePlaceholders } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const facts = block.querySelectorAll(':scope > div');
  facts.forEach((fact) => {
    fact.firstElementChild.classList.add('feature');
    const [img, title, desc] = fact.querySelectorAll(':scope > div > *');
    img.classList.add('feature-img');

    const text = document.createElement('div');
    text.classList.add('feature-text');
    text.append(title, desc);
    fact.firstElementChild.append(text);

    title.classList.add('feature-title');
  });
  await replacePlaceholders(block);
}
