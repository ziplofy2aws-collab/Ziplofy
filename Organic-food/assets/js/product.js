(function () {
  "use strict";

  var products = window.ORG_PRODUCTS || {};
  var params = new URLSearchParams(window.location.search);
  var productId = params.get("product") || "dj-1";
  var product = products[productId] || products["dj-1"];
  var quantity = 1;
  var selectedVariantIndex = 0;
  var activeTab = "description";

  if (!product) {
    return;
  }

  document.title = product.name + " — VERDURE";

  var TAB_IDS = [
    "description",
    "how-to-use",
    "nutrition",
    "certifications",
    "why-choose",
    "sourcing"
  ];

  var mainImg = document.querySelector("[data-org-product-image]");
  var thumbsTrack = document.querySelector("[data-org-product-thumbs]");
  var thumbsViewport = document.querySelector("[data-org-product-thumbs-viewport]");
  var thumbsNext = document.querySelector("[data-org-product-thumbs-next]");
  var variantsEl = document.querySelector("[data-org-product-variants]");
  var qtyValueEl = document.querySelector("[data-org-qty-value]");
  var qtyMinus = document.querySelector("[data-org-qty-minus]");
  var qtyPlus = document.querySelector("[data-org-qty-plus]");
  var cartBtn = document.querySelector("[data-org-product-cart]");
  var buyBtn = document.querySelector("[data-org-product-buy]");
  var priceEl = document.querySelector("[data-org-product-price]");
  var stockWrap = document.querySelector("[data-org-product-stock-wrap]");
  var stockEl = document.querySelector("[data-org-product-stock]");
  var memberOfferEl = document.querySelector("[data-org-product-member-offer]");
  var tabButtons = document.querySelectorAll("[data-org-tab]");
  var tabPanels = document.querySelectorAll("[data-org-tab-panel]");
  var backTopBtn = document.querySelector("[data-org-back-top]");
  var faqEl = document.querySelector("[data-org-product-faq]");
  var reviewsAvgEl = document.querySelector("[data-org-reviews-avg]");
  var reviewsBarsEl = document.querySelector("[data-org-reviews-bars]");
  var reviewsListEl = document.querySelector("[data-org-product-reviews-list]");
  var reviewsSortEl = document.querySelector("[data-org-reviews-sort]");
  var reviewsAuthenticityEl = document.querySelector("[data-org-reviews-authenticity]");
  var reviewsTransparencyEl = document.querySelector("[data-org-reviews-transparency]");

  function parsePrice(value) {
    return parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  }

  function formatPrice(amount) {
    return "₹ " + amount.toFixed(2);
  }

  function getDiscountPercent() {
    var match = String(product.discount || "").match(/(\d+)/);
    return match ? match[1] + "%" : product.discount || "";
  }

  function getGallery() {
    if (product.gallery && product.gallery.length) {
      return product.gallery;
    }

    var images = [product.image];
    Object.keys(products).forEach(function (key) {
      var img = products[key].image;
      if (img && images.indexOf(img) === -1) {
        images.push(img);
      }
    });

    return images.slice(0, 6);
  }

  function getVariants() {
    if (product.variants && product.variants.length) {
      return product.variants;
    }

    var sizes = product.sizes && product.sizes.length ? product.sizes : [product.size];
    var basePrice = parsePrice(product.price);
    var altPrice = parsePrice(product.mrp) || basePrice * 1.8;

    return sizes.slice(0, 2).map(function (label, index) {
      return {
        label: label,
        price: index === 0 ? product.price : formatPrice(altPrice)
      };
    });
  }

  function getHighlights() {
    if (product.highlights && product.highlights.length) {
      return product.highlights;
    }

    return [
      "100% organic and sustainably sourced from certified farms",
      product.subtitle,
      "Free from artificial preservatives, colours and flavours",
      "Cold-processed to retain natural nutrients and freshness",
      "Trusted by thousands of health-conscious households"
    ];
  }

  function getMemberOffer(priceText) {
    var price = parsePrice(priceText || product.price);
    var memberPrice = price * 0.9;
    var saveAmount = price - memberPrice;
    return formatPrice(memberPrice) + " · save " + formatPrice(saveAmount);
  }

  function getRating() {
    return typeof product.rating === "number" ? product.rating : 4;
  }

  function renderStars(rating) {
    var html = "";
    var i;

    for (i = 1; i <= 5; i += 1) {
      if (i <= rating) {
        html += '<i class="fa-solid fa-star is-filled"></i>';
      } else {
        html += '<i class="fa-regular fa-star is-empty"></i>';
      }
    }

    return html;
  }

  function setText(selector, value) {
    var el = document.querySelector(selector);
    if (el && value != null) {
      el.textContent = value;
    }
  }

  function updatePriceDisplay(priceText) {
    if (priceEl) {
      priceEl.textContent = priceText;
    }
    if (memberOfferEl) {
      memberOfferEl.textContent = getMemberOffer(priceText);
    }
  }

  function renderThumbnails(gallery) {
    if (!thumbsTrack) {
      return;
    }

    thumbsTrack.innerHTML = gallery
      .map(function (src, index) {
        return (
          '<button type="button" class="org-product-page__thumb' +
          (index === 0 ? " is-active" : "") +
          '" data-org-thumb-index="' +
          index +
          '" aria-label="View image ' +
          (index + 1) +
          '">' +
          '<img src="' +
          src +
          '" alt="" width="72" height="72" loading="lazy" decoding="async" /></button>'
        );
      })
      .join("");

    thumbsTrack.querySelectorAll("[data-org-thumb-index]").forEach(function (button) {
      button.addEventListener("click", function () {
        var index = parseInt(button.getAttribute("data-org-thumb-index"), 10);
        var galleryImages = getGallery();

        thumbsTrack.querySelectorAll(".org-product-page__thumb").forEach(function (thumb) {
          thumb.classList.remove("is-active");
        });
        button.classList.add("is-active");

        if (mainImg && galleryImages[index]) {
          mainImg.src = galleryImages[index];
        }
      });
    });
  }

  function renderVariants(variants) {
    if (!variantsEl) {
      return;
    }

    variantsEl.innerHTML = variants
      .map(function (variant, index) {
        return (
          '<button type="button" class="org-product-page__variant' +
          (index === selectedVariantIndex ? " is-active" : "") +
          '" data-org-variant-index="' +
          index +
          '" role="option" aria-selected="' +
          (index === selectedVariantIndex ? "true" : "false") +
          '">' +
          '<span class="org-product-page__variant-label">' +
          variant.label +
          "</span>" +
          '<span class="org-product-page__variant-price">' +
          variant.price +
          "</span></button>"
        );
      })
      .join("");

    variantsEl.querySelectorAll("[data-org-variant-index]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedVariantIndex = parseInt(button.getAttribute("data-org-variant-index"), 10);
        var variantsList = getVariants();
        var selected = variantsList[selectedVariantIndex];

        variantsEl.querySelectorAll(".org-product-page__variant").forEach(function (variantBtn) {
          var isActive =
            parseInt(variantBtn.getAttribute("data-org-variant-index"), 10) ===
            selectedVariantIndex;
          variantBtn.classList.toggle("is-active", isActive);
          variantBtn.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        if (selected) {
          updatePriceDisplay(selected.price);
        }
      });
    });
  }

  function getTabContent(tabId) {
    if (product.tabs && product.tabs[tabId]) {
      return product.tabs[tabId];
    }

    var name = product.name;
    var desc = product.descriptionLong || product.description || "";

    if (tabId === "description") {
      return (
        "<p>" +
        desc +
        "</p><p><em>" +
        name +
        "</em> is part of the Verdure Organic wellness range — crafted with care from sustainably sourced ingredients and processed to retain natural nutrition.</p>" +
        "<p>Also known as: Kannada — " +
        name +
        " | Hindi — " +
        name +
        " | Tamil — " +
        name +
        " | Telugu — " +
        name +
        "</p><p>Every batch is quality-checked at our certified facility before it reaches your home.</p>"
      );
    }

    if (tabId === "how-to-use") {
      return (
        "<p>Use as directed on the label. For liquid wellness products, shake well before use and consume the recommended serving daily for best results.</p>" +
        "<p>Store in a cool, dry place away from direct sunlight. Refrigerate after opening.</p>" +
        "<ul><li>Consult a physician before use if pregnant, nursing or on medication</li><li>Keep out of reach of children</li><li>Do not exceed the recommended daily intake</li></ul>"
      );
    }

    if (tabId === "nutrition") {
      return (
        '<table class="org-product-tabs__table"><thead><tr><th>Nutrient</th><th>Per Serving</th><th>% RDA*</th></tr></thead><tbody>' +
        "<tr><td>Energy</td><td>Approx. 50 kcal</td><td>2%</td></tr>" +
        "<tr><td>Protein</td><td>0.5 g</td><td>1%</td></tr>" +
        "<tr><td>Carbohydrate</td><td>12 g</td><td>—</td></tr>" +
        "<tr><td>Total Fat</td><td>0.2 g</td><td>—</td></tr>" +
        "<tr><td>Dietary Fibre</td><td>1 g</td><td>4%</td></tr>" +
        "</tbody></table><p><em>*Approximate values. Refer to product packaging for exact nutritional information.</em></p>"
      );
    }

    if (tabId === "certifications") {
      return (
        '<ul class="org-product-tabs__badges">' +
        '<li><i class="fa-solid fa-certificate" aria-hidden="true"></i> India Organic (NPOP) Certified</li>' +
        '<li><i class="fa-solid fa-leaf" aria-hidden="true"></i> FSSAI Licensed</li>' +
        '<li><i class="fa-solid fa-check" aria-hidden="true"></i> GMP Certified Facility</li>' +
        '<li><i class="fa-solid fa-seedling" aria-hidden="true"></i> No Artificial Preservatives</li>' +
        "</ul>"
      );
    }

    if (tabId === "why-choose") {
      return (
        "<p>Verdure Organic is committed to clean, transparent and sustainable food systems.</p>" +
        "<ul>" +
        "<li>" +
        product.subtitle +
        "</li>" +
        "<li>100% organic and sustainably sourced ingredients</li>" +
        "<li>No artificial preservatives, colours or flavours</li>" +
        "<li>Direct farm partnerships across India</li>" +
        "<li>Trusted by health-conscious households nationwide</li>" +
        "</ul>"
      );
    }

    if (tabId === "sourcing") {
      return (
        "<p>" +
        name +
        " is sourced from certified organic farms across India. We work directly with farmer cooperatives to ensure fair prices, traceability and sustainable cultivation.</p>" +
        "<p>Ingredients are processed within 48 hours of harvest at our GMP-certified facility to preserve freshness and nutritional integrity.</p>" +
        "<p>Our supply chain is designed to minimise food miles while supporting rural livelihoods and regenerative agriculture.</p>"
      );
    }

    return "";
  }

  function renderTabs() {
    tabPanels.forEach(function (panel) {
      var tabId = panel.getAttribute("data-org-tab-panel");
      panel.innerHTML = getTabContent(tabId);
    });
  }

  function switchTab(tabId) {
    activeTab = tabId;

    tabButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-org-tab") === tabId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach(function (panel) {
      var isActive = panel.getAttribute("data-org-tab-panel") === tabId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  }

  function initTabs() {
    if (!tabButtons.length || !tabPanels.length) {
      return;
    }

    renderTabs();
    switchTab("description");

    tabButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        switchTab(button.getAttribute("data-org-tab"));
      });
    });

    var tabList = document.querySelector("[data-org-product-tabs]");
    if (tabList) {
      tabList.addEventListener("keydown", function (event) {
        var currentIndex = TAB_IDS.indexOf(activeTab);
        var nextIndex = currentIndex;

        if (event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % TAB_IDS.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length;
        } else {
          return;
        }

        event.preventDefault();
        switchTab(TAB_IDS[nextIndex]);
        tabButtons[nextIndex].focus();
      });
    }
  }

  function getFaqItems() {
    if (product.faq && product.faq.length) {
      return product.faq;
    }

    var name = product.name;
    return [
      {
        question: "What is " + name + "?",
        answer: product.descriptionLong || product.description
      },
      {
        question: "What are the benefits of " + name + "?",
        answer: product.subtitle + ". " + (product.description || "")
      },
      {
        question: "Is " + name + " good for diabetics?",
        answer:
          "Please consult your physician before use if you have diabetes or any medical condition. Our products contain no artificial preservatives, but individual dietary needs may vary."
      },
      {
        question: "What is " + name + " called in different languages?",
        answer:
          "The product is known by its English name across regions. Regional names are listed on the product packaging and in the Description tab above."
      },
      {
        question: "How should I use " + name + " properly?",
        answer:
          "Follow the usage instructions on the label. Shake well before use if applicable, and store in a cool, dry place. Refrigerate after opening."
      },
      {
        question: "Is " + name + " better than conventional alternatives?",
        answer:
          "Verdure Organic products are cold-processed, sustainably sourced and free from artificial preservatives — offering a cleaner, more transparent alternative to mass-market options."
      },
      {
        question: "Can " + name + " be used daily?",
        answer:
          "Yes, it can be incorporated into your daily wellness routine as directed on the label. Consistent use over 4–6 weeks is recommended for best results."
      },
      {
        question: "Does " + name + " help in weight management?",
        answer:
          "While not a weight-loss product, our clean-label organic formulations fit well into balanced, mindful eating plans. Consult a nutritionist for personalised advice."
      },
      {
        question: "What is the shelf life of this product?",
        answer:
          "Unopened products stay fresh for up to 12 months when stored in a cool, dry place. Once opened, refrigerate and consume within the period indicated on the packaging."
      }
    ];
  }

  function initFaq() {
    if (!faqEl) {
      return;
    }

    var items = getFaqItems();

    faqEl.innerHTML = items
      .map(function (item, index) {
        return (
          '<div class="org-product-faq__item" data-org-faq-item="' +
          index +
          '">' +
          '<button type="button" class="org-product-faq__question" aria-expanded="false" data-org-faq-toggle="' +
          index +
          '">' +
          "<span>" +
          item.question +
          "</span>" +
          '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
          '<div class="org-product-faq__answer" data-org-faq-answer="' +
          index +
          '" hidden><p>' +
          item.answer +
          "</p></div></div>"
        );
      })
      .join("");

    faqEl.querySelectorAll("[data-org-faq-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var index = button.getAttribute("data-org-faq-toggle");
        var item = button.closest(".org-product-faq__item");
        var answer = faqEl.querySelector('[data-org-faq-answer="' + index + '"]');
        var isOpen = item.classList.contains("is-open");

        faqEl.querySelectorAll(".org-product-faq__item").forEach(function (faqItem) {
          faqItem.classList.remove("is-open");
          var toggle = faqItem.querySelector("[data-org-faq-toggle]");
          var panel = faqItem.querySelector("[data-org-faq-answer]");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
          }
          if (panel) {
            panel.hidden = true;
          }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          if (answer) {
            answer.hidden = false;
          }
        }
      });
    });
  }

  function renderReviewStars(rating) {
    var html = "";
    var i;

    for (i = 1; i <= 5; i += 1) {
      if (rating >= i) {
        html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
      } else if (rating >= i - 0.5) {
        html += '<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>';
      } else {
        html += '<i class="fa-regular fa-star" aria-hidden="true"></i>';
      }
    }

    return html;
  }

  function parseReviewDate(dateStr) {
    var parts = String(dateStr).split("/");
    if (parts.length !== 3) {
      return 0;
    }
    return new Date(parts[2], parts[0] - 1, parts[1]).getTime();
  }

  function getReviewsData() {
    if (product.reviewsData) {
      return product.reviewsData;
    }

    var total = product.reviews || 12;
    var avg = getRating() + 0.35;

    return {
      average: avg,
      total: total,
      distribution: {
        5: Math.max(1, Math.round(total * 0.72)),
        4: Math.max(0, Math.round(total * 0.18)),
        3: 1,
        2: 0,
        1: 1
      },
      authenticity: 96.8,
      transparency: 93.5,
      items: [
        {
          rating: 5,
          date: "06/10/2026",
          name: "Narendran B",
          title: "The quality is",
          body: "The quality is good",
          verified: true
        },
        {
          rating: 5,
          date: "05/18/2026",
          name: "Sneha Patel",
          title: "Love this product",
          body: "Authentic organic taste and excellent packaging. Will definitely buy again.",
          verified: true
        },
        {
          rating: 4,
          date: "04/25/2026",
          name: "Rohit Verma",
          title: "Worth the price",
          body: "Good quality overall. Delivery was quick and the product matched the description.",
          verified: true
        },
        {
          rating: 5,
          date: "03/12/2026",
          name: "Divya Iyer",
          title: "Highly satisfied",
          body: "Been a regular customer of Verdure Organic. This product lives up to the brand promise.",
          verified: true
        }
      ]
    };
  }

  function sortReviews(items, sortBy) {
    var sorted = items.slice();

    if (sortBy === "highest") {
      sorted.sort(function (a, b) {
        return b.rating - a.rating || parseReviewDate(b.date) - parseReviewDate(a.date);
      });
    } else if (sortBy === "lowest") {
      sorted.sort(function (a, b) {
        return a.rating - b.rating || parseReviewDate(b.date) - parseReviewDate(a.date);
      });
    } else {
      sorted.sort(function (a, b) {
        return parseReviewDate(b.date) - parseReviewDate(a.date);
      });
    }

    return sorted;
  }

  function renderReviewBars(distribution, total) {
    if (!reviewsBarsEl) {
      return;
    }

    var stars;
    var html = "";

    for (stars = 5; stars >= 1; stars -= 1) {
      var count = distribution[stars] || 0;
      var percent = total ? Math.round((count / total) * 100) : 0;

      html +=
        '<div class="org-product-reviews__bar-row">' +
        '<span class="org-product-reviews__bar-label">' +
        renderReviewStars(stars) +
        "</span>" +
        '<span class="org-product-reviews__bar-track"><span class="org-product-reviews__bar-fill" style="width:' +
        percent +
        '%"></span></span>' +
        '<span class="org-product-reviews__bar-count">' +
        count +
        "</span></div>";
    }

    reviewsBarsEl.innerHTML = html;
  }

  function renderReviewCards(items) {
    if (!reviewsListEl) {
      return;
    }

    reviewsListEl.innerHTML = items
      .map(function (review) {
        return (
          '<article class="org-product-reviews__card">' +
          '<div class="org-product-reviews__card-top">' +
          '<span class="org-product-reviews__card-stars">' +
          renderReviewStars(review.rating) +
          "</span>" +
          '<time class="org-product-reviews__card-date" datetime="' +
          review.date +
          '">' +
          review.date +
          "</time></div>" +
          '<div class="org-product-reviews__card-user">' +
          '<span class="org-product-reviews__card-avatar"><i class="fa-solid fa-user" aria-hidden="true"></i></span>' +
          '<span class="org-product-reviews__card-name">' +
          review.name +
          "</span>" +
          (review.verified
            ? '<span class="org-product-reviews__card-verified">Verified</span>'
            : "") +
          "</div>" +
          '<h3 class="org-product-reviews__card-title">' +
          review.title +
          "</h3>" +
          '<p class="org-product-reviews__card-body">' +
          review.body +
          "</p></article>"
        );
      })
      .join("");
  }

  function initReviews() {
    var data = getReviewsData();
    var sortBy = reviewsSortEl ? reviewsSortEl.value : "recent";

    if (reviewsAvgEl) {
      reviewsAvgEl.innerHTML =
        '<div class="org-product-reviews__avg-stars">' +
        renderReviewStars(data.average) +
        "</div>" +
        '<p class="org-product-reviews__avg-score">' +
        data.average.toFixed(2) +
        " out of 5</p>" +
        '<p class="org-product-reviews__avg-count">Based on ' +
        data.total +
        ' reviews <i class="fa-solid fa-square-check" aria-hidden="true"></i></p>';
    }

    renderReviewBars(data.distribution, data.total);
    renderReviewCards(sortReviews(data.items, sortBy));

    if (reviewsAuthenticityEl) {
      reviewsAuthenticityEl.textContent = data.authenticity.toFixed(1);
    }
    if (reviewsTransparencyEl) {
      reviewsTransparencyEl.textContent = data.transparency.toFixed(1);
    }

    if (reviewsSortEl) {
      reviewsSortEl.addEventListener("change", function () {
        renderReviewCards(sortReviews(data.items, reviewsSortEl.value));
      });
    }
  }

  function initBackToTop() {
    if (!backTopBtn) {
      return;
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        backTopBtn.hidden = false;
        backTopBtn.classList.add("is-visible");
      } else {
        backTopBtn.hidden = true;
        backTopBtn.classList.remove("is-visible");
      }
    });

    backTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function renderHighlights(highlights) {
    var list = document.querySelector("[data-org-product-highlights]");
    if (!list) {
      return;
    }

    list.innerHTML = highlights
      .map(function (item) {
        return (
          '<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>' +
          item +
          "</span></li>"
        );
      })
      .join("");
  }

  function updateQuantity(nextValue) {
    quantity = Math.max(1, Math.min(99, nextValue));
    if (qtyValueEl) {
      qtyValueEl.textContent = String(quantity);
    }
    if (qtyMinus) {
      qtyMinus.disabled = quantity <= 1;
    }
  }

  function initProduct() {
    var gallery = getGallery();
    var variants = getVariants();
    var stockCount = product.stockCount != null ? product.stockCount : 9;

    if (mainImg) {
      mainImg.src = gallery[0];
      mainImg.alt = product.name;
    }

    setText("[data-org-product-title]", product.name);
    setText("[data-org-product-crumb-current]", product.name);
    setText("[data-org-product-crumb-discount]", getDiscountPercent());
    setText("[data-org-product-reviews]", "(" + product.reviews + " reviews)");
    setText("[data-org-product-stock]", String(stockCount));

    var starsEl = document.querySelector("[data-org-product-stars]");
    if (starsEl) {
      starsEl.innerHTML = renderStars(getRating());
    }

    updatePriceDisplay(variants[selectedVariantIndex]
      ? variants[selectedVariantIndex].price
      : product.price);

    if (product.soldOut) {
      if (stockWrap) {
        stockWrap.classList.add("org-product-page__stock--out");
        stockWrap.innerHTML = "<span>Out of stock</span>";
      }
      if (cartBtn) {
        cartBtn.textContent = "Sold out";
        cartBtn.classList.add("org-product-page__cart-btn--soldout");
        cartBtn.disabled = true;
      }
      if (buyBtn) {
        buyBtn.disabled = true;
      }
    }

    renderThumbnails(gallery);
    renderVariants(variants);
    renderHighlights(getHighlights());
    updateQuantity(1);
    initTabs();
    initFaq();
    initReviews();
    initBackToTop();
  }

  if (thumbsNext && thumbsViewport) {
    thumbsNext.addEventListener("click", function () {
      thumbsViewport.scrollBy({ left: 180, behavior: "smooth" });
    });
  }

  if (qtyMinus) {
    qtyMinus.addEventListener("click", function () {
      updateQuantity(quantity - 1);
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", function () {
      updateQuantity(quantity + 1);
    });
  }

  var relatedGrid = document.querySelector("[data-org-product-related]");
  if (relatedGrid) {
    var related = Object.keys(products)
      .map(function (key) {
        return products[key];
      })
      .filter(function (item) {
        return item.id !== product.id;
      })
      .slice(0, 4);

    relatedGrid.innerHTML = related
      .map(function (item) {
        return (
          '<article class="org-product-card">' +
          '<div class="org-product-card__head">' +
          '<span class="org-product-card__badge">' +
          item.badge +
          "</span>" +
          '<button type="button" class="org-product-card__wish" aria-label="Add to wishlist">' +
          '<i class="fa-regular fa-heart" aria-hidden="true"></i></button></div>' +
          '<a href="product.html?product=' +
          item.id +
          '" class="org-shop-page__card-link">' +
          '<div class="org-product-card__media">' +
          '<img src="' +
          item.image +
          '" alt="" width="320" height="320" loading="lazy" decoding="async" /></div>' +
          '<h3 class="org-product-card__title">' +
          item.name +
          "</h3>" +
          '<p class="org-product-card__subtitle">' +
          item.subtitle +
          "</p></a>" +
          '<div class="org-product-card__price-row">' +
          '<span class="org-product-card__price">' +
          item.price +
          "</span>" +
          '<span class="org-product-card__discount">' +
          item.discount +
          "</span></div>" +
          '<button type="button" class="org-product-card__cart">' +
          '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>' +
          "<span>Add to Cart</span></button></article>"
        );
      })
      .join("");
  }

  initProduct();
})();
