/**
 * watch-3 — consolidated site scripts
 * Modules: header | hero | icons | signature | banner-showcase | collection
 * Each block is an isolated IIFE to avoid name clashes.
 */

/* ========== Header ========== */
(function () {
  const header = document.querySelector("[data-w3-header]");
  if (!header) return;

  const announce = header.querySelector("[data-w3-announce]");
  const announceClose = header.querySelector("[data-w3-announce-close]");
  const menuToggle = header.querySelector("[data-w3-menu-toggle]");
  const menuClose = header.querySelector("[data-w3-menu-close]");
  const backdrop = header.querySelector("[data-w3-backdrop]");
  const drawer = header.querySelector("[data-w3-drawer]");
  const searchToggle = header.querySelector("[data-w3-search-toggle]");
  const searchPanel = header.querySelector("[data-w3-search-panel]");

  const ANNOUNCE_KEY = "w3-announce-dismissed";

  if (announce && localStorage.getItem(ANNOUNCE_KEY) === "1") {
    announce.classList.add("is-hidden");
  }

  announceClose?.addEventListener("click", () => {
    announce?.classList.add("is-hidden");
    localStorage.setItem(ANNOUNCE_KEY, "1");
  });

  function setMenuOpen(open) {
    header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("is-w3-locked", open);
    menuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    if (drawer) drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-menu-open"));
  });

  menuClose?.addEventListener("click", () => setMenuOpen(false));
  backdrop?.addEventListener("click", () => setMenuOpen(false));

  searchToggle?.addEventListener("click", () => {
    if (!searchPanel) return;
    const open = searchPanel.hasAttribute("hidden");
    if (open) {
      searchPanel.removeAttribute("hidden");
      searchToggle.setAttribute("aria-expanded", "true");
      searchPanel.querySelector("input")?.focus();
    } else {
      searchPanel.setAttribute("hidden", "");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      if (searchPanel && !searchPanel.hasAttribute("hidden")) {
        searchPanel.setAttribute("hidden", "");
        searchToggle?.setAttribute("aria-expanded", "false");
      }
    }
  });
})();

/* ========== Hero slider ========== */
(function () {
  const hero = document.querySelector("[data-w3-hero]");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".w3-hero__slide"));
  const prevBtn = hero.querySelector("[data-w3-hero-prev]");
  const nextBtn = hero.querySelector("[data-w3-hero-next]");
  const DELAY = 8000;
  let index = 0;
  let timer = null;

  if (!slides.length) return;

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function start() {
    stop();
    timer = window.setInterval(next, DELAY);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    start();
  }

  prevBtn?.addEventListener("click", () => {
    prev();
    restart();
  });

  nextBtn?.addEventListener("click", () => {
    next();
    restart();
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", (e) => {
    if (!hero.contains(e.relatedTarget)) start();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();

/* ========== Icons carousel ========== */
(function () {
  const section = document.querySelector("[data-w3-icons]");
  if (!section) return;

  const viewport = section.querySelector("[data-w3-icons-viewport]");
  const track = section.querySelector("[data-w3-icons-track]");
  const cards = Array.from(section.querySelectorAll("[data-w3-icons-card]"));
  const progress = section.querySelector("[data-w3-icons-progress]");
  if (!viewport || !track || !cards.length) return;

  let index = 0;
  let dragStartX = 0;
  let dragDelta = 0;
  let dragging = false;
  let didDrag = false;
  let trackStartX = 0;
  let activePointerId = null;

  function getVisibleCount() {
    if (window.matchMedia("(max-width: 560px)").matches) return 1.15;
    if (window.matchMedia("(max-width: 768px)").matches) return 2.2;
    if (window.matchMedia("(max-width: 1100px)").matches) return 3.2;
    return 4.25;
  }

  function getGap() {
    return parseFloat(getComputedStyle(track).gap) || 0;
  }

  function getStep() {
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - Math.floor(getVisibleCount()));
  }

  function updateProgress() {
    if (!progress) return;
    const max = getMaxIndex();
    const segments = max + 1;
    const width = 100 / segments;
    progress.style.width = width + "%";
    progress.style.left = (max === 0 ? 0 : (index / max) * (100 - width)) + "%";
  }

  function goTo(nextIndex, animate) {
    const max = getMaxIndex();
    index = Math.max(0, Math.min(nextIndex, max));
    track.style.transition = animate === false ? "none" : "transform 0.4s ease";
    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    updateProgress();
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, a")) return;
    dragging = true;
    didDrag = false;
    activePointerId = e.pointerId;
    dragStartX = e.clientX;
    dragDelta = 0;
    trackStartX = -index * getStep();
    track.style.transition = "none";
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch (_) {}
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragDelta = e.clientX - dragStartX;
    if (!didDrag && Math.abs(dragDelta) < 12) return;
    didDrag = true;
    track.style.transform = "translate3d(" + (trackStartX + dragDelta) + "px, 0, 0)";
  }

  function onPointerUp(e) {
    if (!dragging || (e && e.pointerId !== activePointerId)) return;
    dragging = false;
    activePointerId = null;
    const threshold = Math.min(60, getStep() * 0.2);
    if (didDrag) {
      if (dragDelta <= -threshold) goTo(index + 1);
      else if (dragDelta >= threshold) goTo(index - 1);
      else goTo(index);
    }
    dragDelta = 0;
  }

  // Only block navigation after a real swipe, not a normal click
  viewport.addEventListener(
    "click",
    function (e) {
      if (!didDrag) return;
      e.preventDefault();
      e.stopPropagation();
      didDrag = false;
    },
    true
  );

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  section.querySelectorAll("[data-w3-wish]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btn.querySelector("i");
      if (!icon) return;
      const active = icon.classList.toggle("fa-solid");
      icon.classList.toggle("fa-regular", !active);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(index, false), 120);
  });

  goTo(0, false);
})();

/* ========== Signature collection ========== */
(function () {
  const section = document.querySelector("[data-w3-signature]");
  if (!section) return;

  const viewport = section.querySelector("[data-w3-signature-viewport]");
  const track = section.querySelector("[data-w3-signature-track]");
  const cards = Array.from(section.querySelectorAll("[data-w3-signature-card]"));
  const prevBtn = section.querySelector("[data-w3-signature-prev]");
  const nextBtn = section.querySelector("[data-w3-signature-next]");
  if (!viewport || !track || !cards.length) return;

  let index = 0;

  function getVisibleCount() {
    if (window.matchMedia("(max-width: 560px)").matches) return 1;
    if (window.matchMedia("(max-width: 900px)").matches) return 2;
    return 4;
  }

  function getGap() {
    return parseFloat(getComputedStyle(track).gap) || 0;
  }

  function getStep() {
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function update() {
    const max = getMaxIndex();
    if (index > max) index = max;
    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  prevBtn?.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      update();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (index < getMaxIndex()) {
      index += 1;
      update();
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 120);
  });

  update();
})();

/* ========== Banner Showcase (GSAP / Lenis) ========== */
/**
 * =========================================================
 * Banner Showcase — mid-page scroll storytelling
 * Lenis + GSAP ScrollTrigger | No autoplay | Not a slider
 * =========================================================
 */
(function () {
  "use strict";

  var PANEL_COUNT = 3;

  function boot() {
    var root = document.querySelector("[data-banner-showcase]");
    if (!root) return;

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      window.setTimeout(boot, 40);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    initBannerShowcase(root);
  }

  function initBannerShowcase(root) {
    var pin = root.querySelector("[data-banner-showcase-pin]");
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-banner-panel]"));
    var rail = root.querySelector("[data-banner-rail]");
    var countEl = root.querySelector("[data-banner-count]");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!pin || panels.length < PANEL_COUNT) return;

    /* ---------- Lenis (single page instance) ---------- */
    initLenisOnce(reduced);

    /* ---------- Prepare typography splits ---------- */
    panels.forEach(function (panel) {
      var title = panel.querySelector("[data-banner-reveal='title']");
      if (title) splitTitle(title);
    });

    /* ---------- Initial panel states ---------- */
    panels.forEach(function (panel, i) {
      var first = i === 0;
      var mediaImg = panel.querySelector(".banner-showcase__media img");

      gsap.set(panel, {
        autoAlpha: first ? 1 : 0,
        clipPath: first ? "inset(0% 0 0% 0)" : "inset(100% 0 0% 0)",
        filter: first ? "blur(0px) brightness(1)" : "blur(8px) brightness(0.78)",
        zIndex: first ? 4 : 1,
      });

      if (mediaImg) {
        gsap.set(mediaImg, {
          scale: first ? 1 : 1.08,
          yPercent: first ? 0 : 6,
          transformOrigin: "50% 50%",
        });
      }

      setTextState(panel, first ? "in" : "out");
    });

    if (rail) gsap.set(rail, { scaleX: 1 / PANEL_COUNT, transformOrigin: "left center" });

    /* ---------- Master scrubbed timeline ---------- */
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        // ~2 viewport heights of pinned storytelling after first frame
        end: function () {
          return "+=" + window.innerHeight * 2;
        },
        pin: pin,
        pinSpacing: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          updateChrome(self.progress, rail, countEl);
        },
      },
    });

    // Banner 1 → 2
    addPanelTransition(tl, panels[0], panels[1], "a");
    // Brief cinematic hold
    tl.to({}, { duration: 0.22 });
    // Banner 2 → 3
    addPanelTransition(tl, panels[1], panels[2], "b");
    // Final settle
    var lastImg = panels[2].querySelector(".banner-showcase__media img");
    if (lastImg) {
      tl.to(lastImg, { scale: 1.02, duration: 0.4, ease: "none" }, ">-0.05");
    }

    /* ---------- Soft continuous parallax on active media ---------- */
    if (!reduced) {
      panels.forEach(function (panel) {
        var media = panel.querySelector("[data-banner-media]");
        if (!media) return;
        gsap.to(media, {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: function () {
              return "+=" + window.innerHeight * 2;
            },
            scrub: 1.4,
          },
        });
      });
    }

    refreshWhenReady(root);
  }

  /* =========================================================
     Panel transition — overlapping cinematic handoff
     ========================================================= */
  function addPanelTransition(tl, current, next, id) {
    var label = "banner-" + id;
    var dur = 1.25;
    var enterAt = label + "+=0.2";

    var cImg = current.querySelector(".banner-showcase__media img");
    var nImg = next.querySelector(".banner-showcase__media img");
    var cShade = current.querySelector(".banner-showcase__shade");
    var nShade = next.querySelector(".banner-showcase__shade");

    tl.addLabel(label);

    // Stage next under the current panel
    tl.set(
      next,
      {
        autoAlpha: 1,
        zIndex: 5,
        clipPath: "inset(100% 0 0% 0)",
        filter: "blur(8px) brightness(0.75)",
      },
      label
    );
    tl.set(current, { zIndex: 4 }, label);

    // --- Exit current ---
    tl.to(
      current,
      {
        clipPath: "inset(0 0 100% 0)",
        filter: "blur(6px) brightness(0.65)",
        duration: dur,
        ease: "power2.inOut",
      },
      label
    );

    if (cImg) {
      tl.to(
        cImg,
        {
          scale: 1.12,
          yPercent: -8,
          duration: dur,
          ease: "power3.inOut",
        },
        label
      );
    }

    if (cShade) {
      tl.to(cShade, { opacity: 0.55, duration: dur * 0.7, ease: "power1.in" }, label);
    }

    animateTextOut(tl, current, label);

    // --- Enter next (overlap) ---
    tl.to(
      next,
      {
        clipPath: "inset(0% 0 0% 0)",
        filter: "blur(0px) brightness(1)",
        duration: dur,
        ease: "power3.out",
      },
      enterAt
    );

    if (nImg) {
      tl.fromTo(
        nImg,
        { scale: 1.08, yPercent: 8 },
        {
          scale: 1,
          yPercent: 0,
          duration: dur,
          ease: "expo.out",
        },
        enterAt
      );
    }

    if (nShade) {
      tl.fromTo(nShade, { opacity: 0.35 }, { opacity: 1, duration: dur * 0.8, ease: "power2.out" }, enterAt);
    }

    animateTextIn(tl, next, enterAt);

    // Demote previous after blend
    tl.set(current, { autoAlpha: 0, zIndex: 1 }, label + "+=" + (dur + 0.08));
    tl.set(next, { zIndex: 4 }, label + "+=" + (dur + 0.08));
  }

  /* ---------- Text sequencing ---------- */
  function setTextState(panel, mode) {
    var sub = panel.querySelector("[data-banner-reveal='sub']");
    var desc = panel.querySelector("[data-banner-reveal='desc']");
    var cta = panel.querySelector("[data-banner-reveal='cta']");
    var words = panel.querySelectorAll(".banner-showcase__title .word");

    if (mode === "in") {
      if (sub) gsap.set(sub, { autoAlpha: 1, y: 0 });
      if (desc) gsap.set(desc, { autoAlpha: 1, y: 0 });
      if (cta) gsap.set(cta, { autoAlpha: 1, y: 0 });
      if (words.length) gsap.set(words, { autoAlpha: 1, yPercent: 0 });
    } else {
      if (sub) gsap.set(sub, { autoAlpha: 0, y: 16 });
      if (desc) gsap.set(desc, { autoAlpha: 0, y: 22 });
      if (cta) gsap.set(cta, { autoAlpha: 0, y: 26 });
      if (words.length) gsap.set(words, { autoAlpha: 0, yPercent: 110 });
    }
  }

  function animateTextOut(tl, panel, at) {
    var sub = panel.querySelector("[data-banner-reveal='sub']");
    var desc = panel.querySelector("[data-banner-reveal='desc']");
    var cta = panel.querySelector("[data-banner-reveal='cta']");
    var words = panel.querySelectorAll(".banner-showcase__title .word");

    if (cta) tl.to(cta, { autoAlpha: 0, y: -14, duration: 0.32, ease: "power2.in" }, at);
    if (desc) tl.to(desc, { autoAlpha: 0, y: -16, duration: 0.36, ease: "power2.in" }, at + "+=0.04");
    if (words.length) {
      tl.to(
        words,
        { autoAlpha: 0, yPercent: -70, duration: 0.42, stagger: 0.028, ease: "power3.in" },
        at + "+=0.06"
      );
    }
    if (sub) tl.to(sub, { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, at + "+=0.08");
  }

  function animateTextIn(tl, panel, at) {
    var sub = panel.querySelector("[data-banner-reveal='sub']");
    var desc = panel.querySelector("[data-banner-reveal='desc']");
    var cta = panel.querySelector("[data-banner-reveal='cta']");
    var words = panel.querySelectorAll(".banner-showcase__title .word");

    if (sub) {
      tl.fromTo(
        sub,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.48, ease: "power3.out" },
        at + "+=0.16"
      );
    }

    if (words.length) {
      tl.fromTo(
        words,
        { autoAlpha: 0, yPercent: 110 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.72,
          stagger: 0.04,
          ease: "expo.out",
        },
        at + "+=0.24"
      );
    }

    if (desc) {
      tl.fromTo(
        desc,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
        at + "+=0.44"
      );
    }

    if (cta) {
      tl.fromTo(
        cta,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power4.out" },
        at + "+=0.58"
      );
    }
  }

  /* ---------- Title split (lines + words) ---------- */
  function splitTitle(el) {
    var html = el.innerHTML;
    var parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map(function (part) {
        var text = part.replace(/<[^>]+>/g, "").trim();
        var words = text
          .split(/\s+/)
          .filter(Boolean)
          .map(function (w) {
            return '<span class="word">' + w + "</span>";
          })
          .join(" ");
        return '<span class="line">' + words + "</span>";
      })
      .join("");
  }

  /* ---------- UI chrome ---------- */
  function updateChrome(progress, rail, countEl) {
    if (rail) {
      var base = 1 / PANEL_COUNT;
      gsap.set(rail, { scaleX: base + progress * (1 - base) });
    }
    if (countEl) {
      var idx = Math.min(PANEL_COUNT, Math.max(1, Math.round(progress * (PANEL_COUNT - 1)) + 1));
      countEl.textContent = String(idx).padStart(2, "0");
    }
  }

  /* ---------- Lenis once ---------- */
  function initLenisOnce(reduced) {
    if (reduced) return;
    if (window.__w3Lenis) return;

    var LenisCtor = window.Lenis;
    if (typeof LenisCtor !== "function") return;

    var lenis = new LenisCtor({
      duration: 1.3,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    window.__w3Lenis = lenis;
  }

  function refreshWhenReady(root) {
    var imgs = root.querySelectorAll("img");
    var pending = imgs.length;
    var done = function () {
      pending -= 1;
      if (pending <= 0) ScrollTrigger.refresh();
    };
    imgs.forEach(function (img) {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    }, { once: true });
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot, { once: true });
})();

/* ========== New Collection carousel ========== */
/**
 * New Collection carousel — move one card at a time (9 cards)
 */
(function () {
  "use strict";

  var section = document.querySelector("[data-w3-collection]");
  if (!section) return;

  var viewport = section.querySelector("[data-w3-collection-viewport]");
  var track = section.querySelector("[data-w3-collection-track]");
  var cards = Array.prototype.slice.call(section.querySelectorAll("[data-w3-collection-card]"));
  var prevBtn = section.querySelector("[data-w3-collection-prev]");
  var nextBtn = section.querySelector("[data-w3-collection-next]");

  if (!viewport || !track || !cards.length) return;

  var index = 0;

  function getVisibleCount() {
    if (window.matchMedia("(max-width: 560px)").matches) return 1;
    if (window.matchMedia("(max-width: 820px)").matches) return 2;
    if (window.matchMedia("(max-width: 1100px)").matches) return 3;
    return 4;
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 0;
  }

  function getStep() {
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function update() {
    var max = getMaxIndex();
    if (index > max) index = max;
    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  prevBtn &&
    prevBtn.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        update();
      }
    });

  nextBtn &&
    nextBtn.addEventListener("click", function () {
      if (index < getMaxIndex()) {
        index += 1;
        update();
      }
    });

  // Wishlist toggle
  section.querySelectorAll("[data-wish]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var icon = btn.querySelector("i");
      var active = btn.classList.toggle("is-active");
      if (icon) {
        icon.classList.toggle("fa-solid", active);
        icon.classList.toggle("fa-regular", !active);
      }
      btn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    });
  });

  // Swatch active state
  section.querySelectorAll(".w3-collection__swatches").forEach(function (group) {
    group.querySelectorAll(".w3-collection__swatch").forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        group.querySelectorAll(".w3-collection__swatch").forEach(function (s) {
          s.classList.remove("is-active");
        });
        swatch.classList.add("is-active");
      });
    });
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(update, 120);
  });

  update();
})();

/* ========== Shop filter drawer ========== */
(function () {
  var shop = document.querySelector("[data-w3-shop]");
  var filter = document.querySelector("[data-w3-filter]");
  if (!shop || !filter) return;

  var openBtn = document.querySelector("[data-w3-filter-open]");
  var closeEls = filter.querySelectorAll("[data-w3-filter-close]");
  var clearBtn = filter.querySelector("[data-w3-filter-clear]");
  var applyBtn = filter.querySelector("[data-w3-filter-apply]");
  var countEl = filter.querySelector("[data-w3-filter-count]");
  var cats = Array.from(filter.querySelectorAll("[data-filter-cat]"));
  var panes = Array.from(filter.querySelectorAll("[data-pane]"));
  var empty = shop.querySelector("[data-w3-shop-empty]");
  var cards = Array.from(shop.querySelectorAll(".w3-collection__card"));

  function setOpen(open) {
    filter.classList.toggle("is-open", open);
    filter.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("is-w3-filter-open", open);
    openBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) updatePreviewCount();
  }

  function switchCat(id) {
    cats.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-filter-cat") === id);
    });
    panes.forEach(function (pane) {
      var active = pane.getAttribute("data-pane") === id;
      pane.classList.toggle("is-active", active);
      if (active) pane.removeAttribute("hidden");
      else pane.setAttribute("hidden", "");
    });
  }

  function selectedValues(name) {
    return Array.from(filter.querySelectorAll('input[name="' + name + '"]:checked')).map(function (el) {
      return el.value;
    });
  }

  function unique(list) {
    return Array.from(new Set(list));
  }

  function matchesCard(card) {
    var gender = unique(selectedValues("gender"));
    var badge = unique(selectedValues("badge"));
    var type = unique(selectedValues("type"));
    var collection = unique(selectedValues("collection"));
    var brand = unique(selectedValues("brand"));
    var movement = unique(selectedValues("movement"));
    var stock = unique(selectedValues("stock"));
    var discounted = unique(selectedValues("discounted"));
    var priceRanges = unique(selectedValues("price"));

    if (gender.length && gender.indexOf(card.getAttribute("data-gender") || "") === -1) return false;
    if (badge.length && badge.indexOf(card.getAttribute("data-badge") || "") === -1) return false;
    if (type.length && type.indexOf(card.getAttribute("data-type") || "") === -1) return false;
    if (collection.length && collection.indexOf(card.getAttribute("data-collection") || "") === -1) return false;
    if (brand.length && brand.indexOf(card.getAttribute("data-brand") || "") === -1) return false;
    if (movement.length && movement.indexOf(card.getAttribute("data-movement") || "") === -1) return false;
    if (stock.length && stock.indexOf(card.getAttribute("data-stock") || "") === -1) return false;
    if (discounted.length && discounted.indexOf(card.getAttribute("data-discounted") || "") === -1) return false;

    if (priceRanges.length) {
      var price = Number(card.getAttribute("data-price") || 0);
      var ok = priceRanges.some(function (range) {
        var parts = range.split("-");
        var min = Number(parts[0]);
        var max = Number(parts[1]);
        return price >= min && price <= max;
      });
      if (!ok) return false;
    }

    return true;
  }

  function countMatches() {
    return cards.filter(matchesCard).length;
  }

  function updatePreviewCount() {
    if (countEl) countEl.textContent = String(countMatches());
  }

  function applyToGrid() {
    var visible = 0;
    cards.forEach(function (card) {
      var show = matchesCard(card);
      card.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (empty) empty.classList.toggle("is-visible", visible === 0);
    if (countEl) countEl.textContent = String(visible);
    return visible;
  }

  function clearFilters() {
    filter.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.checked = false;
    });
    cards.forEach(function (card) {
      card.classList.remove("is-filtered-out");
    });
    if (empty) empty.classList.remove("is-visible");
    if (countEl) countEl.textContent = String(cards.length);
  }

  openBtn?.addEventListener("click", function () {
    setOpen(true);
  });

  closeEls.forEach(function (el) {
    el.addEventListener("click", function () {
      setOpen(false);
    });
  });

  cats.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchCat(btn.getAttribute("data-filter-cat"));
    });
  });

  filter.addEventListener("change", function (e) {
    if (!(e.target && e.target.matches('input[type="checkbox"]'))) return;
    applyToGrid();
  });

  clearBtn?.addEventListener("click", function () {
    clearFilters();
  });

  applyBtn?.addEventListener("click", function () {
    applyToGrid();
    setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && filter.classList.contains("is-open")) {
      setOpen(false);
    }
  });
})();

/* ========== Product catalog + card links ========== */
(function () {
  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function genderLabel(value) {
    var map = {
      men: "MEN",
      women: "WOMEN",
      unisex: "UNISEX",
      couple: "COUPLE",
      kids: "KIDS",
    };
    return map[String(value || "").toLowerCase()] || "MEN";
  }

  window.W3_PRODUCTS = {
    "starboard-rosegold": {
      id: "starboard-rosegold",
      name: "Starboard Rosegold",
      brand: "EXBUYER",
      image: "assets/img/NA-1.webp",
      images: [
        "assets/img/NA-1.webp",
        "assets/img/NA-2.webp",
        "assets/img/NA-3.webp",
        "assets/img/NA-4.webp",
        "assets/img/NA-5.webp",
        "assets/img/NA-6.webp",
        "assets/img/NA-7.webp",
        "assets/img/NL-2.png",
      ],
      priceNow: "Rs. 1899.00",
      priceWas: "Rs. 3049.00",
      rating: "4.84",
      reviews: 19,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Premium Design, Day & Date Functionality, Quartz Movement, Durable Build, Everyday Luxury",
      colors: [
        { name: "Rosegold", image: "assets/img/NA-1.webp" },
        { name: "Electric Blue", image: "assets/img/NA-2.webp" },
      ],
    },
    "chrono-elite-automatic": {
      id: "chrono-elite-automatic",
      name: "Chrono Elite Automatic",
      brand: "EXBUYER",
      image: "assets/img/NA-1.webp",
      images: ["assets/img/NA-1.webp", "assets/img/NA-2.webp", "assets/img/NA-3.webp", "assets/img/NA-4.webp"],
      priceNow: "$899",
      priceWas: "$1,199",
      rating: "4.9",
      reviews: 128,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Chronograph precision, automatic movement, and a refined dial built for everyday luxury.",
      colors: [
        { name: "Black", image: "assets/img/NA-1.webp" },
        { name: "Gold", image: "assets/img/NA-2.webp" },
      ],
    },
    "oceanx-diver-pro": {
      id: "oceanx-diver-pro",
      name: "OceanX Diver Pro",
      brand: "EXBUYER",
      image: "assets/img/NA-2.webp",
      images: ["assets/img/NA-2.webp", "assets/img/NA-3.webp", "assets/img/NA-4.webp", "assets/img/NA-5.webp"],
      priceNow: "$799",
      priceWas: "$1,049",
      rating: "4.8",
      reviews: 214,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Dive-ready build, luminous markers, and robust water resistance for active days.",
      colors: [
        { name: "Green", image: "assets/img/NA-2.webp" },
        { name: "Black", image: "assets/img/NA-3.webp" },
      ],
    },
    "heritage-skeleton": {
      id: "heritage-skeleton",
      name: "Heritage Skeleton",
      brand: "EXBUYER",
      image: "assets/img/NA-3.webp",
      images: ["assets/img/NA-3.webp", "assets/img/NA-4.webp", "assets/img/NA-5.webp", "assets/img/NA-6.webp"],
      priceNow: "$1,299",
      priceWas: "$1,699",
      rating: "4.9",
      reviews: 96,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Open-heart skeleton dial with heritage finishing and mechanical presence on the wrist.",
      colors: [
        { name: "Black", image: "assets/img/NA-3.webp" },
        { name: "Silver", image: "assets/img/NA-4.webp" },
      ],
    },
    "classic-prestige": {
      id: "classic-prestige",
      name: "Classic Prestige",
      brand: "EXBUYER",
      image: "assets/img/NA-4.webp",
      images: ["assets/img/NA-4.webp", "assets/img/NA-5.webp", "assets/img/NA-6.webp", "assets/img/NA-7.webp"],
      priceNow: "$699",
      priceWas: "$999",
      rating: "4.7",
      reviews: 64,
      movement: "Automatic Movement",
      gender: "WOMEN",
      features: "Elegant classic profile with balanced proportions and a polished dress-watch finish.",
      colors: [
        { name: "Gold", image: "assets/img/NA-4.webp" },
        { name: "Black", image: "assets/img/NA-5.webp" },
      ],
    },
    "chrono-heritage": {
      id: "chrono-heritage",
      name: "Chrono Heritage",
      brand: "EXBUYER",
      image: "assets/img/NA-5.webp",
      images: ["assets/img/NA-5.webp", "assets/img/NA-6.webp", "assets/img/NA-7.webp", "assets/img/NL-2.png"],
      priceNow: "$1,099",
      priceWas: "$1,399",
      rating: "4.6",
      reviews: 52,
      movement: "Automatic Movement",
      gender: "UNISEX",
      features: "Heritage-inspired chronograph styling with modern reliability and versatile wear.",
      colors: [
        { name: "Black", image: "assets/img/NA-5.webp" },
        { name: "Silver", image: "assets/img/NA-6.webp" },
      ],
    },
    "urban-chrono": {
      id: "urban-chrono",
      name: "Urban Chrono",
      brand: "EXBUYER",
      image: "assets/img/NL-2.png",
      images: ["assets/img/NL-2.png", "assets/img/NA-1.webp", "assets/img/NA-2.webp", "assets/img/NA-3.webp"],
      priceNow: "$999",
      priceWas: "$1,249",
      rating: "4.5",
      reviews: 41,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Urban chronograph character with bold dial architecture and confident street-ready styling.",
      colors: [
        { name: "Black", image: "assets/img/NL-2.png" },
        { name: "Silver", image: "assets/img/NA-1.webp" },
      ],
    },
    "diver-elite": {
      id: "diver-elite",
      name: "Diver Elite",
      brand: "EXBUYER",
      image: "assets/img/NL-3.png",
      images: ["assets/img/NL-3.png", "assets/img/NA-4.webp", "assets/img/NA-5.webp", "assets/img/NA-6.webp"],
      priceNow: "$1,499",
      priceWas: "$1,799",
      rating: "4.4",
      reviews: 37,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Professional diver aesthetics with strong lume, secure grip, and commanding wrist presence.",
      colors: [
        { name: "Black", image: "assets/img/NL-3.png" },
        { name: "Silver", image: "assets/img/NA-4.webp" },
      ],
    },
    "classic-revival": {
      id: "classic-revival",
      name: "Classic Revival",
      brand: "EXBUYER",
      image: "assets/img/NL-4.png",
      images: ["assets/img/NL-4.png", "assets/img/NA-5.webp", "assets/img/NA-6.webp", "assets/img/NA-7.webp"],
      priceNow: "$1,199",
      priceWas: "$1,499",
      rating: "4.7",
      reviews: 28,
      movement: "Quartz Movement",
      gender: "WOMEN",
      features: "Revived classic lines with quartz accuracy and a timeless profile for formal occasions.",
      colors: [
        { name: "Gold", image: "assets/img/NL-4.png" },
        { name: "Black", image: "assets/img/NA-5.webp" },
      ],
    },
    "noir-gmt-traveller": {
      id: "noir-gmt-traveller",
      name: "Noir GMT Traveller",
      brand: "EXBUYER",
      image: "assets/img/NA-5.webp",
      images: ["assets/img/NA-5.webp", "assets/img/NA-6.webp", "assets/img/NA-7.webp", "assets/img/NA-8.webp"],
      priceNow: "$949",
      priceWas: "$1,249",
      rating: "4.8",
      reviews: 154,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "GMT functionality, dual-time tracking, and a travel-ready dial for global schedules.",
      colors: [
        { name: "Black", image: "assets/img/NA-5.webp" },
        { name: "Navy", image: "assets/img/NA-6.webp" },
      ],
    },
    "aurora-day-date": {
      id: "aurora-day-date",
      name: "Aurora Day-Date",
      brand: "EXBUYER",
      image: "assets/img/NA-6.webp",
      images: ["assets/img/NA-6.webp", "assets/img/NA-7.webp", "assets/img/NA-8.webp", "assets/img/NA-9.webp"],
      priceNow: "$1,099",
      priceWas: "$1,399",
      rating: "4.9",
      reviews: 201,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Day-date complication with luminous clarity and a premium finish for daily elegance.",
      colors: [
        { name: "Gold", image: "assets/img/NA-6.webp" },
        { name: "Black", image: "assets/img/NA-7.webp" },
      ],
    },
    "carbon-velocity": {
      id: "carbon-velocity",
      name: "Carbon Velocity",
      brand: "EXBUYER",
      image: "assets/img/NA-7.webp",
      images: ["assets/img/NA-7.webp", "assets/img/NA-8.webp", "assets/img/NA-9.webp", "assets/img/NL-2.png"],
      priceNow: "$1,149",
      priceWas: "$1,449",
      rating: "4.6",
      reviews: 88,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Lightweight sporty build with carbon-inspired tones and high-contrast dial readability.",
      colors: [
        { name: "Carbon", image: "assets/img/NA-7.webp" },
        { name: "Red", image: "assets/img/NA-8.webp" },
      ],
    },
    "luna-pearl-lady": {
      id: "luna-pearl-lady",
      name: "Luna Pearl Lady",
      brand: "EXBUYER",
      image: "assets/img/NA-8.webp",
      images: ["assets/img/NA-8.webp", "assets/img/NA-9.webp", "assets/img/NA-1.webp", "assets/img/NA-2.webp"],
      priceNow: "$759",
      priceWas: "$1,049",
      rating: "4.8",
      reviews: 167,
      movement: "Automatic Movement",
      gender: "WOMEN",
      features: "Pearl-toned elegance with feminine proportions and soft luminous detailing.",
      colors: [
        { name: "Pearl", image: "assets/img/NA-8.webp" },
        { name: "Rose", image: "assets/img/NA-9.webp" },
      ],
    },
    "imperial-open-heart": {
      id: "imperial-open-heart",
      name: "Imperial Open Heart",
      brand: "EXBUYER",
      image: "assets/img/NA-9.webp",
      images: ["assets/img/NA-9.webp", "assets/img/NA-8.webp", "assets/img/NA-7.webp", "assets/img/NA-6.webp"],
      priceNow: "$1,399",
      priceWas: "$1,799",
      rating: "5.0",
      reviews: 74,
      movement: "Automatic Movement",
      gender: "MEN",
      features: "Open-heart exhibition dial with imperial finishing and statement mechanical appeal.",
      colors: [
        { name: "Gold", image: "assets/img/NA-9.webp" },
        { name: "Silver", image: "assets/img/NA-8.webp" },
      ],
    },
    "apollo-iii-cadmium-yellow-silver-leather": {
      id: "apollo-iii-cadmium-yellow-silver-leather",
      name: "Apollo III - Cadmium Yellow Silver Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-1-hover.png", "assets/img/BS-2.png", "assets/img/BS-3.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.8",
      reviews: 86,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Iconic Apollo III design with cadmium yellow dial, silver case, and premium leather strap.",
      colors: [
        { name: "Cadmium Yellow", image: "assets/img/BS-1.png" },
        { name: "Ivory", image: "assets/img/BS-2.png" },
      ],
    },
    "apollo-iii-cadmium-yellow-silver-ivory-leather": {
      id: "apollo-iii-cadmium-yellow-silver-ivory-leather",
      name: "Apollo III - Cadmium Yellow Silver Ivory Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/BS-2-hover.png", "assets/img/BS-1.png", "assets/img/BS-4.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.7",
      reviews: 72,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Apollo III statement piece with ivory leather strap and cadmium yellow silver finish.",
      colors: [
        { name: "Ivory Leather", image: "assets/img/BS-2.png" },
        { name: "Cadmium Yellow", image: "assets/img/BS-1.png" },
      ],
    },
    "apollo-iii-ice-blue-silver-leather": {
      id: "apollo-iii-ice-blue-silver-leather",
      name: "Apollo III - Ice Blue Silver Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/BS-3-hover.png", "assets/img/BS-5.png", "assets/img/BS-6.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.6",
      reviews: 54,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Cool ice-blue dial with silver case and leather strap — a crisp Apollo III icon.",
      colors: [
        { name: "Ice Blue", image: "assets/img/BS-3.png" },
        { name: "Emerald Green", image: "assets/img/BS-5.png" },
      ],
    },
    "apollo-iii-wine-red-silver-leather": {
      id: "apollo-iii-wine-red-silver-leather",
      name: "Apollo III - Wine Red Silver Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/BS-4-hover.png", "assets/img/BS-1.png", "assets/img/BS-6.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.8",
      reviews: 91,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Wine-red Apollo III dial with silver accents and a refined leather strap finish.",
      colors: [
        { name: "Wine Red", image: "assets/img/BS-4.png" },
        { name: "Midnight Black", image: "assets/img/BS-6.png" },
      ],
    },
    "apollo-iii-emerald-green-silver-leather": {
      id: "apollo-iii-emerald-green-silver-leather",
      name: "Apollo III - Emerald Green Silver Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-5.png",
      images: ["assets/img/BS-5.png", "assets/img/BS-5-hover.png", "assets/img/BS-3.png", "assets/img/BS-2.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.9",
      reviews: 103,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Emerald green Apollo III dial with silver case and premium leather strap detailing.",
      colors: [
        { name: "Emerald Green", image: "assets/img/BS-5.png" },
        { name: "Ice Blue", image: "assets/img/BS-3.png" },
      ],
    },
    "apollo-iii-midnight-black-silver-leather": {
      id: "apollo-iii-midnight-black-silver-leather",
      name: "Apollo III - Midnight Black Silver Leather",
      brand: "EXBUYER",
      image: "assets/img/BS-6.png",
      images: ["assets/img/BS-6.png", "assets/img/BS-6-hover.png", "assets/img/BS-4.png", "assets/img/BS-1.png"],
      priceNow: "₹9,990.00",
      priceWas: "₹11,753.00",
      rating: "4.8",
      reviews: 118,
      movement: "Quartz Movement",
      gender: "MEN",
      features: "Midnight black Apollo III with silver leather accents for a sharp everyday icon look.",
      colors: [
        { name: "Midnight Black", image: "assets/img/BS-6.png" },
        { name: "Wine Red", image: "assets/img/BS-4.png" },
      ],
    },
  };

  window.w3GetProduct = function (id) {
    return window.W3_PRODUCTS[id] || null;
  };

  window.w3Slugify = slugify;

  function bindProductCard(card, options) {
    var nameEl = card.querySelector(options.nameSelector);
    if (!nameEl) return;

    var id = slugify(nameEl.textContent.trim());
    if (!id) return;

    var href = "product.html?id=" + encodeURIComponent(id);
    card.querySelectorAll('a[href="product.html"], a[href^="product.html?"]').forEach(function (link) {
      link.setAttribute("href", href);
    });

    card.setAttribute("data-product-id", id);
    card.style.cursor = "pointer";

    card.addEventListener("click", function (e) {
      if (e.target.closest("button")) return;
      var link = e.target.closest("a");
      if (link && link.getAttribute("href") && link.getAttribute("href").indexOf("product.html") === 0) {
        // Let the anchor navigate with product id already set
        return;
      }
      e.preventDefault();
      window.location.href = href;
    });

    if (!window.W3_PRODUCTS[id]) {
      var imgEl = card.querySelector(options.imageSelector);
      var hoverEl = options.hoverSelector ? card.querySelector(options.hoverSelector) : null;
      var priceNowEl = card.querySelector(options.priceNowSelector);
      var priceWasEl = card.querySelector(options.priceWasSelector);
      var ratingEl = options.ratingSelector ? card.querySelector(options.ratingSelector) : null;
      var reviewsEl = options.reviewsSelector ? card.querySelector(options.reviewsSelector) : null;
      var movementEl = options.movementSelector ? card.querySelector(options.movementSelector) : null;
      var image = imgEl ? imgEl.getAttribute("src") : "assets/img/NA-1.webp";
      var images = [image];
      if (hoverEl && hoverEl.getAttribute("src")) images.push(hoverEl.getAttribute("src"));

      window.W3_PRODUCTS[id] = {
        id: id,
        name: nameEl.textContent.trim(),
        brand: "EXBUYER",
        image: image,
        images: images,
        priceNow: priceNowEl ? priceNowEl.textContent.trim() : "",
        priceWas: priceWasEl ? priceWasEl.textContent.trim() : "",
        rating: ratingEl ? ratingEl.textContent.trim() : "4.8",
        reviews: reviewsEl ? parseInt(reviewsEl.textContent.replace(/\D/g, ""), 10) || 0 : 0,
        movement: movementEl ? movementEl.textContent.trim() : "Automatic Movement",
        gender: genderLabel(card.getAttribute("data-gender") || "men"),
        features: "Precision-crafted timepiece engineered for style, durability, and everyday wear.",
        colors: [{ name: "Default", image: image }],
      };
    }
  }

  document.querySelectorAll(".w3-collection__card").forEach(function (card) {
    bindProductCard(card, {
      nameSelector: ".w3-collection__name a",
      imageSelector: ".w3-collection__img-link img",
      priceNowSelector: ".w3-collection__price-now",
      priceWasSelector: ".w3-collection__price-was",
      ratingSelector: ".w3-collection__rating span",
      reviewsSelector: ".w3-collection__reviews",
      movementSelector: ".w3-collection__meta",
    });
  });

  document.querySelectorAll(".w3-icons__card").forEach(function (card) {
    bindProductCard(card, {
      nameSelector: ".w3-icons__name",
      imageSelector: ".w3-icons__img--primary",
      hoverSelector: ".w3-icons__img--hover",
      priceNowSelector: ".w3-icons__price-now",
      priceWasSelector: ".w3-icons__price-was",
    });
  });
})();

/* ========== Product detail page ========== */
(function () {
  var pdp = document.querySelector("[data-w3-pdp]");
  if (!pdp) return;

  var mainImg = pdp.querySelector("[data-w3-pdp-main]");
  var thumbsWrap = pdp.querySelector(".w3-pdp__thumbs");
  var colorsWrap = pdp.querySelector("[data-w3-pdp-colors]");
  var pinForm = pdp.querySelector("[data-w3-pdp-pin]");
  var pinMsg = pdp.querySelector("[data-w3-pdp-pin-msg]");
  var thumbs = [];
  var colors = [];

  function getQueryProductId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function bindThumbs() {
    thumbs = Array.from(pdp.querySelectorAll("[data-w3-pdp-thumb]"));
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-src");
        if (!src || !mainImg) return;
        mainImg.src = src;
        mainImg.alt = mainImg.getAttribute("data-alt-base") || mainImg.alt;
        thumbs.forEach(function (t) {
          var on = t === thumb;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
      });
    });
  }

  function bindColors() {
    colors = Array.from(pdp.querySelectorAll(".w3-pdp__color:not(.w3-pdp__color--more)"));
    colors.forEach(function (btn) {
      btn.addEventListener("click", function () {
        colors.forEach(function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        var img = btn.querySelector("img");
        if (img && mainImg) {
          mainImg.src = img.getAttribute("src");
          thumbs.forEach(function (t) {
            var on = t.getAttribute("data-src") === img.getAttribute("src");
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
          });
        }
      });
    });
  }

  function renderGallery(product) {
    if (!thumbsWrap || !mainImg) return;

    var images = (product.images && product.images.length ? product.images : [product.image]).slice(0, 8);
    thumbsWrap.innerHTML = "";

    images.forEach(function (src, index) {
      var thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "w3-pdp__thumb" + (index === 0 ? " is-active" : "");
      thumb.setAttribute("data-w3-pdp-thumb", "");
      thumb.setAttribute("data-src", src);
      thumb.setAttribute("aria-label", "View image " + (index + 1));
      thumb.setAttribute("aria-selected", index === 0 ? "true" : "false");

      var img = document.createElement("img");
      img.src = src;
      img.alt = product.name + " angle " + (index + 1);
      img.width = 96;
      img.height = 96;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      thumb.appendChild(img);
      thumbsWrap.appendChild(thumb);
    });

    mainImg.src = images[0];
    mainImg.alt = product.name + " watch";
    mainImg.setAttribute("data-alt-base", product.name + " watch");
    bindThumbs();
  }

  function renderColors(product) {
    if (!colorsWrap) return;

    var colorItems = product.colors && product.colors.length
      ? product.colors
      : [{ name: "Default", image: product.image }];

    colorsWrap.innerHTML = "";

    colorItems.forEach(function (color, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w3-pdp__color" + (index === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", color.name);
      btn.setAttribute("role", "listitem");

      var img = document.createElement("img");
      img.src = color.image;
      img.alt = color.name;
      img.width = 72;
      img.height = 72;
      img.loading = "lazy";
      img.decoding = "async";

      var label = document.createElement("span");
      label.textContent = color.name;

      btn.appendChild(img);
      btn.appendChild(label);
      colorsWrap.appendChild(btn);
    });

    var moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "w3-pdp__color w3-pdp__color--more";
    moreBtn.setAttribute("aria-label", "Show more colors");
    moreBtn.innerHTML =
      '<span class="w3-pdp__color-more-label">Show More</span>' +
      '<span class="w3-pdp__color-more-count">+2</span>';
    colorsWrap.appendChild(moreBtn);
    bindColors();
  }

  function populateProduct(product) {
    if (!product) return;

    var breadcrumb = pdp.querySelector("[data-w3-pdp-breadcrumb]");
    var brand = pdp.querySelector(".w3-pdp__brand");
    var rating = pdp.querySelector("[data-w3-pdp-rating]");
    var title = pdp.querySelector("[data-w3-pdp-title]");
    var ideal = pdp.querySelector("[data-w3-pdp-ideal]");
    var features = pdp.querySelector("[data-w3-pdp-features]");
    var mrp = pdp.querySelector("[data-w3-pdp-mrp]");
    var price = pdp.querySelector("[data-w3-pdp-price]");
    var descAcc = Array.prototype.find.call(
      pdp.querySelectorAll("[data-w3-pdp-acc]"),
      function (acc) {
        var btn = acc.querySelector("[data-w3-pdp-acc-btn]");
        return btn && /description/i.test(btn.textContent);
      }
    );
    var descPanel = descAcc ? descAcc.querySelector("[data-w3-pdp-acc-panel] p") : null;
    var stickyImg = document.querySelector("[data-w3-sticky-img]");
    var stickyName = document.querySelector("[data-w3-sticky-name]");
    var stickyMrp = document.querySelector("[data-w3-sticky-mrp]");
    var stickyPrice = document.querySelector("[data-w3-sticky-price]");

    document.title = "exbuyer — " + product.name;

    if (breadcrumb) breadcrumb.textContent = product.name;
    if (brand) brand.textContent = product.brand || "EXBUYER";
    if (rating) {
      rating.innerHTML = '<i class="fa-solid fa-star" aria-hidden="true"></i> ' + product.rating + " (" + product.reviews + ")";
      rating.setAttribute(
        "aria-label",
        "Rated " + product.rating + " out of 5 from " + product.reviews + " reviews"
      );
    }
    if (title) title.textContent = product.name.toUpperCase();
    if (ideal) ideal.innerHTML = "<strong>IDEAL FOR:</strong> " + (product.gender || "MEN");
    if (features) features.textContent = product.features || product.movement;
    if (mrp) mrp.textContent = product.priceWas || "";
    if (price) price.textContent = product.priceNow || "";
    if (descPanel) {
      descPanel.textContent =
        product.name +
        " blends everyday elegance with precision timing—crafted for a refined wrist presence.";
    }

    if (stickyImg) {
      stickyImg.src = product.image;
      stickyImg.alt = product.name;
    }
    if (stickyName) stickyName.textContent = product.name.toUpperCase();
    if (stickyMrp) stickyMrp.textContent = product.priceWas || "";
    if (stickyPrice) stickyPrice.textContent = product.priceNow || "";

    renderGallery(product);
    renderColors(product);
  }

  var productId = getQueryProductId() || "starboard-rosegold";
  var selectedProduct = window.w3GetProduct ? window.w3GetProduct(productId) : null;
  if (selectedProduct) populateProduct(selectedProduct);
  else bindThumbs();

  if (!selectedProduct) bindColors();

  pdp.querySelectorAll("[data-w3-pdp-acc]").forEach(function (acc) {
    var btn = acc.querySelector("[data-w3-pdp-acc-btn]");
    var panel = acc.querySelector("[data-w3-pdp-acc-panel]");
    var icon = btn && btn.querySelector("i");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      if (icon) {
        icon.classList.toggle("fa-chevron-up", open);
        icon.classList.toggle("fa-chevron-down", !open);
      }
    });
  });

  // Specs accordions outside PDP block
  document.querySelectorAll(".w3-specs [data-w3-pdp-acc]").forEach(function (acc) {
    var btn = acc.querySelector("[data-w3-pdp-acc-btn]");
    var panel = acc.querySelector("[data-w3-pdp-acc-panel]");
    var icon = btn && btn.querySelector("i");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      if (icon) {
        icon.classList.toggle("fa-chevron-up", open);
        icon.classList.toggle("fa-chevron-down", !open);
      }
    });
  });

  pinForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = pinForm.querySelector("input");
    var value = (input && input.value || "").trim();
    if (!pinMsg) return;
    pinMsg.hidden = false;
    if (!/^\d{6}$/.test(value)) {
      pinMsg.textContent = "Enter a valid 6-digit pincode.";
      pinMsg.classList.add("is-error");
      return;
    }
    pinMsg.classList.remove("is-error");
    pinMsg.textContent = "Delivery available to " + value + " in 2–5 days.";
  });
})();

/* ========== Product FAQs ========== */
(function () {
  var faq = document.querySelector("[data-w3-faq]");
  if (!faq) return;

  faq.querySelectorAll("[data-w3-faq-item]").forEach(function (item) {
    var btn = item.querySelector("[data-w3-faq-btn]");
    var panel = item.querySelector("[data-w3-faq-panel]");
    var icon = btn && btn.querySelector(".w3-faq__icon");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      if (icon) {
        icon.classList.toggle("fa-chevron-up", open);
        icon.classList.toggle("fa-chevron-down", !open);
      }
    });
  });
})();
