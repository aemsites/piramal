/**
 *
 * @param {Element} div
 * @param {Element} head
 */

const addControls = (div, head) => {
  let selectedArticle = 0;
  const prev = document.createElement('button');
  const next = document.createElement('button');
  prev.disabled = true;
  const selectedArticleIndex = () => {
    const articles = div.querySelectorAll('.article');
    let closestIndex = 0;
    let closestDistance = Infinity;

    articles.forEach((article, index) => {
      const distance = Math.abs(
        article.offsetLeft - div.offsetLeft - div.scrollLeft,
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    selectedArticle = closestIndex;
    prev.disabled = selectedArticle === 0;
    next.disabled = div.scrollLeft + div.clientWidth === div.scrollWidth;
  };
  div.addEventListener('scroll', () => {
    selectedArticleIndex();
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
    const prevArticle = articles[selectedArticle - 1] || articles[0];
    if (prevArticle) {
      selectedArticle = Math.max(selectedArticle - 1, 0);
      div.scrollTo({
        left: prevArticle.offsetLeft - div.offsetLeft,
        behavior: 'smooth',
      });
    }
    selectedArticleIndex();
  });

  next.addEventListener('click', () => {
    // scroll to the selectedArticle + 1
    const articles = div.querySelectorAll('.article');
    const nextArticle = articles[selectedArticle + 1];
    if (nextArticle) {
      div.scrollTo({
        left: nextArticle.offsetLeft - div.offsetLeft,
        behavior: 'smooth',
      });
      selectedArticle += 1;
    }
    selectedArticleIndex();
  });

  controls.classList.add('controls');

  head.append(controls);
};

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const [head, ...children] = block.querySelectorAll(':scope > div');

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
  addControls(div, head);

  head.classList.add('art-head');

  head.firstElementChild.append(...block.parentElement.previousSibling.children);

  div.append(...children);

  block.append(div);
  block.prepend(head);
}
