(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id");
  var product = window.RAAH_getProduct ? window.RAAH_getProduct(productId) : null;
  var formatPrice = window.RAAH_formatPrice;
  var products = window.RAAH_PRODUCTS || [];

  if (!product) {
    window.location.href = "shop.html";
    return;
  }

  var mainImg = document.querySelector("[data-pdp-main]");
  var thumbsTrack = document.querySelector("[data-pdp-thumbs]");
  var titleEl = document.querySelector("[data-pdp-title]");
  var skuEl = document.querySelector("[data-pdp-sku]");
  var priceEl = document.querySelector("[data-pdp-price]");
  var mrpEl = document.querySelector("[data-pdp-mrp]");
  var discEl = document.querySelector("[data-pdp-discount]");
  var descEls = document.querySelectorAll("[data-pdp-desc]");
  var sizesEl = document.querySelector("[data-pdp-sizes]");
  var colorsEl = document.querySelector("[data-pdp-colors]");
  var colorNameEl = document.querySelector("[data-pdp-color-name]");
  var catLink = document.querySelector("[data-pdp-cat-link]");
  var wishBtn = document.querySelector("[data-pdp-wish]");
  var shareBtn = document.querySelector("[data-pdp-share]");
  var addBtn = document.querySelector("[data-pdp-add]");
  var buyBtn = document.querySelector("[data-pdp-buy]");
  var prevBtn = document.querySelector("[data-pdp-prev]");
  var nextBtn = document.querySelector("[data-pdp-next]");
  var thumbUp = document.querySelector("[data-pdp-thumb-up]");
  var thumbDown = document.querySelector("[data-pdp-thumb-down]");
  var pincodeForm = document.querySelector("[data-pdp-pincode]");
  var pincodeMsg = document.querySelector("[data-pdp-pincode-msg]");
  var notifyBtn = document.querySelector("[data-pdp-notify]");

  var activeIndex = 0;
  var thumbOffset = 0;
  var selectedSize = product.sizes[0];
  var visibleThumbs = 4;

  document.title = product.name + " — Raah";

  function skuFromId(id) {
    var num = String(id).replace(/\D/g, "") || "01";
    return "RA-" + String(num).padStart(2, "0") + "-" + (product.color || "GEN").slice(0, 3).toUpperCase();
  }

  function setImage(index) {
    var images = product.images || [product.image];
    activeIndex = (index + images.length) % images.length;
    if (mainImg) {
      mainImg.src = images[activeIndex];
      mainImg.alt = product.name;
    }
    if (thumbsTrack) {
      thumbsTrack.querySelectorAll(".pdp-thumb").forEach(function (btn, i) {
        btn.classList.toggle("is-active", i === activeIndex);
      });
    }
  }

  function renderThumbs() {
    if (!thumbsTrack) return;
    var images = product.images || [product.image];
    thumbsTrack.innerHTML = images
      .map(function (src, i) {
        return (
          '<button type="button" class="pdp-thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-index="' + i + '" aria-label="View image ' + (i + 1) + '">' +
          '<img src="' + src + '" alt="" width="88" height="88" loading="lazy" decoding="async">' +
          "</button>"
        );
      })
      .join("");
    updateThumbNav();
  }

  function updateThumbNav() {
    var images = product.images || [product.image];
    var maxOffset = Math.max(0, images.length - visibleThumbs);
    if (thumbOffset > maxOffset) thumbOffset = maxOffset;
    if (thumbOffset < 0) thumbOffset = 0;
    if (thumbsTrack) {
      var step = 88 + 8;
      thumbsTrack.style.transform = "translateY(" + -(thumbOffset * step) + "px)";
    }
    if (thumbUp) thumbUp.disabled = thumbOffset <= 0;
    if (thumbDown) thumbDown.disabled = thumbOffset >= maxOffset;
  }

  function renderSizes() {
    if (!sizesEl) return;
    var disabledOne = product.sizes.length > 2 ? product.sizes[1] : null;
    sizesEl.innerHTML = product.sizes
      .map(function (s) {
        var disabled = s === disabledOne;
        return (
          '<button type="button" class="pdp-size' +
          (s === selectedSize ? " is-active" : "") +
          (disabled ? " is-disabled" : "") +
          '" data-size="' + s + '"' +
          (disabled ? " disabled" : "") +
          ">" + s + "</button>"
        );
      })
      .join("");
  }

  function colorVariants() {
    var current = product;
    var others = products.filter(function (p) {
      return p.id !== current.id && p.gender === current.gender;
    });
    var list = [current].concat(others.slice(0, 3));
    var seen = {};
    return list.filter(function (p) {
      if (seen[p.color]) return false;
      seen[p.color] = true;
      return true;
    });
  }

  function renderColors() {
    if (!colorsEl) return;
    var variants = colorVariants();
    colorsEl.innerHTML = variants
      .map(function (p) {
        return (
          '<button type="button" class="pdp-color' +
          (p.id === product.id ? " is-active" : "") +
          '" data-color-id="' + p.id + '" aria-label="' + p.color + '">' +
          '<img src="' + p.image + '" alt="' + p.color + '" width="52" height="52" loading="lazy">' +
          "</button>"
        );
      })
      .join("");
    if (colorNameEl) {
      colorNameEl.textContent = product.name + " / " + product.color;
    }
  }

  function fillInfo() {
    if (titleEl) titleEl.textContent = product.name;
    if (skuEl) skuEl.textContent = skuFromId(product.id);
    if (priceEl) priceEl.textContent = formatPrice(product.price);
    if (mrpEl) mrpEl.textContent = formatPrice(product.mrp);
    if (discEl) discEl.textContent = "(" + product.discount + "% OFF)";
    descEls.forEach(function (el) {
      el.textContent = product.desc;
    });
    if (catLink) {
      var label = (product.gender || "Men") + " Shoes";
      catLink.textContent = label;
      catLink.href = "shop.html?cat=" + encodeURIComponent(product.gender || "Men");
    }
  }

  function starHtml(rating) {
    var html = "";
    var full = Math.floor(rating);
    var half = rating - full >= 0.4;
    var i;
    for (i = 0; i < full; i++) html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>';
    for (i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star" aria-hidden="true"></i>';
    return html;
  }

  function ratingBreakdown(rating, total) {
    var weights;
    if (rating >= 4.7) weights = [72, 18, 6, 3, 1];
    else if (rating >= 4.4) weights = [62, 22, 10, 4, 2];
    else if (rating >= 4.0) weights = [48, 28, 14, 6, 4];
    else weights = [35, 30, 18, 10, 7];
    if (!total || total < 1) return weights.map(function () { return 0; });
    return weights;
  }

  function renderReviews() {
    var avgEl = document.querySelector("[data-pdp-review-avg]");
    var starsEl = document.querySelector("[data-pdp-review-stars]");
    var countEl = document.querySelector("[data-pdp-review-count]");
    var barsEl = document.querySelector("[data-pdp-review-bars]");
    var rating = Number(product.rating) || 0;
    var total = Number(product.reviews) || 0;
    var label = total === 1 ? "1 review" : total + " reviews";

    if (avgEl) avgEl.textContent = rating.toFixed(1);
    if (starsEl) {
      starsEl.innerHTML = starHtml(rating);
      starsEl.setAttribute("aria-label", "Rated " + rating.toFixed(1) + " out of 5");
    }
    if (countEl) countEl.textContent = "Based on " + label;

    if (barsEl) {
      var weights = ratingBreakdown(rating, total);
      barsEl.innerHTML = [5, 4, 3, 2, 1]
        .map(function (star, i) {
          var pct = weights[i];
          return (
            '<div class="pdp-reviews__bar-row">' +
            "<span>" + star + "</span>" +
            '<div class="pdp-reviews__bar"><span style="width:' + pct + '%"></span></div>' +
            "<span>" + pct + "%</span>" +
            "</div>"
          );
        })
        .join("");
    }
  }

  function relatedCardHtml(p) {
    var badge =
      p.badge === "new"
        ? '<span class="product-card__badge product-card__badge--arrival">NEW ARRIVAL</span>'
        : '<span class="product-card__badge"><i class="fa-solid fa-star" aria-hidden="true"></i> BEST SELLER</span>';
    var href = "product.html?id=" + encodeURIComponent(p.id);
    return (
      '<article class="product-card" data-product-id="' + p.id + '">' +
      '<div class="product-card__media">' +
      '<a href="' + href + '" class="product-card__link" aria-label="' + p.name + '">' +
      '<img src="' + p.image + '" alt="' + p.name + '" width="540" height="720" loading="lazy" decoding="async">' +
      "</a>" +
      '<span class="product-card__discount">' + p.discount + "% off</span>" +
      '<button type="button" class="product-card__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      badge +
      "</div>" +
      '<div class="product-card__body">' +
      '<h3 class="product-card__name"><a href="' + href + '">' + p.name + "</a></h3>" +
      '<div class="product-card__rating">' +
      '<span class="product-card__stars" aria-hidden="true">' + starHtml(p.rating) + "</span>" +
      '<span class="product-card__reviews">' + p.rating.toFixed(1) + " | " + p.reviews +
      (p.reviews === 1 ? " Review" : " Reviews") + "</span>" +
      "</div>" +
      '<div class="product-card__price">' +
      '<span class="product-card__price-now">' + formatPrice(p.price) + "</span>" +
      '<span class="product-card__price-was">' + formatPrice(p.mrp) + "</span>" +
      '<span class="product-card__sale">Sale</span>' +
      "</div>" +
      '<p class="product-card__sizes">' + (p.sizes || []).join(" ") + "</p>" +
      "</div></article>"
    );
  }

  function renderRelated() {
    var wrap = document.querySelector("[data-pdp-related]");
    if (!wrap) return;

    var sameGender = products.filter(function (p) {
      return p.id !== product.id && p.gender === product.gender;
    });
    var sameType = sameGender.filter(function (p) {
      return p.type === product.type;
    });
    var pool = sameType.concat(
      sameGender.filter(function (p) {
        return p.type !== product.type;
      })
    );
    if (pool.length < 4) {
      products.forEach(function (p) {
        if (p.id === product.id) return;
        if (pool.some(function (x) { return x.id === p.id; })) return;
        pool.push(p);
      });
    }

    wrap.innerHTML = pool.slice(0, 4).map(relatedCardHtml).join("");

    wrap.querySelectorAll(".product-card__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var icon = btn.querySelector("i");
        var active = btn.classList.toggle("is-active");
        if (!icon) return;
        icon.classList.toggle("fa-regular", !active);
        icon.classList.toggle("fa-solid", active);
        icon.classList.add("fa-heart");
      });
    });

    initRelatedSwipe(wrap);
  }

  function initRelatedSwipe(track) {
    var dotsWrap = document.querySelector("[data-pdp-related-dots]");
    if (!dotsWrap) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll(".product-card"));
    if (!cards.length) {
      dotsWrap.innerHTML = "";
      return;
    }

    dotsWrap.innerHTML = cards
      .map(function (_, i) {
        return (
          '<button type="button" class="pdp-related__dot' +
          (i === 0 ? " is-active" : "") +
          '" data-index="' + i + '" aria-label="Go to related product ' + (i + 1) + '"></button>'
        );
      })
      .join("");

    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".pdp-related__dot"));

    function activeIndex() {
      var width = track.clientWidth || 1;
      return Math.round(track.scrollLeft / width);
    }

    function setActive(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    var scrollTimer;
    track.addEventListener(
      "scroll",
      function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          setActive(activeIndex());
        }, 60);
      },
      { passive: true }
    );

    dotsWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".pdp-related__dot");
      if (!btn) return;
      var index = Number(btn.getAttribute("data-index"));
      if (Number.isNaN(index)) return;
      track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
      setActive(index);
    });
  }

  fillInfo();
  renderThumbs();
  setImage(0);
  renderSizes();
  renderColors();
  renderReviews();
  renderRelated();

  if (thumbsTrack) {
    thumbsTrack.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-index]");
      if (!btn) return;
      setImage(Number(btn.getAttribute("data-index")));
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { setImage(activeIndex - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { setImage(activeIndex + 1); });

  if (thumbUp) {
    thumbUp.addEventListener("click", function () {
      thumbOffset -= 1;
      updateThumbNav();
    });
  }
  if (thumbDown) {
    thumbDown.addEventListener("click", function () {
      thumbOffset += 1;
      updateThumbNav();
    });
  }

  if (sizesEl) {
    sizesEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-size]");
      if (!btn || btn.disabled) return;
      selectedSize = Number(btn.getAttribute("data-size"));
      renderSizes();
    });
  }

  if (colorsEl) {
    colorsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-color-id]");
      if (!btn) return;
      var id = btn.getAttribute("data-color-id");
      if (id && id !== product.id) {
        window.location.href = "product.html?id=" + encodeURIComponent(id);
      }
    });
  }

  if (wishBtn) {
    wishBtn.addEventListener("click", function () {
      var icon = wishBtn.querySelector("i");
      var active = wishBtn.classList.toggle("is-active");
      if (!icon) return;
      icon.classList.toggle("fa-regular", !active);
      icon.classList.toggle("fa-solid", active);
      icon.classList.add("fa-heart");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: product.name, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        shareBtn.setAttribute("aria-label", "Link copied");
        setTimeout(function () {
          shareBtn.setAttribute("aria-label", "Share");
        }, 1200);
      }
    });
  }

  function flash(btn, label) {
    if (!btn) return;
    var original = btn.innerHTML;
    btn.disabled = true;
    if (btn.classList.contains("pdp-cta__checkout")) {
      btn.querySelector("strong").textContent = label;
    } else {
      btn.textContent = label;
    }
    setTimeout(function () {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1200);
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      flash(addBtn, "ADDED · Size " + selectedSize);
    });
  }

  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      flash(buyBtn, "PROCESSING…");
    });
  }

  if (notifyBtn) {
    notifyBtn.addEventListener("click", function () {
      notifyBtn.textContent = "We'll notify you";
      setTimeout(function () {
        notifyBtn.textContent = "Notify Me";
      }, 1500);
    });
  }

  if (pincodeForm) {
    pincodeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = pincodeForm.querySelector("input");
      var pin = (input && input.value || "").trim();
      if (!pincodeMsg) return;
      if (!/^\d{6}$/.test(pin)) {
        pincodeMsg.hidden = false;
        pincodeMsg.style.color = "#c62828";
        pincodeMsg.textContent = "Please enter a valid 6-digit pincode.";
        return;
      }
      pincodeMsg.hidden = false;
      pincodeMsg.style.color = "#2e7d32";
      pincodeMsg.textContent = "Delivery available to " + pin + " within 3–5 business days.";
    });
  }

  document.querySelectorAll(".pdp-acc__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var acc = btn.closest(".pdp-acc");
      if (!acc) return;
      var panel = acc.querySelector(".pdp-acc__panel");
      var open = !acc.classList.contains("is-open");
      document.querySelectorAll(".pdp-acc").forEach(function (item) {
        item.classList.remove("is-open");
        var p = item.querySelector(".pdp-acc__panel");
        var b = item.querySelector(".pdp-acc__btn");
        if (p) p.hidden = true;
        if (b) {
          b.setAttribute("aria-expanded", "false");
          var icon = b.querySelector("i");
          if (icon) {
            icon.classList.remove("fa-minus");
            icon.classList.add("fa-plus");
          }
        }
      });
      if (open) {
        acc.classList.add("is-open");
        if (panel) panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        var icon = btn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-plus");
        }
      }
    });
  });

  var writeBtn = document.querySelector("[data-pdp-write-review]");
  if (writeBtn) {
    writeBtn.addEventListener("click", function () {
      var original = writeBtn.textContent;
      writeBtn.textContent = "Thanks!";
      writeBtn.disabled = true;
      setTimeout(function () {
        writeBtn.textContent = original;
        writeBtn.disabled = false;
      }, 1400);
    });
  }
})();
