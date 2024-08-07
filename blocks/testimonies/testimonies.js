/**
 * 
 * @param {Element} block
 */
export const setupPositions = (block) => {
  const children = [...block.querySelectorAll('.testimony')];
  const { selectedIndex } = block.dataset;
  let counter = 0;
  children.forEach((child, index) => {
    child.className = child.className.replace(/pos-\d+/, '');
    if (index !== parseInt(selectedIndex, 10)) {
      child.classList.add(`pos-${counter}`);
      counter += 1;
    }
  });
};

export const showTestimony = (block, index) => {
  const children = [...block.querySelectorAll('.testimony')];
  const actualIndex = typeof index === 'string' ? parseInt(index,10) : index;
  children.forEach((child, i) => {
    if (i === actualIndex) {
      child.classList.remove('unselected');
      child.classList.add('selected');
    } else {
      child.classList.remove('selected');
      child.classList.add('unselected');
    }
  });
  block.dataset.selectedIndex = typeof index === 'string' ? index : index.toString();
  setupPositions(block);
};

const cycleTestimonies = (children, block) => {
  let selectedIndex = parseInt(block.dataset.selectedIndex, 10);
  children[selectedIndex].classList.remove('selected');
  children[selectedIndex].classList.add('unselected');

  selectedIndex = (selectedIndex + 1) % children.length;
  block.dataset.selectedIndex = selectedIndex.toString();

  children[selectedIndex].classList.remove('unselected');
  children[selectedIndex].classList.add('selected');
};

/**
 *
 * @param {Element} block
 */
export const startScroll = (block) => {
  const children = [...block.querySelectorAll('.testimony')];
  block.dataset.testimoniesInterval = setInterval(() => {
    cycleTestimonies(children, block);
    showTestimony(block, parseInt(block.dataset.selectedIndex, 10));
  }, 12000);
};

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const children = [...block.children];
  block.dataset.selectedIndex = '0';
  children.forEach((child, index) => {
    const [img, content] = child.querySelectorAll(':scope > div');
    child.classList.add('testimony', index === 0 ? 'selected' : 'unselected');
    img.classList.add('testimony-img');
    content.classList.add('testimony-content');

    child.dataset.index = index;

    const [desc, name, title] = content.querySelectorAll(':scope p');
    desc?.classList?.add('testimony-desc');
    name?.classList?.add('testimony-name');
    title?.classList?.add('testimony-title');

    const confetti = [
      document.createElement('img'),
      document.createElement('img'),
      document.createElement('img'),
      document.createElement('img'),
    ].map((conf, i) => {
      conf.classList.add(`confetti-${i + 1}`, 'confetti');
      conf.src = `${window.hlx.codeBasePath}/icons/confetti-${i + 1}.svg`;
      conf.alt = 'confetti icon';
      return conf;
    });

    const animationCircles = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ].map((circle, i) => {
      circle.classList.add(`animation-circle-${i}`, 'animation-circle');
      return circle;
    });

    img.append(...animationCircles, ...confetti);
  });
  setupPositions(block);
  startScroll(block);
}
