(function initShop() {
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
  const sizeBtns = Array.from(document.querySelectorAll(".size-filter"));
  const sidebar = document.getElementById("shop-sidebar");
  const backdrop = document.getElementById("shop-filter-backdrop");
  const toggle = document.getElementById("shop-filter-toggle");
  const closeBtn = document.getElementById("shop-filter-close");
  const applyBtn = document.getElementById("shop-filter-apply");

  let activeCollection = "all";
  let activeSize = "all";
  const PRICE_MIN = Number(minInput?.min || 999);
  const PRICE_MAX = Number(maxInput?.max || 4999);

  function formatPrice(n) {
    return `₹ ${Math.round(n).toLocaleString("en-IN")}`;
  }

  function syncRangeUI() {
    if (!minInput || !maxInput || !rangeEl) return;
    let minVal = Number(minInput.value);
    let maxVal = Number(maxInput.value);
    if (minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
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
    const totals = { all: cards.length };
    cards.forEach((card) => {
      const col = card.dataset.collection || "all";
      totals[col] = (totals[col] || 0) + 1;
    });
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
      const sizes = (card.dataset.sizes || "").split(",");
      const inPrice = price >= minVal && price <= maxVal;
      const inCollection = activeCollection === "all" || collection === activeCollection;
      const inSize = activeSize === "all" || sizes.includes(activeSize);
      return inPrice && inCollection && inSize;
    });
  }

  function sortCards(list) {
    const mode = sortEl?.value || "new-old";
    return [...list].sort((a, b) => {
      const pa = Number(a.dataset.price);
      const pb = Number(b.dataset.price);
      const na = (a.dataset.name || "").toLowerCase();
      const nb = (b.dataset.name || "").toLowerCase();
      if (mode === "price-asc") return pa - pb;
      if (mode === "price-desc") return pb - pa;
      if (mode === "name-asc") return na.localeCompare(nb);
      if (mode === "name-desc") return nb.localeCompare(na);
      return Number(b.dataset.date || 0) - Number(a.dataset.date || 0);
    });
  }

  function render() {
    const visible = sortCards(getVisibleCards());
    cards.forEach((card) => {
      card.hidden = true;
    });
    visible.forEach((card) => {
      card.hidden = false;
      grid.appendChild(card);
    });
    if (countEl) countEl.textContent = `${visible.length} PRODUCTS`;
    if (emptyEl) emptyEl.classList.toggle("is-visible", visible.length === 0);
  }

  function openFilters() {
    sidebar?.classList.add("is-open");
    backdrop?.classList.add("is-visible");
    backdrop && (backdrop.hidden = false);
    toggle?.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-filter-open");
  }

  function closeFilters() {
    sidebar?.classList.remove("is-open");
    backdrop?.classList.remove("is-visible");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-filter-open");
    setTimeout(() => {
      if (backdrop && !sidebar?.classList.contains("is-open")) backdrop.hidden = true;
    }, 250);
  }

  collectionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      collectionBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeCollection = btn.dataset.collection || "all";
      render();
    });
  });

  sizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeSize = btn.dataset.size || "all";
      render();
    });
  });

  minInput?.addEventListener("input", () => {
    syncRangeUI();
    render();
  });
  maxInput?.addEventListener("input", () => {
    syncRangeUI();
    render();
  });
  sortEl?.addEventListener("change", render);

  toggle?.addEventListener("click", openFilters);
  closeBtn?.addEventListener("click", closeFilters);
  backdrop?.addEventListener("click", closeFilters);
  applyBtn?.addEventListener("click", closeFilters);

  updateCollectionCounts();
  syncRangeUI();
  render();
})();
