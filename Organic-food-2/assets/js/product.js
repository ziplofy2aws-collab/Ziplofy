(function () {
  "use strict";

  function formatPrice(n) {
    return "\u20B9 " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setList(el, items) {
    if (!el || !items) return;
    el.innerHTML = items.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");
  }

  function bindThumbs() {
    var mainImg = document.getElementById("pdp-main-img");
    var thumbs = document.querySelectorAll(".pdp__thumb");

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-img");
        if (mainImg && src) {
          mainImg.src = src;
        }
        thumbs.forEach(function (t) {
          t.classList.remove("is-active");
        });
        thumb.classList.add("is-active");
      });
    });
  }

  function renderRelated(currentId) {
    var grid = document.querySelector("[data-pdp-related]");
    if (!grid || !window.PR_PRODUCTS) return;

    var ids = Object.keys(window.PR_PRODUCTS).filter(function (id) {
      return id !== currentId;
    }).slice(0, 4);

    grid.innerHTML = ids.map(function (id) {
      var p = window.PR_PRODUCTS[id];
      var pack = p.pack && p.pack[0] ? p.pack[0] : "";
      return (
        '<article class="bs-card" data-product-id="' + id + '">' +
        '<span class="bs-card__badge">' + (p.badge || "") + '</span>' +
        '<a href="product.html?id=' + id + '" class="bs-card__media">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' +
        "</a>" +
        '<h3 class="bs-card__name"><a href="product.html?id=' + id + '">' + p.name + "</a></h3>" +
        '<p class="bs-card__price">' +
        '<span class="bs-card__price-now">' + formatPrice(p.price) + "</span>" +
        (p.mrp ? '<span class="bs-card__price-old">' + formatPrice(p.mrp) + "</span>" : "") +
        "</p>" +
        '<div class="bs-card__select"><select aria-label="Select pack"><option>' + pack + "</option></select></div>" +
        '<button type="button" class="bs-card__btn">Add to Cart</button>' +
        "</article>"
      );
    }).join("");
  }

  function loadProduct() {
    if (!window.PR_PRODUCTS) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || "bs-1";
    var product = window.PR_PRODUCTS[id] || window.PR_PRODUCTS["bs-1"];

    document.title = product.name + " | Prakrit";

    var crumb = document.querySelector("[data-pdp-crumb]");
    if (crumb) crumb.textContent = product.name;

    var title = document.querySelector("[data-pdp-title]");
    if (title) title.textContent = product.fullTitle || product.name;

    var desc = document.querySelector("[data-pdp-desc]");
    if (desc) desc.textContent = product.desc || "";

    var priceEl = document.querySelector("[data-pdp-price]");
    if (priceEl) priceEl.textContent = formatPrice(product.price);

    var skuEl = document.querySelector("[data-pdp-sku]");
    if (skuEl) skuEl.textContent = "SKU: " + (product.sku || "");

    var mainImg = document.querySelector("[data-pdp-main-img]");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    var thumbsWrap = document.querySelector("[data-pdp-thumbs]");
    if (thumbsWrap) {
      var gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
      thumbsWrap.innerHTML = gallery.map(function (src, i) {
        return (
          '<button type="button" class="pdp__thumb' + (i === 0 ? " is-active" : "") +
          '" data-img="' + src + '" aria-label="View image ' + (i + 1) + '">' +
          '<img src="' + src + '" alt="" />' +
          "</button>"
        );
      }).join("");
      bindThumbs();
    }

    var accDesc = document.querySelector("[data-pdp-acc-desc]");
    if (accDesc) accDesc.textContent = product.description || product.desc || "";

    setList(document.querySelector("[data-pdp-acc-nutrition]"), product.nutrition);
    setList(document.querySelector("[data-pdp-acc-faqs]"), product.faqs);

    var articles = document.querySelector("[data-pdp-acc-articles]");
    if (articles) articles.textContent = product.articles || "";

    var videos = document.querySelector("[data-pdp-acc-videos]");
    if (videos) videos.textContent = product.videos || "";

    renderRelated(id);
  }

  /* Quantity stepper */
  var qtyWrap = document.querySelector("[data-qty]");
  if (qtyWrap) {
    var qtyVal = qtyWrap.querySelector("[data-qty-val]");
    var minus = qtyWrap.querySelector("[data-qty-minus]");
    var plus = qtyWrap.querySelector("[data-qty-plus]");
    var count = 1;

    if (minus) {
      minus.addEventListener("click", function () {
        if (count > 1) {
          count--;
          qtyVal.textContent = count;
        }
      });
    }

    if (plus) {
      plus.addEventListener("click", function () {
        count++;
        qtyVal.textContent = count;
      });
    }
  }

  /* Accordion toggle */
  document.querySelectorAll(".pdp__acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      head.parentElement.classList.toggle("pdp__acc--open");
    });
  });

  loadProduct();
})();
