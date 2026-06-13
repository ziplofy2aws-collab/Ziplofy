(function () {
  var grid = document.querySelector("[data-sb-shop-grid]");
  if (!grid) return;

  var cards = Array.from(grid.querySelectorAll("[data-sb-shop-card]"));
  var countEls = document.querySelectorAll("[data-sb-shop-count]");
  var emptyEl = document.querySelector("[data-sb-shop-empty]");
  var clearBtn = document.querySelector("[data-sb-filter-clear]");
  var sortSelect = document.getElementById("sb-shop-sort");
  var filterGroups = document.querySelectorAll("[data-sb-shop-filters] .sb-shop__filter-group");

  var FILTER_KEYS = ["price", "coverage", "finish", "color"];

  function getSelectedFilters() {
    var selected = {};
    FILTER_KEYS.forEach(function (key) {
      selected[key] = Array.from(
        document.querySelectorAll(
          '[data-sb-shop-filters] input[name="' + key + '"]:checked'
        )
      ).map(function (input) {
        return input.value;
      });
    });
    return selected;
  }

  function hasActiveFilters(selected) {
    return FILTER_KEYS.some(function (key) {
      return selected[key].length > 0;
    });
  }

  function cardMatchesFilters(card, selected) {
    return FILTER_KEYS.every(function (key) {
      var values = selected[key];
      if (!values.length) return true;
      var cardValue = card.getAttribute("data-" + key);
      return values.indexOf(cardValue) !== -1;
    });
  }

  function getVisibleCards(selected) {
    return cards.filter(function (card) {
      return cardMatchesFilters(card, selected);
    });
  }

  function sortCards(visible, sortValue) {
    var sorted = visible.slice();
    if (sortValue === "Price: Low to High") {
      sorted.sort(function (a, b) {
        return (
          Number(a.getAttribute("data-price-num")) -
          Number(b.getAttribute("data-price-num"))
        );
      });
    } else if (sortValue === "Price: High to Low") {
      sorted.sort(function (a, b) {
        return (
          Number(b.getAttribute("data-price-num")) -
          Number(a.getAttribute("data-price-num"))
        );
      });
    }
    return sorted;
  }

  function applyFilters() {
    var selected = getSelectedFilters();
    var visible = getVisibleCards(selected);
    var sortValue = sortSelect ? sortSelect.value : "Featured";
    var ordered = sortCards(visible, sortValue);

    cards.forEach(function (card) {
      card.hidden = true;
      card.classList.remove("sb-shop-card--visible");
    });

    ordered.forEach(function (card) {
      card.hidden = false;
      card.classList.add("sb-shop-card--visible");
      grid.appendChild(card);
    });

    countEls.forEach(function (el) {
      el.textContent = String(visible.length);
    });
    if (emptyEl) emptyEl.hidden = visible.length > 0;
    if (grid) grid.hidden = visible.length === 0;
    if (clearBtn) clearBtn.hidden = !hasActiveFilters(selected);
  }

  function initFilterToggles() {
    filterGroups.forEach(function (group) {
      var toggle = group.querySelector("[data-sb-filter-toggle]");
      var panel = group.querySelector(".sb-shop__filter-panel");
      if (!toggle || !panel) return;

      toggle.addEventListener("click", function () {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        filterGroups.forEach(function (other) {
          var otherToggle = other.querySelector("[data-sb-filter-toggle]");
          var otherPanel = other.querySelector(".sb-shop__filter-panel");
          if (!otherToggle || !otherPanel) return;
          otherToggle.setAttribute("aria-expanded", "false");
          otherToggle.classList.remove("sb-shop__filter--open");
          otherPanel.hidden = true;
        });
        if (!isOpen) {
          toggle.setAttribute("aria-expanded", "true");
          toggle.classList.add("sb-shop__filter--open");
          panel.hidden = false;
        }
      });
    });
  }

  var filtersRoot = document.querySelector("[data-sb-shop-filters]");
  if (filtersRoot) {
    filtersRoot.addEventListener("change", function (e) {
      if (e.target.matches('input[type="checkbox"]')) applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      document
        .querySelectorAll("[data-sb-shop-filters] input[type='checkbox']")
        .forEach(function (input) {
          input.checked = false;
        });
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
  }

  function initMobileShopBar() {
    var filterBtn = document.querySelector("[data-sb-mobile-filter]");
    var sortBtn = document.querySelector("[data-sb-mobile-sort]");
    var sidebar = document.querySelector("[data-sb-shop-filters]");
    var backdrop = document.querySelector("[data-sb-filter-backdrop]");

    function closeFilterDrawer() {
      if (!sidebar) return;
      sidebar.classList.remove("sb-shop__sidebar--open");
      if (filterBtn) filterBtn.setAttribute("aria-expanded", "false");
      if (backdrop) {
        backdrop.hidden = true;
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("sb-shop--filter-open");
    }

    function openFilterDrawer() {
      if (!sidebar) return;
      sidebar.classList.add("sb-shop__sidebar--open");
      if (filterBtn) filterBtn.setAttribute("aria-expanded", "true");
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.setAttribute("aria-hidden", "false");
      }
      document.body.classList.add("sb-shop--filter-open");
    }

    if (filterBtn) {
      filterBtn.addEventListener("click", function () {
        if (sidebar && sidebar.classList.contains("sb-shop__sidebar--open")) {
          closeFilterDrawer();
        } else {
          openFilterDrawer();
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeFilterDrawer);
    }

    if (sortBtn && sortSelect) {
      sortBtn.addEventListener("click", function () {
        if (typeof sortSelect.showPicker === "function") {
          sortSelect.showPicker();
        } else {
          sortSelect.focus();
          sortSelect.click();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFilterDrawer();
    });
  }

  initFilterToggles();
  initMobileShopBar();
  applyFilters();
})();
