/**
 * Cart Page - Vanilla JavaScript Interactions
 * Handles: quantity change, totals update, remove item, remove all, coupon apply
 */
(function () {
  'use strict';

  const CART_VAT_RATE = 0.4;
  const FREE_SHIPPING_THRESHOLD = 60;

  const tbody = document.getElementById('cart-tbody');
  const removeAllBtn = document.getElementById('cart-remove-all');
  const itemCountEl = document.getElementById('cart-item-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const vatEl = document.getElementById('cart-vat');
  const totalEl = document.getElementById('cart-total');
  const couponInput = document.getElementById('cart-coupon-input');
  const applyCouponBtn = document.getElementById('cart-apply-coupon');

  function getRowTotal(row) {
    const price = parseFloat(row.dataset.price || 0);
    const input = row.querySelector('.cart-qty-input');
    const qty = parseInt(input ? input.value : 1, 10) || 1;
    return price * qty;
  }

  function formatPrice(val) {
    return '$' + val.toFixed(2);
  }

  function updateRowTotal(row) {
    const total = getRowTotal(row);
    const el = row.querySelector('.cart-row-total');
    if (el) el.textContent = formatPrice(total);
  }

  function recalcCart() {
    const rows = tbody ? tbody.querySelectorAll('.cart-row') : [];
    let subtotal = 0;
    let totalQty = 0;
    rows.forEach(function (row) {
      subtotal += getRowTotal(row);
      var input = row.querySelector('.cart-qty-input');
      totalQty += parseInt(input ? input.value : 1, 10) || 1;
    });
    const vat = subtotal * CART_VAT_RATE;
    const total = subtotal + vat;

    if (itemCountEl) itemCountEl.textContent = '(' + rows.length + ' item' + (rows.length !== 1 ? 's' : '') + ')';
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (vatEl) vatEl.textContent = formatPrice(vat);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (typeof window.Theme3Cart !== 'undefined' && window.Theme3Cart.setCount) {
      window.Theme3Cart.setCount(totalQty);
    }
  }

  function handleQuantityChange(e) {
    const btn = e.target.closest('.cart-qty-btn');
    if (!btn) return;
    const wrap = btn.closest('.cart-qty-wrap');
    const input = wrap ? wrap.querySelector('.cart-qty-input') : null;
    const row = btn.closest('.cart-row');
    if (!input || !row) return;

    let qty = parseInt(input.value, 10) || 1;
    const min = parseInt(input.min, 10) || 1;
    const max = parseInt(input.max, 10) || 99;

    if (btn.dataset.action === 'plus' && qty < max) {
      qty += 1;
    } else if (btn.dataset.action === 'minus' && qty > min) {
      qty -= 1;
    }
    input.value = qty;
    updateRowTotal(row);
    recalcCart();
  }

  function handleDeleteItem(e) {
    const btn = e.target.closest('.cart-delete');
    if (!btn) return;
    const row = btn.closest('.cart-row');
    if (row && tbody) {
      row.remove();
      recalcCart();
    }
  }

  function handleRemoveAll() {
    if (!tbody) return;
    tbody.innerHTML = '';
    recalcCart();
  }

  function handleCouponApply() {
    const code = (couponInput ? couponInput.value.trim() : '') || '';
    if (!code) return;
    // Placeholder logic - could later validate against a backend
    applyCouponBtn.textContent = 'Applied';
    applyCouponBtn.disabled = true;
    couponInput.disabled = true;
    couponInput.value = '';
  }

  function init() {
    if (!tbody) return;

    tbody.addEventListener('click', function (e) {
      handleQuantityChange(e);
      handleDeleteItem(e);
    });

    if (removeAllBtn) removeAllBtn.addEventListener('click', handleRemoveAll);
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener('click', handleCouponApply);
    }

    recalcCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
