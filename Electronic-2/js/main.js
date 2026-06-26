/* ===== Shared: mobile header menu ===== */
(function () {
  "use strict";

  var mobile = document.querySelector("[data-el2-mobile]");
  var toggle = document.querySelector("[data-el2-toggle]");
  if (!mobile || !toggle) return;

  function openMenu() {
    mobile.hidden = false;
    requestAnimationFrame(function () {
      mobile.classList.add("is-open");
    });
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mobile.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      mobile.hidden = true;
    }, 250);
  }

  toggle.addEventListener("click", openMenu);

  mobile.querySelectorAll("[data-el2-close]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });

  mobile.querySelectorAll(".el2-header__mobile-nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mobile.hidden) closeMenu();
  });
})();

/* ===== Shared: back to top ===== */
(function () {
  "use strict";

  var btn = document.querySelector("[data-el2-top]");
  if (!btn) return;

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ===== Shared: product carousels ===== */
(function () {
  "use strict";

  function initCarousel(root) {
    var track = root.querySelector("[data-el2-track]");
    var cards = track ? track.children : [];
    var prevBtn = root.querySelector("[data-el2-prev]");
    var nextBtn = root.querySelector("[data-el2-next]");
    if (!track || cards.length === 0) return;

    var index = 0;

    function metrics() {
      var first = cards[0];
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      var step = first.getBoundingClientRect().width + gap;
      var viewport = track.parentElement.getBoundingClientRect().width;
      var visible = Math.max(1, Math.round(viewport / step));
      var maxIndex = Math.max(0, cards.length - visible);
      return { step: step, maxIndex: maxIndex };
    }

    function render() {
      var m = metrics();
      if (index > m.maxIndex) index = m.maxIndex;
      if (index < 0) index = 0;
      track.style.transform = "translateX(" + (-index * m.step) + "px)";
    }

    function next() {
      var m = metrics();
      index = index >= m.maxIndex ? 0 : index + 1;
      render();
    }

    function prev() {
      var m = metrics();
      index = index <= 0 ? m.maxIndex : index - 1;
      render();
    }

    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 150);
    });

    render();
  }

  document.querySelectorAll("[data-el2-carousel]").forEach(initCarousel);
})();

/* ===== Hero slider ===== */
(function () {
  "use strict";

  var DELAY = 7000;
  var hero = document.querySelector("[data-el2-hero]");
  if (!hero) return;

  var track = hero.querySelector("[data-el2-hero-track]");
  var slides = track ? track.children : [];
  var dotsWrap = hero.querySelector("[data-el2-hero-dots]");
  var prevBtn = hero.querySelector("[data-el2-hero-prev]");
  var nextBtn = hero.querySelector("[data-el2-hero-next]");
  if (!track || slides.length === 0) return;

  var index = 0;
  var timer = null;
  var dots = [];

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "el2-hero__dot";
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    (function (idx) {
      dot.addEventListener("click", function () {
        goTo(idx);
        restart();
      });
    })(i);
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  function render() {
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle("is-active", d === index);
    }
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function start() {
    timer = window.setInterval(next, DELAY);
  }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function restart() {
    stop();
    start();
  }

  if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else restart();
  });

  render();
  start();
})();
