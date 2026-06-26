/* ===== Shop: filter sidebar toggle ===== */
(function () {
  "use strict";

  var toggle = document.querySelector("[data-el2-filter-toggle]");
  var sidebar = document.querySelector("[data-el2-filter]");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", function () {
    sidebar.classList.toggle("is-open");
  });
})();
