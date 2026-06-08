/**
 * Product Carousel - New Branded Products
 * Vanilla JS: horizontal slider, arrow nav, wishlist toggle
 */
(function () {
  'use strict';

  var track = document.getElementById('product-carousel-track');
  var prevBtn = document.querySelector('.product-carousel-prev');
  var nextBtn = document.querySelector('.product-carousel-next');

  function getScrollAmount() {
    if (!track) return 244;
    var card = track.querySelector('.product-carousel-card');
    if (!card) return 244;
    var cardWidth = card.offsetWidth;
    var gap = 24;
    if (window.innerWidth <= 639) gap = 16;
    return cardWidth + gap;
  }

  function scrollCarousel(direction) {
    if (!track) return;
    var amount = direction === 'next' ? getScrollAmount() : -getScrollAmount();
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleWishlist(e) {
    var btn = e.target.closest('.product-carousel-wishlist');
    if (!btn) return;
    e.preventDefault();
    btn.classList.toggle('active');
  }

  function init() {
    if (!track) return;

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollCarousel('prev'); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollCarousel('next'); });

    track.addEventListener('click', handleWishlist);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
