/* Shop filters, sort, and view toggle */
(function initShopFilters() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".shop-card"));
  const countEl = document.getElementById("shop-product-count");
  const emptyEl = document.getElementById("shop-empty");
  const sortEl = document.getElementById("shop-sort");
  const minInput = document.getElementById("price-min");
  const maxInput = document.getElementById("price-max");
  const minLabel = document.getElementById("price-min-label");
  const maxLabel = document.getElementById("price-max-label");
  const rangeEl = document.getElementById("price-range");
  const collectionBtns = Array.from(document.querySelectorAll(".collection-filter"));
  const viewGrid = document.getElementById("view-grid");
  const viewList = document.getElementById("view-list");

  let activeCollection = "all";
  const PRICE_MIN = Number(minInput?.min || 50);
  const PRICE_MAX = Number(maxInput?.max || 293000);

  function formatPrice(n) {
    return `RS. ${Math.round(n).toLocaleString("en-IN")}`;
  }

  function syncRangeUI() {
    if (!minInput || !maxInput || !rangeEl) return;
    let minVal = Number(minInput.value);
    let maxVal = Number(maxInput.value);
    if (minVal > maxVal) {
      const tmp = minVal;
      minVal = maxVal;
      maxVal = tmp;
      minInput.value = minVal;
      maxInput.value = maxVal;
    }
    const minPct = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    const maxPct = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    rangeEl.style.left = `${minPct}%`;
    rangeEl.style.width = `${maxPct - minPct}%`;
    if (minLabel) minLabel.textContent = formatPrice(minVal);
    if (maxLabel) maxLabel.textContent = formatPrice(maxVal);
  }

  function updateCollectionCounts() {
    const totals = {};
    cards.forEach((card) => {
      const col = card.dataset.collection || "all";
      totals[col] = (totals[col] || 0) + 1;
    });
    totals.all = cards.length;

    document.querySelectorAll("[data-count-for]").forEach((el) => {
      const key = el.getAttribute("data-count-for");
      el.textContent = `(${totals[key] || 0})`;
    });
  }

  function getVisibleCards() {
    const minVal = Math.min(Number(minInput.value), Number(maxInput.value));
    const maxVal = Math.max(Number(minInput.value), Number(maxInput.value));

    return cards.filter((card) => {
      const price = Number(card.dataset.price);
      const collection = card.dataset.collection;
      const inPrice = price >= minVal && price <= maxVal;
      const inCollection = activeCollection === "all" || collection === activeCollection;
      return inPrice && inCollection;
    });
  }

  function sortCards(list) {
    const mode = sortEl?.value || "new-old";
    return [...list].sort((a, b) => {
      const pa = Number(a.dataset.price);
      const pb = Number(b.dataset.price);
      const da = Number(a.dataset.date || 0);
      const db = Number(b.dataset.date || 0);
      const na = (a.dataset.name || "").toLowerCase();
      const nb = (b.dataset.name || "").toLowerCase();

      if (mode === "price-asc") return pa - pb;
      if (mode === "price-desc") return pb - pa;
      if (mode === "name-asc") return na.localeCompare(nb);
      if (mode === "old-new") return da - db;
      return db - da; // new-old
    });
  }

  function applyFilters() {
    syncRangeUI();
    const visible = sortCards(getVisibleCards());
    const visibleSet = new Set(visible);

    cards.forEach((card) => {
      card.classList.toggle("is-hidden", !visibleSet.has(card));
    });

    // Re-append in sorted order for visible items
    visible.forEach((card) => grid.appendChild(card));

    if (countEl) countEl.textContent = `${visible.length} PRODUCTS`;
    if (emptyEl) emptyEl.hidden = visible.length > 0;
  }

  collectionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCollection = btn.dataset.collection || "all";
      collectionBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      applyFilters();
    });
  });

  minInput?.addEventListener("input", applyFilters);
  maxInput?.addEventListener("input", applyFilters);
  sortEl?.addEventListener("change", applyFilters);

  viewGrid?.addEventListener("click", () => {
    grid.classList.remove("is-list");
    viewGrid.classList.add("is-active");
    viewList?.classList.remove("is-active");
    viewGrid.setAttribute("aria-pressed", "true");
    viewList?.setAttribute("aria-pressed", "false");
  });

  viewList?.addEventListener("click", () => {
    grid.classList.add("is-list");
    viewList.classList.add("is-active");
    viewGrid?.classList.remove("is-active");
    viewList.setAttribute("aria-pressed", "true");
    viewGrid?.setAttribute("aria-pressed", "false");
  });

  // Support ?collection=earrings from other pages
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("collection");
  if (initial) {
    const match = collectionBtns.find((b) => b.dataset.collection === initial);
    if (match) {
      activeCollection = initial;
      collectionBtns.forEach((b) => b.classList.toggle("is-active", b === match));
    }
  }

  updateCollectionCounts();
  applyFilters();

  /* Mobile filter bottom sheet */
  const filterToggle = document.getElementById("shop-filter-toggle");
  const filterClose = document.getElementById("shop-filter-close");
  const filterApply = document.getElementById("shop-filter-apply");
  const filterBackdrop = document.getElementById("shop-filter-backdrop");
  const sidebar = document.getElementById("shop-sidebar");

  function openFilters() {
    if (!sidebar) return;
    sidebar.classList.add("is-open");
    filterBackdrop?.classList.add("is-open");
    filterBackdrop?.removeAttribute("hidden");
    document.body.classList.add("filters-open");
    filterToggle?.setAttribute("aria-expanded", "true");
  }

  function closeFilters() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    filterBackdrop?.classList.remove("is-open");
    document.body.classList.remove("filters-open");
    filterToggle?.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!sidebar.classList.contains("is-open")) {
        filterBackdrop?.setAttribute("hidden", "");
      }
    }, 320);
  }

  filterToggle?.addEventListener("click", openFilters);
  filterClose?.addEventListener("click", closeFilters);
  filterApply?.addEventListener("click", closeFilters);
  filterBackdrop?.addEventListener("click", closeFilters);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar?.classList.contains("is-open")) {
      closeFilters();
    }
  });
})();
