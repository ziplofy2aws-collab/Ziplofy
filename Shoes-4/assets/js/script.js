(function () {
  "use strict";

  /* Announcement carousel */
  var announce = document.querySelector("[data-announce]");
  if (announce) {
    var messages = announce.querySelectorAll(".announce-bar__msg");
    var prevBtn = announce.querySelector("[data-announce-prev]");
    var nextBtn = announce.querySelector("[data-announce-next]");
    var index = 0;
    var timer;

    function show(i) {
      messages.forEach(function (msg) {
        msg.classList.remove("is-active");
      });
      index = (i + messages.length) % messages.length;
      messages[index].classList.add("is-active");
    }

    function next() {
      show(index + 1);
    }

    function prev() {
      show(index - 1);
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(next, 5000);
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () {
      prev();
      startAuto();
    });

    if (nextBtn) nextBtn.addEventListener("click", function () {
      next();
      startAuto();
    });

    if (messages.length > 1) startAuto();
  }

  /* Mobile menu */
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-main-nav]");
  var overlay = document.querySelector("[data-nav-overlay]");

  function openMenu() {
    if (!nav) return;
    nav.classList.add("is-open");
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add("is-visible");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (overlay) {
      overlay.classList.remove("is-visible");
      overlay.hidden = true;
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (nav && nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Hero auto slider */
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = hero.querySelectorAll("[data-hero-slide]");
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var autoTimer;
    var interval = 5000;

    function goTo(i) {
      if (!slides.length) return;
      slides[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
    }

    function nextSlide() {
      goTo(current + 1);
    }

    function prevSlide() {
      goTo(current - 1);
    }

    function startAuto() {
      stopAuto();
      if (slides.length > 1) {
        autoTimer = setInterval(nextSlide, interval);
      }
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        prevSlide();
        startAuto();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        nextSlide();
        startAuto();
      });
    }

    hero.addEventListener("mouseenter", stopAuto);
    hero.addEventListener("mouseleave", startAuto);
    hero.addEventListener("focusin", stopAuto);
    hero.addEventListener("focusout", startAuto);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    startAuto();
  }

  /* Shared product rail carousel (Bestsellers + New Collection) */
  document.querySelectorAll("[data-product-rail]").forEach(function (rail) {
    var track = rail.querySelector("[data-bs-track], [data-rail-track]");
    var prevBtn = rail.querySelector("[data-bs-prev], [data-rail-prev]");
    var nextBtn = rail.querySelector("[data-bs-next], [data-rail-next]");
    if (!track) return;

    var cards = track.querySelectorAll(".product-card");
    var index = 0;

    function perView() {
      var w = window.innerWidth;
      if (w <= 480) return 1;
      if (w <= 768) return 2;
      if (w <= 1100) return 3;
      return 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function stepSize() {
      if (!cards.length) return 0;
      var card = cards[0];
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function update() {
      var max = maxIndex();
      if (index > max) index = max;
      if (index < 0) index = 0;
      track.style.transform = "translateX(" + -(index * stepSize()) + "px)";
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        index -= 1;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        index += 1;
        update();
      });
    }

    rail.querySelectorAll(".product-card__wish").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var icon = btn.querySelector("i");
        var active = btn.classList.toggle("is-active");
        if (!icon) return;
        icon.classList.toggle("fa-regular", !active);
        icon.classList.toggle("fa-solid", active);
        if (!icon.classList.contains("fa-heart")) {
          icon.classList.add("fa-heart");
        }
        btn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
      });
    });

    window.addEventListener("resize", update);
    update();
  });

  /* New drops — duplicate track for seamless marquee */
  var drops = document.querySelector("[data-new-drops]");
  if (drops) {
    var dropsTrack = drops.querySelector("[data-drops-track]");
    if (dropsTrack && !dropsTrack.dataset.cloned) {
      dropsTrack.innerHTML += dropsTrack.innerHTML;
      dropsTrack.dataset.cloned = "true";
    }
  }

  /* Creative Spotlights — mobile one-card swipe + dots */
  (function initSpotlights() {
    var track = document.querySelector("[data-spotlights-track]");
    var dotsWrap = document.querySelector("[data-spotlights-dots]");
    if (!track || !dotsWrap) return;

    var items = Array.prototype.slice.call(track.querySelectorAll(".spotlights__item"));
    if (!items.length) return;

    dotsWrap.innerHTML = items
      .map(function (_, i) {
        return (
          '<button type="button" class="spotlights__dot' +
          (i === 0 ? " is-active" : "") +
          '" data-index="' + i + '" aria-label="Go to spotlight ' + (i + 1) + '"></button>'
        );
      })
      .join("");

    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".spotlights__dot"));

    function activeIndex() {
      var left = track.scrollLeft;
      var width = track.clientWidth || 1;
      return Math.round(left / width);
    }

    function setActive(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    var scrollTimer;
    track.addEventListener(
      "scroll",
      function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          setActive(activeIndex());
        }, 60);
      },
      { passive: true }
    );

    dotsWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".spotlights__dot");
      if (!btn) return;
      var index = Number(btn.getAttribute("data-index"));
      if (Number.isNaN(index)) return;
      track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
      setActive(index);
    });
  })();
})();
