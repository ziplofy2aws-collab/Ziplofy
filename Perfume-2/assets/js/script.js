(function () {
  var menuToggle = document.querySelector('.pf2-header__menu-toggle');
  var mobileNav = document.querySelector('.pf2-header__mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('.pf2-hero__slider');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.pf2-hero__slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.pf2-hero__dot'));
  var prevBtn = document.querySelector('.pf2-hero__arrow--prev');
  var nextBtn = document.querySelector('.pf2-hero__arrow--next');
  var heroSection = document.querySelector('.pf2-hero');

  if (slider && slides.length > 0) {
    var activeSlide = Number(slider.dataset.currentSlide || 0);
    var autoplayDelay = 7000;
    var autoplayTimer = null;

    function goToSlide(index) {
      activeSlide = (index + slides.length) % slides.length;
      slider.dataset.currentSlide = String(activeSlide);

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeSlide);
      });

      document.dispatchEvent(new CustomEvent('pf2:hero-slide', {
        detail: { index: activeSlide }
      }));
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        goToSlide(activeSlide + 1);
      }, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayTimer !== null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function restartAutoplay() {
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(activeSlide - 1);
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(activeSlide + 1);
        restartAutoplay();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goToSlide(index);
        restartAutoplay();
      });
    });

    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopAutoplay);
      heroSection.addEventListener('mouseleave', startAutoplay);
      heroSection.addEventListener('focusin', stopAutoplay);
      heroSection.addEventListener('focusout', function (event) {
        if (!heroSection.contains(event.relatedTarget)) {
          startAutoplay();
        }
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    goToSlide(activeSlide);
    startAutoplay();
  }

  var finderCarousel = document.querySelector('.pf2-finder__carousel');
  var finderTrack = document.querySelector('.pf2-finder__track');
  var finderCards = Array.prototype.slice.call(document.querySelectorAll('.pf2-finder__card'));
  var finderPrev = document.querySelector('.pf2-finder__arrow--prev');
  var finderNext = document.querySelector('.pf2-finder__arrow--next');
  var finderViewport = document.querySelector('.pf2-finder__viewport');

  if (!finderCarousel || !finderTrack || finderCards.length === 0 || !finderViewport) {
    // skip finder carousel
  } else {

  var finderIndex = 0;
  var cardsPerView = 5;

  function getCardsPerView() {
    var width = window.innerWidth;

    if (width <= 640) {
      return 2;
    }

    if (width <= 900) {
      return 3;
    }

    if (width <= 1100) {
      return 4;
    }

    return 5;
  }

  function getMaxIndex() {
    return Math.max(0, finderCards.length - cardsPerView);
  }

  function updateFinderButtons() {
    if (finderPrev) {
      finderPrev.disabled = finderIndex <= 0;
    }

    if (finderNext) {
      finderNext.disabled = finderIndex >= getMaxIndex();
    }
  }

  function updateFinderPosition() {
    var firstCard = finderCards[0];
    if (!firstCard) {
      return;
    }

    var cardWidth = firstCard.getBoundingClientRect().width;
    var gap = parseFloat(window.getComputedStyle(finderTrack).gap) || 16;
    var offset = finderIndex * (cardWidth + gap);

    finderTrack.style.transform = 'translateX(-' + offset + 'px)';
    updateFinderButtons();
  }

  function goToFinderIndex(index) {
    cardsPerView = getCardsPerView();
    finderIndex = Math.max(0, Math.min(index, getMaxIndex()));
    updateFinderPosition();
  }

  if (finderPrev) {
    finderPrev.addEventListener('click', function () {
      goToFinderIndex(finderIndex - 1);
    });
  }

  if (finderNext) {
    finderNext.addEventListener('click', function () {
      goToFinderIndex(finderIndex + 1);
    });
  }

  window.addEventListener('resize', function () {
    goToFinderIndex(finderIndex);
  });

  goToFinderIndex(0);
  }

  var productMain = document.getElementById('pf2-product-main');
  var productThumbs = Array.prototype.slice.call(document.querySelectorAll('.pf2-product__thumb'));
  var qtyInput = document.querySelector('.pf2-product__qty-input');
  var qtyButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pf2-qty]'));
  var topBtn = document.querySelector('.pf2-product__top');
  var countdownEls = {
    days: document.querySelector('[data-pf2-countdown="days"]'),
    hours: document.querySelector('[data-pf2-countdown="hours"]'),
    minutes: document.querySelector('[data-pf2-countdown="minutes"]'),
    seconds: document.querySelector('[data-pf2-countdown="seconds"]')
  };

  productThumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var imageSrc = thumb.getAttribute('data-image');
      if (!imageSrc || !productMain) {
        return;
      }

      productMain.src = imageSrc;
      productThumbs.forEach(function (item) {
        item.classList.toggle('is-active', item === thumb);
      });
    });
  });

  qtyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!qtyInput) {
        return;
      }

      var current = parseInt(qtyInput.value, 10) || 1;
      var next = button.getAttribute('data-pf2-qty') === 'plus' ? current + 1 : current - 1;
      qtyInput.value = String(Math.max(1, next));
    });
  });

  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      topBtn.classList.toggle('is-visible', window.scrollY > 420);
    }, { passive: true });
  }

  if (countdownEls.days && countdownEls.hours && countdownEls.minutes && countdownEls.seconds) {
    var totalSeconds =
      (parseInt(countdownEls.days.textContent, 10) * 86400) +
      (parseInt(countdownEls.hours.textContent, 10) * 3600) +
      (parseInt(countdownEls.minutes.textContent, 10) * 60) +
      parseInt(countdownEls.seconds.textContent, 10);

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function renderCountdown() {
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      countdownEls.days.textContent = String(days);
      countdownEls.hours.textContent = pad(hours);
      countdownEls.minutes.textContent = pad(minutes);
      countdownEls.seconds.textContent = pad(seconds);
    }

    window.setInterval(function () {
      if (totalSeconds <= 0) {
        return;
      }

      totalSeconds -= 1;
      renderCountdown();
    }, 1000);
  }

  var testimonialsSlider = document.querySelector('.pf2-testimonials__slider');
  var testimonialsTrack = document.querySelector('.pf2-testimonials__track');
  var testimonialCards = Array.prototype.slice.call(document.querySelectorAll('.pf2-testimonials__card'));
  var testimonialDots = Array.prototype.slice.call(document.querySelectorAll('.pf2-testimonials__dot'));

  if (testimonialsSlider && testimonialsTrack && testimonialCards.length > 0) {
    var testimonialIndex = Number(testimonialsSlider.dataset.currentSlide || 0);

    function getTestimonialCardsPerView() {
      var width = window.innerWidth;
      if (width <= 640) {
        return 1;
      }
      if (width <= 900) {
        return 2;
      }
      return 3;
    }

    function getTestimonialMaxIndex() {
      return Math.max(0, testimonialCards.length - getTestimonialCardsPerView());
    }

    function goToTestimonial(index) {
      testimonialIndex = Math.max(0, Math.min(index, getTestimonialMaxIndex()));
      testimonialsSlider.dataset.currentSlide = String(testimonialIndex);

      var firstCard = testimonialCards[0];
      if (!firstCard) {
        return;
      }

      var cardWidth = firstCard.getBoundingClientRect().width;
      var gap = parseFloat(window.getComputedStyle(testimonialsTrack).gap) || 22;
      var offset = testimonialIndex * (cardWidth + gap);

      testimonialsTrack.style.transform = 'translateX(-' + offset + 'px)';

      testimonialDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === testimonialIndex);
        dot.hidden = dotIndex > getTestimonialMaxIndex();
      });
    }

    testimonialDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetIndex = Number(dot.getAttribute('data-slide-to') || 0);
        goToTestimonial(targetIndex);
      });
    });

    window.addEventListener('resize', function () {
      goToTestimonial(testimonialIndex);
    });

    goToTestimonial(testimonialIndex);
  }

  function initMobileProductCarousel(config) {
    var carousel = document.querySelector(config.carousel);
    if (!carousel) {
      return;
    }

    var track = carousel.querySelector(config.track);
    var viewport = carousel.querySelector(config.viewport);
    var cards = Array.prototype.slice.call(carousel.querySelectorAll(config.card));
    var prev = carousel.querySelector(config.prev);
    var next = carousel.querySelector(config.next);
    var mobileBreakpoint = 768;
    var index = 0;

    if (!track || !viewport || cards.length === 0) {
      return;
    }

    function isMobile() {
      return window.innerWidth <= mobileBreakpoint;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - 1);
    }

    function updateButtons() {
      if (prev) {
        prev.disabled = !isMobile() || index <= 0;
      }

      if (next) {
        next.disabled = !isMobile() || index >= getMaxIndex();
      }
    }

    function updatePosition() {
      if (!isMobile()) {
        track.style.transform = '';
        index = 0;
        updateButtons();
        return;
      }

      var slideWidth = viewport.getBoundingClientRect().width;
      var offset = index * slideWidth;

      track.style.transform = 'translateX(-' + offset + 'px)';
      updateButtons();
    }

    function goTo(targetIndex) {
      index = Math.max(0, Math.min(targetIndex, getMaxIndex()));
      updatePosition();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        goTo(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        goTo(index + 1);
      });
    }

    window.addEventListener('resize', function () {
      goTo(isMobile() ? Math.min(index, getMaxIndex()) : 0);
    });

    updatePosition();
  }

  initMobileProductCarousel({
    carousel: '.pf2-popular__carousel',
    track: '.pf2-popular__grid',
    viewport: '.pf2-popular__viewport',
    card: '.pf2-popular__card',
    prev: '.pf2-popular__arrow--prev',
    next: '.pf2-popular__arrow--next'
  });

  initMobileProductCarousel({
    carousel: '.pf2-arrivals__carousel',
    track: '.pf2-arrivals__grid',
    viewport: '.pf2-arrivals__viewport',
    card: '.pf2-arrivals__card',
    prev: '.pf2-arrivals__arrow--prev',
    next: '.pf2-arrivals__arrow--next'
  });

  initMobileProductCarousel({
    carousel: '.pf2-also-like__carousel',
    track: '.pf2-also-like__grid',
    viewport: '.pf2-also-like__viewport',
    card: '.pf2-also-like__card',
    prev: '.pf2-also-like__arrow--prev',
    next: '.pf2-also-like__arrow--next'
  });
})();
