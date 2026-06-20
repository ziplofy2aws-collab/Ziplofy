(function () {
  var catalog = window.ProductCatalog;
  if (!catalog) return;

  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get("id"), 10);
  var product = catalog.getById(productId) || catalog.getById(1);

  var mainImage = document.getElementById("product-main-image");
  var thumbsTrack = document.querySelector("[data-thumbs-track]");
  var thumbs = [];
  var thumbScrollOffset = 0;

  function renderProduct(p) {
    document.title = p.fullName + " — NutraNova";

    var breadcrumb = document.querySelector(".breadcrumb-current");
    if (breadcrumb) breadcrumb.textContent = p.fullName;

    var title = document.querySelector(".product-title");
    if (title) title.textContent = p.fullName;

    var priceCurrent = document.querySelector(".product-price-current");
    if (priceCurrent) priceCurrent.textContent = catalog.formatPrice(p.price);

    var priceOff = document.querySelector(".product-price-off");
    if (priceOff) {
      if (p.offLabel) {
        priceOff.textContent = p.offLabel;
        priceOff.hidden = false;
      } else {
        priceOff.hidden = true;
      }
    }

    var mrpEl = document.querySelector(".product-mrp");
    if (mrpEl) {
      if (p.mrp) {
        mrpEl.textContent = "MRP " + catalog.formatCardPrice(p.mrp);
        mrpEl.hidden = false;
      } else {
        mrpEl.hidden = true;
      }
    }

    var seller = document.querySelector(".product-seller");
    if (seller) seller.textContent = "Sold By " + p.seller;

    var expiry = document.querySelector(".product-expiry");
    if (expiry) expiry.textContent = "Exp. Date: " + p.expiry;

    var stickyTitle = document.querySelector(".product-sticky-title");
    if (stickyTitle) stickyTitle.textContent = p.fullName;

    var stickyAmount = document.querySelector(".product-sticky-amount");
    if (stickyAmount) stickyAmount.textContent = catalog.formatPrice(p.price);

    var dietIcon = document.querySelector(".product-gallery-main .veg-icon, .product-gallery-main .nonveg-icon");
    if (dietIcon) {
      var isNonVeg = p.foodType === "non-vegetarian";
      dietIcon.className = isNonVeg ? "nonveg-icon" : "veg-icon";
      dietIcon.setAttribute("aria-label", isNonVeg ? "Non-Vegetarian" : "Vegetarian");
    }

    if (mainImage) {
      mainImage.src = catalog.imgSrc(p.images[0]);
      mainImage.alt = p.fullName;
    }

    if (thumbsTrack) {
      thumbsTrack.innerHTML = p.images.map(function (img, i) {
        var src = catalog.imgSrc(img);
        return (
          '<button type="button" class="product-thumb' + (i === 0 ? " is-active" : "") + '" data-product-thumb="' + src + '" aria-label="View image ' + (i + 1) + '">' +
          '<img src="' + src + '" alt="' + p.name + ' view ' + (i + 1) + '">' +
          "</button>"
        );
      }).join("");
      thumbs = Array.prototype.slice.call(thumbsTrack.querySelectorAll("[data-product-thumb]"));
      thumbScrollOffset = 0;
      thumbsTrack.style.transform = "translateY(0)";
    }

    var accordionBodies = document.querySelectorAll(".product-accordion-body");
    if (accordionBodies[0]) accordionBodies[0].innerHTML = "<p>" + p.specs + "</p>";
    if (accordionBodies[1]) accordionBodies[1].innerHTML = "<p>" + p.overview + "</p>";
    if (accordionBodies[2]) {
      accordionBodies[2].innerHTML = "<ul>" + p.benefits.map(function (b) {
        return "<li>" + b + "</li>";
      }).join("") + "</ul>";
    }
    if (accordionBodies[3]) accordionBodies[3].innerHTML = "<p>" + p.suggestedUse + "</p>";
    if (accordionBodies[4]) accordionBodies[4].innerHTML = "<p>" + p.nutrition + "</p>";
    if (accordionBodies[5]) accordionBodies[5].innerHTML = "<p>" + p.reviewsSummary + "</p>";

    var highlights = document.querySelector(".product-highlights");
    if (highlights) {
      highlights.innerHTML = p.highlights.map(function (h) {
        return '<li><i class="fa-solid fa-check"></i> ' + h + "</li>";
      }).join("");
    }

    renderRelated(p);
  }

  function buildRelatedPriceHtml(item) {
    var html = '<span class="price-current">' + catalog.formatCardPrice(item.price) + "</span>";
    if (item.mrp) html += '<span class="price-mrp">' + catalog.formatCardPrice(item.mrp) + "</span>";
    if (item.off) html += '<span class="price-off">' + item.off + "</span>";
    return html;
  }

  function buildRelatedCardHtml(item) {
    var dietIcon = item.foodType === "non-vegetarian"
      ? '<span class="nonveg-icon" aria-label="Non-Vegetarian"></span>'
      : '<span class="veg-icon" aria-label="Vegetarian"></span>';

    return (
      '<article class="related-card">' +
      '<a href="' + catalog.getUrl(item.id) + '" class="related-card-link">' +
      '<div class="related-card-media">' +
      '<img src="' + catalog.imgSrc(item.img) + '" alt="' + item.name + '">' +
      dietIcon +
      "</div>" +
      '<p class="related-card-brand">' + item.brand + "</p>" +
      '<h3 class="related-card-name">' + item.name + "</h3>" +
      '<p class="related-card-desc">' + item.desc + "</p>" +
      '<div class="related-card-rating">' +
      '<i class="fa-solid fa-star"></i>' +
      "<span>" + item.rating.toFixed(1) + " (" + item.reviews + " reviews)</span>" +
      '<i class="fa-solid fa-circle-check verified"></i>' +
      "</div>" +
      '<div class="related-card-price">' + buildRelatedPriceHtml(item) + "</div>" +
      "</a>" +
      '<button type="button" class="related-card-btn">Add To Cart</button>' +
      "</article>"
    );
  }

  function getRelatedProducts(current, count) {
    var list = catalog.products.filter(function (p) {
      if (p.id === current.id) return false;
      return p.category === current.category || p.collection === current.collection;
    });

    if (list.length < count) {
      catalog.products.forEach(function (p) {
        if (p.id === current.id) return;
        if (list.some(function (item) { return item.id === p.id; })) return;
        list.push(p);
      });
    }

    return list.slice(0, count);
  }

  function renderRelated(current) {
    var grid = document.getElementById("product-related-grid");
    if (!grid) return;
    var related = getRelatedProducts(current, 5);
    grid.innerHTML = related.map(buildRelatedCardHtml).join("");
  }

  renderProduct(product);

  var prevBtn = document.querySelector("[data-gallery-prev]");
  var nextBtn = document.querySelector("[data-gallery-next]");
  var thumbsViewport = document.querySelector("[data-thumbs-viewport]");
  var thumbsUp = document.querySelector("[data-thumbs-up]");
  var thumbsDown = document.querySelector("[data-thumbs-down]");

  function getThumbStep() {
    if (!thumbs.length) return 82;
    var style = window.getComputedStyle(thumbsTrack);
    var gap = parseFloat(style.gap) || 10;
    return thumbs[0].offsetHeight + gap;
  }

  function getMaxThumbScroll() {
    if (!thumbsTrack || !thumbsViewport) return 0;
    return Math.max(0, thumbsTrack.scrollHeight - thumbsViewport.clientHeight);
  }

  function updateThumbArrows() {
    if (thumbsUp) thumbsUp.disabled = thumbScrollOffset <= 0;
    if (thumbsDown) thumbsDown.disabled = thumbScrollOffset >= getMaxThumbScroll();
  }

  function scrollThumbs(direction) {
    var step = getThumbStep();
    thumbScrollOffset += direction * step;
    thumbScrollOffset = Math.max(0, Math.min(thumbScrollOffset, getMaxThumbScroll()));
    if (thumbsTrack) thumbsTrack.style.transform = "translateY(-" + thumbScrollOffset + "px)";
    updateThumbArrows();
  }

  function setActiveThumb(index) {
    if (!mainImage || !thumbs.length) return;
    var thumb = thumbs[index];
    if (!thumb) return;

    var src = thumb.getAttribute("data-product-thumb");
    if (src) mainImage.src = src;

    thumbs.forEach(function (item, i) {
      item.classList.toggle("is-active", i === index);
    });
  }

  function bindGallery() {
    if (!mainImage || !thumbs.length) return;

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("click", function () {
        setActiveThumb(index);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        var current = thumbs.findIndex(function (t) { return t.classList.contains("is-active"); });
        var next = current <= 0 ? thumbs.length - 1 : current - 1;
        setActiveThumb(next);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var current = thumbs.findIndex(function (t) { return t.classList.contains("is-active"); });
        var next = current >= thumbs.length - 1 ? 0 : current + 1;
        setActiveThumb(next);
      });
    }

    if (thumbsUp) thumbsUp.addEventListener("click", function () { scrollThumbs(-1); });
    if (thumbsDown) thumbsDown.addEventListener("click", function () { scrollThumbs(1); });
    updateThumbArrows();
  }

  bindGallery();

  var qtyValue = document.querySelector("[data-qty-value]");
  var qtyMinus = document.querySelector("[data-qty-minus]");
  var qtyPlus = document.querySelector("[data-qty-plus]");
  var qty = 1;

  if (qtyMinus && qtyPlus && qtyValue) {
    qtyMinus.addEventListener("click", function () {
      if (qty > 1) {
        qty -= 1;
        qtyValue.textContent = String(qty);
      }
    });
    qtyPlus.addEventListener("click", function () {
      qty += 1;
      qtyValue.textContent = String(qty);
    });
  }

  var essentialsTrack = document.querySelector("[data-essentials-track]");
  var essentialsPrev = document.querySelector("[data-essentials-prev]");
  var essentialsNext = document.querySelector("[data-essentials-next]");
  var essentialsIndex = 0;

  function getEssentialCards() {
    return essentialsTrack
      ? Array.prototype.slice.call(essentialsTrack.querySelectorAll(".product-essential-card"))
      : [];
  }

  function updateEssentials() {
    var cards = getEssentialCards();
    if (!essentialsTrack || !cards.length) return;
    essentialsIndex = Math.max(0, Math.min(essentialsIndex, cards.length - 1));
    essentialsTrack.style.transform = "translateX(-" + essentialsIndex * 100 + "%)";
  }

  if (essentialsPrev) {
    essentialsPrev.addEventListener("click", function () {
      essentialsIndex -= 1;
      if (essentialsIndex < 0) essentialsIndex = getEssentialCards().length - 1;
      updateEssentials();
    });
  }

  if (essentialsNext) {
    essentialsNext.addEventListener("click", function () {
      essentialsIndex += 1;
      if (essentialsIndex >= getEssentialCards().length) essentialsIndex = 0;
      updateEssentials();
    });
  }

  document.querySelectorAll(".product-accordion-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var accordion = header.closest(".product-accordion");
      if (!accordion) return;
      var isOpen = accordion.classList.toggle("is-open");
      header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
})();
