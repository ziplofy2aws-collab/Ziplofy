document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navigation = document.getElementById('main-navigation');
  const mobileSearchBtn = document.getElementById('nav-mobile-search');
  const searchForm = document.getElementById('header-search-form');
  const searchInput = document.getElementById('header-search-input');
  const headerContainer = document.querySelector('.header-main-container');

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  if (mobileSearchBtn && searchForm) {
    mobileSearchBtn.addEventListener('click', () => {
      const isOpen = searchForm.classList.toggle('is-mobile-open');
      if (headerContainer) {
        headerContainer.classList.toggle('search-expanded', isOpen);
      }
      if (isOpen && searchInput) {
        searchInput.focus();
      }
    });
  }

  // --- MOBILE FILTER TOGGLE (SHOP PAGE) ---
  const filterBtn = document.getElementById('mobile-filter-btn');
  const desktopFilters = document.getElementById('desktop-filters');
  if (filterBtn && desktopFilters) {
    filterBtn.addEventListener('click', () => {
      desktopFilters.classList.toggle('show-mobile');
    });
  }
});
