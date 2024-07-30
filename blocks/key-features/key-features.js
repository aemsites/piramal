import { replacePlaceholders } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  await replacePlaceholders(block);
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
    desc.classList.add('feature-desc');
  });
  const redirect = block.parentElement?.nextElementSibling;
  if (redirect) {
    const p = redirect.querySelector(':scope p');
    p.outerHTML = p.outerHTML.replace(
      'Click here',
      `<a class='cm-redirect' href="${'/placeholder'}">Click here</a>`,
    );
  }
}
