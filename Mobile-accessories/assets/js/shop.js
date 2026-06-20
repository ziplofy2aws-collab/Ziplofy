(function () {
  var products = window.MA_PRODUCTS || {};
  var grid = document.querySelector("[data-ma-shop-grid]");
  var countEl = document.querySelector("[data-ma-shop-count]");
  var sortSelect = document.querySelector("[data-ma-shop-sort]");
  var paginationEl = document.querySelector("[data-ma-shop-pagination]");
  var filterOpen = document.querySelector("[data-ma-shop-filter-open]");
  var filterClose = document.querySelector("[data-ma-shop-filter-close]");
  var sortOpen = document.querySelector("[data-ma-shop-sort-open]");
  var sortClose = document.querySelector("[data-ma-shop-sort-close]");
  var sortSheet = document.querySelector("[data-ma-shop-sort-sheet]");
  var sortOptions = document.querySelectorAll("[data-ma-sort-option]");
  var sidebar = document.querySelector("[data-ma-shop-sidebar]");
  var backdrop = document.querySelector("[data-ma-shop-backdrop]");
  var priceMinInput = document.querySelector("[data-ma-price-min]");
  var priceMaxInput = document.querySelector("[data-ma-price-max]");
  var priceLabel = document.querySelector("[data-ma-price-label]");
  var priceApplyBtn = document.querySelector("[data-ma-price-apply]");
  var filterToggles = document.querySelectorAll("[data-ma-filter-toggle]");

  var appliedPriceMin = 0;
  var appliedPriceMax = 5999;
  var currentPage = 1;
  var perPage = 12;

  if (!grid) return;

  function parsePrice(value) {
    return parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  }

  function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getProductList() {
    return Object.keys(products).map(function (key) {
      return products[key];
    });
  }

  function getCheckedValues(name) {
    var values = [];
    document.querySelectorAll('[data-ma-filter="' + name + '"]:checked').forEach(function (input) {
      values.push(input.value);
    });
    return values;
  }

  function productMatchesFilters(product, skipFacet) {
    var availability = getCheckedValues("availability");
    var batteries = getCheckedValues("battery");
    var wireless = getCheckedValues("wireless");
    var laptops = getCheckedValues("laptop");
    var flights = getCheckedValues("flight");
    var charging = getCheckedValues("charging");
    var price = parsePrice(product.price);

    if (skipFacet !== "availability" && availability.length) {
      var inStock = !product.soldOut;
      var stockMatch =
        (availability.indexOf("in-stock") !== -1 && inStock) ||
        (availability.indexOf("out-of-stock") !== -1 && !inStock);
      if (!stockMatch) return false;
    }

    if (skipFacet !== "price" && (price < appliedPriceMin || price > appliedPriceMax)) {
      return false;
    }

    if (skipFacet !== "battery" && batteries.length) {
      if (!product.battery || batteries.indexOf(product.battery) === -1) return false;
    }

    if (skipFacet !== "wireless" && wireless.length) {
      var productWireless = product.wireless || "no";
      if (wireless.indexOf(productWireless) === -1) return false;
    }

    if (skipFacet !== "laptop" && laptops.length) {
      if (!product.laptop || laptops.indexOf(product.laptop) === -1) return false;
    }

    if (skipFacet !== "flight" && flights.length) {
      var productFlight = product.flightApproved || "no";
      if (flights.indexOf(productFlight) === -1) return false;
    }

    if (skipFacet !== "charging" && charging.length) {
      if (!product.chargingSpeed || charging.indexOf(product.chargingSpeed) === -1) return false;
    }

    return true;
  }

  function filterProducts(list) {
    return list.filter(function (product) {
      return productMatchesFilters(product, null);
    });
  }

  function sortProducts(list) {
    var sort = sortSelect ? sortSelect.value : "featured";
    var sorted = list.slice();

    if (sort === "price-low") {
      sorted.sort(function (a, b) {
        return parsePrice(a.price) - parsePrice(b.price);
      });
    } else if (sort === "price-high") {
      sorted.sort(function (a, b) {
        return parsePrice(b.price) - parsePrice(a.price);
      });
    } else if (sort === "name") {
      sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    } else if (sort === "rating") {
      sorted.sort(function (a, b) {
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      sorted.sort(function (a, b) {
        if (a.badge && !b.badge) return -1;
        if (!a.badge && b.badge) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    return sorted;
  }

  function getSkipFacet(key) {
    if (key.indexOf("availability") === 0) return "availability";
    if (key.indexOf("battery") === 0) return "battery";
    if (key.indexOf("wireless") === 0) return "wireless";
    if (key.indexOf("laptop") === 0) return "laptop";
    if (key.indexOf("flight") === 0) return "flight";
    if (key.indexOf("charging") === 0) return "charging";
    return null;
  }

  function updateFacetCounts() {
    var all = getProductList();
    var facets = {
      "availability-in-stock": function (p) {
        return !p.soldOut;
      },
      "availability-out-of-stock": function (p) {
        return !!p.soldOut;
      },
      "battery-5000": function (p) {
        return p.battery === "5000";
      },
      "battery-10000": function (p) {
        return p.battery === "10000";
      },
      "battery-20000": function (p) {
        return p.battery === "20000";
      },
      "battery-30000": function (p) {
        return p.battery === "30000";
      },
      "battery-40000": function (p) {
        return p.battery === "40000";
      },
      "wireless-no": function (p) {
        return (p.wireless || "no") === "no";
      },
      "wireless-qi2-magsafe": function (p) {
        return p.wireless === "qi2-magsafe";
      },
      "wireless-qi": function (p) {
        return p.wireless === "qi";
      },
      "laptop-65w": function (p) {
        return p.laptop === "65w";
      },
      "laptop-100w": function (p) {
        return p.laptop === "100w";
      },
      "flight-yes": function (p) {
        return p.flightApproved === "yes";
      },
      "flight-no": function (p) {
        return (p.flightApproved || "no") === "no";
      },
      "charging-18w": function (p) {
        return p.chargingSpeed === "18w";
      },
      "charging-22.5w": function (p) {
        return p.chargingSpeed === "22.5w";
      },
      "charging-65w": function (p) {
        return p.chargingSpeed === "65w";
      }
    };

    Object.keys(facets).forEach(function (key) {
      var el = document.querySelector('[data-ma-count="' + key + '"]');
      if (!el) return;
      var skipFacet = getSkipFacet(key);
      var count = all.filter(function (product) {
        return facets[key](product) && productMatchesFilters(product, skipFacet);
      }).length;
      el.textContent = "(" + count + ")";
    });
  }

  function renderColors(colors) {
    if (!colors || !colors.length) return "";
    var html = colors
      .slice(0, 2)
      .map(function (color, index) {
        var splitClass = index === 1 && colors.length > 2 ? " ma-shop-card__swatch--split" : "";
        return '<span class="ma-shop-card__swatch' + splitClass + '" style="background:' + color + '"></span>';
      })
      .join("");
    if (colors.length > 2) {
      html += '<span class="ma-shop-card__swatch-more">+' + (colors.length - 2) + "</span>";
    }
    return '<div class="ma-shop-card__colors" aria-label="Available colors">' + html + "</div>";
  }

  function renderBadge(badge) {
    if (!badge) return "";
    var label = badge === "best-seller" ? "Best seller" : badge === "trending" ? "Trending" : badge;
    return (
      '<span class="ma-shop-card__badge ma-shop-card__badge--' +
      badge +
      '">' +
      label +
      "</span>"
    );
  }

  function renderCard(product) {
    var rating = product.rating ? Number(product.rating).toFixed(2).replace(/\.00$/, "") : "";
    var ratingHtml = rating
      ? '<span class="ma-shop-card__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ' +
        rating +
        "</span>"
      : "";

    return (
      '<article class="ma-shop-card">' +
      '<a href="product.html?id=' +
      product.id +
      '" class="ma-shop-card__media">' +
      renderBadge(product.badge) +
      '<img src="' +
      product.image +
      '" alt="' +
      product.name +
      '" width="280" height="240" loading="lazy" decoding="async" />' +
      ratingHtml +
      "</a>" +
      '<div class="ma-shop-card__body">' +
      '<h3 class="ma-shop-card__name"><a href="product.html?id=' +
      product.id +
      '">' +
      product.name +
      "</a></h3>" +
      '<p class="ma-shop-card__desc">' +
      product.desc +
      "</p>" +
      '<div class="ma-shop-card__price-row">' +
      '<div class="ma-shop-card__prices">' +
      '<span class="ma-shop-card__price">' +
      product.price +
      "</span>" +
      '<span class="ma-shop-card__compare">' +
      product.compare +
      "</span>" +
      "</div>" +
      renderColors(product.colors) +
      "</div>" +
      '<div class="ma-shop-card__emi">' +
      '<span class="ma-shop-card__emi-text">or &#8377;' +
      product.emi +
      "/Month</span>" +
      '<button type="button" class="ma-shop-card__emi-btn">Buy on EMI <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>' +
      "</div>" +
      "</div></article>"
    );
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    var html = "";
    for (var i = 1; i <= totalPages; i++) {
      html +=
        '<button type="button" class="ma-shop-page__page-btn' +
        (i === currentPage ? " is-active" : "") +
        '" data-ma-page="' +
        i +
        '"' +
        (i === currentPage ? ' aria-current="page"' : "") +
        ">" +
        i +
        "</button>";
    }
    if (currentPage < totalPages) {
      html +=
        '<button type="button" class="ma-shop-page__page-btn" data-ma-page="' +
        (currentPage + 1) +
        '">Next</button>';
    }
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll("[data-ma-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentPage = parseInt(btn.getAttribute("data-ma-page"), 10) || 1;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function updatePriceLabel() {
    if (!priceLabel || !priceMinInput || !priceMaxInput) return;
    var min = Math.min(parseInt(priceMinInput.value, 10), parseInt(priceMaxInput.value, 10));
    var max = Math.max(parseInt(priceMinInput.value, 10), parseInt(priceMaxInput.value, 10));
    priceLabel.textContent = formatPrice(min) + " - " + formatPrice(max);
  }

  function render() {
    var filtered = sortProducts(filterProducts(getProductList()));
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

    if (currentPage > totalPages) currentPage = totalPages;

    if (countEl) countEl.textContent = String(filtered.length);
    updateFacetCounts();

    if (!filtered.length) {
      grid.innerHTML =
        '<p class="ma-shop-page__empty">No products match your filters. Try adjusting your selection.</p>';
      renderPagination(0);
      return;
    }

    var start = (currentPage - 1) * perPage;
    var pageItems = filtered.slice(start, start + perPage);
    grid.innerHTML = pageItems.map(renderCard).join("");
    bindProductCards();
    renderPagination(totalPages);
  }

  function bindProductCards() {
    grid.querySelectorAll(".ma-shop-card").forEach(function (card) {
      var link = card.querySelector("a.ma-shop-card__media");
      if (!link) return;
      var url = link.getAttribute("href");
      card.style.cursor = "pointer";
      card.addEventListener("click", function (event) {
        if (event.target.closest("button")) return;
        if (event.target.closest("a")) return;
        window.location.href = url;
      });
    });
  }

  function syncSortOptions() {
    if (!sortSelect) return;
    var current = sortSelect.value;
    sortOptions.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-ma-sort-option") === current);
    });
  }

  function setBackdropVisible(visible) {
    if (!backdrop) return;
    backdrop.classList.toggle("is-visible", visible);
    backdrop.hidden = !visible;
    document.body.style.overflow = visible ? "hidden" : "";
  }

  function openFilters() {
    closeSort(false);
    if (!sidebar) return;
    sidebar.classList.add("is-open");
    setBackdropVisible(true);
  }

  function closeFilters() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (!sortSheet || !sortSheet.classList.contains("is-open")) setBackdropVisible(false);
  }

  function openSort() {
    closeFilters();
    if (!sortSheet) return;
    syncSortOptions();
    sortSheet.hidden = false;
    requestAnimationFrame(function () {
      sortSheet.classList.add("is-open");
    });
    setBackdropVisible(true);
  }

  function closeSort(updateBackdrop) {
    if (!sortSheet) return;
    sortSheet.classList.remove("is-open");
    window.setTimeout(function () {
      if (!sortSheet.classList.contains("is-open")) sortSheet.hidden = true;
    }, 320);
    if (updateBackdrop !== false && sidebar && !sidebar.classList.contains("is-open")) {
      setBackdropVisible(false);
    }
  }

  filterToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var group = toggle.closest("[data-ma-filter-group]");
      if (!group) return;
      var isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.querySelectorAll("[data-ma-filter]").forEach(function (input) {
    input.addEventListener("change", function () {
      currentPage = 1;
      render();
    });
  });

  if (priceMinInput && priceMaxInput) {
    priceMinInput.addEventListener("input", updatePriceLabel);
    priceMaxInput.addEventListener("input", updatePriceLabel);
    updatePriceLabel();
  }

  if (priceApplyBtn) {
    priceApplyBtn.addEventListener("click", function () {
      if (!priceMinInput || !priceMaxInput) return;
      appliedPriceMin = Math.min(parseInt(priceMinInput.value, 10), parseInt(priceMaxInput.value, 10));
      appliedPriceMax = Math.max(parseInt(priceMinInput.value, 10), parseInt(priceMaxInput.value, 10));
      currentPage = 1;
      render();
      closeFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentPage = 1;
      syncSortOptions();
      render();
    });
  }

  sortOptions.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-ma-sort-option");
      if (sortSelect && value) sortSelect.value = value;
      syncSortOptions();
      currentPage = 1;
      render();
      closeSort();
    });
  });

  if (filterOpen) filterOpen.addEventListener("click", openFilters);
  if (filterClose) filterClose.addEventListener("click", closeFilters);
  if (sortOpen) sortOpen.addEventListener("click", openSort);
  if (sortClose) sortClose.addEventListener("click", function () {
    closeSort();
  });
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeFilters();
      closeSort();
    });
  }

  syncSortOptions();

  render();
})();
