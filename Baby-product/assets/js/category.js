(function () {
  var grid = document.querySelector("[data-bm-cat-grid]");
  if (!grid || !window.BM_PRODUCTS) return;

  function formatPrice(n) {
    return "Rs. " + n.toLocaleString("en-IN") + ".00";
  }

  var eyeIcon =
    '<svg viewBox="0 0 20 14" fill="none" aria-hidden="true">' +
    '<ellipse cx="10" cy="7" rx="8" ry="5" stroke="currentColor" stroke-width="1.3"/>' +
    '<circle cx="10" cy="7" r="2" fill="currentColor"/></svg>';

  grid.innerHTML = window.BM_PRODUCTS.map(function (p) {
    var url = "product.html?p=" + p.id;
    return (
      '<article class="bm-cat-card" data-bm-product-id="' + p.id + '">' +
      '<div class="bm-cat-card__media-wrap">' +
      '<a href="' + url + '" class="bm-cat-card__media">' +
      '<img src="' + p.image + '" alt="" width="320" height="320" decoding="async" />' +
      "</a>" +
      '<div class="bm-cat-card__overlays">' +
      '<a href="' + url + '" class="bm-cat-card__quickview" aria-label="Quick view">' +
      eyeIcon +
      "</a>" +
      '<span class="bm-cat-card__badge">' + p.badge + "</span>" +
      "</div></div>" +
      '<div class="bm-cat-card__body">' +
      '<h3 class="bm-cat-card__title"><a href="' + url + '">' + p.title + "</a></h3>" +
      '<p class="bm-cat-card__price">' +
      '<s class="bm-cat-card__price-old">' + formatPrice(p.mrp) + "</s>" +
      '<span class="bm-cat-card__price-sale">' + formatPrice(p.price) + "</span>" +
      "</p>" +
      '<button type="button" class="bm-cat-card__btn">Quick Add</button>' +
      "</div></article>"
    );
  }).join("");

  var countEl = document.querySelector("[data-bm-cat-count]");
  if (countEl) countEl.textContent = window.BM_PRODUCTS.length + " products";
})();

(function () {
  var filter = document.querySelector("[data-bm-cat-filter]");
  var overlay = document.querySelector("[data-bm-cat-filter-overlay]");
  var openBtn = document.querySelector("[data-bm-cat-filter-open]");
  if (!filter) return;

  function setOpen(open) {
    filter.classList.toggle("is-open", open);
    if (overlay) overlay.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtn?.addEventListener("click", function () {
    setOpen(true);
  });
  overlay?.addEventListener("click", function () {
    setOpen(false);
  });

  document.querySelectorAll("[data-bm-filter-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      btn.classList.toggle("is-open", !expanded);
      var panel = btn.nextElementSibling;
      if (panel) panel.classList.toggle("is-open", !expanded);
    });
  });
})();
