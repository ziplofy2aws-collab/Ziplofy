(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  var EASE_OUT = "power3.out";
  var EASE_SMOOTH = "power2.out";
  var EASE_LUXE = "expo.out";

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  var splits = [];
  var initialized = false;
  var motionBlocks = [];

  /* ── Lenis ── */

  function initLenis() {
    if (lenis || prefersReduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.35,
    });

    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    bindLenisMenuLock();
  }

  function bindLenisMenuLock() {
    var nav = document.querySelector("[data-gr2-nav]");
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

  /* ── Motion blocks ── */

  function collectMotionBlocks() {
    var blocks = [];

    document.querySelectorAll("main > section").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.gr2-shop > .gr2-header__container > *").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.gr2-pdp > .gr2-header__container > *").forEach(function (el) {
      blocks.push(el);
    });

    document.querySelectorAll("main.gr2-pdp > section").forEach(function (el) {
      if (blocks.indexOf(el) === -1) blocks.push(el);
    });

    var footer = document.querySelector(".gr2-footer");
    if (footer) blocks.push(footer);

    return blocks;
  }

  function prepareMotionBlocks() {
    motionBlocks = collectMotionBlocks();
    motionBlocks.forEach(function (block, index) {
      block.classList.add("gr2-motion-block");
      block.dataset.gr2MotionIndex = String(index);
    });
  }

  /* ── SplitType headings ── */

  var SPLIT_HEADINGS =
    ".gr2-cat__title, .gr2-bs__title, .gr2-promo__title, .gr2-trust__title, .gr2-shop__title, .gr2-pdp__title, .gr2-pdp-reviews__title";

  function destroySplits() {
    splits.forEach(function (split) {
      if (split && typeof split.revert === "function") split.revert();
    });
    splits = [];

    document.querySelectorAll("[data-gr2-split]").forEach(function (el) {
      delete el.dataset.gr2Split;
    });
  }

  function initSplitHeadings() {
    if (prefersReduced || typeof SplitType === "undefined") return;

    document.querySelectorAll(SPLIT_HEADINGS).forEach(function (heading) {
      if (heading.dataset.gr2Split || heading.closest(".gr2-header")) return;

      var text = heading.textContent.trim();
      if (!text) return;

      heading.dataset.gr2Split = "true";
      heading.setAttribute("aria-label", text);

      var split = new SplitType(heading, { types: "chars,words" });
      splits.push(split);

      split.words.forEach(function (word) {
        word.style.display = "inline-block";
        word.style.overflow = "hidden";
        word.style.verticalAlign = "top";
      });

      split.chars.forEach(function (char) {
        char.classList.add("gr2-motion-char");
      });
    });
  }

  function initCharReveals() {
    if (prefersReduced) return;

    document.querySelectorAll(SPLIT_HEADINGS).forEach(function (heading) {
      if (!heading.dataset.gr2Split) return;

      var chars = heading.querySelectorAll(".char");
      if (!chars.length) return;

      var isHeroAdjacent = heading.classList.contains("gr2-cat__title");

      gsap.from(chars, {
        y: "110%",
        opacity: 0,
        duration: isHeroAdjacent ? 0.9 : 0.75,
        stagger: isHeroAdjacent ? 0.025 : 0.018,
        ease: EASE_LUXE,
        scrollTrigger: isHeroAdjacent
          ? undefined
          : {
              trigger: heading.closest("section") || heading,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
        delay: isHeroAdjacent ? 0.55 : 0,
      });
    });
  }

  /* ── Parallax ── */

  var PARALLAX_MAP = [
    { sel: ".gr2-hero__slide.is-active img, .gr2-hero__slide img", depth: 0.28 },
    { sel: ".gr2-promo__banner img", depth: 0.22 },
    { sel: ".gr2-sgrid__card img", depth: 0.16 },
    { sel: ".gr2-promo-duo__card img", depth: 0.18 },
    { sel: ".gr2-brand-banner__frame img", depth: 0.2 },
    { sel: ".gr2-bs__media img", depth: 0.1 },
    { sel: ".gr2-cat__card img", depth: 0.08 },
    { sel: ".gr2-pdp__main-media img", depth: 0.12 },
  ];

  function tagParallaxTargets() {
    PARALLAX_MAP.forEach(function (entry) {
      document.querySelectorAll(entry.sel).forEach(function (el) {
        el.classList.add("gr2-motion-parallax");
        el.dataset.gr2Depth = String(entry.depth);
      });
    });
  }

  function initParallax() {
    if (prefersReduced) return;

    gsap.utils.toArray(".gr2-motion-parallax").forEach(function (el) {
      var depth = parseFloat(el.dataset.gr2Depth) || 0.12;
      var trigger =
        el.closest(".gr2-motion-block") ||
        el.closest("section") ||
        el.closest(".gr2-hero__slide") ||
        el.parentElement;

      var amount = isMobile ? depth * 0.5 : depth;

      gsap.fromTo(
        el,
        { yPercent: -amount * 36 },
        {
          yPercent: amount * 36,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.55,
          },
        }
      );
    });
  }

  /* ── Reveal helpers ── */

  function revealFrom(targets, opts) {
    var items = gsap.utils.toArray(targets);
    if (!items.length || prefersReduced) return;

    items.forEach(function (el) {
      el.classList.add("gr2-motion-reveal-item");
    });

    gsap.from(items, Object.assign(
      {
        y: isMobile ? 24 : 40,
        opacity: 0,
        duration: isMobile ? 0.7 : 0.95,
        ease: EASE_OUT,
        stagger: 0.06,
      },
      opts || {}
    ));
  }

  /* ── Hero ── */

  function initHeroMotion() {
    var hero = document.querySelector("[data-gr2-hero]");
    if (!hero || prefersReduced) return;

    var inner = hero.querySelector(".gr2-hero__inner");
    var lines = hero.querySelectorAll(".gr2-hero__line");

    if (!hero.dataset.gr2MotionHero) {
      hero.dataset.gr2MotionHero = "true";

      hero.addEventListener("gr2:hero-slide", function () {
        var img = hero.querySelector(".gr2-hero__slide.is-active img");
        if (!img) return;

        gsap.fromTo(
          img,
          { scale: 1.05, opacity: 0.92 },
          { scale: 1, opacity: 1, duration: 1.15, ease: EASE_SMOOTH, overwrite: "auto" }
        );
      });
    }

    if (!hero.dataset.gr2MotionHeroLoad) {
      hero.dataset.gr2MotionHeroLoad = "true";

      var activeImg = hero.querySelector(".gr2-hero__slide.is-active img");
      if (activeImg) {
        gsap.fromTo(
          activeImg,
          { scale: 1.05, y: 28 },
          { scale: 1, y: 0, duration: 1.85, ease: EASE_SMOOTH }
        );
      }

      if (lines.length) {
        gsap.from(lines, {
          y: 16,
          opacity: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: EASE_OUT,
          delay: 0.35,
        });
      }
    }

    if (inner && !hero.dataset.gr2MotionHeroScroll) {
      hero.dataset.gr2MotionHeroScroll = "true";

      gsap.to(inner, {
        yPercent: isMobile ? 3 : 6,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (!isMobile && !isTouch && !hero.dataset.gr2MotionHeroCursor) {
      hero.dataset.gr2MotionHeroCursor = "true";
      var parallaxTarget = inner || hero;

      hero.addEventListener("mousemove", function (e) {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(parallaxTarget, {
          x: x * 12,
          y: y * 8,
          duration: 0.9,
          ease: EASE_SMOOTH,
          overwrite: "auto",
        });

        var img = hero.querySelector(".gr2-hero__slide.is-active img");
        if (img) {
          gsap.to(img, {
            x: x * -8,
            y: y * -5,
            duration: 1,
            ease: EASE_SMOOTH,
            overwrite: "auto",
          });
        }
      });

      hero.addEventListener("mouseleave", function () {
        gsap.to(parallaxTarget, { x: 0, y: 0, duration: 1.1, ease: EASE_SMOOTH });
        var img = hero.querySelector(".gr2-hero__slide.is-active img");
        if (img) gsap.to(img, { x: 0, y: 0, duration: 1.1, ease: EASE_SMOOTH });
      });
    }
  }

  /* ── Category ── */

  function initCategoryMotion() {
    var section = document.querySelector(".gr2-cat");
    if (!section || prefersReduced) return;

    var cards = section.querySelectorAll(".gr2-cat__card");
    if (!cards.length) return;

    ScrollTrigger.batch(cards, {
      start: "top 92%",
      onEnter: function (batch) {
        gsap.from(batch, {
          y: isMobile ? 28 : 44,
          opacity: 0,
          scale: 0.97,
          duration: 0.85,
          stagger: 0.07,
          ease: EASE_OUT,
          overwrite: true,
        });
      },
      once: true,
    });

    if (isTouch) return;

    cards.forEach(function (card) {
      if (card.dataset.gr2HoverBound) return;
      card.dataset.gr2HoverBound = "true";
      card.classList.add("gr2-motion-card");

      var img = card.querySelector("img");

      card.addEventListener("mouseenter", function () {
        gsap.to(card, {
          y: -5,
          boxShadow: "0 18px 42px rgba(5, 12, 22, 0.18)",
          duration: 0.5,
          ease: EASE_SMOOTH,
          overwrite: "auto",
        });
        if (img) {
          gsap.to(img, { scale: 1.06, duration: 0.6, ease: EASE_SMOOTH, overwrite: "auto" });
        }
      });

      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.5, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  /* ── Product carousels ── */

  function initProductMotion() {
    if (prefersReduced) return;

    document.querySelectorAll("[data-gr2-product-carousel]").forEach(function (section) {
      var header = section.querySelector(".gr2-bs__header");
      if (header && !header.dataset.gr2MotionHeader) {
        header.dataset.gr2MotionHeader = "true";
        revealFrom(header.querySelectorAll(".gr2-bs__header-line, .gr2-bs__title"), {
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          stagger: 0.1,
        });
      }

      var track = section.querySelector("[data-gr2-bs-track]");
      if (!track) return;

      ScrollTrigger.batch(track.querySelectorAll(".gr2-bs__card"), {
        start: "top 94%",
        onEnter: function (batch) {
          gsap.from(batch, {
            y: isMobile ? 22 : 36,
            opacity: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: EASE_OUT,
            overwrite: true,
          });
        },
        once: true,
      });
    });

    if (isTouch) return;

    document.querySelectorAll(".gr2-bs__card").forEach(function (card) {
      if (card.dataset.gr2HoverBound) return;
      card.dataset.gr2HoverBound = "true";
      card.classList.add("gr2-motion-card");

      var img = card.querySelector(".gr2-bs__media img");
      var btn = card.querySelector(".gr2-bs__cart-btn");

      card.addEventListener("mouseenter", function () {
        gsap.to(card, { y: -4, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1.05, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
        if (btn) gsap.to(btn, { y: -1, duration: 0.35, ease: EASE_SMOOTH, overwrite: "auto" });
      });

      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
        if (btn) gsap.to(btn, { y: 0, duration: 0.35, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  /* ── Grooming tools (promo) ── */

  function initPromoMotion() {
    var section = document.querySelector(".gr2-promo");
    if (!section || prefersReduced) return;

    var copy = section.querySelector(".gr2-promo__copy");
    var subtitle = section.querySelector(".gr2-promo__subtitle");
    var banner = section.querySelector(".gr2-promo__banner");
    var bannerImg = banner ? banner.querySelector("img") : null;

    if (subtitle && !subtitle.dataset.gr2MotionSub) {
      subtitle.dataset.gr2MotionSub = "true";
      gsap.from(subtitle, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        delay: 0.15,
      });
    }

    if (banner && !banner.dataset.gr2MotionBanner) {
      banner.dataset.gr2MotionBanner = "true";

      var glow = document.createElement("div");
      glow.className = "gr2-motion-glow";
      glow.setAttribute("aria-hidden", "true");
      banner.appendChild(glow);

      gsap.from(banner, {
        y: isMobile ? 32 : 52,
        opacity: 0,
        duration: 1,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (bannerImg) {
        bannerImg.classList.add("gr2-motion-float");
        gsap.to(bannerImg, {
          y: -10,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.to(glow, {
          scale: 1.08,
          opacity: 0.85,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }

  }

  /* ── Feature banner grid ── */

  function initSgridMotion() {
    var section = document.querySelector(".gr2-sgrid");
    if (!section || prefersReduced) return;

    var cards = section.querySelectorAll(".gr2-sgrid__card");
    cards.forEach(function (card, index) {
      if (card.dataset.gr2MotionSgrid) return;
      card.dataset.gr2MotionSgrid = "true";

      var fromX = index % 2 === 0 ? (isMobile ? 0 : -36) : isMobile ? 0 : 36;

      gsap.from(card, {
        x: fromX,
        y: isMobile ? 24 : 40,
        opacity: 0,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    if (isTouch) return;

    cards.forEach(function (card) {
      if (card.dataset.gr2HoverBound) return;
      card.dataset.gr2HoverBound = "true";
      card.classList.add("gr2-motion-card");

      var img = card.querySelector("img");
      card.addEventListener("mouseenter", function () {
        gsap.to(card, { y: -4, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1.04, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  /* ── Skin care promo duo ── */

  function initPromoDuoMotion() {
    var section = document.querySelector(".gr2-promo-duo");
    if (!section || prefersReduced) return;

    section.querySelectorAll(".gr2-promo-duo__card").forEach(function (card, index) {
      if (card.dataset.gr2MotionDuo) return;
      card.dataset.gr2MotionDuo = "true";

      var img = card.querySelector("img");

      gsap.from(card, {
        y: isMobile ? 28 : 48,
        opacity: 0,
        duration: 0.95,
        ease: EASE_OUT,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      if (img) {
        img.classList.add("gr2-motion-float");
        gsap.to(img, {
          y: index === 0 ? -8 : -6,
          duration: 2.8 + index * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      ScrollTrigger.create({
        trigger: card,
        start: "top 78%",
        once: true,
        onEnter: function () {
          if (card.dataset.gr2ShineDone) return;
          card.dataset.gr2ShineDone = "true";

          var shine = document.createElement("span");
          shine.className = "gr2-motion-shine";
          shine.setAttribute("aria-hidden", "true");

          var bar = document.createElement("span");
          bar.setAttribute("aria-hidden", "true");
          bar.style.cssText =
            "position:absolute;top:-20%;left:0;width:35%;height:140%;background:linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.06) 42%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0.06) 58%,transparent 100%);transform:translateX(-120%) skewX(-18deg);will-change:transform;pointer-events:none;";
          shine.appendChild(bar);
          card.appendChild(shine);

          gsap.to(bar, { x: "380%", duration: 1.75, ease: EASE_SMOOTH });
        },
      });
    });
  }

  /* ── Trust / Why choose us ── */

  function initTrustMotion() {
    var section = document.querySelector(".gr2-trust");
    if (!section || prefersReduced) return;

    var cards = section.querySelectorAll(".gr2-trust__card");

    ScrollTrigger.batch(cards, {
      start: "top 90%",
      onEnter: function (batch) {
        batch.forEach(function (card, i) {
          var icon = card.querySelector(".gr2-trust__icon");
          gsap.from(card, {
            y: isMobile ? 24 : 40,
            opacity: 0,
            scale: 0.98,
            duration: 0.85,
            delay: i * 0.08,
            ease: EASE_OUT,
            overwrite: true,
          });
          if (icon) {
            gsap.from(icon, {
              scale: 0.85,
              opacity: 0,
              duration: 0.7,
              delay: i * 0.08 + 0.1,
              ease: EASE_OUT,
              overwrite: true,
            });
          }
        });
      },
      once: true,
    });

    if (isTouch) return;

    cards.forEach(function (card) {
      if (card.dataset.gr2HoverBound) return;
      card.dataset.gr2HoverBound = "true";
      card.classList.add("gr2-motion-card");

      card.addEventListener("mouseenter", function () {
        gsap.to(card, { y: -3, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  /* ── Brand banner ── */

  function initBrandBannerMotion() {
    var section = document.querySelector(".gr2-brand-banner");
    if (!section || prefersReduced) return;

    var frame = section.querySelector(".gr2-brand-banner__frame");
    if (!frame || frame.dataset.gr2MotionBrand) return;
    frame.dataset.gr2MotionBrand = "true";

    gsap.from(frame, {
      y: isMobile ? 28 : 44,
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* ── Reviews ── */

  function initReviewsMotion() {
    var section = document.querySelector("[data-gr2-reviews]");
    if (!section || prefersReduced) return;

    if (!section.dataset.gr2MotionReviews) {
      section.dataset.gr2MotionReviews = "true";

      gsap.from(section, {
        y: isMobile ? 24 : 36,
        opacity: 0,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var firstGroup = section.querySelector(".gr2-reviews__group:not(.gr2-reviews__group--clone)");
    if (!firstGroup) return;

    ScrollTrigger.batch(firstGroup.querySelectorAll(".gr2-reviews__card"), {
      start: "top 92%",
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: EASE_OUT,
          overwrite: true,
        });
      },
      once: true,
    });
  }

  /* ── Footer ── */

  function initFooterMotion() {
    var footer = document.querySelector(".gr2-footer");
    if (!footer || prefersReduced) return;
    if (footer.dataset.gr2MotionFooter) return;
    footer.dataset.gr2MotionFooter = "true";

    var items = footer.querySelectorAll(
      ".gr2-footer__top, .gr2-footer__col, .gr2-footer__aside"
    );

    gsap.from(items, {
      y: isMobile ? 20 : 32,
      opacity: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: footer,
        start: "top 92%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* ── Header & micro interactions ── */

  function initHeaderMotion() {
    if (prefersReduced || document.body.dataset.gr2HeaderMotion) return;
    document.body.dataset.gr2HeaderMotion = "true";

    gsap.from(".gr2-header__main-left, .gr2-header__main-right", {
      y: -14,
      opacity: 0,
      duration: 0.85,
      ease: EASE_OUT,
      delay: 0.08,
      stagger: 0.07,
      clearProps: "transform,opacity",
    });

    gsap.utils.toArray(".gr2-header__icon-btn, .gr2-header__menu-toggle").forEach(function (icon) {
      icon.addEventListener("mouseenter", function () {
        gsap.to(icon, { scale: 1.08, duration: 0.32, ease: EASE_SMOOTH, overwrite: "auto" });
      });
      icon.addEventListener("mouseleave", function () {
        gsap.to(icon, { scale: 1, duration: 0.32, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  function initMicroInteractions() {
    if (prefersReduced || isTouch) return;

    var btnSelectors =
      ".gr2-bs__cart-btn, .gr2-footer__app-btn, .gr2-pdp__cart-btn, .gr2-pdp__buy-btn, .gr2-pdp-reviews__write";

    document.querySelectorAll(btnSelectors).forEach(function (btn) {
      if (btn.dataset.gr2BtnMotion) return;
      btn.dataset.gr2BtnMotion = "true";
      btn.classList.add("gr2-motion-btn", "gr2-motion-btn--dark");

      btn.addEventListener("mouseenter", function () {
        if (btn.disabled) return;
        gsap.to(btn, { scale: 1.02, duration: 0.32, ease: EASE_SMOOTH, overwrite: "auto" });
      });
      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, { scale: 1, duration: 0.38, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });

    document.querySelectorAll(".gr2-header__nav-list a, .gr2-footer__links a").forEach(function (link) {
      if (link.dataset.gr2LinkMotion) return;
      link.dataset.gr2LinkMotion = "true";
      link.classList.add("gr2-motion-link");
    });
  }

  /* ── Shop & PDP ── */

  function initShopPage() {
    if (prefersReduced) return;

    var grid = document.querySelector(".gr2-shop__grid");
    if (!grid) return;

    gsap.from(".gr2-shop__crumbs, .gr2-shop__head", {
      y: 28,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: EASE_OUT,
    });

    ScrollTrigger.batch(grid.querySelectorAll(".gr2-shop__card"), {
      start: "top 92%",
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 32,
          opacity: 0,
          duration: 0.75,
          stagger: 0.06,
          ease: EASE_OUT,
          overwrite: true,
        });
      },
      once: true,
    });

    if (isTouch) return;

    grid.querySelectorAll(".gr2-shop__card").forEach(function (card) {
      if (card.dataset.gr2HoverBound) return;
      card.dataset.gr2HoverBound = "true";
      card.classList.add("gr2-motion-card");

      var img = card.querySelector(".gr2-shop__media img");
      card.addEventListener("mouseenter", function () {
        gsap.to(card, { y: -4, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1.05, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, duration: 0.45, ease: EASE_SMOOTH, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1, duration: 0.55, ease: EASE_SMOOTH, overwrite: "auto" });
      });
    });
  }

  function initPdpPage() {
    if (prefersReduced || !document.querySelector(".gr2-pdp")) return;
    if (document.body.dataset.gr2PdpMotion) return;
    document.body.dataset.gr2PdpMotion = "true";

    gsap.from(".gr2-pdp__gallery", {
      x: isMobile ? 0 : -32,
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
    });

    gsap.from(".gr2-pdp__info > *", {
      x: isMobile ? 0 : 32,
      opacity: 0,
      duration: 0.85,
      stagger: 0.07,
      ease: EASE_OUT,
      delay: 0.08,
    });

    var mainImg = document.querySelector("[data-gr2-pdp-image]");
    if (mainImg) {
      mainImg.classList.add("gr2-motion-float");
      gsap.to(mainImg, {
        y: -6,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /* ── Section depth scroll ── */

  function initSectionDepth() {
    if (prefersReduced || isMobile) return;

    motionBlocks.forEach(function (block, index) {
      if (block.classList.contains("gr2-hero")) return;

      if (index > 0) {
        gsap.fromTo(
          block,
          { y: 24 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "top 58%",
              scrub: 0.75,
            },
          }
        );
      }
    });
  }

  /* ── Boot ── */

  function killMotion() {
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill();
    });
  }

  function refreshDynamicMotion() {
    initProductMotion();
    initReviewsMotion();
    initShopPage();
    initMicroInteractions();
    ScrollTrigger.refresh();
  }

  function boot(isRefresh) {
    if (isRefresh) {
      killMotion();
      destroySplits();
    }

    if (!initialized) {
      prepareMotionBlocks();
      initLenis();
      initHeaderMotion();
    } else {
      prepareMotionBlocks();
    }

    tagParallaxTargets();
    initSplitHeadings();
    initHeroMotion();
    initCharReveals();
    initCategoryMotion();
    initProductMotion();
    initPromoMotion();
    initSgridMotion();
    initPromoDuoMotion();
    initTrustMotion();
    initBrandBannerMotion();
    initReviewsMotion();
    initFooterMotion();
    initParallax();
    initSectionDepth();
    initShopPage();
    initPdpPage();
    initMicroInteractions();

    ScrollTrigger.refresh();
    initialized = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot(false);
    });
  } else {
    boot(false);
  }

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", function () {
    ScrollTrigger.refresh();
  });

  window.addEventListener("gr2:motion-refresh", function () {
    window.setTimeout(refreshDynamicMotion, 80);
  });
})();
