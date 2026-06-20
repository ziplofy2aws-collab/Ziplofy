(() => {
  const offerText = document.querySelector(".offer-text");
  const offerArrows = document.querySelectorAll(".offer-arrow");

  if (!offerText || offerArrows.length === 0) {
    return;
  }

  const offers = [
    "Buy Any 3 Perfumes @ \u20B9367 Each",
    "Flat 15% Off On Bestsellers",
    "Free Shipping On Orders Above \u20B9499"
  ];

  let activeOffer = 0;

  const updateOffer = () => {
    offerText.textContent = offers[activeOffer];
  };

  offerArrows.forEach((button, index) => {
    button.addEventListener("click", () => {
      activeOffer = index === 0
        ? (activeOffer - 1 + offers.length) % offers.length
        : (activeOffer + 1) % offers.length;
      updateOffer();
    });
  });

  const productCards = [...document.querySelectorAll(".product-card")];
  productCards.forEach((card) => {
    const image = card.querySelector("img");
    const source = image?.getAttribute("src") || "";
    const match = source.match(/(product-\d+|new-arrival-\d+)/i);
    const key = card.dataset.productKey || (match ? match[1].toLowerCase() : "");
    if (!key) {
      return;
    }

    card.dataset.productKey = key;
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        event.preventDefault();
      }
      window.location.href = `product.html?product=${encodeURIComponent(key)}`;
    });
  });
})();
