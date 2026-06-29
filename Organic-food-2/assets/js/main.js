(function () {
  "use strict";

  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  var overlay = document.querySelector("[data-menu-overlay]");
  var closeBtns = document.querySelectorAll("[data-menu-close]");

  function openMenu() {
    if (!menu || !toggle) return;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add("is-visible");
    }
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (overlay) {
      overlay.classList.remove("is-visible");
      overlay.hidden = true;
    }
    document.body.style.overflow = "";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeMenu);
  });

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* Product card → product page */
  document.addEventListener("click", function (e) {
    if (e.target.closest("button, select, .bs-card__select, .combo-card__select, a[href]")) return;
    var card = e.target.closest("[data-product-id]");
    if (!card) return;
    var id = card.getAttribute("data-product-id");
    if (!id) return;
    window.location.href = "product.html?id=" + encodeURIComponent(id);
  });

  // Accordion behaviour for dropdowns on mobile
  var dropdownItems = document.querySelectorAll(".navbar__item--has-dropdown > .navbar__link");

  dropdownItems.forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width: 991px)").matches) {
        e.preventDefault();
        link.parentElement.classList.toggle("is-expanded");
      }
    });
  });

  /* ===================== Hero slider ===================== */
  var slider = document.querySelector("[data-slider]");

  if (slider) {
    var track = slider.querySelector("[data-track]");
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = slider.querySelector("[data-dots]");
    var prevBtn = slider.querySelector("[data-prev]");
    var nextBtn = slider.querySelector("[data-next]");
    var current = 0;
    var total = slides.length;
    var autoplayDelay = 5000;
    var timer = null;

    // Build dots
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero__dot";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === current);
      });
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function start() {
      timer = window.setInterval(next, autoplayDelay);
    }

    function stop() {
      window.clearInterval(timer);
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

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        restart();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    // Touch / swipe support
    var startX = 0;
    var deltaX = 0;
    track.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      deltaX = 0;
      stop();
    }, { passive: true });
    track.addEventListener("touchmove", function (e) {
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener("touchend", function () {
      if (Math.abs(deltaX) > 50) {
        deltaX < 0 ? next() : prev();
      }
      start();
    });

    goTo(0);
    start();
  }

  /* ===================== Combos carousel ===================== */
  var combos = document.querySelector("[data-combos]");
  if (combos) {
    var combosTrack = combos.querySelector("[data-combos-track]");
    var combosPrev = combos.querySelector("[data-combos-prev]");
    var combosNext = combos.querySelector("[data-combos-next]");

    function combosScroll(dir) {
      var card = combosTrack.querySelector(".combo-card");
      var step = card ? card.getBoundingClientRect().width + 20 : combosTrack.clientWidth * 0.8;
      combosTrack.scrollBy({ left: dir * step, behavior: "smooth" });
    }

    if (combosNext) {
      combosNext.addEventListener("click", function () {
        combosScroll(1);
      });
    }
    if (combosPrev) {
      combosPrev.addEventListener("click", function () {
        combosScroll(-1);
      });
    }
  }

  /* ===================== Best sellers carousel ===================== */
  var bestsellers = document.querySelector("[data-bestsellers]");
  if (bestsellers) {
    var bsTrack = bestsellers.querySelector("[data-bs-track]");
    var bsPrev = bestsellers.querySelector("[data-bs-prev]");
    var bsNext = bestsellers.querySelector("[data-bs-next]");

    function bsStep(dir) {
      var card = bsTrack.querySelector(".bs-card");
      var step = card ? card.getBoundingClientRect().width + 20 : bsTrack.clientWidth * 0.8;
      bsTrack.scrollBy({ left: dir * step, behavior: "smooth" });
    }

    if (bsNext) {
      bsNext.addEventListener("click", function () {
        bsStep(1);
      });
    }
    if (bsPrev) {
      bsPrev.addEventListener("click", function () {
        bsStep(-1);
      });
    }
  }

  /* ===================== Offer tab close ===================== */
  var offerClose = document.querySelector("[data-offer-close]");
  var offer = document.querySelector("[data-offer]");
  if (offerClose && offer) {
    offerClose.addEventListener("click", function () {
      offer.classList.add("is-hidden");
    });
  }
})();
