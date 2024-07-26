/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const [bg, content, mobileCTA] = block.querySelectorAll(':scope > div');
  content?.classList?.add('content');
  bg?.classList?.add('bg');
  mobileCTA?.classList?.add('mobile-cta');
}
