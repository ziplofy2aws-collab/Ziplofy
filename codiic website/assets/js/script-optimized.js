// ============================================
// OPTIMIZED: Single DOMContentLoaded Listener
// Consolidates all initialization code to prevent lag
// ============================================

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        init();
    }
    
    function init() {
        // Batch all DOM queries at once
        const elements = {
            header: document.getElementById('main-header'),
            mobileToggle: document.querySelector('.mobile-menu-toggle'),
            headerContent: document.querySelector('.header-content'),
            drawer: document.querySelector('.header-drawer'),
            overlay: document.querySelector('.mobile-drawer-overlay'),
            navLinks: document.querySelectorAll('.nav-link'),
            heroLeft: document.querySelector('.hero-left'),
            heroRight: document.querySelector('.hero-right'),
            dashboardMockup: document.querySelector('.dashboard-mockup')
        };
        
        // Initialize all features
        initStickyHeader(elements.header);
        initMobileMenu(elements.mobileToggle, elements.header, elements.drawer, elements.overlay);
        initSmoothScroll(elements.navLinks);
        initHeroSection(elements.heroLeft, elements.heroRight, elements.dashboardMockup);
        initFloatingCards();
        initIntersectionObserver();
        initAISection();
        // Add other initializations here...
    }
    
    // Sticky Header
    function initStickyHeader(header) {
        if (!header) return;
        
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const currentScroll = window.pageYOffset;
                    if (currentScroll > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
    
    // Mobile Menu
    function initMobileMenu(toggle, header, drawer, overlay) {
        if (!toggle || !header || !drawer) return;
        
        // Menu toggle logic here...
        // (Keep existing mobile menu code)
    }
    
    // Smooth Scroll
    function initSmoothScroll(navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
    
    // Hero Section - Optimized (no heavy operations)
    function initHeroSection(heroLeft, heroRight, dashboardMockup) {
        // Remove any conflicting inline styles
        if (heroLeft) {
            heroLeft.style.opacity = '';
            heroLeft.style.transform = '';
            heroLeft.style.transition = '';
        }
        
        if (heroRight) {
            heroRight.style.opacity = '';
            heroRight.style.transform = '';
            heroRight.style.transition = '';
        }
        
        // Optimize image rendering
        if (dashboardMockup) {
            // Force GPU acceleration
            dashboardMockup.style.transform = 'translate3d(0, 0, 0)';
            dashboardMockup.style.willChange = 'auto';
        }
    }
    
    // Floating Cards
    function initFloatingCards() {
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isMobile || reduceMotion) return;
        
        const cards = Array.from(document.querySelectorAll('.floating-card'));
        if (!cards.length) return;
        
        let ticking = false;
        let lastY = 0;
        
        function update() {
            ticking = false;
            const y = lastY;
            cards.forEach((card, index) => {
                const speed = 0.12 + index * 0.03;
                card.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
            });
        }
        
        window.addEventListener('scroll', function() {
            lastY = window.pageYOffset || 0;
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(function() {
                    update();
                    ticking = false;
                });
            }
        }, { passive: true });
    }
    
    // Intersection Observer
    function initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            requestAnimationFrame(() => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translate3d(0, 0, 0)';
                        entry.target.style.willChange = 'auto';
                        observer.unobserve(entry.target);
                    }
                });
            });
        }, observerOptions);
        
        // Observe elements that need animation
        // (Add your elements here)
    }
    
    // AI Section
    function initAISection() {
        const aiLeft = document.querySelector('.ai-left');
        const aiRight = document.querySelector('.ai-right');
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!isMobile && !prefersReducedMotion) {
            // AI section animation code
        }
    }
    
})();
