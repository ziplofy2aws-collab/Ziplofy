(() => {
  const toggles = document.querySelectorAll("[data-filter-toggle]");
  const cards = Array.from(document.querySelectorAll(".cat-card"));
  const productCount = document.querySelector(".cat-products-top p");
  const filterInputs = Array.from(
    document.querySelectorAll("input[data-filter-group]")
  );
  const priceRange = document.querySelector("[data-price-range]");
  const priceMaxLabel = document.querySelector("[data-price-max-label]");
  const filterOpenBtn = document.querySelector("[data-cat-filter-open]");
  const filterCloseBtn = document.querySelector("[data-cat-filter-close]");
  const filterOverlay = document.querySelector("[data-cat-filter-overlay]");
  const sortBtn = document.querySelector("[data-cat-sort-btn]");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panel = toggle.nextElementSibling;
      if (!panel || !panel.classList.contains("cat-filter-panel")) return;
      const isOpen = toggle.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.classList.toggle("is-open", isOpen);
    });
  });

  const getSelected = (group) =>
    filterInputs
      .filter((input) => input.dataset.filterGroup === group && input.checked)
      .map((input) => input.value);

  const matchGroup = (cardValue, selectedValues) => {
    if (!selectedValues.length) return true;
    const values = String(cardValue || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return selectedValues.some((value) => values.includes(value));
  };

  const applyFilters = () => {
    const selectedCategory = getSelected("category");
    const selectedSubcategory = getSelected("subcategory");
    const selectedRange = getSelected("range");
    const selectedSkin = getSelected("skin");
    const selectedCountry = getSelected("country");
    const maxPrice = priceRange ? Number(priceRange.value) : Number.POSITIVE_INFINITY;

    let visibleCount = 0;
    cards.forEach((card) => {
      const cardPrice = Number(card.dataset.price || "0");
      const show =
        cardPrice <= maxPrice &&
        matchGroup(card.dataset.category, selectedCategory) &&
        matchGroup(card.dataset.subcategory, selectedSubcategory) &&
        matchGroup(card.dataset.range, selectedRange) &&
        matchGroup(card.dataset.skin, selectedSkin) &&
        matchGroup(card.dataset.country, selectedCountry);

      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount += 1;
    });

    if (productCount) {
      productCount.textContent = `${visibleCount} product${visibleCount === 1 ? "" : "s"}`;
    }
  };

  filterInputs.forEach((input) => {
    input.addEventListener("change", applyFilters);
  });

  if (priceRange) {
    priceRange.addEventListener("input", () => {
      if (priceMaxLabel) {
        priceMaxLabel.textContent = `₹ ${priceRange.value}`;
      }
      applyFilters();
    });
  }

  const setFilterOpen = (open) => {
    document.body.classList.toggle("cat-filter-open", open);
    if (filterOverlay) filterOverlay.hidden = !open;
  };

  filterOpenBtn?.addEventListener("click", () => setFilterOpen(true));
  filterCloseBtn?.addEventListener("click", () => setFilterOpen(false));
  filterOverlay?.addEventListener("click", () => setFilterOpen(false));
  sortBtn?.addEventListener("click", () => {
    const sortToggle = document.querySelector(".cat-products-top button");
    sortToggle?.click();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setFilterOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setFilterOpen(false);
  });

  applyFilters();
})();
