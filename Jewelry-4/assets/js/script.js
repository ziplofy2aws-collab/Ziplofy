/* Mobile menu */
const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

/* Hero slider — auto advance every 8s */
(function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  if (!slides.length) return;

  let current = 0;
  const delay = 8000;
  let timer = null;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
  }

  function next() {
    goTo(current + 1);
  }

  function start() {
    stop();
    timer = setInterval(next, delay);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      start();
    });
  });

  const slider = document.getElementById("hero-slider");
  if (slider) {
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
  }

  start();
})();

/* Categories — mobile one-card swipe */
(function initCategoriesCarousel() {
  const track = document.querySelector(".categories-inner");
  const dotsWrap = document.getElementById("categories-dots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".category-card"));
  if (!cards.length) return;

  dotsWrap.innerHTML = cards
    .map((_, i) => `<button type="button" class="categories-dot${i === 0 ? " is-active" : ""}" aria-label="Category ${i + 1}"></button>`)
    .join("");

  const dots = Array.from(dotsWrap.querySelectorAll(".categories-dot"));

  function activeIndex() {
    const left = track.scrollLeft;
    const width = track.clientWidth || 1;
    return Math.round(left / width);
  }

  function updateDots() {
    const i = Math.min(cards.length - 1, Math.max(0, activeIndex()));
    dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === i));
  }

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateDots);
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    });
  });

  window.addEventListener("resize", updateDots);
  updateDots();
})();

/* Product carousels — swipe / arrows, one card at a time */
(function initProductCarousels() {
  document.querySelectorAll(".product-carousel").forEach((root) => {
    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    const cards = Array.from(root.querySelectorAll(".product-card"));
    const prevBtn = root.querySelector(".carousel-prev");
    const nextBtn = root.querySelector(".carousel-next");
    if (!viewport || !track || !cards.length) return;

    let index = 0;
    let perView = 4;
    let gap = 20;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;
    let dragStarted = false;

    function getGap() {
      const styles = getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 20;
    }

    function getPerView() {
      const w = window.innerWidth;
      if (w <= 768) return 2;
      if (w <= 1100) return 3;
      return 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView);
    }

    function update() {
      perView = getPerView();
      gap = getGap();
      index = Math.min(index, maxIndex());

      const cardWidth = cards[0].getBoundingClientRect().width;
      const offset = index * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
    }

    function go(dir) {
      index = Math.min(maxIndex(), Math.max(0, index + dir));
      update();
    }

    prevBtn?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      dragStarted = false;
      startX = e.clientX;
      deltaX = 0;
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      if (!dragStarted && Math.abs(deltaX) < 8) return;
      if (!dragStarted) {
        dragStarted = true;
        viewport.classList.add("is-dragging");
        track.style.transition = "none";
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      const cardWidth = cards[0].getBoundingClientRect().width;
      const base = index * (cardWidth + gap);
      track.style.transform = `translateX(${-base + deltaX}px)`;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      track.style.transition = "";

      if (dragStarted) {
        const threshold = 50;
        if (deltaX < -threshold) go(1);
        else if (deltaX > threshold) go(-1);
        else update();

        // Prevent accidental link click after a swipe
        const suppress = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          viewport.removeEventListener("click", suppress, true);
        };
        viewport.addEventListener("click", suppress, true);
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      dragStarted = false;
    }

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    window.addEventListener("resize", update);
    update();
  });
})();

/* Customer stories — center-mode carousel */
(function initStoriesCarousel() {
  const root = document.getElementById("stories-carousel");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".story-card"));
  const dots = Array.from(document.querySelectorAll(".stories-dot"));
  const prevBtn = document.getElementById("stories-prev");
  const nextBtn = document.getElementById("stories-next");
  if (!cards.length) return;

  let current = 0;
  const total = cards.length;

  function render() {
    cards.forEach((card) => card.classList.remove("is-active", "is-prev", "is-next"));
    cards[current].classList.add("is-active");
    cards[(current - 1 + total) % total].classList.add("is-prev");
    cards[(current + 1) % total].classList.add("is-next");

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function go(dir) {
    current = (current + dir + total) % total;
    render();
  }

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      current = i;
      render();
    });
  });

  // Swipe support
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  root.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      deltaX = 0;
      root.setPointerCapture(e.pointerId);
    },
    { passive: true }
  );

  root.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (deltaX < -40) go(1);
    else if (deltaX > 40) go(-1);
    try {
      root.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  render();
})();
