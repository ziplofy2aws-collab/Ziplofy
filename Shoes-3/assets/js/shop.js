(function () {
  "use strict";

  if (!window.SH3_PRODUCTS) return;

  var products = window.SH3_PRODUCTS;
  var params = new URLSearchParams(window.location.search);
  var activeCategory = params.get("cat") || "all";
  var grid = document.querySelector("[data-sh3-shop-grid]");
  var countEl = document.querySelector("[data-sh3-shop-count]");
  var titleEl = document.querySelector("[data-sh3-shop-title]");
  var filtersEl = document.querySelector("[data-sh3-shop-filters]");
  var sortEl = document.querySelector("[data-sh3-shop-sort]");

  if (!grid) return;

  function renderFilters() {
    if (!filtersEl) return;

    var categories = ["all"].concat(products.getCategories());
    filtersEl.innerHTML = categories
      .map(function (cat) {
        var label = cat === "all" ? "All Shoes" : cat;
        var isActive = cat === activeCategory ? " is-active" : "";
        var href = cat === "all" ? "shop.html" : "shop.html?cat=" + encodeURIComponent(cat);
        return (
          '<a href="' + href + '" class="sh3-shop__filter' + isActive + '">' + label + "</a>"
        );
      })
      .join("");
  }

  function sortItems(list) {
    var mode = sortEl ? sortEl.value : "recommended";
    var sorted = list.slice();

    if (mode === "price-low") {
      sorted.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (mode === "price-high") {
      sorted.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (mode === "discount") {
      sorted.sort(function (a, b) {
        return b.off - a.off;
      });
    } else if (mode === "rating") {
      sorted.sort(function (a, b) {
        return b.count - a.count;
      });
    }

    return sorted;
  }

  function filterItems() {
    if (activeCategory === "all") return products.getAll();
    return products.getAll().filter(function (item) {
      return item.category === activeCategory;
    });
  }

  function renderGrid() {
    var items = sortItems(filterItems());

    if (titleEl) {
      titleEl.textContent = activeCategory === "all" ? "All Shoes" : activeCategory;
    }

    if (countEl) {
      countEl.textContent = items.length + " Products";
    }

    grid.innerHTML = items
      .map(function (item) {
        return products.createPickCard(item, { link: true, hideCompare: true });
      })
      .join("");
  }

  renderFilters();
  renderGrid();

  if (sortEl) {
    sortEl.addEventListener("change", renderGrid);
  }
})();
