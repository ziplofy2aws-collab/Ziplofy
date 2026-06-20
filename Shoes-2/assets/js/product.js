(function () {
  if (!window.SH2_PRODUCTS) return;

  var catalog = window.SH2_PRODUCTS;
  var params = new URLSearchParams(window.location.search);
  var productId = (params.get("id") || "tn-1").toLowerCase();
  var product = catalog.get(productId);

  var mainImg = document.querySelector("[data-sh2-pdp-main]");
  var thumbTrack = document.querySelector("[data-sh2-pdp-thumb-track]");
  var colorGrid = document.querySelector("[data-sh2-pdp-color-grid]");
  var colorHeading = document.querySelector("[data-sh2-pdp-color-heading]");
  var titleEl = document.querySelector("[data-sh2-pdp-title]");
  var subtitleEl = document.querySelector("[data-sh2-pdp-subtitle]");
  var priceEl = document.querySelector("[data-sh2-pdp-price]");
  var wasEl = document.querySelector("[data-sh2-pdp-was]");
  var offEl = document.querySelector("[data-sh2-pdp-off]");
  var crumbEl = document.querySelector("[data-sh2-pdp-crumb]");
  var crumbCatEl = document.querySelector("[data-sh2-pdp-crumb-cat]");
  var specListEl = document.querySelector("[data-sh2-pdp-spec-list]");
  var highlightsEl = document.querySelector("[data-sh2-pdp-highlights]");
  var aboutEl = document.querySelector("[data-sh2-pdp-about]");
  var similarTrack = document.querySelector("[data-sh2-pdp-similar-track]");
  var wishBtn = document.querySelector(".sh2-pdp__wish");

  function formatPrice(amount) {
    return catalog.formatPrice(amount);
  }

  function buildSimilarCard(item) {
    var badge =
      item.off > 0
        ? '<span class="sh2-trend__badge">-' + item.off + "%</span>"
        : "";
    var wasPrice =
      item.mrp > item.price
        ? "<del class=\"sh2-trend__was\">" + formatPrice(item.mrp) + "</del>"
        : "";

    return (
      '<article class="sh2-trend__card">' +
      '<a href="' +
      catalog.productHref(item.id) +
      '" class="sh2-trend__card-link">' +
      '<div class="sh2-trend__media">' +
      badge +
      '<img src="' +
      item.images[0] +
      '" alt="' +
      item.name +
      '" width="320" height="240" loading="lazy" decoding="async" />' +
      "</div>" +
      '<div class="sh2-trend__info">' +
      '<h3 class="sh2-trend__name">' +
      item.name +
      "</h3>" +
      '<div class="sh2-trend__prices">' +
      "<strong class=\"sh2-trend__price\">" +
      formatPrice(item.price) +
      "</strong>" +
      wasPrice +
      "</div>" +
      "</div>" +
      "</a>" +
      "</article>"
    );
  }

  function initSimilarCarousel() {
    var section = document.querySelector("[data-sh2-pdp-similar]");
    if (!section) return;

    var viewport = section.querySelector("[data-sh2-pdp-similar-viewport]");
    var track = section.querySelector("[data-sh2-pdp-similar-track]");
    var nextBtn = section.querySelector("[data-sh2-pdp-similar-next]");
    var progressBar = section.querySelector("[data-sh2-pdp-similar-progress]");
    var cards = track ? track.querySelectorAll(".sh2-trend__card") : [];
    var index = 0;
    var mqlTouch = window.matchMedia("(max-width: 768px)");

    if (!viewport || !track || !cards.length) return;

    function isTouchMode() {
      return mqlTouch.matches;
    }

    function getGap() {
      return parseFloat(window.getComputedStyle(track).gap) || 14;
    }

    function getStep() {
      if (!cards.length) return 0;
      return cards[0].getBoundingClientRect().width + getGap();
    }

    function getMaxIndex() {
      var visible = viewport.getBoundingClientRect().width;
      var total = track.scrollWidth;
      var step = getStep();
      if (step <= 0) return 0;
      return Math.max(0, Math.ceil((total - visible) / step));
    }

    function updateProgress() {
      if (!progressBar) return;

      var visible = viewport.getBoundingClientRect().width;
      var total = track.scrollWidth;
      var maxIndex = getMaxIndex();
      var visiblePercent = total > 0 ? (visible / total) * 100 : 100;

      progressBar.style.width = Math.min(100, visiblePercent) + "%";

      if (maxIndex > 0) {
        var offset = (index / maxIndex) * (100 - visiblePercent);
        progressBar.style.marginLeft = offset + "%";
      } else {
        progressBar.style.marginLeft = "0";
      }
    }

    function updateArrows() {
      if (!nextBtn || isTouchMode()) return;
      nextBtn.disabled = index >= getMaxIndex();
    }

    function updateTrack() {
      if (isTouchMode()) {
        track.style.transform = "";
        updateArrows();
        updateProgress();
        return;
      }

      var step = getStep();
      var maxIndex = getMaxIndex();
      if (index > maxIndex) index = maxIndex;
      if (index < 0) index = 0;
      track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
      updateArrows();
      updateProgress();
    }

    function scrollNext() {
      if (isTouchMode()) {
        viewport.scrollBy({ left: getStep(), behavior: "smooth" });
        return;
      }

      if (index < getMaxIndex()) {
        index += 1;
        updateTrack();
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", scrollNext);
    }

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    });

    if (isTouchMode()) {
      viewport.style.overflowX = "auto";
      viewport.style.scrollbarWidth = "none";
      viewport.style.webkitOverflowScrolling = "touch";
    }

    mqlTouch.addEventListener("change", function () {
      index = 0;
      updateTrack();
    });

    window.addEventListener("resize", updateTrack);

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(updateTrack).observe(viewport);
    }

    updateTrack();
  }

  function renderProduct(data) {
    document.title = data.title + " — SOLVÉ";

    if (titleEl) titleEl.textContent = data.title;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;
    if (priceEl) priceEl.textContent = formatPrice(data.price);
    if (wasEl) wasEl.textContent = "MRP " + formatPrice(data.mrp);
    if (offEl) offEl.textContent = "(" + data.off + "% off)";
    if (crumbCatEl) crumbCatEl.textContent = data.category;
    if (crumbEl) crumbEl.textContent = data.name;
    if (colorHeading) {
      colorHeading.textContent = "Select Colour (" + data.colors + " Colors)";
    }

    if (mainImg) {
      mainImg.src = data.images[0];
      mainImg.alt = data.name;
    }

    if (thumbTrack) {
      thumbTrack.innerHTML = data.images
        .map(function (src, index) {
          var active = index === 0 ? " is-active" : "";
          var lazy = index === 0 ? "" : ' loading="lazy"';
          return (
            '<button type="button" class="sh2-pdp__thumb' +
            active +
            '" data-sh2-pdp-thumb data-src="' +
            src +
            '" data-alt="' +
            data.name +
            " — view " +
            (index + 1) +
            '" aria-label="View ' +
            (index + 1) +
            '">' +
            '<img src="' +
            src +
            '" alt="" width="64" height="64"' +
            (index === 0 ? ' decoding="async"' : lazy + ' decoding="async"') +
            " />" +
            "</button>"
          );
        })
        .join("");
    }

    if (colorGrid) {
      colorGrid.innerHTML = data.images
        .slice(0, data.colors)
        .map(function (src, index) {
          var active = index === 0 ? " is-active" : "";
          var lazy = index === 0 ? "" : ' loading="lazy"';
          return (
            '<button type="button" class="sh2-pdp__color-opt' +
            active +
            '" data-sh2-pdp-color data-src="' +
            src +
            '" aria-label="Colour ' +
            (index + 1) +
            '">' +
            '<img src="' +
            src +
            '" alt="" width="64" height="64"' +
            (index === 0 ? ' decoding="async"' : lazy + ' decoding="async"') +
            " />" +
            "</button>"
          );
        })
        .join("");
    }

    if (specListEl) {
      specListEl.innerHTML = data.specs
        .map(function (item) {
          return (
            "<li><span>" +
            item.label +
            "</span><strong>" +
            item.value +
            "</strong></li>"
          );
        })
        .join("");
    }

    if (highlightsEl) {
      highlightsEl.innerHTML = data.highlights
        .map(function (item) {
          return "<li>" + item + "</li>";
        })
        .join("");
    }

    if (aboutEl) aboutEl.textContent = data.about;

    if (similarTrack) {
      var similar = catalog.getAll().filter(function (item) {
        return item.id !== data.id;
      });

      similarTrack.innerHTML = similar.map(buildSimilarCard).join("");
    }
  }

  function setMainImage(src, alt) {
    if (!mainImg || !src) return;
    mainImg.src = src;
    if (alt) mainImg.alt = alt;
  }

  function bindGalleryEvents() {
    var thumbs = document.querySelectorAll("[data-sh2-pdp-thumb]");
    var thumbUp = document.querySelector("[data-sh2-pdp-thumb-up]");
    var thumbDown = document.querySelector("[data-sh2-pdp-thumb-down]");
    var colors = document.querySelectorAll("[data-sh2-pdp-color]");
    var sizes = document.querySelectorAll("[data-sh2-pdp-size]");

    function syncThumbNav() {
      if (!thumbTrack || !thumbUp || !thumbDown) return;
      var maxScroll = thumbTrack.scrollHeight - thumbTrack.clientHeight;
      thumbUp.disabled = thumbTrack.scrollTop <= 0;
      thumbDown.disabled = thumbTrack.scrollTop >= maxScroll - 1;
    }

    function scrollThumbTrack(direction) {
      if (!thumbTrack) return;
      thumbTrack.scrollBy({ top: direction * 80, behavior: "smooth" });
      window.setTimeout(syncThumbNav, 220);
    }

    if (thumbTrack) {
      thumbTrack.addEventListener("scroll", syncThumbNav);
      syncThumbNav();
    }

    if (thumbUp) {
      thumbUp.addEventListener("click", function () {
        scrollThumbTrack(-1);
      });
    }

    if (thumbDown) {
      thumbDown.addEventListener("click", function () {
        scrollThumbTrack(1);
      });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-src");
        var alt = thumb.getAttribute("data-alt");
        setMainImage(src, alt);
        thumbs.forEach(function (item) {
          item.classList.toggle("is-active", item === thumb);
        });
      });
    });

    colors.forEach(function (colorBtn) {
      colorBtn.addEventListener("click", function () {
        var src = colorBtn.getAttribute("data-src");
        setMainImage(src, product.name);
        colors.forEach(function (item) {
          item.classList.toggle("is-active", item === colorBtn);
        });
        thumbs.forEach(function (thumb) {
          var thumbSrc = thumb.getAttribute("data-src");
          var isMatch = thumbSrc === src;
          thumb.classList.toggle("is-active", isMatch);
          if (isMatch) {
            thumb.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        });
        window.setTimeout(syncThumbNav, 220);
      });
    });

    sizes.forEach(function (sizeBtn) {
      if (sizeBtn.classList.contains("is-disabled")) return;
      sizeBtn.addEventListener("click", function () {
        sizes.forEach(function (item) {
          item.classList.toggle("is-active", item === sizeBtn);
        });
      });
    });
  }

  function bindAccordions() {
    document.querySelectorAll("[data-sh2-pdp-acc]").forEach(function (item) {
      var toggle = item.querySelector("[data-sh2-pdp-acc-toggle]");
      if (!toggle) return;
      toggle.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  if (wishBtn) {
    wishBtn.addEventListener("click", function () {
      var icon = wishBtn.querySelector("i");
      if (!icon) return;
      var isActive = icon.classList.contains("fa-solid");
      icon.classList.toggle("fa-regular", isActive);
      icon.classList.toggle("fa-solid", !isActive);
      wishBtn.setAttribute(
        "aria-label",
        isActive ? "Add to wishlist" : "Remove from wishlist"
      );
    });
  }

  renderProduct(product);
  bindGalleryEvents();
  bindAccordions();
  initSimilarCarousel();
  window.dispatchEvent(new CustomEvent("sh2:motion-refresh"));
})();
