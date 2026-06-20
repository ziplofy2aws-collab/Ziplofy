(function () {
  var menuToggle = document.querySelector("[data-pc-menu-toggle]");
  var navBar = document.querySelector(".pc-header__nav-bar");
  var closeBtn = document.querySelector("[data-pc-menu-close]");
  var backdrop = document.querySelector("[data-pc-nav-backdrop]");

  if (navBar && !backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "pc-header__nav-backdrop";
    backdrop.setAttribute("data-pc-nav-backdrop", "");
    document.body.appendChild(backdrop);
  }

  function closeMenu() {
    if (!navBar) return;
    navBar.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-visible");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!navBar) return;
    navBar.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-visible");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  if (menuToggle && navBar) {
    menuToggle.addEventListener("click", function () {
      if (navBar.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);

  if (navBar) {
    navBar.querySelectorAll(".pc-header__nav-link").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  var hero = document.querySelector("[data-pc-hero]");
  if (hero) {
    var slides = hero.querySelectorAll(".pc-hero__slide");
    var prevBtn = hero.querySelector("[data-pc-hero-prev]");
    var nextBtn = hero.querySelector("[data-pc-hero-next]");
    var currentIndex = 0;

    if (slides.length) {
      function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === currentIndex);
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo(currentIndex + 1);
        });
      }
    }
  }

  var recSection = document.querySelector("[data-pc-rec]");
  if (recSection) {
    var viewAllBtn = recSection.querySelector("[data-pc-rec-view-all]");
    var recSlider = recSection.querySelector("[data-pc-rec-slider]");
    var recViewport = recSection.querySelector("[data-pc-rec-viewport]");
    var recTrack = recSection.querySelector("[data-pc-rec-grid]");
    var recNext = recSection.querySelector("[data-pc-rec-next]");
    var recPrev = recSection.querySelector("[data-pc-rec-prev]");
    var recIndex = 0;

    function isRecMobileCarousel() {
      return window.innerWidth <= 768;
    }

    function getRecCards() {
      if (!recTrack) return [];
      return Array.prototype.filter.call(recTrack.children, function (card) {
        return card.classList.contains("pc-rec-card");
      });
    }

    function updateRecCarousel() {
      if (!recTrack || !recViewport || !recNext) return;

      var cards = getRecCards();
      if (!cards.length) return;

      var singleCard = cards.length <= 1;

      if (!isRecMobileCarousel()) {
        recTrack.style.transform = "";
        recNext.classList.remove("is-disabled");
        if (recPrev) recPrev.classList.remove("is-disabled");
        recIndex = 0;
        return;
      }

      if (recIndex >= cards.length) recIndex = 0;
      if (recIndex < 0) recIndex = cards.length - 1;

      var step = recViewport.clientWidth;
      recTrack.style.transform = "translateX(-" + recIndex * step + "px)";
      recNext.classList.toggle("is-disabled", singleCard);
      if (recPrev) recPrev.classList.toggle("is-disabled", singleCard);
    }

    if (recSlider && recViewport && recTrack && recNext && recSlider.dataset.pcRecReady !== "true") {
      recSlider.dataset.pcRecReady = "true";

      recNext.addEventListener("click", function () {
        var cards = getRecCards();
        if (!cards.length || !isRecMobileCarousel()) return;
        recIndex = recIndex + 1 >= cards.length ? 0 : recIndex + 1;
        updateRecCarousel();
      });

      if (recPrev) {
        recPrev.addEventListener("click", function () {
          var cards = getRecCards();
          if (!cards.length || !isRecMobileCarousel()) return;
          recIndex = recIndex - 1 < 0 ? cards.length - 1 : recIndex - 1;
          updateRecCarousel();
        });
      }

      window.addEventListener("resize", updateRecCarousel);
      updateRecCarousel();
    }

    if (viewAllBtn) {
      function syncViewAllVisibility() {
        var hasHidden = recSection.querySelectorAll("[data-pc-rec-hidden]").length > 0;
        if (isRecMobileCarousel() || hasHidden) {
          viewAllBtn.classList.remove("is-hidden");
        } else {
          viewAllBtn.classList.add("is-hidden");
        }
      }

      viewAllBtn.addEventListener("click", function () {
        if (isRecMobileCarousel()) {
          window.location.href = "category.html";
          return;
        }

        var hiddenCards = recSection.querySelectorAll("[data-pc-rec-hidden]");
        if (hiddenCards.length) {
          var nextCard = hiddenCards[0];
          nextCard.classList.remove("is-hidden");
          nextCard.classList.add("is-revealing");
          nextCard.removeAttribute("data-pc-rec-hidden");
          syncViewAllVisibility();
          return;
        }

        window.location.href = "category.html";
      });

      window.addEventListener("resize", syncViewAllVisibility);
      syncViewAllVisibility();
    }
  }

  var bsSection = document.querySelector("[data-pc-bs]");
  if (bsSection) {
    var bsViewport = bsSection.querySelector("[data-pc-bs-viewport]");
    var bsTrack = bsSection.querySelector("[data-pc-bs-track]");
    var bsNext = bsSection.querySelector("[data-pc-bs-next]");
    var bsPrev = bsSection.querySelector("[data-pc-bs-prev]");
    var bsIndex = 0;

    if (bsViewport && bsTrack && bsNext) {
      function getBsGap() {
        var styles = window.getComputedStyle(bsTrack);
        return parseFloat(styles.gap || styles.columnGap || "14") || 14;
      }

      function getBsStep() {
        var card = bsTrack.querySelector(".pc-bs-card");
        if (!card) return bsViewport.clientWidth;
        return card.offsetWidth + getBsGap();
      }

      function getBsMaxIndex() {
        return Math.max(0, bsTrack.children.length - Math.floor(bsViewport.clientWidth / getBsStep()));
      }

      function updateBsCarousel() {
        var maxIndex = getBsMaxIndex();
        bsIndex = Math.min(bsIndex, maxIndex);
        bsTrack.style.transform = "translateX(-" + bsIndex * getBsStep() + "px)";
      }

      bsNext.addEventListener("click", function () {
        var maxIndex = getBsMaxIndex();
        bsIndex = bsIndex >= maxIndex ? 0 : bsIndex + 1;
        updateBsCarousel();
      });

      if (bsPrev) {
        bsPrev.addEventListener("click", function () {
          var maxIndex = getBsMaxIndex();
          bsIndex = bsIndex <= 0 ? maxIndex : bsIndex - 1;
          updateBsCarousel();
        });
      }

      window.addEventListener("resize", updateBsCarousel);
      updateBsCarousel();
    }
  }

  document.querySelectorAll("[data-pc-product-id]").forEach(function (card) {
    card.style.cursor = "pointer";
    card.addEventListener("click", function (event) {
      if (event.target.closest("button, a")) return;
      var id = card.getAttribute("data-pc-product-id");
      if (id) window.location.href = "product.html?id=" + encodeURIComponent(id);
    });
  });
})();
