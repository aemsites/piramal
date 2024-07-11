/**
 * Block entry point.
 */
export default function decorate(block) {
  // get the rows
  // first row contains the autoscroll flag
  const [autoscroll, slides] = [...block.children]
  // keep the flag as boolean
  const autoscrollflag = autoscroll.children[0].innerText  === 'true';
  autoscroll.remove();
  console.log(autoscrollflag);
  console.log(slides);

  // loop through the slides
  [slides].forEach((slide,idx) => {
    const [classes,image,description] = [...slide.children];

    //extract the classes list
    const classesText = classes.textContent.trim();
    const slideClasses = (classesText ? classesText.split(',') : []).map((c) => c && c.trim()).filter((c) => !!c);
    slideClasses.forEach((c) => slide.classList.add(c.trim()));
    classes.remove();

    ///...
  });
}