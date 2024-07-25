import { moveInstrumentation } from "../../scripts/scripts.js";

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function decorateDescription(description, slide) {
  description.classList.add('carousel-slide-description');
  if (slide.classList.contains('features-slide')) {
    const features = document.createElement('div');
    features.classList.add('features');
    const paras = description.querySelectorAll('p');
    let index = 0;
    while (index < paras.length) {
      const feature = document.createElement('div');
      feature.classList.add('feature');
      if (paras[index].querySelector('picture')) {
        feature.append(paras[index]);
        index++;
      }
      if (!paras[index].querySelector('picture')) {
        feature.append(paras[index]);
        index++;
      }
      features.append(feature);
    }
    description.append(features);
  }
  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('buttons-container');
  const buttons = description.querySelectorAll('p.button-container');
  buttonsContainer.append(buttons[0]);
  const linkText = description.querySelector('p:not(:has(*))');
  if (buttons.length > 1) {
    if (linkText) {
      const linkContainer = document.createElement('div');
      linkContainer.classList.add('link-container');
      linkContainer.append(linkText);
      buttons[1].classList.remove('button-container');
      linkContainer.append(buttons[1]);
      buttonsContainer.append(linkContainer);
    } else {
      buttonsContainer.append(buttons[1]);
    }
  }
  description.append(buttonsContainer);
  return description;
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  moveInstrumentation(row, slide);
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  const slideContent = document.createElement('div');
  slideContent.classList.add('carousel-slide-content');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    switch (colIdx) {
      case 0:
        const classes = column.querySelector('p');
        if (classes) {
          classes.innerHTML.split(',').forEach((text) => {
            slide.classList.add(text.trim());
          });
        }
        break;
      case 1:
        decorateDescription(column, slide);
        slideContent.append(column);
        break;
      case 2:
        column.classList.add('carousel-slide-image');
        slideContent.append(column);
        break;
    }
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  slide.append(slideContent);
  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    container.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    if (idx === 0) {
      // TODO - Set auto-scroll for Carousel
      row.remove();
      return;
    }

    const slide = createSlide(row, idx - 1, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx - 1;
      indicator.innerHTML = `<button type="button"><span>Show Slide ${idx - 1} of ${rows.length - 1}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}