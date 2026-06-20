(function () {
  var grid = document.querySelector("[data-sp2-shop-grid]");
  var sortSelect = document.querySelector("[data-sp2-shop-sort]");
  var filters = document.querySelectorAll("[data-sp2-shop-filter]");
  var filterBtn = document.querySelector("[data-sp2-shop-filters]");
  var pills = document.querySelector(".sp2-shop-hero__pills");
  var readMoreBtn = document.querySelector("[data-sp2-shop-read-more]");
  var promoExtra = document.querySelector("[data-sp2-shop-promo-extra]");

  if (!grid || !window.SP2_PRODUCTS || !window.SP2Helpers) return;

  var helpers = window.SP2Helpers;
  var products = window.SP2_PRODUCTS.slice();
  var activeCategory = "all";

  var filterRules = {
    creatine: function (product) {
      return /creatine/i.test(product.name);
    },
    "clear-protein": function (product) {
      return product.category === "protein";
    },
    vitamins: function (product) {
      return product.category === "vitamins";
    },
    pro: function (product) {
      return product.category === "pre-workout";
    },
    hydrate: function (product) {
      return product.category === "fitness" && !/creatine/i.test(product.name);
    },
    "pre-workout": function (product) {
      return product.category === "pre-workout";
    },
    hyrox: function (product) {
      return product.category === "gainer";
    },
    bundles: function () {
      return true;
    }
  };

  function getCategoryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get("category");

    if (!category || category === "all") {
      return "all";
    }

    if (filterRules[category]) {
      return category;
    }

    if (category === "protein") return "clear-protein";
    if (category === "fitness") return "hydrate";
    if (category === "gainer") return "hyrox";

    return "all";
  }

  function sortProducts(list, sortKey) {
    var sorted = list.slice();

    if (sortKey === "price-asc") {
      sorted.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (sortKey === "price-desc") {
      sorted.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (sortKey === "name") {
      sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    } else if (sortKey === "rating") {
      sorted.sort(function (a, b) {
        return b.rating - a.rating;
      });
    }

    return sorted;
  }

  function filterProducts(category) {
    if (category === "all") {
      return products.slice();
    }

    var rule = filterRules[category];
    if (!rule) {
      return products.slice();
    }

    return products.filter(rule);
  }

  function render() {
    var sortKey = sortSelect ? sortSelect.value : "featured";
    var filtered = filterProducts(activeCategory);
    var sorted = sortProducts(filtered, sortKey);

    if (!sorted.length) {
      grid.innerHTML =
        '<p class="sp2-shop__empty">No products found in this category.</p>';
      return;
    }

    grid.innerHTML = sorted.map(helpers.cardHtml).join("");
  }

  function setActiveFilter(category) {
    activeCategory = category;

    filters.forEach(function (btn) {
      var filterKey = btn.getAttribute("data-sp2-shop-filter");
      var isActive = category !== "all" && filterKey === category;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    render();
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var category = btn.getAttribute("data-sp2-shop-filter");
      if (!category) return;

      if (activeCategory === category) {
        setActiveFilter("all");
        return;
      }

      setActiveFilter(category);
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", render);
  }

  if (filterBtn && pills) {
    filterBtn.addEventListener("click", function () {
      pills.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (readMoreBtn && promoExtra) {
    readMoreBtn.addEventListener("click", function () {
      var isOpen = !promoExtra.hidden;
      promoExtra.hidden = isOpen;
      readMoreBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      readMoreBtn.textContent = isOpen ? "Read More" : "Read Less";
    });
  }

  var urlCategory = getCategoryFromUrl();
  setActiveFilter(urlCategory);
})();
