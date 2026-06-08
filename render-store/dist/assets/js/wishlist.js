/**
 * Wishlist page - checkboxes, bulk add, quantity, remove, empty state
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var tbody = document.getElementById('wishlist-tbody');
    var tableWrap = document.getElementById('wishlist-table-wrap');
    var emptyEl = document.getElementById('wishlist-empty');
    var bulkBar = document.getElementById('wishlist-bulk-bar');
    var selectedCountEl = document.getElementById('wishlist-selected-count');
    var checkAll = document.getElementById('wishlist-check-all');
    var bulkAddBtn = document.getElementById('wishlist-bulk-add');

    function getRows() {
      return tbody ? tbody.querySelectorAll('.wishlist-row') : [];
    }

    function getSelectedRows() {
      return tbody ? tbody.querySelectorAll('.wishlist-row .wishlist-check-item:checked') : [];
    }

    function updateBulkBar() {
      var selected = getSelectedRows();
      var n = selected.length;
      if (bulkBar) bulkBar.hidden = n === 0;
      if (selectedCountEl) selectedCountEl.textContent = n + ' item' + (n !== 1 ? 's' : '') + ' is selected';
    }

    function updateEmptyState() {
      var rows = getRows();
      var hasItems = rows.length > 0;
      if (tableWrap) tableWrap.hidden = !hasItems;
      if (emptyEl) emptyEl.hidden = hasItems;
    }

    function removeRow(row) {
      if (row && row.parentNode) {
        row.style.opacity = '0';
        row.style.transform = 'scale(0.98)';
        row.style.transition = 'opacity 0.2s, transform 0.2s';
        setTimeout(function () {
          row.remove();
          updateEmptyState();
          updateBulkBar();
          if (checkAll) checkAll.checked = false;
        }, 200);
      }
    }

    /* Select all */
    if (checkAll) {
      checkAll.addEventListener('change', function () {
        var items = tbody ? tbody.querySelectorAll('.wishlist-check-item') : [];
        items.forEach(function (cb) {
          cb.checked = checkAll.checked;
        });
        updateBulkBar();
      });
    }

    /* Individual checkboxes */
    if (tbody) {
      tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('wishlist-check-item')) {
          var items = tbody.querySelectorAll('.wishlist-check-item');
          var checked = tbody.querySelectorAll('.wishlist-check-item:checked');
          if (checkAll) checkAll.checked = items.length > 0 && checked.length === items.length;
          updateBulkBar();
        }
      });
    }

    /* Remove button */
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('.wishlist-remove');
        if (removeBtn) {
          e.preventDefault();
          var row = removeBtn.closest('.wishlist-row');
          removeRow(row);
        }
      });
    }

    /* Quantity + / - */
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest('.wishlist-qty-btn');
        if (!btn) return;
        var wrap = btn.closest('.wishlist-qty-wrap');
        var input = wrap ? wrap.querySelector('.wishlist-qty-input') : null;
        if (!input) return;
        var v = parseInt(input.value, 10) || 1;
        if (btn.getAttribute('data-action') === 'plus') {
          if (v < 99) input.value = v + 1;
        } else {
          if (v > 1) input.value = v - 1;
        }
      });
    }

    /* Bulk add to cart - uses Theme3Cart if available */
    if (bulkAddBtn) {
      bulkAddBtn.addEventListener('click', function () {
        var selected = getSelectedRows();
        var total = 0;
        selected.forEach(function (cb) {
          var row = cb.closest('.wishlist-row');
          var qtyInput = row ? row.querySelector('.wishlist-qty-input') : null;
          total += (qtyInput ? parseInt(qtyInput.value, 10) : 1) || 1;
        });
        if (total > 0 && window.Theme3Cart) {
          var cur = window.Theme3Cart.getCount();
          window.Theme3Cart.setCount(cur + total);
        }
        if (total > 0) {
          var toast = document.querySelector('.add-to-cart-toast') || document.createElement('div');
          toast.className = 'add-to-cart-toast';
          toast.textContent = total + ' item(s) added to cart!';
          if (!document.getElementById('add-to-cart-toast-styles')) {
            var s = document.createElement('style');
            s.id = 'add-to-cart-toast-styles';
            s.textContent = '.add-to-cart-toast{position:fixed;bottom:24px;right:24px;background:#0f766e;color:#fff;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:500;z-index:9999;animation:addToCartToastIn .3s ease}.add-to-cart-toast.hide{animation:addToCartToastOut .25s ease forwards}@keyframes addToCartToastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes addToCartToastOut{from{opacity:1}to{opacity:0}}';
            document.head.appendChild(s);
          }
          document.body.appendChild(toast);
          setTimeout(function () { toast.classList.add('hide'); setTimeout(function () { toast.remove(); }, 280); }, 2500);
        }
      });
    }

    updateEmptyState();
  });
})();
