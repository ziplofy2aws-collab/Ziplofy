(function () {
  "use strict";

  var navMenu = document.getElementById("ehNavMenu");
  var menuToggles = document.querySelectorAll("#ehBrowseToggle, .eh-mobile-menu");

  function setMobileHeaderHeight() {
    var header = document.querySelector(".eh-header");
    var mainbar = document.querySelector(".eh-mainbar");
    if (header && mainbar && window.matchMedia("(max-width: 768px)").matches) {
      header.style.setProperty("--eh-mobile-header-height", mainbar.offsetHeight + "px");
    }
  }

  menuToggles.forEach(function (toggle) {
    if (!navMenu) return;
    toggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      menuToggles.forEach(function (btn) {
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  });

  setMobileHeaderHeight();
  window.addEventListener("resize", setMobileHeaderHeight);

  initProductCards();
  initHeroCarousel();
  initPs5ProductSlider();
  initGearSlider();
  initPreownedSlider();
  initBlogToolbar();
})();

window.initProductCards = initProductCards;

function initProductCards() {
  var cardSelector = ".eh-ps5-card, .eh-preowned-card, .eh-cat-grid__card";

  document.querySelectorAll(cardSelector).forEach(function (card) {
    var productLink = card.querySelector('a[href*="product.html?id="]');
    if (!productLink) return;

    var match = productLink.getAttribute("href").match(/[?&]id=([^&]+)/);
    if (!match) return;

    var productId = decodeURIComponent(match[1]);
    var productUrl = "product.html?id=" + encodeURIComponent(productId);

    card.setAttribute("data-product-id", productId);
    card.classList.add("eh-product-card--clickable");

    card.querySelectorAll('a[href*="product.html?id="]').forEach(function (a) {
      a.setAttribute("href", productUrl);
    });

    var btn = card.querySelector(".eh-ps5-card__btn, .eh-preowned-card__btn");
    if (btn) {
      if (btn.tagName === "BUTTON") {
        var linkBtn = document.createElement("a");
        linkBtn.className = btn.className;
        linkBtn.href = productUrl;
        linkBtn.innerHTML = btn.innerHTML;
        btn.parentNode.replaceChild(linkBtn, btn);
      } else {
        btn.setAttribute("href", productUrl);
      }
    }

    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      window.location.href = productUrl;
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest("a")) return;
        e.preventDefault();
        window.location.href = productUrl;
      }
    });

    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", "View product details");
    }
  });
}

function initBlogToolbar() {
  var topBtn = document.querySelector(".eh-blog__tool--top");
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function initPreownedSlider() {
  document.querySelectorAll("[data-preowned-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-preowned-track]");
    var viewport = slider.querySelector("[data-preowned-viewport]");
    var cards = track ? track.querySelectorAll(".eh-preowned-card") : [];
    var prevBtn = slider.querySelector("[data-preowned-prev]");
    var nextBtn = slider.querySelector("[data-preowned-next]");
    var index = 0;

    function getGap() {
      if (!track) return 20;
      return parseFloat(window.getComputedStyle(track).gap) || 20;
    }

    function getStep() {
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getMaxIndex() {
      if (!viewport || !cards.length) return 0;
      var step = getStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
      return Math.max(0, cards.length - visibleCount);
    }

    function goTo(nextIndex) {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(nextIndex, maxIndex));

      if (track) {
        track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
      }

      if (prevBtn) {
        var atStart = index <= 0;
        prevBtn.disabled = atStart;
        prevBtn.classList.toggle("is-disabled", atStart);
      }

      if (nextBtn) {
        var atEnd = index >= maxIndex;
        nextBtn.disabled = atEnd;
        nextBtn.classList.toggle("is-disabled", atEnd);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    window.addEventListener("resize", function () {
      goTo(index);
    });

    goTo(0);
  });
}

function initGearSlider() {
  document.querySelectorAll("[data-gear-slider]").forEach(function (section) {
    var track = section.querySelector("[data-gear-track]");
    var viewport = section.querySelector("[data-gear-viewport]");
    var cards = track ? track.querySelectorAll(".eh-gear__card") : [];
    var nextBtn = section.querySelector("[data-gear-next]");
    var index = 0;

    function getGap() {
      if (!track) return 20;
      return parseFloat(window.getComputedStyle(track).gap) || 20;
    }

    function getStep() {
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getMaxIndex() {
      if (!viewport || !cards.length) return 0;
      var step = getStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
      return Math.max(0, cards.length - visibleCount);
    }

    function goTo(nextIndex) {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(nextIndex, maxIndex));

      if (track) {
        track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
      }

      if (nextBtn) {
        var atEnd = index >= maxIndex;
        nextBtn.disabled = atEnd;
        nextBtn.classList.toggle("is-disabled", atEnd);
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    window.addEventListener("resize", function () {
      goTo(index);
    });

    goTo(0);
  });
}

function initPs5ProductSlider() {
  document.querySelectorAll("[data-ps5-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-ps5-track]");
    var viewport = slider.querySelector("[data-ps5-viewport]");
    var cards = track ? track.querySelectorAll(".eh-ps5-card") : [];
    var prevBtn = slider.querySelector("[data-ps5-prev]");
    var nextBtn = slider.querySelector("[data-ps5-next]");
    var index = 0;

    function getGap() {
      if (!track) return 20;
      return parseFloat(window.getComputedStyle(track).gap) || 20;
    }

    function getStep() {
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getMaxIndex() {
      if (!viewport || !cards.length) return 0;
      var step = getStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
      return Math.max(0, cards.length - visibleCount);
    }

    function goTo(nextIndex) {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(nextIndex, maxIndex));

      if (track) {
        track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
      }

      if (prevBtn) {
        var atStart = index <= 0;
        prevBtn.disabled = atStart;
        prevBtn.classList.toggle("is-disabled", atStart);
      }

      if (nextBtn) {
        var atEnd = index >= maxIndex;
        nextBtn.disabled = atEnd;
        nextBtn.classList.toggle("is-disabled", atEnd);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    window.addEventListener("resize", function () {
      goTo(index);
    });

    goTo(0);
  });
}

function initHeroCarousel() {
  var hero = document.getElementById("ehHero");
  if (!hero) return;

  var slides = Array.from(hero.querySelectorAll(".eh-hero__slide"));
  var panels = Array.from(hero.querySelectorAll(".eh-hero__panel"));
  var dots = Array.from(hero.querySelectorAll(".eh-hero__dot"));
  var prevBtn = document.getElementById("ehHeroPrev");
  var nextBtn = document.getElementById("ehHeroNext");

  if (!slides.length) return;

  var total = slides.length;
  var index = 0;
  var delay = 5500;
  var timer = null;
  var transitioning = false;

  function goTo(nextIndex) {
    if (transitioning || nextIndex === index) return;
    transitioning = true;

    slides[index].classList.remove("is-active");
    panels[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");
    dots[index].setAttribute("aria-selected", "false");
    dots[index].setAttribute("tabindex", "-1");

    index = (nextIndex + total) % total;

    slides[index].classList.add("is-active");
    panels[index].classList.add("is-active");
    dots[index].classList.add("is-active");
    dots[index].setAttribute("aria-selected", "true");
    dots[index].removeAttribute("tabindex");

    window.setTimeout(function () {
      transitioning = false;
    }, 900);
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, delay);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      startAutoplay();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var slideIndex = parseInt(dot.getAttribute("data-slide"), 10);
      if (!Number.isNaN(slideIndex)) {
        goTo(slideIndex);
        startAutoplay();
      }
    });
  });

  hero.addEventListener("mouseenter", stopAutoplay);
  hero.addEventListener("mouseleave", startAutoplay);
  hero.addEventListener("focusin", stopAutoplay);
  hero.addEventListener("focusout", startAutoplay);

  var scrollTopBtn = hero.querySelector(".eh-hero__tool[aria-label='Scroll to top']");
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  startAutoplay();
}
