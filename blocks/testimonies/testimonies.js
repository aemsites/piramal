/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const children = [...block.children];
  let selectedIndex = 0;
  children.forEach((child, index) => {
    const [img, content] = child.querySelectorAll(':scope > div');
    console.log(img, content);
    child.classList.add('testimony', index === 0 ? 'selected' : 'unselected');
    img.classList.add('testimony-img');
    content.classList.add('testimony-content');

    const [desc, name, title] = content.querySelectorAll(':scope > *');
    desc.classList.add('testimony-desc');
    name.classList.add('testimony-name');
    title.classList.add('testimony-title');

    const animationCircles = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ].map((circle, i) => {
      circle.classList.add(`animation-circle-${i}`, `animation-circle`);
      return circle;
    });

    img.append(...animationCircles);
  });

  setInterval(() => {
    children[selectedIndex].classList.remove('selected');
    children[selectedIndex].classList.add('unselected');
    // children[selectedIndex]
    //   .getAnimations({ subtree: true })
    //   .forEach((anim) => anim.cancel());
    selectedIndex = (selectedIndex + 1) % children.length;
    children[selectedIndex].classList.remove('unselected');
    children[selectedIndex].classList.add('selected');
    // children[selectedIndex]
    //   .getAnimations({ subtree: true })
    //   .forEach((anim) => anim.play());
  }, 12000);
}
