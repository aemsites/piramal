import { moveInstrumentation } from '../../scripts/scripts.js';

function getNextSlideIndex(block) {
  const currentIndex = parseInt(block.dataset.activeSlide, 10);
  const totalSlides = block.querySelectorAll('.carousel-slide').length;
  return (currentIndex + 1) % totalSlides;
}

function updateActiveSlide(slide) {
  const block = slide.closest('.hero-carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('active');
    } else {
      indicator.querySelector('button').setAttribute('active', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  if (slides.length > 1) {
    block.querySelector('.carousel-slides').scrollTo({
      top: 0,
      left: activeSlide.offsetLeft,
      behavior: 'instant',
    });
  }
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
    const paras = description.querySelectorAll('p:not(.button-container)');
    let index = 0;
    while (index < paras.length) {
      const feature = document.createElement('div');
      feature.classList.add('feature');
      if (paras[index].querySelector('picture')) {
        feature.append(paras[index]);
        index += 1;
      }
      if (!paras[index].querySelector('picture')) {
        feature.append(paras[index]);
        index += 1;
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

function createSlide(row, slideIndex) {
  const slide = document.createElement('li');
  moveInstrumentation(row, slide);
  slide.dataset.slideIndex = slideIndex;
  slide.classList.add('carousel-slide');

  const slideBackground = document.createElement('div');
  slideBackground.classList.add('carousel-slide-background');

  const slideContent = document.createElement('div');
  slideContent.classList.add('carousel-slide-content');
  slideBackground.append(slideContent);

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    switch (colIdx) {
      case 0:
        if (column.querySelector('p')) {
          column.querySelector('p').innerHTML.split(',').forEach((text) => {
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
      default:
    }
  });

  slide.append(slideBackground);
  return slide;
}

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

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
      // TODO - Control auto-scroll basis parameter if needed
      row.remove();
      return;
    }

    const slide = createSlide(row, idx - 1);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx - 1;
      if (slide.classList.contains('font-white')) {
        indicator.classList.add('font-white');
      }
      if (idx === 1) {
        indicator.innerHTML = '<button type="button" active="true"></button>';
      } else {
        indicator.innerHTML = '<button type="button"></button>';
      }
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.prepend(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  setInterval(() => showSlide(block, getNextSlideIndex(block)), 5000);
}
