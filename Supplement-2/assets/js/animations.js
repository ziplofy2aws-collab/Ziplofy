(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mobileQuery = window.matchMedia("(max-width: 768px)");
  var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var touchQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  var isMobile = mobileQuery.matches;
  var prefersReduced = reducedQuery.matches;
  var isTouch = touchQuery.matches;
  var intensity = isMobile ? 0.5 : 1;

  var easeOut = "power3.out";
  var dur = prefersReduced ? 0.01 : 1 * intensity + 0.2;

  function dist(value) {
    return Math.round(value * intensity);
  }

  function parallaxDist(value) {
    return Math.min(dist(value), dist(50));
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", function () {
      isMobile = mobileQuery.matches;
      intensity = isMobile ? 0.5 : 1;
      ScrollTrigger.refresh();
    });
  }

  /* ── Lenis ── */
  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;

    var lenis = new Lenis({
      duration: isMobile ? 1.05 : 1.25,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: isMobile ? 1.15 : 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Helpers ── */
  function revealOnce(el, opts) {
    opts = opts || {};
    if (!el) return;

    if (prefersReduced) {
      gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
      return;
    }

    var from = Object.assign(
      { autoAlpha: 0, y: dist(opts.y || 60) },
      opts.from || {}
    );
    var to = Object.assign(
      { autoAlpha: 1, y: 0, duration: dur, ease: easeOut },
      opts.to || {}
    );

    gsap.set(el, from);
    gsap.to(el, Object.assign(to, {
      scrollTrigger: {
        trigger: opts.trigger || el,
        start: opts.start || "top 80%",
        once: true,
        invalidateOnRefresh: true,
      },
      onComplete: function () {
        if (opts.clearTransform !== false) {
          gsap.set(el, { clearProps: "transform" });
        }
      },
    }));
  }

  function staggerReveal(items, opts) {
    opts = opts || {};
    if (!items || !items.length) return;

    if (prefersReduced) {
      gsap.set(items, { autoAlpha: 1, clearProps: "transform" });
      return;
    }

    gsap.set(items, {
      autoAlpha: 0,
      y: dist(opts.y || 60),
      x: opts.x ? dist(opts.x) : 0,
      scale: opts.scale !== undefined ? opts.scale : 1,
    });

    gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: dur,
      ease: easeOut,
      stagger: opts.stagger || 0.12 * intensity + 0.08,
      scrollTrigger: {
        trigger: opts.trigger,
        start: opts.start || "top 80%",
        once: true,
      },
      onComplete: function () {
        gsap.set(items, { clearProps: "transform" });
      },
    });
  }

  function markAnimated(el) {
    if (el) el.setAttribute("data-sp2-animated", "true");
  }

  function isAnimated(el) {
    return el && el.getAttribute("data-sp2-animated") === "true";
  }

  /* ── Micro-interaction classes ── */
  function initMicroClasses() {
    var btnSel = [
      ".sp2-header__announce-btn",
      ".sp2-header__menu-toggle",
      ".sp2-hero__arrow",
      ".sp2-products__arrow",
      ".sp2-promo__arrow",
      ".sp2-promos__arrow",
      ".sp2-product-card__buy",
      ".sp2-brand-card__cta",
      ".sp2-brand-card__emi-btn",
      ".sp2-footer__newsletter-btn",
      ".sp2-footer__chat",
    ].join(",");

    document.querySelectorAll(btnSel).forEach(function (el) {
      el.classList.add("sp2-anim-btn");
    });

    document.querySelectorAll(
      ".sp2-header__nav-list a, .sp2-footer__links a, .sp2-footer__cookie"
    ).forEach(function (el) {
      el.classList.add("sp2-anim-link");
    });

    document.querySelectorAll(".sp2-categories__card").forEach(function (el) {
      el.classList.add("sp2-anim-hover");
    });

    document.querySelectorAll(".sp2-deals__card").forEach(function (el) {
      el.classList.add("sp2-anim-hover");
    });

    document.querySelectorAll(".sp2-promos__card").forEach(function (el) {
      el.classList.add("sp2-anim-hover");
    });

    document.querySelectorAll(".sp2-footer__social-icons a").forEach(function (el) {
      el.classList.add("sp2-anim-social");
    });

    document.querySelectorAll(".sp2-promo__arrow").forEach(function (el) {
      el.classList.add("sp2-anim-pulse");
    });
  }

  function enhanceProductCards(cards) {
    cards.forEach(function (card) {
      if (isAnimated(card)) return;
      card.classList.add("sp2-anim-hover");
      markAnimated(card);

      if (!prefersReduced) {
        revealOnce(card, {
          trigger: card,
          y: 60,
          start: "top 88%",
        });
      }
    });
  }

  function enhanceBrandCards(cards) {
    cards.forEach(function (card, i) {
      if (isAnimated(card)) return;
      markAnimated(card);

      var img = card.querySelector(".sp2-brand-card__media img");
      if (!img || prefersReduced) {
        gsap.set(card, { autoAlpha: 1 });
        return;
      }

      gsap.set(card, { autoAlpha: 0, y: dist(40) });
      gsap.set(img, { scale: 0.8, rotation: 2, transformOrigin: "center center" });

      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        duration: dur,
        ease: easeOut,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          once: true,
        },
        onComplete: function () {
          gsap.set(card, { clearProps: "transform" });
        },
      });

      gsap.to(img, {
        scale: 1,
        rotation: 0,
        duration: dur + 0.1,
        ease: easeOut,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          once: true,
        },
        onComplete: function () {
          gsap.set(img, { clearProps: "transform" });
        },
      });
    });
  }

  function observeDynamicContent() {
    var productsGrid = document.querySelector("[data-sp2-products-grid]");
    if (productsGrid) {
      enhanceProductCards(productsGrid.querySelectorAll(".sp2-product-card"));
      var prodObserver = new MutationObserver(function () {
        enhanceProductCards(productsGrid.querySelectorAll(".sp2-product-card:not([data-sp2-animated])"));
      });
      prodObserver.observe(productsGrid, { childList: true, subtree: true });
    }

    var brandTrack = document.querySelector("[data-sp2-brand-track]");
    if (brandTrack) {
      enhanceBrandCards(brandTrack.querySelectorAll(".sp2-brand-card"));
      var brandObserver = new MutationObserver(function () {
        enhanceBrandCards(brandTrack.querySelectorAll(".sp2-brand-card:not([data-sp2-animated])"));
      });
      brandObserver.observe(brandTrack, { childList: true, subtree: true });
    }
  }

  /* ── Header ── */
  function initHeader() {
    var header = document.querySelector(".sp2-header");
    if (!header) return;

    var announce = header.querySelector(".sp2-header__announce");
    var main = header.querySelector(".sp2-header__main");
    var nav = header.querySelector(".sp2-header__nav");
    var navItems = header.querySelectorAll(".sp2-header__nav-list li");
    var logoImg = header.querySelector(".sp2-header__logo img");

    document.body.classList.add("sp2-anim-loading");

    if (prefersReduced) {
      document.body.classList.remove("sp2-anim-loading");
      gsap.set([announce, main, nav], { autoAlpha: 1, clearProps: "all" });
      return;
    }

    var tl = gsap.timeline({
      defaults: { ease: easeOut },
      onComplete: function () {
        document.body.classList.remove("sp2-anim-loading");
        gsap.set([announce, main, nav], { clearProps: "transform" });
      },
    });

    if (announce) {
      gsap.set(announce, { autoAlpha: 0, y: dist(-40) });
      tl.to(announce, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1);
    }

    if (main) {
      gsap.set(main, { autoAlpha: 0, y: dist(-20) });
      tl.to(main, { autoAlpha: 1, y: 0, duration: 0.85 }, 0.25);
    }

    if (navItems.length) {
      gsap.set(navItems, { autoAlpha: 0, y: dist(12) });
      tl.to(navItems, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.45);
    }

    if (!prefersReduced) {
      ScrollTrigger.create({
        start: 40,
        end: 99999,
        onUpdate: function (self) {
          header.classList.toggle("is-scrolled", self.scroll() > 40);
        },
      });

      if (logoImg) {
        gsap.to(logoImg, {
          scale: 0.94,
          ease: easeOut,
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "+=180",
            scrub: 0.5,
          },
        });
      }
    }
  }

  /* ── Hero ── */
  function initHero() {
    var hero = document.querySelector("[data-sp2-hero]");
    if (!hero) return;

    var inner = hero.querySelector(".sp2-hero__inner");
    var arrows = hero.querySelectorAll(".sp2-hero__arrow");
    var activeSlide = hero.querySelector(".sp2-hero__slide.is-active");
    var activeImg = activeSlide ? activeSlide.querySelector("img") : null;

    if (!prefersReduced && activeImg) {
      gsap.set(activeImg, { scale: 1.15, autoAlpha: 0 });
      gsap.to(activeImg, {
        scale: 1,
        autoAlpha: 1,
        duration: 1.1 * intensity + 0.2,
        ease: easeOut,
        delay: 0.35,
      });
    }

    if (arrows.length && !prefersReduced) {
      gsap.set(arrows, { autoAlpha: 0 });
      gsap.to(arrows, {
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: easeOut,
        delay: 0.7,
      });
    }

    if (prefersReduced || isMobile) return;

    if (inner) {
      gsap.to(inner, {
        y: parallaxDist(30),
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }

    hero.querySelectorAll(".sp2-hero__slide.is-active").forEach(function (slide) {
      gsap.to(slide, {
        y: parallaxDist(20),
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    });

    function bindActiveImgParallax(img) {
      if (!img) return;
      gsap.to(img, {
        y: parallaxDist(40),
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    bindActiveImgParallax(activeImg);

    hero.querySelectorAll(".sp2-hero__slide").forEach(function (slide) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName !== "class") return;
          if (!slide.classList.contains("is-active")) return;
          var img = slide.querySelector("img");
          if (img) {
            gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 0.9, ease: easeOut });
          }
        });
      });
      observer.observe(slide, { attributes: true });
    });

    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      snap: {
        snapTo: [0, 1],
        duration: { min: 0.15, max: 0.45 },
        delay: 0.05,
        ease: easeOut,
      },
    });
  }

  /* ── Products ── */
  function initProducts() {
    var section = document.querySelector("[data-sp2-products]");
    if (!section) return;

    revealOnce(section.querySelector(".sp2-products__inner"), {
      trigger: section,
      y: 60,
    });

    staggerReveal(section.querySelectorAll(".sp2-products__tab"), {
      trigger: section,
      y: dist(30),
      stagger: 0.1,
    });
  }

  /* ── Promo ── */
  function initPromo() {
    var section = document.querySelector("[data-sp2-promo]");
    if (!section) return;

    var wrap = section.querySelector(".sp2-promo__wrap");
    var viewport = section.querySelector(".sp2-promo__viewport");

    if (prefersReduced) {
      gsap.set(wrap, { autoAlpha: 1 });
      return;
    }

    gsap.set(wrap, { autoAlpha: 0, scale: 0.95 });
    gsap.to(wrap, {
      autoAlpha: 1,
      scale: 1,
      duration: dur,
      ease: easeOut,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
      },
      onComplete: function () {
        gsap.set(wrap, { clearProps: "transform" });
      },
    });

    if (!isMobile && viewport) {
      gsap.to(viewport, {
        y: parallaxDist(25),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });
    }
  }

  /* ── Categories ── */
  function initCategories() {
    var section = document.querySelector("[data-sp2-categories]");
    if (!section) return;

    revealOnce(section.querySelector(".sp2-categories__title"), {
      trigger: section,
      y: dist(40),
    });

    var cards = section.querySelectorAll(".sp2-categories__card");
    var total = cards.length;
    var center = (total - 1) / 2;

    cards.forEach(function (card, i) {
      if (prefersReduced) {
        gsap.set(card, { autoAlpha: 1 });
        return;
      }

      var offset = (i - center) * dist(20);
      gsap.set(card, { autoAlpha: 0, y: dist(60), x: offset });
      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        x: 0,
        duration: dur,
        ease: easeOut,
        delay: Math.abs(i - center) * 0.08,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
        onComplete: function () {
          gsap.set(card, { clearProps: "transform" });
        },
      });
    });
  }

  /* ── Deals ── */
  function initDeals() {
    var section = document.querySelector(".sp2-deals");
    if (!section) return;

    revealOnce(section.querySelector(".sp2-deals__title"), {
      trigger: section,
      y: dist(40),
    });

    staggerReveal(section.querySelectorAll(".sp2-deals__card"), {
      trigger: section,
      y: dist(60),
      stagger: 0.12,
    });

    if (!prefersReduced && !isMobile) {
      var title = section.querySelector(".sp2-deals__title");
      if (title) {
        gsap.to(title, {
          y: parallaxDist(-15),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 2.5,
          },
        });
      }
    }
  }

  /* ── Brand ── */
  function initBrand() {
    var section = document.querySelector("[data-sp2-brand]");
    if (!section) return;

    var box = section.querySelector(".sp2-brand__box");
    var logo = section.querySelector(".sp2-brand__logo");
    var logoPanel = section.querySelector(".sp2-brand__logo-panel");

    revealOnce(section.querySelector(".sp2-brand__inner"), {
      trigger: section,
      y: dist(60),
    });

    if (logo && !prefersReduced) {
      gsap.set(logo, { scale: 0.8, rotation: 2, autoAlpha: 0, transformOrigin: "center center" });
      gsap.to(logo, {
        scale: 1,
        rotation: 0,
        autoAlpha: 1,
        duration: dur + 0.1,
        ease: easeOut,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
        onComplete: function () {
          gsap.set(logo, { clearProps: "transform" });
        },
      });
    }

    if (!prefersReduced && !isMobile) {
      if (box) {
        gsap.to(box, {
          y: parallaxDist(-45),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      if (logoPanel) {
        gsap.to(logoPanel, {
          y: parallaxDist(-30),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    }

    if (!isTouch && section) {
      section.addEventListener("mousemove", function (e) {
        var rect = section.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        if (logo) {
          gsap.to(logo, {
            rotateY: x * 4 * intensity,
            rotateX: -y * 4 * intensity,
            duration: 0.5,
            ease: easeOut,
            transformPerspective: 600,
          });
        }
      });
      section.addEventListener("mouseleave", function () {
        if (logo) {
          gsap.to(logo, { rotateY: 0, rotateX: 0, duration: 0.7, ease: easeOut });
        }
      });
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "bottom 25%",
      snap: {
        snapTo: [0, 1],
        duration: { min: 0.15, max: 0.4 },
        delay: 0.05,
        ease: easeOut,
      },
    });
  }

  /* ── Promos ── */
  function initPromos() {
    var section = document.querySelector("[data-sp2-promos]");
    if (!section) return;

    revealOnce(section.querySelector(".sp2-promos__inner"), {
      trigger: section,
      y: dist(60),
    });

    var cards = section.querySelectorAll(".sp2-promos__card");
    cards.forEach(function (card, i) {
      if (prefersReduced) {
        gsap.set(card, { autoAlpha: 1 });
        return;
      }

      var fromX = i % 2 === 0 ? dist(-40) : dist(40);
      gsap.set(card, { autoAlpha: 0, y: dist(50), x: fromX });
      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        x: 0,
        duration: dur,
        ease: easeOut,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
        onComplete: function () {
          gsap.set(card, { clearProps: "transform" });
        },
      });
    });
  }

  /* ── Footer ── */
  function initFooter() {
    var footer = document.querySelector(".sp2-footer");
    if (!footer) return;

    revealOnce(footer.querySelector(".sp2-footer__main"), {
      trigger: footer,
      y: dist(60),
    });

    revealOnce(footer.querySelector(".sp2-footer__bottom"), {
      trigger: footer,
      y: dist(40),
      start: "top 85%",
    });

    staggerReveal(footer.querySelectorAll(".sp2-footer__social-icons a"), {
      trigger: footer.querySelector(".sp2-footer__social"),
      y: dist(20),
      stagger: 0.1,
      scale: 1,
    });
  }

  /* ── Global section reveals ── */
  function initGlobalReveals() {
    document.querySelectorAll("#main-content > section").forEach(function (section) {
      if (
        section.hasAttribute("data-sp2-hero") ||
        section.hasAttribute("data-sp2-products") ||
        section.hasAttribute("data-sp2-promo") ||
        section.hasAttribute("data-sp2-categories") ||
        section.classList.contains("sp2-deals") ||
        section.hasAttribute("data-sp2-brand") ||
        section.hasAttribute("data-sp2-promos")
      ) {
        return;
      }

      var inner = section.querySelector("[class$='__inner']") || section;
      revealOnce(inner, { trigger: section, y: dist(60) });
    });
  }

  /* ── Init ── */
  function init() {
    initMicroClasses();
    initLenis();
    initHeader();
    initHero();
    initProducts();
    initPromo();
    initCategories();
    initDeals();
    initBrand();
    initPromos();
    initFooter();
    initGlobalReveals();

    window.addEventListener("load", function () {
      observeDynamicContent();
      ScrollTrigger.refresh();
    });

    if (document.readyState === "complete") {
      observeDynamicContent();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
