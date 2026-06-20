(function () {
  "use strict";

  var galleryBound = false;

  function initProductGallery() {
    var mainImg = document.getElementById("pdpMainImage");
    var thumbList = document.getElementById("pdpThumbs");
    var thumbUp = document.getElementById("pdpThumbUp");
    var thumbDown = document.getElementById("pdpThumbDown");
    if (!mainImg || !thumbList) return;

    if (!galleryBound) {
      galleryBound = true;

      thumbList.addEventListener("click", function (e) {
        var thumb = e.target.closest(".pdp-gallery__thumb");
        if (!thumb) return;

        var full = thumb.getAttribute("data-full");
        var img = thumb.querySelector("img");
        if (!full && !img) return;

        thumbList.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) {
          t.classList.remove("is-active");
        });
        thumb.classList.add("is-active");
        mainImg.src = full || img.src;
        mainImg.alt = img && img.alt ? img.alt : mainImg.alt;
      });
    }

    if (thumbUp && thumbDown) {
      var scrollStep = 80;
      thumbUp.onclick = function () {
        thumbList.scrollTop -= scrollStep;
      };
      thumbDown.onclick = function () {
        thumbList.scrollTop += scrollStep;
      };
    }
  }

  function rebuildGallery(images, productName) {
    var mainImg = document.getElementById("pdpMainImage");
    var thumbList = document.getElementById("pdpThumbs");
    if (!mainImg || !thumbList || !images || !images.length) return;

    thumbList.innerHTML = "";
    images.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pdp-gallery__thumb" + (index === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", "View image " + (index + 1));
      btn.setAttribute("data-full", src);

      var img = document.createElement("img");
      img.src = src;
      img.alt = productName;
      img.width = 72;
      img.height = 72;
      img.decoding = "async";

      btn.appendChild(img);
      thumbList.appendChild(btn);
    });

    mainImg.src = images[0];
    mainImg.alt = productName;
  }

  function updateColorOptions(colors) {
    var colorSection = document.querySelector(".pdp-color");
    if (!colorSection) return;

    if (!colors || !colors.length) {
      colorSection.style.display = "none";
      return;
    }

    colorSection.style.display = "";
    var options = colorSection.querySelector(".pdp-color__options");
    var colorName = document.getElementById("pdpColorName");
    var swatchDot = document.querySelector(".pdp-color__swatch-dot");
    if (!options) return;

    options.innerHTML = "";
    colors.forEach(function (color, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pdp-color__btn" + (index === 0 ? " is-active" : "");
      btn.setAttribute("data-color", color.name);
      btn.setAttribute("data-img", color.img);
      if (color.dot) {
        btn.setAttribute("data-dot", color.dot);
      }
      btn.setAttribute("aria-label", color.name);

      var img = document.createElement("img");
      img.src = color.img;
      img.alt = "";
      img.width = 64;
      img.height = 64;
      img.decoding = "async";

      btn.appendChild(img);
      options.appendChild(btn);
    });

    if (colorName) {
      colorName.textContent = colors[0].name;
    }
    if (swatchDot && colors[0].dot) {
      swatchDot.style.background = colors[0].dot;
    }

  }

  function loadProductFromQuery() {
    if (!window.ProductCatalog) return;

    var catalog = window.ProductCatalog;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || catalog.DEFAULT_PRODUCT_ID;
    var product = catalog.getProductById(id);
    if (!product) return;

    var emi = catalog.formatEmi(product.price);
    var priceText = catalog.formatPrice(product.price);

    document.title = product.name + " | Sports & Gym";

    var breadcrumbCat = document.querySelector(".pdp-breadcrumb a[href='category.html']");
    var breadcrumbCurrent = document.querySelector(".pdp-breadcrumb__current");
    var title = document.querySelector(".pdp-info__title");
    var price = document.querySelector(".pdp-info__price");
    var emiAmt = document.querySelector(".pdp-info__emi-amt");
    var cartBtn = document.querySelector(".pdp-btn--cart");
    var tags = document.querySelectorAll(".pdp-info__tags .pdp-tag");

    if (breadcrumbCat && product.category) {
      breadcrumbCat.textContent = product.category;
    }
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = product.name;
    }
    if (title) {
      title.textContent = product.name;
    }
    if (price) {
      price.textContent = priceText;
    }
    if (emiAmt) {
      emiAmt.textContent = "\u20b9" + emi;
    }
    if (cartBtn) {
      cartBtn.textContent = "ADD TO CART \u2014 " + priceText.toUpperCase();
    }

    if (tags.length >= 1 && product.fit) {
      tags[0].textContent = product.fit;
    }
    if (tags.length >= 2 && product.material) {
      tags[1].innerHTML =
        'Material: <span class="pdp-tag__accent">' + product.material + "</span>";
    }

    rebuildGallery(product.images, product.name);
    updateColorOptions(product.colors);
  }

  function initProductSize() {
    var buttons = document.querySelectorAll(".pdp-size__btn");
    var label = document.getElementById("pdpSizeLabel");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var size = btn.getAttribute("data-size") || btn.textContent.trim();

        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        if (label) {
          label.textContent = "Size: " + size;
        }
      });
    });
  }

  function initProductColor() {
    var colorSection = document.querySelector(".pdp-color");
    if (!colorSection || colorSection.dataset.bound) return;
    colorSection.dataset.bound = "1";

    var dotColors = {
      Navy: "#1e2a4a",
      Olive: "#5c6b3c",
      Grey: "#8a8a8a",
      Black: "#1a1a1a"
    };

    colorSection.addEventListener("click", function (e) {
      var btn = e.target.closest(".pdp-color__btn");
      if (!btn) return;

      var color = btn.getAttribute("data-color");
      var imgSrc = btn.getAttribute("data-img");
      if (!color) return;

      colorSection.querySelectorAll(".pdp-color__btn").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");

      var colorName = document.getElementById("pdpColorName");
      var mainImg = document.getElementById("pdpMainImage");
      var swatchDot = document.querySelector(".pdp-color__swatch-dot");

      if (colorName) {
        colorName.textContent = color;
      }

      if (swatchDot) {
        var dot = btn.getAttribute("data-dot") || dotColors[color];
        if (dot) {
          swatchDot.style.background = dot;
        }
      }

      if (mainImg && imgSrc) {
        mainImg.src = imgSrc;
      }
    });
  }

  function initProductQty() {
    var minus = document.getElementById("pdpQtyMinus");
    var plus = document.getElementById("pdpQtyPlus");
    var val = document.getElementById("pdpQtyVal");
    if (!minus || !plus || !val) return;

    function getQty() {
      return parseInt(val.textContent, 10) || 1;
    }

    minus.addEventListener("click", function () {
      var q = getQty();
      if (q > 1) {
        val.textContent = String(q - 1);
      }
    });

    plus.addEventListener("click", function () {
      val.textContent = String(getQty() + 1);
    });
  }

  function initPdpLookCarousel() {
    var carousel = document.querySelector(".pdp-look__carousel");
    var track = document.querySelector(".pdp-look__grid");
    var cards = document.querySelectorAll(".pdp-look__card");
    if (!carousel || !track || !cards.length) return;

    var currentIndex = 0;
    var mq = window.matchMedia("(max-width: 768px)");

    function isMobileCarousel() {
      return mq.matches;
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth;
    }

    function setTransform(px, animate) {
      if (!animate) track.classList.add("is-dragging");
      else track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + px + "px)";
    }

    function goTo(index, animate) {
      if (!isMobileCarousel()) {
        track.style.transform = "";
        track.classList.remove("is-dragging");
        return;
      }

      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      setTransform(currentIndex * getStep(), animate !== false);
    }

    var pointer = {
      active: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      locked: false
    };

    function onPointerDown(clientX, clientY) {
      if (!isMobileCarousel()) return;
      pointer.active = true;
      pointer.startX = clientX;
      pointer.startY = clientY;
      pointer.deltaX = 0;
      pointer.locked = false;
    }

    function onPointerMove(clientX, clientY, ev) {
      if (!pointer.active || !isMobileCarousel()) return;

      var dx = clientX - pointer.startX;
      var dy = clientY - pointer.startY;

      if (!pointer.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          pointer.active = false;
          return;
        }
        pointer.locked = true;
      }

      if (ev && ev.cancelable) ev.preventDefault();
      pointer.deltaX = dx;

      var base = currentIndex * getStep();
      var next = base - dx;
      var max = (cards.length - 1) * getStep();
      if (next < 0) next *= 0.35;
      else if (next > max) next = max + (next - max) * 0.35;

      setTransform(next, false);
    }

    function onPointerUp() {
      if (!pointer.active) return;
      pointer.active = false;

      if (!pointer.locked || !isMobileCarousel()) {
        goTo(currentIndex, true);
        return;
      }

      var threshold = getStep() * 0.2;
      if (Math.abs(pointer.deltaX) > 10) {
        carousel.setAttribute("data-swiped", "1");
        window.setTimeout(function () {
          carousel.removeAttribute("data-swiped");
        }, 350);
      }

      if (pointer.deltaX < -threshold && currentIndex < cards.length - 1) {
        goTo(currentIndex + 1, true);
      } else if (pointer.deltaX > threshold && currentIndex > 0) {
        goTo(currentIndex - 1, true);
      } else {
        goTo(currentIndex, true);
      }
    }

    carousel.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      function (e) {
        if (!pointer.active || e.touches.length !== 1) return;
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
      },
      { passive: false }
    );

    carousel.addEventListener("touchend", onPointerUp);
    carousel.addEventListener("touchcancel", onPointerUp);

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", function (e) {
      if (!pointer.active) return;
      onPointerMove(e.clientX, e.clientY, e);
    });

    window.addEventListener("mouseup", onPointerUp);

    mq.addEventListener("change", function () {
      currentIndex = 0;
      goTo(0, false);
    });

    window.addEventListener("resize", function () {
      goTo(currentIndex, false);
    });

    goTo(0, false);
  }

  function initProductTabs() {
    var tabBtns = document.querySelectorAll(".pdp-tabs__btn");
    var panels = document.querySelectorAll(".pdp-tabs__panel");
    if (!tabBtns.length || !panels.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        if (!target) return;

        tabBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
          b.setAttribute("tabindex", "-1");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        btn.setAttribute("tabindex", "0");

        panels.forEach(function (panel) {
          var isTarget = panel.getAttribute("data-panel") === target;
          panel.classList.toggle("is-active", isTarget);
          panel.hidden = !isTarget;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadProductFromQuery();
    initProductGallery();
    initProductColor();
    initProductSize();
    initProductQty();
    initPdpLookCarousel();
    initProductTabs();
  });
})();
