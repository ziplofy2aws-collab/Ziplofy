(() => {
  const productCatalog = {
    "product-1": { title: "Bellin Party Combo for Him - 2 x 100ml", notes: "ORANGE BLOSSOM | GRAPEFRUIT | 100ML EDP", rating: "4.3", reviews: "5 Reviews", discount: "50%", price: "799.00", mrp: "1599.00" },
    "product-2": { title: "Bellin Rebel Eau De Parfum Combo - 4 x 20ml", notes: "NOTES PACK | LONG LASTING | 20ML EDP", rating: "4.3", reviews: "2 Reviews", discount: "40%", price: "599.00", mrp: "999.00" },
    "product-3": { title: "Bellin Desire EDP Perfume - 100ml", notes: "ONE STRIKE | MAGNETIC CHEMISTRY", rating: "4.6", reviews: "2 Reviews", discount: "43%", price: "449.00", mrp: "799.00" },
    "product-4": { title: "Bellin Oud Eau De Parfum for Men 100ml", notes: "AROMATIC SPICY THYME | BENZOIN | RICH AMBER", rating: "4.4", reviews: "8 Reviews", discount: "43%", price: "449.00", mrp: "799.00" },
    "product-5": { title: "Bellin Classic Eau De Parfum for Men 100ml", notes: "ORANGE BLOSSOM | JASMINE | 100ML EDP", rating: "4.6", reviews: "7 Reviews", discount: "43%", price: "449.00", mrp: "799.00" },
    "product-6": { title: "Bellin 7 Deadly Scents Trial Pack", notes: "LIMITED EDITION MINIATURES SET", rating: "4.2", reviews: "11 Reviews", discount: "40%", price: "599.00", mrp: "999.00" },
    "product-7": { title: "Bellin Snake Eau De Parfum - 100ml", notes: "INTENSE LONG LASTING PROFILE", rating: "4.3", reviews: "6 Reviews", discount: "43%", price: "449.00", mrp: "799.00" },
    "product-8": { title: "Bellin Heist Combo Gift Set", notes: "IRRESISTIBLE SCENTS FOR EVERY OCCASION", rating: "4.4", reviews: "9 Reviews", discount: "42%", price: "699.00", mrp: "1199.00" },
    "product-9": { title: "Bellin Rebel Noir EDP 100ml", notes: "FRESH CITRUS | CLEAN TRAIL", rating: "4.3", reviews: "6 Reviews", discount: "48%", price: "469.00", mrp: "899.00" },
    "product-10": { title: "Bellin Intense Collection for Men", notes: "GIFT-READY COLLECTION PACK", rating: "4.5", reviews: "11 Reviews", discount: "35%", price: "899.00", mrp: "1399.00" },
    "new-arrival-1": { title: "Bellin Noir Fusion Perfume - 100ml", notes: "SMOKY AMBER | EVERYDAY LUXURY", rating: "4.4", reviews: "18 Reviews", discount: "45%", price: "549.00", mrp: "999.00" },
    "new-arrival-2": { title: "Bellin Aqua Drift Perfume - 100ml", notes: "MARINE FRESH | LASTS UP TO 12 HOURS", rating: "4.3", reviews: "12 Reviews", discount: "44%", price: "499.00", mrp: "899.00" },
    "new-arrival-3": { title: "Bellin Bold Spice Perfume - 100ml", notes: "WARM SPICY BLEND FOR EVENINGS", rating: "4.5", reviews: "16 Reviews", discount: "47%", price: "579.00", mrp: "1099.00" },
    "new-arrival-4": { title: "Bellin Urban Vetiver Perfume - 100ml", notes: "WOODY VETIVER | CONTEMPORARY TRAIL", rating: "4.2", reviews: "9 Reviews", discount: "46%", price: "529.00", mrp: "999.00" },
    "new-arrival-5": { title: "Bellin Night Ember Perfume - 100ml", notes: "DARK VANILLA | RICH MASCULINE TONE", rating: "4.6", reviews: "22 Reviews", discount: "50%", price: "599.00", mrp: "1199.00" },
    "new-arrival-6": { title: "Bellin Raw Citrus Perfume - 100ml", notes: "BRIGHT CITRUS | CLEAN AND ENERGETIC", rating: "4.3", reviews: "14 Reviews", discount: "47%", price: "479.00", mrp: "899.00" },
    "new-arrival-7": { title: "Bellin Titanium EDP - 100ml", notes: "MODERN AROMATIC PROFILE", rating: "4.5", reviews: "13 Reviews", discount: "48%", price: "569.00", mrp: "1099.00" },
    "new-arrival-8": { title: "Bellin Black Rush Perfume - 100ml", notes: "BOLD WOODY ACCORD | PARTY PICK", rating: "4.2", reviews: "10 Reviews", discount: "45%", price: "549.00", mrp: "999.00" },
    "new-arrival-9": { title: "Bellin Ice Storm Perfume - 100ml", notes: "ICY FRESH OPENING | MUSKY BASE", rating: "4.1", reviews: "8 Reviews", discount: "46%", price: "489.00", mrp: "899.00" },
    "new-arrival-10": { title: "Bellin Luxe Gift Set - 4 x 20ml", notes: "PREMIUM MINIATURES FOR GIFTING", rating: "4.7", reviews: "21 Reviews", discount: "46%", price: "699.00", mrp: "1299.00" }
  };

  const params = new URLSearchParams(window.location.search);
  const selectedKey = (params.get("product") || "").toLowerCase();
  const selectedProduct = productCatalog[selectedKey];

  if (selectedProduct) {
    const heading = document.querySelector(".product-detail-right h1");
    const notes = document.querySelector(".pd-notes");
    const rating = document.querySelector(".pd-rating");
    const priceLine = document.querySelector(".pd-price-line");
    const mrp = document.querySelector(".pd-mrp span");
    const pay = document.querySelector(".pd-pay strong");
    const paySave = document.querySelector(".pd-pay span");
    const comboTitle = document.querySelector(".pd-combo-item p");
    const mainImage = document.querySelector(".pd-main-image");
    const firstThumb = document.querySelector(".pd-thumb");
    const firstThumbImage = firstThumb?.querySelector("img");
    const topBadge = document.querySelector(".pd-badge-top");
    const bottomBadge = document.querySelector(".pd-badge-bottom");

    if (heading) heading.textContent = selectedProduct.title;
    if (notes) notes.textContent = selectedProduct.notes;
    if (rating) rating.innerHTML = `&#9733; ${selectedProduct.rating} <span>| &#128100;(${selectedProduct.reviews})</span>`;
    if (priceLine) priceLine.innerHTML = `-${selectedProduct.discount} <span>&#8377;${selectedProduct.price}</span>`;
    if (mrp) mrp.innerHTML = `&#8377;${selectedProduct.mrp}`;
    if (pay) pay.innerHTML = `&#8377;${(Number(selectedProduct.price) * 0.95).toFixed(2)}`;
    if (paySave) paySave.textContent = `Save \u20B9${(Number(selectedProduct.price) * 0.05).toFixed(2)} with prepaid`;
    if (comboTitle) comboTitle.textContent = selectedProduct.title;

    const imagePath = `assets/img/${selectedKey}.png`;
    if (mainImage) mainImage.src = imagePath;
    if (firstThumb) firstThumb.dataset.image = imagePath;
    if (firstThumbImage) firstThumbImage.src = imagePath;
    if (topBadge) topBadge.textContent = "BESTSELLER";
    if (bottomBadge) bottomBadge.textContent = `${selectedProduct.discount} OFF`;
  }

  const offerText = document.querySelector(".offer-text");
  const offerArrows = document.querySelectorAll(".offer-arrow");

  if (offerText && offerArrows.length > 0) {
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
  }

  const qtyInput = document.querySelector(".pd-qty input");
  const minusBtn = document.querySelector(".pd-qty-minus");
  const plusBtn = document.querySelector(".pd-qty-plus");

  if (qtyInput && minusBtn && plusBtn) {
    minusBtn.addEventListener("click", () => {
      const current = Number(qtyInput.value) || 1;
      qtyInput.value = String(Math.max(1, current - 1));
    });

    plusBtn.addEventListener("click", () => {
      const current = Number(qtyInput.value) || 1;
      qtyInput.value = String(current + 1);
    });
  }

  const mainImage = document.querySelector(".pd-main-image");
  const thumbs = [...document.querySelectorAll(".pd-thumb")];
  if (mainImage && thumbs.length > 0) {
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const image = thumb.dataset.image;
        if (!image) {
          return;
        }
        mainImage.src = image;
        thumbs.forEach((item) => item.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  }

  const accordionItems = [...document.querySelectorAll(".pd-acc-item")];
  accordionItems.forEach((item) => {
    const trigger = item.querySelector(".pd-acc-trigger");
    const icon = item.querySelector(".pd-acc-icon");
    if (!trigger || !icon) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      icon.textContent = isOpen ? "-" : "+";
    });
  });
})();
