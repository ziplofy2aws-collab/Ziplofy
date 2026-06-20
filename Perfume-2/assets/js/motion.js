(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'power2.out';
  var MAGNETIC_SELECTOR = '.pf2-btn--magnetic, .pf2-hero__cta, .pf2-pdp__cart, .pf2-pdp__delivery-btn, .pf2-product__btn, .pf2-footer__newsletter button';
  var lenisInstance = null;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function hasGsap() {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  }

  function initLenis() {
    if (reducedMotion || typeof Lenis === 'undefined') {
      return null;
    }

    var lenis = new Lenis({
      duration: 1.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
      infinite: false
    });

    if (hasGsap()) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop: function (value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect: function () {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed'
      });

      ScrollTrigger.addEventListener('refresh', function () {
        if (lenis.resize) {
          lenis.resize();
        }
      });

      lenis.on('scroll', ScrollTrigger.update);
    }

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add('pf2-motion-active');
    lenisInstance = lenis;
    return lenis;
  }

  function initNavbarGlass() {
    var header = document.querySelector('.pf2-header');
    if (!header) {
      return;
    }

    var threshold = 24;

    function updateHeader() {
      var scrollY = lenisInstance ? lenisInstance.scroll : window.scrollY;
      header.classList.toggle('is-scrolled', scrollY > threshold);
    }

    if (lenisInstance) {
      lenisInstance.on('scroll', updateHeader);
    } else {
      window.addEventListener('scroll', updateHeader, { passive: true });
    }

    updateHeader();
  }

  function animateHeroSlideImage(slide) {
    if (!hasGsap() || reducedMotion || !slide) {
      return;
    }

    var img = slide.querySelector('img');
    if (!img) {
      return;
    }

    gsap.fromTo(
      img,
      { scale: 1.05 },
      {
        scale: 1,
        duration: 2,
        ease: EASE,
        overwrite: 'auto'
      }
    );
  }

  function initHero() {
    if (!hasGsap() || reducedMotion) {
      return;
    }

    var hero = document.querySelector('.pf2-hero');
    if (!hero) {
      return;
    }

    var heading = hero.querySelector('.pf2-hero__heading');
    var subheading = hero.querySelector('.pf2-hero__subheading');
    var cta = hero.querySelector('.pf2-hero__cta');
    var activeSlide = hero.querySelector('.pf2-hero__slide.is-active');

    if (heading) {
      gsap.fromTo(
        heading,
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, duration: 1.2, ease: EASE, delay: 0.15 }
      );
    }

    if (subheading) {
      gsap.fromTo(
        subheading,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 1, ease: EASE, delay: 0.35 }
      );
    }

    if (cta) {
      gsap.fromTo(
        cta,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 1, ease: EASE, delay: 0.55 }
      );
    }

    animateHeroSlideImage(activeSlide);

    document.addEventListener('pf2:hero-slide', function (event) {
      var index = event.detail && typeof event.detail.index === 'number' ? event.detail.index : 0;
      var slide = hero.querySelector('.pf2-hero__slide[data-slide-index="' + index + '"]');
      animateHeroSlideImage(slide);
    });
  }

  function initScrollFadeUp(targets, options) {
    if (!hasGsap() || reducedMotion || !targets || !targets.length) {
      return;
    }

    var settings = options || {};

    gsap.fromTo(
      targets,
      {
        autoAlpha: 0,
        y: settings.y || 25
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: settings.duration || 0.9,
        ease: EASE,
        stagger: settings.stagger || 0,
        scrollTrigger: {
          trigger: settings.trigger || targets[0],
          start: settings.start || 'top 88%',
          once: true
        }
      }
    );
  }

  function initProductCards() {
    if (!hasGsap() || reducedMotion) {
      return;
    }

    var sections = [
      { trigger: '.pf2-popular', cards: '.pf2-popular__card' },
      { trigger: '.pf2-arrivals', cards: '.pf2-arrivals__card' },
      { trigger: '.pf2-shop__grid', cards: '.pf2-shop__card' },
      { trigger: '.pf2-also-like', cards: '.pf2-also-like__card' }
    ];

    sections.forEach(function (section) {
      var container = document.querySelector(section.trigger);
      if (!container) {
        return;
      }

      var cards = Array.prototype.slice.call(container.querySelectorAll(section.cards));
      if (cards.length === 0) {
        return;
      }

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: {
            trigger: container,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
  }

  function initBannerParallax() {
    if (!hasGsap() || reducedMotion) {
      return;
    }

    Array.prototype.slice.call(document.querySelectorAll('.pf2-banner')).forEach(function (banner) {
      var img = banner.querySelector('.pf2-banner__parallax img, .pf2-banner__link img');
      if (!img) {
        return;
      }

      gsap.fromTo(
        img,
        { y: -20 },
        {
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: banner,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  }

  function initFragranceNotes() {
    if (!hasGsap() || reducedMotion) {
      return;
    }

    var finderCards = Array.prototype.slice.call(document.querySelectorAll('.pf2-finder__card'));
    if (finderCards.length) {
      gsap.fromTo(
        finderCards,
        { autoAlpha: 0, y: 15 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.pf2-finder',
            start: 'top 85%',
            once: true
          }
        }
      );
    }

    animateProductNotes();
  }

  function animateProductNotes() {
    if (!hasGsap() || reducedMotion) {
      return;
    }

    var noteItems = Array.prototype.slice.call(document.querySelectorAll('.pf2-pdp__note-item'));
    if (noteItems.length === 0) {
      return;
    }

    gsap.fromTo(
      noteItems,
      { autoAlpha: 0, y: 15 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: {
          trigger: noteItems[0].closest('.pf2-pdp__card') || noteItems[0],
          start: 'top 88%',
          once: true
        }
      }
    );
  }

  function initTestimonials() {
    var section = document.querySelector('.pf2-testimonials');
    if (!section || !hasGsap() || reducedMotion) {
      return;
    }

    initScrollFadeUp(
      Array.prototype.slice.call(section.querySelectorAll('.pf2-testimonials__title, .pf2-testimonials__slider')),
      { trigger: section, y: 25, duration: 0.9 }
    );
  }

  function initNewsletter() {
    var blocks = Array.prototype.slice.call(
      document.querySelectorAll('.pf2-footer__heading--news, .pf2-footer__news-copy, .pf2-footer__newsletter')
    );

    initScrollFadeUp(blocks, { y: 18, duration: 0.9, stagger: 0.08, trigger: '.pf2-footer__col--contact' });
  }

  function initFooter() {
    var footer = document.querySelector('.pf2-footer');
    if (!footer || !hasGsap() || reducedMotion) {
      return;
    }

    gsap.fromTo(
      footer,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 1,
        ease: EASE,
        scrollTrigger: {
          trigger: footer,
          start: 'top 95%',
          once: true
        }
      }
    );
  }

  function initShopHero() {
    var hero = document.querySelector('.pf2-shop__hero');
    if (!hero || !hasGsap() || reducedMotion) {
      return;
    }

    initScrollFadeUp(
      Array.prototype.slice.call(hero.querySelectorAll('.pf2-shop__crumb, .pf2-shop__title')),
      { trigger: hero, y: 20, duration: 0.9, stagger: 0.1, start: 'top 90%' }
    );
  }

  function initMagneticButtons() {
    if (!hasGsap() || reducedMotion || !finePointer) {
      return;
    }

    Array.prototype.slice.call(document.querySelectorAll(MAGNETIC_SELECTOR)).forEach(function (button) {
      button.addEventListener('mousemove', function (event) {
        var rect = button.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
          x: x * 0.12,
          y: y * 0.12,
          duration: 0.4,
          ease: EASE,
          overwrite: 'auto'
        });
      });

      button.addEventListener('mouseleave', function () {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: EASE
        });
      });
    });
  }

  function initSectionTitles() {
    var titles = Array.prototype.slice.call(
      document.querySelectorAll('.pf2-popular__title, .pf2-arrivals__title, .pf2-finder__title')
    );

    initScrollFadeUp(titles, { y: 20, duration: 0.9, stagger: 0.06 });
  }

  function boot() {
    if (!hasGsap() || reducedMotion) {
      initNavbarGlass();
      document.documentElement.classList.add('pf2-motion-ready');
      return;
    }

    initLenis();
    initNavbarGlass();
    initHero();
    initSectionTitles();
    initProductCards();
    initBannerParallax();
    initFragranceNotes();
    initTestimonials();
    initNewsletter();
    initFooter();
    initShopHero();
    initMagneticButtons();

    ScrollTrigger.refresh();
    document.documentElement.classList.add('pf2-motion-ready');

    document.addEventListener('pf2:notes-updated', animateProductNotes);
  }

  ready(boot);
})();
