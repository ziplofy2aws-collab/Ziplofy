(function () {
  "use strict";

  var grid = document.querySelector("[data-bh-shop-grid]");
  if (grid && window.BHProducts && window.BH_PRODUCTS) {
    grid.innerHTML = window.BHProducts.renderProductCards(window.BH_PRODUCTS);
  }
})();
