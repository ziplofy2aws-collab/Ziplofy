/**
 * Contact Page - Scroll to top, form submit handler, FAQ accordion
 */
(function () {
  'use strict';

  var scrollBtn = document.getElementById('contact-scroll-top');
  var contactForm = document.querySelector('.contact-form-fields');
  var faqTriggers = document.querySelectorAll('[data-faq-trigger]');

  function initFaqAccordion() {
    faqTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('[data-faq-item]');
        var isOpen = item.classList.contains('is-open');

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          document.querySelectorAll('[data-faq-item]').forEach(function (other) {
            other.classList.remove('is-open');
            var otherBtn = other.querySelector('[data-faq-trigger]');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          });
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

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

  function handleFormSubmit(e) {
    e.preventDefault();
  }

  if (scrollBtn) {
    scrollBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  if (faqTriggers.length) {
    initFaqAccordion();
  }
})();
