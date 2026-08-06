/**
 * Codiic Use Cases - Pill tabs & scroll-spy
 */
(function() {
  'use strict';

  var sections = ['ecommerce', 'agencies', 'startups', 'enterprise', 'creators', 'local'];
  var pills = document.querySelectorAll('.uc-pill');
  var sidebarLinks = document.querySelectorAll('.uc-sidebar-link');
  var headerHeight = 72;

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) {
      var top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  function setActivePill(hash) {
    pills.forEach(function(p) {
      var href = (p.getAttribute('href') || '').replace('#', '');
      p.classList.toggle('uc-pill-active', href === hash);
    });
  }

  function setActiveSidebar(hash) {
    sidebarLinks.forEach(function(link) {
      var href = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('uc-sidebar-active', href === hash);
    });
  }

  function updateActiveFromScroll() {
    var scrollY = window.pageYOffset + headerHeight + 120;
    var active = sections[0];
    sections.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        active = id;
      }
    });
    setActivePill(active);
    setActiveSidebar(active);
  }

  if (pills.length) {
    pills.forEach(function(p) {
      p.addEventListener('click', function(e) {
        e.preventDefault();
        var id = (p.getAttribute('href') || '').replace('#', '');
        scrollToSection(id);
        setActivePill(id);
        setActiveSidebar(id);
      });
    });
  }

  if (sidebarLinks.length) {
    sidebarLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var id = (link.getAttribute('href') || '').replace('#', '');
        scrollToSection(id);
        setActiveSidebar(id);
        setActivePill(id);
      });
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateActiveFromScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  var hash = (window.location.hash || '').replace('#', '');
  if (hash && sections.indexOf(hash) >= 0) {
    setActivePill(hash);
    setActiveSidebar(hash);
  } else {
    updateActiveFromScroll();
  }
})();

/**
 * Mouse-follow glow effect for Startups section
 */
(function() {
  'use strict';
  var section = document.getElementById('startups');
  var glow = document.getElementById('uc-startup-mouse-glow');
  if (!section || !glow) return;

  var ticking = false;
  var glowX = 0;
  var glowY = 0;
  var targetX = 0;
  var targetY = 0;

  function updateGlowPosition() {
    var rect = section.getBoundingClientRect();
    glow.style.left = targetX - rect.left + 'px';
    glow.style.top = targetY - rect.top + 'px';
    ticking = false;
  }

  section.addEventListener('mouseenter', function() {
    glow.classList.add('is-active');
  });

  section.addEventListener('mouseleave', function() {
    glow.classList.remove('is-active');
  });

  section.addEventListener('mousemove', function(e) {
    var rect = section.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!ticking) {
      requestAnimationFrame(updateGlowPosition);
      ticking = true;
    }
  });
})();

/**
 * Enterprise section - fade-in on scroll
 */
(function() {
  'use strict';
  var section = document.getElementById('enterprise');
  if (!section) return;

  var animEls = section.querySelectorAll('.uc-enterprise-anim');
  if (!animEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animEls.forEach(function(el) {
    observer.observe(el);
  });
})();

/**
 * Creators section - fade-in on scroll
 */
(function() {
  'use strict';
  var section = document.getElementById('creators');
  if (!section) return;

  var animEls = section.querySelectorAll('.uc-creators-anim');
  if (!animEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animEls.forEach(function(el) {
    observer.observe(el);
  });
})();
