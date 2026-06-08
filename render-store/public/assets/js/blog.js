/**
 * Blog Listing Page - Minimal JavaScript
 * Grid/List view toggle
 */
(function () {
  'use strict';

  const gridEl = document.getElementById('blog-grid');
  const viewBtns = document.querySelectorAll('.blog-view-btn');

  if (!gridEl || !viewBtns.length) return;

  viewBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const view = this.getAttribute('data-view');

      viewBtns.forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });

      gridEl.classList.toggle('blog-view-list', view === 'list');
    });
  });
})();
