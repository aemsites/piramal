import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const children = [...block.children];
  children.forEach((card) => {
    let img;
    let title;
    let url;
    if (block.classList.contains('image-cards')) {
      const [bg, content] = [...card.children];
      content.classList.add('content');
      [title, url] = [...content.children];
      bg.classList.add('card-img');
      card.addEventListener('click', () => {
        window.location.href = url.children[0].href;
      });
      // icon cards or default behavior
    } else {
      [img, title, url] = card.querySelectorAll(':scope > div > *');
      img.classList.add('card-img');
      // remove instrumentation for card url
      moveInstrumentation(url.firstChild);
    }
    card.classList.add('card');

    title.classList.add('title');
    url.classList.add('url');
  });
}
