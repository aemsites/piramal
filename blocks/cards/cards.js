/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  if (!block.classList.contains('variation-1')) {
    const children = [...block.children];
    children.forEach((card) => {
      const [img, title, url] = card.querySelectorAll(':scope > div > *');

      card.classList.add('card');

      img.classList.add('card-img');
      title.classList.add('title');
      url.classList.add('url');
    });
  }
}
