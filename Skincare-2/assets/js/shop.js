(function () {
  var products = window.LV_PRODUCTS || [];
  var grid = document.querySelector("[data-lv-shop-grid]");
  var countEl = document.querySelector("[data-lv-shop-count]");
  var sortEl = document.querySelector("[data-lv-shop-sort]");
  var filterRoot = document.querySelector("[data-lv-shop-filter]");
  var filterBtn = document.querySelector("[data-lv-shop-filter-btn]");
  var overlay = document.querySelector("[data-lv-shop-overlay]");
  if (!grid) return;

  function formatPrice(n) {
    return "Rs. " + n;
  }

  function cardHTML(p) {
    var old =
      p.mrp && p.mrp > p.price
        ? '<span class="lv-pcard__price-old">' + formatPrice(p.mrp) + "</span>"
        : "";
    return (
      '<article class="lv-pcard" data-lv-product-id="' +
      p.id +
      '">' +
      '<div class="lv-pcard__media">' +
      '<div class="lv-pcard__benefit">' +
      '<p class="lv-pcard__benefit-title">' +
      p.benefit +
      "</p>" +
      '<p class="lv-pcard__benefit-sub">' +
      p.benefitSub +
      "</p>" +
      "</div>" +
      '<img class="lv-pcard__img" src="' +
      p.image +
      '" alt="' +
      p.title.replace(/"/g, "&quot;") +
      '" width="220" height="280" loading="lazy" decoding="async" />' +
      "</div>" +
      '<div class="lv-pcard__body">' +
      '<p class="lv-pcard__size">' +
      p.size +
      "</p>" +
      '<p class="lv-pcard__highlight">' +
      p.highlight +
      "</p>" +
      '<h3 class="lv-pcard__name">' +
      p.title +
      "</h3>" +
      '<div class="lv-pcard__rating">' +
      '<span class="lv-pcard__score">' +
      p.rating +
      "</span>" +
      '<span class="lv-pcard__stars" aria-hidden="true">★★★★★</span>' +
      '<span class="lv-pcard__reviews">(' +
      p.reviews +
      ")</span>" +
      "</div>" +
      '<p class="lv-pcard__price">' +
      formatPrice(p.price) +
      " " +
      old +
      "</p>" +
      "</div>" +
      '<button type="button" class="lv-pcard__cart">Add To Cart</button>' +
      "</article>"
    );
  }

  function selectedCategories() {
    if (!filterRoot) return [];
    return Array.prototype.map
      .call(filterRoot.querySelectorAll('[data-lv-filter-cat]:checked'), function (el) {
        return el.value;
      });
  }

  function filtered() {
    var cats = selectedCategories();
    var list = products.slice();
    if (cats.length) {
      list = list.filter(function (p) {
        return cats.indexOf(p.category) !== -1;
      });
    }
    var sort = sortEl ? sortEl.value : "featured";
    if (sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
  }

  function render() {
    var list = filtered();
    if (countEl) countEl.textContent = list.length + " products";
    if (!list.length) {
      grid.innerHTML = '<p class="lv-shop__empty">No products match your filters.</p>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join("");
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest("[data-lv-product-id]");
    if (!card) return;
    window.location.href =
      "product.html?id=" + encodeURIComponent(card.getAttribute("data-lv-product-id"));
  });

  if (sortEl) sortEl.addEventListener("change", render);

  if (filterRoot) {
    filterRoot.addEventListener("change", render);

    filterRoot.querySelectorAll("[data-lv-filter-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        var panel = btn.nextElementSibling;
        if (panel) panel.classList.toggle("is-open", open);
      });
    });
  }

  function setFilterOpen(open) {
    if (filterRoot) filterRoot.classList.toggle("is-open", open);
    if (overlay) overlay.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      setFilterOpen(true);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      setFilterOpen(false);
    });
  }

  render();
})();
