(function () {
  var products = window.PI2_PRODUCTS || {};
  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id") || "zz-plant";
  var product = products[productId] || products["zz-plant"];
  if (!product) return;

  document.title = product.shortTitle + " — HariVatika";

  var breadcrumb = document.querySelector("[data-pi2-pdp-breadcrumb]");
  if (breadcrumb) breadcrumb.textContent = product.shortTitle;

  var title = document.querySelector(".pi2-pdp-main__title");
  if (title) title.textContent = product.title;

  var tag = document.querySelector(".pi2-pdp-main__tag");
  if (tag) tag.textContent = product.tag;

  var price = document.querySelector(".pi2-pdp-main__price");
  if (price) price.textContent = "Rs. " + product.price;

  var mrp = document.querySelector(".pi2-pdp-main__mrp");
  if (mrp) {
    if (product.mrp) {
      mrp.textContent = "Rs. " + product.mrp;
      mrp.hidden = false;
    } else {
      mrp.hidden = true;
    }
  }

  var score = document.querySelector(".pi2-pdp-main__score");
  var ratingBlock = document.querySelector(".pi2-pdp-main__rating");
  if (score && product.rating) {
    score.textContent = product.rating;
    if (ratingBlock) {
      ratingBlock.setAttribute("aria-label", "Rated " + product.rating + " out of 5");
    }
  }

  var descPanel = document.querySelector("[data-pi2-pdp-desc-panel] p");
  if (descPanel) {
    descPanel.innerHTML = product.description + ' <a href="#">Read More</a>';
  }

  var mainImg = document.querySelector("[data-pi2-pdp-main-image]");
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.title;
  }

  var thumbsContainer = document.querySelector(".pi2-pdp-main__thumbs");
  if (thumbsContainer && product.images && product.images.length) {
    thumbsContainer.innerHTML = "";
    product.images.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pi2-pdp-main__thumb" + (index === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
      btn.setAttribute("data-pi2-pdp-thumb", src);
      btn.setAttribute("aria-label", "View image " + (index + 1));

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.width = 80;
      img.height = 80;
      img.decoding = "async";
      if (index > 0) img.loading = "lazy";

      btn.appendChild(img);
      thumbsContainer.appendChild(btn);
    });
  }

  var giftSection = document.querySelector(".pi2-pdp-main__gift");
  var packBtn = document.querySelector(".pi2-pdp-main__pack-btn");
  if (productId !== "zz-plant") {
    if (giftSection) giftSection.hidden = true;
    if (packBtn) packBtn.hidden = true;
  }

  window.PI2_CURRENT_PRODUCT_ID = productId;
})();

function pi2InitPdpThumbs() {
  var mainImg = document.querySelector("[data-pi2-pdp-main-image]");
  var thumbs = document.querySelectorAll("[data-pi2-pdp-thumb]");

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var src = thumb.getAttribute("data-pi2-pdp-thumb");
      if (!src || !mainImg) return;

      mainImg.src = src;
      thumbs.forEach(function (t) {
        var active = t === thumb;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
    });
  });
}

pi2InitPdpThumbs();

(function () {
  var qtyRoot = document.querySelector("[data-pi2-pdp-qty]");
  if (!qtyRoot) return;

  var buttons = qtyRoot.querySelectorAll(".pi2-pdp-main__qty-btn");
  var customInput = qtyRoot.querySelector("[data-pi2-pdp-qty-input]");
  var minusBtn = qtyRoot.querySelector("[data-pi2-pdp-qty-minus]");
  var plusBtn = qtyRoot.querySelector("[data-pi2-pdp-qty-plus]");

  function setPreset(btn) {
    buttons.forEach(function (b) {
      b.classList.remove("is-active");
    });
    if (btn) btn.classList.add("is-active");
    if (customInput && btn) customInput.value = btn.textContent.trim();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPreset(btn);
    });
  });

  if (customInput) {
    customInput.addEventListener("focus", function () {
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
      });
    });
  }

  if (minusBtn && customInput) {
    minusBtn.addEventListener("click", function () {
      var val = parseInt(customInput.value, 10) || 1;
      customInput.value = String(Math.max(1, val - 1));
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
      });
    });
  }

  if (plusBtn && customInput) {
    plusBtn.addEventListener("click", function () {
      var val = parseInt(customInput.value, 10) || 1;
      customInput.value = String(Math.min(20, val + 1));
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
      });
    });
  }
})();

(function () {
  var toggle = document.querySelector("[data-pi2-pdp-desc-toggle]");
  var panel = document.querySelector("[data-pi2-pdp-desc-panel]");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
    var icon = toggle.querySelector("i");
    if (icon) {
      icon.className = open ? "fa-solid fa-plus" : "fa-solid fa-minus";
    }
  });
})();

(function () {
  document.querySelectorAll(".pi2-pdp-main__copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.closest(".pi2-pdp-main__offer-code");
      if (!code) return;
      var strong = code.querySelector("strong");
      if (!strong) return;
      var text = strong.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    });
  });
})();
