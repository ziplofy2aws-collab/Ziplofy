(function () {
  "use strict";

  var products = window.ORG_PRODUCTS || {};
  var grid = document.querySelector("[data-org-shop-grid]");
  var countEl = document.querySelector("[data-org-shop-count]");
  var sortSelect = document.querySelector("[data-org-shop-sort]");
  var availabilitySelect = document.querySelector("[data-org-shop-availability]");
  var searchInput = document.querySelector("[data-org-shop-search]");
  var searchForm = document.querySelector("[data-org-shop-search-form]");
  var drawer = document.querySelector("[data-org-shop-sidebar]");
  var backdrop = document.querySelector("[data-org-shop-backdrop]");
  var openBtn = document.querySelector("[data-org-shop-filter-open]");
  var closeBtn = document.querySelector("[data-org-shop-filter-close]");
  var quantityInputs = document.querySelectorAll("[data-org-shop-filter-quantity]");
  var bestsellerInput = document.querySelector("[data-org-shop-filter-bestseller]");
  var newLaunchInput = document.querySelector("[data-org-shop-filter-new]");
  var availabilityInputs = document.querySelectorAll("[data-org-shop-filter-availability]");
  var priceMinInput = document.querySelector("[data-org-shop-price-min]");
  var priceMaxInput = document.querySelector("[data-org-shop-price-max]");
  var priceApplyBtn = document.querySelector("[data-org-shop-price-apply]");
  var filterToggles = document.querySelectorAll("[data-org-filter-toggle]");
  var categoryButtons = document.querySelectorAll("[data-org-shop-category]");
  var pairsEl = document.querySelector("[data-org-shop-pairs]");

  var appliedPriceMin = null;
  var appliedPriceMax = null;
  var activeCategory = "all";

  if (!grid) {
    return;
  }

  function parsePrice(value) {
    return parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  }

  function getProductList() {
    return Object.keys(products).map(function (key) {
      return products[key];
    });
  }

  function getCheckedValues(inputs) {
    var values = [];
    inputs.forEach(function (input) {
      if (input.checked) {
        values.push(input.value);
      }
    });
    return values;
  }

  function getSearchQuery() {
    if (searchInput) {
      return searchInput.value.trim().toLowerCase();
    }
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim().toLowerCase();
  }

  function getToolbarAvailability() {
    return availabilitySelect ? availabilitySelect.value : "all";
  }

  function syncToolbarAvailability(values) {
    if (!availabilitySelect || !values.length) {
      return;
    }

    if (values.length === 1) {
      availabilitySelect.value = values[0];
    } else {
      availabilitySelect.value = "all";
    }
  }

  function matchesSidebarCategory(product) {
    if (activeCategory === "all") {
      return true;
    }

    var categories = product.sidebarCategories || [];
    if (categories.indexOf(activeCategory) !== -1) {
      return true;
    }

    if (activeCategory === "bestsellers" && product.badge === "BESTSELLER") {
      return true;
    }

    return false;
  }

  function filterProducts(list) {
    var quantities = getCheckedValues(quantityInputs);
    var availabilityDrawer = getCheckedValues(availabilityInputs);
    var toolbarAvailability = getToolbarAvailability();
    var query = getSearchQuery();
    var bestsellerOnly = bestsellerInput && bestsellerInput.checked;
    var newLaunchOnly = newLaunchInput && newLaunchInput.checked;

    return list.filter(function (product) {
      var matchesQuery =
        !query ||
        product.name.toLowerCase().indexOf(query) !== -1 ||
        product.subtitle.toLowerCase().indexOf(query) !== -1 ||
        product.category.toLowerCase().indexOf(query) !== -1;

      var matchesQuantity =
        !quantities.length || quantities.indexOf(product.quantity) !== -1;

      var matchesBestseller =
        !bestsellerOnly || product.badge === "BESTSELLER";

      var matchesNewLaunch = !newLaunchOnly || product.isNewLaunch === true;

      var matchesDrawerAvailability =
        !availabilityDrawer.length ||
        (availabilityDrawer.indexOf("in-stock") !== -1 && !product.soldOut) ||
        (availabilityDrawer.indexOf("out-of-stock") !== -1 && product.soldOut);

      var matchesToolbarAvailability =
        toolbarAvailability === "all" ||
        (toolbarAvailability === "in-stock" && !product.soldOut) ||
        (toolbarAvailability === "out-of-stock" && product.soldOut);

      var priceValue = parsePrice(product.price);
      var matchesMin =
        appliedPriceMin == null || priceValue >= appliedPriceMin;
      var matchesMax =
        appliedPriceMax == null || priceValue <= appliedPriceMax;

      return (
        matchesQuery &&
        matchesSidebarCategory(product) &&
        matchesQuantity &&
        matchesBestseller &&
        matchesNewLaunch &&
        matchesDrawerAvailability &&
        matchesToolbarAvailability &&
        matchesMin &&
        matchesMax
      );
    });
  }

  function sortProducts(list) {
    var sort = sortSelect ? sortSelect.value : "name";
    var sorted = list.slice();

    if (sort === "price-low") {
      sorted.sort(function (a, b) {
        return parsePrice(a.price) - parsePrice(b.price);
      });
    } else if (sort === "price-high") {
      sorted.sort(function (a, b) {
        return parsePrice(b.price) - parsePrice(a.price);
      });
    } else if (sort === "name-desc") {
      sorted.sort(function (a, b) {
        return b.name.localeCompare(a.name);
      });
    } else if (sort === "name") {
      sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }

    return sorted;
  }

  function renderStars() {
    return (
      '<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>' +
      '<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>' +
      '<i class="fa-solid fa-star"></i>'
    );
  }

  function renderSizeSelect(product) {
    var sizes = product.sizes && product.sizes.length ? product.sizes : [product.size];
    var sizeClass = product.soldOut
      ? "org-product-card__size org-product-card__size--soldout"
      : "org-product-card__size";

    var options = sizes
      .map(function (size) {
        var selected = size === product.size ? " selected" : "";
        return '<option value="' + size + '"' + selected + ">" + size + "</option>";
      })
      .join("");

    return (
      '<select class="' +
      sizeClass +
      '" aria-label="Select size for ' +
      product.name +
      '">' +
      options +
      "</select>"
    );
  }

  function renderCard(product) {
    var cartClass = product.soldOut
      ? " org-product-card__cart org-product-card__cart--soldout"
      : " org-product-card__cart";
    var cartLabel = product.soldOut ? "Sold out" : "Add to Cart";

    return (
      '<article class="org-product-card">' +
      '<div class="org-product-card__head">' +
      '<span class="org-product-card__badge">' +
      product.badge +
      "</span>" +
      '<button type="button" class="org-product-card__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button></div>' +
      '<a href="product.html?product=' +
      product.id +
      '" class="org-shop-page__card-link">' +
      '<div class="org-product-card__media">' +
      '<img src="' +
      product.image +
      '" alt="" width="320" height="320" loading="lazy" decoding="async" />' +
      '<div class="org-product-card__dots" aria-hidden="true">' +
      '<span class="is-active"></span><span></span><span></span><span></span><span></span>' +
      "</div></div>" +
      '<h3 class="org-product-card__title">' +
      product.name +
      "</h3>" +
      '<p class="org-product-card__subtitle">' +
      product.subtitle +
      "</p></a>" +
      '<div class="org-product-card__rating">' +
      '<span class="org-product-card__stars" aria-hidden="true">' +
      renderStars() +
      "</span>" +
      '<span class="org-product-card__reviews">(' +
      product.reviews +
      ")</span></div>" +
      '<div class="org-product-card__price-row">' +
      '<span class="org-product-card__price">' +
      product.price +
      "</span>" +
      '<span class="org-product-card__discount">' +
      product.discount +
      "</span></div>" +
      '<p class="org-product-card__mrp">M.R.P.: <s>' +
      product.mrp +
      "</s></p>" +
      renderSizeSelect(product) +
      '<button type="button" class="' +
      cartClass.trim() +
      '"' +
      (product.soldOut ? " disabled" : "") +
      ">" +
      '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>' +
      "<span>" +
      cartLabel +
      "</span></button></article>"
    );
  }

  function renderPairsWell() {
    if (!pairsEl) {
      return;
    }

    var pairIds = window.ORG_PAIRS_WELL || ["dj-6", "dj-4", "dj-2"];
    var items = pairIds
      .map(function (id) {
        return products[id];
      })
      .filter(Boolean);

    if (!items.length) {
      pairsEl.innerHTML = "";
      pairsEl.hidden = true;
      return;
    }

    pairsEl.hidden = false;
    pairsEl.innerHTML =
      '<div class="org-shop-page__pairs-head">' +
      '<i class="fa-solid fa-link" aria-hidden="true"></i>' +
      "<span>Pairs Well With</span></div>" +
      '<ul class="org-shop-page__pairs-list">' +
      items
        .map(function (item) {
          return (
            '<li class="org-shop-page__pairs-item">' +
            '<a href="product.html?product=' +
            item.id +
            '" class="org-shop-page__pairs-thumb">' +
            '<img src="' +
            item.image +
            '" alt="" width="44" height="44" loading="lazy" decoding="async" /></a>' +
            '<div class="org-shop-page__pairs-info">' +
            '<a href="product.html?product=' +
            item.id +
            '" class="org-shop-page__pairs-name">' +
            item.name +
            "</a>" +
            '<span class="org-shop-page__pairs-price">' +
            item.price +
            "</span></div>" +
            '<button type="button" class="org-shop-page__pairs-add" data-org-pairs-add="' +
            item.id +
            '">+ Add</button></li>'
          );
        })
        .join("") +
      "</ul>";
  }

  function setActiveCategory(category) {
    activeCategory = category;

    categoryButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-org-shop-category") === category;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    render();
  }

  function render() {
    var filtered = filterProducts(getProductList());
    var sorted = sortProducts(filtered);

    if (countEl) {
      countEl.textContent = String(sorted.length);
    }

    if (!sorted.length) {
      grid.innerHTML =
        '<p class="org-shop-page__empty">No products found. Try adjusting your filters.</p>';
      return;
    }

    grid.innerHTML = sorted.map(renderCard).join("");
  }

  function openFilters() {
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
    if (backdrop) {
      backdrop.classList.add("is-open");
    }
    document.body.style.overflow = "hidden";
  }

  function closeFilters() {
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (backdrop) {
      backdrop.classList.remove("is-open");
    }
    document.body.style.overflow = "";
  }

  function toggleFilterSection(button) {
    var card = button.closest(".org-shop-page__filter-card");
    if (!card) {
      return;
    }

    var isOpen = card.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function applyPriceFilter() {
    var minValue = priceMinInput ? priceMinInput.value.trim() : "";
    var maxValue = priceMaxInput ? priceMaxInput.value.trim() : "";

    appliedPriceMin = minValue ? parseFloat(minValue) : null;
    appliedPriceMax = maxValue ? parseFloat(maxValue) : null;

    if (
      appliedPriceMin != null &&
      appliedPriceMax != null &&
      appliedPriceMin > appliedPriceMax
    ) {
      var temp = appliedPriceMin;
      appliedPriceMin = appliedPriceMax;
      appliedPriceMax = temp;
    }

    render();
    closeFilters();
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener("input", render);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", render);
  }

  if (availabilitySelect) {
    availabilitySelect.addEventListener("change", function () {
      var value = availabilitySelect.value;
      availabilityInputs.forEach(function (input) {
        if (value === "all") {
          input.checked = false;
        } else {
          input.checked = input.value === value;
        }
      });
      render();
    });
  }

  quantityInputs.forEach(function (input) {
    input.addEventListener("change", render);
  });

  if (bestsellerInput) {
    bestsellerInput.addEventListener("change", render);
  }

  if (newLaunchInput) {
    newLaunchInput.addEventListener("change", render);
  }

  availabilityInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      syncToolbarAvailability(getCheckedValues(availabilityInputs));
      render();
    });
  });

  if (priceApplyBtn) {
    priceApplyBtn.addEventListener("click", applyPriceFilter);
  }

  filterToggles.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleFilterSection(button);
    });
  });

  if (openBtn) {
    openBtn.addEventListener("click", openFilters);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeFilters);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeFilters);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
      closeFilters();
    }
  });

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveCategory(button.getAttribute("data-org-shop-category") || "all");
    });
  });

  if (pairsEl) {
    pairsEl.addEventListener("click", function (event) {
      var addBtn = event.target.closest("[data-org-pairs-add]");
      if (!addBtn || addBtn.disabled) {
        return;
      }
      addBtn.textContent = "Added";
      addBtn.disabled = true;
    });
  }

  var urlParams = new URLSearchParams(window.location.search);
  var initialCategory = urlParams.get("category");
  if (initialCategory) {
    var categoryMap = {
      Wellness: "detox-juices",
      "Foodgrains & Oils": "oil-ghee",
      "Dairy & Bakery": "oil-ghee"
    };
    var mappedCategory = categoryMap[initialCategory] || initialCategory;
    var hasCategoryButton = false;

    categoryButtons.forEach(function (button) {
      if (button.getAttribute("data-org-shop-category") === mappedCategory) {
        hasCategoryButton = true;
      }
    });

    if (hasCategoryButton) {
      activeCategory = mappedCategory;
      categoryButtons.forEach(function (button) {
        var isActive = button.getAttribute("data-org-shop-category") === mappedCategory;
        button.classList.toggle("is-active", isActive);
        if (isActive) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    }
  }

  renderPairsWell();
  render();
})();
