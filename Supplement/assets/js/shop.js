(function () {
  var PAGE_SIZE = 4;
  var catalog = window.ProductCatalog;
  if (!catalog) return;

  var products = catalog.products;

  var grid = document.getElementById("shop-grid");
  var countEl = document.getElementById("shop-results-count");
  var pageCountEl = document.getElementById("shop-page-count");
  var loader = document.getElementById("shop-loader");
  if (!grid) return;

  var state = {
    category: "all",
    sort: "featured",
    filters: {},
    visible: PAGE_SIZE * 2,
    loading: false
  };

  function formatPrice(n) {
    return catalog.formatCardPrice(n);
  }

  function buildPriceHtml(p) {
    var html = '<span class="price-current">' + formatPrice(p.price) + "</span>";
    if (p.mrp) html += '<span class="price-mrp">' + formatPrice(p.mrp) + "</span>";
    if (p.off) html += '<span class="price-off">' + p.off + "</span>";
    return html;
  }

  function buildCardHtml(p) {
    var dietIcon = p.foodType === "non-vegetarian"
      ? '<span class="nonveg-icon" aria-label="Non-Vegetarian"></span>'
      : '<span class="veg-icon" aria-label="Vegetarian"></span>';

    return (
      '<article class="shop-card" data-product-id="' + p.id + '">' +
      '<a href="' + catalog.getUrl(p.id) + '" class="product-card-link">' +
      '<div class="shop-card-media">' +
      '<img src="' + catalog.imgSrc(p.img) + '" alt="' + p.name + '">' +
      dietIcon +
      "</div>" +
      '<p class="shop-card-brand">' + p.brand + "</p>" +
      '<h2 class="shop-card-name">' + p.name + "</h2>" +
      '<p class="shop-card-desc">' + p.desc + "</p>" +
      '<div class="shop-card-rating">' +
      '<i class="fa-solid fa-star"></i>' +
      "<span>" + p.rating.toFixed(1) + " (" + p.reviews + " reviews)</span>" +
      '<i class="fa-solid fa-circle-check verified"></i>' +
      "</div>" +
      '<div class="shop-card-price">' + buildPriceHtml(p) + "</div>" +
      "</a>" +
      '<button type="button" class="shop-card-btn">Add To Cart</button>' +
      "</article>"
    );
  }

  function matchesCategory(p) {
    if (state.category === "all") return true;
    if (state.category === "bestseller") return p.collection === "bestseller";
    return p.category === state.category || p.collection === state.category;
  }

  function matchesSidebar(p) {
    var keys = Object.keys(state.filters);
    if (!keys.length) return true;

    return keys.every(function (key) {
      var val = state.filters[key];
      if (key === "price") {
        if (val === "under-1000") return p.price < 1000;
        if (val === "1000-2000") return p.price >= 1000 && p.price <= 2000;
        if (val === "2000-4000") return p.price > 2000 && p.price <= 4000;
        if (val === "above-4000") return p.price > 4000;
      }
      if (key === "brand") return p.brandKey === val;
      if (key === "foodType") return p.foodType === val;
      if (key === "flavour") return p.flavour === val;
      if (key === "size") return p.size === val;
      if (key === "categories") return p.category === val;
      if (key === "collections") return p.collection === val;
      if (key === "products") return String(p.id) === val;
      return true;
    });
  }

  function getFilteredProducts() {
    var list = products.filter(function (p) {
      return matchesCategory(p) && matchesSidebar(p);
    });

    if (state.sort === "price-low") {
      list.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === "price-high") {
      list.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === "rating") {
      list.sort(function (a, b) { return b.rating - a.rating; });
    } else if (state.sort === "newest") {
      list.sort(function (a, b) { return b.id - a.id; });
    }

    return list;
  }

  function renderGrid(append) {
    var filtered = getFilteredProducts();
    var slice = filtered.slice(0, state.visible);

    if (!append) {
      grid.innerHTML = "";
    }

    if (!filtered.length) {
      grid.innerHTML = '<p class="shop-empty">No products match your filters.</p>';
      if (countEl) countEl.textContent = "0 products";
      if (pageCountEl) pageCountEl.textContent = "0 products";
      if (loader) loader.hidden = true;
      return;
    }

    if (!append) {
      grid.innerHTML = slice.map(buildCardHtml).join("");
    } else {
      var currentCount = grid.querySelectorAll(".shop-card").length;
      var nextSlice = filtered.slice(currentCount, state.visible);
      grid.insertAdjacentHTML("beforeend", nextSlice.map(buildCardHtml).join(""));
    }

    if (countEl) {
      countEl.textContent = filtered.length + " product" + (filtered.length === 1 ? "" : "s");
    }

    if (pageCountEl) {
      pageCountEl.textContent = filtered.length + " product" + (filtered.length === 1 ? "" : "s");
    }

    if (loader) {
      loader.hidden = state.visible >= filtered.length;
    }
  }

  function resetAndRender() {
    state.visible = PAGE_SIZE * 2;
    renderGrid(false);
  }

  document.querySelectorAll("[data-shop-category]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.category = btn.getAttribute("data-shop-category");
      document.querySelectorAll("[data-shop-category]").forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      resetAndRender();
    });
  });

  document.querySelectorAll(".filter-group-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var group = header.closest(".filter-group");
      if (!group) return;
      var isOpen = group.classList.toggle("is-open");
      header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.querySelectorAll("[data-filter-option]").forEach(function (option) {
    option.addEventListener("click", function () {
      var group = option.closest(".filter-group");
      var filterKey = group ? group.getAttribute("data-filter-key") : null;
      var filterVal = option.getAttribute("data-filter-option");
      if (!filterKey || !filterVal) return;

      var isSelected = option.classList.toggle("is-selected");

      group.querySelectorAll("[data-filter-option]").forEach(function (opt) {
        if (opt !== option) opt.classList.remove("is-selected");
      });

      if (isSelected) {
        state.filters[filterKey] = filterVal;
      } else {
        delete state.filters[filterKey];
      }

      resetAndRender();
    });
  });

  var sortSelect = document.getElementById("shop-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      resetAndRender();
    });
  }

  function onScrollLoad() {
    if (state.loading) return;
    var filtered = getFilteredProducts();
    if (state.visible >= filtered.length) return;

    var scrollBottom = window.innerHeight + window.scrollY;
    var trigger = grid.offsetTop + grid.offsetHeight - 200;

    if (scrollBottom >= trigger) {
      state.loading = true;
      if (loader) loader.hidden = false;

      setTimeout(function () {
        state.visible += PAGE_SIZE;
        renderGrid(true);
        state.loading = false;
      }, 400);
    }
  }

  window.addEventListener("scroll", onScrollLoad, { passive: true });

  /* Mobile filter drawer */
  var filterToggle = document.querySelector("[data-shop-filter-toggle]");
  var filterClose = document.querySelector("[data-shop-filter-close]");
  var filterDrawer = document.querySelector("[data-shop-filter-drawer]");
  var filterOverlay = document.querySelector("[data-shop-filter-overlay]");

  function openFilterDrawer() {
    if (!filterDrawer || !filterOverlay) return;
    filterDrawer.classList.add("is-open");
    filterOverlay.hidden = false;
    requestAnimationFrame(function () {
      filterOverlay.classList.add("is-visible");
    });
    if (filterToggle) filterToggle.setAttribute("aria-expanded", "true");
    filterDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("filter-open");
  }

  function closeFilterDrawer() {
    if (!filterDrawer || !filterOverlay) return;
    filterDrawer.classList.remove("is-open");
    filterOverlay.classList.remove("is-visible");
    if (filterToggle) filterToggle.setAttribute("aria-expanded", "false");
    filterDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("filter-open");
    setTimeout(function () {
      filterOverlay.hidden = true;
    }, 300);
  }

  if (filterToggle) {
    filterToggle.addEventListener("click", openFilterDrawer);
  }

  if (filterClose) {
    filterClose.addEventListener("click", closeFilterDrawer);
  }

  if (filterOverlay) {
    filterOverlay.addEventListener("click", closeFilterDrawer);
  }

  resetAndRender();
})();
