(function () {
  "use strict";

  var filterBtn = document.querySelector("[data-cat-filter-open]");
  var filterPanel = document.getElementById("aetCatFilters");
  var filterBackdrop = document.querySelector("[data-cat-filter-backdrop]");
  var filterClose = document.querySelectorAll("[data-cat-filter-close]");

  function setFiltersOpen(open) {
    if (!filterPanel) return;
    filterPanel.classList.toggle("is-open", open);
    if (filterBackdrop) filterBackdrop.classList.toggle("is-open", open);
    if (filterBtn) filterBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      setFiltersOpen(!filterPanel.classList.contains("is-open"));
    });
  }

  if (filterBackdrop) {
    filterBackdrop.addEventListener("click", function () {
      setFiltersOpen(false);
    });
  }

  filterClose.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFiltersOpen(false);
    });
  });

  document.querySelectorAll("[data-filter-acc]").forEach(function (acc) {
    var toggle = acc.querySelector(".aet-cat-filter-acc__toggle");
    var body = acc.querySelector(".aet-cat-filter-acc__body");
    if (!toggle || !body) return;

    toggle.addEventListener("click", function () {
      var open = acc.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        body.removeAttribute("hidden");
      } else {
        body.setAttribute("hidden", "");
      }
    });
  });
})();
