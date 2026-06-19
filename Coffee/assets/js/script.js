(function () {
  "use strict";

  var nav = document.getElementById("cc-primary-nav");
  var toggle = document.querySelector("[data-cc-menu-toggle]");
  var closeBtn = document.querySelector("[data-cc-menu-close]");
  var overlay = document.querySelector("[data-cc-menu-overlay]");

  if (!nav || !toggle) {
    return;
  }

  function setNavOpen(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("cc-nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");

    if (overlay) {
      overlay.hidden = !open;
    }
  }

  toggle.addEventListener("click", function () {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setNavOpen(false);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      setNavOpen(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });
})();

(function () {
  "use strict";

  var root = document.querySelector("[data-cc-hero]");
  var slider = document.querySelector("[data-cc-hero-slider]");
  var slides = document.querySelectorAll("[data-cc-hero-slide]");
  var dots = document.querySelectorAll("[data-cc-hero-dot]");
  var prevBtn = document.querySelector("[data-cc-hero-prev]");
  var nextBtn = document.querySelector("[data-cc-hero-next]");

  if (!root || !slider || slides.length === 0 || !prevBtn || !nextBtn) {
    return;
  }

  var imageExtensions = ["png", "webp", "jpg", "jpeg"];
  var activeSlide = Number(slider.dataset.currentSlide || 0);
  var timerId = null;
  var intervalMs = 5500;

  slides.forEach(function (slide) {
    var img = slide.querySelector("img[data-banner]");
    if (!img) {
      return;
    }

    var bannerNo = img.dataset.banner;
    var attempt = 1;

    img.addEventListener("error", function () {
      if (attempt >= imageExtensions.length) {
        return;
      }

      var nextExt = imageExtensions[attempt];
      attempt += 1;
      img.src = "assets/img/hero-banner-" + bannerNo + "." + nextExt;
    });
  });

  function goToSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slider.dataset.currentSlide = String(activeSlide);

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function scheduleAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
    }

    timerId = window.setInterval(function () {
      goToSlide(activeSlide + 1);
    }, intervalMs);
  }

  function restartAutoplay(index) {
    goToSlide(index);
    scheduleAutoplay();
  }

  prevBtn.addEventListener("click", function () {
    restartAutoplay(activeSlide - 1);
  });

  nextBtn.addEventListener("click", function () {
    restartAutoplay(activeSlide + 1);
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      restartAutoplay(index);
    });

    dot.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        restartAutoplay(index);
      }
    });
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  });

  root.addEventListener("mouseleave", scheduleAutoplay);

  goToSlide(activeSlide);
  scheduleAutoplay();
})();

(function () {
  "use strict";

  var imageExtensions = ["png", "jpg", "jpeg", "webp"];
  var sections = document.querySelectorAll("[data-cc-bs]");

  if (sections.length === 0) {
    return;
  }

  function initProductCarousel(root) {
    var viewport = root.querySelector("[data-cc-bs-viewport]");
    var track = root.querySelector("[data-cc-bs-track]");
    var cards = root.querySelectorAll(".cc-bs__card");
    var prevBtn = root.querySelector("[data-cc-bs-prev]");
    var nextBtn = root.querySelector("[data-cc-bs-next]");
    var dotsWrap = root.querySelector("[data-cc-bs-dots]");

    if (!viewport || !track || cards.length === 0 || !prevBtn || !nextBtn || !dotsWrap) {
      return;
    }

    var pageIndex = 0;
    var pageCount = 1;
    var perView = 4;

    root.querySelectorAll("img[data-bs-img]").forEach(function (img) {
      var imgNo = img.dataset.bsImg;
      var attempt = 1;

      img.addEventListener("error", function () {
        if (attempt >= imageExtensions.length) {
          return;
        }

        var nextExt = imageExtensions[attempt];
        attempt += 1;
        img.src = "assets/img/BS-" + imgNo + "." + nextExt;
      });
    });

    function getPerView() {
      var width = window.innerWidth;

      if (width <= 520) {
        return 1;
      }

      if (width <= 768) {
        return 2;
      }

      if (width <= 1024) {
        return 3;
      }

      return 4;
    }

    function cardStep() {
      var card = cards[0];
      if (!card) {
        return 0;
      }

      return card.getBoundingClientRect().width;
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      pageCount = Math.max(1, Math.ceil(cards.length / perView));

      for (var i = 0; i < pageCount; i += 1) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "cc-bs__dot" + (i === pageIndex ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Page " + (i + 1));
        dot.setAttribute("aria-selected", i === pageIndex ? "true" : "false");
        dot.setAttribute("tabindex", i === pageIndex ? "0" : "-1");
        dot.dataset.ccBsDot = String(i);
        dotsWrap.appendChild(dot);
      }
    }

    function syncDots() {
      var dots = dotsWrap.querySelectorAll("[data-cc-bs-dot]");

      dots.forEach(function (dot, index) {
        var isActive = index === pageIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.setAttribute("tabindex", isActive ? "0" : "-1");
      });
    }

    function updateControls() {
      prevBtn.disabled = pageIndex <= 0;
      nextBtn.disabled = pageIndex >= pageCount - 1;
    }

    function goToPage(index) {
      perView = getPerView();
      pageCount = Math.max(1, Math.ceil(cards.length / perView));
      pageIndex = Math.max(0, Math.min(index, pageCount - 1));

      var offset = pageIndex * perView * cardStep();
      track.style.transform = "translate3d(-" + offset + "px, 0, 0)";
      syncDots();
      updateControls();
    }

    function refresh() {
      perView = getPerView();
      buildDots();
      goToPage(Math.min(pageIndex, pageCount - 1));
    }

    prevBtn.addEventListener("click", function () {
      goToPage(pageIndex - 1);
    });

    nextBtn.addEventListener("click", function () {
      goToPage(pageIndex + 1);
    });

    dotsWrap.addEventListener("click", function (event) {
      var dot = event.target.closest("[data-cc-bs-dot]");
      if (!dot) {
        return;
      }

      goToPage(Number(dot.dataset.ccBsDot));
    });

    dotsWrap.addEventListener("keydown", function (event) {
      var dot = event.target.closest("[data-cc-bs-dot]");
      if (!dot) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToPage(Number(dot.dataset.ccBsDot));
      }
    });

    root.addEventListener("cc-bs:refresh", refresh);
    refresh();
  }

  sections.forEach(initProductCarousel);

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      sections.forEach(function (root) {
        root.dispatchEvent(new CustomEvent("cc-bs:refresh"));
      });
    }, 120);
  });
})();

(function () {
  "use strict";

  var images = document.querySelectorAll("img[data-promo-img]");
  if (images.length === 0) {
    return;
  }

  var extensions = ["png", "jpg", "jpeg", "webp"];

  images.forEach(function (img) {
    var promoNo = img.dataset.promoImg;
    var attempt = 1;

    img.addEventListener("error", function () {
      if (attempt >= extensions.length) {
        return;
      }

      var nextExt = extensions[attempt];
      attempt += 1;
      img.src = "assets/img/promo-" + promoNo + "." + nextExt;
    });
  });
})();

(function () {
  "use strict";

  var images = document.querySelectorAll("img[data-cc-banner]");
  if (images.length === 0) {
    return;
  }

  var extensions = ["png", "jpg", "jpeg", "webp"];

  images.forEach(function (img) {
    var bannerNo = img.dataset.ccBanner;
    var attempt = 1;

    img.addEventListener("error", function () {
      if (attempt >= extensions.length) {
        return;
      }

      var nextExt = extensions[attempt];
      attempt += 1;
      img.src = "assets/img/banner-" + bannerNo + "." + nextExt;
    });
  });
})();

(function () {
  "use strict";

  var aboutImg = document.querySelector("[data-cc-about-img]");
  if (!aboutImg) {
    return;
  }

  var extensions = ["png", "jpg", "jpeg", "webp"];
  var attempt = 1;

  aboutImg.addEventListener("error", function () {
    if (attempt >= extensions.length) {
      return;
    }

    var nextExt = extensions[attempt];
    attempt += 1;
    aboutImg.src = "assets/img/about." + nextExt;
  });
})();

(function () {
  "use strict";

  var qualityImg = document.querySelector("[data-cc-quality-img]");
  if (!qualityImg) {
    return;
  }

  var extensions = ["webp", "png", "jpg", "jpeg"];
  var attempt = 1;

  qualityImg.addEventListener("error", function () {
    if (attempt >= extensions.length) {
      return;
    }

    var nextExt = extensions[attempt];
    attempt += 1;
    qualityImg.src = "assets/img/coffee." + nextExt;
  });
})();

(function () {
  "use strict";

  var root = document.querySelector("[data-cc-hl]");
  var viewport = document.querySelector("[data-cc-hl-viewport]");
  var track = document.querySelector("[data-cc-hl-track]");
  var dotsWrap = document.querySelector("[data-cc-hl-dots]");

  if (!root || !viewport || !track || !dotsWrap) {
    return;
  }

  var cards = track.querySelectorAll(".cc-hl__card");
  var slideIndex = 0;
  var mobileQuery = window.matchMedia("(max-width: 768px)");
  var touchStartX = 0;
  var touchDeltaX = 0;
  var isDragging = false;

  function isCarouselMode() {
    return mobileQuery.matches;
  }

  function slideWidth() {
    return viewport.getBoundingClientRect().width;
  }

  function buildDots() {
    dotsWrap.innerHTML = "";

    cards.forEach(function (_card, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "cc-hl__dot" + (index === slideIndex ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Highlight " + (index + 1));
      dot.setAttribute("aria-selected", index === slideIndex ? "true" : "false");
      dot.setAttribute("tabindex", index === slideIndex ? "0" : "-1");
      dot.dataset.ccHlDot = String(index);
      dotsWrap.appendChild(dot);
    });
  }

  function syncDots() {
    var dots = dotsWrap.querySelectorAll("[data-cc-hl-dot]");

    dots.forEach(function (dot, index) {
      var isActive = index === slideIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function goToSlide(index) {
    if (!isCarouselMode()) {
      track.style.transform = "";
      return;
    }

    slideIndex = Math.max(0, Math.min(index, cards.length - 1));
    track.style.transform = "translate3d(-" + slideIndex * slideWidth() + "px, 0, 0)";
    syncDots();
  }

  function refresh() {
    buildDots();

    if (!isCarouselMode()) {
      slideIndex = 0;
      track.style.transform = "";
      return;
    }

    goToSlide(slideIndex);
  }

  dotsWrap.addEventListener("click", function (event) {
    var dot = event.target.closest("[data-cc-hl-dot]");

    if (!dot || !isCarouselMode()) {
      return;
    }

    goToSlide(Number(dot.dataset.ccHlDot));
  });

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!isCarouselMode() || event.touches.length !== 1) {
        return;
      }

      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
      isDragging = true;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isDragging || !isCarouselMode() || event.touches.length !== 1) {
        return;
      }

      touchDeltaX = event.touches[0].clientX - touchStartX;

      if (Math.abs(touchDeltaX) > 8) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isDragging || !isCarouselMode()) {
        return;
      }

      isDragging = false;
      var threshold = 48;

      if (touchDeltaX <= -threshold) {
        goToSlide(slideIndex + 1);
      } else if (touchDeltaX >= threshold) {
        goToSlide(slideIndex - 1);
      } else {
        goToSlide(slideIndex);
      }

      touchDeltaX = 0;
    },
    { passive: true }
  );

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", refresh);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(refresh);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refresh, 120);
  });

  refresh();
})();

(function () {
  "use strict";

  var faqRoot = document.querySelector("[data-cc-faq]");
  if (!faqRoot) {
    return;
  }

  var triggers = faqRoot.querySelectorAll("[data-cc-faq-toggle]");

  triggers.forEach(function (trigger) {
    var item = trigger.closest(".cc-faq__item");
    var panelId = trigger.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;

    if (!item || !panel) {
      return;
    }

    function setOpen(open) {
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    }

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      setOpen(!isOpen);
    });
  });
})();
