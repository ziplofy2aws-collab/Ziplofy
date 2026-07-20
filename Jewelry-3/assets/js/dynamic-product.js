document.addEventListener('DOMContentLoaded', () => {
  // 1. Intercept card clicks globally to pass productId
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (card) {
      const img = card.querySelector('img');
      if (img) {
        const src = img.getAttribute('src') || '';
        const match = src.match(/BS-(\d+)/);
        if (match) {
          const id = "BS-" + match[1];
          const isButton = e.target.tagName === 'BUTTON' || e.target.closest('.product-btn');
          const isLink = e.target.tagName === 'A' || e.target.closest('a');

          if (isLink || isButton) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `product.html?productId=${id}`;
          }
        }
      }
    }
  });

  // 2. If we are on the product page, dynamically load the selected product data
  const isProductPage = window.location.pathname.includes('product.html');
  if (isProductPage && typeof productsData !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId') || 'BS-8'; // fallback to BS-8
    const product = productsData[productId];

    if (product) {
      // A. Update Product Titles
      const titleEls = document.querySelectorAll('.product-detail-title');
      titleEls.forEach(el => el.textContent = product.name);

      // B. Update Breadcrumbs (last span element)
      const breadcrumbLast = document.querySelector('.product-detail-breadcrumbs span:last-child');
      if (breadcrumbLast) breadcrumbLast.textContent = product.name;

      // C. Update Prices
      const priceEl = document.querySelector('.product-detail-price');
      if (priceEl) priceEl.textContent = product.price;

      const originalPriceEl = document.querySelector('.product-detail-original-price span');
      if (originalPriceEl) originalPriceEl.textContent = product.originalPrice;

      // Capsule Price in Action Bar
      const capsulePriceEl = document.querySelector('.capsule-price');
      if (capsulePriceEl) capsulePriceEl.textContent = product.price;

      // D. Update Images
      const mainImg = document.getElementById('gallery-main-img');
      if (mainImg && product.images && product.images.length > 0) {
        mainImg.src = product.images[0];
      }

      // Update Thumbnails
      const thumbnailBtns = document.querySelectorAll('.thumbnail-btn');
      thumbnailBtns.forEach((btn, index) => {
        if (product.images && product.images[index]) {
          btn.setAttribute('data-img', product.images[index]);
          btn.style.display = 'block';
          const img = btn.querySelector('img');
          if (img) img.src = product.images[index];
        } else {
          btn.style.display = 'none'; // hide if no image
        }
      });

      // E. Update Price Breakup Panel Rows
      // Row 1: Gold
      const goldRowVal = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(1) .price-item-val');
      if (goldRowVal) goldRowVal.textContent = product.goldPrice;

      // Row 2: Diamond
      const diamondStrikethrough = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(2) .original-strikethrough');
      const diamondDiscounted = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(2) .final-discounted');
      if (diamondStrikethrough) diamondStrikethrough.textContent = product.diamondOriginalPrice;
      if (diamondDiscounted) diamondDiscounted.textContent = product.diamondPrice;

      // Row 3: Making Charges
      const makingStrikethrough = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(3) .original-strikethrough');
      const makingDiscounted = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(3) .final-discounted');
      if (makingStrikethrough) makingStrikethrough.textContent = product.makingChargesOriginalPrice;
      if (makingDiscounted) makingDiscounted.textContent = product.makingCharges;

      // Row 4: GST
      const gstRowVal = document.querySelector('#tab-price-breakup .price-breakup-row:nth-child(4) .price-item-val');
      if (gstRowVal) gstRowVal.textContent = product.gst;

      // Row 5: Total
      const totalRowVal = document.querySelector('#tab-price-breakup .price-breakup-row.total-row .price-item-val');
      if (totalRowVal) totalRowVal.textContent = product.totalPrice;

      // F. Update Specifications (Product Details Tab)
      const productDetailsTab = document.getElementById('tab-product-details');
      if (productDetailsTab && product.details) {
        let specsHtml = '<div class="specs-grid-layout">';
        for (const [key, value] of Object.entries(product.details)) {
          specsHtml += `
            <div class="spec-grid-item">
              <span class="spec-grid-label">${key}</span>
              <span class="spec-grid-value">${value}</span>
            </div>`;
        }
        specsHtml += '</div>';
        productDetailsTab.innerHTML = specsHtml;
      }

      // G. Update Gold Details Tab
      const goldDetailsTab = document.getElementById('tab-gold-details');
      if (goldDetailsTab && product.goldDetails) {
        let goldHtml = '<div class="specs-grid-layout">';
        for (const [key, value] of Object.entries(product.goldDetails)) {
          goldHtml += `
            <div class="spec-grid-item">
              <span class="spec-grid-label">${key}</span>
              <span class="spec-grid-value">${value}</span>
            </div>`;
        }
        goldHtml += '</div>';
        goldDetailsTab.innerHTML = goldHtml;
      }

      // H. Update Diamond Details Tab
      const diamondDetailsTab = document.getElementById('tab-diamond-details');
      if (diamondDetailsTab && product.diamondDetails) {
        let diamondHtml = '<div class="specs-grid-layout">';
        for (const [key, value] of Object.entries(product.diamondDetails)) {
          diamondHtml += `
            <div class="spec-grid-item">
              <span class="spec-grid-label">${key}</span>
              <span class="spec-grid-value">${value}</span>
            </div>`;
        }
        diamondHtml += '</div>';
        diamondDetailsTab.innerHTML = diamondHtml;
      }

      // I. Update Right Column Sidebar Preview Image
      const previewImg = document.querySelector('.preview-product-img');
      if (previewImg && product.images && product.images.length > 0) {
        previewImg.src = product.images[0];
      }
      const previewCaption = document.querySelector('.preview-product-caption');
      if (previewCaption) {
        previewCaption.textContent = `Buy ${product.name} at PC Jeweller with BIS Hallmark Certified, 7 Day Return & Lifetime Exchange Policy.`;
      }
    }
  }
});
