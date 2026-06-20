/**
 * Avyra Jewels — shared product catalog (used by PDP + product cards)
 */
(function (global) {
  "use strict";

  var PRODUCTS = {
    1: {
      id: 1,
      img: "assets/img/category-1.jpg",
      lifestyle: "assets/img/category-2.png",
      name: "Twilight Flare Diamond Band",
      price: "₹1,16,962",
      sku: "AVY-DIA-001",
      desc: "Set in 18 KT Yellow Gold with diamonds (0.48 ct, FG-SI)",
    },
    2: {
      id: 2,
      img: "assets/img/category-2.png",
      lifestyle: "assets/img/category-1.jpg",
      name: "Twisted Beam Gold Drop Earrings",
      price: "₹70,492",
      priceWas: "₹77,214",
      sku: "AVY-GLD-002",
      desc: "Set in 22 KT Yellow Gold(4.120 g) with diamonds (0.22 ct, FG-SI)",
    },
    3: {
      id: 3,
      img: "assets/img/category-3.png",
      lifestyle: "assets/img/category-4.jpg",
      name: "Refined Shine Diamond Ring",
      price: "₹58,596",
      sku: "AVY-DIA-003",
      desc: "Set in 18 KT Yellow Gold(2.850 g) with diamonds (0.38 ct, FG-SI)",
    },
    4: {
      id: 4,
      img: "assets/img/category-4.jpg",
      lifestyle: "assets/img/category-3.png",
      name: "Euphoria Wave 22Kt Gold Nosepin",
      price: "₹44,672",
      sku: "AVY-22KT-004",
      desc: "Set in 22 KT Yellow Gold(1.120 g)",
    },
    5: {
      id: 5,
      img: "assets/img/category-5.png",
      lifestyle: "assets/img/category-6.png",
      name: "Radiant Bloom 22Kt Gold Pendant",
      price: "₹52,990",
      priceWas: "₹58,880",
      sku: "AVY-22KT-005",
      desc: "Set in 22 KT Yellow Gold(2.410 g) with diamonds (0.12 ct, FG-SI)",
    },
    6: {
      id: 6,
      img: "assets/img/category-6.png",
      lifestyle: "assets/img/category-5.png",
      name: "Graceful Link 22Kt Gold Chain",
      price: "₹61,250",
      sku: "AVY-22KT-006",
      desc: "Set in 22 KT Yellow Gold(8.640 g)",
    },
    7: {
      id: 7,
      img: "assets/img/category-7.png",
      lifestyle: "assets/img/category-8.png",
      name: "Lustre Drop 22Kt Gold Earrings",
      price: "₹38,420",
      priceWas: "₹42,690",
      sku: "AVY-22KT-007",
      desc: "Set in 22 KT Yellow Gold(3.920 g)",
    },
    8: {
      id: 8,
      img: "assets/img/category-8.png",
      lifestyle: "assets/img/category-7.png",
      name: "Heritage Knot 22Kt Gold Bangle",
      price: "₹72,180",
      sku: "AVY-22KT-008",
      desc: "Set in 22 KT Yellow Gold(15.200 g)",
    },
    9: {
      id: 9,
      img: "assets/img/category-9.png",
      lifestyle: "assets/img/NA-1.png",
      name: "Alor Gold Stud Earrings",
      price: "₹29,850",
      sku: "AVY-22KT-009",
      desc: "Set in 22 KT Yellow Gold(2.180 g)",
    },
    10: {
      id: 10,
      img: "assets/img/category-10.png",
      lifestyle: "assets/img/NA-2.png",
      name: "Louzo 22Kt Yellow Gold Chain Bracelet",
      price: "₹28,120",
      priceWas: "₹31,500",
      sku: "AVY-22KT-010",
      desc: "Set in 22 KT Yellow Gold(3.450 g)",
    },
    11: {
      id: 11,
      img: "assets/img/category-11.jpg",
      lifestyle: "assets/img/NA-3.png",
      name: "Boghh 22Kt Butterfly Design Gold Bracelet",
      price: "₹47,855",
      sku: "AVY-22KT-011",
      desc: "Set in 22 KT Yellow Gold(5.820 g)",
    },
    12: {
      id: 12,
      img: "assets/img/category-12.png",
      lifestyle: "assets/img/NA-4.png",
      name: "Classic Weave Blooma 22KT Gold Ring",
      price: "₹85,472",
      priceWas: "₹92,100",
      sku: "AVY-22KT-012",
      desc: "Set in 22 KT Yellow Gold with diamonds (0.42 ct, FG-SI)",
    },
  };

  function getProduct(id) {
    return PRODUCTS[id] || PRODUCTS[1];
  }

  function getProductUrl(id) {
    return "product.html?id=" + id;
  }

  function findProductIdByName(name) {
    if (!name) return null;
    var key = name.trim().toLowerCase();
    var found = null;
    Object.keys(PRODUCTS).some(function (id) {
      var catalogName = PRODUCTS[id].name.trim().toLowerCase();
      if (catalogName === key || key.indexOf(catalogName) !== -1 || catalogName.indexOf(key) !== -1) {
        found = parseInt(id, 10);
        return true;
      }
      return false;
    });
    return found;
  }

  global.AVYRA_PRODUCTS = PRODUCTS;
  global.getAvyraProduct = getProduct;
  global.getAvyraProductUrl = getProductUrl;
  global.findAvyraProductIdByName = findProductIdByName;
})(typeof window !== "undefined" ? window : this);
