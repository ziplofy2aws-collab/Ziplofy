/**
 * Add to Cart - notification, header badge update, Buy Now redirect
 * Works on: index, category, product, cart
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme3_cart_count';

  function getCartCount() {
    try {
      var n = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      return isNaN(n) ? 0 : Math.max(0, n);
    } catch (e) {
      return 0;
    }
  }

  function setCartCount(n) {
    var val = Math.max(0, parseInt(n, 10) || 0);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch (e) {}
    return val;
  }

  function addToCart(qty) {
    qty = parseInt(qty, 10) || 1;
    var total = getCartCount() + qty;
    setCartCount(total);
    updateHeaderCart(total);
    return total;
  }

  function updateHeaderCart(count) {
    count = count == null ? getCartCount() : count;
    var badges = document.querySelectorAll('.header-cart-mobile .badge-count, .header-right .header-icon:last-of-type .badge-count');
    badges.forEach(function (el) {
      el.textContent = count;
    });
    var sub = document.querySelector('.header-right .header-icon:last-of-type .icon-text .sub');
    if (sub) sub.textContent = count + ' - Items';
  }

  function showToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'add-to-cart-toast';
    toast.textContent = msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    if (!document.getElementById('add-to-cart-toast-styles')) {
      var style = document.createElement('style');
      style.id = 'add-to-cart-toast-styles';
      style.textContent = '.add-to-cart-toast{position:fixed;bottom:24px;right:24px;background:#0f766e;color:#fff;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 10px 25px rgba(15,118,110,.3);z-index:9999;animation:addToCartToastIn .3s ease;}.add-to-cart-toast.hide{animation:addToCartToastOut .25s ease forwards;}@keyframes addToCartToastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes addToCartToastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-10px)}}';
      document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('hide');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 280);
    }, 2500);
  }

  function handleAddToCart(e, qty) {
    qty = qty || 1;
    var el = e.target.closest('.btn-add-cart');
    if (el && el.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(qty);
    showToast('Item added to cart!');
  }

  function handleDayDealCta(e) {
    if (e.target.closest('.day-deal-cta')) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(1);
      showToast('Item added to cart!');
    }
  }

  function handleBuyNow(e) {
    var btn = e.target.closest('.product-info__btn--buy');
    if (!btn) return;
    e.preventDefault();
    var qtyInput = document.querySelector('.product-info__qty-input');
    var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
    addToCart(qty);
    window.location.href = 'cart.html';
  }

  function init() {
    updateHeaderCart();

    document.addEventListener('click', function (e) {
      if (e.target.closest('.btn-add-cart')) {
        var btn = e.target.closest('.btn-add-cart');
        var row = btn ? btn.closest('.wishlist-row') : null;
        var qtyInput = row ? row.querySelector('.wishlist-qty-input') : null;
        var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
        handleAddToCart(e, qty);
      }
      if (e.target.closest('.day-deal-cta')) {
        handleDayDealCta(e);
      }
      if (e.target.closest('.product-info__btn--cart')) {
        var qtyInput = document.querySelector('.product-info__qty-input');
        var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
        addToCart(qty);
        showToast('Item added to cart!');
      }
      if (e.target.closest('.related-card-addcart')) {
        e.preventDefault();
        e.stopPropagation();
        addToCart(1);
        showToast('Item added to cart!');
      }
      if (e.target.closest('.product-info__btn--buy')) {
        // Skip legacy handler when inside React app (render-store); React handles Buy Now with checkout modal
        if (e.target.closest('#root')) return;
        handleBuyNow(e);
      }
    });
  }

  window.Theme3Cart = {
    getCount: getCartCount,
    setCount: function (n) {
      var val = Math.max(0, parseInt(n, 10) || 0);
      setCartCount(val);
      updateHeaderCart(val);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
