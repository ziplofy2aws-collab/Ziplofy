(function () {
  if (!window.PI_PRODUCTS) return;

  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id") || "1", 10);
  var product = window.PI_PRODUCTS.find(function (item) {
    return item.id === id;
  }) || window.PI_PRODUCTS[1] || window.PI_PRODUCTS[0];

  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function renderBadges(badges) {
    if (!badges || !badges.length) return "";
    return badges.map(function (badge) {
      var icon = "fa-leaf";
      if (badge.type === "gift") icon = "fa-gift";
      if (badge.type === "vastu") icon = "fa-house";
      if (badge.type === "pet") icon = "fa-paw";
      if (badge.type === "fast") icon = "fa-bolt";
      return (
        '<span class="pi-pdp__badge pi-pdp__badge--' + badge.type + '">' +
        '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + badge.text +
        "</span>"
      );
    }).join("");
  }

  function renderSizes(sizes) {
    if (!sizes || !sizes.length) {
      return '<button type="button" class="pi-pdp__size is-active" data-pi-pdp-size>S</button>' +
        '<button type="button" class="pi-pdp__size" data-pi-pdp-size>M</button>';
    }
    return sizes.map(function (size, index) {
      return '<button type="button" class="pi-pdp__size' + (index === 0 ? " is-active" : "") + '" data-pi-pdp-size>' + size + "</button>";
    }).join("");
  }

  function renderColors(colors) {
    var list = colors && colors.length ? colors : window.PI_PDP_DEFAULT_COLORS;
    return list.map(function (color, index) {
      return (
        '<button type="button" class="pi-pdp__color' + (index === 0 ? " is-active" : "") + '" style="--swatch:' + color + '" data-pi-pdp-color aria-label="Color option"></button>'
      );
    }).join("");
  }

  function renderAddons(addons) {
    if (!addons || !addons.length) return "";
    return addons.map(function (addon) {
      return (
        '<article class="pi-pdp__addon">' +
        '<div class="pi-pdp__addon-media">' +
        '<img src="' + addon.image + '" alt="" width="64" height="64" loading="lazy" decoding="async" />' +
        "</div>" +
        '<div class="pi-pdp__addon-info">' +
        '<div class="pi-pdp__addon-rating">' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i> ' + addon.rating + " | " + addon.reviews +
        "</div>" +
        '<p class="pi-pdp__addon-name">' + addon.name + "</p>" +
        '<div class="pi-pdp__addon-pricing">' +
        '<span class="pi-pdp__addon-price">' + formatPrice(addon.price) + "</span>" +
        '<span class="pi-pdp__addon-mrp">' + formatPrice(addon.mrp) + "</span>" +
        "</div></div>" +
        '<button type="button" class="pi-pdp__addon-add" aria-label="Add ' + addon.name + '">+</button>' +
        "</article>"
      );
    }).join("");
  }

  document.title = product.name + " — Verdleaf";

  var mainImg = document.querySelector("[data-pi-pdp-main-image]");
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  var badgesEl = document.querySelector("[data-pi-pdp-badges]");
  if (badgesEl) badgesEl.innerHTML = renderBadges(product.badges);

  var title = document.querySelector("[data-pi-pdp-title]");
  if (title) title.textContent = product.name;

  var stickyTitle = document.querySelector("[data-pi-pdp-sticky-title]");
  if (stickyTitle) stickyTitle.textContent = product.name;

  var descTitle = document.querySelector("[data-pi-pdp-desc-title]");
  if (descTitle) descTitle.textContent = product.name;

  var desc = document.querySelector("[data-pi-pdp-desc]");
  if (desc) desc.textContent = product.longDesc || product.desc;

  var rating = document.querySelector("[data-pi-pdp-rating]");
  if (rating) {
    rating.setAttribute("aria-label", "Rated " + product.rating + " out of 5 from " + product.reviews + " reviews");
  }

  var score = document.querySelector("[data-pi-pdp-score]");
  if (score) score.textContent = product.rating + " | " + product.reviews + " Customer Reviews";

  var bought = document.querySelector("[data-pi-pdp-bought]");
  if (bought) bought.textContent = product.boughtCount || "500+ bought in last week";

  var price = document.querySelector("[data-pi-pdp-price]");
  if (price) price.textContent = formatPrice(product.price);

  var mrp = document.querySelector("[data-pi-pdp-mrp]");
  if (mrp) mrp.textContent = formatPrice(product.mrp);

  var sizeWrap = document.querySelector("[data-pi-pdp-sizes]");
  if (sizeWrap) sizeWrap.innerHTML = renderSizes(product.sizes);

  var colorWrap = document.querySelector("[data-pi-pdp-colors]");
  if (colorWrap) colorWrap.innerHTML = renderColors(product.colors);

  var addonsWrap = document.querySelector("[data-pi-pdp-addons]");
  if (addonsWrap) addonsWrap.innerHTML = renderAddons(window.PI_PDP_ADDONS);

  bindOptionGroup(sizeWrap, "[data-pi-pdp-size]");
  bindOptionGroup(document.querySelector("[data-pi-pdp-pots]"), "[data-pi-pdp-pot]");
  bindOptionGroup(colorWrap, "[data-pi-pdp-color]");

  var policyBtn = document.querySelector("[data-pi-pdp-policy]");
  var policyPanel = document.querySelector("[data-pi-pdp-policy-panel]");
  if (policyBtn && policyPanel) {
    policyBtn.addEventListener("click", function () {
      var expanded = policyBtn.getAttribute("aria-expanded") === "true";
      policyBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
      policyPanel.hidden = expanded;
    });
  }

  function bindOptionGroup(group, selector) {
    if (!group) return;
    group.addEventListener("click", function (event) {
      var btn = event.target.closest(selector);
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll(selector).forEach(function (item) {
        item.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  }

  function renderRelatedBadges(badges) {
    return badges.map(function (badge) {
      var icon = "fa-leaf";
      if (badge.type === "gift") icon = "fa-gift";
      if (badge.type === "vastu") icon = "fa-house";
      if (badge.type === "pet") icon = "fa-paw";
      return (
        '<span class="pi-pdp-related-card__badge pi-pdp-related-card__badge--' + badge.type + '">' +
        '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + badge.text +
        "</span>"
      );
    }).join("");
  }

  function renderRelatedCard(item) {
    var selector = "";
    if (item.selectorType === "color" && item.colors) {
      selector =
        '<div class="pi-pdp-related-card__selector">' +
        '<span class="pi-pdp-related-card__selector-label">Select Color</span>' +
        '<div class="pi-pdp-related-card__color-btns" role="group" aria-label="Select color">' +
        item.colors.map(function (color, index) {
          return (
            '<button type="button" class="pi-pdp-related-card__color' + (index === 0 ? " is-active" : "") + '" style="--swatch:' + color + '" aria-label="Color option"></button>'
          );
        }).join("") +
        "</div></div>";
    } else if (item.sizes) {
      selector =
        '<div class="pi-pdp-related-card__selector">' +
        '<span class="pi-pdp-related-card__selector-label">Select Size</span>' +
        '<div class="pi-pdp-related-card__size-btns" role="group" aria-label="Select size">' +
        item.sizes.map(function (size, index) {
          return '<button type="button" class="pi-pdp-related-card__size' + (index === 0 ? " is-active" : "") + '">' + size + "</button>";
        }).join("") +
        "</div></div>";
    }

    return (
      '<article class="pi-pdp-related-card" data-product-id="' + item.id + '">' +
      '<a href="product.html?id=' + item.id + '" class="pi-pdp-related-card__media">' +
      '<img src="' + item.image + '" alt="' + item.name + '" width="400" height="400" loading="lazy" decoding="async" />' +
      "</a>" +
      '<div class="pi-pdp-related-card__body">' +
      '<div class="pi-pdp-related-card__rating" aria-label="Rated ' + item.rating + " out of 5 from " + item.reviews + ' reviews">' +
      '<span class="pi-pdp-related-card__stars" aria-hidden="true">' +
      '<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>' +
      "</span>" +
      '<span class="pi-pdp-related-card__score">' + item.rating + " | " + item.reviews + "</span>" +
      "</div>" +
      '<h3 class="pi-pdp-related-card__title"><a href="product.html?id=' + item.id + '">' + item.name + "</a></h3>" +
      '<p class="pi-pdp-related-card__pricing">' +
      '<span class="pi-pdp-related-card__price">' + formatPrice(item.price) + "</span>" +
      '<span class="pi-pdp-related-card__mrp">' + formatPrice(item.mrp) + "</span>" +
      "</p>" +
      '<div class="pi-pdp-related-card__badges">' + renderRelatedBadges(item.badges) + "</div>" +
      selector +
      '<button type="button" class="pi-pdp-related-card__cta" data-product-link="' + item.id + '">Add to Basket</button>' +
      "</div></article>"
    );
  }

  var relatedGrid = document.querySelector("[data-pi-pdp-related-grid]");
  if (relatedGrid && window.PI_RELATED_PRODUCTS) {
    relatedGrid.innerHTML = window.PI_RELATED_PRODUCTS.map(renderRelatedCard).join("");

    relatedGrid.querySelectorAll(".pi-pdp-related-card__size-btns, .pi-pdp-related-card__color-btns").forEach(function (group) {
      group.addEventListener("click", function (event) {
        var sizeBtn = event.target.closest(".pi-pdp-related-card__size");
        var colorBtn = event.target.closest(".pi-pdp-related-card__color");
        var btn = sizeBtn || colorBtn;
        if (!btn || !group.contains(btn)) return;
        event.stopPropagation();
        group.querySelectorAll(".pi-pdp-related-card__size, .pi-pdp-related-card__color").forEach(function (item) {
          item.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });

    if (window.PI_initProductCards) window.PI_initProductCards();
    initRelatedCarousel();
  }

  function initRelatedCarousel() {
    var section = document.querySelector("[data-pi-pdp-related]");
    if (!section) return;

    var viewport = section.querySelector("[data-pi-pdp-related-viewport]");
    var track = section.querySelector("[data-pi-pdp-related-grid]");
    var prevBtn = section.querySelector("[data-pi-pdp-related-prev]");
    var nextBtn = section.querySelector("[data-pi-pdp-related-next]");
    var cards = track ? track.querySelectorAll(".pi-pdp-related-card") : [];
    var index = 0;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function getGap() {
      if (!track) return 16;
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap || "16") || 16;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - 1);
    }

    function setArrowState(btn, disabled) {
      if (!btn) return;
      btn.disabled = disabled;
      btn.classList.toggle("is-disabled", disabled);
    }

    function resetDesktopLayout() {
      if (!track) return;
      track.style.transform = "";
      track.style.display = "";
      cards.forEach(function (card) {
        card.style.flex = "";
        card.style.width = "";
        card.style.minWidth = "";
      });
      index = 0;
      setArrowState(prevBtn, true);
      setArrowState(nextBtn, cards.length <= 1);
    }

    function updateCarousel() {
      if (!viewport || !track || !cards.length) return;

      if (!isMobile()) {
        resetDesktopLayout();
        return;
      }

      var gap = getGap();
      var cardWidth = viewport.clientWidth;

      track.style.display = "flex";

      cards.forEach(function (card) {
        card.style.flex = "0 0 " + cardWidth + "px";
        card.style.width = cardWidth + "px";
        card.style.minWidth = cardWidth + "px";
      });

      if (index > getMaxIndex()) index = getMaxIndex();
      if (index < 0) index = 0;

      track.style.transform = "translate3d(-" + index * (cardWidth + gap) + "px, 0, 0)";

      setArrowState(prevBtn, index <= 0);
      setArrowState(nextBtn, index >= getMaxIndex());
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (!isMobile() || index <= 0) return;
        index -= 1;
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!isMobile() || index >= getMaxIndex()) return;
        index += 1;
        updateCarousel();
      });
    }

    window.addEventListener("resize", updateCarousel);

    if (typeof ResizeObserver !== "undefined" && viewport) {
      new ResizeObserver(updateCarousel).observe(viewport);
    }

    updateCarousel();
  }

  renderReviews(product);

  function renderStarIcons(count) {
    var total = count || 5;
    var html = "";
    for (var i = 0; i < total; i++) {
      html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
    }
    return html;
  }

  function renderReviews(currentProduct) {
    var reviewsData = window.PI_PDP_REVIEWS;
    if (!reviewsData) return;

    var total = currentProduct.reviews || reviewsData.distribution.reduce(function (sum, n) {
      return sum + n;
    }, 0);
    var average = reviewsData.average || currentProduct.rating;

    var summaryEl = document.querySelector("[data-pi-pdp-reviews-summary]");
    if (summaryEl) {
      var barsHtml = reviewsData.distribution.map(function (count, index) {
        var stars = 5 - index;
        var percent = total ? Math.round((count / total) * 100) : 0;
        return (
          '<div class="pi-pdp-reviews__bar-row">' +
          '<span class="pi-pdp-reviews__bar-stars" aria-label="' + stars + ' stars">' +
          renderStarIcons(stars) +
          "</span>" +
          '<div class="pi-pdp-reviews__bar-track" role="presentation">' +
          '<span class="pi-pdp-reviews__bar-fill" style="width:' + percent + '%"></span>' +
          "</div>" +
          '<span class="pi-pdp-reviews__bar-count">' + count + "</span>" +
          "</div>"
        );
      }).join("");

      summaryEl.innerHTML =
        '<div class="pi-pdp-reviews__score-col">' +
        '<div class="pi-pdp-reviews__score-stars" aria-hidden="true">' + renderStarIcons(5) + "</div>" +
        "<p class=\"pi-pdp-reviews__score-value\"><strong>" + average.toFixed(2) + " out of 5</strong></p>" +
        '<p class="pi-pdp-reviews__score-meta">' +
        "Based on " + total + " reviews " +
        '<i class="fa-solid fa-circle-check pi-pdp-reviews__verified-icon" aria-hidden="true"></i>' +
        '<span class="visually-hidden">verified reviews</span>' +
        "</p></div>" +
        '<div class="pi-pdp-reviews__bars-col">' + barsHtml + "</div>" +
        '<div class="pi-pdp-reviews__cta-col">' +
        '<button type="button" class="pi-pdp-reviews__write-btn">Write a review</button>' +
        "</div>";
    }

    var listEl = document.querySelector("[data-pi-pdp-reviews-list]");
    if (listEl && reviewsData.items) {
      listEl.innerHTML = reviewsData.items.map(function (review) {
        return (
          '<article class="pi-pdp-reviews__item' + (review.pinned ? " pi-pdp-reviews__item--pinned" : "") + '">' +
          '<div class="pi-pdp-reviews__item-head">' +
          '<span class="pi-pdp-reviews__item-stars" aria-label="Rated ' + review.rating + ' out of 5">' +
          renderStarIcons(review.rating) +
          "</span>" +
          '<time class="pi-pdp-reviews__item-date" datetime="' + review.date + '">' + review.date + "</time>" +
          (review.pinned ? '<i class="fa-solid fa-thumbtack pi-pdp-reviews__pin" aria-label="Pinned review"></i>' : "") +
          "</div>" +
          '<div class="pi-pdp-reviews__item-user">' +
          '<span class="pi-pdp-reviews__avatar" aria-hidden="true">' +
          '<i class="fa-solid fa-user"></i>' +
          '<i class="fa-solid fa-circle-check pi-pdp-reviews__avatar-badge"></i>' +
          "</span>" +
          '<span class="pi-pdp-reviews__author">' + review.author + "</span>" +
          (review.verified
            ? '<span class="pi-pdp-reviews__verified-badge">Verified</span>'
            : "") +
          "</div>" +
          '<p class="pi-pdp-reviews__text">' + review.text + "</p>" +
          "</article>"
        );
      }).join("");
    }
  }
})();
