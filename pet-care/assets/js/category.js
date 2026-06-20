(function () {
  var FILTER_LABELS = [
    "Brands",
    "Diet Type",
    "Form",
    "Country of Origin",
    "Features",
    "Allergens",
    "Age Group",
    "Breeds",
    "Size",
    "Pet Sizes",
    "Pet Types",
    "Target Species",
    "Availability",
    "Price",
    "Product rating",
    "Special Use"
  ];

  var PRODUCTS = [
    { id: "airline-crate", title: "48-Inch IATA Approved Airline Dog Crate For Large Breed Dogs", img: "assets/img/RP-6.png", price: "Rs. 38,000.00", oldPrice: "Rs. 45,000.00", badge: "15% OFF" },
    { id: "acana-small", title: "Acana Adult Small Breed Dog Food", img: "assets/img/RP-1.png", price: "Rs. 551.00", oldPrice: "Rs. 650.00", badge: "15% OFF" },
    { id: "acana-pacifica", title: "Acana Cat Pacifica Dry Cat Food", img: "assets/img/RP-2.png", price: "Rs. 466.00", oldPrice: "Rs. 549.00", badge: "15% OFF" },
    { id: "acana-prairie", title: "Acana Classic Prairie Poultry Dry Dog Food", img: "assets/img/RP-3.png", price: "Rs. 499.00", oldPrice: "", badge: "15% OFF", soldOut: true },
    { id: "supercoat-dog", title: "Purina SuperCoat Chicken Adult All Breed Dog Dry Food", img: "assets/img/RP-1.png", price: "Rs. 2,252.00", oldPrice: "Rs. 2,650.00", badge: "15% OFF" },
    { id: "royal-canin-cat", title: "Royal Canin Fit 32 Adult Cat Dry Food", img: "assets/img/RP-2.png", price: "Rs. 1,793.00", oldPrice: "Rs. 2,110.00", badge: "15% OFF" },
    { id: "toptail-treats", title: "Toptail Squeezy Chicken & Liver Flavour Creamy Cat Treats 60g", img: "assets/img/RP-3.png", price: "Rs. 104.00", oldPrice: "Rs. 118.00", badge: "12% OFF" },
    { id: "felix-salmon", title: "Purina Felix Salmon In Jelly Adult Wet Food 85g", img: "assets/img/RP-4.png", price: "Rs. 561.00", oldPrice: "Rs. 660.00", badge: "15% OFF" },
    { id: "felix-tuna", title: "Purina Felix Tuna In Jelly Adult Cat Wet Food 85g", img: "assets/img/RP-5.png", price: "Rs. 597.00", oldPrice: "Rs. 720.00", badge: "17% OFF" },
    { id: "pedigree-adult", title: "Pedigree Adult Chicken & Vegetables Dog Dry Food", img: "assets/img/RP-6.png", price: "Rs. 1,899.00", oldPrice: "Rs. 2,110.00", badge: "10% OFF" },
    { id: "whiskas-tuna", title: "Whiskas Tuna Flavour Adult Cat Wet Food 85g", img: "assets/img/RP-7.png", price: "Rs. 480.00", oldPrice: "Rs. 558.00", badge: "14% OFF" },
    { id: "drools-focus", title: "Drools Focus Adult Super Premium Dog Food", img: "assets/img/RP-8.png", price: "Rs. 2,499.00", oldPrice: "Rs. 2,975.00", badge: "16% OFF" },
    { id: "tuxedo-bandana", title: "PawsIndia Black & White Tuxedo Bandana With Tie For Dogs & Cats", img: "assets/img/BS-1.webp", price: "Rs. 499.00", oldPrice: "Rs. 699.00", badge: "Save ₹200" },
    { id: "floral-bandana", title: "PawsIndia Baby Blue Floral Print With Tie For Dogs & Cats", img: "assets/img/BS-2.webp", price: "Rs. 499.00", oldPrice: "Rs. 699.00", badge: "Save ₹200" },
    { id: "navy-tuxedo", title: "PawsIndia Dark Blue & White Tuxedo Bandana With Tie For Dogs & Cats", img: "assets/img/BS-3.webp", price: "Rs. 599.00", oldPrice: "Rs. 999.00", badge: "Save ₹400" },
    { id: "brown-tuxedo", title: "PawsIndia Brown & White Tuxedo Bandana With Tie For Dogs & Cats", img: "assets/img/BS-4.webp", price: "Rs. 599.00", oldPrice: "Rs. 999.00", badge: "Save ₹400" },
    { id: "dino-print", title: "PawsIndia Blue & White Dinosaur Print With Tie For Dogs & Cats", img: "assets/img/BS-5.webp", price: "Rs. 499.00", oldPrice: "Rs. 699.00", badge: "Save ₹200" }
  ];

  var filterList = document.querySelector("[data-pc-filter-list]");
  if (filterList) {
    FILTER_LABELS.forEach(function (label) {
      var li = document.createElement("li");
      li.className = "pc-shop-filter__item";
      li.innerHTML =
        '<button type="button" class="pc-shop-filter__toggle" data-pc-filter-toggle aria-expanded="false">' +
        label +
        ' <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
        '<div class="pc-shop-filter__panel"><label><input type="checkbox" /> Option 1</label>' +
        '<label><input type="checkbox" /> Option 2</label></div>';
      filterList.appendChild(li);
    });

    filterList.querySelectorAll("[data-pc-filter-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.nextElementSibling;
        var isOpen = btn.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (panel) panel.classList.toggle("is-open", isOpen);
      });
    });
  }

  var grid = document.querySelector("[data-pc-shop-grid]");
  if (grid) {
    PRODUCTS.forEach(function (p) {
      var article = document.createElement("article");
      article.className = "pc-shop-card";
      var badgeClass = p.soldOut ? "pc-shop-card__badge pc-shop-card__badge--sold" : "pc-shop-card__badge";
      var badgeText = p.soldOut ? "SOLD OUT" : p.badge;
      var oldPriceHtml = p.oldPrice
        ? '<span class="pc-shop-card__old-price">' + p.oldPrice + "</span>"
        : "";
      article.innerHTML =
        '<div class="pc-shop-card__inner">' +
        '<a href="product.html?id=' + p.id + '" class="pc-shop-card__link">' +
        '<div class="pc-shop-card__media">' +
        '<span class="' + badgeClass + '">' + badgeText + "</span>" +
        '<img src="' + p.img + '" alt="' + p.title.replace(/"/g, "&quot;") + '" loading="lazy" decoding="async" />' +
        "</div>" +
        '<h3 class="pc-shop-card__title">' + p.title + "</h3>" +
        '<div class="pc-shop-card__price-row">' +
        '<span class="pc-shop-card__price">' + p.price + "</span>" +
        oldPriceHtml +
        "</div>" +
        '<div class="pc-shop-card__rating" aria-label="5 out of 5 stars">' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
        "</div></a>" +
        '<div class="pc-shop-card__actions">' +
        '<button type="button" class="pc-shop-card__action pc-shop-card__action--compare" aria-label="Compare product">' +
        '<i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i></button>' +
        '<button type="button" class="pc-shop-card__action pc-shop-card__action--wish" aria-label="Add to wishlist">' +
        '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
        "</div></div>";
      grid.appendChild(article);
    });

    grid.querySelectorAll(".pc-shop-card__action").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  }

  var countEl = document.querySelector("[data-pc-shop-count]");
  if (countEl) {
    countEl.textContent = "Showing 1-" + PRODUCTS.length + " of 565 Results";
  }

  var gridEl = document.querySelector("[data-pc-shop-grid]");
  var viewBtns = document.querySelectorAll("[data-pc-shop-cols]");
  if (gridEl && viewBtns.length) {
    gridEl.setAttribute("data-cols", "4");
    viewBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cols = btn.getAttribute("data-pc-shop-cols");
        gridEl.setAttribute("data-cols", cols);
        gridEl.classList.toggle("is-list", cols === "list");
        viewBtns.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
      });
    });
  }

  var filterBtn = document.querySelector("[data-pc-shop-filter-toggle]");
  var filters = document.querySelector("[data-pc-shop-filters]");
  var backdrop = document.querySelector("[data-pc-shop-backdrop]");
  var closeBtn = document.querySelector("[data-pc-shop-filters-close]");

  function closeFilters() {
    if (filters) filters.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function openFilters() {
    if (filters) filters.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  if (filterBtn) filterBtn.addEventListener("click", openFilters);
  if (closeBtn) closeBtn.addEventListener("click", closeFilters);
  if (backdrop) backdrop.addEventListener("click", closeFilters);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeFilters();
  });

  var topBtn = document.querySelector("[data-pc-shop-top]");
  if (topBtn) {
    window.addEventListener("scroll", function () {
      topBtn.classList.toggle("is-visible", window.scrollY > 400);
    });
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
