/**
 * Car Accessories — product catalog, card links, and product detail page
 */
(function (global) {
  "use strict";

  /* -------------------------------------------------------------------------- */
  /* Catalog                                                                    */
  /* -------------------------------------------------------------------------- */

  function createProductEntry(id, opts) {
    return {
      id: id,
      title: opts.title,
      shortTitle: opts.shortTitle || opts.title,
      subtitle: opts.subtitle || "",
      category: opts.category || "CAR ACCESSORIES",
      categoryLabel: opts.categoryLabel || "All products",
      image: opts.image,
      images: opts.images || [opts.image],
      price: opts.price,
      pricePrefix: opts.pricePrefix || "",
      mrp: opts.mrp,
      emi: opts.emi || "",
      rating: opts.rating != null ? opts.rating : 4.9,
      reviews: opts.reviews != null ? opts.reviews : 49,
      cta: opts.cta || "Add to cart",
      couponPrice: opts.couponPrice,
      description: opts.description || "",
      descProduct: opts.descProduct || opts.shortTitle || opts.title,
      descImage: opts.descImage || opts.image
    };
  }

  var catalog = [
    createProductEntry("blaupunkt-palm-bay", {
      title: 'Blaupunkt Palm Bay 1000 - 9" || Car Audio System',
      shortTitle: "Blaupunkt Palm Bay 1000",
      subtitle: "Premium 9-inch Android car stereo with touchscreen display, Bluetooth, USB, and powerful audio output.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/MS-1.png",
      images: ["assets/img/MS-1.png", "assets/img/promo-1.png"],
      price: 14399,
      pricePrefix: "From ",
      mrp: 18990,
      emi: "₹4799/Month",
      cta: "Choose options",
      couponPrice: 12758.85,
      description:
        "Upgrade your in-car entertainment with the Blaupunkt Palm Bay 1000 — a premium 9-inch Android car audio system built for seamless navigation, streaming, and hands-free calling.",
      descProduct: "BLAUPUNKT® Palm Bay 1000 Car Audio System",
      descImage: "assets/img/MS-1.png"
    }),
    createProductEntry("blaupunkt-key-largo", {
      title: "Blaupunkt Key Largo 1010 Car Android Stereo || 9 inch",
      shortTitle: "Blaupunkt Key Largo 1010",
      subtitle: "Android auto stereo with wireless connectivity and high-resolution display for modern cars.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/Ms-2.png",
      images: ["assets/img/Ms-2.png", "assets/img/promo-2.png"],
      price: 13999,
      mrp: 15990,
      emi: "₹4666/Month",
      couponPrice: 13299.05,
      description:
        "The Blaupunkt Key Largo 1010 delivers smooth Android performance, CarPlay support, and crisp audio for daily drives.",
      descProduct: "BLAUPUNKT® Key Largo 1010",
      descImage: "assets/img/Ms-2.png"
    }),
    createProductEntry("ottocast-picasou", {
      title: "Ottocast Picasou 3 Carplay Ai Box Android Car Adapter || SIM Support",
      shortTitle: "Ottocast Picasou 3",
      subtitle: "Wireless CarPlay and Android Auto adapter with SIM support for connected driving.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/MS-3.png",
      images: ["assets/img/MS-3.png", "assets/img/promo-3.png"],
      price: 19999.99,
      mrp: 41999,
      emi: "₹6666/Month",
      couponPrice: 18999.99,
      description:
        "Transform your factory screen with Ottocast Picasou 3 — stream apps, navigation, and music wirelessly with minimal installation.",
      descProduct: "OTTOCAST® Picasou 3",
      descImage: "assets/img/MS-3.png"
    }),
    createProductEntry("ottocast-mini", {
      title: "Ottocast Mini Wireless Carplay/Android Auto Adapter",
      shortTitle: "Ottocast Mini Wireless Adapter",
      subtitle: "Compact wireless adapter for instant CarPlay and Android Auto connectivity.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/MS-4.png",
      images: ["assets/img/MS-4.png", "assets/img/promo-4.png"],
      price: 2999,
      mrp: 5999,
      emi: "₹1000/Month",
      couponPrice: 2849.05,
      description:
        "Plug-and-play wireless CarPlay adapter — ideal for cars without factory wireless support.",
      descProduct: "OTTOCAST® Mini Adapter",
      descImage: "assets/img/MS-4.png"
    }),
    createProductEntry("sony-xav-ax5500", {
      title: 'Sony XAV-AX5500 7" Bluetooth Car Stereo with CarPlay',
      shortTitle: "Sony XAV-AX5500",
      subtitle: "Trusted Sony quality with Bluetooth, USB, and Apple CarPlay integration.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/MS-5.png",
      images: ["assets/img/MS-5.png", "assets/img/promo-5.png"],
      price: 24999,
      mrp: 32990,
      emi: "₹8333/Month",
      couponPrice: 23749.05,
      description:
        "Sony XAV-AX5500 offers reliable performance, clear sound, and seamless smartphone integration.",
      descProduct: "SONY® XAV-AX5500",
      descImage: "assets/img/MS-5.png"
    }),
    createProductEntry("pioneer-dmh", {
      title: 'Pioneer DMH-ZF9590BT 9" Wireless Android Auto Head Unit',
      shortTitle: "Pioneer DMH-ZF9590BT",
      subtitle: "Large touchscreen head unit with wireless Android Auto and premium audio.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/promo-6.png"],
      price: 34499,
      mrp: 44990,
      emi: "₹11499/Month",
      couponPrice: 32774.05,
      description:
        "Pioneer DMH-ZF9590BT combines a vibrant display with wireless connectivity for a premium cockpit upgrade.",
      descProduct: "PIONEER® DMH-ZF9590BT",
      descImage: "assets/img/BS-3.png"
    }),
    createProductEntry("jbl-stage-a6004", {
      title: "JBL Stage A6004 4-Channel Car Audio Amplifier 600W",
      shortTitle: "JBL Stage A6004 Amplifier",
      subtitle: "Powerful 4-channel amplifier for enhanced bass and clarity in your car audio setup.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/promo-7.png"],
      price: 8999,
      mrp: 12499,
      emi: "₹2999/Month",
      couponPrice: 8549.05,
      description:
        "Boost your sound system with the JBL Stage A6004 — clean power delivery for speakers and subwoofers.",
      descProduct: "JBL® Stage A6004",
      descImage: "assets/img/BS-1.png"
    }),
    createProductEntry("kenwood-kmm-bt328u", {
      title: "Kenwood KMM-BT328U Bluetooth USB Media Receiver",
      shortTitle: "Kenwood KMM-BT328U",
      subtitle: "Reliable media receiver with Bluetooth streaming and USB playback.",
      category: "MUSIC SYSTEM",
      categoryLabel: "Music System",
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/cat-5.webp"],
      price: 6499,
      mrp: 8990,
      emi: "₹2166/Month",
      couponPrice: 6174.05,
      description:
        "Kenwood KMM-BT328U is a budget-friendly upgrade for clear calls, music, and hands-free control.",
      descProduct: "KENWOOD® KMM-BT328U",
      descImage: "assets/img/BS-2.png"
    }),
    createProductEntry("mahindra-scorpio-fog", {
      title: "Mahindra Scorpio-N Fog Lamp with DRL Light",
      shortTitle: "Mahindra Scorpio-N Fog Lamp",
      subtitle: "OEM-style fog lamps with DRL for enhanced visibility and style.",
      category: "EXTERIOR ACCESSORIES",
      categoryLabel: "Best Sellers",
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/cat-1.webp"],
      price: 16499,
      mrp: 24749,
      emi: "₹5499/Month",
      couponPrice: 15674.05,
      description:
        "Upgrade your Scorpio-N with premium fog lamps featuring integrated DRL for a bold road presence.",
      descProduct: "MAHINDRA SCORPIO-N® Fog Lamp",
      descImage: "assets/img/BS-1.png"
    }),
    createProductEntry("thar-e-side-stepper", {
      title: "Automatic E-Side Stepper for Thar (Door Side e-Step)",
      shortTitle: "Thar E-Side Stepper",
      subtitle: "Automatic retractable side steps for easier entry and exit on your Thar.",
      category: "EXTERIOR ACCESSORIES",
      categoryLabel: "Best Sellers",
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/cat-2.webp"],
      price: 54999,
      mrp: 82499,
      emi: "₹18331/Month",
      couponPrice: 52249.05,
      description:
        "Premium automatic side stepper designed for Mahindra Thar — durable, weather-resistant, and easy to install.",
      descProduct: "THAR® E-Side Stepper",
      descImage: "assets/img/BS-2.png"
    }),
    createProductEntry("hycross-maybach-grill", {
      title: "Hycross Maybach Front Grill",
      shortTitle: "Hycross Maybach Front Grill",
      subtitle: "Maybach-inspired front grill for a luxury upgrade to your Hycross.",
      category: "EXTERIOR ACCESSORIES",
      categoryLabel: "Best Sellers",
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/cat-3.webp"],
      price: 6999,
      mrp: 10499,
      emi: "₹2333/Month",
      couponPrice: 6649.05,
      description:
        "Transform your Hycross front profile with a premium Maybach-style grill — precision fit and glossy finish.",
      descProduct: "HYCROSS® Maybach Grill",
      descImage: "assets/img/BS-3.png"
    }),
    createProductEntry("xuv-rear-bumper-guard", {
      title: "Rear Bumper Safety Guards For Mahindra Xuv 3xo",
      shortTitle: "XUV 3XO Rear Bumper Guards",
      subtitle: "Heavy-duty rear bumper guards for added protection on your XUV 3XO.",
      category: "EXTERIOR ACCESSORIES",
      categoryLabel: "Best Sellers",
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/cat-6.webp"],
      price: 4449,
      mrp: 6699,
      emi: "₹1483/Month",
      couponPrice: 4226.55,
      description:
        "Protect your rear bumper from scratches and impacts with these custom-fit safety guards.",
      descProduct: "XUV 3XO® Rear Bumper Guards",
      descImage: "assets/img/BS-4.png"
    }),
    createProductEntry("neodrift-seat-organizer", {
      title:
        "Neodrift Car Seat Organizer - Seat Master Lite without Tray - Full Black Lite - Set of 1",
      shortTitle: "Neodrift Car Seat Organizer",
      subtitle:
        "(Multi-Pocket, Spill-Resistant, Space Saver, Durable Material) | Premium Car Seat & Backseat Organisers in India",
      category: "CAR SEAT ORGANISERS",
      categoryLabel: "Car Seat Organisers",
      image: "assets/img/product-main.webp",
      images: [
        "assets/img/product-main.webp",
        "assets/img/small-product.avif",
        "assets/img/small-product-2.webp",
        "assets/img/small-product-3.avif",
        "assets/img/small-product-4.avif",
        "assets/img/small-product-5.avif",
        "assets/img/small-product-6.avif"
      ],
      price: 1343,
      mrp: 2200,
      emi: "₹448/Month",
      couponPrice: 1275.85,
      description:
        "Keep your car clutter-free with the Neodrift Car Seat Organizer — multiple pockets, spill-resistant material, and adjustable straps.",
      descProduct: "NEODRIFT® Car Seat Organizer",
      descImage: "assets/img/product-main.webp"
    })
  ];

  var catalogById = {};
  var catalogByImage = {};

  catalog.forEach(function (item) {
    catalogById[item.id] = item;
    catalogByImage[item.image] = item;
    var base = item.image.split("/").pop();
    if (base) catalogByImage[base] = item;
  });

  global.CA_PRODUCTS = catalog;
  global.CA_PRODUCTS_BY_ID = catalogById;
  global.CA_PRODUCTS_BY_IMAGE = catalogByImage;

  /* -------------------------------------------------------------------------- */
  /* Shared helpers                                                             */
  /* -------------------------------------------------------------------------- */

  function formatProductPrice(amount, prefix) {
    var n = Number(amount);
    if (isNaN(n)) return String(amount);
    var formatted = "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (prefix || "") + formatted;
  }

  function buildProductUrl(id, cardImgSrc) {
    var url = "product.html?id=" + encodeURIComponent(id);
    if (cardImgSrc) {
      url += "&img=" + encodeURIComponent(cardImgSrc);
    }
    return url;
  }

  function normalizeProductTitle(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findProductForCard(card) {
    var idAttr = card.getAttribute("data-ca-product-id");
    if (idAttr && catalogById[idAttr]) {
      return catalogById[idAttr];
    }

    var nameEl = card.querySelector(".ca-product-card__name");
    var title = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (title) {
      var norm = normalizeProductTitle(title);
      for (var i = 0; i < catalog.length; i++) {
        var item = catalog[i];
        if (normalizeProductTitle(item.title) === norm || normalizeProductTitle(item.shortTitle) === norm) {
          return item;
        }
      }
    }

    var img = card.querySelector(".ca-product-card__media img, .ca-featured__figure img");
    if (!img) return null;
    var src = img.getAttribute("src") || "";
    return catalogByImage[src] || catalogByImage[src.split("/").pop()];
  }

  function setPdpText(selector, text) {
    var el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  /* -------------------------------------------------------------------------- */
  /* Listing pages — wire product card links                                      */
  /* -------------------------------------------------------------------------- */

  function wireProductCard(card, product) {
    if (!product || card.getAttribute("data-ca-product-wired") === "true") return;

    var cardImg = card.querySelector(".ca-product-card__media img");
    var cardImgSrc = cardImg ? cardImg.getAttribute("src") : "";
    var url = buildProductUrl(product.id, cardImgSrc);

    var media = card.querySelector(".ca-product-card__media");
    if (media) {
      media.href = url;
    }

    var nameEl = card.querySelector(".ca-product-card__name");
    if (nameEl) {
      var innerLink = nameEl.querySelector("a");
      if (innerLink) {
        innerLink.href = url;
      } else if (!nameEl.querySelector("a")) {
        var link = document.createElement("a");
        link.href = url;
        link.textContent = nameEl.textContent.trim();
        nameEl.textContent = "";
        nameEl.appendChild(link);
      }
    }

    var cta = card.querySelector(".ca-product-card__cta");
    if (cta && cta.tagName === "BUTTON") {
      var ctaLink = document.createElement("a");
      ctaLink.href = url;
      ctaLink.className = "ca-product-card__cta";
      ctaLink.textContent = cta.textContent;
      cta.replaceWith(ctaLink);
    } else if (cta && cta.tagName === "A") {
      cta.href = url;
    }

    card.setAttribute("data-ca-product-id", product.id);
    card.setAttribute("data-ca-product-wired", "true");
    card.style.cursor = "pointer";
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button, select, input, textarea, label")) return;
      window.location.href = url;
    });
  }

  function initProductCardLinks(root) {
    var scope = root || document;
    scope.querySelectorAll(".ca-product-card").forEach(function (card) {
      wireProductCard(card, findProductForCard(card));
    });
  }

  function initFeaturedProductLink() {
    var featured = document.querySelector(".ca-featured:not(.ca-pdp-main__gallery-block)");
    if (!featured) return;

    var fpId = featured.getAttribute("data-ca-product-id");
    var product = (fpId && catalogById[fpId]) || null;
    if (!product) return;

    var featuredMainImg = featured.querySelector("[data-ca-featured-main]");
    var featuredImgSrc = featuredMainImg ? featuredMainImg.getAttribute("src") : "";
    var featuredUrl = buildProductUrl(product.id, featuredImgSrc);

    var featuredMain = featured.querySelector(".ca-featured__figure");
    if (featuredMain && !featuredMain.getAttribute("data-ca-product-wired")) {
      featuredMain.setAttribute("data-ca-product-wired", "true");
      featuredMain.style.cursor = "pointer";
      featuredMain.addEventListener("click", function () {
        window.location.href = featuredUrl;
      });
    }

    var featuredTitle = featured.querySelector(".ca-featured__title");
    if (featuredTitle && !featuredTitle.getAttribute("data-ca-product-wired")) {
      featuredTitle.setAttribute("data-ca-product-wired", "true");
      featuredTitle.style.cursor = "pointer";
      featuredTitle.addEventListener("click", function () {
        window.location.href = featuredUrl;
      });
    }
  }

  function initProductLinks() {
    initProductCardLinks();
    initFeaturedProductLink();
  }

  /* -------------------------------------------------------------------------- */
  /* Product detail page                                                        */
  /* -------------------------------------------------------------------------- */

  function initPdpGalleryThumbs(mainImg, thumbsWrap, images) {
    if (!thumbsWrap || !mainImg) return;

    thumbsWrap.innerHTML = images
      .map(function (src, i) {
        return (
          '<button type="button" class="ca-featured__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-ca-featured-thumb data-ca-featured-src="' +
          src +
          '" aria-label="View image ' +
          (i + 1) +
          '"' +
          (i === 0 ? ' aria-current="true"' : "") +
          '><img src="' +
          src +
          '" alt="" width="56" height="56" decoding="async" /></button>'
        );
      })
      .join("");

    thumbsWrap.querySelectorAll("[data-ca-featured-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-ca-featured-src");
        if (!src) return;

        thumbsWrap.querySelectorAll("[data-ca-featured-thumb]").forEach(function (t) {
          t.classList.remove("is-active");
          t.removeAttribute("aria-current");
        });
        thumb.classList.add("is-active");
        thumb.setAttribute("aria-current", "true");
        mainImg.src = src;
      });
    });
  }

  function renderRelatedProducts(relatedWrap, currentProductId) {
    if (!relatedWrap) return;

    var related = catalog
      .filter(function (item) {
        return item.id !== currentProductId;
      })
      .slice(0, 4);

    relatedWrap.innerHTML = related
      .map(function (item) {
        var url = buildProductUrl(item.id, item.image);
        return (
          '<article class="ca-product-card">' +
          '<span class="ca-product-card__badge">Sale</span>' +
          '<a href="' +
          url +
          '" class="ca-product-card__media"><img src="' +
          item.image +
          '" alt="" width="280" height="280" loading="lazy" decoding="async" /></a>' +
          '<div class="ca-product-card__body">' +
          '<h3 class="ca-product-card__name"><a href="' +
          url +
          '">' +
          item.title +
          "</a></h3>" +
          '<div class="ca-product-card__prices"><span class="ca-product-card__price">' +
          formatProductPrice(item.price, item.pricePrefix) +
          '</span><span class="ca-product-card__compare">' +
          formatProductPrice(item.mrp) +
          "</span></div>" +
          '<a href="' +
          url +
          '" class="ca-product-card__cta">' +
          item.cta +
          "</a>" +
          "</div></article>"
        );
      })
      .join("");

    initProductCardLinks(relatedWrap);
  }

  function initProductDetailPage() {
    if (!document.querySelector(".ca-pdp-main")) return;

    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id");
    var product =
      (productId && catalogById[productId]) ||
      catalogById["neodrift-seat-organizer"] ||
      catalog[0];

    var imgParam = params.get("img");
    if (imgParam) {
      var gallery = [imgParam].concat(
        (product.images || [product.image]).filter(function (src) {
          return src !== imgParam;
        })
      );
      product = Object.assign({}, product, {
        image: imgParam,
        images: gallery,
        descImage: imgParam
      });
    }

    document.title = product.shortTitle + " — Car Accessories";

    setPdpText("[data-ca-pdp-breadcrumb]", product.shortTitle);
    setPdpText("[data-ca-pdp-title]", product.title);
    setPdpText("[data-ca-pdp-subtitle]", product.subtitle);
    setPdpText("[data-ca-pdp-category]", product.category);
    setPdpText("[data-ca-pdp-rating-text]", product.rating + " (" + product.reviews + ")");
    setPdpText("[data-ca-pdp-price]", formatProductPrice(product.price, product.pricePrefix));
    setPdpText("[data-ca-pdp-compare]", formatProductPrice(product.mrp));
    setPdpText("[data-ca-pdp-coupon]", formatProductPrice(product.couponPrice));
    setPdpText("[data-ca-pdp-float-price]", formatProductPrice(product.price, product.pricePrefix));
    setPdpText("[data-ca-pdp-compare-inline]", formatProductPrice(product.mrp));
    setPdpText("[data-ca-pdp-sticky-price]", formatProductPrice(product.price, product.pricePrefix));
    setPdpText("[data-ca-pdp-sticky-compare]", formatProductPrice(product.mrp));
    setPdpText("[data-ca-pdp-desc-product]", product.descProduct);
    setPdpText("[data-ca-pdp-desc-para]", product.description);

    var descImg = document.querySelector("[data-ca-pdp-desc-img]");
    if (descImg) {
      descImg.src = product.descImage;
      descImg.alt = product.shortTitle;
    }

    var ugcImg = document.querySelector("[data-ca-pdp-ugc-img]");
    if (ugcImg) {
      ugcImg.src = product.image;
      ugcImg.alt = "Customer photo of " + product.shortTitle;
    }

    var mainImg = document.querySelector("[data-ca-featured-main]");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.shortTitle;
    }

    var thumbsWrap = document.querySelector("[data-ca-pdp-thumbs]");
    var images = product.images && product.images.length ? product.images : [product.image];
    initPdpGalleryThumbs(mainImg, thumbsWrap, images);

    renderRelatedProducts(document.querySelector("[data-ca-pdp-related-grid]"), product.id);
  }

  /* -------------------------------------------------------------------------- */
  /* Boot                                                                       */
  /* -------------------------------------------------------------------------- */

  function initProductsModule() {
    initProductLinks();
    initProductDetailPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductsModule);
  } else {
    initProductsModule();
  }
})(typeof window !== "undefined" ? window : this);
