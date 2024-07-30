import { replacePlaceholders } from '../../scripts/scripts.js';

export default async function decorate(block) {
  await replacePlaceholders(block);
}
