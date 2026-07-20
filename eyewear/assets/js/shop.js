const mobileFilterBtn = document.getElementById('shopMobileFilterBtn');
const desktopFilterBtn = document.getElementById('shopDesktopFilterBtn');
const filterDrawer = document.getElementById('shopFilterDrawer');
const filterOverlay = document.getElementById('shopFilterOverlay');
const filterCloseBtn = document.getElementById('shopFilterClose');
const filterResetBtn = document.getElementById('shopFilterReset');
const filterApplyBtn = document.getElementById('shopFilterApply');
const filterAccordion = document.getElementById('shopFilterAccordion');

function openFilterDrawer() {
  if (!filterDrawer || !filterOverlay) return;
  filterDrawer.classList.add('is-open');
  filterOverlay.classList.add('is-open');
  filterDrawer.setAttribute('aria-hidden', 'false');
  filterOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('shop-filter-open');
}

function closeFilterDrawer() {
  if (!filterDrawer || !filterOverlay) return;
  filterDrawer.classList.remove('is-open');
  filterOverlay.classList.remove('is-open');
  filterDrawer.setAttribute('aria-hidden', 'true');
  filterOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('shop-filter-open');
}

[mobileFilterBtn, desktopFilterBtn].forEach(btn => {
  if (btn) {
    btn.addEventListener('click', openFilterDrawer);
  }
});

if (filterCloseBtn) {
  filterCloseBtn.addEventListener('click', closeFilterDrawer);
}

if (filterOverlay) {
  filterOverlay.addEventListener('click', closeFilterDrawer);
}

if (filterApplyBtn) {
  filterApplyBtn.addEventListener('click', closeFilterDrawer);
}

if (filterResetBtn && filterAccordion) {
  filterResetBtn.addEventListener('click', () => {
    filterAccordion.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    filterAccordion.querySelectorAll('.shop-filter-item').forEach(item => {
      item.classList.remove('is-open');
      const toggle = item.querySelector('.shop-filter-item-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (filterAccordion) {
  filterAccordion.querySelectorAll('.shop-filter-item-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.shop-filter-item');
      if (!item) return;

      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && filterDrawer?.classList.contains('is-open')) {
    closeFilterDrawer();
  }
});

const shopSwatches = document.querySelectorAll('.shop-swatch');
shopSwatches.forEach(swatch => {
  swatch.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const siblings = e.target.parentElement.querySelectorAll('.shop-swatch');
    siblings.forEach(s => s.classList.remove('active'));
    e.target.classList.add('active');
  });
});
