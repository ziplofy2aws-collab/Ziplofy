(function () {
  "use strict";

  var sidebar = document.getElementById("phr-shop-filters");
  var openBtn = document.querySelector("[data-phr-filter-open]");
  var closeBtn = document.querySelector("[data-phr-filter-close]");
  var overlay = document.querySelector("[data-phr-filter-overlay]");

  function openFilters() {
    if (!sidebar) return;
    sidebar.classList.add("is-open");
    if (overlay) overlay.hidden = false;
    document.body.classList.add("phr-shop-filter-open");
  }

  function closeFilters() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (overlay) overlay.hidden = true;
    document.body.classList.remove("phr-shop-filter-open");
  }

  if (openBtn) {
    openBtn.addEventListener("click", openFilters);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeFilters);
  }

  if (overlay) {
    overlay.addEventListener("click", closeFilters);
  }

  document.querySelectorAll("[data-phr-filter-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var filter = toggle.closest(".phr-shop__filter");
      if (!filter) return;

      var isOpen = filter.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  function bindRange(minInput, maxInput, labelEl, format) {
    if (!minInput || !maxInput || !labelEl) return;

    function update() {
      var min = Number(minInput.value);
      var max = Number(maxInput.value);

      if (min > max) {
        if (document.activeElement === minInput) {
          maxInput.value = String(min);
          max = min;
        } else {
          minInput.value = String(max);
          min = max;
        }
      }

      labelEl.textContent = format(min, max);
    }

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
    update();
  }

  bindRange(
    document.querySelector("[data-phr-range-min]"),
    document.querySelector("[data-phr-range-max]"),
    document.querySelector("[data-phr-price-label]"),
    function (min, max) {
      return "₹" + min.toLocaleString("en-IN") + " - ₹" + max.toLocaleString("en-IN");
    }
  );

  bindRange(
    document.querySelector("[data-phr-discount-min]"),
    document.querySelector("[data-phr-discount-max]"),
    document.querySelector("[data-phr-discount-label]"),
    function (min, max) {
      return min + "% - " + max + "%";
    }
  );
})();
