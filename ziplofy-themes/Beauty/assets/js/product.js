/* Swiss Beauty — product catalog, card navigation, and product page */

(function () {
  function saveText(price, mrp) {
    var off = Math.round(((mrp - price) / mrp) * 100);
    return "Save ₹" + (mrp - price) + " (" + off + "% off)";
  }

  var catalog = {
    "glow-up-makeup-fixer": {
      name: "Glow Up Makeup Fixer",
      image: "assets/img/BS-1.png",
      tagline: "Lock the Look",
      title:
        "Glow Up Makeup Fixer (100 ml) | Long-Lasting Setting Spray | Locks Makeup for 12+ Hours | Lightweight, Non-Sticky & Transfer-Proof | For All Skin Types",
      price: 369,
      mrp: 429,
      rating: 4.95,
      reviews: 22,
      saved: 12486,
      category: "Makeup Fixer & Setting Spray",
      bestsellerRank: 3,
      shades: "1 Shade",
      description:
        "Swiss Beauty Glow Up Makeup Fixer is a lightweight setting spray that locks your makeup in place for 12+ hours. The fine mist dries quickly without stickiness and helps prevent transfer.",
      reviewText:
        "Customers love how it sets makeup without cracking and the subtle glow it adds to the skin.",
      details: {
        highlights:
          "A non-sticky, hydrating makeup setting spray that locks your look for 12+ hours without cracking.",
        idealFor: [
          { type: "letter", value: "L", color: "#c8ebe0", label: "Long Wear" },
          { type: "icon", icon: "fa-solid fa-face-smile", color: "#f3e5f5", label: "All Skin Types" },
        ],
        longDescription:
          "Keeping your makeup fresh through heat, humidity, and long days is easier with a good setting spray. Swiss Beauty Glow Up Makeup Fixer forms a lightweight film over foundation, blush, and eye makeup to reduce transfer and fading. The fine mist sets quickly without leaving skin sticky or overly dewy. It works well for everyday office wear, events, and bridal touch-ups when you need your base to stay put. Shake well, hold the bottle at arm's length, and mist in a T-zone and outer-Z pattern for an even finish.",
        specs: {
          "Primary Concerns": "Makeup Longevity",
          "Skin Type": "All Skin Types",
          Speciality: "Non-Sticky, Transfer-Proof",
          "Active Ingredients": "Setting Polymers, Hydrating Agents",
          "Product Format": "Spray",
          "SPF Rating": "NA",
          "Product Type": "Makeup Fixer & Setting Spray",
          "Country of Origin": "India",
        },
        aboutBrand:
          "Swiss Beauty is a one-stop cosmetic brand for all your beauty needs, offering a wide range of makeup and skincare products for most skin types and skin tones. Known for trend-led innovations and affordable luxury, Swiss Beauty brings runway-inspired looks to everyday consumers across India.",
        bestBefore: "01 Feb 2028",
      },
    },
    "highlighting-primer": {
      name: "Highlighting Primer",
      image: "assets/img/BS-2.png",
      tagline: "Glass-Skin Finish",
      title:
        "Highlighting Primer (30 ml) | Illuminating Base | Smooths Skin & Boosts Radiance | Lightweight, Non-Greasy | For All Skin Types",
      price: 429,
      mrp: 499,
      rating: 4.78,
      reviews: 328,
      saved: 9821,
      category: "Face Primer",
      bestsellerRank: 5,
      shades: "3 Shades",
      description:
        "A luminous primer that blurs pores and preps skin for makeup while delivering a glass-skin glow that lasts all day.",
      reviewText: "Highly rated for its dewy finish and smooth application under foundation.",
    },
    "airbrush-foundation": {
      name: "Airbrush Foundation",
      image: "assets/img/BS-3.png",
      tagline: "With Hyaluronic Acid",
      title:
        "Airbrush Foundation (30 ml) | Buildable Medium-to-Full Coverage | Hydrating Formula with Hyaluronic Acid | Natural Matte Finish",
      price: 499,
      mrp: 529,
      rating: 4.9,
      reviews: 161,
      saved: 15420,
      category: "Foundation",
      bestsellerRank: 2,
      shades: "6 Shades",
      description:
        "Weightless foundation that blends like air for a flawless, second-skin finish with lasting hydration.",
      reviewText: "Users praise the breathable coverage and shade range for Indian skin tones.",
    },
    "perfect-liquid-concealer": {
      name: "Perfect Liquid Concealer",
      image: "assets/img/BS-4.png",
      tagline: "With Jojoba Oil",
      title:
        "Perfect Liquid Concealer (6 ml) | Full Coverage | Enriched with Jojoba Oil | Crease-Resistant & Blendable",
      price: 249,
      mrp: 299,
      rating: 4.82,
      reviews: 274,
      saved: 11204,
      category: "Concealer",
      bestsellerRank: 4,
      shades: "8 Shades",
      description:
        "High-coverage concealer that camouflages dark circles and blemishes while staying comfortable for all-day wear.",
      reviewText: "Popular for full coverage without looking cakey.",
    },
    "velvet-matte-lipstick": {
      name: "Velvet Matte Lipstick",
      image: "assets/img/BS-5.png",
      tagline: "Rich Matte Finish",
      title:
        "Velvet Matte Lipstick (4.2 g) | Highly Pigmented | Non-Drying Matte Finish | Long-Lasting Color",
      price: 349,
      mrp: 399,
      rating: 4.88,
      reviews: 156,
      saved: 8932,
      category: "Lipstick",
      bestsellerRank: 6,
      shades: "12 Shades",
      description:
        "Bold matte lipstick with a velvety texture that delivers rich color in one swipe.",
      reviewText: "Loved for pigment payoff and comfortable matte feel.",
    },
    "luminous-blush-stick": {
      name: "Luminous Blush Stick",
      image: "assets/img/BS-6.png",
      tagline: "Natural Flush",
      title:
        "Luminous Blush Stick (8 g) | Cream-to-Powder Formula | Buildable Natural Flush | Easy Stick Application",
      price: 299,
      mrp: 349,
      rating: 4.91,
      reviews: 89,
      saved: 6740,
      category: "Blush",
      bestsellerRank: 7,
      shades: "8 Shades",
      description:
        "Cream blush stick that blends seamlessly for a healthy, lit-from-within glow.",
      reviewText: "Fans love the blendability and natural finish on cheeks.",
    },
    "precision-kohl-kajal": {
      name: "Precision Kohl Kajal",
      image: "assets/img/BS-1.png",
      tagline: "Smudge-Resistant",
      title:
        "Precision Kohl Kajal (0.30 g) | Intense Black Pigment | Smudge-Resistant & Long-Wear | Ophthalmologist Tested",
      price: 199,
      mrp: 249,
      rating: 4.87,
      reviews: 412,
      saved: 14320,
      category: "Kajal",
      bestsellerRank: 1,
      shades: "2 Shades",
      description:
        "Ultra-black kohl that glides on smoothly and stays put through humidity and long days.",
      reviewText: "A bestseller for rich color and minimal smudging.",
    },
    "luminous-highlighter-stick": {
      name: "Luminous Highlighter Stick",
      image: "assets/img/BS-2.png",
      tagline: "Strobe Glow",
      title:
        "Luminous Highlighter Stick (9 g) | Buildable Glow | Cream Formula for Cheeks & Body | Multi-Use",
      price: 319,
      mrp: 379,
      rating: 4.85,
      reviews: 98,
      saved: 5210,
      category: "Highlighter",
      bestsellerRank: 9,
      shades: "4 Shades",
      description:
        "Cream highlighter stick for an instant strobing effect on high points of the face.",
      reviewText: "Reviewers highlight the easy application and radiant finish.",
    },
    "matte-pressed-powder": {
      name: "Matte Pressed Powder",
      image: "assets/img/BS-3.png",
      tagline: "Oil Control",
      title:
        "Matte Pressed Powder (9 g) | Oil-Absorbing | Blurs Pores & Sets Makeup | For Combination to Oily Skin",
      price: 279,
      mrp: 329,
      rating: 4.8,
      reviews: 203,
      saved: 7654,
      category: "Compact Powder",
      bestsellerRank: 8,
      shades: "5 Shades",
      description:
        "Finely milled pressed powder that mattifies shine and keeps makeup fresh for hours.",
      reviewText: "Praised for oil control without looking heavy.",
    },
    "gel-eyeliner-pencil": {
      name: "Gel Eyeliner Pencil",
      image: "assets/img/BS-4.png",
      tagline: "Waterproof",
      title:
        "Gel Eyeliner Pencil (1.2 g) | Waterproof & Smudge-Proof | Intense Color | Built-In Sharpener",
      price: 229,
      mrp: 279,
      rating: 4.83,
      reviews: 187,
      saved: 6120,
      category: "Eyeliner",
      bestsellerRank: 10,
      shades: "6 Shades",
      description:
        "Gel formula in a pencil for bold lines that resist water, sweat, and humidity.",
      reviewText: "Known for smooth application and lasting wear.",
    },
    "dewy-setting-mist": {
      name: "Dewy Setting Mist",
      image: "assets/img/BS-5.png",
      tagline: "Hydrating Mist",
      title:
        "Dewy Setting Mist (100 ml) | Hydrating Fine Mist | Sets Makeup & Adds Glow | Alcohol-Free",
      price: 349,
      mrp: 399,
      rating: 4.89,
      reviews: 76,
      saved: 4890,
      category: "Makeup Fixer & Setting Spray",
      bestsellerRank: 4,
      shades: "1 Shade",
      description:
        "Hydrating setting mist that locks makeup while leaving skin fresh and dewy.",
      reviewText: "Users enjoy the refreshing feel and natural glow.",
    },
    "cream-blush-palette": {
      name: "Cream Blush Palette",
      image: "assets/img/BS-6.png",
      tagline: "Multi-Shade",
      title:
        "Cream Blush Palette (12 g) | 4 Blendable Shades | Creamy Texture | For Cheeks & Eyes",
      price: 399,
      mrp: 459,
      rating: 4.86,
      reviews: 54,
      saved: 3210,
      category: "Blush",
      bestsellerRank: 12,
      shades: "4 Shades",
      description:
        "Versatile cream palette with four flattering shades for customizable cheek looks.",
      reviewText: "Appreciated for shade variety and creamy blendability.",
    },
    "nourishing-lip-oil": {
      name: "Nourishing Lip Oil",
      image: "assets/img/BS-1.png",
      tagline: "With Vitamin E",
      title:
        "Nourishing Lip Oil (5 ml) | Hydrating Glossy Finish | Enriched with Vitamin E | Non-Sticky",
      price: 249,
      mrp: 299,
      rating: 4.92,
      reviews: 131,
      saved: 5580,
      category: "Lip Care",
      bestsellerRank: 11,
      shades: "5 Shades",
      description:
        "Lightweight lip oil that nourishes dry lips while adding a glossy, healthy shine.",
      reviewText: "Loved for hydration and comfortable non-sticky feel.",
    },
    "awaken-eyeshadow-palette": {
      name: "Awaken Eyeshadow Palette",
      image: "assets/img/BS-5.png",
      tagline: "Awaken Your Look",
      title:
        "Awaken Eyeshadow Palette (12 g) | 12 Versatile Shades | Matte & Shimmer Finishes | Highly Blendable",
      price: 349,
      mrp: 399,
      rating: 4.95,
      reviews: 21,
      saved: 2840,
      category: "Eyeshadow",
      bestsellerRank: 15,
      shades: "2 Shades",
      description:
        "Curated eyeshadow palette with everyday neutrals and statement shimmers for day-to-night looks.",
      reviewText: "New launch with excellent blendability and pigment.",
    },
    "chrome-glow-stick": {
      name: "Chrome Glow Stick",
      image: "assets/img/BS-2.png",
      tagline: "Matte + Chrome",
      title:
        "Chrome Glow Stick (8 g) | Dual-Finish Highlighter | Matte & Chrome Effect | Multi-Use Stick",
      price: 299,
      mrp: 349,
      rating: 4.88,
      reviews: 64,
      saved: 4310,
      category: "Highlighter",
      bestsellerRank: 14,
      shades: "5 Shades",
      description:
        "Innovative glow stick that shifts between matte and chrome finishes for customizable radiance.",
      reviewText: "Trending for its unique chrome sheen and easy stick format.",
    },
    "multi-use-cream-stick": {
      name: "Multi-Use Cream Stick",
      image: "assets/img/BS-6.png",
      tagline: "Multi-use",
      title:
        "Multi-Use Cream Stick (10 g) | For Lips, Cheeks & Eyes | Creamy Blendable Formula",
      price: 319,
      mrp: 369,
      rating: 4.86,
      reviews: 47,
      saved: 3620,
      category: "Multi-Use",
      bestsellerRank: 13,
      shades: "4 Shades",
      description:
        "One-stick wonder for lips, cheeks, and eyes with a creamy, buildable formula.",
      reviewText: "Popular as a travel-friendly multi-purpose product.",
    },
    "pure-matte-lipstick": {
      name: "Pure Matte Lipstick",
      image: "assets/img/BS-2.png",
      tagline: "Non-drying",
      title:
        "Pure Matte Lipstick (4 g) | Non-Drying Matte | High Pigment | Comfortable All-Day Wear",
      price: 229,
      mrp: 279,
      rating: 4.91,
      reviews: 44,
      saved: 7120,
      category: "Lipstick",
      bestsellerRank: 6,
      shades: "30 Shades",
      description:
        "Pure matte lipstick that delivers bold color without drying out lips.",
      reviewText: "Rated highly for comfort and shade range.",
    },
    "liquid-highlighter": {
      name: "Liquid Highlighter",
      image: "assets/img/BS-3.png",
      tagline: "Long-Lasting",
      title:
        "Liquid Highlighter (20 ml) | Lightweight Liquid Glow | Mix with Foundation or Wear Alone",
      price: 299,
      mrp: 349,
      rating: 4.88,
      reviews: 64,
      saved: 4980,
      category: "Highlighter",
      bestsellerRank: 9,
      shades: "6 Shades",
      description:
        "Liquid highlighter for a long-lasting, buildable glow on skin or mixed with base products.",
      reviewText: "Fans love the luminous finish and versatility.",
    },
    "color-icon-eyeliner": {
      name: "Color Icon Eyeliner",
      image: "assets/img/BS-5.png",
      tagline: "Smudge-Proof",
      title:
        "Color Icon Eyeliner (1.2 g) | Smudge-Proof | Rich Color Payoff | Precision Tip",
      price: 199,
      mrp: 249,
      rating: 4.9,
      reviews: 118,
      saved: 8450,
      category: "Eyeliner",
      bestsellerRank: 5,
      shades: "12 Shades",
      description:
        "Iconic eyeliner with smudge-proof wear and vivid color in every stroke.",
      reviewText: "Trusted for precision and lasting definition.",
    },
  };

  function buildProductDetails(p) {
    var category = p.category || "Beauty";
    var highlightsMap = {
      "Makeup Fixer & Setting Spray":
        "A lightweight, non-sticky setting spray that locks makeup for 12+ hours without cracking.",
      Foundation:
        "A breathable, buildable foundation with a natural finish and hydrating skincare benefits.",
      Concealer:
        "A full-coverage liquid concealer that blends seamlessly and stays crease-resistant all day.",
      Lipstick: "A highly pigmented matte lipstick with a comfortable, non-drying velvet finish.",
      "Lip Care": "A nourishing lip oil that hydrates dry lips while adding a glossy, healthy shine.",
      Blush: "A creamy blush formula that blends easily for a natural, lit-from-within flush.",
      Highlighter: "A luminous formula that delivers a buildable glow on cheeks and high points.",
      Eyeshadow: "A versatile eyeshadow palette with blendable mattes and shimmers for day-to-night looks.",
      Eyeliner: "A smudge-resistant eyeliner with rich pigment and precision application.",
      Kajal: "An ultra-black kohl that glides smoothly and resists smudging through long wear.",
      "Face Primer": "An illuminating primer that smooths texture and boosts radiance under makeup.",
      "Compact Powder": "A finely milled powder that mattifies shine and sets makeup for hours.",
      "Multi-Use": "A multi-purpose cream stick for lips, cheeks, and eyes in one easy swipe.",
    };

    var idealMap = {
      "Makeup Fixer & Setting Spray": [
        { type: "letter", value: "L", color: "#c8ebe0", label: "Long Wear" },
        { type: "icon", icon: "fa-solid fa-face-smile", color: "#f3e5f5", label: "All Skin Types" },
      ],
      Foundation: [
        { type: "letter", value: "C", color: "#c8ebe0", label: "Full Coverage" },
        { type: "icon", icon: "fa-solid fa-droplet", color: "#ffe8cc", label: "Dry to Combo Skin" },
      ],
      Lipstick: [
        { type: "letter", value: "M", color: "#f8d7e3", label: "Matte Finish" },
        { type: "icon", icon: "fa-solid fa-heart", color: "#f3e5f5", label: "Daily Wear" },
      ],
      default: [
        { type: "letter", value: "S", color: "#c8ebe0", label: "Everyday Glam" },
        { type: "icon", icon: "fa-solid fa-star", color: "#fff3cd", label: "All Occasions" },
      ],
    };

    var specsBase = {
      "Primary Concerns": category === "Foundation" ? "Even Skin Tone" : "Makeup Finish",
      "Skin Type": "All Skin Types",
      Speciality: p.tagline || "Long-Lasting",
      "Active Ingredients": "Skin-Friendly Formula",
      "Product Format":
        category.indexOf("Spray") !== -1 || category.indexOf("Mist") !== -1
          ? "Spray"
          : category.indexOf("Stick") !== -1
            ? "Stick"
            : category.indexOf("Palette") !== -1
              ? "Palette"
              : "Liquid",
      "Product Type": category,
      "Country of Origin": "India",
    };

    if (category === "Makeup Fixer & Setting Spray") {
      specsBase["SPF Rating"] = "NA";
      specsBase["Primary Concerns"] = "Makeup Longevity";
      specsBase.Speciality = "Non-Sticky, Transfer-Proof";
      specsBase["Active Ingredients"] = "Setting Polymers, Hydrating Agents";
    }

    if (category === "Lipstick" || category === "Lip Care") {
      specsBase["Product Format"] = category === "Lip Care" ? "Oil" : "Stick";
      specsBase["Primary Concerns"] = "Dry Lips, Color Payoff";
    }

    return {
      highlights:
        highlightsMap[category] ||
        "A high-performance Swiss Beauty formula designed for everyday and occasion-ready looks.",
      idealFor: idealMap[category] || idealMap.default,
      longDescription:
        p.description +
        " Formulated by Swiss Beauty for Indian skin tones and weather, this product is dermatologically tested and suitable for regular use. The texture blends easily, layers well with the rest of your makeup routine, and helps you achieve a polished, salon-like finish at home. For best results, prep your skin with moisturizer and primer, apply as directed, and set with powder or setting spray where needed.",
      specs: specsBase,
      aboutBrand:
        "Swiss Beauty is a one-stop cosmetic brand for all your beauty needs, offering a wide range of makeup and skincare products for most skin types and skin tones. Known for trend-led innovations and affordable luxury, Swiss Beauty brings runway-inspired looks to everyday consumers across India.",
      bestBefore: "01 Feb 2028",
    };
  }

  Object.keys(catalog).forEach(function (id) {
    var p = catalog[id];
    p.id = id;
    p.save = saveText(p.price, p.mrp);
    p.images = [
      p.image,
      "assets/img/BS-1.png",
      "assets/img/BS-2.png",
      "assets/img/BS-3.png",
      "assets/img/BS-4.png",
    ];
    p.details = p.details || buildProductDetails(p);
  });

  window.SB_PRODUCTS = catalog;
  window.SB_DEFAULT_PRODUCT_ID = "glow-up-makeup-fixer";

  window.SB_getProductById = function (id) {
    if (id && catalog[id]) return catalog[id];
    return catalog[window.SB_DEFAULT_PRODUCT_ID];
  };

  window.SB_getProductIdByName = function (name) {
    var key = Object.keys(catalog).find(function (id) {
      return catalog[id].name === name;
    });
    return key || null;
  };
})();

(function () {
  function productUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function getCardProductId(card) {
    var preset = card.getAttribute("data-product-id");
    if (preset) return preset;

    var nameEl = card.querySelector(".sb-bs-card__name");
    if (!nameEl || !window.SB_getProductIdByName) return null;

    return window.SB_getProductIdByName(nameEl.textContent.trim());
  }

  function initCardLinks() {
    if (!window.SB_PRODUCTS) return;

    document.querySelectorAll(".sb-bs-card, .sb-shop-card").forEach(function (card) {
      var id = getCardProductId(card);
      if (!id) return;

      card.setAttribute("data-product-id", id);
      card.classList.add("sb-bs-card--clickable");

      var link = card.querySelector("a.sb-shop-card__link, a.sb-pdp-ymal__card-link");
      if (link) {
        link.href = productUrl(id);
      }
    });
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.target.closest("button")) return;

      var card = e.target.closest(".sb-bs-card, .sb-shop-card");
      if (!card) return;

      var id = getCardProductId(card);
      if (!id) return;

      try {
        sessionStorage.setItem("sb-product-id", id);
      } catch (err) {
        /* ignore storage errors */
      }

      var link = e.target.closest("a.sb-shop-card__link, a.sb-pdp-ymal__card-link");
      if (link) {
        link.href = productUrl(id);
        return;
      }

      e.preventDefault();
      window.location.href = productUrl(id);
    },
    true
  );

  function bootCardLinks() {
    initCardLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCardLinks);
  } else {
    bootCardLinks();
  }
})();

(function () {
  function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = (params.get("id") || "").trim();

    if (id && window.SB_PRODUCTS && window.SB_PRODUCTS[id]) {
      return id;
    }

    try {
      var stored = sessionStorage.getItem("sb-product-id");
      if (stored && window.SB_PRODUCTS && window.SB_PRODUCTS[stored]) {
        return stored;
      }
    } catch (err) {
      /* ignore storage errors */
    }

    return window.SB_DEFAULT_PRODUCT_ID;
  }

  function initThumbs() {
    var mainImg = document.getElementById("sb-pdp-main-img");
    var thumbs = document.querySelectorAll("[data-sb-pdp-thumb]");

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-src");
        if (!src || !mainImg) return;

        mainImg.src = src;
        thumbs.forEach(function (t) {
          t.classList.remove("sb-pdp__thumb--active");
          t.setAttribute("aria-selected", "false");
        });
        thumb.classList.add("sb-pdp__thumb--active");
        thumb.setAttribute("aria-selected", "true");
      });
    });
  }

  function renderThumbs(product) {
    var thumbsRoot = document.querySelector("[data-sb-pdp-thumbs]");
    var mainImg = document.getElementById("sb-pdp-main-img");
    if (!thumbsRoot || !mainImg) return;

    thumbsRoot.innerHTML = "";
    product.images.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "sb-pdp__thumb" + (index === 0 ? " sb-pdp__thumb--active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", "sb-pdp-main-img");
      btn.setAttribute("data-sb-pdp-thumb", "");
      btn.setAttribute("data-src", src);

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.width = 64;
      img.height = 64;
      img.decoding = "async";
      btn.appendChild(img);
      thumbsRoot.appendChild(btn);
    });

    mainImg.src = product.image;
    mainImg.alt = product.name;
    initThumbs();
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  function renderProduct(product) {
    document.title = product.name + " — Swiss Beauty";

    setText("[data-sb-pdp-breadcrumb]", product.name);
    setText("[data-sb-pdp-brand]", "Swiss Beauty");
    setText("[data-sb-pdp-title]", product.title);
    setText("[data-sb-pdp-price]", "₹" + product.price);
    setText("[data-sb-pdp-mrp]", "₹" + product.mrp);
    setText("[data-sb-pdp-save]", product.save);
    setText("[data-sb-pdp-rating]", product.rating);
    setText("[data-sb-pdp-ratings-count]", product.reviews + " Ratings");
    setText("[data-sb-pdp-saved]", product.saved.toLocaleString("en-IN") + " people saved");
    setText(
      "[data-sb-pdp-bestseller-badge]",
      "#" + product.bestsellerRank + " Best Seller"
    );
    setText("[data-sb-pdp-bestseller-text]", "In " + product.category);
    setText("[data-sb-pdp-buybar-name]", product.name + "…");
    var buybarPrice = document.querySelector("[data-sb-pdp-buybar-price]");
    if (buybarPrice) {
      buybarPrice.innerHTML =
        "₹" + product.price + " <s>₹" + product.mrp + "</s> " + product.save;
    }

    var ratingBadge = document.querySelector("[data-sb-pdp-rating-badge]");
    if (ratingBadge) {
      ratingBadge.setAttribute(
        "aria-label",
        "Rating " + product.rating + " out of 5 from " + product.reviews + " reviews"
      );
    }

    document.querySelectorAll("[data-sb-pdp-buybar-img]").forEach(function (img) {
      img.src = product.image;
      img.alt = product.name;
    });

    renderThumbs(product);
  }

  function bootProductPage() {
    var hasPdp = document.querySelector("[data-sb-pdp-title]");

    if (!hasPdp) return;

    if (!window.SB_getProductById) {
      initThumbs();
      return;
    }

    var productId = getProductIdFromUrl();
    var product = window.SB_getProductById(productId);
    renderProduct(product);

    try {
      sessionStorage.setItem("sb-product-id", productId);
    } catch (err) {
      /* ignore storage errors */
    }
  }

  function updatePdpAccordionIcon(btn, isOpen) {
    var icon = btn.querySelector("i");
    if (!icon) return;

    if (btn.classList.contains("sb-pdp__accordion-toggle--brand")) {
      icon.className = isOpen ? "fa-solid fa-minus" : "fa-solid fa-plus";
      return;
    }

    icon.className = isOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
  }

  function setPdpAccordionOpen(accordion, btn, panel, isOpen) {
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    accordion.classList.toggle("is-open", isOpen);

    if (isOpen) {
      panel.removeAttribute("hidden");
      panel.hidden = false;
    } else {
      panel.setAttribute("hidden", "");
      panel.hidden = true;
    }

    updatePdpAccordionIcon(btn, isOpen);
  }

  function initPdpAccordions() {
    var root = document.querySelector(".sb-pdp__accordions");
    if (!root) return;

    root.querySelectorAll(".sb-pdp__accordion").forEach(function (accordion) {
      var btn = accordion.querySelector("[data-sb-accordion-toggle]");
      if (!btn) return;

      var panelId = btn.getAttribute("aria-controls");
      var panel = panelId
        ? document.getElementById(panelId)
        : accordion.querySelector(".sb-pdp__accordion-panel");
      if (!panel) return;

      setPdpAccordionOpen(
        accordion,
        btn,
        panel,
        btn.getAttribute("aria-expanded") === "true"
      );

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        setPdpAccordionOpen(accordion, btn, panel, !isOpen);
      });
    });
  }

  function initPdpScrollTop() {
    var scrollTopBtn = document.querySelector("[data-sb-scroll-top]");
    if (!scrollTopBtn) return;

    window.addEventListener(
      "scroll",
      function () {
        scrollTopBtn.hidden = window.scrollY < 400;
      },
      { passive: true }
    );

    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function bootPdpUi() {
    bootProductPage();
    initPdpAccordions();
    initPdpScrollTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPdpUi);
  } else {
    bootPdpUi();
  }
})();
