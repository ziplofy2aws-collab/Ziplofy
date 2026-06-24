(function () {
  "use strict";

  var drawer = document.querySelector("[data-wc2-shop-filters]");
  if (!drawer) return;

  var backdrop = document.querySelector("[data-wc2-shop-backdrop]");
  var toggleBtn = document.querySelector("[data-wc2-shop-filter-toggle]");
  var closeBtn = document.querySelector("[data-wc2-shop-filters-close]");
  var clearBtn = document.querySelector("[data-wc2-shop-clear]");
  var applyBtn = document.querySelector("[data-wc2-shop-apply]");
  var catsEl = document.querySelector("[data-wc2-shop-cats]");
  var optionsEl = document.querySelector("[data-wc2-shop-options]");
  var sortEl = document.querySelector("[data-wc2-shop-sort]");
  var resultCountEl = document.querySelector("[data-wc2-shop-result-count]");
  var countEl = document.querySelector("[data-wc2-shop-count]");
  var gridEl = document.querySelector("[data-wc2-shop-grid]");

  var FILTER_CATEGORIES = [
    { key: "gender", label: "GENDER", type: "filter" },
    { key: "brand", label: "BRAND", type: "filter" },
    { key: "model", label: "MODEL", type: "filter" },
    { key: "occasion", label: "OCCASION", type: "filter" },
    { key: "price", label: "PRICE", type: "price" },
    { key: "caseSize", label: "CASE SIZE", type: "filter" },
    { key: "dialColor", label: "DIAL COLOR", type: "filter" },
    { key: "strapColor", label: "STRAP COLOR", type: "filter" },
    { key: "dialShape", label: "DIAL SHAPE", type: "filter" },
    { key: "movement", label: "MOVEMENT", type: "filter" },
    { key: "waterResistant", label: "WATER RESISTANT", type: "filter" },
    { key: "discount", label: "DISCOUNT", type: "discount" }
  ];

  var SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "bestselling", label: "Best Selling" }
  ];

  var PRICE_OPTIONS = [
    { value: "under-50000", label: "Under \u20B950,000" },
    { value: "50000-150000", label: "\u20B950,000 \u2013 \u20B91,50,000" },
    { value: "above-150000", label: "Above \u20B91,50,000" }
  ];

  var DISCOUNT_OPTIONS = [
    { value: "on-sale", label: "On Sale" },
    { value: "no-discount", label: "Regular Price" }
  ];

  var LABELS = {
    men: "Men",
    women: "Women",
    unisex: "Unisex",
    casual: "Casual",
    formal: "Formal",
    sport: "Sport",
    quartz: "Quartz",
    automatic: "Automatic",
    "eco-drive": "Eco-Drive",
    round: "Round",
    tonneau: "Tonneau",
    blue: "Blue",
    green: "Green",
    black: "Black",
    champagne: "Champagne",
    skeleton: "Skeleton",
    silver: "Silver",
    brown: "Brown",
    "two-tone": "Two-Tone",
    "3-atm": "3 ATM",
    "5-atm": "5 ATM",
    "10-atm": "10 ATM"
  };

  var activeCategory = "gender";
  var activeTab = "filter";
  var pendingFilters = {};
  var appliedFilters = {};
  var pendingSort = "featured";
  var appliedSort = "featured";
  var cards = [];

  function getCatalog() {
    return window.WC2_CATALOG || {};
  }

  function getProducts() {
    return Object.values(getCatalog());
  }

  function getPrice(product) {
    return product.salePrice || product.price;
  }

  function formatLabel(value) {
    if (!value) return "";
    return LABELS[value] || value.replace(/-/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function getFilterValue(product, key) {
    if (key === "price" || key === "discount") return null;
    return product.filter && product.filter[key];
  }

  function matchesPrice(product, range) {
    var price = getPrice(product);
    if (range === "under-50000") return price < 50000;
    if (range === "50000-150000") return price >= 50000 && price <= 150000;
    if (range === "above-150000") return price > 150000;
    return false;
  }

  function matchesDiscount(product, value) {
    var onSale = Boolean(product.salePrice);
    if (value === "on-sale") return onSale;
    if (value === "no-discount") return !onSale;
    return false;
  }

  function productMatchesFilters(product, filters) {
    return FILTER_CATEGORIES.every(function (cat) {
      var selected = filters[cat.key];
      if (!selected || !selected.length) return true;

      if (cat.type === "price") {
        return selected.some(function (value) {
          return matchesPrice(product, value);
        });
      }

      if (cat.type === "discount") {
        return selected.some(function (value) {
          return matchesDiscount(product, value);
        });
      }

      var value = getFilterValue(product, cat.key);
      return selected.indexOf(value) !== -1;
    });
  }

  function getMatchingProducts(filters) {
    return getProducts().filter(function (product) {
      return productMatchesFilters(product, filters);
    });
  }

  function sortProducts(products, sortKey) {
    var list = products.slice();

    if (sortKey === "price-asc") {
      list.sort(function (a, b) {
        return getPrice(a) - getPrice(b);
      });
    } else if (sortKey === "price-desc") {
      list.sort(function (a, b) {
        return getPrice(b) - getPrice(a);
      });
    } else if (sortKey === "newest") {
      list.sort(function (a, b) {
        return Number(b.isNew) - Number(a.isNew);
      });
    } else if (sortKey === "bestselling") {
      list.sort(function (a, b) {
        var aBest = a.id.indexOf("bs-") === 0 ? 1 : 0;
        var bBest = b.id.indexOf("bs-") === 0 ? 1 : 0;
        return bBest - aBest;
      });
    }

    return list;
  }

  function buildFilterOptions(categoryKey) {
    var category = FILTER_CATEGORIES.find(function (cat) {
      return cat.key === categoryKey;
    });
    if (!category) return [];

    if (category.type === "price") {
      return PRICE_OPTIONS.map(function (option) {
        return {
          value: option.value,
          label: option.label,
          count: getProducts().filter(function (product) {
            return matchesPrice(product, option.value);
          }).length
        };
      }).filter(function (option) {
        return option.count > 0;
      });
    }

    if (category.type === "discount") {
      return DISCOUNT_OPTIONS.map(function (option) {
        return {
          value: option.value,
          label: option.label,
          count: getProducts().filter(function (product) {
            return matchesDiscount(product, option.value);
          }).length
        };
      }).filter(function (option) {
        return option.count > 0;
      });
    }

    var counts = {};
    getProducts().forEach(function (product) {
      var value = getFilterValue(product, categoryKey);
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.keys(counts).map(function (value) {
      return {
        value: value,
        label: formatLabel(value),
        count: counts[value]
      };
    }).sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
  }

  function renderCategories() {
    catsEl.innerHTML = FILTER_CATEGORIES.map(function (cat) {
      return (
        '<button type="button" class="wc2-shop__drawer-cat' +
        (cat.key === activeCategory ? " is-active" : "") +
        '" data-wc2-shop-cat="' + cat.key + '">' + cat.label + "</button>"
      );
    }).join("");
  }

  function renderOptions() {
    var options = buildFilterOptions(activeCategory);
    var selected = pendingFilters[activeCategory] || [];

    if (!options.length) {
      optionsEl.innerHTML = '<p class="wc2-shop__drawer-empty">No options available</p>';
      return;
    }

    optionsEl.innerHTML = options.map(function (option) {
      var checked = selected.indexOf(option.value) !== -1 ? " checked" : "";
      return (
        '<label class="wc2-shop__drawer-option">' +
        '<input type="checkbox" data-wc2-shop-filter="' + activeCategory + '" value="' + option.value + '"' + checked + " />" +
        "<span>" + option.label + " (" + option.count + ")</span>" +
        "</label>"
      );
    }).join("");
  }

  function renderSort() {
    sortEl.innerHTML = SORT_OPTIONS.map(function (option) {
      var checked = pendingSort === option.value ? " checked" : "";
      return (
        '<li class="wc2-shop__sort-item">' +
        '<label class="wc2-shop__drawer-option">' +
        '<input type="radio" name="wc2-shop-sort" value="' + option.value + '"' + checked + " />" +
        "<span>" + option.label + "</span>" +
        "</label></li>"
      );
    }).join("");
  }

  function updateResultCount() {
    var count = getMatchingProducts(pendingFilters).length;
    if (resultCountEl) resultCountEl.textContent = String(count);
  }

  function setTab(tab) {
    activeTab = tab;
    drawer.querySelectorAll("[data-wc2-shop-tab]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-wc2-shop-tab") === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    drawer.querySelectorAll("[data-wc2-shop-panel]").forEach(function (panel) {
      var isActive = panel.getAttribute("data-wc2-shop-panel") === tab;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  }

  function openDrawer() {
    pendingFilters = JSON.parse(JSON.stringify(appliedFilters));
    pendingSort = appliedSort;
    activeCategory = "gender";
    renderCategories();
    renderOptions();
    renderSort();
    updateResultCount();
    setTab("filter");

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add("is-visible");
    }
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      backdrop.hidden = true;
    }
    document.body.style.overflow = "";
  }

  function applyFilters() {
    appliedFilters = JSON.parse(JSON.stringify(pendingFilters));
    appliedSort = pendingSort;
    renderGrid();
    closeDrawer();
  }

  function clearFilters() {
    pendingFilters = {};
    pendingSort = "featured";
    appliedFilters = {};
    appliedSort = "featured";
    renderCategories();
    renderOptions();
    renderSort();
    updateResultCount();
    renderGrid();
  }

  function renderGrid() {
    var matching = sortProducts(getMatchingProducts(appliedFilters), appliedSort);
    var visibleIds = matching.map(function (product) {
      return product.id;
    });

    cards.forEach(function (card) {
      var id = card.getAttribute("data-wc2-product-id");
      var show = visibleIds.indexOf(id) !== -1;
      card.classList.toggle("is-hidden", !show);
    });

    matching.forEach(function (product, index) {
      var card = gridEl.querySelector('[data-wc2-product-id="' + product.id + '"]');
      if (card) gridEl.appendChild(card);
    });

    var emptyEl = gridEl.querySelector("[data-wc2-shop-empty]");
    if (!matching.length) {
      if (!emptyEl) {
        emptyEl = document.createElement("p");
        emptyEl.className = "wc2-shop__empty";
        emptyEl.setAttribute("data-wc2-shop-empty", "");
        emptyEl.textContent = "No watches match your filters. Try adjusting your selection.";
        gridEl.appendChild(emptyEl);
      }
    } else if (emptyEl) {
      emptyEl.remove();
    }

    if (countEl) {
      countEl.textContent = matching.length + (matching.length === 1 ? " product" : " products");
    }
  }

  function initCards() {
    cards = Array.prototype.slice.call(gridEl.querySelectorAll("[data-wc2-product-id]"));
  }

  drawer.addEventListener("click", function (event) {
    var catBtn = event.target.closest("[data-wc2-shop-cat]");
    if (catBtn) {
      activeCategory = catBtn.getAttribute("data-wc2-shop-cat");
      renderCategories();
      renderOptions();
      return;
    }

    var tabBtn = event.target.closest("[data-wc2-shop-tab]");
    if (tabBtn) {
      setTab(tabBtn.getAttribute("data-wc2-shop-tab"));
    }
  });

  drawer.addEventListener("change", function (event) {
    var filterInput = event.target.matches("[data-wc2-shop-filter]") ? event.target : null;
    if (filterInput) {
      var key = filterInput.getAttribute("data-wc2-shop-filter");
      var value = filterInput.value;
      if (!pendingFilters[key]) pendingFilters[key] = [];

      if (filterInput.checked) {
        if (pendingFilters[key].indexOf(value) === -1) pendingFilters[key].push(value);
      } else {
        pendingFilters[key] = pendingFilters[key].filter(function (item) {
          return item !== value;
        });
        if (!pendingFilters[key].length) delete pendingFilters[key];
      }

      updateResultCount();
      return;
    }

    if (event.target.matches('input[name="wc2-shop-sort"]')) {
      pendingSort = event.target.value;
    }
  });

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (clearBtn) clearBtn.addEventListener("click", clearFilters);

  document.querySelectorAll("[data-wc2-shop-wish]").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
      }
    });
  });

  initCards();
  renderGrid();
})();
