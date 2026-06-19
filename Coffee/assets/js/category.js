(function () {
  "use strict";

  var filterToggles = document.querySelectorAll("[data-cc-filter-toggle]");
  var filterOpenBtn = document.querySelector("[data-cc-shop-filter-open]");
  var sidebar = document.querySelector("[data-cc-shop-filters]");
  var overlay = document.querySelector("[data-cc-shop-filter-overlay]");
  var clearBtn = document.querySelector("[data-cc-filter-clear]");
  var grid = document.querySelector("[data-cc-shop-grid]");
  var countEls = document.querySelectorAll("[data-cc-shop-count]");
  var emptyEl = document.querySelector("[data-cc-shop-empty]");
  var sortSelect = document.getElementById("cc-shop-sort");

  filterToggles.forEach(function (toggle) {
    var group = toggle.closest(".cc-shop__filter-group");
    var panelId = toggle.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;

    if (!group || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.hidden = !isOpen;
    });
  });

  function setFiltersOpen(open) {
    if (!sidebar) {
      return;
    }

    sidebar.classList.toggle("is-open", open);

    if (filterOpenBtn) {
      filterOpenBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (overlay) {
      overlay.classList.toggle("is-visible", open);
      overlay.hidden = !open;
    }

    document.body.classList.toggle("cc-shop-filters-open", open);
  }

  if (filterOpenBtn) {
    filterOpenBtn.addEventListener("click", function () {
      setFiltersOpen(!sidebar.classList.contains("is-open"));
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      setFiltersOpen(false);
    });
  }

  function getCards() {
    return grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-cc-shop-card]")) : [];
  }

  function updateCount(visible) {
    countEls.forEach(function (el) {
      el.textContent = String(visible);
    });

    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function applyFilters() {
    var cards = getCards();
    var visible = 0;
    var groups = ["price", "roast", "grind"];
    var selected = {};

    groups.forEach(function (group) {
      selected[group] = Array.prototype.map.call(
        document.querySelectorAll(
          'input[type="checkbox"][data-filter="' + group + '"]:checked'
        ),
        function (input) {
          return input.value;
        }
      );
    });

    cards.forEach(function (card) {
      var show = true;

      groups.forEach(function (group) {
        if (!show || selected[group].length === 0) {
          return;
        }

        var cardVal = card.getAttribute("data-" + group) || "";

        if (selected[group].indexOf(cardVal) === -1) {
          show = false;
        }
      });

      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (clearBtn) {
      clearBtn.hidden = !document.querySelector(
        'input[type="checkbox"][data-filter]:checked'
      );
    }

    updateCount(visible);
  }

  document.querySelectorAll('input[type="checkbox"][data-filter]').forEach(function (input) {
    input.addEventListener("change", applyFilters);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      document
        .querySelectorAll('input[type="checkbox"][data-filter]:checked')
        .forEach(function (input) {
          input.checked = false;
        });
      applyFilters();
    });
  }

  if (sortSelect && grid) {
    sortSelect.addEventListener("change", function () {
      var cards = getCards().filter(function (card) {
        return !card.hidden;
      });

      cards.sort(function (a, b) {
        var priceA = Number(a.dataset.priceNum || 0);
        var priceB = Number(b.dataset.priceNum || 0);

        if (sortSelect.value === "price-asc") {
          return priceA - priceB;
        }

        if (sortSelect.value === "price-desc") {
          return priceB - priceA;
        }

        if (sortSelect.value === "name") {
          var nameA = (a.querySelector(".cc-shop-card__name") || {}).textContent || "";
          var nameB = (b.querySelector(".cc-shop-card__name") || {}).textContent || "";
          return nameA.localeCompare(nameB);
        }

        return 0;
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  applyFilters();
})();
