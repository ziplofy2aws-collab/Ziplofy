(function () {
  "use strict";

  document.querySelectorAll(".cat-card__quick-add").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  var filterRoot = document.querySelector("[data-cat-filter]");
  var filterOpenBtn = document.querySelector("[data-filter-open]");
  var filterCloseEls = document.querySelectorAll("[data-filter-close]");
  var filterPanel = document.getElementById("cat-filter-panel");

  function openFilter() {
    if (!filterRoot) return;
    filterRoot.classList.add("is-open");
    filterRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-filter-open");
    if (filterOpenBtn) {
      filterOpenBtn.setAttribute("aria-expanded", "true");
    }
    if (filterPanel) {
      filterPanel.focus();
    }
  }

  function closeFilter() {
    if (!filterRoot) return;
    filterRoot.classList.remove("is-open");
    filterRoot.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-filter-open");
    if (filterOpenBtn) {
      filterOpenBtn.setAttribute("aria-expanded", "false");
      filterOpenBtn.focus();
    }
  }

  if (filterOpenBtn && filterRoot) {
    filterOpenBtn.addEventListener("click", openFilter);

    filterCloseEls.forEach(function (el) {
      el.addEventListener("click", closeFilter);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && filterRoot.classList.contains("is-open")) {
        closeFilter();
      }
    });
  }

  document.querySelectorAll("[data-filter-section]").forEach(function (section) {
    var head = section.querySelector(".cat-filter__section-head");
    if (!head) return;

    head.addEventListener("click", function () {
      var isOpen = section.classList.toggle("is-open");
      head.setAttribute("aria-expanded", isOpen ? "true" : "false");
      var icon = head.querySelector(".cat-filter__section-icon");
      if (icon) {
        if (isOpen) {
          icon.textContent = "−";
          icon.style.fontSize = "";
        } else {
          icon.textContent = "";
          icon.style.fontSize = "0";
        }
      }
    });
  });

  document.querySelectorAll(".cat-filter__color").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.toggle("is-active");
    });
  });

  document.querySelectorAll(".cat-filter__size").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.toggle("is-active");
    });
  });

  var rangeWrap = document.querySelector("[data-price-range]");
  if (rangeWrap) {
    var minRange = rangeWrap.querySelector(".cat-filter__range-min");
    var maxRange = rangeWrap.querySelector(".cat-filter__range-max");
    var minInput = document.querySelector("[data-price-min]");
    var maxInput = document.querySelector("[data-price-max]");
    var fill = rangeWrap.querySelector("[data-range-fill]");
    var maxVal = 750;

    function formatPrice(val) {
      return "$" + (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2));
    }

    function updateRange() {
      if (!minRange || !maxRange) return;
      var min = Math.min(parseInt(minRange.value, 10), parseInt(maxRange.value, 10));
      var max = Math.max(parseInt(minRange.value, 10), parseInt(maxRange.value, 10));
      minRange.value = String(min);
      maxRange.value = String(max);

      if (minInput) minInput.value = formatPrice(min);
      if (maxInput) maxInput.value = formatPrice(max === maxVal ? 749.95 : max);

      if (fill) {
        var left = (min / maxVal) * 100;
        var right = 100 - (max / maxVal) * 100;
        fill.style.left = left + "%";
        fill.style.right = right + "%";
      }
    }

    if (minRange) minRange.addEventListener("input", updateRange);
    if (maxRange) maxRange.addEventListener("input", updateRange);
    updateRange();
  }
})();
