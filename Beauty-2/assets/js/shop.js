(function () {
  "use strict";

  var sortToggle = document.querySelector("[data-boj-shop-sort-toggle]");
  var sortPanel = document.querySelector("[data-boj-shop-sort-panel]");
  var sortDesktop = document.getElementById("boj-shop-sort");
  var sortMobile = document.getElementById("boj-shop-sort-mobile");
  var filterBtn = document.querySelector("[data-boj-shop-filter]");
  var grid = document.querySelector(".boj-shop__grid");
  var productCount = document.querySelector(".boj-shop__count");

  var filterRoot = document.querySelector("[data-boj-shop-filter-root]");
  var filterOverlay = document.querySelector("[data-boj-shop-filter-overlay]");
  var filterPanel = document.getElementById("boj-shop-filter-panel");
  var filterCloseBtns = document.querySelectorAll("[data-boj-shop-filter-close]");
  var filterApplyBtn = document.querySelector("[data-boj-shop-filter-apply]");
  var filterAccordion = document.querySelector("[data-boj-shop-filter-accordion]");

  var TYPE_MAP = {
    routine: ["routine"],
    "hair-oil": ["hair oil", "serum"],
    treatment: ["treatment", "therapy treatment", "no-wash"],
    shampoo: ["shampoo"],
    "leave-in": ["leave-in", "leave in", "hair milk"],
    "scalp-care": ["scalp", "scaler", "exfoliating"]
  };

  var CONCERN_MAP = {
    damage: ["damage", "repair"],
    scalp: ["scalp", "detox"],
    frizz: ["frizz"],
    dandruff: ["dandruff", "anti-dandruff"],
    "heat-protection": ["heat protection"]
  };

  if (sortToggle && sortPanel) {
    sortToggle.addEventListener("click", function () {
      var isHidden = sortPanel.hasAttribute("hidden");
      if (isHidden) {
        sortPanel.removeAttribute("hidden");
        sortToggle.setAttribute("aria-expanded", "true");
      } else {
        sortPanel.setAttribute("hidden", "");
        sortToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function closeSortPanel() {
    if (!sortPanel || sortPanel.hasAttribute("hidden")) return;
    sortPanel.setAttribute("hidden", "");
    if (sortToggle) sortToggle.setAttribute("aria-expanded", "false");
  }

  function openFilterDrawer() {
    if (!filterPanel || !filterOverlay) return;

    closeSortPanel();
    filterOverlay.hidden = false;
    filterPanel.classList.add("is-open");
    filterPanel.focus();
    document.body.classList.add("boj-filter-open");

    if (filterRoot) filterRoot.setAttribute("aria-hidden", "false");
    if (filterBtn) filterBtn.setAttribute("aria-expanded", "true");
  }

  function closeFilterDrawer() {
    if (!filterPanel || !filterOverlay) return;

    filterPanel.classList.remove("is-open");
    filterOverlay.hidden = true;
    document.body.classList.remove("boj-filter-open");

    if (filterRoot) filterRoot.setAttribute("aria-hidden", "true");
    if (filterBtn) {
      filterBtn.setAttribute("aria-expanded", "false");
      filterBtn.focus();
    }
  }

  if (filterBtn) {
    filterBtn.setAttribute("aria-expanded", "false");
    filterBtn.setAttribute("aria-controls", "boj-shop-filter-panel");
    filterBtn.addEventListener("click", openFilterDrawer);
  }

  filterCloseBtns.forEach(function (btn) {
    btn.addEventListener("click", closeFilterDrawer);
  });

  if (filterOverlay) {
    filterOverlay.addEventListener("click", closeFilterDrawer);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && filterPanel && filterPanel.classList.contains("is-open")) {
      closeFilterDrawer();
    }
  });

  if (filterAccordion) {
    var accItems = filterAccordion.querySelectorAll("[data-boj-shop-filter-acc]");

    accItems.forEach(function (item) {
      var toggle = item.querySelector("[data-boj-shop-filter-acc-toggle]");
      var panel = item.querySelector(".boj-shop-filter__acc-panel");
      if (!toggle || !panel) return;

      toggle.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        if (isOpen) {
          item.classList.remove("is-open");
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
          return;
        }

        item.classList.add("is-open");
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      });
    });
  }

  function parsePrice(card) {
    var priceEl = card.querySelector(".boj-shop__card-price");
    if (!priceEl) return 0;
    var digits = priceEl.textContent.replace(/[^\d]/g, "");
    return parseInt(digits, 10) || 0;
  }

  function getCardName(card) {
    var nameEl = card.querySelector(".boj-shop__card-name");
    return nameEl ? nameEl.textContent.trim().toLowerCase() : "";
  }

  function getCardTags(card) {
    return Array.from(card.querySelectorAll(".boj-shop__card-tag")).map(function (tag) {
      return tag.textContent.trim().toLowerCase();
    });
  }

  function getCardSearchText(card) {
    return (getCardName(card) + " " + getCardTags(card).join(" ")).toLowerCase();
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function matchesPrice(price, ranges) {
    return ranges.some(function (range) {
      if (range === "under-1000") return price < 1000;
      if (range === "1000-2000") return price >= 1000 && price <= 2000;
      if (range === "2000-5000") return price > 2000 && price <= 5000;
      if (range === "above-5000") return price > 5000;
      return false;
    });
  }

  function matchesKeywords(text, keywords) {
    return keywords.some(function (keyword) {
      return text.indexOf(keyword) !== -1;
    });
  }

  function matchesMappedValues(text, values, map) {
    return values.some(function (value) {
      var keywords = map[value] || [value.replace(/-/g, " ")];
      return matchesKeywords(text, keywords);
    });
  }

  function cardMatchesFilters(card) {
    var text = getCardSearchText(card);
    var price = parsePrice(card);
    var availability = getCheckedValues("availability");
    var prices = getCheckedValues("price");
    var benefits = getCheckedValues("benefits");
    var types = getCheckedValues("type");
    var concerns = getCheckedValues("concerns");
    var brands = getCheckedValues("brand");

    if (availability.length) {
      var wantsInStock = availability.indexOf("in-stock") !== -1;
      var wantsOutOfStock = availability.indexOf("out-of-stock") !== -1;
      if (wantsOutOfStock && !wantsInStock) return false;
    }

    if (prices.length && !matchesPrice(price, prices)) return false;
    if (benefits.length && !matchesMappedValues(text, benefits, {})) return false;
    if (types.length && !matchesMappedValues(text, types, TYPE_MAP)) return false;
    if (concerns.length && !matchesMappedValues(text, concerns, CONCERN_MAP)) return false;

    if (brands.length) {
      var cardBrand = card.getAttribute("data-boj-brand") || "growus";
      if (brands.indexOf(cardBrand) === -1) return false;
    }

    return true;
  }

  function applyFilters() {
    if (!grid) return;

    var cards = Array.from(grid.querySelectorAll(".boj-shop__card"));
    var visible = 0;

    cards.forEach(function (card) {
      var show = cardMatchesFilters(card);
      card.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });

    if (productCount) {
      productCount.textContent = visible + (visible === 1 ? " product" : " products");
    }
  }

  if (filterApplyBtn) {
    filterApplyBtn.addEventListener("click", function () {
      applyFilters();
      closeFilterDrawer();
    });
  }

  function sortProducts(value) {
    if (!grid) return;
    var cards = Array.from(grid.querySelectorAll(".boj-shop__card"));
    if (!cards.length) return;

    var sorted = cards.slice();

    if (value === "price-low") {
      sorted.sort(function (a, b) {
        return parsePrice(a) - parsePrice(b);
      });
    } else if (value === "price-high") {
      sorted.sort(function (a, b) {
        return parsePrice(b) - parsePrice(a);
      });
    } else if (value === "name") {
      sorted.sort(function (a, b) {
        return getCardName(a).localeCompare(getCardName(b));
      });
    }

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function bindSortSelect(select, other) {
    if (!select) return;
    select.addEventListener("change", function () {
      if (other && other.value !== select.value) {
        other.value = select.value;
      }
      sortProducts(select.value);
    });
  }

  bindSortSelect(sortDesktop, sortMobile);
  bindSortSelect(sortMobile, sortDesktop);

  if (grid) {
    grid.querySelectorAll(".boj-shop__card").forEach(function (card) {
      card.setAttribute("data-boj-brand", "growus");
    });
  }
})();
