/**
 * Savante — product.html only
 * Load products-catalog.js before this file. URL ?p=KEY selects product.
 */

(function applySavProductFromQuery() {
  var cat = window.SAV_PRODUCT_CATALOG;
  if (!cat) return;

  function getParam() {
    try {
      var u = new URL(window.location.href);
      var p = u.searchParams.get("p") || u.searchParams.get("id");
      return p ? String(p).replace(/^#/, "").trim().toLowerCase() : "";
    } catch (e) {
      return "";
    }
  }

  function fixSrc(src) {
    if (!src) return src;
    if (String(src).indexOf("./") === 0) return String(src).slice(2);
    return src;
  }

  var key = getParam();
  var data = key ? cat[key] : null;
  if (!data) data = cat["1827"];
  if (!data) return;

  var titleEl = document.querySelector(".sav-pdp__title");
  if (titleEl) titleEl.textContent = data.title;

  var priceEl = document.querySelector(".sav-pdp__price-line .sav-pdp__price");
  if (priceEl) priceEl.textContent = data.price;

  var styleEl = document.querySelector(".sav-pdp__style-tag");
  if (styleEl) {
    var sc = String(data.styleCode != null ? data.styleCode : "").replace(/^#/, "");
    styleEl.textContent = sc ? "Style: #" + sc : "Style: #";
  }

  var crumb = document.getElementById("pdp-breadcrumb-current");
  if (crumb) crumb.textContent = data.breadcrumb || data.title;

  document.title = data.title + " — Savante Women's Innerwear";

  var imgs =
    data.images && data.images.length
      ? data.images
      : [
          "assets/img/category-2.WEBP",
          "assets/img/category-1.WEBP",
          "assets/img/category-3.WEBP",
          "assets/img/category-2.WEBP",
          "assets/img/category-1.WEBP",
        ];
  var main = document.querySelector("[data-pdp-main-img]");
  var gallery = document.querySelector("[data-pdp-gallery]");
  var thumbs = gallery ? gallery.querySelectorAll("[data-pdp-thumb]") : [];

  thumbs.forEach(function (btn, i) {
    var src = fixSrc(imgs[i % imgs.length]);
    btn.setAttribute("data-full-src", src);
    btn.setAttribute("data-full-alt", data.alt || data.title);
    var im = btn.querySelector("img");
    if (im) im.src = src;
    btn.classList.toggle("is-active", i === 0);
  });

  if (main) {
    main.src = fixSrc(imgs[0]);
    main.alt = data.alt || data.title;
  }
})();

(function initSavPdpGallery() {
  var root = document.querySelector("[data-pdp-gallery]");
  if (!root) return;

  var mainImg = root.querySelector("[data-pdp-main-img]");
  var thumbs = root.querySelectorAll("[data-pdp-thumb]");
  if (!mainImg || thumbs.length === 0) return;

  thumbs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-full-src");
      var alt = btn.getAttribute("data-full-alt") || "";
      if (!src) return;
      mainImg.src = src;
      mainImg.alt = alt;
      thumbs.forEach(function (t) {
        t.classList.toggle("is-active", t === btn);
      });
    });
  });
})();

(function initSavPdpThumbScroll() {
  var scrollEl = document.querySelector("[data-pdp-thumbs-scroll]");
  if (!scrollEl) return;

  var step = 88;
  var up = document.querySelector("[data-pdp-thumb-up]");
  var down = document.querySelector("[data-pdp-thumb-down]");

  function scrollBy(delta) {
    scrollEl.scrollBy({ top: delta, behavior: "smooth" });
  }

  if (up) {
    up.addEventListener("click", function () {
      scrollBy(-step);
    });
  }
  if (down) {
    down.addEventListener("click", function () {
      scrollBy(step);
    });
  }
})();

(function initSavPdpColors() {
  var group = document.querySelector("[data-pdp-colors]");
  if (!group) return;

  var swatches = group.querySelectorAll(".sav-pdp__swatch");
  var label = document.getElementById("pdp-color-label");
  if (!swatches.length) return;

  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      swatches.forEach(function (s) {
        s.classList.remove("is-active");
        s.setAttribute("aria-checked", "false");
      });
      sw.classList.add("is-active");
      sw.setAttribute("aria-checked", "true");
      var name = sw.getAttribute("aria-label") || sw.getAttribute("title") || "";
      if (label && name) {
        label.innerHTML = 'Color: <strong>' + name + "</strong>";
      }
    });
  });
})();

(function initSavPdpSizes() {
  var group = document.querySelector("[data-pdp-sizes]");
  if (!group) return;

  var buttons = group.querySelectorAll(".sav-pdp__size");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
    });
  });
})();

(function initSavPdpQty() {
  var wrap = document.querySelector("[data-pdp-qty]");
  if (!wrap) return;

  var input = wrap.querySelector("[data-pdp-qty-input]");
  var minus = wrap.querySelector("[data-pdp-qty-minus]");
  var plus = wrap.querySelector("[data-pdp-qty-plus]");
  if (!input || !minus || !plus) return;

  function clamp(val) {
    var n = parseInt(String(val), 10);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > 99) return 99;
    return n;
  }

  function setVal(n) {
    input.value = String(clamp(n));
  }

  minus.addEventListener("click", function () {
    setVal(parseInt(input.value, 10) - 1);
  });

  plus.addEventListener("click", function () {
    setVal(parseInt(input.value, 10) + 1);
  });

  input.addEventListener("change", function () {
    setVal(input.value);
  });
})();

(function initSavPdpAccordion() {
  var root = document.querySelector("[data-pdp-accordion]");
  if (!root) return;

  var buttons = root.querySelectorAll("[data-pdp-acc-btn]");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var id = btn.getAttribute("aria-controls");
      var panel = id ? document.getElementById(id) : null;
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });
})();

(function initSavShopLookFilters() {
  var root = document.querySelector("[data-shop-look-filters]");
  if (!root) return;

  var pills = root.querySelectorAll(".sav-shop-look__pill");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("is-active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-pressed", "true");
    });
  });
})();

(function initSavPincodeDeliveryCheck() {
  var pincodeInput = document.getElementById("pdp-pincode");
  var checkBtn = document.querySelector(".sav-pdp__pin-check");
  var dateEl = document.getElementById("pdp-delivery-date");
  var eligibilityEl = document.getElementById("pdp-delivery-eligibility");
  if (!pincodeInput || !checkBtn || !dateEl || !eligibilityEl) return;

  function formatDate(daysToAdd) {
    var d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    var day = d.getDate();
    var month = d.toLocaleString("en-IN", { month: "long" });
    return day + " " + month;
  }

  function updateDeliveryDetails() {
    var pincode = String(pincodeInput.value || "").trim();
    var validPincode = /^\d{6}$/.test(pincode);

    if (!validPincode) {
      dateEl.innerHTML = "Please enter a valid 6-digit pincode";
      eligibilityEl.textContent = "Delivery availability cannot be checked";
      return;
    }

    var firstDigit = parseInt(pincode.charAt(0), 10);
    var lastDigit = parseInt(pincode.charAt(5), 10);
    var daysForDelivery = firstDigit >= 6 ? 6 : 3;
    var freeDeliveryEligible = lastDigit % 2 === 0;

    dateEl.innerHTML = "Estimated Delivery by <strong>" + formatDate(daysForDelivery) + "</strong>";
    eligibilityEl.textContent = freeDeliveryEligible
      ? "Eligible For Free Delivery"
      : "Not Eligible For Free Delivery";
  }

  checkBtn.addEventListener("click", updateDeliveryDetails);
  pincodeInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      updateDeliveryDetails();
    }
  });
})();
