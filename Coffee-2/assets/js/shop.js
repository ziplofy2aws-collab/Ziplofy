/* Brewloom Coffee Co. — Shop page interactions */

(function () {
  "use strict";

  /* ── Shop filter + sort ── */

  const grid = document.querySelector("[data-cf2-grid]");
  if (!grid) return;

  const filterBar = document.querySelector("[data-cf2-filters]");
  const sortSelect = document.querySelector("[data-cf2-sort]");
  const countEl = document.querySelector("[data-cf2-count]");
  const emptyEl = document.querySelector("[data-cf2-empty]");
  const allCards = Array.from(grid.querySelectorAll(".cf2-pcard"));
  let activeFilter = "all";

  function apply() {
    let visible = allCards.filter(
      (card) => activeFilter === "all" || card.dataset.category === activeFilter
    );

    const sortVal = sortSelect ? sortSelect.value : "featured";
    const sorted = visible.slice();
    if (sortVal === "price-asc") {
      sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    } else if (sortVal === "price-desc") {
      sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    } else if (sortVal === "name-asc") {
      sorted.sort((a, b) => (a.dataset.name || "").localeCompare(b.dataset.name || ""));
    }

    allCards.forEach((card) => (card.style.display = "none"));
    sorted.forEach((card) => {
      card.style.display = "";
      grid.appendChild(card);
    });

    if (countEl) {
      countEl.textContent = `${visible.length} product${visible.length === 1 ? "" : "s"}`;
    }
    if (emptyEl) emptyEl.hidden = visible.length !== 0;
  }

  if (filterBar) {
    filterBar.addEventListener("click", (event) => {
      const chip = event.target.closest(".cf2-chip");
      if (!chip) return;
      filterBar.querySelectorAll(".cf2-chip").forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.dataset.filter;
      apply();
    });
  }

  if (sortSelect) sortSelect.addEventListener("change", apply);
  apply();
})();
