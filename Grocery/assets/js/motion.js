(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  var isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var EASE = "power3.out";
  var REVEAL = {
    y: 50,
    opacity: 0,
    scale: 0.98,
    duration: 0.8,
    stagger: 0.08,
    ease: EASE,
  };

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  var cursorEl = null;
  var cursorTarget = { x: 0, y: 0 };
  var cursorCurrent = { x: 0, y: 0 };
  var cursorRaf = null;
  var heroZoomTween = null;

  /* ── Shell: progress, ambience, cursor ── */

  function initShell() {
    if (document.querySelector("[data-grc-motion-shell]")) return;

    var shell = document.createElement("div");
    shell.dataset.grcMotionShell = "true";
    shell.setAttribute("aria-hidden", "true");

    shell.innerHTML =
      '<div class="grc-motion-progress" data-grc-progress><span class="grc-motion-progress__bar"></span></div>' +
      '<div class="grc-motion-ambience">' +
      '<span class="grc-motion-blob grc-motion-blob--a"></span>' +
      '<span class="grc-motion-blob grc-motion-blob--b"></span>' +
      "</div>" +
      '<div class="grc-motion-cursor" data-grc-cursor></div>';

    document.body.prepend(shell);
    cursorEl = shell.querySelector("[data-grc-cursor]");
  }

  /* ── Lenis smooth scroll ── */

  function initLenis() {
    if (lenis || prefersReduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.2,
    });

    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    bindMenuLock();
  }

  function bindMenuLock() {
    var nav = document.querySelector("[data-grc-mobile-nav]");
    if (!nav || !lenis) return;

    var observer = new MutationObserver(function () {
      if (nav.hidden) {
        lenis.start();
      } else {
        lenis.stop();
      }
    });

    observer.observe(nav, { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ── Scroll progress ── */

  function initProgressBar() {
    var bar = document.querySelector(".grc-motion-progress__bar");
    if (!bar || prefersReduced) return;

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        bar.style.width = self.progress * 100 + "%";
      },
    });
  }

  /* ── Cursor glow ── */

  function initCursorGlow() {
    if (!cursorEl || prefersReduced || !isFinePointer || isMobile) return;

    document.addEventListener(
      "mousemove",
      function (e) {
        cursorTarget.x = e.clientX;
        cursorTarget.y = e.clientY;
        cursorEl.classList.add("is-active");
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseleave",
      function () {
        cursorEl.classList.remove("is-active");
      },
      { passive: true }
    );

    function tick() {
      cursorCurrent.x += (cursorTarget.x - cursorCurrent.x) * 0.18;
      cursorCurrent.y += (cursorTarget.y - cursorCurrent.y) * 0.18;
      cursorEl.style.transform =
        "translate3d(" + cursorCurrent.x + "px," + cursorCurrent.y + "px,0)";
      cursorRaf = requestAnimationFrame(tick);
    }

    cursorRaf = requestAnimationFrame(tick);
  }

  /* ── Global reveal ── */

  function collectRevealTargets() {
    var selectors = [
      "main h2",
      "main h3",
      ".grc-categories__title",
      ".grc-categories__card",
      ".grc-farm__head > *",
      ".grc-farm__card",
      ".grc-promo__card",
      ".grc-essentials__head > *",
      ".grc-essentials__card",
      ".grc-shopways__title",
      ".grc-shopways__card",
      ".grc-aisles__title",
      ".grc-aisles__card",
      ".grc-promo-cards__card",
      ".grc-promo-cards__foot > *",
    ];

    var nodes = [];
    var seen = new Set();

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        nodes.push(el);
      });
    });

    return nodes;
  }

  function initReveals() {
    if (prefersReduced) return;

    var targets = collectRevealTargets();
    targets.forEach(function (el) {
      el.classList.add("grc-motion-reveal");
    });

    ScrollTrigger.batch(targets, {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(
          batch,
          {
            y: REVEAL.y,
            opacity: REVEAL.opacity,
            scale: REVEAL.scale,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: REVEAL.duration,
            stagger: REVEAL.stagger,
            ease: REVEAL.ease,
            overwrite: true,
          }
        );
      },
    });
  }

  /* ── Hero cinematic ── */

  function initHeroMotion() {
    var hero = document.querySelector("[data-grc-hero]");
    if (!hero || prefersReduced) return;

    var frame = hero.querySelector(".grc-hero__frame");
    var slides = hero.querySelectorAll(".grc-hero__slide img");

    if (frame) {
      gsap.from(frame, {
        y: 48,
        opacity: 0,
        duration: 1,
        ease: EASE,
        delay: 0.05,
      });
    }

    slides.forEach(function (img) {
      img.classList.add("grc-motion-hero-zoom", "grc-motion-parallax");
      img.dataset.grcParallax = "0.85";
    });

    function playHeroZoom() {
      if (heroZoomTween) heroZoomTween.kill();

      var activeImg = hero.querySelector(".grc-hero__slide.is-active img");
      if (!activeImg) return;

      gsap.set(slides, { scale: 1 });
      heroZoomTween = gsap.to(activeImg, {
        scale: 1.03,
        duration: 12,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    }

    playHeroZoom();

    var observer = new MutationObserver(function () {
      playHeroZoom();
    });

    hero.querySelectorAll(".grc-hero__slide").forEach(function (slide) {
      observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });

    if (!isMobile) {
      gsap.to(frame, {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.85,
        },
      });
    }
  }

  /* ── Parallax depths ── */

  function initParallax() {
    if (prefersReduced || isMobile) return;

    document.querySelectorAll(".grc-promo__card img, .grc-promo-cards__card img").forEach(function (el) {
      el.classList.add("grc-motion-parallax");
      el.dataset.grcParallax = "0.9";
    });

    document.querySelectorAll(".grc-shopways__card img").forEach(function (el) {
      el.classList.add("grc-motion-parallax");
      el.dataset.grcParallax = "0.9";
    });

    document.querySelectorAll(
      "main h2, main h3, .grc-farm__name, .grc-essentials__name, .grc-promo-cards__title, .grc-promo-cards__subtitle"
    ).forEach(function (el) {
      el.classList.add("grc-motion-parallax");
      el.dataset.grcParallax = "1.05";
    });

    document.querySelectorAll("[data-grc-parallax]").forEach(function (el) {
      var speed = parseFloat(el.dataset.grcParallax || "1");
      var range = speed >= 1 ? (speed - 1) * 120 : (1 - speed) * 120;
      range = Math.max(12, Math.min(24, range));

      gsap.fromTo(
        el,
        { y: -range * 0.45 },
        {
          y: range * 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") || el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        }
      );
    });
  }

  /* ── Image depth on scroll ── */

  function initImageDepth() {
    if (prefersReduced) return;

    var images = document.querySelectorAll(
      ".grc-categories__media img, .grc-farm__media img, .grc-essentials__media img, " +
        ".grc-aisles__media img, .grc-shopways__card img, .grc-promo__card img"
    );

    images.forEach(function (img) {
      if (img.closest("[data-grc-hero]")) return;
      img.classList.add("grc-motion-depth");

      gsap.fromTo(
        img,
        { scale: 1 },
        {
          scale: 1.04,
          duration: 0.8,
          ease: EASE,
          scrollTrigger: {
            trigger: img.closest("a, article, .grc-categories__media, .grc-farm__media") || img,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    });
  }

  /* ── Product & category hovers (class hooks) ── */

  function initCardClasses() {
    document.querySelectorAll(".grc-farm__card, .grc-essentials__card").forEach(function (card) {
      card.classList.add("grc-motion-product");
    });

    document.querySelectorAll(".grc-categories__card, .grc-aisles__card").forEach(function (card) {
      card.classList.add("grc-motion-category");
    });

    document.querySelectorAll(".grc-promo__card, .grc-promo-cards__card, .grc-shopways__card").forEach(function (card) {
      card.classList.add("grc-motion-banner");
    });
  }

  /* ── Aisle row alternating drift ── */

  function initAisleRowMotion() {
    if (prefersReduced) return;

    document.querySelectorAll(".grc-aisles__block").forEach(function (block, index) {
      var row = block.querySelector(".grc-aisles__row");
      if (!row) return;

      row.classList.add("grc-motion-row");
      var fromX = index % 2 === 0 ? -20 : 20;

      gsap.fromTo(
        row,
        { x: fromX },
        {
          x: 0,
          ease: "none",
          scrollTrigger: {
            trigger: block,
            start: "top bottom",
            end: "top 58%",
            scrub: 1.1,
          },
        }
      );
    });
  }

  /* ── Section subtle depth ── */

  function initSectionDepth() {
    if (prefersReduced || isMobile) return;

    document.querySelectorAll("main > section").forEach(function (section, index) {
      if (section.matches("[data-grc-hero]")) return;
      if (index === 0) return;

      gsap.fromTo(
        section,
        { y: 18 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 62%",
            scrub: 0.75,
          },
        }
      );
    });
  }

  /* ── CTA buttons ── */

  function initButtons() {
    var selectors =
      ".grc-farm__add, .grc-essentials__add, .grc-footer__submit, .grc-farm__view-all, " +
      ".grc-essentials__view-all, .grc-promo-cards__view-all, .grc-header__location, .grc-header__announce-close";

    document.querySelectorAll(selectors).forEach(function (btn) {
      btn.classList.add("grc-motion-btn");
    });
  }

  /* ── Header entrance ── */

  function initHeaderMotion() {
    if (prefersReduced || document.body.dataset.grcHeaderMotion) return;
    document.body.dataset.grcHeaderMotion = "true";

    gsap.from(".grc-header__main-inner > *", {
      y: -12,
      opacity: 0,
      duration: 0.85,
      stagger: 0.07,
      ease: EASE,
      delay: 0.04,
      clearProps: "transform,opacity",
    });
  }

  /* ── Footer reveal batch ── */

  function initFooterMotion() {
    if (prefersReduced) return;

    var footer = document.querySelector(".grc-footer");
    if (!footer || footer.dataset.grcFooterMotion) return;
    footer.dataset.grcFooterMotion = "true";

    gsap.from(".grc-footer__wave", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: {
        trigger: footer,
        start: "top 98%",
        once: true,
      },
    });
  }

  /* ── Boot ── */

  function boot() {
    initShell();
    initLenis();
    initProgressBar();
    initCursorGlow();
    initCardClasses();
    initButtons();
    initHeaderMotion();
    initHeroMotion();
    initReveals();
    initParallax();
    initImageDepth();
    initAisleRowMotion();
    initSectionDepth();
    initFooterMotion();
    ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });

  window.addEventListener(
    "resize",
    function () {
      ScrollTrigger.refresh();
    },
    { passive: true }
  );
})();
