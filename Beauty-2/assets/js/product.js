(function () {
  "use strict";

  var root = document.querySelector("[data-boj-product]");
  var helpers = window.BOJHelpers;

  if (root && window.BOJ_PRODUCTS && helpers) {
    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id") || "no-wash-treatment";
    var product = helpers.getProduct(productId);

    if (!product) {
      root.innerHTML =
        '<div class="boj-pdp__inner" style="padding:80px 40px;text-align:center;">' +
        "<h1>Product not found</h1>" +
        "<p>The product you are looking for does not exist.</p>" +
        '<a href="shop.html">Back to Shop</a>' +
        "</div>";
      document.title = "Product Not Found — Nuage";
    } else {
      var displayTitle = product.title || product.name;
      var imgSrc = "assets/img/" + product.img;

      document.title = product.name + " — Nuage";

      var mainImg = root.querySelector("[data-boj-pdp-main-img]");
      if (mainImg) {
        mainImg.src = imgSrc;
        mainImg.alt = product.name;
      }

      var eyebrowEl = root.querySelector("[data-boj-pdp-title-eyebrow]");
      if (eyebrowEl) eyebrowEl.textContent = product.name;

      var firstThumbImg = root.querySelector("[data-boj-pdp-thumb='0'] img");
      if (firstThumbImg) {
        firstThumbImg.src = imgSrc;
        firstThumbImg.alt = "";
      }

      var breadcrumb = root.querySelector("[data-boj-pdp-breadcrumb]");
      if (breadcrumb) breadcrumb.textContent = product.name;

      var categoryLink = root.querySelector("[data-boj-pdp-category-link]");
      if (categoryLink && product.category) categoryLink.textContent = product.category;

      var tagsEl = root.querySelector("[data-boj-pdp-tags]");
      if (tagsEl) {
        tagsEl.innerHTML =
          '<span class="boj-kedit__tag boj-kedit__tag--blue">' +
          product.tagBlue +
          '</span><span class="boj-kedit__tag boj-kedit__tag--purple">' +
          product.tagPurple +
          "</span>";
      }

      var titleEl = root.querySelector("[data-boj-pdp-title]");
      if (titleEl) titleEl.textContent = displayTitle;

      var descEl = root.querySelector("[data-boj-pdp-desc]");
      if (descEl) descEl.textContent = product.desc;

      var starsEl = root.querySelector("[data-boj-pdp-stars]");
      if (starsEl) starsEl.innerHTML = helpers.starsHtml(product.rating);

      var ratingEl = root.querySelector("[data-boj-pdp-rating]");
      if (ratingEl) {
        ratingEl.setAttribute(
          "aria-label",
          "Rating " + product.rating + " out of 5 from " + product.reviews + " reviews"
        );
      }

      var reviewsLink = root.querySelector("[data-boj-pdp-reviews-link]");
      if (reviewsLink) reviewsLink.textContent = product.reviews + " Reviews";

      var priceEl = root.querySelector("[data-boj-pdp-price]");
      if (priceEl) priceEl.textContent = helpers.formatPrice(product.price);

      var sizesEl = root.querySelector("[data-boj-pdp-sizes]");
      if (sizesEl) sizesEl.hidden = !product.hasSizes;

      var suitableEl = root.querySelector("[data-boj-pdp-suitable]");
      if (suitableEl) {
        if (product.suitable) {
          suitableEl.hidden = false;
          suitableEl.innerHTML = "<strong>Suitable for:</strong> " + product.suitable;
        } else {
          suitableEl.hidden = true;
        }
      }

      root.querySelectorAll("[data-boj-pdp-review-name]").forEach(function (el) {
        el.textContent = displayTitle;
      });

      root.querySelectorAll("[data-boj-pdp-review-price]").forEach(function (el) {
        el.textContent = helpers.formatPrice(product.price);
      });

      root.querySelectorAll("[data-boj-pdp-review-img]").forEach(function (el) {
        el.src = imgSrc;
        el.alt = product.name;
      });
    }
  }

  document.querySelectorAll("[data-boj-pdp-size]").forEach(function (input) {
    input.addEventListener("change", function () {
      document.querySelectorAll(".boj-pdp__size").forEach(function (label) {
        var checked = label.querySelector("[data-boj-pdp-size]").checked;
        label.classList.toggle("is-active", checked);
      });
    });
  });

  var qtyInput = document.querySelector("[data-boj-pdp-qty]");
  var qtyMinus = document.querySelector("[data-boj-pdp-qty-minus]");
  var qtyPlus = document.querySelector("[data-boj-pdp-qty-plus]");

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener("click", function () {
      var value = Math.max(1, parseInt(qtyInput.value, 10) - 1 || 1);
      qtyInput.value = String(value);
    });

    qtyPlus.addEventListener("click", function () {
      var value = Math.min(10, parseInt(qtyInput.value, 10) + 1 || 1);
      qtyInput.value = String(value);
    });
  }

  document.querySelectorAll("[data-boj-accordion-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var accordion = toggle.closest("[data-boj-accordion]");
      if (!accordion) return;

      var isOpen = accordion.classList.contains("is-open");
      accordion.classList.toggle("is-open", !isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  document.querySelectorAll("[data-boj-faq-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var item = toggle.closest("[data-boj-faq]");
      if (!item) return;

      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");

      var icon = toggle.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "fa-solid fa-plus" : "fa-solid fa-minus";
      }
    });
  });

  var pairedViewport = document.querySelector("[data-boj-paired-viewport]");
  var pairedTrack = document.querySelector("[data-boj-paired-track]");
  var pairedPrev = document.querySelector("[data-boj-paired-prev]");
  var pairedNext = document.querySelector("[data-boj-paired-next]");

  if (pairedViewport && pairedTrack) {
    var pairedCards = pairedTrack.querySelectorAll(".boj-pdp__paired-card");
    var pairedIndex = 0;

    function updatePaired() {
      if (!pairedCards.length) return;

      var offset = pairedIndex * pairedViewport.clientWidth;
      pairedTrack.style.transform = "translate3d(-" + offset + "px, 0, 0)";

      if (pairedPrev) pairedPrev.disabled = pairedIndex <= 0;
      if (pairedNext) pairedNext.disabled = pairedIndex >= pairedCards.length - 1;
    }

    if (pairedPrev) {
      pairedPrev.addEventListener("click", function () {
        if (pairedIndex > 0) {
          pairedIndex -= 1;
          updatePaired();
        }
      });
    }

    if (pairedNext) {
      pairedNext.addEventListener("click", function () {
        if (pairedIndex < pairedCards.length - 1) {
          pairedIndex += 1;
          updatePaired();
        }
      });
    }

    window.addEventListener("resize", updatePaired);
    updatePaired();
  }

  var ymalSection = document.querySelector("[data-boj-pdp-ymal]");
  if (ymalSection) {
    var ymalViewport = ymalSection.querySelector("[data-boj-pdp-ymal-viewport]");
    var ymalTrack = ymalSection.querySelector("[data-boj-pdp-ymal-track]");
    var ymalCards = ymalTrack ? ymalTrack.querySelectorAll(".boj-pdp-ymal__card") : [];
    var ymalPrev = ymalSection.querySelector("[data-boj-pdp-ymal-prev]");
    var ymalNext = ymalSection.querySelector("[data-boj-pdp-ymal-next]");
    var ymalProgress = ymalSection.querySelector("[data-boj-pdp-ymal-progress]");
    var ymalIndex = 0;

    function getYmalGap() {
      if (!ymalTrack) return 14;
      var styles = window.getComputedStyle(ymalTrack);
      return parseFloat(styles.gap || styles.columnGap || "14") || 14;
    }

    function getYmalStep() {
      if (!ymalCards[0]) return 0;
      return ymalCards[0].offsetWidth + getYmalGap();
    }

    function getYmalMaxOffset() {
      if (!ymalViewport || !ymalTrack) return 0;
      return Math.max(0, ymalTrack.scrollWidth - ymalViewport.clientWidth);
    }

    function getYmalOffset() {
      var step = getYmalStep();
      if (!step) return 0;
      return Math.min(ymalIndex * step, getYmalMaxOffset());
    }

    function updateYmal() {
      if (!ymalTrack || !ymalCards.length) return;

      var step = getYmalStep();
      var maxOffset = getYmalMaxOffset();
      var offset = getYmalOffset();

      if (step && offset < maxOffset && ymalIndex * step > maxOffset) {
        ymalIndex = Math.ceil(maxOffset / step);
        offset = getYmalOffset();
      }

      ymalTrack.style.transform = "translate3d(-" + offset + "px, 0, 0)";

      if (ymalPrev) ymalPrev.disabled = offset <= 0;
      if (ymalNext) ymalNext.disabled = offset >= maxOffset - 1;

      if (ymalProgress) {
        ymalProgress.style.width = maxOffset <= 0 ? "100%" : (offset / maxOffset) * 100 + "%";
      }
    }

    if (ymalPrev) {
      ymalPrev.addEventListener("click", function () {
        if (getYmalOffset() > 0) {
          ymalIndex -= 1;
          updateYmal();
        }
      });
    }

    if (ymalNext) {
      ymalNext.addEventListener("click", function () {
        if (getYmalOffset() < getYmalMaxOffset() - 1) {
          ymalIndex += 1;
          updateYmal();
        }
      });
    }

    window.addEventListener("resize", updateYmal);
    window.addEventListener("load", updateYmal);

    ymalCards.forEach(function (card) {
      var img = card.querySelector("img");
      if (img) img.addEventListener("load", updateYmal);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(updateYmal);
    });

    updateYmal();
  }

  var carouselViewport = document.querySelector("[data-boj-pdp-carousel-viewport]");
  var carouselTrack = document.querySelector("[data-boj-pdp-carousel-track]");
  var carouselSlides = carouselTrack ? carouselTrack.querySelectorAll("[data-boj-pdp-slide]") : [];
  var carouselThumbs = document.querySelectorAll("[data-boj-pdp-thumb]");
  var carouselIndex = 0;
  var carouselDragging = false;
  var carouselPointerId = null;
  var carouselStartX = 0;
  var carouselStartY = 0;
  var carouselDeltaX = 0;
  var carouselBaseOffset = 0;
  var carouselAxis = null;

  function getCarouselGap() {
    if (!carouselTrack) return 0;
    var styles = window.getComputedStyle(carouselTrack);
    return parseFloat(styles.gap || styles.columnGap || "0") || 0;
  }

  function getCarouselStep() {
    if (!carouselSlides[0]) return 0;
    return carouselSlides[0].offsetWidth + getCarouselGap();
  }

  function getCarouselOffset(index) {
    return index * getCarouselStep();
  }

  function applyCarouselTransform(offsetPx, animate) {
    if (!carouselTrack) return;
    carouselTrack.style.transition = animate === false ? "none" : "";
    carouselTrack.style.transform = "translate3d(-" + offsetPx + "px, 0, 0)";
  }

  function setCarouselSlide(index, animate) {
    if (!carouselSlides.length) return;

    carouselIndex = Math.max(0, Math.min(index, carouselSlides.length - 1));

    carouselSlides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === carouselIndex);
    });

    carouselThumbs.forEach(function (thumb, i) {
      var active = i === carouselIndex;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-selected", active ? "true" : "false");
    });

    applyCarouselTransform(getCarouselOffset(carouselIndex), animate !== false);
  }

  function cancelCarouselDrag() {
    if (!carouselDragging) return;

    carouselDragging = false;
    carouselPointerId = null;
    carouselAxis = null;
    carouselDeltaX = 0;
    carouselViewport.classList.remove("is-dragging");
    setCarouselSlide(carouselIndex, true);
  }

  function finishCarouselDrag() {
    if (!carouselDragging) return;

    carouselDragging = false;
    carouselPointerId = null;
    carouselAxis = null;
    carouselViewport.classList.remove("is-dragging");

    var threshold = Math.min(56, getCarouselStep() * 0.18);
    var nextIndex = carouselIndex;

    if (carouselDeltaX < -threshold && carouselIndex < carouselSlides.length - 1) {
      nextIndex = carouselIndex + 1;
    } else if (carouselDeltaX > threshold && carouselIndex > 0) {
      nextIndex = carouselIndex - 1;
    }

    carouselDeltaX = 0;
    setCarouselSlide(nextIndex, true);
  }

  function onCarouselDragStart(clientX, clientY, pointerId) {
    carouselDragging = true;
    carouselPointerId = pointerId;
    carouselStartX = clientX;
    carouselStartY = clientY;
    carouselDeltaX = 0;
    carouselAxis = null;
    carouselBaseOffset = getCarouselOffset(carouselIndex);
    carouselViewport.classList.add("is-dragging");
    applyCarouselTransform(carouselBaseOffset, false);
  }

  function onCarouselDragMove(clientX, clientY) {
    if (!carouselDragging) return;

    var deltaX = clientX - carouselStartX;
    var deltaY = clientY - carouselStartY;

    if (!carouselAxis) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      carouselAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      if (carouselAxis === "y") {
        cancelCarouselDrag();
        return;
      }
    }

    carouselDeltaX = deltaX;
    var maxOffset = getCarouselOffset(carouselSlides.length - 1);
    var nextOffset = carouselBaseOffset - carouselDeltaX;

    if (nextOffset < 0) {
      nextOffset = nextOffset * 0.35;
    } else if (nextOffset > maxOffset) {
      nextOffset = maxOffset + (nextOffset - maxOffset) * 0.35;
    }

    applyCarouselTransform(nextOffset, false);
  }

  carouselThumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var index = parseInt(thumb.getAttribute("data-boj-pdp-thumb"), 10) || 0;
      setCarouselSlide(index, true);
    });
  });

  if (carouselViewport && carouselTrack && carouselSlides.length) {
    carouselViewport.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches.length || carouselDragging) return;
        onCarouselDragStart(e.touches[0].clientX, e.touches[0].clientY, e.touches[0].identifier);
      },
      { passive: true }
    );

    carouselViewport.addEventListener(
      "touchmove",
      function (e) {
        if (!carouselDragging || !e.touches.length) return;

        var touch = Array.prototype.find.call(e.touches, function (item) {
          return item.identifier === carouselPointerId;
        });

        if (!touch) return;
        onCarouselDragMove(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    carouselViewport.addEventListener("touchend", finishCarouselDrag);
    carouselViewport.addEventListener("touchcancel", cancelCarouselDrag);

    carouselViewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || carouselDragging) return;
      carouselViewport.setPointerCapture(e.pointerId);
      onCarouselDragStart(e.clientX, e.clientY, e.pointerId);
    });

    carouselViewport.addEventListener("pointermove", function (e) {
      if (!carouselDragging || e.pointerId !== carouselPointerId || e.pointerType === "touch") return;
      onCarouselDragMove(e.clientX, e.clientY);
    });

    carouselViewport.addEventListener("pointerup", function (e) {
      if (e.pointerId !== carouselPointerId || e.pointerType === "touch") return;
      finishCarouselDrag();
    });

    carouselViewport.addEventListener("pointercancel", function (e) {
      if (e.pointerId !== carouselPointerId || e.pointerType === "touch") return;
      finishCarouselDrag();
    });
  }

  window.addEventListener("resize", function () {
    setCarouselSlide(carouselIndex, false);
  });

  setCarouselSlide(0, false);
})();
