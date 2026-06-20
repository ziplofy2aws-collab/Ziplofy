(function () {
  var DEFAULT_ACCORDIONS = [
    {
      title: "SERVE IT RIGHT",
      content:
        "<p>Serve at room temperature for best taste and aroma. Feed according to your dog's weight and activity level as mentioned on the pack.</p>" +
        "<ul><li>Small dogs: 1 pouch per meal</li><li>Medium dogs: 1–2 pouches per meal</li><li>Large dogs: 2–3 pouches per meal</li></ul>" +
        "<p>Always provide fresh drinking water alongside every meal.</p>"
    },
    {
      title: "GOODNESS INSIDE",
      content:
        "<p>Made with real chicken, pumpkin, carrot, and peas for wholesome nutrition in every bite.</p>" +
        "<ul><li>Ashwagandha for stress relief and immunity</li><li>Moringa for vitamins and antioxidants</li><li>No artificial colours or flavours</li></ul>"
    },
    {
      title: "A COMPLETE FORMULA",
      content:
        "<p>A balanced wet food formula suitable for puppies, adults, and senior dogs with high protein, essential vitamins, and minerals for overall health, digestion, and a shiny coat.</p>"
    },
    {
      title: "HOW TO STORE",
      content:
        "<p>Store unopened pouches in a cool, dry place away from direct sunlight. Once opened, refrigerate unused portion and use within 24 hours. Do not freeze unopened pouches.</p>"
    },
    {
      title: "REVIEWS",
      content:
        "<p>Rated 5 stars by pet parents for taste, nutrition, and easy digestion. Dogs love the real chicken flavour and pet owners appreciate the convenient single-serve pouches.</p>"
    }
  ];

  function closeAccordion(btn) {
    var panel = btn.nextElementSibling;
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    var icon = btn.querySelector(".pc-pdp__acc-icon");
    if (icon) icon.textContent = "+";
    if (panel) panel.classList.remove("is-open");
  }

  function openAccordion(btn) {
    var panel = btn.nextElementSibling;
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    var icon = btn.querySelector(".pc-pdp__acc-icon");
    if (icon) icon.textContent = "\u2212";
    if (panel) panel.classList.add("is-open");
  }

  function toggleAccordion(btn) {
    if (btn.classList.contains("is-open")) {
      closeAccordion(btn);
    } else {
      openAccordion(btn);
    }
  }

  function setupAccordion() {
    var wrap = document.querySelector("[data-pc-pdp-accordion]");
    if (!wrap || wrap.dataset.pcAccordionReady === "true") return;

    wrap.dataset.pcAccordionReady = "true";
    wrap.removeAttribute("hidden");

    wrap.addEventListener("click", function (event) {
      var btn = event.target.closest(".pc-pdp__acc-toggle");
      if (!btn || !wrap.contains(btn)) return;
      event.preventDefault();
      toggleAccordion(btn);
    });
  }

  function renderAccordions(items) {
    var wrap = document.querySelector("[data-pc-pdp-accordion]");
    if (!wrap) return;

    var list = items && items.length ? items : DEFAULT_ACCORDIONS;
    wrap.removeAttribute("hidden");
    wrap.innerHTML = "";

    list.forEach(function (item) {
      var block = document.createElement("div");
      block.className = "pc-pdp__acc-item";
      block.innerHTML =
        '<button type="button" class="pc-pdp__acc-toggle" aria-expanded="false">' +
        '<span class="pc-pdp__acc-label">' + item.title + "</span>" +
        '<span class="pc-pdp__acc-icon" aria-hidden="true">+</span></button>' +
        '<div class="pc-pdp__acc-panel"><div class="pc-pdp__acc-panel-inner">' +
        item.content +
        "</div></div>";
      wrap.appendChild(block);
    });
  }

  function formatMrp(amount) {
    return "MRP \u20b9" + Math.round(amount).toLocaleString("en-IN");
  }

  function truncateBreadcrumb(name) {
    if (name.length <= 42) return name;
    return name.slice(0, 39).trim() + "...";
  }

  function getPackOptions(productData) {
    if (productData.packOptions) return productData.packOptions;
    if (productData.options && productData.options.length > 1) {
      return productData.options.map(function (opt) {
        return { label: String(opt).toUpperCase() };
      });
    }
    return null;
  }

  function renderFeatures(features) {
    var wrap = document.querySelector("[data-pc-pdp-features]");
    var dividers = document.querySelectorAll(".pc-pdp__divider");
    if (!wrap) return;
    if (!features || !features.length) {
      wrap.hidden = true;
      if (dividers[0]) dividers[0].hidden = true;
      return;
    }
    if (dividers[0]) dividers[0].hidden = false;
    wrap.hidden = false;
    wrap.innerHTML = "";
    features.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "pc-pdp__feature";
      li.innerHTML =
        '<i class="fa-solid ' + item.icon + '" aria-hidden="true"></i> ' + item.label;
      wrap.appendChild(li);
    });
  }

  function renderPacks(packs) {
    var wrap = document.querySelector("[data-pc-pdp-packs]");
    var dividers = document.querySelectorAll(".pc-pdp__divider");
    if (!wrap) return;
    if (!packs || !packs.length) {
      wrap.hidden = true;
      if (dividers[1]) dividers[1].hidden = true;
      return;
    }
    wrap.hidden = false;
    if (dividers[1]) dividers[1].hidden = false;
    wrap.innerHTML = "";
    packs.forEach(function (pack, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pc-pdp__pack" + (index === 0 ? " is-active" : "");
      btn.textContent = pack.label;
      if (pack.stealDeal) {
        var badge = document.createElement("span");
        badge.className = "pc-pdp__pack-badge";
        badge.textContent = "STEAL DEAL";
        btn.appendChild(badge);
      }
      btn.addEventListener("click", function () {
        wrap.querySelectorAll(".pc-pdp__pack").forEach(function (p) {
          p.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
      wrap.appendChild(btn);
    });
  }

  function renderThumbs(productData) {
    var thumbsWrap = document.querySelector("[data-pc-pdp-thumbs]");
    var prevBtn = document.querySelector("[data-pc-pdp-thumb-prev]");
    var nextBtn = document.querySelector("[data-pc-pdp-thumb-next]");
    var mainImg = document.querySelector("[data-pc-pdp-main]");
    if (!thumbsWrap || !productData.images || !productData.images.length) return;

    var offset = 0;
    var thumbWidth = 98;

    thumbsWrap.innerHTML = "";
    productData.images.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pc-pdp__thumb" + (index === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", "View image " + (index + 1));
      btn.innerHTML = '<img src="' + src + '" alt="" loading="lazy" decoding="async" />';
      btn.addEventListener("click", function () {
        if (mainImg) mainImg.src = src;
        thumbsWrap.querySelectorAll(".pc-pdp__thumb").forEach(function (t) {
          t.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
      thumbsWrap.appendChild(btn);
    });

    function updateNav() {
      var viewport = thumbsWrap.parentElement;
      if (!viewport) return;
      var maxOffset = Math.max(0, productData.images.length * thumbWidth - viewport.clientWidth);
      offset = Math.max(0, Math.min(offset, maxOffset));
      thumbsWrap.style.transform = "translateX(-" + offset + "px)";
      if (prevBtn) prevBtn.disabled = offset <= 0;
      if (nextBtn) nextBtn.disabled = offset >= maxOffset;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        offset = Math.max(0, offset - thumbWidth * 2);
        updateNav();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        offset += thumbWidth * 2;
        updateNav();
      });
    }

    window.addEventListener("resize", updateNav);
    updateNav();
  }

  function setupCta(productData) {
    var ctaRow = document.querySelector("[data-pc-pdp-cta-row]");
    var notifyBtn = document.querySelector("[data-pc-pdp-notify]");
    var outOfStock = !!productData.outOfStock;

    if (outOfStock) {
      if (notifyBtn) notifyBtn.hidden = false;
      return;
    }

    if (notifyBtn) notifyBtn.hidden = true;

    if (ctaRow) {
      ctaRow.innerHTML =
        '<button type="button" class="pc-pdp__btn pc-pdp__btn--cart">ADD TO CART' +
        ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>' +
        '<button type="button" class="pc-pdp__btn pc-pdp__btn--buy">BUY IT NOW' +
        ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>';
    }
  }

  function setupReadMore() {
    var btn = document.querySelector("[data-pc-pdp-read-more]");
    var text = document.querySelector("[data-pc-pdp-desc]");
    if (!btn || !text) return;
    btn.addEventListener("click", function () {
      var expanded = text.classList.toggle("is-expanded");
      btn.textContent = expanded ? "READ LESS -" : "READ MORE +";
    });
  }

  function setupQty() {
    var qtyInput = document.querySelector("[data-pc-pdp-qty]");
    var qtyMinus = document.querySelector("[data-pc-pdp-qty-minus]");
    var qtyPlus = document.querySelector("[data-pc-pdp-qty-plus]");
    if (!qtyInput || !qtyMinus || !qtyPlus) return;

    qtyMinus.addEventListener("click", function () {
      var val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.max(1, val - 1);
    });
    qtyPlus.addEventListener("click", function () {
      var val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
    });
  }

  function initProductPage() {
    setupAccordion();
    setupRelatedCarousel();

    if (typeof PC_PRODUCTS === "undefined") return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!id) return;

    var product = PC_PRODUCTS[id];
    if (!product) return;

    document.title = product.name + " — Pet Care";

    var breadcrumb = document.querySelector("[data-pc-pdp-breadcrumb]");
    if (breadcrumb) breadcrumb.textContent = truncateBreadcrumb(product.name);

    var title = document.querySelector("[data-pc-pdp-title]");
    if (title) title.textContent = product.name;

    var subtitle = document.querySelector("[data-pc-pdp-subtitle]");
    if (subtitle) subtitle.textContent = product.subtitle || "Dogs of all ages";

    var reviews = document.querySelector("[data-pc-pdp-reviews]");
    if (reviews) reviews.textContent = "(" + (product.reviews || 0) + ")";

    var price = document.querySelector("[data-pc-pdp-price]");
    if (price) price.textContent = formatMrp(product.price);

    var desc = document.querySelector("[data-pc-pdp-desc]");
    if (desc) desc.textContent = product.longDescription || product.description || "";

    var storyTitle = document.querySelector("[data-pc-pdp-story-title]");
    if (storyTitle) storyTitle.textContent = product.storyTitle || "Whole Nutrition in Every Bite";

    var mainImg = document.querySelector("[data-pc-pdp-main]");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    renderFeatures(product.features);
    renderPacks(getPackOptions(product));
    renderThumbs(product);
    renderAccordions(product.accordions || DEFAULT_ACCORDIONS);
    setupCta(product);
    setupReadMore();
    setupQty();
    hideCurrentRelatedProduct(id);
  }

  function setupRelatedCarousel() {
    var slider = document.querySelector("[data-pc-pdp-related-slider]");
    var viewport = document.querySelector("[data-pc-pdp-related-viewport]");
    var track = document.querySelector("[data-pc-pdp-related]");
    var nextBtn = document.querySelector("[data-pc-pdp-related-next]");
    if (!slider || !viewport || !track || !nextBtn || slider.dataset.pcRelatedReady === "true") {
      return;
    }

    slider.dataset.pcRelatedReady = "true";
    var index = 0;

    function getVisibleCards() {
      return Array.prototype.filter.call(track.children, function (card) {
        return card.classList.contains("pc-pdp-related-card") && !card.classList.contains("is-hidden");
      });
    }

    function isMobileCarousel() {
      return window.innerWidth <= 768;
    }

    function updateSlide() {
      var cards = getVisibleCards();
      if (!cards.length) return;

      if (!isMobileCarousel()) {
        track.style.transform = "";
        nextBtn.classList.remove("is-disabled");
        index = 0;
        return;
      }

      if (index >= cards.length) index = 0;
      if (index < 0) index = cards.length - 1;

      var step = viewport.clientWidth;
      track.style.transform = "translateX(-" + index * step + "px)";
      nextBtn.classList.toggle("is-disabled", cards.length <= 1);
    }

    function goNext() {
      var cards = getVisibleCards();
      if (!cards.length || !isMobileCarousel()) return;
      index = index + 1 >= cards.length ? 0 : index + 1;
      updateSlide();
    }

    nextBtn.addEventListener("click", goNext);
    window.addEventListener("resize", updateSlide);

    window.pcResetRelatedCarousel = function () {
      index = 0;
      updateSlide();
    };

    updateSlide();
  }

  function hideCurrentRelatedProduct(currentId) {
    if (!currentId) return;
    document.querySelectorAll(".pc-pdp-related-card").forEach(function (card) {
      var link = card.querySelector("a[href*='id=" + currentId + "']");
      if (link) card.classList.add("is-hidden");
    });
    if (typeof window.pcResetRelatedCarousel === "function") {
      window.pcResetRelatedCarousel();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductPage);
  } else {
    initProductPage();
  }
})();
