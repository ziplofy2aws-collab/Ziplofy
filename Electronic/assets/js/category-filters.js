(function () {
  var panel = document.querySelector(".filters-panel");
  var grid = document.querySelector(".products-grid");
  var countEl = document.querySelector("[data-products-count]");
  if (!panel || !grid) {
    return;
  }

  var cards = Array.from(grid.querySelectorAll(".p-card[data-f-brand]"));
  var PRICE_MIN = 79;
  var PRICE_MAX = 259900;

  var rangeMin = panel.querySelector("#filterPriceMin");
  var rangeMax = panel.querySelector("#filterPriceMax");
  var labelMin = panel.querySelector("[data-price-label-min]");
  var labelMax = panel.querySelector("[data-price-label-max]");
  var trackFill = panel.querySelector(".filter-price__fill");
  var stockCb = panel.querySelector("#filterExcludeOos");
  var clearBtn = panel.querySelector("[data-filter-clear]");

  function formatRupee(num) {
    var n = Math.round(Number(num)) || 0;
    var s = String(n);
    if (s.length <= 3) {
      return "₹" + s;
    }
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) {
      parts.unshift(rest);
    }
    return "₹" + parts.join(",") + "," + last3;
  }

  function getCheckedValues(name) {
    return Array.from(panel.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked')).map(function (el) {
      return el.value;
    });
  }

  function facetPass(selected, productVal) {
    if (!selected.length) {
      return true;
    }
    return selected.indexOf(productVal) !== -1;
  }

  function updatePriceFill() {
    if (!rangeMin || !rangeMax || !trackFill) {
      return;
    }
    var minV = parseInt(rangeMin.value, 10);
    var maxV = parseInt(rangeMax.value, 10);
    if (minV > maxV) {
      var t = minV;
      minV = maxV;
      maxV = t;
    }
    var lo = ((minV - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    var hi = ((maxV - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    trackFill.style.left = lo + "%";
    trackFill.style.width = Math.max(0, hi - lo) + "%";
    if (labelMin) {
      labelMin.textContent = formatRupee(minV);
    }
    if (labelMax) {
      labelMax.textContent = formatRupee(maxV);
    }
  }

  function clampRangeInputs(changed) {
    if (!rangeMin || !rangeMax) {
      return;
    }
    var minV = parseInt(rangeMin.value, 10);
    var maxV = parseInt(rangeMax.value, 10);
    var gap = 1000;
    if (changed === "min" && minV > maxV - gap) {
      rangeMin.value = String(Math.max(PRICE_MIN, maxV - gap));
    }
    if (changed === "max" && maxV < minV + gap) {
      rangeMax.value = String(Math.min(PRICE_MAX, minV + gap));
    }
    minV = parseInt(rangeMin.value, 10);
    maxV = parseInt(rangeMax.value, 10);
    rangeMin.style.zIndex = minV >= maxV - gap ? "2" : "1";
    rangeMax.style.zIndex = maxV <= minV + gap ? "2" : "1";
    updatePriceFill();
  }

  function applyFilters() {
    var cat = getCheckedValues("category");
    var brand = getCheckedValues("brand");
    var color = getCheckedValues("color");
    var os = getCheckedValues("os");
    var ram = getCheckedValues("ram");
    var back = getCheckedValues("backCam");
    var storage = getCheckedValues("storage");
    var proc = getCheckedValues("processor");
    var front = getCheckedValues("frontCam");
    var excludeOos = stockCb && stockCb.checked;
    var pMin = rangeMin ? parseInt(rangeMin.value, 10) : PRICE_MIN;
    var pMax = rangeMax ? parseInt(rangeMax.value, 10) : PRICE_MAX;
    var lo = Math.min(pMin, pMax);
    var hi = Math.max(pMin, pMax);

    var visible = [];
    cards.forEach(function (card) {
      var price = parseInt(card.getAttribute("data-f-price"), 10) || 0;
      var inStock = card.getAttribute("data-f-in-stock") !== "0";
      if (excludeOos && !inStock) {
        card.hidden = true;
        return;
      }
      if (price < lo || price > hi) {
        card.hidden = true;
        return;
      }
      if (
        !facetPass(cat, card.getAttribute("data-f-category")) ||
        !facetPass(brand, card.getAttribute("data-f-brand")) ||
        !facetPass(color, card.getAttribute("data-f-color")) ||
        !facetPass(os, card.getAttribute("data-f-os")) ||
        !facetPass(ram, card.getAttribute("data-f-ram")) ||
        !facetPass(back, card.getAttribute("data-f-back")) ||
        !facetPass(storage, card.getAttribute("data-f-storage")) ||
        !facetPass(proc, card.getAttribute("data-f-processor")) ||
        !facetPass(front, card.getAttribute("data-f-front"))
      ) {
        card.hidden = true;
        return;
      }
      card.hidden = false;
      visible.push(card);
    });

    if (countEl) {
      var total = cards.length;
      var n = visible.length;
      if (n === 0) {
        countEl.textContent = "(Showing 0 products of " + total + " products)";
      } else {
        countEl.textContent = "(Showing 1 - " + n + " products of " + total + " products)";
      }
    }
  }

  function syncSectionChevron(btn, open) {
    var ch = btn.querySelector(".filter-section__chevron");
    if (ch) {
      ch.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
    }
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  panel.querySelectorAll(".filter-section__toggle").forEach(function (btn) {
    var section = btn.closest(".filter-section");
    var body = section && section.querySelector(".filter-section__body");
    if (!body) {
      return;
    }
    var startOpen = section.classList.contains("filter-section--open");
    body.hidden = !startOpen;
    syncSectionChevron(btn, startOpen);

    btn.addEventListener("click", function () {
      var isOpen = !body.hidden;
      body.hidden = isOpen;
      section.classList.toggle("filter-section--open", !isOpen);
      syncSectionChevron(btn, !isOpen);
    });
  });

  panel.querySelectorAll("[data-view-more]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = panel.querySelector(link.getAttribute("data-view-more"));
      if (!target) {
        return;
      }
      var expanded = target.classList.toggle("is-expanded");
      link.textContent = expanded ? "View Less" : "View More";
    });
  });

  panel.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener("change", applyFilters);
  });
  if (stockCb) {
    stockCb.addEventListener("change", applyFilters);
  }

  if (rangeMin && rangeMax) {
    rangeMin.addEventListener("input", function () {
      clampRangeInputs("min");
      applyFilters();
    });
    rangeMax.addEventListener("input", function () {
      clampRangeInputs("max");
      applyFilters();
    });
    clampRangeInputs();
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      panel.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        cb.checked = false;
      });
      if (stockCb) {
        stockCb.checked = false;
      }
      if (rangeMin) {
        rangeMin.value = String(PRICE_MIN);
      }
      if (rangeMax) {
        rangeMax.value = String(PRICE_MAX);
      }
      panel.querySelectorAll(".filter-options-more.is-expanded").forEach(function (el) {
        el.classList.remove("is-expanded");
      });
      panel.querySelectorAll(".filter-view-more").forEach(function (a) {
        a.textContent = "View More";
      });
      clampRangeInputs();
      applyFilters();
    });
  }

  function initMobileFilterSheet() {
    var openBtn = document.getElementById("catFilterOpen");
    var closeBtn = document.getElementById("catFilterClose");
    var backdrop = document.getElementById("catFilterBackdrop");
    if (!openBtn || !panel) {
      return;
    }

    var mq = window.matchMedia("(max-width: 1100px)");

    function isSheetLayout() {
      return mq.matches;
    }

    function setOpen(open) {
      if (!isSheetLayout()) {
        panel.classList.remove("is-open");
        document.body.classList.remove("category-filter-sheet-open");
        openBtn.setAttribute("aria-expanded", "false");
        return;
      }
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("category-filter-sheet-open", open);
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && closeBtn) {
        closeBtn.focus();
      }
      if (!open) {
        openBtn.focus();
      }
    }

    openBtn.addEventListener("click", function () {
      if (!isSheetLayout()) {
        return;
      }
      setOpen(true);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (!isSheetLayout() && panel.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  initMobileFilterSheet();

  applyFilters();
})();
