/**
 * Kadam Shoes-3 — shared product catalog
 */
window.SH3_PRODUCTS = (function () {
  "use strict";

  var raw = [
    {
      id: "nike-pegasus-42",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Nike Pegasus 42.avif",
      alt: "Nike Pegasus 42 running shoes",
      name: "Nike Pegasus 42",
      count: 248,
      mrp: 12999,
      price: 8499,
      discount: "35% OFF",
      features: "Running | Cushioned Midsole",
      offer: 7999,
      category: "Running Shoes",
      type: "Running Shoes"
    },
    {
      id: "nike-pegasus-premium",
      badge: "LIMITED EDITION",
      badgeIcon: "fa-gem",
      image: "assets/img/Nike Pegasus Premium.avif",
      alt: "Nike Pegasus Premium sneakers",
      name: "Nike Pegasus Premium",
      count: 312,
      mrp: 15999,
      price: 10499,
      discount: "34% OFF",
      features: "Mesh Upper | Lightweight",
      offer: 9799,
      category: "Running Shoes",
      type: "Running Shoes"
    },
    {
      id: "nike-victori-one",
      badge: "TRENDING",
      badgeIcon: "fa-arrow-trend-up",
      image: "assets/img/Nike Victori One.avif",
      alt: "Nike Victori One lifestyle shoes",
      name: "Nike Victori One",
      count: 189,
      mrp: 9999,
      price: 6499,
      discount: "35% OFF",
      features: "All-Day Comfort | Retro Style",
      offer: 5999,
      category: "Casual Sneakers",
      type: "Lifestyle Sneakers"
    },
    {
      id: "nike-structure-26",
      badge: "NEW ARRIVAL",
      badgeIcon: "fa-sparkles",
      image: "assets/img/Nike Structure 26.avif",
      alt: "Nike Structure 26 stability runners",
      name: "Nike Structure 26",
      count: 156,
      mrp: 14499,
      price: 9999,
      discount: "31% OFF",
      features: "Premium Leather | Responsive Foam",
      offer: 9299,
      category: "Running Shoes",
      type: "Stability Runners"
    },
    {
      id: "air-jordan-1-low",
      badge: "HOT PICK",
      badgeIcon: "fa-fire",
      image: "assets/img/Air Jordan 1 Low.avif",
      alt: "Air Jordan 1 Low sneakers",
      name: "Air Jordan 1 Low",
      count: 420,
      mrp: 10999,
      price: 7499,
      discount: "32% OFF",
      features: "Lifestyle Sneaker | Non-slip Outsole",
      offer: 6999,
      category: "Lifestyle Sneakers",
      type: "Lifestyle Sneakers"
    },
    {
      id: "air-jordan-1-mid",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Air Jordan 1 Mid.avif",
      alt: "Air Jordan 1 Mid sneakers",
      name: "Air Jordan 1 Mid",
      count: 367,
      mrp: 11999,
      price: 8499,
      discount: "29% OFF",
      features: "Premium Leather | Iconic Design",
      offer: 7999,
      category: "Lifestyle Sneakers",
      type: "Lifestyle Sneakers"
    },
    {
      id: "nike-journey-run",
      badge: "NEW ARRIVAL",
      badgeIcon: "fa-sparkles",
      image: "assets/img/Nike Journey Run.avif",
      alt: "Nike Journey Run shoes",
      name: "Nike Journey Run",
      count: 203,
      mrp: 13999,
      price: 9499,
      discount: "32% OFF",
      features: "Breathable Knit | Stability Support",
      offer: 8899,
      category: "Running Shoes",
      type: "Running Shoes"
    },
    {
      id: "nike-revolution-8",
      badge: "VALUE PICK",
      badgeIcon: "fa-tag",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      alt: "Nike Revolution 8 EasyOn shoes",
      name: "Nike Revolution 8 EasyOn",
      count: 174,
      mrp: 8499,
      price: 5999,
      discount: "29% OFF",
      features: "Easy Slip-On | Max Cushion",
      offer: 5499,
      category: "Casual Sneakers",
      type: "Slip-On Sneakers"
    },
    {
      id: "nike-air-force-1",
      badge: "CLASSIC",
      badgeIcon: "fa-star",
      image: "assets/img/Nike Air Force 1 '07 LV8.avif",
      alt: "Nike Air Force 1 '07 LV8 sneakers",
      name: "Nike Air Force 1 '07 LV8",
      count: 521,
      mrp: 9499,
      price: 6299,
      discount: "34% OFF",
      features: "Classic Low-Top | Everyday Wear",
      offer: 5899,
      category: "Lifestyle Sneakers",
      type: "Lifestyle Sneakers"
    },
    {
      id: "nike-court-shot",
      badge: "HOT PICK",
      badgeIcon: "fa-fire",
      image: "assets/img/Nike Court Shot.avif",
      alt: "Nike Court Shot court sneakers",
      name: "Nike Court Shot",
      count: 126,
      mrp: 7999,
      price: 4999,
      discount: "38% OFF",
      features: "Court Ready | Flexible Sole",
      offer: 4599,
      category: "Training Shoes",
      type: "Court Shoes"
    },
    {
      id: "air-jordan-skyline",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Air Jordan Skyline Low.avif",
      alt: "Air Jordan Skyline Low sneakers",
      name: "Air Jordan Skyline Low",
      count: 198,
      mrp: 9999,
      price: 6999,
      discount: "30% OFF",
      features: "Street Style | Durable Outsole",
      offer: 6499,
      category: "Lifestyle Sneakers",
      type: "Lifestyle Sneakers"
    }
  ];

  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function buildSpecs(product) {
    return [
      { label: "Upper Material", value: "Engineered Mesh + Synthetic Overlays" },
      { label: "Midsole", value: "Responsive Cushioned Foam" },
      { label: "Outsole", value: "Rubber with Multi-Directional Grip" },
      { label: "Closure", value: "Lace-Up" },
      { label: "Type", value: product.type },
      { label: "Ideal For", value: "Running, Gym, Daily Wear" }
    ];
  }

  function buildHighlights(product) {
    return [
      product.features.split(" | ")[0] + " for all-day comfort",
      "Breathable upper keeps feet cool during long wear",
      "Cushioned midsole absorbs impact on every stride",
      "Durable outsole with reliable grip on city surfaces",
      "Designed for " + product.category.toLowerCase() + " enthusiasts"
    ];
  }

  function buildAbout(product) {
    return (
      "The Kadam " +
      product.name +
      " blends performance and everyday style. Built with a cushioned midsole, supportive fit, and premium materials, it's ideal for " +
      product.category.toLowerCase() +
      " and daily wear."
    );
  }

  var galleryPool = [
    "assets/img/Nike Pegasus 42.avif",
    "assets/img/Nike Pegasus Premium.avif",
    "assets/img/Nike Victori One.avif",
    "assets/img/Nike Structure 26.avif",
    "assets/img/Air Jordan 1 Low.avif",
    "assets/img/Air Jordan 1 Mid.avif",
    "assets/img/Nike Journey Run.avif",
    "assets/img/Nike Revolution 8 EasyOn.avif",
    "assets/img/Nike Air Force 1 '07 LV8.avif",
    "assets/img/Nike Court Shot.avif",
    "assets/img/Air Jordan Skyline Low.avif"
  ];

  var colorNames = ["Black/White", "Grey/Orange", "Navy/Red", "White/Blue"];

  function buildImages(product, index) {
    var imgs = [];
    var i;
    for (i = 0; i < 7; i += 1) {
      imgs.push(galleryPool[(index + i) % galleryPool.length]);
    }
    return imgs;
  }

  function buildColors(product, index) {
    return colorNames.slice(0, 4).map(function (name, i) {
      return {
        name: name,
        image: galleryPool[(index + i) % galleryPool.length]
      };
    });
  }

  var catalog = raw.map(function (product, index) {
    return enrich(product, index);
  });

  function enrich(product, index) {
    var off = Math.round((1 - product.price / product.mrp) * 100);
    var images = buildImages(product, index);
    return Object.assign({}, product, {
      mrpLabel: formatPrice(product.mrp),
      priceLabel: formatPrice(product.price),
      offerLabel: formatPrice(product.offer),
      off: off,
      offLabel: off + "% off",
      subtitle: product.features.replace(/\s*\|\s*/g, ", ") + ". Premium cushioning and breathable upper built for all-day comfort on streets, gym, and daily runs.",
      images: images,
      colors: buildColors(product, index),
      sizes: [6, 7, 8, 9, 10],
      specs: buildSpecs(product),
      highlights: buildHighlights(product),
      about: buildAbout(product)
    });
  }

  function createPickCard(product, options) {
    var opts = options || {};
    var tag = opts.link ? "a" : "article";
    var href = opts.link ? ' href="' + productHref(product.id) + '"' : "";
    var extraClass = opts.link ? " sh3-shop__card-link" : "";
    var slideClass = opts.slide ? " swiper-slide" : "";

    return (
      "<" + tag + ' class="sh3-pick-card' + slideClass + extraClass + '" data-product-id="' + product.id + '"' + href + ">" +
        '<div class="sh3-pick-card__media">' +
          '<span class="sh3-pick-card__badge">' +
            '<i class="fa-solid ' + product.badgeIcon + '" aria-hidden="true"></i>' +
            product.badge +
          "</span>" +
          '<div class="sh3-pick-card__img-wrap">' +
            '<img class="sh3-pick-card__img" src="' + product.image + '" alt="' + product.alt + '" loading="lazy" decoding="async" />' +
          "</div>" +
        "</div>" +
        '<div class="sh3-pick-card__body">' +
          '<div class="sh3-pick-card__rating" aria-label="Rated 5 out of 5, ' + product.count + ' reviews">' +
            '<span class="sh3-pick-card__stars" aria-hidden="true">★★★★★</span>' +
            '<span class="sh3-pick-card__count">(' + product.count + ")</span>" +
          "</div>" +
          '<h3 class="sh3-pick-card__name" title="' + product.name + '">' + product.name + "</h3>" +
          '<p class="sh3-pick-card__price">' +
            "<del>" + product.mrpLabel + "</del>" +
            "<strong>" + product.priceLabel + "</strong>" +
            "<em>" + product.discount + "</em>" +
          "</p>" +
          '<p class="sh3-pick-card__features">' + product.features + "</p>" +
          '<p class="sh3-pick-card__offer">' +
            '<i class="fa-solid fa-tag" aria-hidden="true"></i>' +
            "Offer Price <strong>" + product.offerLabel + "</strong>" +
          "</p>" +
          (opts.hideCompare
            ? ""
            : '<label class="sh3-pick-card__compare">' +
                '<input type="checkbox" name="compare" value="' + product.id + '" />' +
                "Add to Compare" +
              "</label>") +
        "</div>" +
      "</" + tag + ">"
    );
  }

  function productHref(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function get(id) {
    return catalog.find(function (item) {
      return item.id === id;
    });
  }

  function getAll() {
    return catalog.slice();
  }

  function getCategories() {
    var map = {};
    catalog.forEach(function (item) {
      map[item.category] = true;
    });
    return Object.keys(map);
  }

  return {
    catalog: catalog,
    get: get,
    getAll: getAll,
    getCategories: getCategories,
    createPickCard: createPickCard,
    productHref: productHref,
    formatPrice: formatPrice
  };
})();
