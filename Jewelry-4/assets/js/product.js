/* Product detail page — loads clicked product from ?id= */
(function initProductPage() {
  const mainImg = document.getElementById("pdp-main-img");
  const thumbWrap = document.getElementById("pdp-thumbs");
  const catalog = window.AUREVIA_PRODUCTS || {};

  function bindThumbs(root) {
    const thumbs = root.querySelectorAll(".pdp-thumb");
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.getAttribute("data-src");
        if (!src || !mainImg) return;
        mainImg.src = src;
        thumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  }

  if (thumbWrap) bindThumbs(thumbWrap);

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "bs-4";
  const product = catalog[id] || catalog["bs-4"];

  if (!product) return;

  const titleMain = document.getElementById("pdp-title-main");
  const titleCode = document.getElementById("pdp-title-code");
  const skuEl = document.getElementById("pdp-sku");
  const priceEl = document.getElementById("pdp-price");
  const descEl = document.getElementById("pdp-desc");

  if (titleMain) titleMain.textContent = product.title;
  if (titleCode) titleCode.textContent = product.code;
  if (skuEl) skuEl.textContent = `SKU: ${product.code}`;
  if (priceEl) priceEl.textContent = product.price;
  if (descEl) descEl.textContent = product.desc;
  document.title = `${product.title} ${product.code} — Aurevia Jewels`;

  if (mainImg && product.images?.length && thumbWrap) {
    mainImg.src = product.images[0];
    mainImg.alt = `${product.title} ${product.code}`;
    thumbWrap.innerHTML = product.images
      .map(
        (src, i) => `
      <button type="button" class="pdp-thumb${i === 0 ? " is-active" : ""}" data-src="${src}" aria-label="View ${i + 1}">
        <img src="${src}" alt="">
      </button>`
      )
      .join("");
    bindThumbs(thumbWrap);
  }

  // Highlight related cards that match current product context
  document.querySelectorAll(".pdp-related-grid .shop-card").forEach((card) => {
    const href = card.getAttribute("href") || "";
    if (href.includes(`id=${id}`)) {
      card.style.outline = "1px solid #111";
    }
  });
})();

/* Related products — mobile one-card swipe */
(function initRelatedCarousel() {
  const track = document.querySelector(".pdp-related-grid");
  const dotsWrap = document.getElementById("pdp-related-dots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".shop-card"));
  if (!cards.length) return;

  dotsWrap.innerHTML = cards
    .map((_, i) => `<button type="button" class="pdp-related-dot${i === 0 ? " is-active" : ""}" aria-label="Related product ${i + 1}"></button>`)
    .join("");

  const dots = Array.from(dotsWrap.querySelectorAll(".pdp-related-dot"));

  function activeIndex() {
    const width = track.clientWidth || 1;
    return Math.round(track.scrollLeft / width);
  }

  function updateDots() {
    const i = Math.min(cards.length - 1, Math.max(0, activeIndex()));
    dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === i));
  }

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateDots);
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    });
  });

  window.addEventListener("resize", updateDots);
  updateDots();
})();
