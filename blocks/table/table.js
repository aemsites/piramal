/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation, replacePlaceholders } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  await replacePlaceholders(block);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0) thead.append(tr);
    else tbody.append(tr);
  });
  if (block.classList.contains('kyc-docs')) {
    thead.querySelectorAll('th').forEach((th, i) => {
      const icon = tbody.querySelector(`td:nth-child(${i + 1}) .icon`);
      if (icon) th.classList.add('col-text-center');
    });
  }
  table.append(thead);
  table.append(tbody);
  block.replaceChildren(table);
}
