// Simple toggle script for mobile navigation
const menuToggleBtn = document.getElementById('menuToggleBtn');
const navMenu = document.getElementById('navMenu');

if (menuToggleBtn && navMenu) {
  menuToggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggleBtn.classList.toggle('open');
  });
}

// Hero Slider Controller
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');

if (slides.length > 0) {
  let currentSlide = 0;
  let sliderInterval;
  const slideDelay = 8000; // 8 seconds auto-play

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function resetAutoplay() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, slideDelay);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      showSlide(index);
      resetAutoplay();
    });
  });

  resetAutoplay();
}

// Progressives Rx Products Slider Controller
const productTrack = document.getElementById('productTrack');
const prodPrevBtn = document.getElementById('prodPrevBtn');
const prodNextBtn = document.getElementById('prodNextBtn');

if (productTrack && prodPrevBtn && prodNextBtn) {
  let prodIndex = 0;
  const totalCards = document.querySelectorAll('.product-card').length;

  function updateProductSlider() {
    const firstCard = document.querySelector('.product-card');
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(productTrack);
    const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 24;

    const translateDistance = prodIndex * (cardWidth + gapVal);
    productTrack.style.transform = `translateX(-${translateDistance}px)`;

    const containerWidth = productTrack.parentElement.getBoundingClientRect().width;
    const visibleCards = Math.round(containerWidth / (cardWidth + gapVal)) || 1;
    const maxIndex = totalCards - visibleCards;

    if (prodIndex <= 0) {
      prodPrevBtn.style.display = 'none';
    } else {
      prodPrevBtn.style.display = 'flex';
    }

    if (prodIndex >= maxIndex) {
      prodNextBtn.style.display = 'none';
    } else {
      prodNextBtn.style.display = 'flex';
    }
  }

  prodNextBtn.addEventListener('click', () => {
    const firstCard = document.querySelector('.product-card');
    if (!firstCard) return;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(productTrack);
    const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 24;
    const containerWidth = productTrack.parentElement.getBoundingClientRect().width;
    const visibleCards = Math.round(containerWidth / (cardWidth + gapVal)) || 1;
    const maxIndex = totalCards - visibleCards;

    if (prodIndex < maxIndex) {
      prodIndex++;
      updateProductSlider();
    }
  });

  prodPrevBtn.addEventListener('click', () => {
    if (prodIndex > 0) {
      prodIndex--;
      updateProductSlider();
    }
  });

  window.addEventListener('resize', () => {
    const firstCard = document.querySelector('.product-card');
    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const computedStyle = window.getComputedStyle(productTrack);
      const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 24;
      const containerWidth = productTrack.parentElement.getBoundingClientRect().width;
      const visibleCards = Math.round(containerWidth / (cardWidth + gapVal)) || 1;
      const maxIndex = totalCards - visibleCards;
      if (prodIndex > maxIndex) {
        prodIndex = Math.max(0, maxIndex);
      }
    }
    updateProductSlider();
  });

  setTimeout(updateProductSlider, 200);
}

// Color Swatch Interactive Active State
const swatchDots = document.querySelectorAll('.swatch-dot');
swatchDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    const siblings = e.target.parentElement.querySelectorAll('.swatch-dot');
    siblings.forEach(s => {
      s.classList.remove('active');
      s.style.borderColor = 'transparent';
      if (s.getAttribute('data-color') === 'clear') {
        s.style.borderColor = '#dcdcdc';
      }
    });

    e.target.classList.add('active');
    e.target.style.borderColor = e.target.style.backgroundColor || '#111';
    if (e.target.getAttribute('data-color') === 'tortoise' || e.target.getAttribute('data-color') === 'tort-teal' || e.target.getAttribute('data-color') === 'tort-blue') {
      e.target.style.borderColor = '#111';
    }
  });
});

// New Arrivals Slider Controller
const naProductTrack = document.getElementById('naProductTrack');
const naPrevBtn = document.getElementById('naPrevBtn');
const naNextBtn = document.getElementById('naNextBtn');

if (naProductTrack && naPrevBtn && naNextBtn) {
  let naIndex = 0;
  const naCards = naProductTrack.querySelectorAll('.na-product-card');
  const naTotalCards = naCards.length;

  function updateNaSlider() {
    const firstCard = naCards[0];
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(naProductTrack);
    const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 20;
    const translateDistance = naIndex * (cardWidth + gapVal);
    naProductTrack.style.transform = `translateX(-${translateDistance}px)`;

    const containerWidth = naProductTrack.parentElement.getBoundingClientRect().width;
    const visibleCards = Math.max(1, Math.round(containerWidth / (cardWidth + gapVal)));
    const maxIndex = Math.max(0, naTotalCards - visibleCards);

    naPrevBtn.disabled = naIndex <= 0;
    naNextBtn.disabled = naIndex >= maxIndex;
  }

  naNextBtn.addEventListener('click', () => {
    const firstCard = naCards[0];
    if (!firstCard) return;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(naProductTrack);
    const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 20;
    const containerWidth = naProductTrack.parentElement.getBoundingClientRect().width;
    const visibleCards = Math.max(1, Math.round(containerWidth / (cardWidth + gapVal)));
    const maxIndex = Math.max(0, naTotalCards - visibleCards);

    if (naIndex < maxIndex) {
      naIndex++;
      updateNaSlider();
    }
  });

  naPrevBtn.addEventListener('click', () => {
    if (naIndex > 0) {
      naIndex--;
      updateNaSlider();
    }
  });

  window.addEventListener('resize', () => {
    const firstCard = naCards[0];
    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const computedStyle = window.getComputedStyle(naProductTrack);
      const gapVal = parseFloat(computedStyle.columnGap || computedStyle.gap) || 20;
      const containerWidth = naProductTrack.parentElement.getBoundingClientRect().width;
      const visibleCards = Math.max(1, Math.round(containerWidth / (cardWidth + gapVal)));
      const maxIndex = Math.max(0, naTotalCards - visibleCards);
      if (naIndex > maxIndex) {
        naIndex = Math.max(0, maxIndex);
      }
    }
    updateNaSlider();
  });

  setTimeout(updateNaSlider, 200);
}

// New Arrivals Swatch Active State
const naSwatchDots = document.querySelectorAll('.na-swatch-dot');
naSwatchDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    const siblings = e.target.parentElement.querySelectorAll('.na-swatch-dot');
    siblings.forEach(s => s.classList.remove('active'));
    e.target.classList.add('active');
  });
});

// Categories mobile swipe — one card at a time + dots
const categoriesGrid = document.getElementById('categoriesGrid');
const categoriesDots = document.getElementById('categoriesDots');

if (categoriesGrid && categoriesDots) {
  const categoryCards = categoriesGrid.querySelectorAll('.category-card');

  categoryCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'categories-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to category ${index + 1}`);
    dot.addEventListener('click', () => {
      const card = categoryCards[index];
      if (!card) return;
      categoriesGrid.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    });
    categoriesDots.appendChild(dot);
  });

  const dots = categoriesDots.querySelectorAll('.categories-dot');

  function updateCategoryDots() {
    if (window.innerWidth > 576) return;
    const scrollLeft = categoriesGrid.scrollLeft;
    const cardWidth = categoryCards[0] ? categoryCards[0].offsetWidth : 1;
    const index = Math.round(scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  categoriesGrid.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateCategoryDots);
  }, { passive: true });

  window.addEventListener('resize', updateCategoryDots);
}

// Shapes mobile swipe — one card at a time + dots
const shapesGrid = document.getElementById('shapesGrid');
const shapesDots = document.getElementById('shapesDots');

if (shapesGrid && shapesDots) {
  const shapeCards = shapesGrid.querySelectorAll('.shape-card');

  shapeCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'shapes-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to shape ${index + 1}`);
    dot.addEventListener('click', () => {
      const card = shapeCards[index];
      if (!card) return;
      shapesGrid.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    });
    shapesDots.appendChild(dot);
  });

  const dots = shapesDots.querySelectorAll('.shapes-dot');

  function updateShapeDots() {
    if (window.innerWidth > 576) return;
    const scrollLeft = shapesGrid.scrollLeft;
    const cardWidth = shapeCards[0] ? shapeCards[0].offsetWidth : 1;
    const index = Math.round(scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  shapesGrid.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateShapeDots);
  }, { passive: true });

  window.addEventListener('resize', updateShapeDots);
}

// Services mobile swipe — one card at a time + dots
const servicesGrid = document.getElementById('servicesGrid');
const servicesDots = document.getElementById('servicesDots');

if (servicesGrid && servicesDots) {
  const serviceCards = servicesGrid.querySelectorAll('.service-card');

  serviceCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'services-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to service ${index + 1}`);
    dot.addEventListener('click', () => {
      const card = serviceCards[index];
      if (!card) return;
      servicesGrid.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    });
    servicesDots.appendChild(dot);
  });

  const dots = servicesDots.querySelectorAll('.services-dot');

  function updateServiceDots() {
    if (window.innerWidth > 576) return;
    const scrollLeft = servicesGrid.scrollLeft;
    const cardWidth = serviceCards[0] ? serviceCards[0].offsetWidth : 1;
    const index = Math.round(scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  servicesGrid.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateServiceDots);
  }, { passive: true });

  window.addEventListener('resize', updateServiceDots);
}

// Vision promo mobile swipe — one card at a time + dots
const visionPromoGrid = document.getElementById('visionPromoGrid');
const visionPromoDots = document.getElementById('visionPromoDots');

if (visionPromoGrid && visionPromoDots) {
  const visionPromoCards = visionPromoGrid.querySelectorAll('.vision-promo-card');

  visionPromoCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'vision-promo-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to promo ${index + 1}`);
    dot.addEventListener('click', () => {
      const card = visionPromoCards[index];
      if (!card) return;
      visionPromoGrid.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    });
    visionPromoDots.appendChild(dot);
  });

  const dots = visionPromoDots.querySelectorAll('.vision-promo-dot');

  function updateVisionPromoDots() {
    if (window.innerWidth > 576) return;
    const scrollLeft = visionPromoGrid.scrollLeft;
    const cardWidth = visionPromoCards[0] ? visionPromoCards[0].offsetWidth : 1;
    const index = Math.round(scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  visionPromoGrid.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateVisionPromoDots);
  }, { passive: true });

  window.addEventListener('resize', updateVisionPromoDots);
}

// Keep nested card actions from navigating to the product page
document.querySelectorAll('.product-card .wishlist-btn, .product-card .try-on-btn, .na-product-card .na-wishlist-btn, .na-product-card .na-try-on-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

