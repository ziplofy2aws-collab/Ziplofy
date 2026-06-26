/* ===== Nivaas Furniture – Mobile header menu ===== */
(function () {
  "use strict";

  var mobile = document.querySelector("[data-fr2-mobile]");
  var toggle = document.querySelector("[data-fr2-toggle]");
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

  mobile.querySelectorAll("[data-fr2-close]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });

  mobile.querySelectorAll(".fr2-header__mobile-nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mobile.hidden) closeMenu();
  });
})();

/* ===== Hero slider – auto rotate every 5s ===== */
(function () {
  "use strict";

  var root = document.querySelector("[data-fr2-slider]");
  if (!root) return;

  var track = root.querySelector("[data-fr2-track]");
  var dotsWrap = root.querySelector("[data-fr2-dots]");
  var nextBtn = root.querySelector("[data-fr2-next]");
  var slides = track ? track.children : [];
  if (!track || slides.length === 0) return;

  var DELAY = 5000;
  var index = 0;
  var timer = null;

  var dots = [];
  for (var i = 0; i < slides.length; i++) {
    (function (i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "fr2-hero__dot";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    })(i);
  }

  function render() {
    track.style.transform = "translateX(" + -index * 100 + "%)";
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("is-active", i === index);
    }
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  function next() {
    goTo(index + 1);
  }

  function start() {
    timer = window.setInterval(next, DELAY);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      restart();
    });
  }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  render();
  start();
})();

/* ===== Product carousels ===== */
(function () {
  "use strict";

  function initCarousel(root) {
    var track = root.querySelector("[data-fr2-carousel-track]");
    var cards = track ? track.children : [];
    var prevBtn = root.querySelector("[data-fr2-carousel-prev]");
    var nextBtn = root.querySelector("[data-fr2-carousel-next]");
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
      track.style.transform = "translateX(" + -index * m.step + "px)";
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

  document.querySelectorAll("[data-fr2-carousel]").forEach(initCarousel);
})();

/* ===== Tab active toggle (Bestsellers + Brand Bazaar) ===== */
(function () {
  "use strict";

  var groups = [
    { wrap: "[data-fr2-tabs]", tab: ".fr2-best__tab" },
    { wrap: "[data-fr2-bazaar-tabs]", tab: ".fr2-bazaar__tab" },
  ];

  groups.forEach(function (group) {
    var tabsWrap = document.querySelector(group.wrap);
    if (!tabsWrap) return;

    var tabs = tabsWrap.querySelectorAll(group.tab);

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
      });
    });
  });
})();

/* ===== Bestsellers mobile "next card" button ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fr2-best-track]");
  var nextBtn = document.querySelector("[data-fr2-best-next]");
  var prevBtn = document.querySelector("[data-fr2-best-prev]");
  if (!track) return;

  function stepSize() {
    var card = track.querySelector(".fr2-pcard");
    if (!card) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14;
    return card.getBoundingClientRect().width + gap;
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var step = stepSize();
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step / 2;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      var step = stepSize();
      if (track.scrollLeft <= step / 2) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -step, behavior: "smooth" });
      }
    });
  }
})();

/* ===== Limited Time Offers mobile carousel (prev/next) ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fr2-offers-track]");
  var prevBtn = document.querySelector("[data-fr2-offers-prev]");
  var nextBtn = document.querySelector("[data-fr2-offers-next]");
  if (!track) return;

  function stepSize() {
    var card = track.querySelector(".fr2-offer");
    if (!card) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14;
    return card.getBoundingClientRect().width + gap;
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var step = stepSize();
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step / 2;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      var step = stepSize();
      if (track.scrollLeft <= step / 2) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -step, behavior: "smooth" });
      }
    });
  }
})();
