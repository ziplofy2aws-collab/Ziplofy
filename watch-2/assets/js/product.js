(function () {
  "use strict";

  var WC2_PRODUCTS = {
    "ns-1": {
      id: "ns-1",
      brand: "CHRONEXA",
      name: "Timex Atelier Chronograph Two Tone Watch",
      title: "Timex Atelier Chronograph Two Tone Stainless Steel Bracelet Watch CX000012",
      sku: "CX000012",
      collection: "Atelier",
      countryOfOrigin: "Japan",
      warrantyPeriod: "2 Years",
      price: 199995,
      image: "assets/img/NS-1.png",
      images: ["assets/img/NS-1.png", "assets/img/NS-2.png", "assets/img/NS-3.png", "assets/img/NS-4.png"],
      isNew: true,
      filter: { gender: "men", brand: "Timex", model: "Atelier Chronograph", occasion: "casual", caseSize: "42", dialColor: "blue", strapColor: "two-tone", dialShape: "round", movement: "quartz", waterResistant: "5-atm", discount: false },
      description: "A refined chronograph with two-tone stainless steel bracelet, sunburst dial, and precision quartz movement. Built for everyday elegance.",
      specs: { caseShape: "Round", dialDiameter: "42 MM", movement: "Quartz", gender: "Men", display: "Chronograph", dialColour: "Blue", dialMaterial: "Stainless Steel", strapType: "Stainless Steel", strapColour: "Two-Tone", buckleType: "Foldover Clasp", glassMaterial: "Sapphire", waterResistance: "5 ATM", caseThickness: "11.5 MM" }
    },
    "ns-2": {
      id: "ns-2",
      brand: "CHRONEXA",
      name: "Tissot Gentleman Powermatic 80 Watch",
      title: "Tissot Gentleman Powermatic 80 Silicium Stainless Steel Watch CX000013",
      sku: "CX000013",
      collection: "Gentleman",
      countryOfOrigin: "Switzerland",
      warrantyPeriod: "2 Years",
      price: 159995,
      image: "assets/img/NS-2.png",
      images: ["assets/img/NS-2.png", "assets/img/NS-1.png", "assets/img/NS-3.png", "assets/img/NS-4.png"],
      isNew: true,
      filter: { gender: "men", brand: "Tissot", model: "Gentleman Powermatic 80", occasion: "formal", caseSize: "40", dialColor: "green", strapColor: "silver", dialShape: "round", movement: "automatic", waterResistant: "10-atm", discount: false },
      description: "Powermatic 80 automatic movement with silicium balance spring and clean dial design. A versatile daily wearer with 80-hour power reserve.",
      specs: { caseShape: "Round", dialDiameter: "40 MM", movement: "Automatic", gender: "Men", display: "Analog", dialColour: "Green", dialMaterial: "Stainless Steel", strapType: "Stainless Steel", strapColour: "Silver", buckleType: "Foldover Clasp", glassMaterial: "Sapphire", waterResistance: "10 ATM", caseThickness: "10.8 MM" }
    },
    "ns-3": {
      id: "ns-3",
      brand: "CHRONEXA",
      name: "Seiko Presage Open Heart Watch",
      title: "Seiko Presage Automatic Open Heart Blue Dial Leather Watch CX000014",
      sku: "CX000014",
      collection: "Presage",
      countryOfOrigin: "Japan",
      warrantyPeriod: "2 Years",
      price: 179995,
      image: "assets/img/NS-3.png",
      images: ["assets/img/NS-3.png", "assets/img/NS-1.png", "assets/img/NS-2.png", "assets/img/NS-4.png"],
      isNew: true,
      filter: { gender: "men", brand: "Seiko", model: "Presage Open Heart", occasion: "formal", caseSize: "40", dialColor: "blue", strapColor: "brown", dialShape: "round", movement: "automatic", waterResistant: "5-atm", discount: false },
      description: "Open heart automatic with blue dial and premium leather strap. Showcases mechanical craftsmanship through the exposed balance wheel.",
      specs: { caseShape: "Round", dialDiameter: "40.5 MM", movement: "Automatic", gender: "Men", display: "Analog", dialColour: "Blue", dialMaterial: "Stainless Steel", strapType: "Leather", strapColour: "Brown", buckleType: "Tang Buckle", glassMaterial: "Sapphire", waterResistance: "5 ATM", caseThickness: "11.2 MM" }
    },
    "ns-4": {
      id: "ns-4",
      brand: "CHRONEXA",
      name: "Citizen Eco-Drive Classic Watch",
      title: "Citizen Eco-Drive Classic Two Tone Stainless Steel Watch CX000015",
      sku: "CX000015",
      collection: "Eco-Drive",
      countryOfOrigin: "Japan",
      warrantyPeriod: "2 Years",
      price: 149995,
      image: "assets/img/NS-4.png",
      images: ["assets/img/NS-4.png", "assets/img/NS-1.png", "assets/img/NS-2.png", "assets/img/NS-3.png"],
      isNew: false,
      filter: { gender: "men", brand: "Citizen", model: "Eco-Drive Classic", occasion: "casual", caseSize: "41", dialColor: "champagne", strapColor: "two-tone", dialShape: "round", movement: "eco-drive", waterResistant: "5-atm", discount: false },
      description: "Eco-Drive technology powered by light with classic two-tone styling. Never needs a battery change with reliable everyday performance.",
      specs: { caseShape: "Round", dialDiameter: "41 MM", movement: "Eco-Drive", gender: "Men", display: "Analog", dialColour: "Champagne", dialMaterial: "Stainless Steel", strapType: "Stainless Steel", strapColour: "Two-Tone", buckleType: "Foldover Clasp", glassMaterial: "Mineral", waterResistance: "5 ATM", caseThickness: "10.5 MM" }
    },
    "bs-1": {
      id: "bs-1",
      brand: "CHRONEXA",
      name: "Aston Martin Blue Round Dial Watch",
      title: "Aston Martin Blue Round Dial Analog Men's Watch CX000016",
      sku: "CX000016",
      collection: "Racing",
      countryOfOrigin: "United Kingdom",
      warrantyPeriod: "2 Years",
      price: 33995,
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-2.png", "assets/img/BS-3.png", "assets/img/BS-4.png"],
      isNew: false,
      filter: { gender: "men", brand: "Aston Martin", model: "Blue Round Dial", occasion: "sport", caseSize: "42", dialColor: "blue", strapColor: "two-tone", dialShape: "round", movement: "quartz", waterResistant: "5-atm", discount: false },
      description: "Sport-inspired round dial watch with blue sunray finish and two-tone bracelet. A bold statement piece for the modern gentleman.",
      specs: { caseShape: "Round", dialDiameter: "42 MM", movement: "Quartz", gender: "Men", display: "Analog", dialColour: "Blue", dialMaterial: "Stainless Steel", strapType: "Stainless Steel", strapColour: "Two-Tone", buckleType: "Foldover Clasp", glassMaterial: "Mineral", waterResistance: "5 ATM", caseThickness: "11.0 MM" }
    },
    "bs-2": {
      id: "bs-2",
      brand: "CHRONEXA",
      name: "Green Dial Chronograph Watch",
      title: "Green Dial Chronograph Two Tone Stainless Steel Watch CX000017",
      sku: "CX000017",
      collection: "Sport Chrono",
      countryOfOrigin: "Switzerland",
      warrantyPeriod: "2 Years",
      price: 38995,
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/BS-1.png", "assets/img/BS-3.png", "assets/img/BS-4.png"],
      isNew: false,
      filter: { gender: "men", brand: "Chronexa", model: "Green Dial Chronograph", occasion: "sport", caseSize: "44", dialColor: "green", strapColor: "two-tone", dialShape: "round", movement: "quartz", waterResistant: "10-atm", discount: false },
      description: "Chronograph with vivid green dial and tachymeter bezel. Functional timing features meet premium finishing.",
      specs: { caseShape: "Round", dialDiameter: "44 MM", movement: "Quartz", gender: "Men", display: "Chronograph", dialColour: "Green", dialMaterial: "Stainless Steel", strapType: "Stainless Steel", strapColour: "Two-Tone", buckleType: "Foldover Clasp", glassMaterial: "Mineral", waterResistance: "10 ATM", caseThickness: "12.0 MM" }
    },
    "bs-3": {
      id: "bs-3",
      brand: "CHRONEXA",
      name: "Gold Tonneau Automatic Watch",
      title: "Gold Tonneau Automatic Black Leather Strap Watch CX000018",
      sku: "CX000018",
      collection: "Heritage",
      countryOfOrigin: "Switzerland",
      warrantyPeriod: "2 Years",
      price: 18995,
      salePrice: 14995,
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/BS-1.png", "assets/img/BS-2.png", "assets/img/BS-4.png"],
      isNew: false,
      filter: { gender: "men", brand: "Chronexa", model: "Gold Tonneau Automatic", occasion: "formal", caseSize: "40", dialColor: "black", strapColor: "black", dialShape: "tonneau", movement: "automatic", waterResistant: "3-atm", discount: true },
      description: "Distinctive tonneau case with gold-tone finishing and black leather strap. Automatic movement visible through exhibition caseback.",
      specs: { caseShape: "Tonneau", dialDiameter: "40 MM", movement: "Automatic", gender: "Men", display: "Analog", dialColour: "Black", dialMaterial: "Stainless Steel", strapType: "Leather", strapColour: "Black", buckleType: "Tang Buckle", glassMaterial: "Mineral", waterResistance: "3 ATM", caseThickness: "11.8 MM" }
    },
    "bs-4": {
      id: "bs-4",
      brand: "CHRONEXA",
      name: "Rose Gold Skeleton Automatic Watch",
      title: "Rose Gold Skeleton Automatic Black Leather Watch CX000019",
      sku: "CX000019",
      collection: "Artisan",
      countryOfOrigin: "Switzerland",
      warrantyPeriod: "2 Years",
      price: 72500,
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/BS-1.png", "assets/img/BS-2.png", "assets/img/BS-3.png"],
      isNew: true,
      filter: { gender: "unisex", brand: "Chronexa", model: "Rose Gold Skeleton", occasion: "formal", caseSize: "42", dialColor: "skeleton", strapColor: "black", dialShape: "round", movement: "automatic", waterResistant: "5-atm", discount: false },
      description: "Skeleton dial automatic with rose gold case and open-worked movement. A collector's piece showcasing horological artistry.",
      specs: { caseShape: "Round", dialDiameter: "42 MM", movement: "Automatic", gender: "Men", display: "Skeleton", dialColour: "Skeleton", dialMaterial: "Stainless Steel", strapType: "Leather", strapColour: "Black", buckleType: "Tang Buckle", glassMaterial: "Sapphire", waterResistance: "5 ATM", caseThickness: "12.5 MM" }
    }
  };

  window.WC2_CATALOG = WC2_PRODUCTS;

  function getProduct(id) {
    return WC2_PRODUCTS[id] || WC2_PRODUCTS["ns-1"];
  }

  function productUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function formatPrice(amount) {
    return "\u20B9 " + amount.toLocaleString("en-IN");
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get("id") || "ns-1";
  }

  function renderThumbs(container, images, mainImg) {
    container.innerHTML = "";
    images.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.className = "wc2-pdp__thumb" + (index === 0 ? " is-active" : "");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
      btn.setAttribute("data-wc2-pdp-thumb", src);

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.width = 72;
      img.height = 72;
      if (index > 0) img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);
      container.appendChild(btn);

      btn.addEventListener("click", function () {
        mainImg.src = src;
        container.querySelectorAll(".wc2-pdp__thumb").forEach(function (thumb) {
          thumb.classList.remove("is-active");
          thumb.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
      });
    });
  }

  function atmToMeters(waterResistance) {
    var match = String(waterResistance || "").match(/(\d+)/);
    var atm = match ? parseInt(match[1], 10) : 5;
    return (atm * 10).toFixed(1);
  }

  function buildFullSpec(product) {
    var specs = product.specs || {};
    var filter = product.filter || {};

    return {
      brand: filter.brand || product.brand,
      collection: product.collection || "Classic",
      modelNo: product.sku,
      movement: specs.movement,
      sizeCase: (specs.dialDiameter || "").replace(/\s*MM/i, "mm"),
      caseShape: specs.caseShape,
      caseMaterial: specs.caseMaterial || specs.dialMaterial || "Stainless Steel",
      glassMaterial: specs.glassMaterial === "Sapphire" ? "Sapphire Crystal" : specs.glassMaterial || "Mineral Crystal",
      dialColour: specs.dialColour,
      strapMaterial: specs.strapType,
      strapColour: specs.strapColour,
      gender: specs.gender,
      waterResistanceM: atmToMeters(specs.waterResistance),
      warrantyPeriod: product.warrantyPeriod || "2 Years",
      countryOfOrigin: product.countryOfOrigin || "Switzerland"
    };
  }

  function renderFullSpecField(label, value) {
    if (!value) return "";
    return (
      '<div class="wc2-pdp__fullspec-field">' +
      '<span class="wc2-pdp__fullspec-field-label">' + label + "</span>" +
      '<span class="wc2-pdp__fullspec-field-value">' + value + "</span>" +
      "</div>"
    );
  }

  function renderFullSpecColumn(title, fields) {
    var body = fields.map(function (field) {
      return renderFullSpecField(field.label, field.value);
    }).join("");

    return (
      '<div class="wc2-pdp__fullspec-col">' +
      '<h3 class="wc2-pdp__fullspec-col-title">' + title + "</h3>" +
      '<div class="wc2-pdp__fullspec-col-body">' + body + "</div>" +
      "</div>"
    );
  }

  function renderFullSpec(container, product) {
    if (!container) return;

    var spec = buildFullSpec(product);
    var meta =
      '<div class="wc2-pdp__fullspec-meta">' +
      renderFullSpecField("Brand", spec.brand) +
      renderFullSpecField("Collection", spec.collection) +
      renderFullSpecField("Model No", spec.modelNo) +
      "</div>";

    var grid =
      '<div class="wc2-pdp__fullspec-grid">' +
      renderFullSpecColumn("MOVEMENT", [{ label: "Movement", value: spec.movement }]) +
      renderFullSpecColumn("CASE", [
        { label: "Size Case", value: spec.sizeCase },
        { label: "Case Shape", value: spec.caseShape },
        { label: "Case Material", value: spec.caseMaterial },
        { label: "Glass Material", value: spec.glassMaterial }
      ]) +
      renderFullSpecColumn("DIAL", [{ label: "Dial Colour", value: spec.dialColour }]) +
      renderFullSpecColumn("STRAP", [
        { label: "Strap Material", value: spec.strapMaterial },
        { label: "Strap Colour", value: spec.strapColour }
      ]) +
      renderFullSpecColumn("OTHER", [
        { label: "Gender", value: spec.gender },
        { label: "Water Resistance (M)", value: spec.waterResistanceM },
        { label: "Warranty Period", value: spec.warrantyPeriod },
        { label: "Country Of Origin", value: spec.countryOfOrigin }
      ]) +
      "</div>";

    container.innerHTML = meta + grid;
  }

  function renderSpecTable(table, specs) {
    var rows = [
      ["Dial Material", specs.dialMaterial],
      ["Strap Type", specs.strapType],
      ["Strap Colour", specs.strapColour],
      ["Buckle Type", specs.buckleType],
      ["Glass Material", specs.glassMaterial],
      ["Water Resistance", specs.waterResistance],
      ["Case Thickness", specs.caseThickness]
    ];

    table.innerHTML = rows.map(function (row) {
      return '<div class="wc2-pdp__spec-row"><dt>' + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
    }).join("");
  }

  function renderDetailDescription(container, product) {
    if (!container) return;

    var brand = product.filter && product.filter.brand ? product.filter.brand : "CHRONEXA";
    var collection = product.collection || "Classic";

    container.innerHTML =
      '<p class="wc2-pdp__detail-intro">' + product.description + "</p>" +
      "<h3 class=\"wc2-pdp__detail-heading\">5 REASONS WHY YOU SHOULD BUY WATCHES FROM CHRONEXA \u2013 TRUSTED LUXURY RETAILER</h3>" +
      "<ul class=\"wc2-pdp__detail-list wc2-list-icon\">" +
      "<li><i class=\"fa-solid fa-circle-check\" aria-hidden=\"true\"></i><span>Chronexa is an authorised retailer for " + brand + " and leading luxury watch brands in India.</span></li>" +
      "<li><i class=\"fa-solid fa-circle-check\" aria-hidden=\"true\"></i><span>Chronexa deals and sells only authentic watches. Every watch is furnished with an invoice, brand warranty, and original brand packaging.</span></li>" +
      "<li><i class=\"fa-solid fa-circle-check\" aria-hidden=\"true\"></i><span>Chronexa has been in the business of watch retailing with a legacy of trust and expertise.</span></li>" +
      "<li><i class=\"fa-solid fa-circle-check\" aria-hidden=\"true\"></i><span>Chronexa offers strong after-sales service with state-of-the-art watch servicing facilities.</span></li>" +
      "<li><i class=\"fa-solid fa-circle-check\" aria-hidden=\"true\"></i><span>Chronexa has earned the trust of customers through our online store and offline boutiques across major cities in India.</span></li>" +
      "</ul>" +
      "<h3 class=\"wc2-pdp__detail-heading\">5 FREQUENTLY ASKED QUESTIONS FROM OUR SHOPPERS:</h3>" +
      "<div class=\"wc2-pdp__detail-faq\">" +
      "<div><p class=\"wc2-pdp__detail-q wc2-inline-icon\"><i class=\"fa-regular fa-circle-question\" aria-hidden=\"true\"></i><span>Are the watches sold at Chronexa authentic?</span></p>" +
      "<p class=\"wc2-pdp__detail-a\">Ans: Yes, all watches sold online and at Chronexa stores are 100% authentic and genuine.</p></div>" +
      "<div><p class=\"wc2-pdp__detail-q wc2-inline-icon\"><i class=\"fa-regular fa-circle-question\" aria-hidden=\"true\"></i><span>Will the warranty be active if I buy online?</span></p>" +
      "<p class=\"wc2-pdp__detail-a\">Ans: Yes, all watches come with manufacturer warranty ranging from 2 to 5 years depending on the brand ordered.</p></div>" +
      "<div><p class=\"wc2-pdp__detail-q wc2-inline-icon\"><i class=\"fa-regular fa-circle-question\" aria-hidden=\"true\"></i><span>How soon can I get my watch once the order is placed?</span></p>" +
      "<p class=\"wc2-pdp__detail-a\">Ans: Once confirmed, your order is processed within 24 hours, dispatched within 48 hours, and delivered in 2\u20133 working days.</p></div>" +
      "<div><p class=\"wc2-pdp__detail-q wc2-inline-icon\"><i class=\"fa-regular fa-circle-question\" aria-hidden=\"true\"></i><span>Which courier partner will be used to send the watch?</span></p>" +
      "<p class=\"wc2-pdp__detail-a\">Ans: Bluedart, DTDC Plus, and Shiprocket.</p></div>" +
      "<div><p class=\"wc2-pdp__detail-q wc2-inline-icon\"><i class=\"fa-regular fa-circle-question\" aria-hidden=\"true\"></i><span>Can I place an order online and collect it offline?</span></p>" +
      "<p class=\"wc2-pdp__detail-a\">Ans: Yes. You may place an order online and collect your " + collection + " watch at your preferred Chronexa store with prior intimation.</p></div>" +
      "</div>";
  }

  function initDetailAccordion() {
    var acc = document.querySelector("[data-wc2-pdp-detail-acc]");
    if (!acc) return;

    acc.querySelectorAll(".wc2-pdp__detail-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".wc2-pdp__detail-item");
        var isOpen = item.classList.contains("is-open");

        acc.querySelectorAll(".wc2-pdp__detail-item").forEach(function (el) {
          el.classList.remove("is-open");
          el.querySelector(".wc2-pdp__detail-btn").setAttribute("aria-expanded", "false");
          var elIcon = el.querySelector(".wc2-pdp__detail-icon i");
          if (elIcon) {
            elIcon.classList.remove("fa-minus");
            elIcon.classList.add("fa-plus");
          }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          var icon = btn.querySelector(".wc2-pdp__detail-icon i");
          if (icon) {
            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");
          }
        }
      });
    });
  }

  function renderRelatedPriceRow(product) {
    var displayPrice = product.salePrice || product.price;
    var html = '<span class="wc2-pdp__related-price">' + formatPrice(displayPrice) + "</span>";

    if (product.salePrice) {
      var off = Math.round((1 - product.salePrice / product.price) * 100);
      html += '<span class="wc2-pdp__related-mrp">' + formatPrice(product.price) + "</span>";
      html += '<span class="wc2-pdp__related-off">' + off + "% OFF</span>";
    }

    return '<div class="wc2-pdp__related-prices">' + html + "</div>";
  }

  function renderRelatedCard(product) {
    var url = productUrl(product.id);
    return (
      '<article class="wc2-pdp__related-card" data-product-id="' + product.id + '">' +
      '<div class="wc2-pdp__related-media">' +
      '<a href="' + url + '" class="wc2-pdp__related-media-link" data-product="' + product.id + '">' +
      '<img src="' + product.image + '" alt="' + product.title + '" width="280" height="280" loading="lazy" decoding="async" />' +
      "</a>" +
      '<button class="wc2-pdp__related-wish" type="button" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      "</div>" +
      '<a href="' + url + '" class="wc2-pdp__related-body" data-product="' + product.id + '">' +
      '<p class="wc2-pdp__related-name">' + product.title + "</p>" +
      renderRelatedPriceRow(product) +
      "</a></article>"
    );
  }

  function bindRelatedWishes() {
    var section = document.querySelector("[data-wc2-pdp-related-section]");
    if (!section) return;

    section.querySelectorAll(".wc2-pdp__related-wish").forEach(function (btn) {
      if (btn.dataset.wc2Bound) return;
      btn.dataset.wc2Bound = "true";
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var icon = btn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-regular");
          icon.classList.toggle("fa-solid");
        }
      });
    });
  }

  var relatedCarouselBound = false;
  var relatedCardIndex = 0;

  function initRelatedCarousel() {
    var section = document.querySelector("[data-wc2-pdp-related-section]");
    var track = document.querySelector("[data-wc2-pdp-related-track]");
    var prev = document.querySelector("[data-wc2-pdp-related-prev]");
    var next = document.querySelector("[data-wc2-pdp-related-next]");
    if (!section || !track) return;

    function getCards() {
      return track.querySelectorAll(".wc2-pdp__related-card");
    }

    function getVisibleCount() {
      if (window.matchMedia("(max-width: 520px)").matches) return 1;
      if (window.matchMedia("(max-width: 768px)").matches) return 2;
      if (window.matchMedia("(max-width: 1100px)").matches) return 3;
      return 4;
    }

    function getStep() {
      var cards = getCards();
      if (!cards.length) return 0;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function getMaxIndex() {
      return Math.max(0, getCards().length - getVisibleCount());
    }

    function updateCarousel() {
      var maxIndex = getMaxIndex();
      if (relatedCardIndex > maxIndex) relatedCardIndex = maxIndex;
      track.style.transform = "translateX(-" + relatedCardIndex * getStep() + "px)";
      if (prev) prev.disabled = relatedCardIndex <= 0;
      if (next) next.disabled = relatedCardIndex >= maxIndex;
    }

    if (!relatedCarouselBound) {
      if (prev) {
        prev.addEventListener("click", function () {
          if (relatedCardIndex > 0) {
            relatedCardIndex -= 1;
            updateCarousel();
          }
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          if (relatedCardIndex < getMaxIndex()) {
            relatedCardIndex += 1;
            updateCarousel();
          }
        });
      }

      window.addEventListener("resize", updateCarousel);
      relatedCarouselBound = true;
    }

    relatedCardIndex = 0;
    updateCarousel();
  }

  function renderRelated(track) {
    var order = ["ns-1", "ns-2", "ns-3", "ns-4", "bs-1", "bs-2", "bs-3", "bs-4"];
    track.innerHTML = order.map(function (id) {
      return renderRelatedCard(WC2_PRODUCTS[id]);
    }).join("");
  }

  function initProductLinks() {
    document.querySelectorAll("a[data-product]").forEach(function (el) {
      var id = el.getAttribute("data-product");
      if (id) el.setAttribute("href", productUrl(id));
    });
  }

  function syncProductCards() {
    document.querySelectorAll(".wc2-arrivals__card, .wc2-reviewed__card, .wc2-shop__card").forEach(function (card) {
      var idEl = card.querySelector("[data-product]");
      if (!idEl) return;

      var id = idEl.getAttribute("data-product");
      var product = WC2_PRODUCTS[id];
      if (!product) return;

      var displayPrice = product.salePrice || product.price;
      var url = productUrl(id);

      card.setAttribute("data-product-id", id);

      card.querySelectorAll("[data-product]").forEach(function (link) {
        link.setAttribute("href", url);
        link.setAttribute("data-product", id);
      });

      card.querySelectorAll("img").forEach(function (img) {
        img.src = product.image;
        img.alt = product.name;
      });

      var nameEl = card.querySelector(".wc2-arrivals__name, .wc2-reviewed__name, .wc2-shop__name");
      if (nameEl) nameEl.textContent = product.title;

      var priceEl = card.querySelector(".wc2-arrivals__price, .wc2-reviewed__price");
      if (priceEl) priceEl.textContent = formatPrice(displayPrice);

      var shopPrice = card.querySelector(".wc2-shop__price-current");
      if (shopPrice) shopPrice.textContent = formatPrice(displayPrice);
    });
  }

  function initProductCardClicks() {
    document.querySelectorAll(".wc2-arrivals__card, .wc2-reviewed__card, .wc2-shop__card, .wc2-pdp__related-card").forEach(function (card) {
      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {
        if (event.target.closest("a, .wc2-arrivals__wish, .wc2-reviewed__wish, .wc2-shop__wish, .wc2-pdp__related-wish")) return;

        var id = card.getAttribute("data-product-id");
        if (!id) {
          var idEl = card.querySelector("[data-product]");
          id = idEl ? idEl.getAttribute("data-product") : null;
        }
        if (id) window.location.href = productUrl(id);
      });
    });
  }

  function loadProduct() {
    if (!document.querySelector("[data-wc2-pdp-main]")) return;

    var product = getProduct(getProductId());
    var displayPrice = product.salePrice || product.price;
    var specs = product.specs;

    document.title = product.name + " — CHRONEXA";

    var setText = function (selector, value) {
      var el = document.querySelector(selector);
      if (el && value != null) el.textContent = value;
    };

    setText("[data-wc2-pdp-breadcrumb]", product.title);
    setText("[data-wc2-pdp-brand]", product.filter && product.filter.brand ? product.filter.brand : product.brand);
    setText("[data-wc2-pdp-title]", product.title);
    setText("[data-wc2-pdp-sku]", product.sku);
    setText("[data-wc2-pdp-price]", formatPrice(displayPrice));

    var newBadge = document.querySelector("[data-wc2-pdp-new]");
    if (newBadge) newBadge.hidden = !product.isNew;

    var mainImg = document.querySelector("[data-wc2-pdp-main]");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.brand + " " + product.name;
    }

    var thumbs = document.querySelector("[data-wc2-pdp-thumbs]");
    if (thumbs && mainImg) renderThumbs(thumbs, product.images, mainImg);

    var specValues = document.querySelectorAll("[data-wc2-pdp-spec]");
    var specKeys = ["caseShape", "dialDiameter", "movement", "gender", "display", "dialColour"];
    specValues.forEach(function (el, i) {
      if (specs[specKeys[i]]) el.textContent = specs[specKeys[i]];
    });

    var specTable = document.querySelector("[data-wc2-pdp-spec-table]");
    if (specTable) renderSpecTable(specTable, specs);

    var relatedTrack = document.querySelector("[data-wc2-pdp-related-track]");
    if (relatedTrack) {
      renderRelated(relatedTrack);
      bindRelatedWishes();
      initRelatedCarousel();
    }

    var fullSpec = document.querySelector("[data-wc2-pdp-fullspec]");
    if (fullSpec) renderFullSpec(fullSpec, product);

    var detailContent = document.querySelector("[data-wc2-pdp-detail-content]");
    if (detailContent) renderDetailDescription(detailContent, product);
  }

  function initProductUi() {
    var wishBtn = document.querySelector("[data-wc2-pdp-wish]");
    if (wishBtn) {
      wishBtn.addEventListener("click", function () {
        var icon = wishBtn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-regular");
          icon.classList.toggle("fa-solid");
        }
      });
    }

    var acc = document.querySelector("[data-wc2-pdp-acc]");
    if (acc) {
      acc.querySelectorAll(".wc2-pdp__acc-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = btn.closest(".wc2-pdp__acc-item");
          var isOpen = item.classList.contains("is-open");

          acc.querySelectorAll(".wc2-pdp__acc-item").forEach(function (el) {
            el.classList.remove("is-open");
            el.querySelector(".wc2-pdp__acc-btn").setAttribute("aria-expanded", "false");
          });

          if (!isOpen) {
            item.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
          }
        });
      });
    }
  }

  function init() {
    initProductLinks();
    syncProductCards();
    initProductCardClicks();
    initProductUi();
    initDetailAccordion();
    loadProduct();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
