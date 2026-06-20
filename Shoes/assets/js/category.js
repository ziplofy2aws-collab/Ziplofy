(() => {
  const PRODUCT_STORAGE_KEY = "stepupSelectedProduct";

  const readText = (root, selectors) => {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) {
        return text;
      }
    }
    return "";
  };

  const saveSelectedProduct = (card, productKey) => {
    if (!productKey) {
      return;
    }

    const imageEl = card.querySelector(".catalog-media img");
    const selectedProduct = {
      key: productKey,
      title: readText(card, [".catalog-title-row h4"]) || "Urban Runner X",
      tag: readText(card, [".catalog-sub"]) || "Premium comfort and performance",
      image: imageEl?.getAttribute("src") || "assets/img/product-main-buds.png",
      oldPrice: readText(card, [".catalog-price del"]) || "₹6,999",
      newPrice: readText(card, [".catalog-price strong"]) || "₹3,999",
      discount: "43% off",
    };

    try {
      sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(selectedProduct));
    } catch (_error) {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
  };

  const filterToggles = Array.from(document.querySelectorAll(".filter-toggle"));

  filterToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".filter-group");
      if (!group) {
        return;
      }
      const isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      const icon = toggle.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "bi bi-dash" : "bi bi-plus";
      }
    });
  });

  const mobileFilterTrigger = document.getElementById("mobileFilterTrigger");
  const filterDrawerClose = document.getElementById("filterDrawerClose");
  const filterDrawerBackdrop = document.getElementById("filterDrawerBackdrop");
  const setFilterDrawerOpen = (open) => {
    document.body.classList.toggle("filter-drawer-open", open);
    if (mobileFilterTrigger) {
      mobileFilterTrigger.setAttribute("aria-expanded", open ? "true" : "false");
    }
  };
  const closeFilterDrawer = () => setFilterDrawerOpen(false);

  mobileFilterTrigger?.addEventListener("click", () => {
    setFilterDrawerOpen(true);
  });
  filterDrawerClose?.addEventListener("click", closeFilterDrawer);
  filterDrawerBackdrop?.addEventListener("click", closeFilterDrawer);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilterDrawer();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      closeFilterDrawer();
    }
  });

  const catalogCards = Array.from(document.querySelectorAll(".catalog-card[data-product]"));

  catalogCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const productKey = card.dataset.product;
      if (!productKey) {
        return;
      }
      event.preventDefault();
      saveSelectedProduct(card, productKey);
      window.location.href = `product.html?product=${encodeURIComponent(productKey)}`;
    });
  });
})();
