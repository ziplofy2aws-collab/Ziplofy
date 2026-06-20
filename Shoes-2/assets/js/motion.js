(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 768px)").matches;

  var EASE_OUT = "power3.out";
  var EASE_SMOOTH = "power2.out";

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  var snapTimer = null;
  var motionBlocks = [];
  var initialized = false;

  /* ── Lenis ── */

  function initLenis() {
    if (lenis || prefersReduced || typeof Lenis === "undefined") {
      return;
    }

    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.4,
    });

    window.lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    initSoftSnap();
    bindLenisMenuLock();
  }

  function bindLenisMenuLock() {
    var nav = document.querySelector("[data-sh2-nav]");
    if (!nav || !lenis) return;

    var observer = new MutationObserver(function () {
      if (nav.classList.contains("is-open")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(nav, { attributes: true, attributeFilter: ["class"] });
  }

  function initSoftSnap() {
    if (!lenis || motionBlocks.length < 2) return;

    lenis.on("scroll", function (_ref) {
      var velocity = _ref.velocity;

      if (Math.abs(velocity) > 0.8) return;

      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(function () {
        if (Math.abs(lenis.velocity) > 0.3) return;

        var scrollY = lenis.scroll;
        var threshold = window.innerHeight * 0.1;
        var nearest = null;
        var nearestDist = Infinity;

        motionBlocks.forEach(function (block) {
          var top = block.getBoundingClientRect().top + scrollY;
          var dist = Math.abs(top - scrollY);

          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = top;
          }
        });

        if (nearest !== null && nearestDist > 2 && nearestDist < threshold) {
          lenis.scrollTo(nearest, {
            duration: 0.75,
            easing: function (t) {
              return 1 - Math.pow(1 - t, 4);
            },
          });
        }
      }, 140);
    });
  }

  /* ── Motion blocks ── */

  function collectMotionBlocks() {
    var blocks = [];

    document.querySelectorAll("main > section").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.sh2-shop > .sh2-header__container > *").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.sh2-pdp > .sh2-header__container > *").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.sh2-pdp > section").forEach(function (el) {
      if (blocks.indexOf(el) === -1) blocks.push(el);
    });

    var footer = document.querySelector(".sh2-footer");
    if (footer) blocks.push(footer);

    return blocks;
  }

  function prepareMotionBlocks() {
    motionBlocks = collectMotionBlocks();

    motionBlocks.forEach(function (block, index) {
      block.classList.add("sh2-motion-block");
      block.dataset.sh2MotionIndex = String(index);
    });
  }

  function isPdpStructuralBlock(block) {
    return (
      block.classList.contains("sh2-pdp__layout") ||
      block.classList.contains("sh2-pdp__crumbs")
    );
  }

  /* ── Heading split ── */

  var HEADING_SELECTOR =
    ".sh2-cat__title, .sh2-na__title, .sh2-exclusive__title, .sh2-trend__title, .sh2-walk__title, .sh2-shop__title, .sh2-pdp__look-title";

  function splitHeadings() {
    document.querySelectorAll(HEADING_SELECTOR).forEach(function (heading) {
      if (heading.closest(".sh2-header") || heading.dataset.sh2Split) return;

      var text = heading.textContent.trim();
      if (!text) return;

      heading.dataset.sh2Split = "true";
      heading.setAttribute("aria-label", text);
      heading.innerHTML = text
        .split(/\s+/)
        .map(function (word) {
          return (
            '<span class="sh2-motion-heading-line" aria-hidden="true">' +
            '<span class="sh2-motion-heading-word">' +
            word +
            "</span></span>"
          );
        })
        .join(" ");
    });
  }

  /* ── Parallax depths ── */

  var PARALLAX_MAP = [
    { sel: ".sh2-hero__slide img", depth: 0.32 },
    { sel: ".sh2-promo__banner img", depth: 0.24 },
    { sel: ".sh2-bslider__slide img", depth: 0.2 },
    { sel: ".sh2-exclusive__card img", depth: 0.18 },
    { sel: ".sh2-walk__card img", depth: 0.16 },
    { sel: ".sh2-na__media img", depth: 0.12 },
    { sel: ".sh2-trend__media img", depth: 0.12 },
    { sel: ".sh2-shop__media img", depth: 0.1 },
    { sel: ".sh2-cat__circle img", depth: 0.08 },
    { sel: ".sh2-pdp__main-media img", depth: 0.14 },
    { sel: ".sh2-pdp__look-media img", depth: 0.1 },
  ];

  function tagParallaxTargets() {
    PARALLAX_MAP.forEach(function (entry) {
      document.querySelectorAll(entry.sel).forEach(function (el) {
        el.classList.add("sh2-motion-parallax");
        el.dataset.sh2Depth = String(entry.depth);
      });
    });
  }

  function initParallax() {
    if (prefersReduced) return;

    gsap.utils.toArray(".sh2-motion-parallax").forEach(function (el) {
      var depth = parseFloat(el.dataset.sh2Depth) || 0.12;
      var trigger =
        el.closest(".sh2-motion-block") ||
        el.closest("section") ||
        el.closest(".sh2-hero__slide") ||
        el.parentElement;

      var amount = isMobile ? depth * 0.55 : depth;

      gsap.fromTo(
        el,
        { yPercent: -amount * 40 },
        {
          yPercent: amount * 40,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    });
  }

  /* ── Global reveal ── */

  function revealFrom(targets, opts) {
    var items = gsap.utils.toArray(targets);
    if (!items.length || prefersReduced) return;

    items.forEach(function (el) {
      el.classList.add("sh2-motion-reveal-item");
    });

    gsap.from(items, Object.assign(
      {
        y: isMobile ? 28 : 48,
        opacity: 0,
        duration: isMobile ? 0.75 : 1,
        ease: EASE_OUT,
        stagger: 0.06,
      },
      opts || {}
    ));
  }

  function initSectionReveals() {
    if (prefersReduced) return;

    motionBlocks.forEach(function (block) {
      if (block.classList.contains("sh2-hero") || isPdpStructuralBlock(block)) return;

      gsap.fromTo(
        block,
        {
          y: isMobile ? 36 : 64,
          opacity: 0,
          scale: isMobile ? 1 : 0.985,
          rotateX: isMobile ? 0 : 2,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: isMobile ? 0.9 : 1.15,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: block,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  function initScrollLinkedSections() {
    if (prefersReduced) return;

    motionBlocks.forEach(function (block, index) {
      if (block.classList.contains("sh2-hero") || isPdpStructuralBlock(block)) return;

      var scaleEnd = isMobile ? 1 : 0.96;
      var yEnter = isMobile ? 16 : 40;
      var scaleEnter = isMobile ? 1 : 1.015;

      if (!isMobile) {
        gsap.fromTo(
          block,
          { scale: 1, y: 0 },
          {
            scale: scaleEnd,
            y: -yEnter * 0.25,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top top",
              end: "bottom top",
              scrub: 0.85,
            },
          }
        );
      }

      if (index > 0) {
        gsap.fromTo(
          block,
          { y: yEnter, scale: scaleEnter },
          {
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "top 55%",
              scrub: 0.85,
            },
          }
        );
      }
    });
  }

  function initHeadingReveals() {
    if (prefersReduced) return;

    document.querySelectorAll(".sh2-motion-heading-word").forEach(function (word) {
      gsap.from(word, {
        y: "110%",
        opacity: 0,
        duration: 0.85,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: word.closest(".sh2-motion-block") || word.closest("section") || word,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  function initStaggerReveals() {
    if (prefersReduced) return;

    var groups = [
      { sel: ".sh2-cat__card", parent: "[data-sh2-categories]" },
      { sel: ".sh2-na__card", parent: "[data-sh2-arrivals]" },
      { sel: ".sh2-exclusive__card", parent: "[data-sh2-exclusive]" },
      { sel: ".sh2-trend__card", parent: "[data-sh2-trending], [data-sh2-pdp-similar]" },
      { sel: ".sh2-walk__card", parent: "[data-sh2-walking]" },
      { sel: ".sh2-shop__card", parent: ".sh2-shop__grid" },
      { sel: ".sh2-pdp__look-card", parent: ".sh2-pdp__look-track" },
      { sel: ".sh2-perks__item", parent: ".sh2-perks" },
    ];

    groups.forEach(function (group) {
      var parent = document.querySelector(group.parent);
      if (!parent) return;

      ScrollTrigger.batch(parent.querySelectorAll(group.sel), {
        start: "top 92%",
        onEnter: function (batch) {
          gsap.from(batch, {
            y: isMobile ? 24 : 40,
            opacity: 0,
            scale: 0.96,
            duration: 0.75,
            stagger: 0.07,
            ease: EASE_OUT,
            overwrite: true,
          });
        },
        once: true,
      });
    });

    revealFrom(".sh2-shop__filter-pill", {
      scrollTrigger: {
        trigger: ".sh2-shop__filters-bar",
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });

    revealFrom(".sh2-shop__meta, .sh2-pdp__crumbs", {
      scrollTrigger: {
        trigger: "main",
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* ── Hero ── */

  function initHeroMotion() {
    var hero = document.querySelector("[data-sh2-hero]");
    if (!hero || prefersReduced) return;

    if (!hero.dataset.sh2MotionHero) {
      hero.dataset.sh2MotionHero = "true";

      hero.addEventListener("sh2:hero-slide", function () {
        var img = hero.querySelector(".sh2-hero__slide.is-active img");
        if (!img) return;

        gsap.fromTo(
          img,
          { scale: 1.08, opacity: 0.88 },
          { scale: 1, opacity: 1, duration: 1.1, ease: EASE_SMOOTH, overwrite: "auto" }
        );
      });
    }

    if (!hero.dataset.sh2MotionHeroLoad) {
      hero.dataset.sh2MotionHeroLoad = "true";
      var activeImg = hero.querySelector(".sh2-hero__slide.is-active img");
      if (activeImg) {
        gsap.from(activeImg, {
          scale: 1.12,
          duration: 1.6,
          ease: EASE_SMOOTH,
        });
      }
    }

    if (hero.dataset.sh2MotionHeroScroll) return;
    hero.dataset.sh2MotionHeroScroll = "true";

    gsap.to(hero.querySelector(".sh2-hero__inner"), {
      yPercent: isMobile ? 4 : 8,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ── Product card hovers ── */

  var CARD_HOVER_SELECTOR =
    ".sh2-na__card, .sh2-trend__card-link, .sh2-shop__card-link, .sh2-exclusive__card, .sh2-walk__card, .sh2-cat__card, .sh2-pdp__look-card";

  function initCardHovers() {
    if (prefersReduced) return;

    document.querySelectorAll(CARD_HOVER_SELECTOR).forEach(function (card) {
      if (card.dataset.sh2HoverBound) return;
      card.dataset.sh2HoverBound = "true";
      card.classList.add("sh2-motion-card");

      var img =
        card.querySelector("img") ||
        card.querySelector(".sh2-na__media img") ||
        card.querySelector(".sh2-trend__media img");

      var hoverIn = function () {
        gsap.to(card, {
          y: -6,
          boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
          duration: 0.45,
          ease: EASE_SMOOTH,
          overwrite: "auto",
        });

        if (img) {
          gsap.to(img, {
            scale: 1.06,
            duration: 0.55,
            ease: EASE_SMOOTH,
            overwrite: "auto",
          });
        }
      };

      var hoverOut = function () {
        gsap.to(card, {
          y: 0,
          boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
          duration: 0.45,
          ease: EASE_SMOOTH,
          overwrite: "auto",
        });

        if (img) {
          gsap.to(img, { scale: 1, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
        }
      };

      card.addEventListener("mouseenter", hoverIn);
      card.addEventListener("mouseleave", hoverOut);
    });
  }

  /* ── Magnetic buttons ── */

  var BTN_SELECTOR =
    ".sh2-na__cart-btn, .sh2-na__view-all, .sh2-exclusive__view-all, .sh2-refer__cta, .sh2-pdp__add-cart, .sh2-pdp__look-cart";

  function initMagneticButtons() {
    if (prefersReduced || isMobile) return;

    document.querySelectorAll(BTN_SELECTOR).forEach(function (btn) {
      if (btn.dataset.sh2MagneticBound) return;
      btn.dataset.sh2MagneticBound = "true";
      btn.classList.add("sh2-motion-btn");

      if (btn.classList.contains("sh2-refer__cta") || btn.classList.contains("sh2-exclusive__view-all")) {
        btn.classList.add("sh2-motion-btn--light");
      } else if (btn.classList.contains("sh2-pdp__add-cart")) {
        btn.classList.add("sh2-motion-btn--accent");
      } else {
        btn.classList.add("sh2-motion-btn--dark");
      }

      var strength = 0.28;

      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * strength;
        var y = (e.clientY - rect.top - rect.height / 2) * strength;

        gsap.to(btn, {
          x: x,
          y: y,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      btn.addEventListener("mouseenter", function () {
        gsap.to(btn, { scale: 1.03, duration: 0.3, ease: EASE_SMOOTH, overwrite: "auto" });
      });

      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.65)",
          overwrite: "auto",
        });
      });
    });
  }

  /* ── Header & icons ── */

  function initHeaderMotion() {
    if (prefersReduced || document.body.dataset.sh2HeaderMotion) return;
    document.body.dataset.sh2HeaderMotion = "true";

    gsap.from(".sh2-header__main-left, .sh2-header__actions", {
      y: -16,
      opacity: 0,
      duration: 0.8,
      ease: EASE_OUT,
      delay: 0.05,
      stagger: 0.06,
      clearProps: "transform,opacity",
    });

    gsap.set(".sh2-header__main, .sh2-header__main-inner", { clearProps: "transform" });

    gsap.utils.toArray(".sh2-header__icon, .sh2-header__menu-toggle").forEach(function (icon) {
      icon.addEventListener("mouseenter", function () {
        gsap.to(icon, { scale: 1.1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      });
      icon.addEventListener("mouseleave", function () {
        gsap.to(icon, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      });
    });
  }

  /* ── Category circles ── */

  function initCategoryMotion() {
    var section = document.querySelector("[data-sh2-categories]");
    if (!section || prefersReduced) return;

    var circles = section.querySelectorAll(".sh2-cat__circle");
    if (!circles.length) return;

    gsap.from(circles, {
      scale: 0.65,
      opacity: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
    });

    section.querySelectorAll(".sh2-cat__card").forEach(function (card) {
      if (card.dataset.sh2CatHover) return;
      card.dataset.sh2CatHover = "true";

      var circle = card.querySelector(".sh2-cat__circle");
      var img = card.querySelector(".sh2-cat__circle img");
      if (!circle) return;

      card.addEventListener("mouseenter", function () {
        gsap.to(circle, { y: -5, duration: 0.4, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1.12, duration: 0.4, ease: EASE_SMOOTH, overwrite: "auto" });
      });

      card.addEventListener("mouseleave", function () {
        gsap.to(circle, { y: 0, duration: 0.4, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1, duration: 0.4, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  /* ── Refer & footer ── */

  function initReferFooter() {
    if (prefersReduced) return;

    var refer = document.querySelector(".sh2-refer");
    if (refer) {
      gsap.from(refer.querySelectorAll(".sh2-refer__title, .sh2-refer__sub"), {
        x: isMobile ? 0 : -36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: refer,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(refer.querySelector(".sh2-refer__cta-wrap"), {
        x: isMobile ? 0 : 36,
        opacity: 0,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: refer,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var footer = document.querySelector(".sh2-footer");
    if (footer) {
      gsap.from(footer.querySelector(".sh2-footer__main"), {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: footer,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }

  /* ── Shop & PDP page specifics ── */

  function initShopPage() {
    if (prefersReduced) return;

    var grid = document.querySelector(".sh2-shop__grid");
    if (!grid) return;

    gsap.from(".sh2-shop__head", {
      y: 32,
      opacity: 0,
      duration: 0.85,
      ease: EASE_OUT,
    });
  }

  function initPdpPage() {
    if (prefersReduced) return;

    if (!document.querySelector(".sh2-pdp")) return;

    gsap.from(".sh2-pdp__gallery", {
      x: isMobile ? 0 : -40,
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
    });

    gsap.from(".sh2-pdp__panel > *", {
      x: isMobile ? 0 : 40,
      opacity: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: EASE_OUT,
      delay: 0.1,
    });

    var mainImg = document.querySelector("[data-sh2-pdp-main]");
    if (mainImg) {
      gsap.to(mainImg, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: ".sh2-pdp__gallery",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }
  }

  /* ── Master init / refresh ── */

  function killMotion() {
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill();
    });
  }

  function boot(isRefresh) {
    if (isRefresh) {
      killMotion();
    }

    if (!initialized) {
      prepareMotionBlocks();
      splitHeadings();
      tagParallaxTargets();
      initLenis();
      initHeaderMotion();
    } else {
      prepareMotionBlocks();
      tagParallaxTargets();
    }

    initHeroMotion();
    initSectionReveals();
    initScrollLinkedSections();
    initHeadingReveals();
    initStaggerReveals();
    initParallax();
    initCategoryMotion();
    initReferFooter();
    initShopPage();
    initPdpPage();
    initCardHovers();
    initMagneticButtons();

    ScrollTrigger.refresh();
    initialized = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", function () {
    ScrollTrigger.refresh();
  });

  window.addEventListener("sh2:motion-refresh", function () {
    window.setTimeout(function () {
      boot(true);
    }, 80);
  });
})();
