(function () {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || 'bodie';
  const product = typeof window.getProductById === 'function'
    ? window.getProductById(productId)
    : null;

  if (product) {
    hydrateProductPage(product);
  }

  bindGallery();
  bindSwatches();
  bindAccordion();
  bindReviewsFilter();
})();

function hydrateProductPage(product) {
  document.title = `${product.name} Eyeglasses | Premium Eyewear`;

  const titleEl = document.getElementById('pdpTitle');
  const breadcrumbEl = document.getElementById('pdpBreadcrumbName');
  const priceEl = document.getElementById('pdpPrice');
  const reviewCountEl = document.getElementById('pdpReviewCount');
  const colorLabelEl = document.getElementById('pdpColorLabel');
  const widthBtn = document.getElementById('pdpWidthBtn');
  const includedTitle = document.getElementById('pdpIncludedTitle');
  const mainImg = document.getElementById('pdpMainImg');
  const swatchesWrap = document.getElementById('pdpSwatches');
  const thumbsWrap = document.querySelector('.pdp-thumbs');
  const relatedGrid = document.getElementById('pdpRelatedGrid');

  if (titleEl) titleEl.textContent = product.name;
  if (breadcrumbEl) breadcrumbEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `Starting at $${product.price}`;
  if (reviewCountEl) reviewCountEl.textContent = `(${product.reviews})`;
  if (colorLabelEl) colorLabelEl.innerHTML = `<strong>Color</strong> ${product.colorLabel}`;
  if (widthBtn) widthBtn.textContent = product.width;
  if (includedTitle) includedTitle.textContent = `Everything included for $${product.price}`;

  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = `${product.name} eyeglasses`;
  }

  if (thumbsWrap) {
    const tryOnBtn = thumbsWrap.querySelector('.pdp-thumb-btn--tryon');
    thumbsWrap.querySelectorAll('.pdp-thumb-btn:not(.pdp-thumb-btn--tryon)').forEach(btn => btn.remove());

    product.gallery.forEach((src, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pdp-thumb-btn${index === 0 ? ' active' : ''}`;
      btn.setAttribute('data-img', src);
      btn.setAttribute('aria-label', index === 0 ? 'Product view' : `View ${index + 1}`);
      btn.innerHTML = `<img src="${src}" alt="${product.name} view ${index + 1}">`;
      if (tryOnBtn) thumbsWrap.insertBefore(btn, tryOnBtn);
      else thumbsWrap.appendChild(btn);
    });
  }

  if (swatchesWrap) {
    const activeIndex = Math.max(0, product.colors.findIndex(c => c.label === product.colorLabel));
    swatchesWrap.innerHTML = product.colors.map((color, index) => `
      <button type="button" class="pdp-swatch-btn${index === activeIndex ? ' active' : ''}"
        style="${color.style}" aria-label="${color.label}" data-color-label="${color.label}"></button>
    `).join('');
  }

  if (relatedGrid && typeof window.getRelatedProducts === 'function') {
    const related = window.getRelatedProducts(product.id, 4);
    relatedGrid.innerHTML = related.map(item => `
      <a href="product.html?id=${item.id}" class="pdp-related-card">
        <div class="pdp-related-img"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
        <p class="pdp-related-name">${item.name}</p>
        <p class="pdp-related-price">$${item.price}</p>
      </a>
    `).join('');
  }
}

function bindGallery() {
  const galleryMainImg = document.getElementById('pdpMainImg');
  const thumbsWrap = document.querySelector('.pdp-thumbs');
  if (!galleryMainImg || !thumbsWrap) return;

  thumbsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdp-thumb-btn:not(.pdp-thumb-btn--tryon)');
    if (!btn) return;
    const imgSrc = btn.getAttribute('data-img');
    if (!imgSrc) return;

    galleryMainImg.src = imgSrc;
    thumbsWrap.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
}

function bindSwatches() {
  const swatchesWrap = document.getElementById('pdpSwatches');
  const colorLabelEl = document.getElementById('pdpColorLabel');
  if (!swatchesWrap) return;

  swatchesWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdp-swatch-btn');
    if (!btn) return;

    swatchesWrap.querySelectorAll('.pdp-swatch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const label = btn.getAttribute('data-color-label') || btn.getAttribute('aria-label');
    if (colorLabelEl && label) {
      colorLabelEl.innerHTML = `<strong>Color</strong> ${label}`;
    }
  });
}

function bindAccordion() {
  const accordionItems = document.querySelectorAll('.pdp-accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.pdp-accordion-trigger');
    const panel = item.querySelector('.pdp-accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
      }
    });
  });
}

function bindReviewsFilter() {
  const snapshotRows = document.querySelectorAll('.reviews-snapshot-row');
  const reviewCards = document.querySelectorAll('.review-card');
  let activeStarFilter = null;

  snapshotRows.forEach(row => {
    row.addEventListener('click', () => {
      const stars = row.getAttribute('data-stars');

      if (activeStarFilter === stars) {
        activeStarFilter = null;
        snapshotRows.forEach(r => r.classList.remove('is-active'));
        reviewCards.forEach(card => card.classList.remove('is-hidden'));
        return;
      }

      activeStarFilter = stars;
      snapshotRows.forEach(r => r.classList.toggle('is-active', r === row));
      reviewCards.forEach(card => {
        const match = card.getAttribute('data-stars') === stars;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });
}
