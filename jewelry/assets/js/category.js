(function () {
  "use strict";

  var filterOpen = document.getElementById("cat-filter-open");
  var filterPanel = document.getElementById("cat-filters");
  var filterClear = document.getElementById("cat-filter-clear");
  var filterCount = document.getElementById("cat-filter-count");
  var viewMoreBtn = document.getElementById("cat-filters-view-more");

  function updateFilterCount() {
    if (!filterCount || !filterPanel) return;
    var checked = filterPanel.querySelectorAll('input[type="checkbox"]:checked').length;
    filterCount.textContent = String(checked);
  }

  if (filterOpen && filterPanel) {
    filterOpen.addEventListener("click", function () {
      var open = document.body.classList.toggle("cat-filters-open");
      filterOpen.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains("cat-filters-open")) return;
      if (window.innerWidth > 900) return;
      if (filterPanel.contains(e.target) || filterOpen.contains(e.target)) return;
      document.body.classList.remove("cat-filters-open");
      filterOpen.setAttribute("aria-expanded", "false");
    });
  }

  if (filterPanel) {
    filterPanel.addEventListener("change", function (e) {
      if (e.target && e.target.matches('input[type="checkbox"]')) {
        updateFilterCount();
      }
    });
  }

  if (filterClear && filterPanel) {
    filterClear.addEventListener("click", function () {
      filterPanel.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.checked = false;
      });
      updateFilterCount();
    });
  }

  document.querySelectorAll(".cat-filter__more").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      btn.classList.toggle("is-open", !expanded);
    });
  });

  if (viewMoreBtn && filterPanel) {
    viewMoreBtn.addEventListener("click", function () {
      filterPanel.classList.toggle("cat-filters--expanded");
      var expanded = filterPanel.classList.contains("cat-filters--expanded");
      viewMoreBtn.textContent = expanded ? "View less" : "View more";
    });
  }

  updateFilterCount();

  document.querySelectorAll(".cat-card__compare, .cat-card__nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });
})();
