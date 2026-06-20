(function () {
  var products = window.MA_PRODUCTS || {};
  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id") || "aerosynq-snap-2";
  var product = products[productId] || products["aerosynq-snap-2"];
  var galleryIndex = 0;
  var thumbOffset = 0;
  var selectedColor = 0;

  if (!product) return;

  document.title = product.name + " — Mobexa";

  var mainImg = document.querySelector("[data-ma-product-image]");
  var thumbsTrack = document.querySelector("[data-ma-product-thumbs]");
  var thumbsViewport = document.querySelector("[data-ma-product-thumbs-viewport]");
  var galleryPrev = document.querySelector("[data-ma-gallery-prev]");
  var galleryNext = document.querySelector("[data-ma-gallery-next]");
  var thumbUp = document.querySelector("[data-ma-gallery-up]");
  var thumbDown = document.querySelector("[data-ma-gallery-down]");
  var badgeEl = document.querySelector("[data-ma-product-badge]");
  var compatEl = document.querySelector("[data-ma-product-compat]");
  var titleEl = document.querySelector("[data-ma-product-title]");
  var descEl = document.querySelector("[data-ma-product-desc]");
  var starsEl = document.querySelector("[data-ma-product-stars]");
  var reviewsEl = document.querySelector("[data-ma-product-reviews]");
  var priceEl = document.querySelector("[data-ma-product-price]");
  var compareEl = document.querySelector("[data-ma-product-compare]");
  var cashbackEl = document.querySelector("[data-ma-product-cashback]");
  var emiPriceEl = document.querySelector("[data-ma-product-emi-price]");
  var emiOptionsEl = document.querySelector("[data-ma-product-emi-options]");
  var colorNameEl = document.querySelector("[data-ma-product-color-name]");
  var colorsEl = document.querySelector("[data-ma-product-colors]");
  var featuresEl = document.querySelector("[data-ma-product-features]");
  var descPanel = document.querySelector("[data-ma-product-description]");
  var shippingPanel = document.querySelector("[data-ma-product-shipping]");
  var crumbEl = document.querySelector("[data-ma-product-crumb-name]");
  var relatedEl = document.querySelector("[data-ma-product-related]");
  var accordionToggles = document.querySelectorAll("[data-ma-accordion-toggle]");
  var highlightsEl = document.querySelector("[data-ma-product-highlights]");
  var specsPanels = document.querySelectorAll("[data-ma-specs-panel]");
  var specsToggles = document.querySelectorAll("[data-ma-specs-toggle]");
  var reviewsAvgEl = document.querySelector("[data-ma-reviews-avg]");
  var reviewsBarsEl = document.querySelector("[data-ma-reviews-bars]");
  var reviewsMediaEl = document.querySelector("[data-ma-reviews-media]");
  var reviewsListEl = document.querySelector("[data-ma-reviews-list]");
  var reviewsSortEl = document.querySelector("[data-ma-reviews-sort]");
  var stickyBar = document.querySelector("[data-ma-product-sticky]");
  var stickyImage = document.querySelector("[data-ma-sticky-image]");
  var stickyName = document.querySelector("[data-ma-sticky-name]");
  var stickyPrice = document.querySelector("[data-ma-sticky-price]");
  var stickyCompare = document.querySelector("[data-ma-sticky-compare]");
  var stickyColor = document.querySelector("[data-ma-sticky-color]");
  var stickyCart = document.querySelector("[data-ma-sticky-cart]");
  var scrollTopBtn = document.querySelector("[data-ma-product-scroll-top]");
  var addToCartBtn = document.querySelector("[data-ma-product-cart]");
  var reviewItemsCache = [];

  function getGallery() {
    if (product.gallery && product.gallery.length) return product.gallery;
    return [product.image];
  }

  function getColorOptions() {
    if (product.colorOptions && product.colorOptions.length) return product.colorOptions;
    if (product.colors && product.colors.length) {
      return product.colors.map(function (color, index) {
        return { name: "OPTION " + (index + 1), image: product.image };
      });
    }
    return [{ name: "DEFAULT", image: product.image }];
  }

  function getFeatures() {
    if (product.features && product.features.length) return product.features;
    return [product.desc, "Premium build quality", "Reliable everyday performance", "Official warranty included"];
  }

  function getDescription() {
    return product.description || product.desc || "";
  }

  function getShipping() {
    return (
      product.shipping ||
      "Free standard delivery on prepaid orders. Easy 7-day replacement on manufacturing defects."
    );
  }

  function renderStars(rating) {
    if (!starsEl) return;
    starsEl.innerHTML = buildStarsHtml(rating);
  }

  function buildStarsHtml(rating) {
    var value = Math.max(0, Math.min(5, Math.round(rating || 0)));
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html +=
        '<i class="fa-solid fa-star' +
        (i > value ? " is-empty" : "") +
        '" aria-hidden="true"></i>';
    }
    return html;
  }

  function formatColorLabel(name) {
    if (!name) return "";
    return name.charAt(0) + name.slice(1).toLowerCase();
  }

  function setSelectedColor(index) {
    var options = getColorOptions();
    selectedColor = Math.max(0, Math.min(options.length - 1, index));
    if (colorsEl) {
      colorsEl.querySelectorAll(".ma-product-page__color").forEach(function (el, i) {
        el.classList.toggle("is-active", i === selectedColor);
      });
    }
    if (colorNameEl) colorNameEl.textContent = options[selectedColor].name;
    if (mainImg && options[selectedColor].image) {
      mainImg.src = options[selectedColor].image;
    }
    if (stickyColor) stickyColor.value = String(selectedColor);
  }

  function setGalleryImage(index) {
    var gallery = getGallery();
    galleryIndex = (index + gallery.length) % gallery.length;
    if (mainImg) {
      mainImg.src = gallery[galleryIndex];
      mainImg.alt = product.name;
    }
    if (!thumbsTrack) return;
    thumbsTrack.querySelectorAll(".ma-product-page__thumb").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === galleryIndex);
    });
  }

  function updateThumbScroll() {
    if (!thumbsTrack || !thumbsViewport) return;
    var thumb = thumbsTrack.querySelector(".ma-product-page__thumb");
    if (!thumb) return;
    var step = thumb.offsetHeight + 10;
    thumbsTrack.style.transform = "translateY(-" + thumbOffset * step + "px)";
    var maxOffset = Math.max(0, thumbsTrack.children.length - 5);
    if (thumbUp) thumbUp.disabled = thumbOffset <= 0;
    if (thumbDown) thumbDown.disabled = thumbOffset >= maxOffset;
  }

  function renderGallery() {
    var gallery = getGallery();
    setGalleryImage(0);

    if (!thumbsTrack) return;
    thumbsTrack.innerHTML = gallery
      .map(function (src, index) {
        return (
          '<button type="button" class="ma-product-page__thumb' +
          (index === 0 ? " is-active" : "") +
          '" data-ma-product-thumb="' +
          index +
          '" aria-label="View image ' +
          (index + 1) +
          '">' +
          '<img src="' +
          src +
          '" alt="" width="72" height="72" loading="lazy" decoding="async" />' +
          "</button>"
        );
      })
      .join("");

    thumbsTrack.querySelectorAll("[data-ma-product-thumb]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setGalleryImage(parseInt(btn.getAttribute("data-ma-product-thumb"), 10) || 0);
      });
    });

    thumbOffset = 0;
    updateThumbScroll();
  }

  function renderColors() {
    var options = getColorOptions();
    if (!colorsEl) return;

    colorsEl.innerHTML = options
      .map(function (option, index) {
        return (
          '<button type="button" class="ma-product-page__color' +
          (index === 0 ? " is-active" : "") +
          '" data-ma-product-color="' +
          index +
          '" aria-label="' +
          option.name +
          '">' +
          '<img src="' +
          option.image +
          '" alt="" width="52" height="52" loading="lazy" decoding="async" />' +
          "</button>"
        );
      })
      .join("");

    colorsEl.querySelectorAll("[data-ma-product-color]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setSelectedColor(parseInt(btn.getAttribute("data-ma-product-color"), 10) || 0);
      });
    });

    if (colorNameEl) colorNameEl.textContent = options[0].name;
    if (stickyColor) {
      stickyColor.innerHTML = options
        .map(function (option, index) {
          return (
            '<option value="' +
            index +
            '">' +
            formatColorLabel(option.name) +
            "</option>"
          );
        })
        .join("");
      stickyColor.addEventListener("change", function () {
        setSelectedColor(parseInt(stickyColor.value, 10) || 0);
      });
    }
  }

  function renderFeatureVisual(type) {
    switch (type) {
      case "wired":
        return (
          '<div class="ma-product-highlight__wired">' +
          '<div class="ma-product-highlight__big">22.5W</div>' +
          '<div class="ma-product-highlight__wired-sub">' +
          '<span class="ma-product-highlight__mid">BoostedSpeed™</span>' +
          '<span class="ma-product-highlight__small">Output(Wired)</span>' +
          "</div></div>"
        );
      case "battery":
        return (
          '<div class="ma-product-highlight__battery">' +
          '<div class="ma-product-highlight__battery-main">' +
          '<span class="ma-product-highlight__big">10000</span>' +
          '<span class="ma-product-highlight__battery-unit">mAh</span>' +
          "</div>" +
          '<span class="ma-product-highlight__mid">Battery Capacity</span>' +
          "</div>"
        );
      case "magsafe":
        return (
          '<div class="ma-product-highlight__magsafe">' +
          '<p class="ma-product-highlight__magsafe-text">MagSafe Charging Compatible</p>' +
          '<div class="ma-product-highlight__magsafe-graphic" aria-hidden="true">' +
          '<span class="ma-product-highlight__ring"></span>' +
          '<span class="ma-product-highlight__connector"></span>' +
          "</div></div>"
        );
      case "dual":
        return (
          '<div class="ma-product-highlight__dual">' +
          '<p class="ma-product-highlight__dual-title">' +
          '<span class="ma-product-highlight__dual-main">DUAL</span> Output Ports' +
          "</p>" +
          '<div class="ma-product-highlight__ports">' +
          '<span class="ma-product-highlight__port"><i class="fa-brands fa-usb" aria-hidden="true"></i> USB A</span>' +
          '<span class="ma-product-highlight__port"><i class="fa-solid fa-plug" aria-hidden="true"></i> TYPE C</span>' +
          "</div></div>"
        );
      case "protocols":
        return (
          '<div class="ma-product-highlight__protocols">' +
          '<span class="ma-product-highlight__protocol"><i class="fa-solid fa-bolt" aria-hidden="true"></i></span>' +
          '<span class="ma-product-highlight__protocol">PD</span>' +
          '<span class="ma-product-highlight__protocol">VOOC</span>' +
          '<span class="ma-product-highlight__protocol">PPS</span>' +
          "</div>"
        );
      case "compact":
        return '<p class="ma-product-highlight__label-text"><span>Compact</span> Size</p>';
      case "iphone":
        return (
          '<p class="ma-product-highlight__label-text ma-product-highlight__label-text--iphone">' +
          "<span>Designed for</span>" +
          "<strong>iPhone 12</strong>" +
          "<span>Series &amp; Above</span>" +
          "</p>"
        );
      case "wireless":
        return '<p class="ma-product-highlight__label-text"><span>15W</span> Wireless Charging</p>';
      default:
        return "";
    }
  }

  function renderFeatureHighlights() {
    if (!highlightsEl) return;
    var tiles = product.featureTiles || [];
    if (!tiles.length) {
      highlightsEl.closest(".ma-product-highlights").hidden = true;
      return;
    }

    var firstRow = tiles.slice(0, 4);
    var secondRow = tiles.slice(4, 8);

    var topVisuals = firstRow
      .map(function (tile) {
        return (
          '<div class="ma-product-highlights__cell">' +
          '<div class="ma-product-highlight__visual">' +
          renderFeatureVisual(tile.type) +
          "</div></div>"
        );
      })
      .join("");

    var textRow = firstRow
      .map(function (tile) {
        return (
          '<div class="ma-product-highlights__cell ma-product-highlights__cell--text">' +
          '<h3 class="ma-product-highlight__title">' +
          tile.title +
          "</h3>" +
          '<p class="ma-product-highlight__desc">' +
          tile.desc +
          "</p></div>"
        );
      })
      .join("");

    var bottomVisuals = secondRow
      .map(function (tile) {
        return (
          '<div class="ma-product-highlights__cell">' +
          '<div class="ma-product-highlight__visual">' +
          renderFeatureVisual(tile.type) +
          "</div></div>"
        );
      })
      .join("");

    highlightsEl.innerHTML =
      '<div class="ma-product-highlights__visual-row">' +
      topVisuals +
      "</div>" +
      '<div class="ma-product-highlights__text-row">' +
      textRow +
      "</div>" +
      '<div class="ma-product-highlights__visual-row">' +
      bottomVisuals +
      "</div>";
  }

  function renderSpecsPanels() {
    specsPanels.forEach(function (panel) {
      var key = panel.getAttribute("data-ma-specs-panel");
      if (key === "specs") panel.innerHTML = product.specsHtml || "<p>Specifications coming soon.</p>";
      if (key === "manual") panel.innerHTML = product.manualHtml || "<p>User manual coming soon.</p>";
    });
  }

  function getReviewSummary() {
    if (product.reviewsSummary) return product.reviewsSummary;
    return {
      average: product.rating || 4,
      total: product.reviews || 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  function renderReviewsSummary() {
    if (!reviewsAvgEl) return;
    var summary = getReviewSummary();
    reviewsAvgEl.innerHTML =
      '<div class="ma-product-reviews__avg-score">' +
      Number(summary.average).toFixed(2) +
      " out of 5</div>" +
      '<div class="ma-product-reviews__avg-stars" aria-hidden="true">' +
      buildStarsHtml(summary.average) +
      "</div>" +
      '<p class="ma-product-reviews__avg-based"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>Based on ' +
      summary.total +
      " reviews</p>";
  }

  function renderReviewBars() {
    if (!reviewsBarsEl) return;
    var summary = getReviewSummary();
    var dist = summary.distribution || {};
    var maxCount = 1;
    [5, 4, 3, 2, 1].forEach(function (star) {
      maxCount = Math.max(maxCount, dist[star] || 0);
    });
    reviewsBarsEl.innerHTML = [5, 4, 3, 2, 1]
      .map(function (star) {
        var count = dist[star] || 0;
        var width = Math.round((count / maxCount) * 100);
        return (
          '<div class="ma-product-reviews__bar-row">' +
          '<span>' +
          star +
          " star</span>" +
          '<span class="ma-product-reviews__bar-track"><span class="ma-product-reviews__bar-fill" style="width:' +
          width +
          '%"></span></span>' +
          "<span>" +
          count +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderReviewMedia() {
    if (!reviewsMediaEl) return;
    var media = product.reviewMedia || [];
    if (!media.length) {
      reviewsMediaEl.closest(".ma-product-reviews__media-row").hidden = true;
      return;
    }
    reviewsMediaEl.innerHTML =
      media
        .slice(0, 4)
        .map(function (src, index) {
          return (
            '<div class="ma-product-reviews__media-item">' +
            '<img src="' +
            src +
            '" alt="Customer photo ' +
            (index + 1) +
            '" width="72" height="72" loading="lazy" decoding="async" />' +
            "</div>"
          );
        })
        .join("") + '<a href="#" class="ma-product-reviews__media-more">See more</a>';
  }

  function sortReviews(items, sortBy) {
    var list = items.slice();
    if (sortBy === "lowest") {
      list.sort(function (a, b) {
        return (a.rating || 0) - (b.rating || 0);
      });
    } else if (sortBy === "recent") {
      list.reverse();
    } else {
      list.sort(function (a, b) {
        return (b.rating || 0) - (a.rating || 0);
      });
    }
    return list;
  }

  function renderReviewList(sortBy) {
    if (!reviewsListEl) return;
    var items = product.reviewItems || [];
    if (!items.length) {
      reviewsListEl.innerHTML = '<p class="ma-product-reviews__item-text">No reviews yet.</p>';
      return;
    }
    reviewItemsCache = sortReviews(items, sortBy || "highest");
    reviewsListEl.innerHTML = reviewItemsCache
      .map(function (item) {
        return (
          '<article class="ma-product-reviews__item">' +
          '<div class="ma-product-reviews__item-stars" aria-hidden="true">' +
          buildStarsHtml(item.rating) +
          "</div>" +
          '<div class="ma-product-reviews__item-head">' +
          '<span class="ma-product-reviews__avatar" aria-hidden="true"></span>' +
          '<span class="ma-product-reviews__item-name">' +
          item.name +
          "</span>" +
          (item.verified
            ? '<span class="ma-product-reviews__verified"><i class="fa-solid fa-check" aria-hidden="true"></i> Verified</span>'
            : "") +
          "</div>" +
          '<p class="ma-product-reviews__item-text">' +
          item.text +
          "</p>" +
          (item.image
            ? '<img class="ma-product-reviews__item-img" src="' +
              item.image +
              '" alt="" width="80" height="80" loading="lazy" decoding="async" />'
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  function renderStickyBar() {
    if (stickyImage) {
      stickyImage.src = product.image;
      stickyImage.alt = product.name;
    }
    if (stickyName) stickyName.textContent = product.name;
    if (stickyPrice) stickyPrice.textContent = product.price;
    if (stickyCompare) stickyCompare.textContent = product.compare;
  }

  function initStickyBehavior() {
    if (!stickyBar) return;
    var showSticky = function () {
      var threshold = 520;
      var scrollY = window.scrollY || window.pageYOffset;
      var visible = scrollY > threshold;
      stickyBar.hidden = !visible;
      stickyBar.classList.toggle("is-visible", visible);
      if (scrollTopBtn) {
        scrollTopBtn.hidden = !visible;
        scrollTopBtn.classList.toggle("is-visible", visible);
      }
    };
    window.addEventListener("scroll", showSticky, { passive: true });
    showSticky();
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    if (stickyCart && addToCartBtn) {
      stickyCart.addEventListener("click", function () {
        addToCartBtn.click();
      });
    }
  }

  function renderFeatures() {
    if (!featuresEl) return;
    featuresEl.innerHTML = getFeatures()
      .map(function (item) {
        return (
          '<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>' + item + "</span></li>"
        );
      })
      .join("");
  }

  function renderRelated() {
    if (!relatedEl) return;
    var related = Object.keys(products)
      .filter(function (key) {
        return key !== product.id && products[key].category === product.category;
      })
      .slice(0, 4)
      .map(function (key) {
        return products[key];
      });

    if (!related.length) {
      related = Object.keys(products)
        .filter(function (key) {
          return key !== product.id;
        })
        .slice(0, 4)
        .map(function (key) {
          return products[key];
        });
    }

    relatedEl.innerHTML = related
      .map(function (item) {
        var rating = item.rating ? Number(item.rating).toFixed(2).replace(/\.00$/, "") : "";
        return (
          '<article class="ma-shop-card">' +
          '<a href="product.html?id=' +
          item.id +
          '" class="ma-shop-card__media">' +
          (item.badge
            ? '<span class="ma-shop-card__badge ma-shop-card__badge--' +
              item.badge +
              '">' +
              (item.badge === "best-seller" ? "Best seller" : "Trending") +
              "</span>"
            : "") +
          '<img src="' +
          item.image +
          '" alt="' +
          item.name +
          '" width="280" height="240" loading="lazy" decoding="async" />' +
          (rating
            ? '<span class="ma-shop-card__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ' +
              rating +
              "</span>"
            : "") +
          "</a>" +
          '<div class="ma-shop-card__body">' +
          '<h3 class="ma-shop-card__name"><a href="product.html?id=' +
          item.id +
          '">' +
          item.name +
          "</a></h3>" +
          '<p class="ma-shop-card__desc">' +
          item.desc +
          "</p>" +
          '<div class="ma-shop-card__price-row">' +
          '<div class="ma-shop-card__prices">' +
          '<span class="ma-shop-card__price">' +
          item.price +
          "</span>" +
          '<span class="ma-shop-card__compare">' +
          item.compare +
          "</span>" +
          "</div></div>" +
          '<div class="ma-shop-card__emi">' +
          '<span class="ma-shop-card__emi-text">or &#8377;' +
          item.emi +
          "/Month</span>" +
          '<button type="button" class="ma-shop-card__emi-btn">Buy on EMI <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>' +
          "</div></div></article>"
        );
      })
      .join("");

    relatedEl.querySelectorAll(".ma-shop-card").forEach(function (card) {
      var link = card.querySelector("a.ma-shop-card__media");
      if (!link) return;
      var url = link.getAttribute("href");
      card.style.cursor = "pointer";
      card.addEventListener("click", function (event) {
        if (event.target.closest("button")) return;
        if (event.target.closest("a")) return;
        window.location.href = url;
      });
    });
  }

  function renderBadge() {
    if (!badgeEl) return;
    if (product.badge) {
      badgeEl.hidden = false;
      badgeEl.textContent = product.badge === "best-seller" ? "Bestseller" : "Trending";
    } else {
      badgeEl.hidden = true;
    }
  }

  if (titleEl) titleEl.textContent = product.name;
  if (descEl) descEl.textContent = product.desc;
  if (priceEl) priceEl.textContent = product.price;
  if (compareEl) compareEl.textContent = product.compare;
  if (reviewsEl) {
    var reviewTotal = getReviewSummary().total || product.reviews || 0;
    reviewsEl.textContent = reviewTotal + " reviews";
  }
  if (cashbackEl) {
    cashbackEl.textContent =
      product.cashback || "Flat 10% cashback up to \u20B9300 on orders above \u20B91999";
  }
  if (emiPriceEl) emiPriceEl.textContent = "\u20B9" + (product.emi || "583");
  if (emiOptionsEl) emiOptionsEl.textContent = String(product.emiOptions || 2);
  if (descPanel) descPanel.textContent = getDescription();
  if (shippingPanel) shippingPanel.textContent = getShipping();
  if (crumbEl) crumbEl.textContent = product.name;
  if (compatEl) {
    compatEl.textContent = product.compatibility || "";
    compatEl.hidden = !product.compatibility;
  }

  renderStars((product.reviewsSummary && product.reviewsSummary.average) || product.rating);
  renderBadge();
  renderGallery();
  renderColors();
  renderFeatures();
  renderRelated();
  renderFeatureHighlights();
  renderSpecsPanels();
  renderReviewsSummary();
  renderReviewBars();
  renderReviewMedia();
  renderReviewList("highest");
  renderStickyBar();
  initStickyBehavior();

  if (reviewsSortEl) {
    reviewsSortEl.addEventListener("change", function () {
      renderReviewList(reviewsSortEl.value);
    });
  }

  specsToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var key = toggle.getAttribute("data-ma-specs-toggle");
      var item = toggle.closest(".ma-product-specs-bar__item");
      var panel = document.querySelector('[data-ma-specs-panel="' + key + '"]');
      if (!item || !panel) return;
      var isOpen = item.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.hidden = !isOpen;
    });
  });

  if (galleryPrev) {
    galleryPrev.addEventListener("click", function () {
      setGalleryImage(galleryIndex - 1);
    });
  }
  if (galleryNext) {
    galleryNext.addEventListener("click", function () {
      setGalleryImage(galleryIndex + 1);
    });
  }
  if (thumbUp) {
    thumbUp.addEventListener("click", function () {
      thumbOffset = Math.max(0, thumbOffset - 1);
      updateThumbScroll();
    });
  }
  if (thumbDown) {
    thumbDown.addEventListener("click", function () {
      var maxOffset = thumbsTrack ? Math.max(0, thumbsTrack.children.length - 5) : 0;
      thumbOffset = Math.min(maxOffset, thumbOffset + 1);
      updateThumbScroll();
    });
  }

  accordionToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var accordion = toggle.closest(".ma-product-page__accordion");
      if (!accordion) return;
      var panel = accordion.querySelector(".ma-product-page__accordion-panel");
      var isOpen = accordion.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (panel) panel.hidden = !isOpen;
    });
  });
})();
