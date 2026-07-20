/* Theme3 - Mobile menu & slider dots */

document.addEventListener('DOMContentLoaded', function () {
  /* AOS - Animate on scroll */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      offset: 60
    });
  }
  var menuBtn = document.getElementById('mobile-menu-btn');
  var overlay = document.getElementById('mobile-nav');
  var panel = document.getElementById('mobile-nav-panel');
  var closeBtn = document.getElementById('mobile-nav-close');

  function openMenu() {
    overlay.classList.add('is-open');
    panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* Hero carousel */
  var heroTrack = document.getElementById('hero-track');
  var heroPrev = document.getElementById('hero-prev');
  var heroNext = document.getElementById('hero-next');
  var heroDots = document.getElementById('hero-dots');
  var heroSlides = document.querySelectorAll('.hero-slide');
  var heroDotBtns = document.querySelectorAll('.hero-dot');
  var heroIndex = 0;
  var heroTotal = heroSlides.length;

  function heroGoTo(index) {
    heroIndex = (index + heroTotal) % heroTotal;
    if (heroTrack) heroTrack.style.transform = 'translateX(-' + (heroIndex * 100) + '%)';
    heroDotBtns.forEach(function (d, i) {
      d.classList.toggle('active', i === heroIndex);
    });
  }

  if (heroPrev) heroPrev.addEventListener('click', function () { heroGoTo(heroIndex - 1); });
  if (heroNext) heroNext.addEventListener('click', function () { heroGoTo(heroIndex + 1); });
  heroDotBtns.forEach(function (dot, i) {
    dot.addEventListener('click', function () { heroGoTo(i); });
  });

  /* Deals countdown timer */
  var endDate = new Date();
  endDate.setDate(endDate.getDate() + 276);
  endDate.setHours(10, 44, 39, 0);

  function pad(n) { return n < 10 ? '0' + n : n; }

  function updateCountdown() {
    var now = new Date();
    var diff = endDate - now;

    if (diff <= 0) {
      document.querySelectorAll('.deals-countdown, .product-timer').forEach(function (el) {
        if (el) el.textContent = 'Deal ended';
      });
      var promoDays = document.getElementById('promo-days');
      if (promoDays) promoDays.textContent = '0';
      return;
    }

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    var short = days + ' : ' + pad(hours) + ' : ' + pad(mins) + ' : ' + pad(secs);
    var full = days + ' Days : ' + pad(hours) + ' Hours : ' + pad(mins) + ' Mins : ' + pad(secs) + ' Secs';

    var promoDays = document.getElementById('promo-days');
    var promoHours = document.getElementById('promo-hours');
    var promoMins = document.getElementById('promo-mins');
    var promoSecs = document.getElementById('promo-secs');
    if (promoDays) promoDays.textContent = days;
    if (promoHours) promoHours.textContent = pad(hours);
    if (promoMins) promoMins.textContent = pad(mins);
    if (promoSecs) promoSecs.textContent = pad(secs);
    var dodIds = [1, 3, 4, 5, 6];
    dodIds.forEach(function (i) {
      var d = document.getElementById('dod-days-' + i);
      var h = document.getElementById('dod-hours-' + i);
      var m = document.getElementById('dod-mins-' + i);
      var s = document.getElementById('dod-secs-' + i);
      if (d) d.textContent = days;
      if (h) h.textContent = pad(hours);
      if (m) m.textContent = pad(mins);
      if (s) s.textContent = pad(secs);
    });

    var badge = document.getElementById('deals-countdown');
    if (badge) badge.textContent = 'Ends in: ' + short;

    document.querySelectorAll('.product-timer').forEach(function (el) {
      if (el) el.textContent = full;
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* Filter buttons */
  var filters = document.querySelectorAll('.deals-filter');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (f) { f.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* Deals of the Day slider - desktop only (mobile uses native scroll/swipe) */
  var track = document.querySelector('.day-deals-track');
  var dodDots = document.querySelectorAll('.day-deals-dot');
  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (track && dodDots.length && !isMobile) {
    dodDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        dodDots.forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
        /* Each page = 2 cards (100% viewport); no peek of prev/next */
        track.style.transform = 'translateX(-' + (i * 100) + '%)';
      });
    });
  }

  /* Order page - Recently Viewed carousel */
  var orderRvTrack = document.getElementById('order-rv-track');
  var orderRvPrev = document.querySelector('.order-rv-prev');
  var orderRvNext = document.querySelector('.order-rv-next');
  if (orderRvTrack && (orderRvPrev || orderRvNext)) {
    function getOrderRvScrollAmount() {
      var card = orderRvTrack.querySelector('.order-rv-card');
      if (!card) return 244;
      var gap = window.innerWidth <= 639 ? 16 : 24;
      return card.offsetWidth + gap;
    }
    function scrollOrderRv(direction) {
      var amount = direction === 'next' ? getOrderRvScrollAmount() : -getOrderRvScrollAmount();
      orderRvTrack.scrollBy({ left: amount, behavior: 'smooth' });
    }
    if (orderRvPrev) orderRvPrev.addEventListener('click', function () { scrollOrderRv('prev'); });
    if (orderRvNext) orderRvNext.addEventListener('click', function () { scrollOrderRv('next'); });
    orderRvTrack.addEventListener('click', function (e) {
      var wishlist = e.target.closest('.order-rv-wishlist');
      if (wishlist) {
        e.preventDefault();
        wishlist.classList.toggle('active');
      }
    });
  }

  /* Footer / Order page scroll to top */
  var scrollTopBtns = document.querySelectorAll('.footer-scroll-top, .footer-modave-scroll-top, .order-scroll-top');
  scrollTopBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* Product page: gallery thumbnails */
  var thumbs = document.querySelectorAll('.product-gallery__thumb');
  var mainImg = document.getElementById('product-main-img');
  if (thumbs.length && mainImg) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        var img = thumb.querySelector('img');
        if (img && img.src) mainImg.src = img.src;
      });
    });
  }

  /* Product page: gallery prev/next */
  var prevBtn = document.querySelector('.product-gallery__nav--prev');
  var nextBtn = document.querySelector('.product-gallery__nav--next');
  if (thumbs && thumbs.length && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function () {
      var active = document.querySelector('.product-gallery__thumb.active');
      var idx = Array.prototype.indexOf.call(thumbs, active);
      var next = thumbs[(idx - 1 + thumbs.length) % thumbs.length];
      if (next) {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        next.classList.add('active');
        var img = next.querySelector('img');
        if (img && img.src && mainImg) mainImg.src = img.src;
      }
    });
    nextBtn.addEventListener('click', function () {
      var active = document.querySelector('.product-gallery__thumb.active');
      var idx = Array.prototype.indexOf.call(thumbs, active);
      var next = thumbs[(idx + 1) % thumbs.length];
      if (next) {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        next.classList.add('active');
        var img = next.querySelector('img');
        if (img && img.src && mainImg) mainImg.src = img.src;
      }
    });
  }

  /* Product page: quantity + / - */
  var qtyInput = document.querySelector('.product-info__qty-input');
  var qtyMinus = document.querySelectorAll('.product-info__qty-btn')[0];
  var qtyPlus = document.querySelectorAll('.product-info__qty-btn')[1];
  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
    qtyPlus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      if (v < 99) qtyInput.value = v + 1;
    });
  }

  /* Product page: description tabs */
  var descTabs = document.querySelectorAll('.product-desc-tab');
  var descContents = document.querySelectorAll('.product-desc-content');
  if (descTabs.length && descContents.length) {
    descTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        descTabs.forEach(function (t) { t.classList.remove('active'); });
        descContents.forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var content = document.getElementById('tab-' + target);
        if (content) content.classList.add('active');
      });
    });
  }

  /* Product page: color & size selection */
  document.querySelectorAll('.product-info__color').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.product-info__colors').querySelectorAll('.product-info__color').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  document.querySelectorAll('.product-info__size').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.product-info__sizes').querySelectorAll('.product-info__size').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
});
