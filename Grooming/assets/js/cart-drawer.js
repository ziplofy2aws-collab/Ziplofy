(function () {
  const CART_KEY = "groomingCart";
  const PRODUCTS_KEY = "groomingProducts";
  const SELECTED_KEY = "groomingSelectedProduct";

  const parseJson = function (raw, fallback) {
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  };

  const getCart = function () {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved) return [];
    const parsed = parseJson(saved, []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const saveCart = function (items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const getCatalog = function () {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    const products = parseJson(saved, []);
    return Array.isArray(products) ? products : [];
  };

  const normalizeProduct = function (raw) {
    if (!raw || !raw.id || !raw.title) return null;
    const priceValue = Number(raw.price);
    const oldPriceValue = raw.oldPrice === null || raw.oldPrice === undefined || raw.oldPrice === "" ? null : Number(raw.oldPrice);
    return {
      id: String(raw.id),
      title: String(raw.title),
      image: raw.image || "./assets/img/banner-1.png",
      price: Number.isFinite(priceValue) ? priceValue : 0,
      oldPrice: Number.isFinite(oldPriceValue) ? oldPriceValue : null,
    };
  };

  const formatPrice = function (value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  };

  const findProduct = function (productId) {
    const catalog = getCatalog();
    const fromCatalog = catalog.find(function (item) { return String(item.id) === String(productId); });
    const normalizedFromCatalog = normalizeProduct(fromCatalog);
    if (normalizedFromCatalog) return normalizedFromCatalog;

    const selectedRaw = localStorage.getItem(SELECTED_KEY);
    const selected = normalizeProduct(parseJson(selectedRaw, null));
    if (selected && String(selected.id) === String(productId)) return selected;
    return selected;
  };

  const addToCart = function (product) {
    const normalized = normalizeProduct(product);
    if (!normalized) return;
    const cart = getCart();
    const existing = cart.find(function (item) { return item.id === normalized.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: normalized.id,
        title: normalized.title,
        image: normalized.image,
        price: normalized.price,
        oldPrice: normalized.oldPrice,
        qty: 1,
      });
    }
    saveCart(cart);
    syncCartBadges();
    renderDrawer();
  };

  const updateQty = function (id, delta) {
    const cart = getCart();
    const item = cart.find(function (entry) { return entry.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      const next = cart.filter(function (entry) { return entry.id !== id; });
      saveCart(next);
    } else {
      saveCart(cart);
    }
    syncCartBadges();
    renderDrawer();
  };

  const removeItem = function (id) {
    const cart = getCart().filter(function (entry) { return entry.id !== id; });
    saveCart(cart);
    syncCartBadges();
    renderDrawer();
  };

  const totalCount = function () {
    return getCart().reduce(function (sum, item) { return sum + Number(item.qty || 0); }, 0);
  };

  const totalPrice = function () {
    return getCart().reduce(function (sum, item) { return sum + Number(item.price || 0) * Number(item.qty || 0); }, 0);
  };

  const syncCartBadges = function () {
    const count = totalCount();
    const badges = Array.from(document.querySelectorAll(".cart-count"));
    badges.forEach(function (badge) {
      badge.textContent = String(count);
      badge.style.display = count > 0 ? "inline-block" : "none";
    });
  };

  const ensureDrawerShell = function () {
    if (document.querySelector("[data-cart-overlay]")) return;
    const shell = [
      '<div class="cart-overlay" data-cart-overlay></div>',
      '<aside class="cart-drawer" data-cart-drawer aria-label="Shopping cart drawer">',
      '  <header class="cart-drawer-header">',
      '    <h2 class="cart-drawer-title">Your Cart <span data-cart-title-count></span></h2>',
      '    <button class="cart-close" type="button" aria-label="Close cart"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>',
      "  </header>",
      '  <div class="cart-drawer-body" data-cart-body></div>',
      '  <div class="cart-sticky" data-cart-sticky></div>',
      "</aside>",
    ].join("");
    document.body.insertAdjacentHTML("beforeend", shell);

    const overlay = document.querySelector("[data-cart-overlay]");
    const closeBtn = document.querySelector(".cart-close");
    overlay.addEventListener("click", closeDrawer);
    closeBtn.addEventListener("click", closeDrawer);
  };

  const openDrawer = function () {
    ensureDrawerShell();
    renderDrawer();
    const overlay = document.querySelector("[data-cart-overlay]");
    const drawer = document.querySelector("[data-cart-drawer]");
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = function () {
    const overlay = document.querySelector("[data-cart-overlay]");
    const drawer = document.querySelector("[data-cart-drawer]");
    if (!overlay || !drawer) return;
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  const renderDrawer = function () {
    ensureDrawerShell();
    const cart = getCart();
    const body = document.querySelector("[data-cart-body]");
    const sticky = document.querySelector("[data-cart-sticky]");
    const titleCount = document.querySelector("[data-cart-title-count]");
    const count = totalCount();
    titleCount.textContent = count > 0 ? "(" + count + ")" : "";

    if (!cart.length) {
      body.innerHTML = [
        '<div class="cart-empty-wrap">',
        '  <div class="cart-empty-visual">',
        '    <i class="fa-solid fa-cart-xmark" aria-hidden="true"></i>',
        '    <p class="cart-empty-title">Your Cart is empty</p>',
        "  </div>",
        '  <h3 class="cart-section-title">Recommended for you</h3>',
        "  <div class=\"cart-items\">",
        '    <article class="cart-item">',
        '      <img src="./assets/img/Don Beardo\'s Beard Growth Pro Kit.avif" alt="Recommended product" />',
        "      <div>",
        '        <p class="cart-item-title">Don Beardo\'s Beard Growth Pro Kit</p>',
        '        <p class="cart-item-price"><span>₹1,961</span>₹999</p>',
        "      </div>",
        '      <button class="cart-remove" type="button" data-quick-add="true">Add</button>',
        "    </article>",
        "  </div>",
        "</div>",
      ].join("");
      sticky.innerHTML = '<button class="cart-empty-shop" type="button">SHOP NOW</button>';
      return;
    }

    body.innerHTML = [
      '<div class="cart-items">',
      cart.map(function (item) {
        const oldPrice = item.oldPrice ? "<span>" + formatPrice(item.oldPrice) + "</span>" : "";
        return [
          '<article class="cart-item">',
          '  <img src="' + item.image + '" alt="' + item.title + '" />',
          "  <div>",
          '    <p class="cart-item-title">' + item.title + "</p>",
          '    <p class="cart-item-price">' + oldPrice + formatPrice(item.price) + "</p>",
          "  </div>",
          '  <div class="cart-item-actions">',
          '    <div class="cart-qty">',
          '      <button type="button" data-cart-dec="' + item.id + '">-</button>',
          "      <span>" + item.qty + "</span>",
          '      <button type="button" data-cart-inc="' + item.id + '">+</button>',
          "    </div>",
          '    <button class="cart-remove" type="button" data-cart-remove="' + item.id + '">Add</button>',
          "  </div>",
          "</article>",
        ].join("");
      }).join(""),
      "</div>",
    ].join("");

    sticky.innerHTML = '<button class="cart-checkout" type="button"><strong>Checkout</strong><span>' + formatPrice(totalPrice()) + "</span></button>";
  };

  const initCartActions = function () {
    document.addEventListener("click", function (event) {
      const cartBtn = event.target.closest(".cart-btn");
      if (cartBtn) {
        event.preventDefault();
        openDrawer();
        return;
      }

      const addBtn = event.target.closest("[data-add-to-cart]");
      if (addBtn) {
        event.preventDefault();
        event.stopPropagation();
        const id = addBtn.getAttribute("data-product-id");
        const product = findProduct(id);
        if (!product) return;
        addToCart(product);
        openDrawer();
        return;
      }

      const inc = event.target.closest("[data-cart-inc]");
      if (inc) {
        event.preventDefault();
        updateQty(inc.getAttribute("data-cart-inc"), 1);
        return;
      }

      const dec = event.target.closest("[data-cart-dec]");
      if (dec) {
        event.preventDefault();
        updateQty(dec.getAttribute("data-cart-dec"), -1);
        return;
      }

      const remove = event.target.closest("[data-cart-remove]");
      if (remove) {
        event.preventDefault();
        removeItem(remove.getAttribute("data-cart-remove"));
        return;
      }

      const quickAdd = event.target.closest("[data-quick-add]");
      if (quickAdd) {
        event.preventDefault();
        const fallback = normalizeProduct({
          id: "beard-growth-pro-kit",
          title: "Don Beardo's Beard Growth Pro Kit",
          image: "./assets/img/Don Beardo's Beard Growth Pro Kit.avif",
          price: 999,
          oldPrice: 1961,
        });
        addToCart(fallback);
        return;
      }
    });
  };

  ensureDrawerShell();
  syncCartBadges();
  initCartActions();
})();
