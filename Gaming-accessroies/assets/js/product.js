(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var products = window.EH_PRODUCTS || [];
  var categories = window.EH_CATEGORIES || {};

  if (!id) {
    window.location.replace("index.html");
    return;
  }

  var product = products.find(function (p) {
    return p.id === id;
  });

  if (!product) {
    showProductNotFound(id);
    return;
  }

  function showProductNotFound(missingId) {
    var main = document.querySelector(".eh-pdp");
    if (!main) return;
    main.innerHTML =
      '<div class="eh-pdp__shell" style="padding:80px 24px;text-align:center">' +
      "<h1>Product not found</h1>" +
      '<p style="color:#666">No product matches id: <strong>' +
      missingId +
      "</strong></p>" +
      '<a href="index.html" style="color:#0070d1;font-weight:600">Back to store</a>' +
      "</div>";
    document.title = "Product not found — NovaCore Gaming Store";
  }

  var basePrice = product.price;
  var originalPrice = Math.round(basePrice * 1.15);
  var discountPct = Math.round((1 - basePrice / originalPrice) * 100);
  var galleryImages = [
    product.image,
    "assets/img/gaming-mouse.png",
    "assets/img/gaming-keyboard.png",
    "assets/img/gaming-headphone.png",
    "assets/img/gaming-headphone.png"
  ];
  var galleryIndex = 0;

  document.title = product.title + " — NovaCore Gaming Store";

  function formatPrice(n) {
    return "\u20B9" + n.toLocaleString("en-IN");
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  /* Breadcrumb */
  setText("[data-pdp-crumb-title]", product.title);
  var catMeta = categories[product.category] || categories.all;
  var crumbCat = document.querySelector("[data-pdp-crumb-cat]");
  if (crumbCat && catMeta) {
    crumbCat.textContent = catMeta.title;
    crumbCat.setAttribute("href", "category.html?cat=" + product.category);
  }

  /* Product info */
  setText("[data-pdp-title]", product.title);
  setText("[data-pdp-platform-badge]", product.platform);
  setText("[data-pdp-sku]", "NC-" + product.id.toUpperCase().replace("-", "-"));

  var rewards = Math.round(basePrice * 0.016);
  setText("[data-pdp-rewards]", formatPrice(rewards));

  if (product.type === "preowned") {
    setText("[data-pdp-social-proof]", "Trusted pre-owned — inspected & certified by NovaCore.");
  }

  var addBtns = document.querySelectorAll("[data-pdp-add], [data-pdp-add-mobile]");
  var label = product.type === "preowned" ? "Buy Now" : "Add To Cart";
  addBtns.forEach(function (btn) {
    btn.textContent = label;
  });

  /* Gallery */
  function updateMainImage() {
    var stage = document.querySelector(".eh-pdp__gallery-main");
    var mainImg = document.querySelector("[data-pdp-image]");
    if (!mainImg) return;

    if (stage) stage.classList.add("is-fading");

    setTimeout(function () {
      mainImg.src = galleryImages[galleryIndex];
      mainImg.alt = product.title;
      if (stage) stage.classList.remove("is-fading");
    }, 180);

    document.querySelectorAll("[data-pdp-thumb]").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === galleryIndex);
    });
  }

  function buildThumbs() {
    var track = document.querySelector("[data-pdp-thumbs]");
    if (!track) return;
    track.innerHTML = galleryImages
      .map(function (src, i) {
        return (
          '<button type="button" class="eh-pdp__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-pdp-thumb="' +
          i +
          '"><img src="' +
          src +
          '" alt="" width="64" height="64" loading="lazy" decoding="async"></button>'
        );
      })
      .join("");

    track.querySelectorAll("[data-pdp-thumb]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        galleryIndex = parseInt(btn.getAttribute("data-pdp-thumb"), 10) || 0;
        updateMainImage();
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    });
  }

  buildThumbs();
  updateMainImage();

  function stepGallery(dir) {
    galleryIndex = (galleryIndex + dir + galleryImages.length) % galleryImages.length;
    updateMainImage();
    var active = document.querySelector('[data-pdp-thumb="' + galleryIndex + '"]');
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  var thumbPrev = document.querySelector("[data-pdp-thumb-prev]");
  var thumbNext = document.querySelector("[data-pdp-thumb-next]");
  if (thumbPrev) thumbPrev.addEventListener("click", function () { stepGallery(-1); });
  if (thumbNext) thumbNext.addEventListener("click", function () { stepGallery(1); });

  /* Pricing */
  function updatePrice() {
    var monthly = Math.round(basePrice / 24);
    var priceStr = formatPrice(basePrice);

    setText("[data-pdp-price]", priceStr);
    setText("[data-pdp-est-value]", formatPrice(originalPrice));
    setText("[data-pdp-discount]", discountPct + "% off");
    setText("[data-pdp-mobile-price]", priceStr);
    setText("[data-pdp-mobile-emi]", formatPrice(monthly) + "/mo");

    var emi = document.querySelector("[data-pdp-emi]");
    if (emi) {
      emi.innerHTML =
        '<span class="eh-pdp__paypal" aria-hidden="true">PayPal</span> Starting at <strong>' +
        formatPrice(monthly) +
        "/mo</strong> or as low as 0% APR. <a href=\"#\">Learn more</a>";
    }
  }

  /* Specs from product */
  function updateSpecs() {
    var isPs5 = product.platform === "PS5";
    setText(
      "[data-pdp-spec=\"processor\"]",
      isPs5 ? "Custom AMD Zen 2 · " + product.platform : product.platform + " Architecture"
    );
    setText("[data-pdp-spec=\"os\"]", "Latest " + product.platform + " System Software");
    setText(
      "[data-pdp-spec=\"graphic\"]",
      isPs5 ? "AMD RDNA 2 · Ray Tracing" : "AMD GCN · Enhanced Graphics"
    );
    setText("[data-pdp-spec=\"memory\"]", isPs5 ? "16 GB GDDR6" : "8 GB GDDR5");
    setText("[data-pdp-spec=\"storage\"]", isPs5 ? "825 GB Custom SSD" : "500 GB + Disc");
    setText("[data-pdp-spec=\"camera\"]", "DualSense Wireless Controller");
    setText("[data-pdp-spec=\"display\"]", "Up to 4K HDR · 120Hz output");
    setText(
      "[data-pdp-spec=\"edition\"]",
      product.badge + " — " + (product.type === "preowned" ? "Pre-Owned" : "New")
    );
    setText("[data-pdp-spec=\"color\"]", "Standard " + product.platform + " Edition");
  }

  updatePrice();
  updateSpecs();
})();
