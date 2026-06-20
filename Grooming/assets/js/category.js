(function () {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const baseProducts = [
    { id: "blue-curse-edp", title: "Blue Curse Perfume EDP (100ml)", price: 699, oldPrice: 1500, off: "54% off", rating: "★ 4.7", reviews: "212 reviews", button: "ADD TO CART", image: "./assets/img/Blue Curse Perfume EDP (100ml).avif", tag: "BESTSELLER" },
    { id: "sea-borne-edp", title: "Sea Borne Perfume EDP (100ml)", price: 699, oldPrice: 1500, off: "54% off", rating: "★ 4.6", reviews: "175 reviews", button: "ADD TO CART", image: "./assets/img/Sea Borne Perfume EDP (100ml).webp", tag: "" },
    { id: "godfather-kit", title: "Beardo Godfather Multi-grooming Trimmer Kit", price: 2799, oldPrice: 3499, off: "21% off", rating: "★ 4.8", reviews: "592 reviews", button: "ADD TO CART", image: "./assets/img/Beardo Godfather Multi-grooming Trimmer Kit.webp", tag: "" },
    { id: "sport-spf80", title: "Beardo Sport Sunscreen Spray SPF 80 (100ml)", price: 599, oldPrice: 699, off: "15% off", rating: "★ 4.5", reviews: "98 reviews", button: "ADD TO CART", image: "./assets/img/Beardo Sport Sunscreen Spray SPF 80 (100ml).webp", tag: "" },
    { id: "ball-safe-cream", title: "Ball Safe Hair Removal Cream (100ml)", price: 499, oldPrice: null, off: "", rating: "", reviews: "", button: "SOLD OUT", image: "./assets/img/Ball Safe Hair Removal Cream (100ml).webp", tag: "" },
    { id: "alpha-spice-elixir", title: "Alpha Spice Elixir (100ml)", price: 1200, oldPrice: 2000, off: "40% off", rating: "", reviews: "", button: "ADD TO CART", image: "./assets/img/Alpha Spice Elixir (100ml).webp", tag: "" },
    { id: "max-sunscreen-gel", title: "Max Sunscreen Cooling Gel SPF 60 (50g)", price: 399, oldPrice: 450, off: "12% off", rating: "★ 4.9", reviews: "15 reviews", button: "ADD TO CART", image: "./assets/img/Max Sunscreen Cooling Gel SPF 60 (50g).webp", tag: "NEW" },
    { id: "alpha-amber-elixir", title: "Alpha Amber Elixir (100ml)", price: 1200, oldPrice: 2000, off: "40% off", rating: "★ 4.0", reviews: "1 review", button: "ADD TO CART", image: "./assets/img/Alpha Amber Elixir (100ml).webp", tag: "" },
  ];

  const formatPrice = function (value) {
    if (value === null || value === undefined) return "";
    return "₹" + Number(value).toLocaleString("en-IN");
  };

  const renderCard = function (item) {
    const oldPrice = item.oldPrice ? '<span class="old-price">' + formatPrice(item.oldPrice) + "</span>" : "";
    const off = item.off ? '<span class="off">' + item.off + "</span>" : "";
    const rating = item.rating ? '<p class="product-card-rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ' + item.rating.replace("★", "").trim() + " | " + item.reviews + "</p>" : '<p class="product-card-rating">&nbsp;</p>';
    const tag = item.tag ? '<span class="product-card-tag">' + item.tag + "</span>" : "";
    const isSoldOut = item.button === "SOLD OUT";
    const btnClass = isSoldOut ? "product-card-button is-disabled" : "product-card-button";
    const url = "./product.html?pid=" + encodeURIComponent(item.id);

    return [
      '<a class="product-card" href="' + url + '" data-product-id="' + item.id + '">',
      '  <div class="product-card-image">',
      "    " + tag,
      '    <img src="' + item.image + '" alt="' + item.title + '" loading="lazy" />',
      "  </div>",
      '  <div class="product-card-body">',
      '    <h3 class="product-card-title">' + item.title + "</h3>",
      "    " + rating,
      '    <p class="product-card-price">' + formatPrice(item.price) + oldPrice + off + "</p>",
      '    <button class="' + btnClass + '" type="button" ' + (isSoldOut ? "disabled " : "") + 'data-add-to-cart="true" data-product-id="' + item.id + '">' + item.button + "</button>",
      "  </div>",
      "</a>",
    ].join("");
  };

  const BATCH_SIZE = 8;
  const LOAD_MORE_OFFSET = 280;
  let virtualIndex = 0;
  let isAppending = false;
  const renderedProducts = [];

  const getVirtualProduct = function (index) {
    const base = baseProducts[index % baseProducts.length];
    return {
      id: base.id + "-v" + index,
      title: base.title,
      price: base.price,
      oldPrice: base.oldPrice,
      off: base.off,
      rating: base.rating,
      reviews: base.reviews,
      button: base.button,
      image: base.image,
      tag: base.tag,
    };
  };

  const syncProductsToStorage = function () {
    localStorage.setItem("groomingProducts", JSON.stringify(renderedProducts));
  };

  const appendBatch = function () {
    if (isAppending) return;
    isAppending = true;

    const nextItems = [];
    for (let i = 0; i < BATCH_SIZE; i += 1) {
      nextItems.push(getVirtualProduct(virtualIndex));
      virtualIndex += 1;
    }

    grid.insertAdjacentHTML("beforeend", nextItems.map(renderCard).join(""));
    renderedProducts.push.apply(renderedProducts, nextItems);
    syncProductsToStorage();
    isAppending = false;
  };

  const shouldLoadMore = function () {
    const scrollBottom = window.scrollY + window.innerHeight;
    const threshold = document.documentElement.scrollHeight - LOAD_MORE_OFFSET;
    return scrollBottom >= threshold;
  };

  window.addEventListener("scroll", function () {
    if (shouldLoadMore()) appendBatch();
  });

  grid.addEventListener("click", function (event) {
    const addBtn = event.target.closest("[data-add-to-cart]");
    if (!addBtn) return;
    event.preventDefault();
    event.stopPropagation();
  });

  appendBatch();
  appendBatch();
})();
