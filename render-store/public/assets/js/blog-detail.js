/**
 * Blog Detail Page - Scroll to top, comment form, related articles carousel
 */
(function () {
  'use strict';

  var scrollBtn = document.getElementById('blog-scroll-top');
  var commentForm = document.querySelector('.blog-add-comment-form');
  var relatedTrack = document.getElementById('related-track');
  var relatedPrev = document.querySelector('.blog-related-prev');
  var relatedNext = document.querySelector('.blog-related-next');

  function toggleVisibility() {
    if (scrollBtn && window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else if (scrollBtn) {
      scrollBtn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
  }

  function scrollRelated(direction) {
    if (!relatedTrack) return;
    var cardWidth = relatedTrack.querySelector('.blog-related-card')?.offsetWidth || 290;
    var gap = 30;
    var scrollAmount = (cardWidth + gap) * (direction === 'next' ? 1 : -1);
    relatedTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  if (scrollBtn) {
    scrollBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();
  }

  if (commentForm) {
    commentForm.addEventListener('submit', handleCommentSubmit);
  }

  if (relatedPrev) {
    relatedPrev.addEventListener('click', function () { scrollRelated('prev'); });
  }
  if (relatedNext) {
    relatedNext.addEventListener('click', function () { scrollRelated('next'); });
  }
})();
