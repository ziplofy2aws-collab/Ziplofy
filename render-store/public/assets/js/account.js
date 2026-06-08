/**
 * Account Page - Panel switching (Dashboard/Orders), Order filter tabs
 */
(function () {
  'use strict';

  var navItems = document.querySelectorAll('.account-nav-item[data-panel]');
  var panels = document.querySelectorAll('.account-panel');
  var orderTabs = document.querySelectorAll('.account-order-tab');
  var orderCards = document.querySelectorAll('.account-order-card[data-order-status]');
  var recentOrdersLink = document.querySelector('.account-content-link[data-panel="orders"]');

  function showPanel(panelId) {
    panels.forEach(function (p) {
      if (p.id === 'panel-' + panelId) {
        p.hidden = false;
      } else {
        p.hidden = true;
      }
    });
    navItems.forEach(function (nav) {
      nav.classList.toggle('active', nav.getAttribute('data-panel') === panelId);
    });
  }

  function filterOrders(status) {
    orderCards.forEach(function (card) {
      var cardStatus = card.getAttribute('data-order-status');
      var match = status === 'all' || cardStatus === status;
      card.classList.toggle('hidden-by-filter', !match);
    });
    orderTabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-filter') === status);
    });
  }

  if (navItems.length) {
    navItems.forEach(function (nav) {
      nav.addEventListener('click', function () {
        var panelId = nav.getAttribute('data-panel');
        if (panelId) {
          showPanel(panelId);
          if (panelId === 'address') showAddressList();
        }
      });
    });
  }

  if (recentOrdersLink) {
    recentOrdersLink.addEventListener('click', function (e) {
      e.preventDefault();
      showPanel('orders');
    });
  }

  document.querySelectorAll('.account-content-link[data-panel]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var panelId = link.getAttribute('data-panel');
      if (panelId) showPanel(panelId);
    });
  });

  /* Account wishlist: quantity, checkbox, remove, add to cart */
  var wlRows = document.querySelectorAll('.account-wishlist-row');
  var wlCheckAll = document.getElementById('account-wl-check-all');
  var wlCheckItems = document.querySelectorAll('.account-wl-check-item');
  var wlSelectedSpan = document.getElementById('account-wishlist-selected');

  function updateWishlistSelectedCount() {
    var count = document.querySelectorAll('.account-wl-check-item:checked').length;
    if (wlSelectedSpan) {
      wlSelectedSpan.textContent = count + ' item' + (count !== 1 ? 's' : '') + ' is selected';
    }
    if (wlCheckAll) wlCheckAll.checked = count > 0 && count === wlCheckItems.length;
  }

  wlRows.forEach(function (row) {
    var qtyInput = row.querySelector('.account-wl-qty-input');
    var minusBtn = row.querySelector('.account-wl-qty-btn[data-action="minus"]');
    var plusBtn = row.querySelector('.account-wl-qty-btn[data-action="plus"]');
    var removeBtn = row.querySelector('.account-wl-remove');

    if (minusBtn && qtyInput) {
      minusBtn.addEventListener('click', function () {
        var v = parseInt(qtyInput.value, 10) || 1;
        if (v > 1) qtyInput.value = v - 1;
      });
    }
    if (plusBtn && qtyInput) {
      plusBtn.addEventListener('click', function () {
        var v = parseInt(qtyInput.value, 10) || 1;
        if (v < 99) qtyInput.value = v + 1;
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        row.remove();
        updateWishlistSelectedCount();
      });
    }
    var checkItem = row.querySelector('.account-wl-check-item');
    if (checkItem) {
      checkItem.addEventListener('change', updateWishlistSelectedCount);
    }
  });

  if (wlCheckAll) {
    wlCheckAll.addEventListener('change', function () {
      wlCheckItems.forEach(function (cb) {
        cb.checked = wlCheckAll.checked;
      });
      updateWishlistSelectedCount();
    });
  }

  var wlAddCartBtn = document.getElementById('account-wishlist-add-cart');
  if (wlAddCartBtn) {
    wlAddCartBtn.addEventListener('click', function () {
      var checked = document.querySelectorAll('.account-wl-check-item:checked');
      if (checked.length) window.location.href = 'cart.html';
    });
  }
  updateWishlistSelectedCount();

  if (orderTabs.length && orderCards.length) {
    orderTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.getAttribute('data-filter');
        filterOrders(filter);
      });
    });
    filterOrders('all');
  }

  /* Address form: Add New Address / Edit Address */
  var addressListView = document.getElementById('address-list-view');
  var addressFormView = document.getElementById('address-form-view');
  var addressAddBtn = document.getElementById('address-add-btn');
  var addressFormBack = document.getElementById('address-form-back');
  var addressFormCancel = document.getElementById('address-form-cancel');
  var addressForm = document.getElementById('address-form');
  var addressFormTitle = document.getElementById('address-form-title');
  var addressChangeBtns = document.querySelectorAll('.account-address-change-btn[data-address-type]');
  var addressCards = document.querySelectorAll('.account-address-card[data-address-type]');

  function showAddressForm(mode, cardEl) {
    if (!addressFormView || !addressListView) return;
    addressListView.hidden = true;
    addressFormView.hidden = false;
    if (addressFormTitle) {
      addressFormTitle.textContent = mode === 'edit' ? 'Edit Address' : 'Add New Address';
    }
    if (addressForm) {
      addressForm.reset();
      if (mode === 'edit' && cardEl) {
        var body = cardEl.querySelector('.account-address-body');
        var type = cardEl.getAttribute('data-address-type');
        if (body) {
          var ps = body.querySelectorAll('p');
          if (ps.length >= 4) {
            var street = ps[0] ? ps[0].textContent.trim() : '';
            var city = ps[1] ? ps[1].textContent.trim() : '';
            var stateZip = ps[2] ? ps[2].textContent.trim() : '';
            var country = ps[3] ? ps[3].textContent.trim() : '';
            var parts = stateZip.split(/\s+/);
            var state = parts.length > 1 ? parts.slice(0, -1).join(' ') : stateZip;
            var zip = parts.length > 1 ? parts[parts.length - 1] : '';
            var countrySelect = addressForm.querySelector('#address-country');
            var cityInput = addressForm.querySelector('#address-city');
            var stateInput = addressForm.querySelector('#address-state');
            var zipInput = addressForm.querySelector('#address-zip');
            var lineInput = addressForm.querySelector('#address-line');
            var typeRadios = addressForm.querySelectorAll('input[name="addressType"]');
            if (lineInput) lineInput.value = street;
            if (cityInput) cityInput.value = city;
            if (stateInput) stateInput.value = state;
            if (zipInput) zipInput.value = zip;
            if (countrySelect) {
              var opts = countrySelect.querySelectorAll('option');
              for (var i = 0; i < opts.length; i++) {
                if (opts[i].textContent.trim() === country) {
                  opts[i].selected = true;
                  break;
                }
              }
            }
            typeRadios.forEach(function (r) {
              r.checked = r.value === type;
            });
          }
        }
      } else {
        var homeRadio = addressForm.querySelector('input[name="addressType"][value="home"]');
        if (homeRadio) homeRadio.checked = true;
      }
    }
  }

  function showAddressList() {
    if (!addressFormView || !addressListView) return;
    addressFormView.hidden = true;
    addressListView.hidden = false;
  }

  if (addressAddBtn) {
    addressAddBtn.addEventListener('click', function () {
      showAddressForm('add');
    });
  }

  addressChangeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var type = btn.getAttribute('data-address-type');
      var card = document.querySelector('.account-address-card[data-address-type="' + type + '"]');
      showAddressForm('edit', card);
    });
  });

  if (addressFormBack) {
    addressFormBack.addEventListener('click', showAddressList);
  }

  if (addressFormCancel) {
    addressFormCancel.addEventListener('click', showAddressList);
  }

  if (addressForm) {
    addressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showAddressList();
    });
  }

  var accountPasswordForm = document.getElementById('account-password-form');
  if (accountPasswordForm) {
    accountPasswordForm.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  }

  /* Logout modal */
  var logoutBtn = document.getElementById('account-logout-btn');
  var logoutModal = document.getElementById('logout-modal');
  var logoutModalCancel = document.getElementById('logout-modal-cancel');
  var logoutModalConfirm = document.getElementById('logout-modal-confirm');

  function openLogoutModal() {
    if (logoutModal) {
      logoutModal.classList.add('is-open');
      logoutModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeLogoutModal() {
    if (logoutModal) {
      logoutModal.classList.remove('is-open');
      logoutModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openLogoutModal();
    });
  }

  if (logoutModalCancel) {
    logoutModalCancel.addEventListener('click', closeLogoutModal);
  }

  if (logoutModalConfirm) {
    logoutModalConfirm.addEventListener('click', function () {
      closeLogoutModal();
      window.location.href = 'index.html';
    });
  }

  if (logoutModal) {
    logoutModal.addEventListener('click', function (e) {
      if (e.target === logoutModal) closeLogoutModal();
    });
  }
})();
