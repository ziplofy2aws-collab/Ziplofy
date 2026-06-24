(function () {
  "use strict";

  var F2_PRODUCTS = {
    "bs-1": {
      id: "bs-1",
      brand: "PEREGRINE",
      name: "Multicoloured Floral Print Relaxed Fit Shirt",
      title: "PEREGRINE Multicoloured Floral Print Relaxed Fit Cotton Shirt",
      sku: "KYR1001",
      price: 999,
      salePrice: 649,
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-2.png", "assets/img/BS-5.png", "assets/img/BS-6.png"],
      isNew: false,
      sizes: ["S", "M", "L", "XL", "XXL"],
      disabledSizes: ["S"],
      lowStockSizes: { L: 3 },
      colors: ["Multicolour"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "Peregrine", fit: "relaxed", color: "multicolour", occasion: "casual", pattern: "printed", fabric: "cotton", price: "under-999" }
    },
    "bs-2": {
      id: "bs-2",
      brand: "BYFORD",
      name: "Sage Green Mandarin Collar Cotton Blend Shirt",
      title: "BYFORD Sage Green Mandarin Collar Cotton Blend Fit Shirt",
      sku: "KYR1002",
      price: 999,
      salePrice: 899,
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/BS-7.png", "assets/img/BS-1.png", "assets/img/BS-4.png"],
      isNew: true,
      sizes: ["S", "M", "L", "XL"],
      disabledSizes: [],
      lowStockSizes: {},
      colors: ["Green"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "Byford", fit: "regular", color: "green", occasion: "casual", pattern: "solid", fabric: "cotton", price: "under-999" }
    },
    "bs-3": {
      id: "bs-3",
      brand: "7 ALT",
      name: "Black And Beige Relaxed Fit Geometric Print Shirt",
      title: "7 ALT Black And Beige Relaxed Fit Geometric Print Shirt",
      sku: "KYR1003",
      price: 999,
      salePrice: 898,
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/BS-2.png", "assets/img/BS-8.png", "assets/img/BS-6.png"],
      isNew: false,
      sizes: ["M", "L", "XL", "XXL"],
      disabledSizes: ["S"],
      lowStockSizes: { L: 3 },
      colors: ["Black", "Beige"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "7 Alt", fit: "relaxed", color: "black", occasion: "casual", pattern: "printed", fabric: "cotton", price: "under-999" }
    },
    "bs-4": {
      id: "bs-4",
      brand: "FRENCH CONNECTION",
      name: "Multicoloured Turquoise Cotton Relaxed Fit Shirt",
      title: "FRENCH CONNECTION Multicoloured Turquoise Cotton Relaxed Fit Shirt",
      sku: "KYR1004",
      price: 999,
      salePrice: 889,
      image: "assets/img/BS-5.png",
      images: ["assets/img/BS-5.png", "assets/img/BS-1.png", "assets/img/BS-4.png", "assets/img/BS-6.png"],
      isNew: false,
      sizes: ["S", "M", "L", "XL"],
      disabledSizes: [],
      lowStockSizes: {},
      colors: ["Turquoise"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "French Connection", fit: "relaxed", color: "blue", occasion: "athleisure", pattern: "printed", fabric: "cotton", price: "under-999" }
    },
    "bs-5": {
      id: "bs-5",
      brand: "LA MARTINA",
      name: "Multicoloured Relaxed Fit Ombre Dyed Shirt",
      title: "LA MARTINA Multicoloured Relaxed Fit Ombre Dyed Shirt",
      sku: "KYR1005",
      price: 999,
      salePrice: 899,
      image: "assets/img/BS-6.png",
      images: ["assets/img/BS-6.png", "assets/img/BS-2.png", "assets/img/BS-5.png", "assets/img/BS-7.png"],
      isNew: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      disabledSizes: [],
      lowStockSizes: {},
      colors: ["Multicolour"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "La Martina", fit: "relaxed", color: "multicolour", occasion: "casual", pattern: "printed", fabric: "cotton", price: "under-999" }
    },
    "bs-6": {
      id: "bs-6",
      brand: "ALLEN SOLLY",
      name: "Blue Striped Slim Fit Casual Cotton Shirt",
      title: "ALLEN SOLLY Blue Striped Slim Fit Casual Cotton Shirt",
      sku: "KYR1006",
      price: 999,
      salePrice: 799,
      image: "assets/img/BS-7.png",
      images: ["assets/img/BS-7.png", "assets/img/BS-4.png", "assets/img/BS-8.png", "assets/img/BS-1.png"],
      isNew: false,
      sizes: ["S", "M", "L", "XL"],
      disabledSizes: ["S"],
      lowStockSizes: { M: 2 },
      colors: ["Blue"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "Allen Solly", fit: "slim", color: "blue", occasion: "formal", pattern: "printed", fabric: "cotton", price: "under-999" }
    },
    "bs-7": {
      id: "bs-7",
      brand: "PETER ENGLAND",
      name: "Solid Regular Fit Linen Blend Casual Shirt",
      title: "PETER ENGLAND Solid Regular Fit Linen Blend Casual Shirt",
      sku: "KYR1007",
      price: 999,
      salePrice: 849,
      image: "assets/img/BS-8.png",
      images: ["assets/img/BS-8.png", "assets/img/BS-4.png", "assets/img/BS-2.png", "assets/img/BS-5.png"],
      isNew: false,
      sizes: ["M", "L", "XL", "XXL"],
      disabledSizes: [],
      lowStockSizes: {},
      colors: ["White"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "Peter England", fit: "regular", color: "white", occasion: "formal", pattern: "solid", fabric: "linen", price: "under-999" }
    },
    "bs-8": {
      id: "bs-8",
      brand: "LOUIS PHILIPPE",
      name: "Checked Slim Fit Cotton Blend Formal Shirt",
      title: "LOUIS PHILIPPE Checked Slim Fit Cotton Blend Formal Shirt",
      sku: "KYR1008",
      price: 999,
      salePrice: 949,
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-8.png", "assets/img/BS-6.png", "assets/img/BS-4.png"],
      isNew: false,
      sizes: ["S", "M", "L", "XL"],
      disabledSizes: [],
      lowStockSizes: {},
      colors: ["Checked"],
      filter: { gender: "men", category: "shirts", productType: "shirts", brand: "Louis Philippe", fit: "slim", color: "multicolour", occasion: "formal", pattern: "checked", fabric: "cotton", price: "under-999" }
    }
  };

  window.F2_CATALOG = F2_PRODUCTS;

  function getProduct(id) {
    return F2_PRODUCTS[id] || F2_PRODUCTS["bs-1"];
  }

  function productUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function formatPrice(amount) {
    return "\u20B9 " + amount.toLocaleString("en-IN");
  }

  function getProductId() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id && F2_PRODUCTS[id]) return id;
    return "bs-1";
  }

  function getDisplayPrice(product) {
    return product.salePrice || product.price;
  }

  function formatLabel(value) {
    if (!value) return "";
    return String(value).replace(/-/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function renderGalleryGrid(container, images, alt) {
    if (!container) return;
    container.innerHTML = "";

    var gridImages = images.slice(0, 4);
    while (gridImages.length < 4) {
      gridImages.push(images[0] || "");
    }

    gridImages.forEach(function (src, index) {
      var cell = document.createElement("div");
      cell.className = "f2-pdp__gallery-cell";

      var img = document.createElement("img");
      img.src = src;
      img.alt = alt || "";
      if (index > 0) img.loading = "lazy";
      img.decoding = "async";
      cell.appendChild(img);

      if (index === 1) {
        var floats = document.createElement("div");
        floats.className = "f2-pdp__gallery-float";
        floats.innerHTML =
          '<button type="button" class="f2-pdp__gallery-float-btn" aria-label="View similar"><i class="fa-solid fa-shirt" aria-hidden="true"></i></button>' +
          '<button type="button" class="f2-pdp__gallery-float-btn" aria-label="Complete the look"><i class="fa-solid fa-vest" aria-hidden="true"></i></button>';
        cell.appendChild(floats);
      }

      container.appendChild(cell);
    });
  }

  function renderSizes(container, product, selected) {
    if (!container) return;
    var sizes = product.sizes || [];
    var disabled = product.disabledSizes || [];
    var lowStock = product.lowStockSizes || {};

    container.innerHTML = sizes.map(function (size) {
      var isDisabled = disabled.indexOf(size) !== -1;
      var isActive = !isDisabled && size === selected;
      var stockNote = lowStock[size] ? '<span class="f2-pdp__size-stock">' + lowStock[size] + " left</span>" : "";

      return (
        '<div class="f2-pdp__size-wrap">' +
        '<button type="button" class="f2-pdp__size' +
        (isActive ? " is-active" : "") +
        (isDisabled ? " is-disabled" : "") +
        '" data-f2-size="' + size + '"' +
        (isDisabled ? " disabled" : "") + ">" +
        size + "</button>" +
        stockNote +
        "</div>"
      );
    }).join("");

    container.querySelectorAll("[data-f2-size]:not([disabled])").forEach(function (btn) {
      btn.addEventListener("click", function () {
        container.querySelectorAll("[data-f2-size]").forEach(function (el) {
          el.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  }

  function renderColorSwatches(container, product) {
    if (!container) return;
    var colors = product.colors || [];
    var fallbackImg = product.image;

    container.innerHTML = colors.map(function (color, index) {
      return (
        '<button type="button" class="f2-pdp__color' + (index === 0 ? " is-active" : "") + '" data-f2-color="' + color + '" aria-label="' + color + '">' +
        '<img src="' + fallbackImg + '" alt="' + color + '" width="48" height="60" loading="lazy" decoding="async">' +
        "</button>"
      );
    }).join("");

    container.querySelectorAll("[data-f2-color]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        container.querySelectorAll(".f2-pdp__color").forEach(function (el) {
          el.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  }

  function renderMaterialList(container, product) {
    if (!container) return;
    var f = product.filter || {};
    var items = [
      { label: "Product Type", value: formatLabel(f.productType || "Shirts") },
      { label: "Color", value: formatLabel(f.color) },
      { label: "Fit", value: formatLabel(f.fit) + " Fit" },
      { label: "Neck", value: "Shirt Collar" },
      { label: "Pattern", value: formatLabel(f.pattern) },
      { label: "Product Material", value: formatLabel(f.fabric) },
      { label: "Sleeves", value: "Full Sleeves" },
      { label: "Brand", value: product.brand }
    ];

    container.innerHTML = items
      .filter(function (item) { return item.value; })
      .map(function (item) {
        return "<li>" + item.label + ": " + item.value + "</li>";
      })
      .join("");
  }

  function renderDetailsPanel(container, product) {
    if (!container) return;
    var f = product.filter || {};
    container.innerHTML =
      "<p>SKU: " + product.sku + "</p>" +
      "<p>Gender: " + formatLabel(f.gender) + "</p>" +
      "<p>Occasion: " + formatLabel(f.occasion) + "</p>" +
      "<p>Country of Origin: India</p>";
  }

  function initAccordions() {
    var groups = document.querySelectorAll("[data-f2-pdp-accordions], [data-f2-pdp-accordions-more]");
    if (!groups.length) return;

    groups.forEach(function (acc) {
    acc.querySelectorAll(".f2-pdp__acc-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".f2-pdp__acc-item");
        var isOpen = item.classList.contains("is-open");

        acc.querySelectorAll(".f2-pdp__acc-item").forEach(function (el) {
          el.classList.remove("is-open");
          el.querySelector(".f2-pdp__acc-btn").setAttribute("aria-expanded", "false");
          var elIcon = el.querySelector(".f2-pdp__acc-btn i");
          if (elIcon) {
            elIcon.classList.remove("fa-minus");
            elIcon.classList.add("fa-plus");
          }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          var icon = btn.querySelector("i");
          if (icon) {
            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");
          }
        }
      });
    });
    });
  }

  function initQuantity() {
    var qtyWrap = document.querySelector("[data-f2-pdp-qty]");
    if (!qtyWrap) return;

    var valEl = qtyWrap.querySelector("[data-f2-qty-val]");
    var minusBtn = qtyWrap.querySelector("[data-f2-qty-minus]");
    var plusBtn = qtyWrap.querySelector("[data-f2-qty-plus]");
    if (!valEl || !minusBtn || !plusBtn) return;

    var qty = 1;

    function update() {
      valEl.textContent = String(qty);
      minusBtn.disabled = qty <= 1;
    }

    minusBtn.addEventListener("click", function () {
      if (qty > 1) {
        qty -= 1;
        update();
      }
    });

    plusBtn.addEventListener("click", function () {
      qty += 1;
      update();
    });

    update();
  }

  function renderRelatedCard(product) {
    var url = productUrl(product.id);
    var price = getDisplayPrice(product);
    var priceHtml = '<span class="f2-pdp__related-price">' + formatPrice(price) + "</span>";
    if (product.salePrice) {
      var off = Math.round((1 - product.salePrice / product.price) * 100);
      priceHtml += '<span class="f2-pdp__related-mrp">' + formatPrice(product.price) + "</span>";
      priceHtml += '<span class="f2-pdp__related-off">' + off + "% OFF</span>";
    }
    return (
      '<article class="f2-pdp__related-card">' +
      '<div class="f2-pdp__related-media">' +
      '<a href="' + url + '"><img src="' + product.image + '" alt="' + product.title + '" width="240" height="320" loading="lazy" decoding="async"></a>' +
      '<button class="f2-pdp__related-wish" type="button" aria-label="Add to wishlist"><i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      "</div>" +
      '<a href="' + url + '" class="f2-pdp__related-body">' +
      '<p class="f2-pdp__related-brand">' + product.brand + "</p>" +
      '<p class="f2-pdp__related-name">' + product.name + "</p>" +
      '<div class="f2-pdp__related-prices">' + priceHtml + "</div>" +
      '<p class="f2-pdp__related-gst">Inclusive of GST benefit</p>' +
      "</a></article>"
    );
  }

  var relatedCarouselBound = false;
  var relatedCardIndex = 0;

  function initRelatedCarousel(currentId) {
    var section = document.querySelector("[data-f2-pdp-related]");
    if (!section) return;

    var track = section.querySelector("[data-f2-pdp-related-track]");
    var viewport = section.querySelector("[data-f2-pdp-related-viewport]");
    var prevBtn = section.querySelector("[data-f2-pdp-related-prev]");
    var nextBtn = section.querySelector("[data-f2-pdp-related-next]");
    if (!track || !viewport) return;

    var related = Object.values(F2_PRODUCTS).filter(function (p) {
      return p.id !== currentId;
    });

    track.innerHTML = related.map(renderRelatedCard).join("");

    if (!section.dataset.f2RelatedWishBound) {
      section.addEventListener("click", function (e) {
        var btn = e.target.closest(".f2-pdp__related-wish");
        if (!btn || !section.contains(btn)) return;
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle("is-active");
        var icon = btn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-regular");
          icon.classList.toggle("fa-solid");
        }
      });
      section.dataset.f2RelatedWishBound = "1";
    }

    function getCards() {
      return track.querySelectorAll(".f2-pdp__related-card");
    }

    function getVisibleCount() {
      if (window.matchMedia("(max-width: 560px)").matches) return 1;
      if (window.matchMedia("(max-width: 768px)").matches) return 2;
      if (window.matchMedia("(max-width: 1100px)").matches) return 3;
      return 4;
    }

    function getStep() {
      var cards = getCards();
      if (!cards.length) return 0;
      var gap = parseFloat(getComputedStyle(track).gap) || 20;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function getMaxIndex() {
      return Math.max(0, getCards().length - getVisibleCount());
    }

    function updateCarousel() {
      var maxIndex = getMaxIndex();
      if (relatedCardIndex > maxIndex) relatedCardIndex = maxIndex;
      track.style.transform = "translateX(-" + relatedCardIndex * getStep() + "px)";
      if (prevBtn) prevBtn.disabled = relatedCardIndex <= 0;
      if (nextBtn) nextBtn.disabled = relatedCardIndex >= maxIndex;
    }

    if (!relatedCarouselBound) {
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (relatedCardIndex > 0) {
            relatedCardIndex -= 1;
            updateCarousel();
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (relatedCardIndex < getMaxIndex()) {
            relatedCardIndex += 1;
            updateCarousel();
          }
        });
      }
      window.addEventListener("resize", updateCarousel);
      relatedCarouselBound = true;
    }

    relatedCardIndex = 0;
    updateCarousel();
  }

  function initPDP() {
    var pdp = document.querySelector("[data-f2-pdp]");
    if (!pdp) return;

    var id = getProductId();
    var product = getProduct(id);

    document.title = product.title + " — KYRO";

    var breadcrumb = document.querySelector("[data-f2-pdp-breadcrumb]");
    if (breadcrumb) breadcrumb.textContent = product.name;

    renderGalleryGrid(
      document.querySelector("[data-f2-pdp-gallery]"),
      product.images,
      product.title
    );

    var brandEl = document.querySelector("[data-f2-pdp-brand]");
    if (brandEl) brandEl.textContent = product.brand;

    var titleEl = document.querySelector("[data-f2-pdp-title]");
    if (titleEl) titleEl.textContent = product.name;

    var priceEl = document.querySelector("[data-f2-pdp-price]");
    if (priceEl) {
      var html = '<span class="f2-pdp__price-current">' + formatPrice(getDisplayPrice(product)) + "</span>";
      if (product.salePrice) {
        var off = Math.round((1 - product.salePrice / product.price) * 100);
        html += '<span class="f2-pdp__price-mrp">' + formatPrice(product.price) + "</span>";
        html += '<span class="f2-pdp__price-off">' + off + "% OFF</span>";
      }
      priceEl.innerHTML = html;
    }

    var defaultSize = product.sizes.find(function (s) {
      return (product.disabledSizes || []).indexOf(s) === -1;
    }) || product.sizes[0];

    renderSizes(document.querySelector("[data-f2-pdp-sizes]"), product, defaultSize);
    renderColorSwatches(document.querySelector("[data-f2-pdp-colors]"), product);
    renderMaterialList(document.querySelector("[data-f2-pdp-material]"), product);
    renderDetailsPanel(document.querySelector("[data-f2-pdp-details]"), product);

    var eanEl = document.querySelector("[data-f2-pdp-ean]");
    if (eanEl) eanEl.textContent = "EAN: " + product.sku.replace(/[^0-9]/g, "").padStart(13, "8901234");

    var descEl = document.querySelector("[data-f2-pdp-description]");
    if (descEl) {
      descEl.textContent =
        "A premium " + product.brand + " shirt crafted for everyday style and comfort. " +
        "Features a " + formatLabel(product.filter.fit) + " silhouette with quality " +
        formatLabel(product.filter.fabric) + " fabric, perfect for " +
        formatLabel(product.filter.occasion) + " occasions.";
    }

    initAccordions();
    initQuantity();
    initRelatedCarousel(id);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPDP);
  } else {
    initPDP();
  }

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) initPDP();
  });
})();
