(() => {
  const fallbackMap = {
    p1: { title: "10% Vitamin C Face Serum", subtitle: "Glowing, Brighter Skin in 5 Days*", price: "From ₹645", tag: "#1 in skincare", image: "./assets/img/TN-1.png", alt: "10% Vitamin C Face Serum" },
    p2: { title: "10% Niacinamide Face Serum", subtitle: "Fades Acne Marks & Spots", price: "₹649", tag: "#2 in skincare", image: "./assets/img/TN-2.png", alt: "10% Niacinamide Face Serum" },
    p3: { title: "25% AHA 2% BHA 5% PHA Peeling Solution", subtitle: "10-Min Tan Removal", price: "From ₹645", tag: "#3 in skincare", image: "./assets/img/TN-3.png", alt: "AHA BHA PHA Peeling Solution" },
    p4: { title: "Brightening Serum", subtitle: "Reduces Pigmentation", price: "₹695", tag: "#5 in skincare", image: "./assets/img/TN-4.png", alt: "Brightening Serum" },
    p5: { title: "24K Gold Serum", subtitle: "Glow & Firmness", price: "₹599", tag: "#6 in skincare", image: "./assets/img/BS-1.png", alt: "24K Gold Serum" },
    p6: { title: "Hydrating Serum", subtitle: "Smooth & Soft Skin", price: "₹549", tag: "#7 in skincare", image: "./assets/img/BS-2.png", alt: "Hydrating Serum" },
    p7: { title: "Vitamin C Body Serum", subtitle: "Even Tone & Glow", price: "₹745", tag: "#8 in skincare", image: "./assets/img/BS-3.png", alt: "Vitamin C Body Serum" },
    p8: { title: "Azelic Acid Face Serum", subtitle: "Fades Spots", price: "₹695", tag: "#9 in skincare", image: "./assets/img/BS-4.png", alt: "Azelic Acid Face Serum" },
    p9: { title: "Vitamin C Sunscreen", subtitle: "SPF 50 PA++++", price: "₹595", tag: "#10 in skincare", image: "./assets/img/TN-1.png", alt: "Vitamin C Sunscreen" },
    p10: { title: "Niacinamide Face Wash", subtitle: "Gentle Daily Cleanser", price: "₹399", tag: "#11 in skincare", image: "./assets/img/TN-2.png", alt: "Niacinamide Face Wash" },
    p11: { title: "Hydra Gel Moisturizer", subtitle: "Oil-Free Lightweight Gel", price: "₹495", tag: "#12 in skincare", image: "./assets/img/TN-3.png", alt: "Hydra Gel Moisturizer" },
    p12: { title: "Overnight Repair Serum", subtitle: "Repairs & Brightens Skin", price: "₹799", tag: "#13 in skincare", image: "./assets/img/TN-4.png", alt: "Overnight Repair Serum" },
    p13: { title: "Anti-Acne Skincare Routine Kit For Oily Skin | Dermat Recommended Bestseller", subtitle: "Fights Acne & Oil Control", price: "₹1,187", tag: "4.0 (157 Reviews)", image: "./assets/img/RGK-1.png", alt: "Anti-Acne Skincare Routine Kit For Oily Skin" },
    p14: { title: "Summer Essential Skincare Routine Kit | Top Seller | Men & Women", subtitle: "Brightens, Protects & Fights Acne", price: "₹1,758", tag: "4.2 (156 Reviews)", image: "./assets/img/RGK-2.png", alt: "Summer Essential Skincare Routine Kit" },
    p15: { title: "Skin Brightening Routine Kit For Dull Skin | Top Best Selling Bright Skincare Routine For Men & Women", subtitle: "Brightens Skin, Fades Dark Spots", price: "₹1,292", tag: "4.7 (236 Reviews)", image: "./assets/img/RGK-3.png", alt: "Skin Brightening Routine Kit For Dull Skin" },
    p16: { title: "Anti-Pigmentation Skincare Routine Kit | Fades Dark Spots | Dermatologist Recommended | Bestseller", subtitle: "Reduce Pigmentation & Dark Spots", price: "₹1,327", tag: "4.7 (384 Reviews)", image: "./assets/img/RGK-4.png", alt: "Anti-Pigmentation Skincare Routine Kit" }
  };

  const params = new URLSearchParams(window.location.search);
  const pid = params.get("pid");

  let selected = null;
  try {
    const raw = sessionStorage.getItem("selectedProductCard");
    if (raw) selected = JSON.parse(raw);
  } catch (_err) {
    selected = null;
  }

  if (!selected || (!selected.title && !selected.image)) {
    selected = (pid && fallbackMap[pid]) || fallbackMap.p1;
  }

  const applyText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };

  applyText("pd-tag", selected.tag || "#1 in skincare");
  applyText("pd-title", selected.title || "Product");
  applyText("pd-subtitle", selected.subtitle || "");
  applyText("pd-price", selected.price || "₹0");

  const img = document.getElementById("pd-image");
  if (img) {
    img.src = selected.image || img.src;
    img.alt = selected.alt || selected.title || "Product image";
  }

  const stickyTitle = document.getElementById("pd-sticky-title");
  const stickyPrice = document.getElementById("pd-sticky-price");
  if (stickyTitle && selected.title) stickyTitle.textContent = selected.title;
  if (stickyPrice && selected.price) stickyPrice.textContent = selected.price;

  const thumbs = Array.from(document.querySelectorAll(".pd-thumb"));
  thumbs.forEach((thumb, index) => {
    if (index === 0 && img && selected.image) {
      thumb.dataset.pdThumb = selected.image;
      const tImg = thumb.querySelector("img");
      if (tImg) tImg.src = selected.image;
    }
    thumb.addEventListener("click", () => {
      const nextSrc = thumb.dataset.pdThumb;
      if (img && nextSrc) img.src = nextSrc;
      thumbs.forEach((t) => t.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });
  });
})();
