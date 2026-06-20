(function (global) {
  "use strict";

  function phrFormatPrice(amount) {
    var hasFraction = Math.round(amount * 100) % 100 !== 0;
    return "₹" + amount.toLocaleString("en-IN", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  function phrProduct(id, name, brand, image, price, mrp, extra) {
    extra = extra || {};
    return {
      id: id,
      name: name,
      brand: brand,
      image: image,
      price: price,
      mrp: mrp,
      discount: extra.discount != null ? extra.discount : Math.round((1 - price / mrp) * 100),
      tag: extra.tag || "Wellness",
      category: extra.category || "Wellness",
      subcategory: extra.subcategory || "General",
      description: extra.description || (
        name + " is available on VitalRx with fast doorstep delivery. " +
        "100% authentic products sourced from licensed distributors."
      )
    };
  }

  var PHR_PRODUCTS = {
    "protinex-original-1kg": phrProduct(
      "protinex-original-1kg",
      "Protinex Powder - Original Flavour 1 kg",
      "Protinex",
      "assets/img/product-1.avif",
      1022.4,
      1420,
      {
        tag: "Protein Drink",
        subcategory: "Protein Drink",
        description:
          "Protinex is a high protein nutritional supplement for adults that helps build strength, supports " +
          "immunity and helps you stay active. It contains hydrolysed protein that is easily digested and absorbed."
      }
    ),
    "horlicks-diabetes-plus": phrProduct(
      "horlicks-diabetes-plus",
      "Horlicks Diabetes Plus Vanilla Flavour 400 g",
      "Horlicks",
      "assets/img/product-2.avif",
      546,
      675,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "threptin-lite-275g": phrProduct(
      "threptin-lite-275g",
      "Threptin Lite High Protein Diskettes 275 g",
      "Threptin",
      "assets/img/product-3.avif",
      445.65,
      555,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "ensure-diabetes-care": phrProduct(
      "ensure-diabetes-care",
      "Ensure Diabetes Care Powder - Vanilla Flavour 400 g",
      "Ensure",
      "assets/img/product-4.avif",
      1664.7,
      1980,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "pediasure-premium": phrProduct(
      "pediasure-premium",
      "Pediasure Premium Chocolate Refill Pack 400 g",
      "Pediasure",
      "assets/img/product-5.avif",
      1249.5,
      1470,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "boost-health": phrProduct(
      "boost-health",
      "Boost Health & Nutrition Drink 500 g",
      "Boost",
      "assets/img/product-6.avif",
      389.25,
      465,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "muscleblaze-biozyme": phrProduct(
      "muscleblaze-biozyme",
      "MuscleBlaze Biozyme Whey Protein 1 kg",
      "MuscleBlaze",
      "assets/img/product-7.avif",
      2499,
      3199,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "neuromet-plus": phrProduct(
      "neuromet-plus",
      "Neuromet Plus Vanilla Flavour 200 g",
      "Neuromet",
      "assets/img/product-8.avif",
      312,
      390,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "pediasure-7plus": phrProduct(
      "pediasure-7plus",
      "Abbott Pediasure 7 Plus Refill Pack 400 g",
      "Pediasure",
      "assets/img/product-9.avif",
      1089,
      1290,
      { tag: "Protein Drink", subcategory: "Protein Drink", discount: 16 }
    ),
    "resource-protein": phrProduct(
      "resource-protein",
      "Resource High Protein Powder 400 g",
      "Resource",
      "assets/img/product-10.avif",
      876.5,
      1050,
      { tag: "Protein Drink", subcategory: "Protein Drink", discount: 17 }
    ),
    "prohance-hp-500g": phrProduct(
      "prohance-hp-500g",
      "Prohance HP High Protein Powder Vanilla 500 g",
      "Prohance",
      "assets/img/product-11.avif",
      1755,
      2100,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "pediagold-chocolate": phrProduct(
      "pediagold-chocolate",
      "PediaGold - Chocolate 400 g",
      "Pedia Gold",
      "assets/img/product-5.avif",
      835.05,
      879,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "protinex-vanilla-1kg": phrProduct(
      "protinex-vanilla-1kg",
      "Protinex Powder - Creamy Vanilla Flavour 1 kg",
      "Protinex",
      "assets/img/product-7.avif",
      1059.22,
      1440,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "protinex-original-400g": phrProduct(
      "protinex-original-400g",
      "Protinex Powder - Original Flavour 400 g",
      "Protinex",
      "assets/img/product-1.avif",
      1022.4,
      1420,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "protinex-original-275g": phrProduct(
      "protinex-original-275g",
      "Protinex Powder - Original Flavour 275 g",
      "Protinex",
      "assets/img/product-1.avif",
      445.65,
      555,
      { tag: "Protein Drink", subcategory: "Protein Drink" }
    ),
    "ketocip-shampoo": phrProduct(
      "ketocip-shampoo",
      "Ketocip 2% Bottle Of 100Ml Shampoo",
      "Ketocip",
      "assets/img/WE-1.webp",
      236,
      347,
      { tag: "Personal Care", category: "Wellness", subcategory: "Hair Care" }
    ),
    "rivela-sunscreen": phrProduct(
      "rivela-sunscreen",
      "Rivela Lite Spf 50 Pa++++ Sunscreen Cream 60 G",
      "Rivela",
      "assets/img/WE-2.webp",
      1092,
      1174,
      { tag: "Skin Care", category: "Wellness", subcategory: "Sun Care" }
    ),
    "aptivate-syrup": phrProduct(
      "aptivate-syrup",
      "Aptivate Pineapple Appetite Stimulating Syrup",
      "Aptivate",
      "assets/img/WE-3.webp",
      272,
      340,
      { tag: "Wellness", category: "Wellness", subcategory: "General" }
    ),
    "enterogermina": phrProduct(
      "enterogermina",
      "Enterogermina Suspension 10 X 5 Ml",
      "Enterogermina",
      "assets/img/WE-4.webp",
      756,
      821,
      { tag: "Medicine", category: "Medicine", subcategory: "Digestive Care" }
    ),
    "wellman-multivitamin": phrProduct(
      "wellman-multivitamin",
      "Wellman Multivitamin 50+ Tablets Support Reduction",
      "Wellman",
      "assets/img/WE-5.webp",
      678,
      729,
      { tag: "Vitamins", category: "Wellness", subcategory: "Multivitamins" }
    ),
    "himcolin-gel": phrProduct(
      "himcolin-gel",
      "Himalaya Himcolin Gel | For Men | 30 Gm",
      "Himalaya",
      "assets/img/WE-6.webp",
      277,
      304,
      { tag: "Wellness", category: "Wellness", subcategory: "Personal Care" }
    ),
    "biluma-cream": phrProduct(
      "biluma-cream",
      "Biluma Cream 15Gm",
      "Biluma",
      "assets/img/WE-7.webp",
      651,
      739,
      { tag: "Skin Care", category: "Wellness", subcategory: "Skin Care" }
    ),
    "diataal-cal": phrProduct(
      "diataal-cal",
      "Diataal Cal | Calcium For Men & Women | Clinically Tested",
      "Diataal",
      "assets/img/WE-8.webp",
      74,
      88,
      { tag: "Vitamins", category: "Wellness", subcategory: "Calcium" }
    ),
    "revital-h": phrProduct(
      "revital-h",
      "Revital H Capsule For Daily Health 30's",
      "Revital",
      "assets/img/WE-9.webp",
      279,
      310,
      { tag: "Vitamins", category: "Wellness", subcategory: "Multivitamins" }
    ),
    "neurobion-forte": phrProduct(
      "neurobion-forte",
      "Neurobion Forte Tablet 30's",
      "Neurobion",
      "assets/img/WE-10.webp",
      36,
      42,
      { tag: "Vitamins", category: "Wellness", subcategory: "Multivitamins" }
    ),
    "paracip-650": phrProduct(
      "paracip-650",
      "PARACIP 650mg Tablet 10's (se)",
      "PARACIP",
      "assets/img/LD-1.avif",
      6.3,
      21,
      { tag: "Medicine", category: "Medicine", subcategory: "Pain Relief", discount: 70 }
    ),
    "roko-2mg": phrProduct(
      "roko-2mg",
      "ROKO 2mg Capsule 10's (se)",
      "ROKO",
      "assets/img/LD-2.avif",
      7.17,
      23.89,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 70 }
    ),
    "omnacortil-5mg": phrProduct(
      "omnacortil-5mg",
      "OMNACORTIL 5mg Tablet 10's",
      "OMNACORTIL",
      "assets/img/LD-3.avif",
      3.26,
      6.51,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 50 }
    ),
    "niftas-tablet": phrProduct(
      "niftas-tablet",
      "NIFTAS Tablet 14's (se)",
      "NIFTAS",
      "assets/img/LD-4.avif",
      83.42,
      119.17,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 30 }
    ),
    "p-250-suspension": phrProduct(
      "p-250-suspension",
      "P 250mg Suspension 60ml",
      "P",
      "assets/img/LD-5.avif",
      12.66,
      42.21,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 70 }
    ),
    "nozcalm-inhaler": phrProduct(
      "nozcalm-inhaler",
      "Nozcalm Nasal Inhaler 0.5 ml (se)",
      "Nozcalm",
      "assets/img/LD-6.avif",
      46.88,
      46.88,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 0 }
    ),
    "pregeb-m-75": phrProduct(
      "pregeb-m-75",
      "PREGEB M 75 Capsule 15's (se)",
      "PREGEB",
      "assets/img/LD-7.avif",
      214.59,
      306.56,
      { tag: "Medicine", category: "Medicine", subcategory: "General", discount: 30 }
    )
  };

  var PHR_DEFAULT_PRODUCT_ID = "protinex-original-1kg";

  function phrGetProduct(id) {
    return PHR_PRODUCTS[id] || PHR_PRODUCTS[PHR_DEFAULT_PRODUCT_ID];
  }

  function phrGetProductUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function phrTruncateText(text, max) {
    if (!text || text.length <= max) return text;
    return text.slice(0, max - 3) + "...";
  }

  function phrBindProductCards() {
    document.querySelectorAll("[data-phr-product-id]").forEach(function (card) {
      var id = card.getAttribute("data-phr-product-id");
      if (!id || !PHR_PRODUCTS[id]) return;

      var url = phrGetProductUrl(id);

      card.querySelectorAll('a[href*="product.html"]').forEach(function (link) {
        link.href = url;
      });

      if (card.tagName === "A") {
        card.href = url;
        return;
      }

      if (card.dataset.phrProductBound === "true") return;
      card.dataset.phrProductBound = "true";
      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {
        if (event.target.closest("button")) return;
        window.location.href = url;
      });

      card.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.target.closest("button")) return;
        event.preventDefault();
        window.location.href = url;
      });
    });
  }

  global.PHR_PRODUCTS = PHR_PRODUCTS;
  global.PHR_DEFAULT_PRODUCT_ID = PHR_DEFAULT_PRODUCT_ID;
  global.phrGetProduct = phrGetProduct;
  global.phrGetProductUrl = phrGetProductUrl;
  global.phrFormatPrice = phrFormatPrice;
  global.phrTruncateText = phrTruncateText;
  global.phrBindProductCards = phrBindProductCards;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", phrBindProductCards);
  } else {
    phrBindProductCards();
  }
})(window);
