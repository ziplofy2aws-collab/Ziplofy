/**
 * Baby-product — product page (PDP, related carousel, qty, accordions, reviews)
 */
(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Product detail — load data, gallery, meta, related cards
     -------------------------------------------------------------------------- */
  function initProductDetail() {
    if (!window.BM_PRODUCTS) return;

    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get("p") || "1", 10);
    var product = window.BM_PRODUCTS.find(function (p) {
      return p.id === id;
    }) || window.BM_PRODUCTS[0];

    function formatPrice(n) {
      return "Rs. " + n.toLocaleString("en-IN") + ".00";
    }

    document.title = product.title + " — Baby Product";

    var titleEl = document.querySelector("[data-bm-pdp-title]");
    var priceEl = document.querySelector("[data-bm-pdp-price]");
    var mrpEl = document.querySelector("[data-bm-pdp-mrp]");
    var subtotalEl = document.querySelector("[data-bm-pdp-subtotal]");
    var mainImg = document.querySelector("[data-bm-pdp-main-img]");
    var badgeEl = document.querySelector("[data-bm-pdp-badge]");
    var breadcrumbEl = document.querySelector("[data-bm-pdp-breadcrumb-name]");
    var thumbsWrap = document.querySelector("[data-bm-pdp-thumbs]");

    var skuEl = document.querySelector("[data-bm-pdp-sku]");
    var typeEl = document.querySelector("[data-bm-pdp-type]");
    var stockEl = document.querySelector("[data-bm-pdp-stock]");
    var soldEl = document.querySelector("[data-bm-pdp-sold]");
    var viewingEl = document.querySelector("[data-bm-pdp-viewing]");
    var sizeLabelEl = document.querySelector("[data-bm-pdp-size-label]");
    var sizeBtnEl = document.querySelector("[data-bm-pdp-size]");
    var stockFill = document.querySelector(".bm-pdp__stock-fill");

    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = formatPrice(product.price);
    if (mrpEl) mrpEl.textContent = formatPrice(product.mrp);
    if (subtotalEl) subtotalEl.textContent = formatPrice(product.price);
    if (badgeEl) badgeEl.textContent = product.badge;
    if (breadcrumbEl) breadcrumbEl.textContent = product.title;
    if (skuEl) skuEl.textContent = product.sku || "BM" + String(product.id).padStart(4, "0");
    if (typeEl) typeEl.textContent = product.productType || "Baby Essentials";
    if (soldEl) soldEl.textContent = product.soldText || "10 sold in last 35 hours";
    if (viewingEl) {
      viewingEl.textContent = (product.viewing || 193) + " customers are viewing this product";
    }

    var stock = product.stock != null ? product.stock : 17;
    if (stockEl) stockEl.textContent = String(stock);
    if (stockFill) {
      var pct = Math.min(85, Math.max(15, Math.round((stock / 50) * 100)));
      stockFill.style.width = pct + "%";
      var bar = stockFill.closest(".bm-pdp__stock-bar");
      if (bar) bar.setAttribute("aria-valuenow", String(pct));
    }

    var size = product.size || "0-3 Months";
    if (sizeLabelEl) sizeLabelEl.textContent = size;
    if (sizeBtnEl) sizeBtnEl.textContent = size;
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.title;
    }

    var images = product.images && product.images.length ? product.images : [product.image];

    if (thumbsWrap) {
      thumbsWrap.innerHTML = images
        .map(function (src, i) {
          return (
            '<button type="button" class="bm-pdp__thumb' +
            (i === 0 ? " is-active" : "") +
            '" data-bm-pdp-thumb="' +
            src +
            '"><img src="' +
            src +
            '" alt="" /></button>'
          );
        })
        .join("");

      thumbsWrap.querySelectorAll("[data-bm-pdp-thumb]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var src = btn.getAttribute("data-bm-pdp-thumb");
          if (mainImg && src) mainImg.src = src;
          thumbsWrap.querySelectorAll(".bm-pdp__thumb").forEach(function (t) {
            t.classList.remove("is-active");
          });
          btn.classList.add("is-active");
        });
      });

      var thumbStep = 74;
      var thumbOffset = 0;

      function updateThumbScroll() {
        thumbsWrap.style.transform = "translateY(-" + thumbOffset + "px)";
      }

      var thumbUp = document.querySelector("[data-bm-pdp-thumb-up]");
      var thumbDown = document.querySelector("[data-bm-pdp-thumb-down]");

      if (thumbUp) {
        thumbUp.addEventListener("click", function () {
          thumbOffset = Math.max(0, thumbOffset - thumbStep);
          updateThumbScroll();
        });
      }

      if (thumbDown) {
        thumbDown.addEventListener("click", function () {
          var max = Math.max(0, images.length * thumbStep - 420);
          thumbOffset = Math.min(max, thumbOffset + thumbStep);
          updateThumbScroll();
        });
      }
    }

    var relatedTrack = document.querySelector("[data-bm-related-track]");
    if (relatedTrack) {
      var related = window.BM_PRODUCTS.filter(function (p) {
        return p.id !== product.id;
      });

      relatedTrack.innerHTML = related
        .map(function (p) {
          return (
            '<article class="bm-related-card" data-bm-product-id="' + p.id + '">' +
            '<a href="product.html?p=' + p.id + '" class="bm-related-card__media">' +
            '<span class="bm-related-card__badge">' + p.badge + "</span>" +
            '<img src="' + p.image + '" alt="" width="320" height="320" decoding="async" />' +
            "</a>" +
            '<div class="bm-related-card__body">' +
            '<h3 class="bm-related-card__title"><a href="product.html?p=' + p.id + '">' + p.title + "</a></h3>" +
            '<p class="bm-related-card__price">' +
            '<s class="bm-related-card__price-old">' + formatPrice(p.mrp) + "</s>" +
            '<span class="bm-related-card__price-sale">' + formatPrice(p.price) + "</span></p>" +
            '<button type="button" class="bm-related-card__btn">Quick Add</button>' +
            "</div></article>"
          );
        })
        .join("");
    }
  }

  /* --------------------------------------------------------------------------
     Related products carousel
     -------------------------------------------------------------------------- */
  function initRelatedCarousel() {
    var root = document.querySelector("[data-bm-related-carousel]");
    if (!root) return;

    var viewport = root.querySelector("[data-bm-related-viewport]");
    var track = root.querySelector("[data-bm-related-track]");
    var prevBtn = root.querySelector("[data-bm-related-prev]");
    var nextBtn = root.querySelector("[data-bm-related-next]");
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    var items = track.querySelectorAll(".bm-related-card");
    if (!items.length) return;

    var index = 0;

    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap) || 18;
    }

    function getStep() {
      if (!items.length) return 0;
      return items[0].getBoundingClientRect().width + getGap();
    }

    function getVisibleCount() {
      var w = viewport.getBoundingClientRect().width;
      var step = getStep();
      if (step <= 0) return 1;
      return Math.max(1, Math.floor((w + getGap()) / step));
    }

    function getMaxIndex() {
      return Math.max(0, items.length - getVisibleCount());
    }

    function update() {
      var step = getStep();
      var maxIndex = getMaxIndex();
      if (index > maxIndex) index = maxIndex;
      track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;
    }

    prevBtn.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        update();
      }
    });

    nextBtn.addEventListener("click", function () {
      if (index < getMaxIndex()) {
        index += 1;
        update();
      }
    });

    window.addEventListener("resize", update);
    update();
  }

  /* --------------------------------------------------------------------------
     Quantity & subtotal
     -------------------------------------------------------------------------- */
  function initQuantity() {
    var qtyInput = document.querySelector("[data-bm-pdp-qty]");
    var subtotalEl = document.querySelector("[data-bm-pdp-subtotal]");
    var priceEl = document.querySelector("[data-bm-pdp-price]");
    if (!qtyInput) return;

    function getUnitPrice() {
      if (!priceEl) return 0;
      var text = priceEl.textContent.replace(/[^\d.]/g, "");
      return parseFloat(text) || 1199;
    }

    function updateSubtotal() {
      if (!subtotalEl) return;
      var qty = parseInt(qtyInput.value, 10) || 1;
      var total = getUnitPrice() * qty;
      subtotalEl.textContent = "Rs. " + total.toLocaleString("en-IN") + ".00";
    }

    var qtyMinus = document.querySelector("[data-bm-pdp-qty-minus]");
    var qtyPlus = document.querySelector("[data-bm-pdp-qty-plus]");

    if (qtyMinus) {
      qtyMinus.addEventListener("click", function () {
        var v = Math.max(1, parseInt(qtyInput.value, 10) - 1);
        qtyInput.value = String(v);
        updateSubtotal();
      });
    }

    if (qtyPlus) {
      qtyPlus.addEventListener("click", function () {
        var v = Math.min(99, parseInt(qtyInput.value, 10) + 1);
        qtyInput.value = String(v);
        updateSubtotal();
      });
    }
  }

  /* --------------------------------------------------------------------------
     Product accordions
     -------------------------------------------------------------------------- */
  function initAccordions() {
    document.querySelectorAll("[data-bm-pdp-accordion]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        var icon = btn.querySelector(".bm-pdp__accordion-icon");
        if (icon) icon.textContent = expanded ? "+" : "−";
        var panel = btn.parentElement && btn.parentElement.querySelector(".bm-pdp__accordion-panel");
        if (panel) panel.classList.toggle("is-open", !expanded);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Customer reviews
     -------------------------------------------------------------------------- */
  function initReviews() {
    var form = document.querySelector("[data-bm-reviews-form]");
    if (!form) return;

    var formPanel = document.querySelector("[data-bm-reviews-form-panel]");
    var listEl = document.querySelector("[data-bm-reviews-list]");
    var summaryStars = document.querySelector("[data-bm-reviews-summary-stars]");
    var summaryText = document.querySelector("[data-bm-reviews-summary-text]");
    var cancelTop = document.querySelector("[data-bm-reviews-cancel-top]");
    var cancelBtn = document.querySelector("[data-bm-reviews-cancel]");
    var writeBtn = document.querySelector("[data-bm-reviews-write-btn]");
    var ratingInput = document.querySelector("[data-bm-reviews-rating-value]");
    var ratingWrap = document.querySelector("[data-bm-reviews-rating-input]");
    var mediaInput = document.querySelector("[data-bm-reviews-media]");
    var mediaName = document.querySelector("[data-bm-reviews-media-name]");

    var reviews = [];
    var selectedRating = 0;

    function renderStars(container, rating) {
      if (!container) return;
      var html = "";
      for (var i = 1; i <= 5; i++) {
        html += '<span class="' + (i <= rating ? "is-filled" : "") + '"></span>';
      }
      container.innerHTML = html;
    }

    function updateSummary() {
      if (!summaryStars || !summaryText) return;

      if (!reviews.length) {
        renderStars(summaryStars, 0);
        summaryText.textContent = "Be the first to write a review";
        return;
      }

      var total = reviews.reduce(function (sum, r) {
        return sum + r.rating;
      }, 0);
      var avg = Math.round(total / reviews.length);
      renderStars(summaryStars, avg);
      summaryText.textContent =
        reviews.length + " review" + (reviews.length === 1 ? "" : "s") + " · " + avg + " out of 5";
    }

    function formatDate(d) {
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function renderReviews() {
      if (!listEl) return;

      if (!reviews.length) {
        listEl.innerHTML = "";
        return;
      }

      listEl.innerHTML = reviews
        .map(function (r) {
          var stars = "";
          for (var i = 1; i <= 5; i++) {
            stars += '<span class="' + (i <= r.rating ? "is-filled" : "") + '"></span>';
          }
          return (
            '<article class="bm-reviews__item">' +
            '<div class="bm-reviews__item-stars bm-reviews__stars" aria-label="' +
            r.rating +
            ' out of 5 stars">' +
            stars +
            "</div>" +
            '<h4 class="bm-reviews__item-title">' +
            escapeHtml(r.title) +
            "</h4>" +
            '<p class="bm-reviews__item-content">' +
            escapeHtml(r.content) +
            "</p>" +
            '<p class="bm-reviews__item-meta">' +
            escapeHtml(r.name) +
            " · " +
            r.date +
            "</p>" +
            "</article>"
          );
        })
        .join("");
    }

    function setRating(value) {
      selectedRating = value;
      if (ratingInput) ratingInput.value = String(value);
      if (!ratingWrap) return;
      ratingWrap.querySelectorAll(".bm-reviews__star-btn").forEach(function (btn) {
        var n = parseInt(btn.getAttribute("data-rating"), 10);
        btn.classList.toggle("is-filled", n <= value);
        btn.classList.remove("is-hover");
      });
    }

    function showForm() {
      if (formPanel) formPanel.hidden = false;
      if (cancelTop) cancelTop.hidden = false;
      if (writeBtn) writeBtn.hidden = true;
    }

    function hideForm() {
      if (formPanel) formPanel.hidden = true;
      if (cancelTop) cancelTop.hidden = true;
      if (writeBtn) writeBtn.hidden = false;
    }

    function resetForm() {
      form.reset();
      setRating(0);
      if (mediaName) mediaName.textContent = "";
    }

    if (ratingWrap) {
      var starBtns = ratingWrap.querySelectorAll(".bm-reviews__star-btn");

      starBtns.forEach(function (btn) {
        var n = parseInt(btn.getAttribute("data-rating"), 10);

        btn.addEventListener("mouseenter", function () {
          starBtns.forEach(function (b) {
            var r = parseInt(b.getAttribute("data-rating"), 10);
            b.classList.toggle("is-hover", r <= n);
            b.classList.toggle("is-filled", false);
          });
        });

        btn.addEventListener("click", function () {
          setRating(n);
        });
      });

      ratingWrap.addEventListener("mouseleave", function () {
        starBtns.forEach(function (b) {
          b.classList.remove("is-hover");
        });
        setRating(selectedRating);
      });
    }

    if (mediaInput && mediaName) {
      mediaInput.addEventListener("change", function () {
        var file = mediaInput.files && mediaInput.files[0];
        mediaName.textContent = file ? file.name : "";
      });
    }

    function onCancel() {
      hideForm();
      resetForm();
    }

    if (cancelBtn) cancelBtn.addEventListener("click", onCancel);
    if (cancelTop) cancelTop.addEventListener("click", onCancel);
    if (writeBtn) writeBtn.addEventListener("click", showForm);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var rating = parseInt((ratingInput && ratingInput.value) || "0", 10);
      var titleInput = form.querySelector("[data-bm-reviews-title]");
      var contentInput = form.querySelector("[data-bm-reviews-content]");
      var nameInput = form.querySelector("[data-bm-reviews-name]");
      var emailInput = form.querySelector("[data-bm-reviews-email]");

      var title = titleInput ? titleInput.value.trim() : "";
      var content = contentInput ? contentInput.value.trim() : "";
      var name = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";

      if (!rating) {
        alert("Please select a rating.");
        return;
      }
      if (!title || !content || !name || !email) {
        alert("Please fill in all required fields.");
        return;
      }

      reviews.unshift({
        rating: rating,
        title: title,
        content: content,
        name: name,
        email: email,
        date: formatDate(new Date())
      });

      renderReviews();
      updateSummary();
      resetForm();
      hideForm();

      if (listEl && listEl.firstElementChild) {
        listEl.firstElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    renderStars(summaryStars, 0);
    showForm();
    updateSummary();
  }

  /* --------------------------------------------------------------------------
     Boot — order matters: detail populates related track before carousel init
     -------------------------------------------------------------------------- */
  function init() {
    initProductDetail();
    initRelatedCarousel();
    initQuantity();
    initAccordions();
    initReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
