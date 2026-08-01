(function () {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const toggle = header.querySelector("[data-menu-toggle]");
  const closeBtn = header.querySelector("[data-menu-close]");
  const drawer = header.querySelector("[data-drawer]");
  const backdrop = header.querySelector("[data-backdrop]");

  function openMenu() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-menu-open");
  }

  function closeMenu() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-visible");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-menu-open");
    setTimeout(() => {
      if (!drawer.classList.contains("is-open")) backdrop.hidden = true;
    }, 250);
  }

  toggle?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  backdrop?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeMenu();
  });
})();

/* Hero slider — auto advance every 8s */
(function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  const slides = slider.querySelectorAll(".hero-slide");
  const dots = slider.querySelectorAll("[data-hero-dot]");
  const prevBtn = slider.querySelector("[data-hero-prev]");
  const nextBtn = slider.querySelector("[data-hero-next]");
  if (!slides.length) return;

  let current = 0;
  const delay = 8000;
  let timer = null;

  function goTo(index) {
    const prev = slides[current];
    prev.classList.remove("is-active");
    // reset animations so they replay on re-entry
    prev.querySelectorAll(".hero-label, .hero-heading, .hero-kicker, .hero-desc, .hero-cta").forEach((el) => {
      el.style.animation = "none";
    });

    if (dots[current]) {
      dots[current].classList.remove("is-active");
      dots[current].setAttribute("aria-selected", "false");
    }

    current = (index + slides.length) % slides.length;
    const nextSlide = slides[current];

    nextSlide.querySelectorAll(".hero-label, .hero-heading, .hero-kicker, .hero-desc, .hero-cta").forEach((el) => {
      el.style.animation = "";
    });

    nextSlide.classList.add("is-active");
    if (dots[current]) {
      dots[current].classList.add("is-active");
      dots[current].setAttribute("aria-selected", "true");
    }
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function start() {
    stop();
    timer = setInterval(next, delay);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.heroDot));
      start();
    });
  });

  prevBtn?.addEventListener("click", () => {
    prev();
    start();
  });

  nextBtn?.addEventListener("click", () => {
    next();
    start();
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();

/* Product carousels — advance one card at a time */
(function initProductCarousels() {
  function initCarousel(section, opts) {
    const viewport = section.querySelector(opts.viewport);
    const track = section.querySelector(opts.track);
    const cards = track ? track.querySelectorAll(".product-card") : [];
    const prevBtn = section.querySelector(opts.prev);
    const nextBtn = section.querySelector(opts.next);
    const dots = opts.dots ? section.querySelectorAll(opts.dots) : [];

    if (!viewport || !track || !cards.length) return;

    let index = 0;

    function getGap() {
      const gap = parseFloat(getComputedStyle(track).gap);
      return Number.isFinite(gap) ? gap : 20;
    }

    function getVisibleCount() {
      const cardWidth = cards[0].offsetWidth;
      if (!cardWidth) return 1;
      return Math.max(1, Math.round((viewport.clientWidth + getGap()) / (cardWidth + getGap())));
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getPageCount() {
      return Math.max(1, Math.ceil(cards.length / getVisibleCount()));
    }

    function updateDots() {
      if (!dots.length) return;
      const visible = getVisibleCount();
      const page = Math.min(getPageCount() - 1, Math.floor(index / visible));
      dots.forEach((dot, i) => {
        const active = i === page;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function apply() {
      const max = getMaxIndex();
      index = Math.min(Math.max(0, index), max);
      const step = cards[0].offsetWidth + getGap();
      track.style.transform = `translateX(-${index * step}px)`;

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
      updateDots();
    }

    prevBtn?.addEventListener("click", () => {
      index -= 1;
      apply();
    });

    nextBtn?.addEventListener("click", () => {
      index += 1;
      apply();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const page = Number(dot.dataset.pcDot);
        index = page * getVisibleCount();
        apply();
      });
    });

    let touchStartX = 0;
    let touchDeltaX = 0;

    viewport.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchDeltaX = 0;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      (e) => {
        touchDeltaX = e.changedTouches[0].clientX - touchStartX;
      },
      { passive: true }
    );

    viewport.addEventListener("touchend", () => {
      if (Math.abs(touchDeltaX) < 40) return;
      if (touchDeltaX < 0) index += 1;
      else index -= 1;
      apply();
    });

    window.addEventListener("resize", apply);
    apply();
  }

  document.querySelectorAll("[data-bestsellers]").forEach((section) => {
    initCarousel(section, {
      viewport: "[data-bs-viewport]",
      track: "[data-bs-track]",
      prev: "[data-bs-prev]",
      next: "[data-bs-next]",
    });
  });

  document.querySelectorAll("[data-product-carousel]").forEach((section) => {
    initCarousel(section, {
      viewport: "[data-pc-viewport]",
      track: "[data-pc-track]",
      prev: "[data-pc-prev]",
      next: "[data-pc-next]",
      dots: "[data-pc-dot]",
    });
  });
})();

/* Back to top */
(function initBackToTop() {
  const btn = document.querySelector("[data-back-to-top]");
  if (!btn) return;

  function update() {
    btn.classList.toggle("is-visible", window.scrollY > 480);
  }

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
