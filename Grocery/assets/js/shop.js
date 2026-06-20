/**
 * Shop & product page interactions
 */
(function () {
  "use strict";

  function initShopCatsSlider() {
    var section = document.querySelector("[data-grc-shop-cats]");
    if (!section) return;

    var viewport = section.querySelector("[data-grc-shop-cats-viewport]");
    var track = section.querySelector("[data-grc-shop-cats-track]");
    var items = section.querySelectorAll(".grc-shop-cats__item");
    var prevBtn = section.querySelector("[data-grc-shop-cats-prev]");
    var nextBtn = section.querySelector("[data-grc-shop-cats-next]");
    var progressThumb = section.querySelector("[data-grc-shop-cats-progress]");

    if (!viewport || !track || !items.length || !prevBtn || !nextBtn) return;

    var index = 0;
    var mobileMq = window.matchMedia("(max-width: 768px)");
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMoved = false;

    function isMobileView() {
      return mobileMq.matches;
    }

    function getStep() {
      var item = items[0];
      if (!item) return 0;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return item.getBoundingClientRect().width + gap;
    }

    function getVisibleCount() {
      var step = getStep();
      if (!step) return 1;
      return Math.max(1, Math.floor(viewport.getBoundingClientRect().width / step));
    }

    function getMaxIndex() {
      return Math.max(0, items.length - getVisibleCount());
    }

    function updateProgress() {
      if (!progressThumb) return;

      var visible = getVisibleCount();
      var thumbWidth = Math.min(100, (visible / items.length) * 100);
      progressThumb.style.setProperty("--grc-shop-cats-progress-size", thumbWidth + "%");

      var travel = Math.max(0, 100 - thumbWidth);
      var progress = 0;

      if (isMobileView()) {
        var maxScroll = viewport.scrollWidth - viewport.clientWidth;
        progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
      } else {
        var maxIndex = getMaxIndex();
        progress = maxIndex > 0 ? index / maxIndex : 0;
      }

      progressThumb.style.left = progress * travel + "%";
    }

    function updateDesktopControls() {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(index, maxIndex));
      track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

      prevBtn.hidden = index <= 0;
      nextBtn.hidden = index >= maxIndex;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;

      updateProgress();
    }

    function syncMobileScroll() {
      track.style.transform = "";
      var step = getStep();
      if (!step) return;
      index = Math.max(0, Math.min(getMaxIndex(), Math.round(viewport.scrollLeft / step)));
      updateProgress();
    }

    function scrollToIndex(nextIndex, smooth) {
      var step = getStep();
      if (!step) return;
      index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
      viewport.scrollTo({
        left: index * step,
        behavior: smooth === false ? "auto" : "smooth",
      });
    }

    function applyMode() {
      if (isMobileView()) {
        track.style.transform = "";
        prevBtn.hidden = true;
        nextBtn.hidden = true;
        scrollToIndex(index, false);
        syncMobileScroll();
      } else {
        viewport.scrollLeft = 0;
        updateDesktopControls();
      }
    }

    prevBtn.addEventListener("click", function () {
      index -= 1;
      if (isMobileView()) {
        scrollToIndex(index);
      } else {
        updateDesktopControls();
      }
    });

    nextBtn.addEventListener("click", function () {
      index += 1;
      if (isMobileView()) {
        scrollToIndex(index);
      } else {
        updateDesktopControls();
      }
    });

    viewport.addEventListener(
      "scroll",
      function () {
        if (!isMobileView()) return;
        syncMobileScroll();
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches.length) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (e) {
        if (!e.touches.length) return;
        var dx = e.touches[0].clientX - touchStartX;
        var dy = e.touches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          touchMoved = true;
        }
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchend",
      function (e) {
        if (isMobileView() || !e.changedTouches.length) return;

        var diff = e.changedTouches[0].clientX - touchStartX;
        if (!touchMoved || Math.abs(diff) < 40) return;

        if (diff < 0) {
          index += 1;
        } else {
          index -= 1;
        }
        updateDesktopControls();
      },
      { passive: true }
    );

    viewport.addEventListener(
      "click",
      function (e) {
        if (touchMoved) {
          e.preventDefault();
          touchMoved = false;
        }
      },
      true
    );

    window.addEventListener(
      "resize",
      function () {
        applyMode();
      },
      { passive: true }
    );

    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", applyMode);
    } else if (typeof mobileMq.addListener === "function") {
      mobileMq.addListener(applyMode);
    }

    applyMode();
  }

  initShopCatsSlider();

  function initProductStickyInfo() {
    var mediaCol = document.querySelector(".grc-product__media-col");
    var info = document.querySelector(".grc-product__info");
    if (!mediaCol || !info || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    function getHeaderOffset() {
      var header = document.querySelector(".grc-header");
      return (header ? header.offsetHeight : 120) + 16;
    }

    gsap.matchMedia().add("(min-width: 993px)", function () {
      var st = ScrollTrigger.create({
        trigger: mediaCol,
        start: function () {
          return "top top+=" + getHeaderOffset();
        },
        end: "bottom bottom",
        pin: info,
        pinSpacing: false,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      });

      return function () {
        st.kill();
        gsap.set(info, { clearProps: "all" });
      };
    });
  }

  initProductStickyInfo();

  function initShopFilters() {
    var filterToggle = document.querySelector("[data-grc-filter-toggle]");
    var filterCloseBtns = document.querySelectorAll("[data-grc-filter-close]");
    var sidebar = document.querySelector("[data-grc-shop-sidebar]");
    var overlay = document.querySelector("[data-grc-filter-overlay]");

    if (!filterToggle || !sidebar || !overlay) return;

    function isSheetMode() {
      return window.matchMedia("(max-width: 992px)").matches;
    }

    function setOpen(open) {
      if (!isSheetMode()) {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("is-visible");
        overlay.hidden = true;
        filterToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("grc-filter-open");
        return;
      }

      sidebar.classList.toggle("is-open", open);
      overlay.classList.toggle("is-visible", open);
      overlay.hidden = !open;
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("grc-filter-open", open);
    }

    filterToggle.addEventListener("click", function () {
      setOpen(!sidebar.classList.contains("is-open"));
    });

    filterCloseBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setOpen(false);
      });
    });

    overlay.addEventListener("click", function () {
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    window.addEventListener(
      "resize",
      function () {
        if (!isSheetMode()) {
          setOpen(false);
        }
      },
      { passive: true }
    );
  }

  initShopFilters();

  var mainImage = document.querySelector("[data-grc-product-main-img]");
  var thumbs = document.querySelectorAll("[data-grc-product-thumb]");

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var src = thumb.getAttribute("data-src");
      if (!src || !mainImage) return;

      mainImage.src = src;
      thumbs.forEach(function (t) {
        t.classList.toggle("is-active", t === thumb);
      });
    });
  });

  var accTriggers = document.querySelectorAll("[data-grc-acc-trigger]");
  accTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest(".grc-product__acc-item");
      var panel = item ? item.querySelector(".grc-product__acc-panel") : null;
      if (!item || !panel) return;

      var isOpen = item.classList.contains("is-open");

      if (isOpen) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        return;
      }

      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    });
  });

  var packButtons = document.querySelectorAll("[data-grc-product-pack]");
  var priceEl = document.querySelector("[data-grc-product-price]");
  var unitEl = document.querySelector("[data-grc-product-unit]");

  packButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      packButtons.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });

      if (priceEl && btn.dataset.price) {
        priceEl.textContent = "₹" + btn.dataset.price;
      }

      if (unitEl && btn.dataset.unit) {
        unitEl.textContent = btn.dataset.unit;
      }
    });
  });
})();
