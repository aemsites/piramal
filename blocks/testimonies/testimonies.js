const setupPositions = (children, selectedIndex) => {
  let counter = 0;
  children.forEach((child, index) => {
    child.className = child.className.replace(/pos-\d+/, '');
    if (index != selectedIndex) {
      child.classList.add(`pos-${counter}`);
      console.log(`pos-${counter}`);
      counter++;
    }
  });
};

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
  setupPositions(children, selectedIndex);
  setInterval(() => {
    children[selectedIndex].classList.remove('selected');
    children[selectedIndex].classList.add('unselected');

    selectedIndex = (selectedIndex + 1) % children.length;

    setupPositions(children, selectedIndex);

    children[selectedIndex].classList.remove('unselected');
    children[selectedIndex].classList.add('selected');
  }, 12000);
}
