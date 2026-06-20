(function () {
  "use strict";

  function initProductPage() {
    if (typeof phrGetProduct !== "function") return;

    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id") || PHR_DEFAULT_PRODUCT_ID;
    var product = phrGetProduct(productId);

    document.title = product.name + " — VitalRx";

    var mainImg = document.querySelector("[data-phr-product-main]");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    var brandEl = document.querySelector("[data-phr-product-brand]");
    if (brandEl) brandEl.textContent = product.brand;

    var titleEl = document.getElementById("phr-product-title");
    if (titleEl) titleEl.textContent = product.name;

    var tagEl = document.querySelector("[data-phr-product-tag]");
    if (tagEl) tagEl.textContent = product.tag;

    var priceEl = document.querySelector("[data-phr-product-price]");
    if (priceEl) priceEl.textContent = phrFormatPrice(product.price);

    var mrpEl = document.querySelector("[data-phr-product-mrp]");
    if (mrpEl) mrpEl.textContent = phrFormatPrice(product.mrp);

    var offEl = document.querySelector("[data-phr-product-off]");
    if (offEl) {
      if (product.discount > 0) {
        offEl.textContent = product.discount + "% OFF";
        offEl.hidden = false;
      } else {
        offEl.hidden = true;
      }
    }

    var crumbCategory = document.querySelector("[data-phr-product-crumb-category]");
    if (crumbCategory) crumbCategory.textContent = product.category;

    var crumbSub = document.querySelector("[data-phr-product-crumb-sub]");
    if (crumbSub) crumbSub.textContent = product.subcategory;

    var crumbCurrent = document.querySelector("[data-phr-product-crumb-current]");
    if (crumbCurrent) crumbCurrent.textContent = phrTruncateText(product.name, 28);

    var descriptionEl = document.querySelector("[data-phr-read-text]");
    if (descriptionEl) descriptionEl.textContent = product.description;

    phrBindProductCards();
  }

  initProductPage();

  function initSlider(section, config) {
    var viewport = section.querySelector(config.viewport);
    var track = section.querySelector(config.track);
    var cards = section.querySelectorAll(config.card);
    var prevBtn = section.querySelector(config.prev);
    var nextBtn = section.querySelector(config.next);

    if (!viewport || !track || !cards.length || !prevBtn || !nextBtn) return;

    var index = 0;

    function getStep() {
      var card = cards[0];
      if (!card) return 0;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "12") || 12;
      return card.getBoundingClientRect().width + gap;
    }

    function getVisibleCount() {
      var step = getStep();
      if (!step) return 1;
      return Math.max(1, Math.floor(viewport.getBoundingClientRect().width / step));
    }

    function getMaxIndex() {
      var visible = getVisibleCount();
      return Math.max(0, cards.length - visible);
    }

    function updateControls() {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(index, maxIndex));

      track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

      prevBtn.hidden = index <= 0;
      nextBtn.hidden = index >= maxIndex;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;
    }

    prevBtn.addEventListener("click", function () {
      index -= 1;
      updateControls();
    });

    nextBtn.addEventListener("click", function () {
      index += 1;
      updateControls();
    });

    window.addEventListener("resize", updateControls);
    updateControls();
  }

  var similarSlider = document.querySelector("[data-phr-similar-slider]");
  if (similarSlider) {
    initSlider(similarSlider, {
      viewport: "[data-phr-similar-viewport]",
      track: "[data-phr-similar-track]",
      card: ".phr-product__card--slider",
      prev: "[data-phr-similar-prev]",
      next: "[data-phr-similar-next]"
    });
  }

  function initCardsRowSlider(slider) {
    var viewport = slider.querySelector("[data-phr-cards-viewport]");
    var track = slider.querySelector("[data-phr-cards-track]");
    var cards = track ? track.querySelectorAll(".phr-product__card") : [];
    var mobileQuery = window.matchMedia("(max-width: 768px)");

    if (!viewport || !track || !cards.length) return;

    var index = 0;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;

    function isMobile() {
      return mobileQuery.matches;
    }

    function getStep() {
      return viewport.getBoundingClientRect().width;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - 1);
    }

    function update(animated) {
      if (!isMobile()) {
        track.style.transform = "";
        track.style.transition = "";
        index = 0;
        return;
      }

      index = Math.max(0, Math.min(index, getMaxIndex()));
      track.style.transition = animated ? "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none";
      track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    }

    function onTouchStart(event) {
      if (!isMobile()) return;
      startX = event.touches[0].clientX;
      deltaX = 0;
      dragging = true;
      track.style.transition = "none";
    }

    function onTouchMove(event) {
      if (!dragging || !isMobile()) return;
      deltaX = event.touches[0].clientX - startX;
      track.style.transform = "translate3d(-" + (index * getStep() - deltaX) + "px, 0, 0)";
    }

    function onTouchEnd() {
      if (!dragging || !isMobile()) return;
      dragging = false;

      var threshold = getStep() * 0.16;
      if (deltaX < -threshold && index < getMaxIndex()) {
        index += 1;
      } else if (deltaX > threshold && index > 0) {
        index -= 1;
      }

      update(true);
    }

    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: true });
    viewport.addEventListener("touchend", onTouchEnd);

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", function () {
        index = 0;
        update(false);
      });
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(function () {
        index = 0;
        update(false);
      });
    }

    window.addEventListener("resize", function () {
      update(false);
    });

    update(false);
  }

  document.querySelectorAll("[data-phr-cards-slider]").forEach(initCardsRowSlider);

  var couponsTrack = document.querySelector("[data-phr-coupons-track]");
  var couponsNext = document.querySelector("[data-phr-coupons-next]");

  if (couponsTrack && couponsNext) {
    couponsNext.addEventListener("click", function () {
      couponsTrack.scrollBy({ left: 280, behavior: "smooth" });
    });
  }

  var readToggle = document.querySelector("[data-phr-read-toggle]");
  var readText = document.querySelector("[data-phr-read-text]");

  if (readToggle && readText) {
    readToggle.addEventListener("click", function () {
      var collapsed = readText.classList.toggle("is-collapsed");
      readToggle.textContent = collapsed ? "...Read More" : "Read Less";
    });
  }

  var reviewsSection = document.querySelector("[data-phr-reviews]");
  if (!reviewsSection) return;

  var reviews = [];
  var openBtn = reviewsSection.querySelector("[data-phr-review-open]");
  var form = reviewsSection.querySelector("[data-phr-review-form]");
  var cancelBtn = reviewsSection.querySelector("[data-phr-review-cancel]");
  var listEl = reviewsSection.querySelector("[data-phr-reviews-list]");
  var avgEl = reviewsSection.querySelector("[data-phr-reviews-avg]");
  var countEl = reviewsSection.querySelector("[data-phr-reviews-count]");
  var summaryStars = reviewsSection.querySelector("[data-phr-reviews-summary-stars]");
  var ratingInput = reviewsSection.querySelector("[data-phr-review-rating]");
  var ratingError = reviewsSection.querySelector("[data-phr-review-error]");
  var pickStars = reviewsSection.querySelectorAll("[data-phr-pick-stars] .phr-reviews__pick-star");
  var formStars = reviewsSection.querySelectorAll("[data-phr-form-stars] .phr-reviews__form-star");

  function renderStarIcons(container, rating, sizeClass) {
    if (!container) return;

    var html = "";
    var i;
    for (i = 1; i <= 5; i += 1) {
      var filled = i <= Math.round(rating);
      html += '<i class="' + (filled ? "fa-solid" : "fa-regular") + ' fa-star' +
        (filled ? " is-filled" : "") + '" aria-hidden="true"></i>';
    }
    container.innerHTML = html;
  }

  function setInteractiveStars(stars, value) {
    stars.forEach(function (star) {
      var starValue = Number(star.getAttribute("data-value"));
      var active = starValue <= value;
      star.classList.toggle("is-active", active);
      var icon = star.querySelector("i");
      if (icon) {
        icon.className = active ? "fa-solid fa-star" : "fa-regular fa-star";
      }
    });
  }

  function updateStats() {
    var total = reviews.length;
    var sum = 0;
    var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    var avg = 0;
    var star;

    reviews.forEach(function (review) {
      sum += review.rating;
      counts[review.rating] += 1;
    });

    if (total > 0) {
      avg = sum / total;
    }

    if (avgEl) {
      avgEl.textContent = total > 0 ? avg.toFixed(1).replace(/\.0$/, "") : "0";
    }

    if (countEl) {
      if (total === 0) {
        countEl.textContent = "0 rating";
      } else if (total === 1) {
        countEl.textContent = "1 rating";
      } else {
        countEl.textContent = total + " ratings";
      }
    }

    renderStarIcons(summaryStars, avg);

    for (star = 5; star >= 1; star -= 1) {
      var pct = total > 0 ? Math.round((counts[star] / total) * 100) : 0;
      var fill = reviewsSection.querySelector('[data-phr-bar-fill="' + star + '"]');
      var pctEl = reviewsSection.querySelector('[data-phr-bar-pct="' + star + '"]');

      if (fill) fill.style.width = pct + "%";
      if (pctEl) pctEl.textContent = pct + "%";
    }
  }

  function renderReviews() {
    if (!listEl) return;

    if (!reviews.length) {
      listEl.hidden = true;
      listEl.innerHTML = "";
      return;
    }

    listEl.hidden = false;
    listEl.innerHTML = reviews.map(function (review) {
      var starsHtml = "";
      var i;
      for (i = 1; i <= 5; i += 1) {
        starsHtml += '<i class="' + (i <= review.rating ? "fa-solid" : "fa-regular") +
          ' fa-star" aria-hidden="true"></i>';
      }

      return (
        '<article class="phr-reviews__item">' +
          '<div class="phr-reviews__item-head">' +
            '<span class="phr-reviews__item-name">' + escapeHtml(review.name) + "</span>" +
            '<span class="phr-reviews__item-stars" aria-label="' + review.rating + ' out of 5 stars">' +
              starsHtml +
            "</span>" +
            '<time class="phr-reviews__item-date" datetime="' + review.dateIso + '">' +
              escapeHtml(review.dateLabel) +
            "</time>" +
          "</div>" +
          '<h4 class="phr-reviews__item-title">' + escapeHtml(review.title) + "</h4>" +
          '<p class="phr-reviews__item-text">' + escapeHtml(review.text) + "</p>" +
        "</article>"
      );
    }).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openForm() {
    if (!form) return;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closeForm(reset) {
    if (!form) return;
    form.hidden = true;

    if (reset) {
      form.reset();
      if (ratingInput) ratingInput.value = "0";
      setInteractiveStars(formStars, 0);
      setInteractiveStars(pickStars, 0);
      if (ratingError) ratingError.hidden = true;
    }
  }

  pickStars.forEach(function (star) {
    star.addEventListener("click", function () {
      var value = Number(star.getAttribute("data-value"));
      setInteractiveStars(pickStars, value);
      if (ratingInput) ratingInput.value = String(value);
      setInteractiveStars(formStars, value);
      openForm();
    });
  });

  formStars.forEach(function (star) {
    star.addEventListener("click", function () {
      var value = Number(star.getAttribute("data-value"));
      if (ratingInput) ratingInput.value = String(value);
      setInteractiveStars(formStars, value);
      setInteractiveStars(pickStars, value);
    });
  });

  if (openBtn) {
    openBtn.addEventListener("click", openForm);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      closeForm(true);
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameInput = form.querySelector('[name="name"]');
      var titleInput = form.querySelector('[name="title"]');
      var textInput = form.querySelector('[name="review"]');
      var rating = Number(ratingInput ? ratingInput.value : 0);

      if (!nameInput || !titleInput || !textInput || rating < 1) {
        if (ratingError) ratingError.hidden = rating >= 1;
        return;
      }

      if (ratingError) ratingError.hidden = true;

      var now = new Date();
      var dateLabel = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      reviews.unshift({
        name: nameInput.value.trim(),
        title: titleInput.value.trim(),
        text: textInput.value.trim(),
        rating: rating,
        dateIso: now.toISOString(),
        dateLabel: dateLabel
      });

      updateStats();
      renderReviews();
      closeForm(true);
    });
  }

  updateStats();
})();
