(function () {
  "use strict";

  if (!window.SH3_PRODUCTS) return;

  var products = window.SH3_PRODUCTS;
  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id") || products.catalog[0].id;
  var product = products.get(productId) || products.catalog[0];

  var mainImg = document.querySelector("[data-sh3-pdp-main]");
  var thumbTrack = document.querySelector("[data-sh3-pdp-thumbs]");
  var thumbUp = document.querySelector("[data-sh3-pdp-thumb-up]");
  var thumbDown = document.querySelector("[data-sh3-pdp-thumb-down]");
  var prevBtn = document.querySelector("[data-sh3-pdp-prev]");
  var nextBtn = document.querySelector("[data-sh3-pdp-next]");
  var titleEl = document.querySelector("[data-sh3-pdp-title]");
  var subtitleEl = document.querySelector("[data-sh3-pdp-subtitle]");
  var priceEl = document.querySelector("[data-sh3-pdp-price]");
  var mrpEl = document.querySelector("[data-sh3-pdp-mrp]");
  var offEl = document.querySelector("[data-sh3-pdp-off]");
  var emiTextEl = document.querySelector("[data-sh3-pdp-emi-text]");
  var emiMonthsEl = document.querySelector("[data-sh3-pdp-emi-months]");
  var ratingEl = document.querySelector("[data-sh3-pdp-rating]");
  var colorNameEl = document.querySelector("[data-sh3-pdp-color-name]");
  var colorSwatchesEl = document.querySelector("[data-sh3-pdp-colors]");
  var crumbEl = document.querySelector("[data-sh3-pdp-crumb]");
  var crumbCatEl = document.querySelector("[data-sh3-pdp-crumb-cat]");
  var specListEl = document.querySelector("[data-sh3-pdp-specs]");
  var uspListEl = document.querySelector("[data-sh3-pdp-usp]");
  var reviewsListEl = document.querySelector("[data-sh3-pdp-reviews]");
  var reviewScoreEl = document.querySelector("[data-sh3-pdp-review-score]");
  var reviewCountEl = document.querySelector("[data-sh3-pdp-review-count]");
  var faqListEl = document.querySelector("[data-sh3-pdp-faq]");
  var relatedGrid = document.querySelector("[data-sh3-pdp-related]");
  var sizeList = document.querySelector("[data-sh3-pdp-sizes]");
  var offersTrack = document.querySelector("[data-sh3-pdp-offers-track]");
  var offersViewport = document.querySelector("[data-sh3-pdp-offers-viewport]");
  var offersProgress = document.querySelector("[data-sh3-pdp-offers-progress]");
  var scrollInfoBtn = document.querySelector("[data-sh3-pdp-scroll-info]");

  var currentImage = 0;
  var thumbOffset = 0;
  var visibleThumbs = 5;
  var offerIndex = 0;

  var paymentOffers = [
    {
      tag: "Payment Offers",
      title: "Upto 15% Cashback On Mobikwik Wallet",
      sub: "5+ Payment Offers Available"
    },
    {
      tag: "Bank Offers",
      title: "10% Instant Discount on HDFC Cards",
      sub: "3+ Bank Offers Available"
    },
    {
      tag: "Wallet Offers",
      title: "Flat ₹500 Off on Paytm UPI Payments",
      sub: "2+ Wallet Offers Available"
    },
    {
      tag: "EMI Offers",
      title: "No Cost EMI on Select Credit Cards",
      sub: "4+ EMI Offers Available"
    }
  ];

  document.title = product.name + " — Kadam";

  if (crumbEl) crumbEl.textContent = product.name;
  if (crumbCatEl) {
    crumbCatEl.textContent = product.category;
    crumbCatEl.href = "shop.html?cat=" + encodeURIComponent(product.category);
  }

  if (titleEl) titleEl.textContent = product.name;
  if (subtitleEl) subtitleEl.textContent = product.subtitle;
  if (priceEl) priceEl.textContent = product.priceLabel;
  if (mrpEl) mrpEl.textContent = product.mrpLabel;
  if (offEl) offEl.textContent = product.offLabel;

  if (emiTextEl) {
    var monthly6 = Math.ceil(product.price / 6);
    emiTextEl.textContent =
      products.formatPrice(monthly6) + "/month | 2/4/6 months EMI options";
  }

  if (emiMonthsEl) {
    var monthly3 = Math.ceil(product.price / 3);
    emiMonthsEl.innerHTML = [1, 2, 3]
      .map(function (month) {
        return (
          '<div class="sh3-pdp__emi-month">' +
            '<span class="sh3-pdp__emi-month-circle">' + products.formatPrice(monthly3) + "</span>" +
            '<span class="sh3-pdp__emi-month-label">Month ' + month + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  if (ratingEl) {
    ratingEl.innerHTML =
      '<span class="sh3-pdp__rating-stars" aria-hidden="true">★★★★★</span>' +
      "<span>(" + product.count + ")</span>";
  }

  function setMainImage(index) {
    if (!mainImg || !product.images.length) return;
    currentImage = (index + product.images.length) % product.images.length;
    mainImg.src = product.images[currentImage];

    if (thumbTrack) {
      thumbTrack.querySelectorAll(".sh3-pdp__thumb").forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === currentImage);
      });
    }
  }

  function updateThumbWindow() {
    if (!thumbTrack) return;
    var thumbs = thumbTrack.querySelectorAll(".sh3-pdp__thumb");
    thumbs.forEach(function (thumb, i) {
      var visible = i >= thumbOffset && i < thumbOffset + visibleThumbs;
      thumb.style.display = visible ? "" : "none";
    });
    if (thumbUp) thumbUp.disabled = thumbOffset <= 0;
    if (thumbDown) thumbDown.disabled = thumbOffset + visibleThumbs >= thumbs.length;
  }

  if (mainImg) {
    mainImg.src = product.images[0];
    mainImg.alt = product.alt;
  }

  if (thumbTrack) {
    thumbTrack.innerHTML = product.images
      .map(function (src, index) {
        var active = index === 0 ? " is-active" : "";
        return (
          '<button type="button" class="sh3-pdp__thumb' + active + '" data-sh3-pdp-thumb="' + index + '">' +
            '<img src="' + src + '" alt="" width="64" height="64" loading="lazy" decoding="async" />' +
          "</button>"
        );
      })
      .join("");

    thumbTrack.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-sh3-pdp-thumb]");
      if (!btn) return;
      setMainImage(Number(btn.getAttribute("data-sh3-pdp-thumb")));
    });

    updateThumbWindow();
  }

  if (thumbUp) {
    thumbUp.addEventListener("click", function () {
      thumbOffset = Math.max(0, thumbOffset - 1);
      updateThumbWindow();
    });
  }

  if (thumbDown) {
    thumbDown.addEventListener("click", function () {
      var total = product.images.length;
      thumbOffset = Math.min(total - visibleThumbs, thumbOffset + 1);
      updateThumbWindow();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      setMainImage(currentImage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      setMainImage(currentImage + 1);
    });
  }

  if (colorSwatchesEl && product.colors) {
    colorSwatchesEl.innerHTML = product.colors
      .map(function (color, index) {
        var active = index === 0 ? " is-active" : "";
        return (
          '<button type="button" class="sh3-pdp__color-swatch' + active + '" data-sh3-pdp-color="' + index + '" aria-label="' + color.name + '">' +
            '<img src="' + color.image + '" alt="" width="40" height="40" loading="lazy" decoding="async" />' +
          "</button>"
        );
      })
      .join("");

    colorSwatchesEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-sh3-pdp-color]");
      if (!btn) return;
      var index = Number(btn.getAttribute("data-sh3-pdp-color"));
      var color = product.colors[index];
      if (!color) return;

      colorSwatchesEl.querySelectorAll(".sh3-pdp__color-swatch").forEach(function (el) {
        el.classList.remove("is-active");
      });
      btn.classList.add("is-active");

      if (colorNameEl) colorNameEl.textContent = color.name;
      if (mainImg) mainImg.src = color.image;
    });

    if (colorNameEl && product.colors[0]) {
      colorNameEl.textContent = product.colors[0].name;
    }
  }

  if (sizeList) {
    sizeList.innerHTML = product.sizes
      .map(function (size, index) {
        var active = index === 2 ? " is-active" : "";
        var disabled = size === 10 ? " disabled" : "";
        return (
          '<button type="button" class="sh3-pdp__size' + active + '" data-sh3-pdp-size' + disabled + ">" + size + "</button>"
        );
      })
      .join("");

    sizeList.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-sh3-pdp-size]");
      if (!btn || btn.disabled) return;

      sizeList.querySelectorAll(".sh3-pdp__size").forEach(function (el) {
        el.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  }

  function renderOffers() {
    if (!offersTrack) return;

    offersTrack.innerHTML = paymentOffers
      .map(function (offer) {
        return (
          '<article class="sh3-pdp__offers-slide">' +
            '<span class="sh3-pdp__offers-tag">' + offer.tag + "</span>" +
            '<div class="sh3-pdp__offers-row">' +
              '<div class="sh3-pdp__offers-copy">' +
                "<strong>" + offer.title + "</strong>" +
                "<span>" + offer.sub + "</span>" +
              "</div>" +
              '<button type="button" class="sh3-pdp__offers-next" data-sh3-pdp-offer-next aria-label="Next offer">' +
                '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>' +
              "</button>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    offersTrack.addEventListener("click", function (event) {
      if (event.target.closest("[data-sh3-pdp-offer-next]")) {
        goToOffer(offerIndex + 1);
      }
    });
  }

  function updateOfferTransform() {
    if (!offersTrack || !offersViewport) return;
    var slideWidth = offersViewport.getBoundingClientRect().width;
    offersTrack.style.transform = "translateX(-" + offerIndex * slideWidth + "px)";
  }

  function goToOffer(index) {
    if (!offersTrack) return;
    offerIndex = (index + paymentOffers.length) % paymentOffers.length;
    updateOfferTransform();

    if (offersProgress) {
      offersProgress.querySelectorAll("span").forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === offerIndex);
      });
    }
  }

  window.addEventListener("resize", updateOfferTransform);

  renderOffers();
  updateOfferTransform();

  if (scrollInfoBtn) {
    scrollInfoBtn.addEventListener("click", function () {
      var details = document.getElementById("sh3-pdp-details");
      if (details) details.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  var shoeUspItems = [
    { icon: "fa-solid fa-certificate fa-fw", text: "Official Kadam Premium Footwear" },
    { icon: "fa-solid fa-star fa-fw", text: "Ultra Comfort Street Design" },
    { icon: "fa-solid fa-bolt fa-fw", text: "Responsive Cushion Technology" },
    { icon: "fa-solid fa-wind fa-fw", text: "Breathable Mesh Upper" },
    { icon: "fa-solid fa-layer-group fa-fw", text: "Shock-Absorbing Phylon Midsole" },
    { icon: "fa-solid fa-shoe-prints fa-fw", text: "Anti-Slip High-Traction Rubber Outsole" },
    { icon: "fa-solid fa-heart-pulse fa-fw", text: "Ergonomic Arch Support for All-Day Wear" },
    { icon: "fa-solid fa-feather-pointed fa-fw", text: "Ultra-Lightweight Build | Only 250g" },
    { icon: "fa-solid fa-droplet fa-fw", text: "Water-Resistant Exterior Finish" }
  ];

  if (uspListEl) {
    uspListEl.innerHTML = shoeUspItems
      .map(function (item) {
        return (
          "<li>" +
            '<i class="' + item.icon + '" aria-hidden="true"></i>' +
            "<span>" + item.text + "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  if (specListEl) {
    specListEl.innerHTML = product.specs
      .map(function (spec) {
        return "<li><span>" + spec.label + "</span><strong>" + spec.value + "</strong></li>";
      })
      .join("");
  }

  if (reviewScoreEl) reviewScoreEl.textContent = "4.8";
  if (reviewCountEl) {
    reviewCountEl.textContent = "Based on " + product.count + " reviews";
  }

  if (reviewsListEl) {
    var sampleReviews = [
      {
        name: "Rahul M.",
        date: "12 Jun 2026",
        text: "Extremely comfortable for daily walks and gym sessions. The cushioning feels premium and the fit is true to size."
      },
      {
        name: "Priya S.",
        date: "08 Jun 2026",
        text: "Love the breathable upper — feet stay cool even after long hours. Great value for the price with fast delivery."
      },
      {
        name: "Arjun K.",
        date: "01 Jun 2026",
        text: "Solid grip on wet roads and lightweight feel. Perfect running shoe for city streets. Would definitely recommend Kadam."
      }
    ];

    reviewsListEl.innerHTML = sampleReviews
      .map(function (review) {
        return (
          '<article class="sh3-pdp__review">' +
            '<div class="sh3-pdp__review-head">' +
              '<span class="sh3-pdp__review-name">' + review.name + "</span>" +
              '<span class="sh3-pdp__review-date">' + review.date + "</span>" +
            "</div>" +
            '<div class="sh3-pdp__review-stars" aria-hidden="true">★★★★★</div>' +
            '<p class="sh3-pdp__review-text">' + review.text + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  if (faqListEl) {
    var faqItems = [
      {
        q: "What is the return policy for Kadam shoes?",
        a: "You can return unworn shoes within 7 days of delivery. Items must be in original packaging with tags attached for a full refund or exchange."
      },
      {
        q: "How do I choose the right shoe size?",
        a: "Refer to our UK size chart on the product page. If you are between sizes, we recommend sizing up for running shoes and staying true to size for casual sneakers."
      },
      {
        q: "Are these shoes suitable for running and gym workouts?",
        a: "Yes. Kadam shoes feature responsive cushioning and breathable uppers designed for running, training, and everyday wear."
      },
      {
        q: "How long does delivery take?",
        a: "Express shipping delivers within 3–5 business days for most pin codes. Enter your pincode above to check availability in your area."
      },
      {
        q: "Is EMI available on this product?",
        a: "Yes. You can buy on 3-month interest-free EMI or choose 2/4/6 month EMI options at checkout with select payment partners."
      }
    ];

    faqListEl.innerHTML = faqItems
      .map(function (item, index) {
        var openClass = index === 0 ? " is-open" : "";
        var expanded = index === 0 ? "true" : "false";
        return (
          '<article class="sh3-pdp__faq-item' + openClass + '" data-sh3-pdp-faq-item>' +
            '<button type="button" class="sh3-pdp__faq-toggle" data-sh3-pdp-faq-toggle aria-expanded="' + expanded + '">' +
              item.q +
              '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>' +
            "</button>" +
            '<div class="sh3-pdp__faq-panel">' + item.a + "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  document.querySelectorAll("[data-sh3-pdp-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-sh3-pdp-tab");

      document.querySelectorAll("[data-sh3-pdp-tab]").forEach(function (btn) {
        var isActive = btn.getAttribute("data-sh3-pdp-tab") === target;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      document.querySelectorAll("[data-sh3-pdp-panel]").forEach(function (panel) {
        var isActive = panel.getAttribute("data-sh3-pdp-panel") === target;
        panel.classList.toggle("is-active", isActive);
        if (isActive) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    });
  });

  document.querySelectorAll("[data-sh3-pdp-info-acc-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest("[data-sh3-pdp-info-acc]");
      if (!item) return;

      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  if (faqListEl) {
    faqListEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-sh3-pdp-faq-toggle]");
      if (!btn) return;

      var item = btn.closest("[data-sh3-pdp-faq-item]");
      if (!item) return;

      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  if (relatedGrid) {
    var related = products
      .getAll()
      .filter(function (item) {
        return item.id !== product.id;
      })
      .slice(0, 4);

    relatedGrid.innerHTML = related
      .map(function (item) {
        return products.createPickCard(item, { link: true, hideCompare: true });
      })
      .join("");
  }
})();
