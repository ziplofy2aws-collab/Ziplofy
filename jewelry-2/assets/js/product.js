(function () {
  "use strict";

  var PRODUCTS = {
    1: {
      id: 1,
      name: "Shahi Dwar Jhalar Raani Haar Beaded Necklace Set",
      price: "₹3,089",
      priceWas: "₹5,149",
      img: "assets/img/RC-1.webp",
      hover: "assets/img/RC-hover-1.webp",
      alt2: "assets/img/RC-2.webp",
      alt3: "assets/img/RC-hover-2.webp",
      sku: "RTN-NK-RC001",
      category: "Necklaces",
      desc: "Lend elegance to your outfit with this regal beaded necklace set featuring intricate jhalar detailing and antique gold plating — crafted for weddings and festive celebrations.",
      material: "Brass with antique gold plating",
      weight: "185 g",
      metal: "Antique Gold",
      stone: "Beaded",
      finish: "Heritage",
      occasion: "Wedding, Festive, Traditional",
      care: "Store in a dry pouch; avoid water and perfume",
      metalValue: "₹1,850",
      makingCharges: "₹899",
      gst: "₹340",
      hasOptions: false
    },
    2: {
      id: 2,
      name: "Navratan Fluid Elegance Short Necklace Set",
      price: "₹2,759",
      priceWas: "₹4,599",
      img: "assets/img/RC-2.webp",
      hover: "assets/img/RC-hover-2.webp",
      alt2: "assets/img/RC-3.webp",
      alt3: "assets/img/RC-hover-3.webp",
      sku: "RTN-NK-RC002",
      category: "Necklaces",
      desc: "A vibrant navratan-inspired short necklace set with fluid elegance — perfect for festive evenings and traditional celebrations.",
      material: "Brass with gold-tone plating",
      weight: "142 g",
      metal: "Gold Tone",
      stone: "Navratan",
      finish: "Polished",
      occasion: "Festive, Party, Traditional",
      care: "Wipe with soft cloth after use",
      metalValue: "₹1,650",
      makingCharges: "₹799",
      gst: "₹310",
      hasOptions: false
    },
    3: {
      id: 3,
      name: "Navratan Moonlight Dangle Earrings",
      price: "₹1,319",
      priceWas: "₹2,199",
      img: "assets/img/RC-3.webp",
      hover: "assets/img/RC-hover-3.webp",
      alt2: "assets/img/RC-4.webp",
      alt3: "assets/img/RC-hover-4.webp",
      sku: "RTN-ER-RC003",
      category: "Earrings",
      desc: "Graceful dangle earrings with navratan accents that catch the light beautifully — a refined choice for day-to-night styling.",
      material: "Brass with antique gold plating",
      weight: "28 g",
      metal: "Antique Gold",
      stone: "Navratan",
      finish: "Heritage",
      occasion: "Festive, Wedding, Party",
      care: "Store separately to avoid tangling",
      metalValue: "₹790",
      makingCharges: "₹399",
      gst: "₹130",
      hasOptions: false
    },
    4: {
      id: 4,
      name: "Gota Patti Phoolra Zari Ring",
      price: "₹539",
      priceWas: "₹899",
      img: "assets/img/RC-4.webp",
      hover: "assets/img/RC-hover-4.webp",
      alt2: "assets/img/RC-1.webp",
      alt3: "assets/img/RC-hover-1.webp",
      sku: "RTN-RG-RC004",
      category: "Rings",
      desc: "An artisanal ring with gota patti and phoolra zari detailing — lightweight, festive, and easy to pair with ethnic looks.",
      material: "Brass with gold-tone plating",
      weight: "12 g",
      metal: "Gold Tone",
      stone: "Zari Work",
      finish: "Festive",
      occasion: "Haldi, Mehendi, Festive",
      care: "Keep away from moisture and perfume",
      metalValue: "₹320",
      makingCharges: "₹149",
      gst: "₹70",
      hasOptions: true
    },
    5: {
      id: 5,
      name: "Signature Rudra Trishakti Mens Pendant",
      price: "₹539",
      priceWas: "₹899",
      img: "assets/img/BS-1.jpg",
      hover: "assets/img/BS-hover-1.webp",
      alt2: "assets/img/BS-2.jpg",
      alt3: "assets/img/BS-hover-2.webp",
      sku: "RTN-PD-BS001",
      category: "Pendants",
      desc: "A bold Rudra Trishakti pendant designed for men — spiritual symbolism meets everyday wear with a premium antique finish.",
      material: "Stainless steel with antique plating",
      weight: "18 g",
      metal: "Antique Silver",
      stone: "None",
      finish: "Matte Antique",
      occasion: "Daily Wear, Spiritual",
      care: "Polish gently with dry cloth",
      metalValue: "₹320",
      makingCharges: "₹149",
      gst: "₹70",
      hasOptions: false
    },
    6: {
      id: 6,
      name: "Kalash Yellow stone Pendant Set",
      price: "₹593",
      priceWas: "₹989",
      img: "assets/img/BS-2.jpg",
      hover: "assets/img/BS-hover-2.webp",
      alt2: "assets/img/BS-3.jpg",
      alt3: "assets/img/BS-hover-3.webp",
      sku: "RTN-PD-BS002",
      category: "Pendants",
      desc: "A kalash-inspired pendant set with yellow stone accents — auspicious detailing for festive and ceremonial occasions.",
      material: "Brass with gold-tone plating",
      weight: "22 g",
      metal: "Gold Tone",
      stone: "Yellow Stone",
      finish: "Traditional",
      occasion: "Festive, Puja, Gifting",
      care: "Avoid contact with water",
      metalValue: "₹350",
      makingCharges: "₹179",
      gst: "₹64",
      hasOptions: false
    },
    7: {
      id: 7,
      name: "Rudra Trishakti Sitaram Mens Pendant",
      price: "₹443",
      priceWas: "₹739",
      img: "assets/img/BS-3.jpg",
      hover: "assets/img/BS-hover-3.webp",
      alt2: "assets/img/BS-4.jpg",
      alt3: "assets/img/BS-hover-4.webp",
      sku: "RTN-PD-BS003",
      category: "Pendants",
      desc: "A Sitaram Rudra Trishakti pendant with refined craftsmanship — a meaningful accessory for daily spiritual wear.",
      material: "Stainless steel with antique plating",
      weight: "16 g",
      metal: "Antique Silver",
      stone: "None",
      finish: "Matte Antique",
      occasion: "Daily Wear, Spiritual",
      care: "Store in a dry place",
      metalValue: "₹260",
      makingCharges: "₹129",
      gst: "₹54",
      hasOptions: false
    },
    8: {
      id: 8,
      name: "Dainty Pearl With Tortoise Shell Charm Bracelet",
      price: "₹1,739",
      priceWas: "₹2,899",
      img: "assets/img/BS-4.jpg",
      hover: "assets/img/BS-hover-4.webp",
      alt2: "assets/img/BS-1.jpg",
      alt3: "assets/img/BS-hover-1.webp",
      sku: "RTN-BR-BS004",
      category: "Bracelets",
      desc: "A dainty pearl bracelet with tortoise shell charm detailing — understated elegance for everyday and occasion wear.",
      material: "Pearl with gold-tone findings",
      weight: "24 g",
      metal: "Gold Tone",
      stone: "Pearl",
      finish: "Classic",
      occasion: "Daily Wear, Gifting",
      care: "Avoid harsh chemicals and water",
      metalValue: "₹1,040",
      makingCharges: "₹499",
      gst: "₹200",
      hasOptions: true
    }
  };

  var CARD_SELECTOR = ".jw2-pcard";
  var IGNORE_SELECTOR = "button, .jw2-pcard__btn";

  var IMAGE_ID_MAP = {
    "RC-1": 1,
    "RC-2": 2,
    "RC-3": 3,
    "RC-4": 4,
    "BS-1": 5,
    "BS-2": 6,
    "BS-3": 7,
    "BS-4": 8
  };

  function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get("id"), 10);
    return PRODUCTS[id] ? id : 1;
  }

  function inferProductId(card) {
    var dataId = card.getAttribute("data-product-id");
    if (dataId) return parseInt(dataId, 10);

    var img = card.querySelector(".jw2-pcard__img--default, .jw2-pcard__img");
    if (!img) return null;

    var src = img.getAttribute("src") || "";
    var key;
    for (key in IMAGE_ID_MAP) {
      if (src.indexOf(key) !== -1) return IMAGE_ID_MAP[key];
    }
    return null;
  }

  function getProductUrl(id) {
    return id ? "product.html?id=" + id : "product.html";
  }

  function updateCardLinks(card, id) {
    if (!id) return;

    card.setAttribute("data-product-id", String(id));

    card.querySelectorAll('a[href*="product.html"]').forEach(function (link) {
      link.setAttribute("href", getProductUrl(id));
    });
  }

  function initCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach(function (card) {
      var id = inferProductId(card);
      updateCardLinks(card, id);

      if (!card.hasAttribute("tabindex")) {
        card.setAttribute("tabindex", "0");
      }
    });
  }

  function isIgnoredClick(target) {
    return Boolean(target.closest(IGNORE_SELECTOR));
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setHtml(el, html) {
    if (el) el.innerHTML = html;
  }

  function renderRelated(currentId) {
    var grid = document.querySelector("[data-jw2-related-grid]");
    if (!grid) return;

    grid.innerHTML = "";

    Object.keys(PRODUCTS).forEach(function (key) {
      var id = parseInt(key, 10);
      if (id === currentId) return;

      var p = PRODUCTS[id];
      var article = document.createElement("article");
      article.className = "jw2-pcard jw2-pcard--grid";
      article.setAttribute("data-product-id", String(id));

      var btnClass = p.hasOptions ? "jw2-pcard__btn jw2-pcard__btn--options" : "jw2-pcard__btn";
      var btnText = p.hasOptions ? "Select Options" : "Add to Cart";

      article.innerHTML =
        '<a href="product.html?id=' + id + '" class="jw2-pcard__media">' +
        '<span class="jw2-pcard__badge">- 40%</span>' +
        '<div class="jw2-pcard__visual">' +
        '<img class="jw2-pcard__img jw2-pcard__img--default" src="' + p.img + '" alt="' + p.name + '" width="400" height="400" loading="lazy" decoding="async" />' +
        '<img class="jw2-pcard__img jw2-pcard__img--hover" src="' + p.hover + '" alt="" width="400" height="400" loading="lazy" decoding="async" aria-hidden="true" />' +
        "</div></a>" +
        '<h3 class="jw2-pcard__name"><a href="product.html?id=' + id + '">' + p.name + "</a></h3>" +
        '<p class="jw2-pcard__price">' +
        '<span class="jw2-pcard__price-old">' + p.priceWas + "</span> " +
        '<span class="jw2-pcard__price-sale">' + p.price + "</span>" +
        "</p>" +
        '<button type="button" class="' + btnClass + '">' + btnText + "</button>";

      grid.appendChild(article);
    });

    initRelatedCarousel();
  }

  var relatedCarouselBound = false;
  var relatedCarouselPage = 0;

  function initRelatedCarousel() {
    var root = document.querySelector("[data-jw2-related-carousel]");
    if (!root) return;

    var track = root.querySelector("[data-jw2-related-grid]");
    var viewport = root.querySelector("[data-jw2-related-viewport]");
    var prevBtn = root.querySelector("[data-jw2-related-prev]");
    var nextBtn = root.querySelector("[data-jw2-related-next]");

    if (!track || !viewport) return;

    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap || "0") || 20;
    }

    function getCards() {
      return track.querySelectorAll(".jw2-pcard");
    }

    function getStep() {
      var cards = getCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getVisibleCount() {
      var step = getStep();
      if (!step) return 1;
      return Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
    }

    function getMaxPage() {
      var cards = getCards();
      var visible = getVisibleCount();
      return Math.max(0, Math.ceil(cards.length / visible) - 1);
    }

    function updateRelatedCarousel() {
      var cards = getCards();
      if (!cards.length) return;

      var maxPage = getMaxPage();
      if (relatedCarouselPage > maxPage) relatedCarouselPage = maxPage;

      var visible = getVisibleCount();
      var offset = relatedCarouselPage * visible * getStep();
      track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

      if (prevBtn) prevBtn.disabled = relatedCarouselPage <= 0;
      if (nextBtn) nextBtn.disabled = relatedCarouselPage >= maxPage;
    }

    if (!relatedCarouselBound) {
      relatedCarouselBound = true;

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (relatedCarouselPage > 0) {
            relatedCarouselPage -= 1;
            updateRelatedCarousel();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (relatedCarouselPage < getMaxPage()) {
            relatedCarouselPage += 1;
            updateRelatedCarousel();
          }
        });
      }

      window.addEventListener("resize", function () {
        relatedCarouselPage = Math.min(relatedCarouselPage, getMaxPage());
        updateRelatedCarousel();
      });

      window.addEventListener("load", updateRelatedCarousel);
    }

    relatedCarouselPage = 0;
    track.style.transform = "translate3d(0, 0, 0)";
    updateRelatedCarousel();

    getCards().forEach(function (card) {
      card.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("load", updateRelatedCarousel);
      });
    });
  }

  function applyProduct(p) {
    document.title = p.name + " | Ratnaya Jewellers";

    setText(document.getElementById("jw2-pdp-breadcrumb"), p.name);
    setText(document.getElementById("jw2-pdp-title"), p.name);
    setText(document.getElementById("jw2-pdp-price-sale"), p.price);
    setText(document.getElementById("jw2-pdp-price-old"), p.priceWas);
    setText(document.getElementById("jw2-pdp-desc"), p.desc);
    setText(document.getElementById("jw2-pdp-spec-weight"), p.weight);
    setText(document.getElementById("jw2-pdp-spec-metal"), p.metal);
    setText(document.getElementById("jw2-pdp-spec-stone"), p.stone);
    setText(document.getElementById("jw2-pdp-spec-finish"), p.finish);

    setHtml(document.getElementById("jw2-pdp-details-body"),
      "<p>SKU: " + p.sku + "</p>" +
      "<p>Material: " + p.material + "</p>" +
      "<p>Occasion: " + p.occasion + "</p>" +
      "<p>Care: " + p.care + "</p>");

    setHtml(document.getElementById("jw2-pdp-breakup-body"),
      "<p>Metal Value: " + p.metalValue + "</p>" +
      "<p>Making Charges: " + p.makingCharges + "</p>" +
      "<p>GST (3%): " + p.gst + "</p>" +
      "<p><strong>Total: " + p.price + "</strong></p>");

    var images = [
      { src: p.hover, alt: p.name + " lifestyle view", lifestyle: true },
      { src: p.img, alt: p.name, lifestyle: false },
      { src: p.alt2, alt: p.name + " alternate view", lifestyle: false },
      { src: p.alt3, alt: p.name + " detail view", lifestyle: false }
    ];

    var tiles = document.querySelectorAll("[data-jw2-pdp-gallery] .jw2-pdp__media-tile");
    tiles.forEach(function (tile, index) {
      var imgData = images[index];
      if (!imgData) return;

      var img = tile.querySelector("img");
      if (!img) return;

      img.src = imgData.src;
      img.alt = imgData.alt;
      tile.classList.toggle("jw2-pdp__media-tile--lifestyle", !!imgData.lifestyle);
      tile.classList.toggle("is-active", index === 0);
    });

    renderRelated(p.id);
    initCards();
  }

  function initProductPage() {
    if (!document.getElementById("jw2-pdp-title")) return;

    var id = getProductIdFromUrl();
    var product = PRODUCTS[id];
    if (!product) return;

    applyProduct(product);
  }

  document.addEventListener("click", function (e) {
    if (isIgnoredClick(e.target)) return;

    var card = e.target.closest(CARD_SELECTOR);
    if (!card) return;

    var id = inferProductId(card);
    if (!id) return;

    var link = e.target.closest('a[href*="product.html"]');
    if (link) {
      link.setAttribute("href", getProductUrl(id));
      return;
    }

    e.preventDefault();
    window.location.href = getProductUrl(id);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;

    var card = e.target.closest(CARD_SELECTOR);
    if (!card || card !== e.target) return;

    var id = inferProductId(card);
    if (!id) return;

    e.preventDefault();
    window.location.href = getProductUrl(id);
  });

  function init() {
    initCards();
    initProductPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
