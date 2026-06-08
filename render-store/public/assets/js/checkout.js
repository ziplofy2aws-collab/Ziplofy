/**
 * Checkout Page - Form validation, login, proceed to checkout
 */
(function () {
  'use strict';

  var form = document.getElementById('checkout-form');
  var loginBtn = document.getElementById('checkout-login-btn');
  var proceedBtn = document.getElementById('checkout-proceed-btn');
  var usernameInput = document.getElementById('checkout-username');
  var passwordInput = document.getElementById('checkout-password');

  function validateForm() {
    if (!form) return true;
    var valid = true;
    var required = form.querySelectorAll('[required]');
    required.forEach(function (el) {
      el.classList.remove('error');
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
      }
    });
    return valid;
  }

  function handleLogin(e) {
    e.preventDefault();
    var user = usernameInput ? usernameInput.value.trim() : '';
    var pass = passwordInput ? passwordInput.value.trim() : '';
    if (!user || !pass) {
      if (usernameInput) usernameInput.classList.add('error');
      if (passwordInput) passwordInput.classList.add('error');
      return;
    }
    if (usernameInput) usernameInput.classList.remove('error');
    if (passwordInput) passwordInput.classList.remove('error');
    console.log('Login attempted');
  }

  function handleProceedCheckout(e) {
    e.preventDefault();
    window.location.href = 'order-success.html';
  }

  function updateCartPlaceholder() {
    var list = document.getElementById('checkout-product-list');
    if (!list) return;
    var items = list.querySelectorAll('.checkout-product-item');
    var subtotal = 0;
    items.forEach(function (item) {
      var priceEl = item.querySelector('.checkout-price-new');
      if (priceEl) {
        var text = priceEl.textContent.replace(/[^0-9.]/g, '');
        subtotal += parseFloat(text) || 0;
      }
    });
    var vat = subtotal * 0.4;
    var total = subtotal + vat;
    var subtotalEl = document.getElementById('checkout-subtotal');
    var vatEl = document.getElementById('checkout-vat');
    var totalEl = document.getElementById('checkout-total');
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (vatEl) vatEl.textContent = '$' + vat.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  function handleCancel() {
    if (form) form.reset();
  }

  function handleSave() {
    if (!validateForm()) return;
    console.log('Shipping address saved');
  }

  function init() {
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (proceedBtn) proceedBtn.addEventListener('click', handleProceedCheckout);

    var cancelBtn = document.getElementById('checkout-cancel-btn');
    var saveBtn = document.getElementById('checkout-save-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    if (saveBtn) saveBtn.addEventListener('click', handleSave);

    document.querySelectorAll('.checkout-payment-option input[name="payment"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        document.querySelectorAll('.checkout-payment-option').forEach(function (opt) {
          opt.classList.remove('checkout-payment-option--selected');
        });
        if (radio.closest('.checkout-payment-option')) {
          radio.closest('.checkout-payment-option').classList.add('checkout-payment-option--selected');
        }
      });
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateForm()) handleProceedCheckout(e);
      });
    }

    if (form) {
      form.querySelectorAll('.checkout-input').forEach(function (input) {
        input.addEventListener('input', function () {
          input.classList.remove('error');
        });
      });
    }

    var createAccountLink = document.getElementById('checkout-create-account');
    if (createAccountLink) {
      createAccountLink.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Create account clicked');
      });
    }

    updateCartPlaceholder();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
