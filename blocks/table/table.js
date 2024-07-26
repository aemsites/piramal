/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  const [header, ...rows] = [...block.children];

  if (header.textContent.trim()) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    header.querySelectorAll('p').forEach((p) => {
      const th = document.createElement('th');
      th.setAttribute('scope', 'col');
      moveInstrumentation(p, th);
      th.innerHTML = p.innerHTML;
      tr.append(th);
    });
    thead.append(tr);
    table.append(thead);
  }

  [...rows].forEach((child) => {
    const row = document.createElement('tr');
    moveInstrumentation(child, row);
    [...child.children].forEach((col) => {
      const cell = document.createElement('td');
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
    tbody.append(row);
  });

  table.append(tbody);
  block.replaceChildren(table);
}
