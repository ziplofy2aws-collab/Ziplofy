(function (global) {
  "use strict";

  var PRODUCTS = {
    "camoflex-t-shirt": {
      id: "camoflex-t-shirt",
      name: "Camoflex T-Shirt",
      price: 999,
      fit: "Regular Fit",
      material: "Polyester jacquard",
      category: "T-Shirt's",
      images: [
        "assets/img/P-1.png",
        "assets/img/P-1-hover.png",
        "assets/img/P-2.png",
        "assets/img/P-2-hover.png",
        "assets/img/P-3.png",
        "assets/img/P-4.png"
      ],
      colors: [
        { name: "Navy", img: "assets/img/P-2.png", dot: "#1e2a4a" },
        { name: "Olive", img: "assets/img/P-3.png", dot: "#5c6b3c" },
        { name: "Grey", img: "assets/img/P-1.png", dot: "#8a8a8a" },
        { name: "Black", img: "assets/img/P-4.png", dot: "#1a1a1a" }
      ]
    },
    "brookline-oversized": {
      id: "brookline-oversized",
      name: "Brookline Oversized T-shirt Black",
      price: 1099,
      fit: "Oversized Fit",
      material: "Cotton blend",
      category: "T-Shirt's",
      images: ["assets/img/cat-1.png"]
    },
    "dragon-tank": {
      id: "dragon-tank",
      name: "Dragon Capsleeves Tank Black",
      price: 999,
      fit: "Oversized Fit",
      material: "Performance polyester",
      category: "Tanks",
      images: ["assets/img/cat-2.png"]
    },
    "ember-tshirt": {
      id: "ember-tshirt",
      name: "Ember T-shirt White",
      price: 749,
      fit: "Slim Fit",
      material: "Cotton jersey",
      category: "T-Shirt's",
      images: ["assets/img/cat-3.png"]
    },
    "checks-running-tank": {
      id: "checks-running-tank",
      name: "Checks Running Tank Bottle Green",
      price: 649,
      fit: "Regular Fit",
      material: "Moisture-wicking poly",
      category: "Tanks",
      images: ["assets/img/cat-4.png"]
    },
    "iconic-oversized-white": {
      id: "iconic-oversized-white",
      name: "Iconic Oversized T-shirt White",
      price: 1099,
      fit: "Oversized Fit",
      material: "Cotton blend",
      category: "T-Shirt's",
      images: ["assets/img/cat-5.png"]
    },
    "power-compression-navy": {
      id: "power-compression-navy",
      name: "Power Compression Tee Navy",
      price: 899,
      fit: "Compression Fit",
      material: "Polyester elastane",
      category: "T-Shirt's",
      images: ["assets/img/cat-6.png"]
    },
    "core-training-short": {
      id: "core-training-short",
      name: "Core Training Short Black",
      price: 799,
      fit: "Regular Fit",
      material: "Stretch woven",
      category: "Shorts",
      images: ["assets/img/cat-7.png"]
    },
    "apex-hoodie-grey": {
      id: "apex-hoodie-grey",
      name: "Apex Performance Hoodie Grey",
      price: 1299,
      fit: "Oversized Fit",
      material: "French terry cotton",
      category: "Hoodies",
      images: ["assets/img/cat-8.png"]
    },
    "shadow-hoodie": {
      id: "shadow-hoodie",
      name: "Shadow Washed Capsleeves Hoodie Dark Grey",
      price: 1399,
      fit: "Oversized Fit",
      material: "Washed cotton blend",
      category: "Hoodies",
      images: ["assets/img/cat-9.png"]
    },
    "ontrack-jacket-light": {
      id: "ontrack-jacket-light",
      name: "Ontrack Jackets Light Grey",
      price: 1289,
      compare: 1849,
      fit: "Regular Fit",
      material: "Polyester shell",
      category: "Jackets",
      images: ["assets/img/cat-10.png"]
    },
    "ontrack-jacket-black": {
      id: "ontrack-jacket-black",
      name: "Ontrack Jackets Black",
      price: 1479,
      compare: 1849,
      fit: "Regular Fit",
      material: "Polyester shell",
      category: "Jackets",
      images: ["assets/img/cat-11.png"]
    },
    "ontrack-jacket-navy": {
      id: "ontrack-jacket-navy",
      name: "Ontrack Jackets Navy",
      price: 1289,
      compare: 1849,
      fit: "Regular Fit",
      material: "Polyester shell",
      category: "Jackets",
      images: ["assets/img/cat-12.png"]
    },
    "revolve-glass-white": {
      id: "revolve-glass-white",
      name: "Revolve Glass White Oversized T Shirt",
      price: 4300,
      fit: "Oversized Fit",
      material: "Premium cotton",
      category: "T-Shirt's",
      images: ["assets/img/NA-1.png", "assets/img/NA-1-hover.png"]
    },
    "revolve-community-black": {
      id: "revolve-community-black",
      name: "Revolve Community Black Oversized T Shirt",
      price: 4300,
      fit: "Oversized Fit",
      material: "Premium cotton",
      category: "T-Shirt's",
      images: ["assets/img/NA-2.png", "assets/img/NA-2-hover.png"]
    },
    "revolve-community-white": {
      id: "revolve-community-white",
      name: "Revolve Community White Oversized T Shirt",
      price: 4300,
      fit: "Oversized Fit",
      material: "Premium cotton",
      category: "T-Shirt's",
      images: ["assets/img/NA-3.png", "assets/img/NA-3-hover.png"]
    },
    "revolve-script-black": {
      id: "revolve-script-black",
      name: "Revolve Script Black Oversized T Shirt",
      price: 4300,
      fit: "Oversized Fit",
      material: "Premium cotton",
      category: "T-Shirt's",
      images: ["assets/img/NA-4.png", "assets/img/NA-4-hover.png"]
    },
    "power-tshirt-red": {
      id: "power-tshirt-red",
      name: "Power T-Shirt",
      price: 36,
      fit: "Oversized Fit",
      material: "Performance cotton",
      category: "T-Shirt's",
      images: ["assets/img/P-1.png", "assets/img/P-1-hover.png"]
    },
    "power-tshirt-blue": {
      id: "power-tshirt-blue",
      name: "Power T-Shirt",
      price: 36,
      fit: "Oversized Fit",
      material: "Performance cotton",
      category: "T-Shirt's",
      images: ["assets/img/P-2.png", "assets/img/P-2-hover.png"]
    },
    "element-tank": {
      id: "element-tank",
      name: "Element Tank",
      price: 24,
      fit: "Compression Fit",
      material: "Stretch knit",
      category: "Tanks",
      images: ["assets/img/P-3.png", "assets/img/P-3-hover.png"]
    },
    "ribbed-tank": {
      id: "ribbed-tank",
      name: "Ribbed Tank 1PK",
      price: 16,
      fit: "Muscle Fit",
      material: "Ribbed cotton",
      category: "Tanks",
      images: ["assets/img/P-4.png", "assets/img/P-4-hover.png"]
    },
    "alx-grid-cargo": {
      id: "alx-grid-cargo",
      name: "Alx Grid Cargo",
      price: 2199,
      fit: "Regular Fit",
      material: "Cotton twill",
      category: "Bottoms",
      images: ["assets/img/coll-1.png", "assets/img/coll-2.png"]
    },
    "alx-compression-sleeve-black": {
      id: "alx-compression-sleeve-black",
      name: "Alx Arc Compression Full Sleeve T-Shirt",
      price: 1599,
      fit: "Compression Fit",
      material: "Polyester elastane",
      category: "T-Shirt's",
      images: ["assets/img/coll-2.png", "assets/img/coll-3.png"]
    },
    "alx-compression-tee": {
      id: "alx-compression-tee",
      name: "Alx Arc Compression T-Shirt",
      price: 1499,
      fit: "Compression Fit",
      material: "Polyester elastane",
      category: "T-Shirt's",
      images: ["assets/img/coll-3.png", "assets/img/coll-4.png"]
    },
    "alx-compression-sleeve-beige": {
      id: "alx-compression-sleeve-beige",
      name: "Alx Arc Compression Full Sleeve T-Shirt",
      price: 1599,
      fit: "Compression Fit",
      material: "Polyester elastane",
      category: "T-Shirt's",
      images: ["assets/img/coll-4.png"]
    },
    "roll-top-bag": {
      id: "roll-top-bag",
      name: "vyronx Roll Top Bag",
      price: 2499,
      fit: "One Size",
      material: "Matte nylon",
      category: "Accessories",
      images: ["assets/img/accessories-1.png", "assets/img/accessories-2.png"]
    },
    "steel-tumbler": {
      id: "steel-tumbler",
      name: "vyronx Stainless Steel Tumbler",
      price: 1499,
      fit: "One Size",
      material: "Stainless steel",
      category: "Accessories",
      images: ["assets/img/accessories-2.png", "assets/img/accessories-3.png"]
    },
    "coffee-mug": {
      id: "coffee-mug",
      name: "vyronx Coffee Mug",
      price: 899,
      fit: "One Size",
      material: "Ceramic coated steel",
      category: "Accessories",
      images: ["assets/img/accessories-3.png", "assets/img/accessories-4.png"]
    },
    "hydra-bottle": {
      id: "hydra-bottle",
      name: "vyronx Hydra Glass Bottle",
      price: 499,
      fit: "One Size",
      material: "Borosilicate glass",
      category: "Accessories",
      images: ["assets/img/accessories-4.png"]
    },
    "python-flex-duo": {
      id: "python-flex-duo",
      name: "Python Flex Duo",
      price: 2420,
      compare: 2548,
      fit: "Regular Fit",
      material: "Stretch blend",
      category: "Sets",
      images: ["assets/img/PD-1.png"]
    },
    "seamless-division-set": {
      id: "seamless-division-set",
      name: "Seamless Division Set",
      price: 2990,
      compare: 3148,
      fit: "Regular Fit",
      material: "Seamless knit",
      category: "Sets",
      images: ["assets/img/PD-2.png"]
    },
    "ash-relaxed-duo": {
      id: "ash-relaxed-duo",
      name: "Ash Relaxed Fit Duo",
      price: 2373,
      compare: 2498,
      fit: "Relaxed Fit",
      material: "Cotton blend",
      category: "Sets",
      images: ["assets/img/PD-3.png"]
    },
    "levitate-edge-duo": {
      id: "levitate-edge-duo",
      name: "Levitate Edge Duo",
      price: 2088,
      compare: 2198,
      fit: "Regular Fit",
      material: "Performance poly",
      category: "Sets",
      images: ["assets/img/PD-4.png"]
    },
    "stride-straight-pants": {
      id: "stride-straight-pants",
      name: "Stride Straight Fit Pants",
      price: 1999,
      fit: "Straight Fit",
      material: "Cotton twill",
      category: "Bottoms",
      images: ["assets/img/cat-7.png"]
    }
  };

  var IMAGE_TO_ID = {};
  var DEFAULT_PRODUCT_ID = "camoflex-t-shirt";

  Object.keys(PRODUCTS).forEach(function (id) {
    var product = PRODUCTS[id];
    (product.images || []).forEach(function (src) {
      var file = src.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase();
      if (!IMAGE_TO_ID[file]) {
        IMAGE_TO_ID[file] = id;
      }
    });
  });

  function formatPrice(amount) {
    if (amount >= 1000) {
      return "Rs. " + amount.toLocaleString("en-IN") + ".00";
    }
    return "Rs. " + amount + ".00";
  }

  function formatEmi(amount) {
    return Math.round(amount / 3);
  }

  function getProductUrl(id, basePath) {
    var path = basePath || "";
    return path + "product.html?id=" + encodeURIComponent(id);
  }

  function getProductById(id) {
    return PRODUCTS[id] || PRODUCTS[DEFAULT_PRODUCT_ID];
  }

  function getProductIdFromImageSrc(src) {
    if (!src) return null;
    var match = src.match(/\/([^/?#]+)\.(png|jpe?g|webp)/i);
    if (!match) return null;
    var file = match[1].toLowerCase().replace(/-hover$/, "");
    return IMAGE_TO_ID[file] || null;
  }

  function getProductIdFromCard(card) {
    if (!card) return null;
    if (card.dataset.productId) {
      return card.dataset.productId;
    }
    var img = card.querySelector(
      ".cat-card__img, .na-card__img--default, .pls-card__img--default, .coll-card__media img, .acc-card__media img, .pdp-look__media img, .pdp-complete__media img, img[src*='assets/img']"
    );
    if (img) {
      return getProductIdFromImageSrc(img.getAttribute("src") || img.src);
    }
    return null;
  }

  function resolveProductPagePath() {
    var path = window.location.pathname || "";
    if (path.indexOf("/") === -1) {
      return "";
    }
    var depth = path.split("/").filter(Boolean).length - 1;
    if (depth <= 0) {
      return "";
    }
    return "../".repeat(depth);
  }

  global.ProductCatalog = {
    PRODUCTS: PRODUCTS,
    DEFAULT_PRODUCT_ID: DEFAULT_PRODUCT_ID,
    formatPrice: formatPrice,
    formatEmi: formatEmi,
    getProductUrl: getProductUrl,
    getProductById: getProductById,
    getProductIdFromCard: getProductIdFromCard,
    getProductIdFromImageSrc: getProductIdFromImageSrc,
    resolveProductPagePath: resolveProductPagePath
  };
})(typeof window !== "undefined" ? window : this);
