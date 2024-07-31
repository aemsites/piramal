/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  block.querySelectorAll(':scope > div').forEach((section) => {
    const [type, summary, details] = section.querySelectorAll(':scope > *');
    type?.classList?.add('req-type');
    summary?.classList?.add('req-summary');
    details?.classList?.add('req-details');
    if (summary?.textContent?.length > 0) section.classList.add('req-section');
    section.setAttribute('data-show', 'expanded');
    section.setAttribute('data-show', 'closed');

    section.addEventListener('click', () => {
      const show = section.getAttribute('data-show');
      section.setAttribute('data-show', show === 'expanded' ? 'closed' : 'expanded');
    });

    if (summary) {
      const [img, title, subtitle] = summary.querySelectorAll(':scope > *');
      img?.classList?.add('req-img');

      const textContent = document.createElement('div');
      textContent.classList.add('req-text-content');

      if (title) textContent.append(title);
      if (subtitle) textContent.append(subtitle);

      title?.classList?.add('req-title');
      subtitle?.classList?.add('req-subtitle');

      summary.append(textContent);
    }
    if (details && details.textContent.length > 0) {
      const chevron = document.createElement('img');
      chevron.classList.add('req-chevron');
      chevron.src = `${window.hlx.codeBasePath}/icons/down-chevron.svg`;
      summary.append(chevron);
    }
  });
}
