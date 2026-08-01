(function initProductPage() {
  const root = document.querySelector("[data-pdp]");
  if (!root) return;

  const catalog = window.VASTRA_PRODUCTS || {};
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "tn-5";
  const product = catalog[id] || catalog["tn-5"];
  if (!product) return;

  const mainImg = document.getElementById("pdp-main-img");
  const thumbWrap = document.getElementById("pdp-thumbs");
  const dotsWrap = root.querySelector("[data-pdp-dots]");
  const titleEl = document.getElementById("pdp-title");
  const categoryEl = document.getElementById("pdp-category");
  const priceEl = document.getElementById("pdp-price");
  const colorLabelEl = document.getElementById("pdp-color-name");
  const swatchWrap = document.getElementById("pdp-swatches");
  const sizeWrap = document.getElementById("pdp-sizes");
  const descEl = document.getElementById("pdp-desc");
  const specEl = document.getElementById("pdp-spec");
  const crumbEl = document.getElementById("pdp-crumb-current");
  const relatedWrap = document.getElementById("pdp-related-grid");
  const sleeveLabel = root.querySelector("[data-sleeve-label]");
  const prevBtn = root.querySelector("[data-pdp-prev]");
  const nextBtn = root.querySelector("[data-pdp-next]");
  const wishBtn = root.querySelector(".pdp-wish");
  const pincodeForm = root.querySelector(".pdp-pincode");
  const sleeves = root.querySelectorAll(".pdp-sleeve");

  let index = 0;
  let thumbs = [];
  let dots = [];

  function goTo(i) {
    if (!thumbs.length || !mainImg) return;
    index = (i + thumbs.length) % thumbs.length;
    const src = thumbs[index].dataset.src;
    if (src) mainImg.src = src;

    thumbs.forEach((t, n) => {
      const active = n === index;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });

    dots.forEach((d, n) => {
      d.classList.toggle("is-active", n === index % Math.max(dots.length, 1));
    });
  }

  function bindThumbs() {
    thumbs = Array.from(thumbWrap.querySelectorAll(".pdp-thumb"));
    dots = Array.from(dotsWrap?.querySelectorAll(".pdp-dot") || []);
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => goTo(i));
    });
  }

  // Fill product content
  if (titleEl) titleEl.textContent = product.title;
  if (categoryEl) categoryEl.textContent = product.category;
  if (priceEl) priceEl.textContent = product.price;
  if (colorLabelEl) colorLabelEl.textContent = product.color;
  if (descEl) descEl.textContent = product.desc;
  if (specEl) specEl.textContent = product.spec;
  if (crumbEl) crumbEl.textContent = product.title;
  document.title = `${product.title} — Vastra`;

  if (mainImg && product.images?.length) {
    mainImg.src = product.images[0];
    mainImg.alt = product.title;
  }

  if (thumbWrap && product.images?.length) {
    thumbWrap.innerHTML = product.images
      .map(
        (src, i) => `
      <button type="button" class="pdp-thumb${i === 0 ? " is-active" : ""}" data-src="${src}" aria-label="View ${i + 1}" aria-selected="${i === 0 ? "true" : "false"}">
        <img src="${src}" alt="">
      </button>`
      )
      .join("");
  }

  if (dotsWrap && product.images?.length) {
    const count = Math.min(4, product.images.length);
    dotsWrap.innerHTML = Array.from({ length: count }, (_, i) =>
      `<span class="pdp-dot${i === 0 ? " is-active" : ""}"></span>`
    ).join("");
  }

  if (swatchWrap && product.colors?.length) {
    swatchWrap.innerHTML = product.colors
      .map(
        (c, i) => `
      <button type="button" class="pdp-swatch${i === 0 ? " is-active" : ""}" data-src="${c.src}" data-color="${c.name}" aria-label="${c.name}">
        <img src="${c.src}" alt="">
      </button>`
      )
      .join("");

    swatchWrap.querySelectorAll(".pdp-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        swatchWrap.querySelectorAll(".pdp-swatch").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (colorLabelEl) colorLabelEl.textContent = btn.dataset.color || "";
        const src = btn.dataset.src;
        if (src && mainImg) {
          mainImg.src = src;
          const match = thumbs.findIndex((t) => t.dataset.src === src);
          if (match >= 0) goTo(match);
        }
      });
    });
  }

  if (sizeWrap && product.sizes?.length) {
    sizeWrap.innerHTML = product.sizes
      .map(
        (s, i) =>
          `<button type="button" class="pdp-size${i === 0 ? " is-active" : ""}">${s}</button>`
      )
      .join("");

    sizeWrap.querySelectorAll(".pdp-size").forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeWrap.querySelectorAll(".pdp-size").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  }

  // Related products (exclude current)
  if (relatedWrap) {
    const related = Object.entries(catalog)
      .filter(([key]) => key !== id)
      .slice(0, 4);

    relatedWrap.innerHTML = related
      .map(
        ([key, p]) => `
      <article class="shop-card">
        <a href="product.html?id=${key}" class="shop-card__media">
          <img src="${p.images[0]}" alt="${p.title}" width="400" height="500" loading="lazy" decoding="async">
        </a>
        <span class="shop-card__badge">New</span>
        <h3 class="shop-card__name"><a href="product.html?id=${key}">${p.title}</a></h3>
        <p class="shop-card__price">${p.price.replace(".00", "")}</p>
      </article>`
      )
      .join("");
  }

  bindThumbs();
  index = 0;

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));

  sleeves.forEach((btn) => {
    btn.addEventListener("click", () => {
      sleeves.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      if (sleeveLabel) sleeveLabel.textContent = btn.dataset.sleeve || "";
    });
  });

  wishBtn?.addEventListener("click", () => {
    wishBtn.classList.toggle("is-active");
    const icon = wishBtn.querySelector("i");
    if (!icon) return;
    icon.classList.toggle("fa-regular", !wishBtn.classList.contains("is-active"));
    icon.classList.toggle("fa-solid", wishBtn.classList.contains("is-active"));
  });

  pincodeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
  });
})();
