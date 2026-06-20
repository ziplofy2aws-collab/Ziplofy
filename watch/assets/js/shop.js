(function () {
  var filters = document.querySelector('[data-watch-shop-filters]');
  var backdrop = document.querySelector('[data-watch-shop-backdrop]');
  var toggleBtn = document.querySelector('[data-watch-shop-filter-toggle]');
  var closeBtn = document.querySelector('[data-watch-shop-filters-close]');
  var clearBtn = document.querySelector('[data-watch-shop-clear]');

  if (!filters) return;

  function openFilters() {
    filters.classList.add('is-open');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('is-visible');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeFilters() {
    filters.classList.remove('is-open');
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.hidden = true;
    }
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openFilters);
  if (closeBtn) closeBtn.addEventListener('click', closeFilters);
  if (backdrop) backdrop.addEventListener('click', closeFilters);

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      filters.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.checked = false;
      });
    });
  }

  document.querySelectorAll('[data-watch-shop-wish]').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      btn.querySelector('i').classList.toggle('fa-regular');
      btn.querySelector('i').classList.toggle('fa-solid');
    });
  });
})();
