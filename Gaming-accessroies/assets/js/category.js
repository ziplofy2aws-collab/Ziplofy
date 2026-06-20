(function () {
  "use strict";

  var grid = document.querySelector("[data-cat-grid]");
  var titleEl = document.querySelector("[data-cat-title]");
  var prefixEl = document.querySelector("[data-cat-prefix]");
  var accentEl = document.querySelector("[data-cat-accent]");
  var countEl = document.querySelector("[data-cat-count]");
  var sortSelect = document.querySelector("[data-cat-sort]");
  var filterBtn = document.querySelector("[data-cat-filter-open]");
  var filterPanel = document.querySelector("[data-cat-filter]");
  var filterClose = document.querySelector("[data-cat-filter-close]");
  var filterBackdrop = document.querySelector("[data-cat-filter-backdrop]");

  if (!grid || !window.EH_PRODUCTS) return;

  var params = new URLSearchParams(window.location.search);
  var catKey = params.get("cat") || "all";
  var meta = window.EH_CATEGORIES[catKey] || window.EH_CATEGORIES.all;

  if (titleEl) titleEl.textContent = meta.title;
  if (prefixEl) prefixEl.textContent = meta.prefix;
  if (accentEl) {
    accentEl.textContent = meta.accent;
    accentEl.hidden = !meta.accent;
  }

  document.title = meta.title + " — NovaCore Gaming Store";

  function getFiltered() {
    var list = window.EH_PRODUCTS.slice();
    if (catKey !== "all") {
      list = list.filter(function (p) {
        return p.category === catKey;
      });
    }

    var checked = Array.from(document.querySelectorAll("[data-cat-filter-platform]:checked")).map(function (el) {
      return el.value;
    });
    if (checked.length) {
      list = list.filter(function (p) {
        return checked.indexOf(p.platform) !== -1;
      });
    }

    var sort = sortSelect ? sortSelect.value : "featured";
    if (sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (sort === "name") list.sort(function (a, b) { return a.title.localeCompare(b.title); });

    return list;
  }

  function formatPrice(n) {
    return "\u20B9" + n.toLocaleString("en-IN");
  }

  function render() {
    var products = getFiltered();
    if (countEl) countEl.textContent = products.length + " products";

    grid.innerHTML = products.map(function (p) {
      var btnText = p.type === "preowned" ? "BUY NOW &rarr;" : "ADD TO CART";
      var btnClass = p.type === "preowned" ? "eh-preowned-card__btn" : "eh-ps5-card__btn";
      var cardClass = p.type === "preowned" ? "eh-preowned-card eh-cat-grid__card" : "eh-ps5-card eh-cat-grid__card";
      var badgeClass = p.type === "preowned" ? "eh-preowned-card__badge" : "eh-ps5-card__badge";
      var mediaClass = p.type === "preowned" ? "eh-preowned-card__media" : "eh-ps5-card__media";
      var bodyClass = p.type === "preowned" ? "eh-preowned-card__body" : "eh-ps5-card__body";
      var catClass = p.type === "preowned" ? "eh-preowned-card__cat" : "eh-ps5-card__cat";
      var titleClass = p.type === "preowned" ? "eh-preowned-card__title" : "eh-ps5-card__title";
      var priceClass = p.type === "preowned" ? "eh-preowned-card__price" : "eh-ps5-card__price";

      return (
        '<article class="' + cardClass + '">' +
          '<a href="product.html?id=' + p.id + '" class="' + mediaClass + '">' +
            '<span class="' + badgeClass + '">' + p.badge + '</span>' +
            '<img src="' + p.image + '" alt="' + p.title.replace(/"/g, "&quot;") + '" width="200" height="260" loading="lazy" decoding="async">' +
          '</a>' +
          '<div class="' + bodyClass + '">' +
            '<span class="' + catClass + '">' + p.categoryLabel + '</span>' +
            '<h3 class="' + titleClass + '"><a href="product.html?id=' + p.id + '">' + p.title + '</a></h3>' +
            '<p class="' + priceClass + '">' + formatPrice(p.price) + '</p>' +
            (p.type === "preowned"
              ? '<a href="product.html?id=' + p.id + '" class="' + btnClass + '">' + btnText + '</a>'
              : '<a href="product.html?id=' + p.id + '" class="' + btnClass + '">' + btnText + '</a>') +
          '</div>' +
        '</article>'
      );
    }).join("");

    if (!products.length) {
      grid.innerHTML = '<p class="eh-cat-empty">No products match your filters.</p>';
    }

    if (window.initProductCards) window.initProductCards();
  }

  if (sortSelect) sortSelect.addEventListener("change", render);
  document.querySelectorAll("[data-cat-filter-platform]").forEach(function (el) {
    el.addEventListener("change", render);
  });

  function setFilterOpen(open) {
    if (!filterPanel) return;
    filterPanel.classList.toggle("is-open", open);
    if (filterBackdrop) filterBackdrop.classList.toggle("is-open", open);
    document.body.classList.toggle("eh-filter-open", open);
  }

  if (filterBtn) filterBtn.addEventListener("click", function () { setFilterOpen(true); });
  if (filterClose) filterClose.addEventListener("click", function () { setFilterOpen(false); });
  if (filterBackdrop) filterBackdrop.addEventListener("click", function () { setFilterOpen(false); });

  render();
})();
