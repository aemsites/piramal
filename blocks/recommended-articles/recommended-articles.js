/**
 *
 * @param {Element} div
 * @param {Element} head
 */

const addControls = (div, head, block) => {
  block.selectedArticle = 0;
  const prev = document.createElement('button');
  const next = document.createElement('button');
  prev.disabled = true;

  const selectedArticleIndex = () => {
    const articles = div.querySelectorAll('.article');
    let closestIndex = 0;
    let closestDistance = Infinity;

    articles.forEach((article, index) => {
      const distance = Math.abs(article.offsetLeft - div.offsetLeft - div.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    block.selectedArticle = closestIndex;
    prev.disabled = div.scrollLeft === 0;
    next.disabled = div.scrollLeft + div.clientWidth + 1 > div.scrollWidth;
  };
  const markupMobileIndicators = () => {
    const mobileIndicators = block.querySelector('.mobile-indicators');
    const indicators = mobileIndicators.querySelectorAll('.mobile-indicator');
    indicators.forEach((indicator) => {
      indicator.classList.remove('active');
    });
    indicators[block.selectedArticle].classList.add('active');
  };
  div.addEventListener('scroll', () => {
    selectedArticleIndex();
    markupMobileIndicators();
  });

  // in head add another div with class controls
  const leftChevron = document.createElement('img');
  leftChevron.src = `${window.hlx.codeBasePath}/icons/chevron-left.svg`;
  leftChevron.alt = 'previous article';
  const rightChevron = document.createElement('img');
  rightChevron.src = `${window.hlx.codeBasePath}/icons/chevron-left.svg`;
  rightChevron.alt = 'next article';
  // rotate right chevron
  rightChevron.style.transform = 'rotate(180deg)';

  const controls = document.createElement('div');
  // create 2 buttons elems
  prev.append(leftChevron);
  prev.classList.add('control', 'prev');

  next.append(rightChevron);
  next.classList.add('control', 'next');

  controls.append(prev, next);

  prev.addEventListener('click', () => {
    // scroll to the selectedArticle - 1
    const articles = div.querySelectorAll('.article');
    const prevArticle = articles[block.selectedArticle - 1] || articles[0];
    if (prevArticle) {
      block.selectedArticle = Math.max(block.selectedArticle - 1, 0);
      div.scrollTo({
        left: block.selectedArticle === 0 ? 0 : prevArticle.offsetLeft - div.offsetLeft,
        behavior: 'smooth',
      });
    }
    selectedArticleIndex();
  });

  next.addEventListener('click', () => {
    // scroll to the selectedArticle + 1
    const articles = div.querySelectorAll('.article');
    const nextArticle = articles[block.selectedArticle + 1];
    if (nextArticle) {
      div.scrollTo({
        left: nextArticle.offsetLeft - div.offsetLeft,
        behavior: 'smooth',
      });
      block.selectedArticle += 1;
    }
    selectedArticleIndex();
  });

  controls.classList.add('controls');

  head.append(controls);
};

const addMobileConrols = (div) => {
  const mobileIndicators = document.createElement('div');
  mobileIndicators.classList.add('mobile-indicators');
  const articles = div.querySelectorAll('.article');
  articles.forEach((art, index) => {
    if (index === articles.length) return;
    const indicator = document.createElement('button');
    indicator.classList.add('mobile-indicator');
    mobileIndicators.append(indicator);
    if (index === 0) indicator.classList.add('active');
  });
  div.append(mobileIndicators);
};

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const [...children] = block.querySelectorAll(':scope > div');
  const head = document.createElement('div');

  block.prepend(head);

  children.forEach((child) => {
    child.classList.add('article');
    const [content, date, minsToRead] = child.querySelectorAll(':scope > *');
    const [img, description, link] = content.querySelectorAll(':scope > *');

    content.classList.add('art-content');

    date.classList.add('art-date');
    minsToRead.classList.add('art-mins-to-read');
    img?.classList?.add('art-img');
    description?.classList?.add('art-description');

    // add a 'Read me text after art-description'

    const url = link?.textContent;
    link.style.display = 'none';

    const readMe = document.createElement('a');
    readMe.classList.add('art-read-me');
    readMe.textContent = 'Read more';
    readMe.href = url;
    readMe.target = '_blank';
    description.innerHTML += readMe.outerHTML;

    content.outerHTML += '<br>';
    // format date as 18 Nov 2021
    date.textContent = new Date(date.textContent).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });

  const div = document.createElement('div');

  div.classList.add('article-container');
  addControls(div, head, block);
  head.classList.add('art-head');

  div.append(...children);

  block.append(div);
  block.prepend(head);
  addMobileConrols(block);
}
