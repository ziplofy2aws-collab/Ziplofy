(function () {
  const getProducts = function () {
    try {
      const saved = localStorage.getItem("groomingProducts");
      if (saved) return JSON.parse(saved);
    } catch (error) {
      return [];
    }
    return [];
  };

  const fallbackProducts = [
    { id: "blue-curse-edp", title: "Blue Curse Perfume EDP (100ml)", price: 699, oldPrice: 1500, off: "54% off", rating: "★ 4.7", reviews: "212 reviews", image: "./assets/img/Promo-1.png", tag: "BESTSELLER" },
    { id: "sea-borne-edp", title: "Sea Borne Perfume EDP (100ml)", price: 699, oldPrice: 1500, off: "54% off", rating: "★ 4.6", reviews: "175 reviews", image: "./assets/img/Promo-2.png", tag: "BESTSELLER" },
    { id: "godfather-kit", title: "Beardo Godfather Multi-grooming Trimmer Kit", price: 2799, oldPrice: 3499, off: "21% off", rating: "★ 4.8", reviews: "592 reviews", image: "./assets/img/banner-1.png", tag: "BESTSELLER" },
    { id: "sport-spf80", title: "Beardo Sport Sunscreen Spray SPF 80 (100ml)", price: 599, oldPrice: 699, off: "15% off", rating: "★ 4.5", reviews: "98 reviews", image: "./assets/img/banner-4.png", tag: "BESTSELLER" },
    { id: "ball-safe-cream", title: "Ball Safe Hair Removal Cream (100ml)", price: 499, oldPrice: null, off: "", rating: "", reviews: "", image: "./assets/img/banner-2.png", tag: "SOLD OUT" },
    { id: "alpha-spice-elixir", title: "Alpha Spice Elixir (100ml)", price: 1200, oldPrice: 2000, off: "40% off", rating: "★ 4.2", reviews: "31 reviews", image: "./assets/img/banner-3.png", tag: "BESTSELLER" },
    { id: "max-sunscreen-gel", title: "Max Sunscreen Cooling Gel SPF 60 (50g)", price: 399, oldPrice: 450, off: "12% off", rating: "★ 4.9", reviews: "15 reviews", image: "./assets/img/banner-4.png", tag: "NEW" },
    { id: "alpha-amber-elixir", title: "Alpha Amber Elixir (100ml)", price: 1200, oldPrice: 2000, off: "40% off", rating: "★ 4.0", reviews: "1 review", image: "./assets/img/banner-5.png", tag: "BESTSELLER" },
  ];

  const params = new URLSearchParams(window.location.search);
  const pid = params.get("pid");
  let selectedFromStore = null;
  try {
    const selectedRaw = localStorage.getItem("groomingSelectedProduct");
    if (selectedRaw) selectedFromStore = JSON.parse(selectedRaw);
  } catch (error) {
    selectedFromStore = null;
  }

  const products = getProducts();
  const list = products.length ? products : fallbackProducts;
  const product = pid
    ? list.find(function (item) { return item.id === pid; })
    : selectedFromStore;
  const finalProduct = product || selectedFromStore;
  if (!finalProduct) return;
  const normalizedCurrent = {
    id: finalProduct.id,
    title: finalProduct.title,
    price: Number(finalProduct.price),
    oldPrice: finalProduct.oldPrice === null || finalProduct.oldPrice === undefined ? null : Number(finalProduct.oldPrice),
    image: finalProduct.image,
  };
  const existingProducts = getProducts();
  if (!existingProducts.some(function (item) { return item.id === normalizedCurrent.id; })) {
    existingProducts.push(normalizedCurrent);
    localStorage.setItem("groomingProducts", JSON.stringify(existingProducts));
  }

  const titleEl = document.getElementById("product-title");
  const imageEl = document.getElementById("product-image");
  const thumb1El = document.getElementById("product-thumb-1");
  const thumb2El = document.getElementById("product-thumb-2");
  const thumb3El = document.getElementById("product-thumb-3");
  const thumb4El = document.getElementById("product-thumb-4");
  const thumb5El = document.getElementById("product-thumb-5");
  const ratingEl = document.getElementById("product-rating");
  const reviewsEl = document.getElementById("product-reviews");
  const priceCurrentEl = document.getElementById("product-price-current");
  const priceOldEl = document.getElementById("product-price-old");
  const priceOffEl = document.getElementById("product-price-off");
  const qtyEl = document.getElementById("product-qty");
  const mainAddBtn = document.querySelector(".btn-primary");

  const formatPrice = function (value) {
    if (value === null || value === undefined) return "";
    return "₹" + Number(value).toLocaleString("en-IN");
  };

  if (titleEl) titleEl.textContent = finalProduct.title;
  if (imageEl) {
    imageEl.src = finalProduct.image;
    imageEl.alt = finalProduct.title;
  }
  if (thumb1El) thumb1El.src = finalProduct.image;
  if (thumb2El) thumb2El.src = finalProduct.image;
  if (thumb3El) thumb3El.src = finalProduct.image;
  if (thumb4El) thumb4El.src = finalProduct.image;
  if (thumb5El) thumb5El.src = finalProduct.image;
  if (ratingEl) ratingEl.textContent = finalProduct.rating ? finalProduct.rating.replace("★", "").trim() : "4.8";
  if (reviewsEl) reviewsEl.textContent = finalProduct.reviews || "15 reviews";
  if (priceCurrentEl) priceCurrentEl.textContent = formatPrice(finalProduct.price);
  if (priceOldEl) priceOldEl.textContent = finalProduct.oldPrice ? formatPrice(finalProduct.oldPrice) : "";
  if (priceOffEl) priceOffEl.textContent = finalProduct.off ? finalProduct.off.toUpperCase() : "";
  if (qtyEl) qtyEl.textContent = "50g";
  if (mainAddBtn) {
    mainAddBtn.setAttribute("data-add-to-cart", "true");
    mainAddBtn.setAttribute("data-product-id", finalProduct.id);
  }

  const boughtCards = Array.from(document.querySelectorAll(".bought-card"));
  boughtCards.forEach(function (card, index) {
    const titleEl = card.querySelector("h3");
    const priceEl = card.querySelector(".bought-price");
    const imageEl = card.querySelector("img");
    const addBtn = card.querySelector("button");
    if (!titleEl || !priceEl || !addBtn) return;

    const rawText = priceEl.textContent || "";
    const values = rawText.match(/\d[\d,]*/g) || [];
    const currentPrice = values.length ? Number(values[0].replace(/,/g, "")) : 0;
    const oldPrice = values.length > 1 ? Number(values[1].replace(/,/g, "")) : null;
    const id = "bought-" + index + "-" + titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const product = {
      id: id,
      title: titleEl.textContent.trim(),
      price: currentPrice,
      oldPrice: oldPrice,
      image: imageEl ? imageEl.getAttribute("src") : "./assets/img/banner-1.png",
    };

    try {
      const existing = getProducts();
      const hasProduct = existing.some(function (item) { return item.id === id; });
      if (!hasProduct) {
        existing.push(product);
        localStorage.setItem("groomingProducts", JSON.stringify(existing));
      }
    } catch (error) {
      // no-op
    }

    addBtn.setAttribute("data-add-to-cart", "true");
    addBtn.setAttribute("data-product-id", id);
  });

  const toggles = Array.from(document.querySelectorAll("[data-detail-toggle]"));
  toggles.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-detail-toggle");
      const panel = document.querySelector('[data-detail-panel="' + target + '"]');
      if (!panel) return;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      const symbol = button.querySelector(".detail-symbol");
      const symbolIcon = symbol ? symbol.querySelector(".js-detail-symbol-icon") : null;
      button.setAttribute("aria-expanded", String(!isOpen));
      if (isOpen) {
        panel.hidden = true;
        if (symbolIcon) symbolIcon.className = "fa-solid fa-plus js-detail-symbol-icon";
      } else {
        panel.hidden = false;
        if (symbolIcon) symbolIcon.className = "fa-solid fa-minus js-detail-symbol-icon";
      }
    });
  });
})();
