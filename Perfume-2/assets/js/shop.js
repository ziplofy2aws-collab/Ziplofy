(function () {
  var filterGroups = Array.prototype.slice.call(document.querySelectorAll('.pf2-shop__filter'));
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-pf2-filter-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pf2-shop__card'));
  var countEl = document.getElementById('pf2-shop-count');
  var sortSelect = document.getElementById('pf2-shop-sort');
  var gridEl = document.getElementById('pf2-shop-grid');
  var mobileFilterBtn = document.querySelector('[data-pf2-filter-open]');
  var filtersAside = document.querySelector('.pf2-shop__filters');
  var filterBackdrop = document.querySelector('.pf2-shop__filter-backdrop');
  var filterCloseButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pf2-filter-close]'));
  var mobileBreakpoint = 900;

  function isMobileFilters() {
    return window.innerWidth <= mobileBreakpoint;
  }

  function openMobileFilters() {
    if (!filtersAside || !filterBackdrop) {
      return;
    }

    filtersAside.classList.add('is-open');
    filterBackdrop.classList.add('is-open');
    filterBackdrop.hidden = false;
    filterBackdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pf2-shop-filter-open');

    if (mobileFilterBtn) {
      mobileFilterBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileFilters() {
    if (!filtersAside || !filterBackdrop) {
      return;
    }

    filtersAside.classList.remove('is-open');
    filterBackdrop.classList.remove('is-open');
    filterBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pf2-shop-filter-open');

    window.setTimeout(function () {
      if (!filterBackdrop.classList.contains('is-open')) {
        filterBackdrop.hidden = true;
      }
    }, 400);

    if (mobileFilterBtn) {
      mobileFilterBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleMobileFilters() {
    if (filtersAside && filtersAside.classList.contains('is-open')) {
      closeMobileFilters();
    } else {
      openMobileFilters();
    }
  }

  if (cards.length === 0) {
    return;
  }

  filterGroups.forEach(function (group) {
    var toggle = group.querySelector('.pf2-shop__filter-toggle');
    var panel = group.querySelector('.pf2-shop__filter-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = group.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  if (mobileFilterBtn && filtersAside) {
    mobileFilterBtn.setAttribute('aria-expanded', 'false');
    mobileFilterBtn.setAttribute('aria-controls', 'pf2-shop-filters');

    mobileFilterBtn.addEventListener('click', function () {
      if (isMobileFilters()) {
        toggleMobileFilters();
      } else {
        filtersAside.classList.toggle('is-open');
      }
    });
  }

  filterCloseButtons.forEach(function (button) {
    button.addEventListener('click', closeMobileFilters);
  });

  window.addEventListener('resize', function () {
    if (!isMobileFilters()) {
      closeMobileFilters();
    }
  });

  function getActiveFilters() {
    var active = {};

    filterInputs.forEach(function (input) {
      if (!input.checked) {
        return;
      }

      var key = input.getAttribute('data-pf2-filter-input');
      if (!key) {
        return;
      }

      if (!active[key]) {
        active[key] = [];
      }

      active[key].push(input.value);
    });

    return active;
  }

  function cardMatchesFilters(card, active) {
    var keys = Object.keys(active);

    if (keys.length === 0) {
      return true;
    }

    return keys.every(function (key) {
      var values = active[key];
      var cardValue = card.getAttribute('data-' + key) || '';
      return values.some(function (value) {
        return value === cardValue;
      });
    });
  }

  function sortCards(visibleCards) {
    if (!sortSelect) {
      return visibleCards;
    }

    var mode = sortSelect.value;
    var sorted = visibleCards.slice();

    sorted.sort(function (a, b) {
      var nameA = (a.querySelector('.pf2-shop__name') || {}).textContent || '';
      var nameB = (b.querySelector('.pf2-shop__name') || {}).textContent || '';
      var priceA = Number(a.getAttribute('data-price') || 0);
      var priceB = Number(b.getAttribute('data-price') || 0);

      if (mode === 'price-low') {
        return priceA - priceB;
      }

      if (mode === 'price-high') {
        return priceB - priceA;
      }

      if (mode === 'name') {
        return nameA.localeCompare(nameB);
      }

      return Number(a.getAttribute('data-sort') || 0) - Number(b.getAttribute('data-sort') || 0);
    });

    return sorted;
  }

  function applyFilters() {
    var active = getActiveFilters();
    var visibleCards = [];

    cards.forEach(function (card) {
      var show = cardMatchesFilters(card, active);
      card.hidden = !show;

      if (show) {
        visibleCards.push(card);
      }
    });

    visibleCards = sortCards(visibleCards);

    if (gridEl) {
      visibleCards.forEach(function (card) {
        gridEl.appendChild(card);
      });
    }

    if (countEl) {
      countEl.textContent = visibleCards.length + ' product' + (visibleCards.length === 1 ? '' : 's');
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('change', applyFilters);
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  applyFilters();
})();
