/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  console.log(block);
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
  head.classList.add('art-head');
  div.append(...children);
  block.append(div);
  block.prepend(head);

  console.log(block);
}
