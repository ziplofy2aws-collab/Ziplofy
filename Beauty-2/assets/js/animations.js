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

  function onMediaChange() {
    isMobile = mobileQuery.matches;
    intensity = isMobile ? 0.5 : 1;
    ScrollTrigger.refresh();
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", onMediaChange);
  }

  var easeLux = "power3.out";
  var easeSoft = "power2.inOut";
  var dur = prefersReduced ? 0.01 : 0.9 * intensity + 0.4;

  function dist(value) {
    return value * intensity;
  }

  function altX(section) {
    var sections = document.querySelectorAll("#main-content > section");
    var index = Array.prototype.indexOf.call(sections, section);
    return index % 2 === 0 ? dist(-24) : dist(24);
  }

  function revealTrigger(el, vars, opts) {
    opts = opts || {};
    if (!el) return;

    var opacityOnly = opts.opacityOnly === true;
    var from = opacityOnly
      ? { autoAlpha: 0 }
      : Object.assign(
          {
            autoAlpha: 0,
            y: dist(opts.y || 40),
            scale: opts.scale !== undefined ? opts.scale : 0.98,
          },
          opts.from || {}
        );
    var to = opacityOnly
      ? { autoAlpha: 1, duration: dur, ease: easeLux }
      : Object.assign(
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: dur,
            ease: easeLux,
          },
          vars || {}
        );

    if (prefersReduced) {
      gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
      return;
    }

    gsap.set(el, from);
    gsap.to(el, Object.assign(to, {
      scrollTrigger: {
        trigger: opts.trigger || el,
        start: opts.start || "top 88%",
        once: true,
        invalidateOnRefresh: true,
      },
      onComplete: function () {
        if (opacityOnly || opts.preserveTransform) {
          gsap.set(el, { clearProps: "transform" });
        }
      },
    }));
  }

  function staggerReveal(items, opts) {
    opts = opts || {};
    if (!items.length) return;

    if (prefersReduced) {
      gsap.set(items, { autoAlpha: 1, clearProps: "transform" });
      return;
    }

    gsap.set(items, {
      autoAlpha: 0,
      y: dist(opts.y || 36),
      scale: opts.scale !== undefined ? opts.scale : 0.97,
      x: opts.x ? dist(opts.x) : 0,
    });

    gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: dur,
      ease: easeLux,
      stagger: opts.stagger || 0.1,
      scrollTrigger: {
        trigger: opts.trigger,
        start: opts.start || "top 85%",
        once: true,
      },
    });
  }

  /* ── Lenis smooth scroll ── */
  var lenis = null;

  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: isMobile ? 1.1 : 1.35,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: isMobile ? 1.2 : 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Custom cursor ── */
  function initCursor() {
    if (prefersReduced || isTouch) return;

    var cursor = document.querySelector(".lux-cursor");
    if (!cursor) return;

    var dot = cursor.querySelector(".lux-cursor__dot");
    var ring = cursor.querySelector(".lux-cursor__ring");
    if (!dot || !ring) return;

    document.body.classList.add("lux-cursor-active");

    var mouse = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var ringPos = { x: 0, y: 0 };

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: 0, y: 0 });

    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      cursor.classList.add("is-visible");
    });

    gsap.ticker.add(function () {
      pos.x += (mouse.x - pos.x) * 0.22;
      pos.y += (mouse.y - pos.y) * 0.22;
      ringPos.x += (mouse.x - ringPos.x) * 0.12;
      ringPos.y += (mouse.y - ringPos.y) * 0.12;

      gsap.set(dot, { x: pos.x, y: pos.y });
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
    });

    var hoverTargets = [
      "a",
      "button",
      ".boj-kedit__card",
      ".boj-concern__card",
      ".boj-trending__card",
      ".boj-kbeauty__card",
      ".boj-ingredient__card",
      ".boj-reviews__card",
      ".boj-kedit__cart",
      ".boj-footer__submit",
    ].join(",");

    document.querySelectorAll(hoverTargets).forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-hovering");
        gsap.to(ring, {
          scale: 1.55,
          opacity: 0.75,
          duration: 0.45,
          ease: easeLux,
        });
        gsap.to(dot, { scale: 0.6, duration: 0.35, ease: easeLux });
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hovering");
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.45, ease: easeLux });
        gsap.to(dot, { scale: 1, duration: 0.35, ease: easeLux });
      });
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-visible");
    });
  }

  /* ── Micro-interactions ── */
  function initMicroInteractions() {
    var buttons = document.querySelectorAll(
      ".boj-kedit__cart, .boj-footer__submit, .boj-concern__arrow, .boj-kedit__arrow, .boj-ingredient__arrow, .boj-reviews__arrow, .boj-promo__dot"
    );
    buttons.forEach(function (btn) {
      btn.classList.add("lux-btn");
    });

    var links = document.querySelectorAll(
      ".boj-header__nav-link, .boj-header__mobile-link, .boj-footer__links a:not(.boj-footer__social a)"
    );
    links.forEach(function (link) {
      link.classList.add("lux-link");
    });

    var cards = document.querySelectorAll(
      ".boj-concern__card, .boj-kedit__card, .boj-reviews__card"
    );
    cards.forEach(function (card) {
      card.classList.add("lux-card-hover");
    });

    var imgCards = document.querySelectorAll(
      ".boj-concern__card-media, .boj-kedit__media, .boj-trending__card, .boj-kbeauty__card, .boj-ingredient__media"
    );
    imgCards.forEach(function (wrap) {
      wrap.classList.add("lux-img-zoom");
    });

    var icons = document.querySelectorAll(
      ".boj-header__action, .boj-kedit__wish, .boj-footer__social a"
    );
    icons.forEach(function (el) {
      el.classList.add("lux-icon-hover");
    });

    if (prefersReduced) return;

    document.querySelectorAll(".boj-concern__card").forEach(function (card) {
      var icon = card.querySelector(".boj-concern__card-media img");
      if (!icon) return;
      card.addEventListener("mouseenter", function () {
        gsap.to(icon, { scale: 1.04, duration: 0.55, ease: easeLux });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(icon, { scale: 1, duration: 0.55, ease: easeLux });
      });
    });
  }

  /* ── Page load ── */
  function initPageLoad() {
    var hero = document.querySelector(".boj-hero");
    if (!hero) return;

    document.body.classList.add("lux-loading");

    var blobs = document.querySelectorAll(".lux-hero__blob");
    var glow = document.querySelector(".lux-hero__glow");
    var activeSlide = hero.querySelector(".boj-hero__slide.is-active img");
    var arrows = hero.querySelectorAll(".boj-hero__arrow");
    var headerParts = document.querySelectorAll(
      ".boj-header__announce--desktop, .boj-header__announce-mobile, .boj-header__main"
    );
    var mobileNav = document.querySelector(".boj-header__mobile");
    var menuOverlay = document.querySelector("[data-boj-menu-overlay]");

    if (mobileNav) {
      gsap.set(mobileNav, { clearProps: "transform,x,y,opacity,visibility" });
    }
    if (menuOverlay) {
      gsap.set(menuOverlay, { clearProps: "transform,x,y,opacity,visibility" });
    }

    if (prefersReduced) {
      document.body.classList.remove("lux-loading");
      heroLoadComplete = true;
      gsap.set(headerParts, { clearProps: "all" });
      gsap.set(arrows, { clearProps: "transform" });
      return;
    }

    var tl = gsap.timeline({
      defaults: { ease: easeLux },
      onComplete: function () {
        document.body.classList.remove("lux-loading");
        heroLoadComplete = true;
        gsap.set(headerParts, { clearProps: "transform" });
        gsap.set(arrows, { clearProps: "transform" });
      },
    });

    if (headerParts.length) {
      tl.set(headerParts, { autoAlpha: 0 })
        .to(
          headerParts,
          { autoAlpha: 1, duration: 1 * intensity + 0.2, stagger: 0.06 },
          0.15
        );
    }

    if (activeSlide) {
      gsap.set(activeSlide, { scale: 1.1, autoAlpha: 0 });
      tl.to(
        activeSlide,
        { scale: 1, autoAlpha: 1, duration: 1.2 * intensity + 0.3 },
        0.35
      );
    }

    if (blobs.length) {
      tl.fromTo(
        blobs,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 1.4, stagger: 0.15 },
        0.5
      );
    }

    if (glow) {
      tl.fromTo(
        glow,
        { autoAlpha: 0, scale: 0.95 },
        { autoAlpha: 1, scale: 1, duration: 1.2 },
        0.6
      );
    }

    if (arrows.length) {
      gsap.set(arrows, { autoAlpha: 0 });
      tl.to(arrows, { autoAlpha: 1, duration: 0.7, stagger: 0.12 }, 0.85);
    }
  }

  var heroLoadComplete = false;

  /* ── Hero scroll animations ── */
  function initHeroScroll() {
    var hero = document.querySelector(".boj-hero");
    if (!hero || prefersReduced) return;

    var blobs = hero.querySelectorAll(".lux-hero__blob");
    var glow = hero.querySelector(".lux-hero__glow");
    var activeImg = function () {
      return hero.querySelector(".boj-hero__slide.is-active img");
    };

    if (!isMobile && blobs.length) {
      blobs.forEach(function (blob, i) {
        gsap.to(blob, {
          y: dist(i % 2 === 0 ? -40 : 30),
          x: dist(i % 2 === 0 ? 20 : -15),
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }

    if (!isMobile && glow) {
      gsap.to(glow, {
        y: dist(-25),
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(glow, {
        x: "8%",
        y: "5%",
        duration: 4,
        ease: easeSoft,
        repeat: -1,
        yoyo: true,
      });
    }

    var floatImg = activeImg();
    if (floatImg) {
      gsap.to(floatImg, {
        y: dist(-8),
        duration: 2.8,
        ease: easeSoft,
        repeat: -1,
        yoyo: true,
      });
    }

    hero.querySelectorAll("[data-boj-hero-slide]").forEach(function (slide) {
      var img = slide.querySelector("img");
      if (!img) return;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName !== "class") return;
          if (!heroLoadComplete) return;
          if (!slide.classList.contains("is-active")) return;

          gsap.killTweensOf(img, "y");
          gsap.fromTo(
            img,
            { scale: 1.08, autoAlpha: 0.7 },
            { scale: 1, autoAlpha: 1, duration: 1.1 * intensity + 0.2, ease: easeLux }
          );
          gsap.to(img, {
            y: dist(-8),
            duration: 2.8,
            ease: easeSoft,
            repeat: -1,
            yoyo: true,
            delay: 1,
          });
        });
      });

      observer.observe(slide, { attributes: true });
    });
  }

  /* ── Title word reveals ── */
  function initTitleReveals() {
    var titles = document.querySelectorAll(
      "#main-content h2[class$='__title']"
    );

    titles.forEach(function (title) {
      var words = title.textContent.trim().split(/\s+/);
      if (!words.length) return;

      title.textContent = "";
      title.setAttribute("aria-label", words.join(" "));

      words.forEach(function (word, i) {
        var wrap = document.createElement("span");
        wrap.className = "lux-title-word";
        wrap.style.display = "inline-block";
        wrap.style.overflow = "hidden";
        wrap.style.verticalAlign = "top";

        var inner = document.createElement("span");
        inner.textContent = word + (i < words.length - 1 ? "\u00a0" : "");
        inner.style.display = "inline-block";
        wrap.appendChild(inner);
        title.appendChild(wrap);

        if (prefersReduced) {
          gsap.set(inner, { clearProps: "all" });
          return;
        }

        gsap.set(inner, { y: "110%", autoAlpha: 0 });
        gsap.to(inner, {
          y: "0%",
          autoAlpha: 1,
          duration: dur,
          ease: easeLux,
          delay: i * 0.06,
          scrollTrigger: {
            trigger: title.closest("section") || title,
            start: "top 88%",
            once: true,
          },
        });
      });
    });
  }

  /* ── Section reveals (alternating) ── */
  function initSectionReveals() {
    var sections = document.querySelectorAll("#main-content > section:not(.boj-hero)");
    sections.forEach(function (section, index) {
      if (section.hasAttribute("data-boj-concern") ||
          section.hasAttribute("data-boj-kedit") ||
          section.hasAttribute("data-boj-promo") ||
          section.hasAttribute("data-boj-ingredient") ||
          section.hasAttribute("data-boj-reviews") ||
          section.classList.contains("boj-trending") ||
          section.classList.contains("boj-kbeauty")) {
        return;
      }

      var inner =
        section.querySelector("[class$='__inner']") ||
        section.querySelector("[class$='__slider']") ||
        section;
      var fromX = index % 2 === 0 ? dist(-30) : dist(30);

      revealTrigger(inner, { delay: 0.08 }, {
        trigger: section,
        from: { x: fromX, y: dist(32), scale: 0.99 },
      });
    });
  }

  /* ── Concern / Benefits ── */
  function initConcern() {
    var section = document.querySelector("[data-boj-concern]");
    if (!section) return;

    var cards = section.querySelectorAll(".boj-concern__card");
    staggerReveal(cards, {
      trigger: section,
      y: dist(40),
      x: altX(section),
      stagger: 0.09,
    });

    var tabs = section.querySelectorAll(".boj-concern__tab");
    staggerReveal(tabs, {
      trigger: section.querySelector(".boj-concern__head"),
      y: dist(16),
      stagger: 0.08,
      scale: 1,
    });
  }

  /* ── K-Edit / Product showcase ── */
  function initKedit() {
    document.querySelectorAll("[data-boj-kedit]").forEach(function (section) {
      var cards = section.querySelectorAll(".boj-kedit__card");
      staggerReveal(cards, {
        trigger: section,
        y: dist(36),
        x: altX(section),
        stagger: 0.07,
      });

      if (prefersReduced || isMobile) return;

      cards.forEach(function (card) {
        var img = card.querySelector(".boj-kedit__media img");
        if (!img) return;

        gsap.to(img, {
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    });
  }

  /* ── Trending / Gallery ── */
  function initTrending() {
    var section = document.querySelector(".boj-trending");
    if (!section) return;

    var cards = section.querySelectorAll(".boj-trending__card");
    cards.forEach(function (card, i) {
      var img = card.querySelector("img");
      if (!img) return;

      var wrap = document.createElement("div");
      wrap.className = "lux-mask";
      img.parentNode.insertBefore(wrap, img);
      var inner = document.createElement("div");
      inner.className = "lux-mask__inner";
      wrap.appendChild(inner);
      inner.appendChild(img);

      if (prefersReduced) {
        gsap.set(inner, { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      gsap.set(inner, { autoAlpha: 0, scale: 1.05 });
      gsap.to(inner, {
        autoAlpha: 1,
        scale: 1,
        duration: dur + 0.1,
        ease: easeLux,
        delay: i * 0.08,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          once: true,
        },
      });
    });
  }

  /* ── Promo / Offer banner ── */
  function initPromo() {
    var section = document.querySelector("[data-boj-promo]");
    if (!section || prefersReduced) return;

    var slide = section.querySelector(".boj-promo__slide.is-active img");
    var dots = section.querySelectorAll(".boj-promo__dot");

    if (slide && !isMobile) {
      gsap.to(slide, {
        y: dist(20),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }

    revealTrigger(section.querySelector(".boj-promo__dots"), {}, {
      trigger: section,
      opacityOnly: true,
      preserveTransform: true,
    });
  }

  /* ── Ingredients ── */
  function initIngredients() {
    var section = document.querySelector("[data-boj-ingredient]");
    if (!section) return;

    var cards = section.querySelectorAll(".boj-ingredient__card");
    staggerReveal(cards, {
      trigger: section,
      y: dist(32),
      x: altX(section),
      stagger: 0.06,
    });

    if (prefersReduced || isMobile) return;

    var deco = section.querySelector(".lux-ingredient__deco");
    if (deco) {
      deco.querySelectorAll("span").forEach(function (el, i) {
        gsap.to(el, {
          y: dist(i % 2 === 0 ? -50 : 40),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });
    }

    cards.forEach(function (card, i) {
      var img = card.querySelector("img");
      if (!img) return;
      gsap.to(img, {
        y: dist((i % 3) - 1) * 15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2 + i * 0.1,
        },
      });
    });
  }

  /* ── K-Beauty gallery ── */
  function initKbeauty() {
    var section = document.querySelector(".boj-kbeauty");
    if (!section) return;

    var cards = section.querySelectorAll(".boj-kbeauty__card");
    staggerReveal(cards, {
      trigger: section,
      y: dist(40),
      x: altX(section),
      stagger: 0.12,
    });
  }

  /* ── Reviews / Testimonials + stats ── */
  function initReviews() {
    var section = document.querySelector("[data-boj-reviews]");
    if (!section) return;

    var stats = section.querySelector("[data-lux-stats]");
    var cards = section.querySelectorAll(".boj-reviews__card");

    if (stats) {
      revealTrigger(stats, {}, { trigger: section, y: dist(28) });
      initCounters(stats.querySelectorAll("[data-lux-count]"), section);
    }

    staggerReveal(cards, {
      trigger: section.querySelector(".boj-reviews__carousel"),
      y: dist(36),
      x: altX(section),
      stagger: 0.14,
    });

    if (prefersReduced) return;

    if (!isMobile && window.innerWidth > 992) {
      var track = section.querySelector("[data-boj-reviews-track]");
      if (track) {
        gsap.to(track, {
          x: dist(-12),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 2.5,
          },
        });
      }
    }
  }

  function initCounters(elements, triggerEl) {
    if (!elements.length || prefersReduced) return;

    elements.forEach(function (el) {
      var target = parseFloat(el.dataset.luxCount || "0");
      var suffix = el.dataset.luxSuffix || "";
      var prefix = el.dataset.luxPrefix || "";
      var decimals = parseInt(el.dataset.luxDecimals || "0", 10);
      var obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2 * intensity + 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: triggerEl,
          start: "top 80%",
          once: true,
        },
        onUpdate: function () {
          var formatted =
            decimals > 0
              ? obj.val.toFixed(decimals)
              : Math.round(obj.val).toLocaleString();
          el.textContent = prefix + formatted + suffix;
        },
      });
    });
  }

  /* ── Footer + Newsletter ── */
  function initFooter() {
    var footer = document.querySelector(".boj-footer");
    if (!footer) return;

    var top = footer.querySelector(".boj-footer__top");
    var columns = footer.querySelectorAll(".boj-footer__acc");
    var bottom = footer.querySelector(".boj-footer__bottom");
    var newsletter = footer.querySelector(".boj-footer__newsletter");
    var formEls = footer.querySelectorAll(".boj-footer__input, .boj-footer__submit");
    var submitBtn = footer.querySelector(".boj-footer__submit");
    if (submitBtn && !prefersReduced) {
      submitBtn.classList.add("lux-pulse-soft");
    }

    revealTrigger(top, {}, { trigger: footer, y: dist(32) });

    if (newsletter) {
      staggerReveal(
        newsletter.querySelectorAll(
          ".boj-footer__newsletter-title, .boj-footer__newsletter-text"
        ),
        { trigger: newsletter, y: dist(20), stagger: 0.1, scale: 1 }
      );
    }

    staggerReveal(formEls, {
      trigger: footer.querySelector(".boj-footer__form") || footer,
      y: dist(16),
      stagger: 0.12,
      scale: 1,
    });

    staggerReveal(columns, {
      trigger: footer.querySelector(".boj-footer__columns"),
      y: dist(28),
      stagger: 0.08,
    });

    revealTrigger(bottom, {}, { trigger: footer, y: dist(20), scale: 1 });

    if (prefersReduced || isMobile) return;

    footer.querySelectorAll(".lux-footer__glow").forEach(function (glow, i) {
      gsap.to(glow, {
        x: dist(i % 2 === 0 ? 30 : -25),
        y: dist(i % 2 === 0 ? -20 : 15),
        duration: 5 + i,
        ease: easeSoft,
        repeat: -1,
        yoyo: true,
      });
    });
  }

  /* ── Init ── */
  function init() {
    initLenis();
    initMicroInteractions();
    initPageLoad();
    initHeroScroll();
    initTitleReveals();
    initSectionReveals();
    initConcern();
    initKedit();
    initTrending();
    initPromo();
    initIngredients();
    initKbeauty();
    initReviews();
    initFooter();
    initCursor();

    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
