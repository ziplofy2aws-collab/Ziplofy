(function () {
  const getStoredProducts = function () {
    try {
      const raw = localStorage.getItem("groomingProducts");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveProductToStore = function (product) {
    const products = getStoredProducts();
    const index = products.findIndex(function (item) { return item.id === product.id; });
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem("groomingProducts", JSON.stringify(products));
    localStorage.setItem("groomingSelectedProduct", JSON.stringify(product));
  };

  const goToProductPage = function (product) {
    saveProductToStore(product);
    window.location.href = "./product.html?pid=" + encodeURIComponent(product.id);
  };

  /** Encode each path segment so literal % and spaces in filenames work in img src URLs. */
  const encodeAssetPath = function (path) {
    return path.split("/").map(function (segment) {
      return encodeURIComponent(segment);
    }).join("/");
  };

  const initHeroSlider = function () {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    if (slides.length < 2) return;

    let currentIndex = 0;
    const showSlide = function (index) {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
    };

    setInterval(function () {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 3500);
  };

  const initTopDeals = function () {
    const tabs = Array.from(document.querySelectorAll(".top-deals-tab"));
    const carousel = document.querySelector("[data-top-deals-carousel]");
    const track = document.querySelector(".top-deals-track");
    if (!tabs.length || !carousel || !track) return;

    const topDealsImageByTitle = {
      "Don Beardo's Beard Growth Pro Kit": "./assets/img/Don Beardo's Beard Growth Pro Kit.avif",
      "Summer Essentials Combo": "./assets/img/Summer Essentials Combo.avif",
      "De-tan Har Roz Kit": "./assets/img/De-tan Har Roz Kit.avif",
      "Best Seller Perfumes Combo (50ml x 4)": "./assets/img/Best Seller Perfumes Combo (50ml x 4).avif",
      "Face Shield Kit": "./assets/img/Face Shield Kit.avif",
      "Man Curls Combo": "./assets/img/Man Curls Combo.avif",
      "Blackout Powder (4g)": "./assets/img/Blackout Powder (4g).webp",
      "Looksmaxxing Glow Kit": "./assets/img/Looksmaxxing Glow Kit.avif",
    };
    const topDealsFallbackImages = Object.values(topDealsImageByTitle);
    const cardSets = {
      "top-sellers": [
        { title: "Don Beardo's Beard Growth Pro Kit", rating: "4.7", reviews: "565", price: "999", mrp: "1499", off: "49% OFF" },
        { title: "Summer Essentials Combo", rating: "4.8", reviews: "174", price: "999", mrp: "1259", off: "19% OFF" },
        { title: "De-tan Har Roz Kit", rating: "4.8", reviews: "138", price: "599", mrp: "1373", off: "46% OFF" },
        { title: "Best Seller Perfumes Combo (50ml x 4)", rating: "4.7", reviews: "472", price: "999", mrp: "1539", off: "74% OFF" },
        { title: "Face Shield Kit", rating: "4.7", reviews: "145", price: "999", mrp: "1243", off: "46% OFF" },
        { title: "Man Curls Combo", rating: "4.6", reviews: "291", price: "899", mrp: "1320", off: "32% OFF" },
        { title: "Blackout Powder (4g)", rating: "4.7", reviews: "223", price: "749", mrp: "1099", off: "31% OFF" },
        { title: "Looksmaxxing Glow Kit", rating: "4.8", reviews: "324", price: "1199", mrp: "1799", off: "33% OFF" },
      ],
      trending: [
        { title: "Whisky Smoke Fragrance Duo", rating: "4.8", reviews: "392", price: "1099", mrp: "1699", off: "35% OFF" },
        { title: "Beard Styling Starter Set", rating: "4.6", reviews: "188", price: "799", mrp: "1169", off: "31% OFF" },
        { title: "Icy Blast Freshness Kit", rating: "4.7", reviews: "205", price: "899", mrp: "1289", off: "30% OFF" },
        { title: "Hydra Boost Face Wash Combo", rating: "4.9", reviews: "276", price: "699", mrp: "999", off: "30% OFF" },
        { title: "Salon Finish Haircare Box", rating: "4.7", reviews: "197", price: "1049", mrp: "1499", off: "30% OFF" },
        { title: "All Day Fresh Deo Trio", rating: "4.5", reviews: "317", price: "649", mrp: "899", off: "28% OFF" },
        { title: "Performance Grooming Kit", rating: "4.8", reviews: "251", price: "999", mrp: "1549", off: "35% OFF" },
        { title: "Active Man Skin Combo", rating: "4.6", reviews: "182", price: "849", mrp: "1299", off: "35% OFF" },
      ],
      "new-launch": [
        { title: "Ultra Shield SPF50 Daily Kit", rating: "4.8", reviews: "99", price: "899", mrp: "1299", off: "31% OFF" },
        { title: "Night Repair Beard Serum Kit", rating: "4.7", reviews: "84", price: "949", mrp: "1399", off: "32% OFF" },
        { title: "De-Tan 4X Max Bundle", rating: "4.8", reviews: "131", price: "1099", mrp: "1599", off: "31% OFF" },
        { title: "Aqua Marine Perfume Combo", rating: "4.6", reviews: "112", price: "999", mrp: "1499", off: "33% OFF" },
        { title: "Keratin Boost Hair Pack", rating: "4.7", reviews: "78", price: "879", mrp: "1249", off: "30% OFF" },
        { title: "Deep Clean Face Defense Set", rating: "4.8", reviews: "95", price: "769", mrp: "1099", off: "30% OFF" },
        { title: "Sport Grooming Fast Kit", rating: "4.6", reviews: "68", price: "999", mrp: "1399", off: "29% OFF" },
        { title: "Urban Men Premium Trial Box", rating: "4.7", reviews: "103", price: "1199", mrp: "1799", off: "33% OFF" },
      ],
    };

    const makeCardHtml = function (card, index, tabName) {
      const imagePath = topDealsImageByTitle[card.title] || topDealsFallbackImages[index % topDealsFallbackImages.length];
      const id = "top-" + tabName + "-" + index;
      const product = {
        id: id,
        title: card.title,
        price: Number(card.price),
        oldPrice: Number(card.mrp),
        off: card.off.toLowerCase(),
        rating: "★ " + card.rating,
        reviews: card.reviews + " reviews",
        image: imagePath,
        tag: tabName === "new-launch" ? "NEW" : "BESTSELLER",
      };
      saveProductToStore(product);
      return [
        '<article class="deal-card" data-product-id="' + id + '">',
        '  <div class="deal-card-image-wrap">',
        '    <img src="' + imagePath + '" alt="' + card.title + ' image" loading="lazy" />',
        "  </div>",
        '  <div class="deal-card-body">',
        '    <h3 class="deal-card-title">' + card.title + "</h3>",
        '    <p class="deal-card-meta"><i class="fa-solid fa-star" aria-hidden="true"></i> ' + card.rating + " | " + card.reviews + " reviews</p>",
        '    <div class="deal-card-price-row">',
        '      <span class="deal-card-price">₹' + card.price + "</span>",
        '      <span class="deal-card-mrp">₹' + card.mrp + "</span>",
        '      <span class="deal-card-off">' + card.off + "</span>",
        "    </div>",
        '    <button class="deal-card-btn" type="button" data-add-to-cart="true" data-product-id="' + id + '" aria-label="Add ' + card.title + " from " + tabName + '">ADD TO CART</button>',
        "  </div>",
        "</article>",
      ].join("");
    };

    const bindCardClicks = function () {
      const cards = Array.from(track.querySelectorAll(".deal-card"));
      cards.forEach(function (card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function (event) {
          if (event.target.closest(".deal-card-btn")) return;
          const id = card.dataset.productId;
          const all = getStoredProducts();
          const selected = all.find(function (item) { return item.id === id; });
          if (!selected) return;
          goToProductPage(selected);
        });
      });
    };

    const renderTab = function (tabName) {
      const cards = cardSets[tabName] || [];
      track.innerHTML = cards.map(function (card, index) {
        return makeCardHtml(card, index, tabName);
      }).join("");
      carousel.scrollLeft = 0;
      bindCardClicks();
    };

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const tabName = tab.dataset.tab;
        tabs.forEach(function (item) {
          const isActive = item === tab;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", String(isActive));
        });
        renderTab(tabName);
      });
    });

    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    const startDrag = function (clientX) {
      isDragging = true;
      dragStartX = clientX;
      dragStartScroll = carousel.scrollLeft;
      carousel.classList.add("is-dragging");
    };

    const moveDrag = function (clientX) {
      if (!isDragging) return;
      const delta = clientX - dragStartX;
      carousel.scrollLeft = dragStartScroll - delta;
    };

    const endDrag = function () {
      isDragging = false;
      carousel.classList.remove("is-dragging");
    };

    carousel.addEventListener("mousedown", function (event) {
      startDrag(event.pageX);
    });

    carousel.addEventListener("mousemove", function (event) {
      if (!isDragging) return;
      event.preventDefault();
      moveDrag(event.pageX);
    });

    window.addEventListener("mouseup", endDrag);
    carousel.addEventListener("mouseleave", endDrag);

    carousel.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) return;
      startDrag(event.touches[0].clientX);
    }, { passive: true });

    carousel.addEventListener("touchmove", function (event) {
      if (!event.touches || !event.touches.length) return;
      moveDrag(event.touches[0].clientX);
    }, { passive: true });

    carousel.addEventListener("touchend", endDrag);
    carousel.addEventListener("touchcancel", endDrag);

    renderTab("top-sellers");
  };

  const initBestSellers = function () {
    const section = document.querySelector("[data-best-sellers]");
    if (!section) return;

    const track = section.querySelector(".best-sellers-track");
    const prevButton = section.querySelector(".best-nav-prev");
    const nextButton = section.querySelector(".best-nav-next");
    if (!track || !prevButton || !nextButton) return;

    const bestSellerImageByTitle = {
      "UrbanGabru Hair Removal Cream Spray 200ml": "./assets/img/UrbanGabru Hair removal cream spray 200ml.avif",
      "UrbanGabru Hair Volumizing Powder Wax 10gm": "./assets/img/UrbanGabru Hair Volumizing Powder Wax 10gm.avif",
      "Urbangabru Casanova Hair Removal Cream Spray 200ml": "./assets/img/Urbangabru Casanova Hair Removal cream Spray 200ml.avif",
      "Urbangabru Beard Growth Oil Booster": "./assets/img/Urbangabru Beard Growth Oil Booster.avif",
      "UrbanGabru Hair Growth Serum Intense": "./assets/img/Urbangabru Jadibuti Hair Growth Oil.avif",
      "UrbanGabru Styling Combo Pack": "./assets/img/Urbangabru Alpha & Beast Deodorant Combo.avif",
      "UrbanGabru De-Tan Brightening Facewash": "./assets/img/UrbanGabru Kozic Acid Skin Lightening Soap.avif",
      "UrbanGabru Beard Care Starter Kit": "./assets/img/Urbangabru Intimate Wash.avif",
    };
    const bestSellerFallbackImages = Object.values(bestSellerImageByTitle);
    const products = [
      { title: "UrbanGabru Hair Removal Cream Spray 200ml", rating: "4.8", reviews: "5,788", price: "499.00", oldPrice: "₹560" },
      { title: "UrbanGabru Hair Volumizing Powder Wax 10gm", rating: "4.9", reviews: "5,787", price: "349.00", oldPrice: "₹390" },
      { title: "Urbangabru Casanova Hair Removal Cream Spray 200ml", rating: "4.9", reviews: "3,204", price: "449.00", oldPrice: "₹520" },
      { title: "Urbangabru Beard Growth Oil Booster", rating: "4.8", reviews: "1,902", price: "349.00", oldPrice: "₹390" },
      { title: "Urbangabru Intimate Wash", rating: "4.7", reviews: "2,221", price: "599.00", oldPrice: "₹699" },
      { title: "Urbangabru Jadibuti Hair Growth Oil", rating: "4.8", reviews: "1,441", price: "699.00", oldPrice: "₹820" },
      { title: "UrbanGabru Kozic Acid Skin Lightening Soap", rating: "4.7", reviews: "2,653", price: "299.00", oldPrice: "₹360" },
      { title: "Urbangabru Alpha & Beast Deodorant Combo", rating: "4.8", reviews: "3,031", price: "799.00", oldPrice: "₹980" },
    ];

    const createCard = function (product, index) {
      const imagePath = bestSellerImageByTitle[product.title] || bestSellerFallbackImages[index % bestSellerFallbackImages.length];
      const id = "best-" + index;
      const storedProduct = {
        id: id,
        title: product.title,
        price: Number(product.price),
        oldPrice: Number(product.oldPrice.replace("₹", "")),
        off: "",
        rating: "★ " + product.rating,
        reviews: product.reviews + " reviews",
        image: imagePath,
        tag: "BESTSELLER",
      };
      saveProductToStore(storedProduct);
      return [
        '<article class="best-card" data-product-id="' + id + '">',
        '  <div class="best-card-image-wrap">',
        '    <span class="best-badge">BESTSELLER</span>',
        '    <img src="' + imagePath + '" alt="' + product.title + '" loading="lazy" />',
        "  </div>",
        '  <h3 class="best-card-title">' + product.title + "</h3>",
        '  <p class="best-rating"><span class="best-rating-stars" aria-hidden="true">' + '<i class="fa-solid fa-star"></i>'.repeat(5) + "</span> " + product.rating + " (" + product.reviews + ")</p>",
        '  <div class="best-price-row">',
        '    <span class="best-price">₹' + product.price + "</span>",
        '    <span class="best-old-price">' + product.oldPrice + "</span>",
        "  </div>",
        '  <p class="best-emi">or ₹16/Month <span>Buy on EMI</span></p>',
        '  <button class="best-card-btn" type="button" data-add-to-cart="true" data-product-id="' + id + '">ADD TO CART</button>',
        "</article>",
      ].join("");
    };

    track.innerHTML = products.map(createCard).join("");
    Array.from(track.querySelectorAll(".best-card")).forEach(function (card) {
      card.style.cursor = "pointer";
      card.addEventListener("click", function (event) {
        if (event.target.closest(".best-card-btn")) return;
        const id = card.dataset.productId;
        const all = getStoredProducts();
        const selected = all.find(function (item) { return item.id === id; });
        if (!selected) return;
        goToProductPage(selected);
      });
    });

    let index = 0;
    let visibleCards = window.innerWidth <= 900 ? 1 : 4;
    const maxIndex = function () {
      return Math.max(0, products.length - visibleCards);
    };

    const updateTrack = function () {
      const firstCard = track.querySelector(".best-card");
      if (!firstCard) return;
      const style = window.getComputedStyle(track);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0");
      const cardWidth = firstCard.getBoundingClientRect().width;
      const offset = index * (cardWidth + gap);
      track.style.transform = "translateX(-" + offset + "px)";
      prevButton.disabled = index === 0;
      nextButton.disabled = index >= maxIndex();
      prevButton.style.opacity = prevButton.disabled ? "0.45" : "1";
      nextButton.style.opacity = nextButton.disabled ? "0.45" : "1";
    };

    prevButton.addEventListener("click", function () {
      index = Math.max(0, index - 1);
      updateTrack();
    });

    nextButton.addEventListener("click", function () {
      index = Math.min(maxIndex(), index + 1);
      updateTrack();
    });

    window.addEventListener("resize", function () {
      visibleCards = window.innerWidth <= 900 ? 1 : 4;
      index = Math.min(index, maxIndex());
      updateTrack();
    });

    updateTrack();
  };

  const initSkinCare = function () {
    const section = document.querySelector("[data-skin-care]");
    if (!section) return;

    const track = section.querySelector(".skin-care-track");
    const prevButton = section.querySelector(".skin-nav-prev");
    const nextButton = section.querySelector(".skin-nav-next");
    const pageText = section.querySelector(".skin-care-page");
    if (!track || !prevButton || !nextButton || !pageText) return;

    const skinCareImageByTitle = {
      "Moisturising Sunscreen Gel for Men | SPF50 PA++++ | For Oily, Dry & Normal Skin": "assets/img/Moisturising Sunscreen Gel for Men.webp",
      "2% Salicylic Acid | Anti-Acne Face Serum": "assets/img/2% Salicylic Acid.webp",
      "Charcoal Face Wash for Men - Charcoal & Niacinamide | Deep Cleansing & Oil Control": "assets/img/Charcoal Face Wash for Men.webp",
      "10% Vitamin C Face Serum for Man | Brightens Skin | Controls Excess Oil": "assets/img/10% Vitamin C Face Serum for Man.webp",
      "Moisturising Gel Cream | Lightweight, Intense Hydration": "assets/img/Moisturising Gel Cream.webp",
      "AHA BHA Exfoliating Face Scrub": "assets/img/Charcoal Face Scrub.webp",
    };
    const skinCareFallbackImages = Object.values(skinCareImageByTitle);

    const products = [
      { title: "Moisturising Sunscreen Gel for Men | SPF50 PA++++ | For Oily, Dry & Normal Skin", rating: "4.79", reviews: "102", off: "16% OFF", price: "335", mrp: "399", cta: "Choose Options", tag: "New Launches" },
      { title: "2% Salicylic Acid | Anti-Acne Face Serum", rating: "4.82", reviews: "22", off: "12% OFF", price: "349", mrp: "399", cta: "Add To Cart", tag: "" },
      { title: "Charcoal Face Wash for Men - Charcoal & Niacinamide | Deep Cleansing & Oil Control", rating: "4.53", reviews: "429", off: "", price: "259", mrp: "", cta: "Add To Cart", tag: "" },
      { title: "10% Vitamin C Face Serum for Man | Brightens Skin | Controls Excess Oil", rating: "4.79", reviews: "397", off: "18% OFF", price: "324", mrp: "399", cta: "Add To Cart", tag: "" },
      { title: "Moisturising Gel Cream | Lightweight, Intense Hydration", rating: "4.75", reviews: "4", off: "14% OFF", price: "299", mrp: "349", cta: "Add To Cart", tag: "" },
      { title: "SPF 50+ Daily Defence Sunscreen Cream", rating: "4.65", reviews: "54", off: "11% OFF", price: "355", mrp: "399", cta: "Add To Cart", tag: "" },
      { title: "Hydra Balance Face Moisturizer for Men", rating: "4.71", reviews: "63", off: "15% OFF", price: "289", mrp: "339", cta: "Add To Cart", tag: "" },
      { title: "AHA BHA Exfoliating Face Scrub", rating: "4.58", reviews: "81", off: "13% OFF", price: "279", mrp: "319", cta: "Add To Cart", tag: "" },
      { title: "Vitamin C + SPF Brightening Combo Pack", rating: "4.77", reviews: "38", off: "20% OFF", price: "499", mrp: "625", cta: "Add To Cart", tag: "" },
      { title: "Oil Control Starter Routine Kit", rating: "4.69", reviews: "114", off: "17% OFF", price: "699", mrp: "849", cta: "Add To Cart", tag: "" },
    ];

    const makeCard = function (product, index) {
      const imagePath = skinCareImageByTitle[product.title] || skinCareFallbackImages[index % skinCareFallbackImages.length];
      const imageUrl = encodeAssetPath(imagePath);
      const id = "skin-" + index;
      const storedProduct = {
        id: id,
        title: product.title,
        price: Number(product.price),
        oldPrice: product.mrp ? Number(product.mrp) : null,
        off: product.off.toLowerCase(),
        rating: "★ " + product.rating,
        reviews: product.reviews + " reviews",
        image: imageUrl,
        tag: product.tag ? product.tag : "BESTSELLER",
      };
      saveProductToStore(storedProduct);
      const oldPriceHtml = product.mrp ? ' <span>₹' + product.mrp + "</span>" : "";
      const offerHtml = product.off ? '<p class="skin-card-offer">' + product.off + "</p>" : '<p class="skin-card-offer">&nbsp;</p>';
      const tagHtml = product.tag ? '<span class="skin-card-tag">' + product.tag + "</span>" : "";

      return [
        '<article class="skin-card" data-product-id="' + id + '">',
        '  <div class="skin-card-image-wrap">',
        "    " + tagHtml,
        '    <img src="' + imageUrl + '" alt="' + product.title + '" loading="lazy" />',
        "  </div>",
        '  <p class="skin-card-rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ' + product.rating + " | " + product.reviews + " Reviews</p>",
        '  <h3 class="skin-card-title">' + product.title + "</h3>",
        "  " + offerHtml,
        '  <p class="skin-card-price">₹' + product.price + oldPriceHtml + "</p>",
        '  <button class="skin-card-btn" type="button" data-add-to-cart="true" data-product-id="' + id + '">' + product.cta + "</button>",
        "</article>",
      ].join("");
    };

    track.innerHTML = products.map(makeCard).join("");
    Array.from(track.querySelectorAll(".skin-card")).forEach(function (card) {
      card.style.cursor = "pointer";
      card.addEventListener("click", function (event) {
        if (event.target.closest(".skin-card-btn")) return;
        const id = card.dataset.productId;
        const all = getStoredProducts();
        const selected = all.find(function (item) { return item.id === id; });
        if (!selected) return;
        goToProductPage(selected);
      });
    });

    let index = 0;
    let visibleCards = window.innerWidth <= 900 ? 1 : 5;
    const maxIndex = function () {
      return Math.max(0, products.length - visibleCards);
    };

    const updateCarousel = function () {
      const firstCard = track.querySelector(".skin-card");
      if (!firstCard) return;
      const style = window.getComputedStyle(track);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0");
      const cardWidth = firstCard.getBoundingClientRect().width;
      const offset = index * (cardWidth + gap);
      track.style.transform = "translateX(-" + offset + "px)";

      prevButton.disabled = index === 0;
      nextButton.disabled = index >= maxIndex();
      prevButton.style.opacity = prevButton.disabled ? "0.45" : "1";
      nextButton.style.opacity = nextButton.disabled ? "0.45" : "1";

      const totalPages = Math.max(1, Math.ceil(products.length / visibleCards));
      const page = Math.min(totalPages, Math.floor(index / visibleCards) + 1);
      pageText.textContent = page + "/" + totalPages;
    };

    prevButton.addEventListener("click", function () {
      index = Math.max(0, index - 1);
      updateCarousel();
    });

    nextButton.addEventListener("click", function () {
      index = Math.min(maxIndex(), index + 1);
      updateCarousel();
    });

    window.addEventListener("resize", function () {
      visibleCards = window.innerWidth <= 900 ? 1 : 5;
      index = Math.min(index, maxIndex());
      updateCarousel();
    });

    updateCarousel();
  };

  initHeroSlider();
  initTopDeals();
  initBestSellers();
  initSkinCare();
})();
