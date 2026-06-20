/**
 * Product catalog — keyed by image id (cat-1, na-1, bs-1, …)
 */
(function (global) {
  "use strict";

  var IMG = "assets/img/";
  var G = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6"];

  function gallery(primary) {
    var i = G.indexOf(primary);
    if (i < 0) return [IMG + primary + ".webp"];
    return G.map(function (k) {
      return IMG + k + ".webp";
    });
  }

  function p(id, opts) {
    opts = opts || {};
    return {
      id: id,
      title: opts.title,
      category: opts.category || "Chargers",
      image: IMG + id + ".webp",
      images: opts.images || (G.indexOf(id) >= 0 ? gallery(id) : [IMG + id + ".webp"]),
      price: opts.price,
      mrp: opts.mrp,
      off: opts.off || "",
      rating: opts.rating || "4.8",
      reviews: opts.reviews != null ? opts.reviews : 130,
      features: opts.features || [
        "Fast Charging",
        "Compact Design",
        "Multi-Device Support",
        "Safety Certified"
      ]
    };
  }

  /* Fix gallery for na/bs — map to cat images for PDP gallery */
  function pNa(num, opts) {
    var catNum = ((num - 1) % 6) + 1;
    var id = "na-" + num;
    var o = p("cat-" + catNum, opts);
    o.id = id;
    o.image = IMG + "NA-" + num + ".webp";
    o.images = [
      IMG + "NA-" + num + ".webp",
      IMG + "cat-" + catNum + ".webp",
      IMG + "cat-" + (((catNum) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 1) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 2) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 3) % 6) + 1) + ".webp"
    ];
    return o;
  }

  function pBs(num, opts) {
    var catNum = ((num - 1) % 6) + 1;
    var id = "bs-" + num;
    var o = p("cat-" + catNum, opts);
    o.id = id;
    o.image = IMG + "BS-" + num + ".webp";
    o.images = [
      IMG + "BS-" + num + ".webp",
      IMG + "cat-" + catNum + ".webp",
      IMG + "cat-" + (((catNum) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 1) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 2) % 6) + 1) + ".webp",
      IMG + "cat-" + (((catNum + 3) % 6) + 1) + ".webp"
    ];
    return o;
  }

  var products = {
    "cat-1": p("cat-1", {
      title: "AETHER Nano Charger (45W, Smart Display, 180° Foldable)",
      price: "$29.99",
      mrp: "$39.99",
      off: "25% OFF",
      reviews: 124,
      features: ["45W Fast Charge", "Smart Display", "180° Foldable Plug", "GaN Technology"]
    }),
    "cat-2": p("cat-2", {
      title: "AETHER Prime Charger (100W, 3 Ports, GaN)",
      price: "$59.99",
      mrp: "$69.99",
      off: "14% OFF",
      reviews: 203,
      features: ["100W Total Output", "3 Ports", "GaN Technology", "Compact Design"]
    }),
    "cat-3": p("cat-3", {
      title: "AETHER Nano Charging Dock (67W, 3 Ports, Retractable USB-C Cable)",
      price: "$49.99",
      mrp: "$59.99",
      off: "17% OFF",
      reviews: 96,
      features: ["67W Fast Charging", "Retractable USB-C", "3 Ports", "Desktop Dock Design"]
    }),
    "cat-4": p("cat-4", {
      title: "AETHER MagGo Power Bank (10K, 45W, Ultra-Slim)",
      price: "$59.99",
      mrp: "$79.99",
      off: "25% OFF",
      reviews: 178,
      features: ["10K Capacity", "45W Output", "MagSafe Compatible", "Ultra-Slim Design"]
    }),
    "cat-5": p("cat-5", {
      title: "AETHER 737 Power Bank (PowerCore 24K, 140W)",
      price: "Rs. 12,999.00",
      mrp: "Rs. 20,999.00",
      off: "38% OFF",
      reviews: 130,
      features: ["140W Max Output", "Smart Digital Display", "GaN Technology", "Multi-Device Charging"]
    }),
    "cat-6": p("cat-6", {
      title: "AETHER 733 Power Bank (PowerCore 10K, 65W)",
      price: "$29.99",
      mrp: "$59.99",
      off: "50% OFF",
      reviews: 88,
      features: ["65W Output", "10K Capacity", "Compact Size", "Dual USB-C Ports"]
    }),
    "cat-7": p("cat-7", {
      title: "AETHER Prime Charger (200W, 4 Ports, GaN)",
      price: "$99.99",
      mrp: "$149.99",
      off: "33% OFF",
      reviews: 64,
      features: ["200W Max Output", "4 Ports", "GaN Technology", "Laptop Charging"]
    }),
    "cat-8": p("cat-8", {
      title: "AETHER 621 Power Bank (PowerCore 5K, 12W)",
      price: "$19.99",
      mrp: "$34.99",
      off: "43% OFF",
      reviews: 52,
      features: ["5K Capacity", "12W Output", "Pocket Size", "Lightweight Design"]
    }),
    "cat-9": p("cat-9", {
      title: "AETHER MagGo Wireless Charging Station (Foldable 3-in-1)",
      price: "$89.99",
      mrp: "$109.99",
      off: "18% OFF",
      reviews: 210,
      features: ["3-in-1 Charging", "Foldable Design", "15W Wireless", "MagSafe Compatible"]
    }),
    "na-1": pNa(1, {
      title: "AETHER Nano Power Strip (10-in-1, 70W, Clamp)",
      price: "$69.99",
      mrp: "$89.99",
      off: "22% OFF"
    }),
    "na-2": pNa(2, {
      title: "AETHER Prime Power Bank (20K, 220W)",
      price: "$149.99",
      mrp: "$179.99",
      off: "17% OFF"
    }),
    "na-3": pNa(3, {
      title: "AETHER Nano Charger (45W, Smart Display, 180° Foldable)",
      price: "$29.99",
      mrp: "$39.99",
      off: "25% OFF"
    }),
    "na-4": pNa(4, {
      title: "AETHER Nano Docking Station (13-in-1, Triple Display)",
      price: "$149.99",
      mrp: "$199.99",
      off: "25% OFF"
    }),
    "na-5": pNa(5, {
      title: "AETHER MagGo Wireless Charging Station (Foldable 3-in-1)",
      price: "$89.99",
      mrp: "$109.99",
      off: "18% OFF"
    }),
    "na-6": pNa(6, {
      title: "AETHER 737 Power Bank (PowerCore 24K, 140W)",
      price: "$129.99",
      mrp: "$159.99",
      off: "19% OFF"
    }),
    "na-7": pNa(7, {
      title: "AETHER Prime 67W GaN Wall Charger (3 Ports)",
      price: "$59.99",
      mrp: "$79.99",
      off: "25% OFF"
    }),
    "na-8": pNa(8, {
      title: "AETHER 555 USB-C Hub (8-in-1)",
      price: "$79.99",
      mrp: "$99.99",
      off: "20% OFF"
    }),
    "bs-1": pBs(1, {
      title: "BANGE Roll Top Laptop Backpack 20L-30L",
      category: "Accessories",
      price: "₹ 2,890",
      mrp: "₹ 4,999",
      off: "42% OFF"
    }),
    "bs-2": pBs(2, {
      title: "SoundPEATS Gofree 2+ Wireless Open Ear Earbuds",
      category: "Audio",
      price: "₹ 3,290",
      mrp: "₹ 6,499",
      off: "49% OFF"
    }),
    "bs-3": pBs(3, {
      title: "DAREU A950 Pro 4K Tri Mode Wireless Gaming Mouse",
      category: "Accessories",
      price: "₹ 7,990",
      mrp: "₹ 9,999",
      off: "20% OFF"
    }),
    "bs-4": pBs(4, {
      title: "Anime Action Figures Bobblehead Toy",
      category: "Accessories",
      price: "₹ 349",
      mrp: "₹ 999",
      off: "65% OFF",
      rating: "4.0",
      reviews: 45
    }),
    "bs-5": pBs(5, {
      title: "AETHER Portable Power Bank 20K",
      price: "$79.99",
      mrp: "$99.99",
      off: "20% OFF"
    }),
    "bs-6": pBs(6, {
      title: "AETHER GaN Wall Charger 65W",
      price: "$49.99",
      mrp: "$69.99",
      off: "29% OFF"
    }),
    "bs-7": pBs(7, {
      title: "soundcore Liberty 4 NC Earbuds",
      category: "Audio",
      price: "₹ 7,999",
      mrp: "₹ 10,999",
      off: "27% OFF"
    }),
    "bs-8": pBs(8, {
      title: "AETHER MagGo Wireless Charging Station (Foldable 3-in-1)",
      price: "$89.99",
      mrp: "$109.99",
      off: "18% OFF"
    })
  };

  global.AET_PRODUCTS = products;
  global.AET_DEFAULT_PRODUCT_ID = "cat-5";

  global.AET_getProduct = function (id) {
    if (!id) return null;
    return products[String(id).toLowerCase()] || null;
  };

  global.AET_resolveProduct = function (id) {
    return global.AET_getProduct(id) || products[global.AET_DEFAULT_PRODUCT_ID];
  };

  global.AET_productUrl = function (id) {
    return "product.html?id=" + encodeURIComponent(id || global.AET_DEFAULT_PRODUCT_ID);
  };

  global.AET_imageToProductId = function (src) {
    if (!src) return null;
    var file = src.split("/").pop().replace(/\.(webp|png|jpe?g)$/i, "");
    return file.toLowerCase();
  };
})(typeof window !== "undefined" ? window : this);
