(function () {
  var filterBtn = document.querySelector("[data-sh2-shop-filter-open]");
  var filterClose = document.querySelector("[data-sh2-shop-filter-close]");
  var filters = document.querySelector("[data-sh2-shop-filters]");
  var overlay = document.querySelector("[data-sh2-shop-overlay]");

  if (!filters) return;

  function openFilters() {
    filters.hidden = false;
    filters.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (filterBtn) filterBtn.setAttribute("aria-expanded", "true");
  }

  function closeFilters() {
    filters.classList.remove("is-open");
    filters.hidden = true;
    if (overlay) overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    if (filterBtn) filterBtn.setAttribute("aria-expanded", "false");
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", openFilters);
  }

  if (filterClose) {
    filterClose.addEventListener("click", closeFilters);
  }

  if (overlay) {
    overlay.addEventListener("click", closeFilters);
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 992) {
      closeFilters();
    }
  });
})();
