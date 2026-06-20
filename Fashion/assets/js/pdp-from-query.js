(function applyPdpFromQuery() {
  const catalog = window.PRODUCT_CATALOG;
  if (!catalog) return;

  let id = new URLSearchParams(window.location.search).get("id");
  if (!id || !catalog[id]) id = "pd-green-nuvo";

  const p = catalog[id];
  if (!p) return;

  const stickyTruncate = (s, max) => {
    const t = String(s).toUpperCase();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 3)}...`;
  };

  document.title = `${p.title} | Louis Philippe`;

  const titleEl = document.querySelector(".pdp-title");
  if (titleEl) titleEl.textContent = p.title;

  const bcLinks = document.querySelectorAll(".pdp-breadcrumb a");
  if (bcLinks[1]) bcLinks[1].textContent = p.breadGender || "Men";
  if (bcLinks[2]) bcLinks[2].textContent = p.breadMid || "Shirts";
  if (bcLinks[3]) bcLinks[3].textContent = p.breadLeaf || "Formal Shirts";

  const mrpLine = document.querySelector(".pdp-mrp-line");
  const strike = mrpLine?.querySelector(".strike");
  const saleEl = document.querySelector(".pdp-price-sale");
  const offEl = document.querySelector(".pdp-off");

  const hasMrp = Boolean(p.mrp && String(p.mrp).trim());
  const hasOff = Boolean(p.off && String(p.off).trim());

  if (mrpLine) mrpLine.hidden = !hasMrp;
  if (strike && hasMrp) strike.textContent = `₹ ${p.mrp}`;
  if (saleEl) saleEl.textContent = `₹ ${p.sale}`;
  if (offEl) {
    offEl.textContent = p.off || "";
    offEl.hidden = !hasOff;
  }

  const colorHeading = document.querySelector(".pdp-color-heading");
  if (colorHeading) colorHeading.textContent = `COLOR: ${p.colorLabel}`;

  const colorThumb = document.querySelector(".pdp-color-thumb img");
  if (colorThumb) {
    colorThumb.src = p.thumb || p.images[0];
    colorThumb.alt = p.title;
  }

  const galleryImgs = document.querySelectorAll(".pdp-gallery-cell img");
  galleryImgs.forEach((img, i) => {
    const src = p.images[i] || p.images[0];
    if (src) {
      img.src = src;
      img.alt = p.title;
    }
  });

  const descP = document.querySelector(".pdp-desc-block p");
  if (descP && p.desc) descP.textContent = p.desc;

  const stickyName = document.querySelector(".pdp-sticky-name");
  if (stickyName) stickyName.textContent = stickyTruncate(p.title, 32);

  const stickyPrice = document.querySelector(".pdp-sticky-price");
  if (stickyPrice) stickyPrice.textContent = `₹ ${p.sale}`;

  const stickyThumb = document.querySelector(".pdp-sticky-thumb");
  if (stickyThumb) {
    stickyThumb.src = p.thumb || p.images[0];
    stickyThumb.alt = p.title;
  }
})();
