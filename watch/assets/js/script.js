(function () {
  "use strict";

  var header = document.querySelector("[data-watch-header]");
  if (header) {
    var menuToggle = header.querySelector("[data-watch-header-menu-toggle]");
    var menuClose = header.querySelector("[data-watch-header-menu-close]");
    var drawer = header.querySelector("[data-watch-header-drawer]");
    var backdrop = header.querySelector("[data-watch-header-backdrop]");
    var searchToggle = header.querySelector("[data-watch-header-search-toggle]");
    var searchPanel = header.querySelector("[data-watch-header-search-panel]");

    function openMenu() {
      if (!drawer || !backdrop || !menuToggle) return;
      drawer.classList.add("is-open");
      backdrop.hidden = false;
      backdrop.classList.add("is-visible");
      menuToggle.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("watch-header-menu-open");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      if (!drawer || !backdrop || !menuToggle) return;
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-visible");
      backdrop.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("watch-header-menu-open");
      document.body.style.overflow = "";
    }

    if (menuToggle) menuToggle.addEventListener("click", openMenu);
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);

    if (drawer) {
      drawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function () {
        var isOpen = !searchPanel.hidden;
        searchPanel.hidden = isOpen;
        searchToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
        if (!isOpen) {
          var input = searchPanel.querySelector("input");
          if (input) input.focus();
        }
      });
    }
  }

  var hero = document.querySelector("[data-watch-hero]");
  if (hero) {
    var slides = hero.querySelectorAll(".watch-hero__slide");
    var lines = hero.querySelectorAll("[data-watch-hero-line]");
    var prevBtn = hero.querySelector("[data-watch-hero-prev]");
    var nextBtn = hero.querySelector("[data-watch-hero-next]");
    var currentIndex = 0;

    if (slides.length) {
      function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        lines.forEach(function (line, lineIndex) {
          var isActive = lineIndex === currentIndex;
          line.classList.toggle("is-active", isActive);
          line.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }

      lines.forEach(function (line) {
        line.addEventListener("click", function () {
          var index = parseInt(line.getAttribute("data-watch-hero-line"), 10);
          if (!isNaN(index)) {
            goTo(index);
          }
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo(currentIndex + 1);
        });
      }
    }
  }

  var trending = document.querySelector("[data-watch-trending]");
  if (trending) {
    var viewport = trending.querySelector("[data-watch-trending-viewport]");
    var track = trending.querySelector("[data-watch-trending-track]");
    var cards = trending.querySelectorAll(".watch-trending__card");
    var trendPrev = trending.querySelector("[data-watch-trending-prev]");
    var trendNext = trending.querySelector("[data-watch-trending-next]");
    var trendIndex = 0;

    if (viewport && track && cards.length) {
      function getVisibleCount() {
        if (window.matchMedia("(max-width: 520px)").matches) return 1;
        if (window.matchMedia("(max-width: 768px)").matches) return 2;
        return 3;
      }

      function getMaxIndex() {
        return Math.max(0, cards.length - getVisibleCount());
      }

      function updateTrending() {
        var visible = getVisibleCount();
        var maxIndex = getMaxIndex();

        if (trendIndex > maxIndex) {
          trendIndex = maxIndex;
        }

        if (visible >= cards.length) {
          track.style.transform = "none";
        } else {
          var cardWidth = cards[0].getBoundingClientRect().width;
          var gap = parseFloat(getComputedStyle(track).gap) || 0;
          track.style.transform = "translateX(-" + trendIndex * (cardWidth + gap) + "px)";
        }

        if (trendPrev) {
          trendPrev.disabled = trendIndex <= 0;
        }

        if (trendNext) {
          trendNext.disabled = trendIndex >= maxIndex;
        }
      }

      if (trendPrev) {
        trendPrev.addEventListener("click", function () {
          if (trendIndex > 0) {
            trendIndex -= 1;
            updateTrending();
          }
        });
      }

      if (trendNext) {
        trendNext.addEventListener("click", function () {
          if (trendIndex < getMaxIndex()) {
            trendIndex += 1;
            updateTrending();
          }
        });
      }

      window.addEventListener("resize", updateTrending);
      updateTrending();
    }
  }

  function initProductCarousel(section, config) {
    var viewport = section.querySelector(config.viewport);
    var track = section.querySelector(config.track);
    var cards = section.querySelectorAll(config.card);
    var prevBtn = section.querySelector(config.prev);
    var nextBtn = section.querySelector(config.next);
    var progress = section.querySelector(config.progress);
    var count = section.querySelector(config.count);
    var offset = 0;

    if (!viewport || !track || !cards.length) return;

    function getStep() {
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function getMaxOffset() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function getCardIndex() {
      var step = getStep();
      if (!step) return 0;
      return Math.min(cards.length - 1, Math.round(offset / step));
    }

    function applyScroll(targetOffset) {
      var maxOffset = getMaxOffset();
      offset = Math.min(maxOffset, Math.max(0, targetOffset));
      track.style.transform = "translateX(-" + offset + "px)";

      if (progress) {
        var progressWidth = maxOffset <= 0 ? 100 : (offset / maxOffset) * 100;
        progress.style.width = progressWidth + "%";
      }

      if (count) {
        count.textContent = (getCardIndex() + 1) + " of " + cards.length;
      }

      var edge = 2;
      var atStart = offset <= edge;
      var atEnd = offset >= maxOffset - edge;

      if (prevBtn) {
        prevBtn.disabled = atStart || maxOffset <= 0;
      }

      if (nextBtn) {
        nextBtn.disabled = atEnd || maxOffset <= 0;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        applyScroll(offset - getStep());
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        applyScroll(offset + getStep());
      });
    }

    window.addEventListener("resize", function () {
      applyScroll(offset);
    });

    window.addEventListener("load", function () {
      applyScroll(offset);
    });

    applyScroll(0);
  }

  var arrivals = document.querySelector("[data-watch-arrivals]");
  if (arrivals) {
    initProductCarousel(arrivals, {
      viewport: "[data-watch-arrivals-viewport]",
      track: "[data-watch-arrivals-track]",
      card: ".watch-arrivals__card",
      prev: "[data-watch-arrivals-prev]",
      next: "[data-watch-arrivals-next]",
      progress: "[data-watch-arrivals-progress]",
      count: "[data-watch-arrivals-count]"
    });
  }

  var raquel = document.querySelector("[data-watch-raquel]");
  if (raquel) {
    initProductCarousel(raquel, {
      viewport: "[data-watch-raquel-viewport]",
      track: "[data-watch-raquel-track]",
      card: ".watch-raquel__card",
      prev: "[data-watch-raquel-prev]",
      next: "[data-watch-raquel-next]",
      progress: "[data-watch-raquel-progress]",
      count: "[data-watch-raquel-count]"
    });
  }

  function initSwipeCarousel(section, config) {
    var viewport = section.querySelector(config.viewport);
    var track = section.querySelector(config.track);
    var cards = section.querySelectorAll(config.card);
    var offset = 0;
    var activeId = null;
    var startX = 0;
    var deltaX = 0;
    var baseX = 0;
    var didDrag = false;
    var visibleCount = config.visibleCount || 4;

    if (!viewport || !track || !cards.length) return;

    cards.forEach(function (card) {
      card.setAttribute("draggable", "false");
      card.addEventListener("dragstart", function (e) {
        e.preventDefault();
      });
      card.addEventListener("click", function (e) {
        if (didDrag) {
          e.preventDefault();
        }
      });
    });

    function getVisibleCount() {
      if (config.getVisibleCount) {
        return config.getVisibleCount();
      }
      if (window.matchMedia("(max-width: 640px)").matches) return 1;
      if (window.matchMedia("(max-width: 992px)").matches) return 2;
      return visibleCount;
    }

    function getStep() {
      return cards[0].getBoundingClientRect().width;
    }

    function getMaxOffset() {
      var step = getStep();
      var maxIndex = Math.max(0, cards.length - getVisibleCount());
      return maxIndex * step;
    }

    function applyTransform(px, animate) {
      track.classList.toggle("is-dragging", animate === false);
      track.style.transform = "translate3d(-" + px + "px, 0, 0)";
    }

    function applyScroll(targetOffset, animate) {
      var maxOffset = getMaxOffset();
      offset = Math.min(maxOffset, Math.max(0, targetOffset));
      applyTransform(offset, animate !== false);
    }

    function onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (activeId !== null) return;

      activeId = e.pointerId;
      didDrag = false;
      startX = e.clientX;
      deltaX = 0;
      baseX = offset;
      viewport.classList.add("is-dragging");
      applyTransform(baseX, false);

      if (viewport.setPointerCapture) {
        viewport.setPointerCapture(e.pointerId);
      }
    }

    function onMove(e) {
      if (activeId !== e.pointerId) return;

      deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 6) {
        didDrag = true;
      }

      var nextOffset = baseX - deltaX;
      var maxOffset = getMaxOffset();
      nextOffset = Math.min(maxOffset, Math.max(0, nextOffset));
      applyTransform(nextOffset, false);
    }

    function onUp(e) {
      if (activeId !== e.pointerId) return;

      viewport.classList.remove("is-dragging");
      if (viewport.releasePointerCapture) {
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
      }

      var threshold = Math.max(40, getStep() * 0.12);
      if (deltaX < -threshold) {
        applyScroll(offset + getStep());
      } else if (deltaX > threshold) {
        applyScroll(offset - getStep());
      } else {
        applyScroll(offset);
      }

      activeId = null;
      deltaX = 0;

      window.setTimeout(function () {
        didDrag = false;
      }, 50);
    }

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);

    window.addEventListener("resize", function () {
      applyScroll(offset);
    });

    window.addEventListener("load", function () {
      applyScroll(offset);
    });

    applyScroll(0);
  }

  var collections = document.querySelector("[data-watch-collections]");
  if (collections) {
    initSwipeCarousel(collections, {
      viewport: "[data-watch-collections-viewport]",
      track: "[data-watch-collections-track]",
      card: ".watch-collections__card",
      visibleCount: 4
    });
  }

  var testimonials = document.querySelector("[data-watch-testimonials]");
  if (testimonials) {
    var tViewport = testimonials.querySelector("[data-watch-testimonials-viewport]");
    var tTrack = testimonials.querySelector("[data-watch-testimonials-track]");
    var tCards = testimonials.querySelectorAll(".watch-testimonials__card");
    var tPrev = testimonials.querySelector("[data-watch-testimonials-prev]");
    var tNext = testimonials.querySelector("[data-watch-testimonials-next]");
    var tDotsWrap = testimonials.querySelector("[data-watch-testimonials-dots]");
    var tPage = 0;
    var tPerPage = 2;

    if (tViewport && tTrack && tCards.length && tDotsWrap) {
      function getTestimonialsPerPage() {
        return window.matchMedia("(max-width: 768px)").matches ? 1 : tPerPage;
      }

      function getTestimonialStep() {
        var gap = parseFloat(getComputedStyle(tTrack).gap) || 0;
        return tCards[0].getBoundingClientRect().width + gap;
      }

      function getTestimonialPages() {
        return Math.ceil(tCards.length / getTestimonialsPerPage());
      }

      function buildDots() {
        tDotsWrap.innerHTML = "";
        var pages = getTestimonialPages();
        for (var i = 0; i < pages; i += 1) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "watch-testimonials__dot" + (i === tPage ? " is-active" : "");
          dot.setAttribute("aria-label", "Go to testimonial slide " + (i + 1));
          dot.setAttribute("data-testimonial-dot", String(i));
          tDotsWrap.appendChild(dot);
        }
      }

      function applyTestimonials(animate) {
        var perPage = getTestimonialsPerPage();
        var pages = getTestimonialPages();
        if (tPage >= pages) {
          tPage = pages - 1;
        }
        if (tPage < 0) {
          tPage = 0;
        }

        var offset = tPage * perPage * getTestimonialStep();
        tTrack.style.transition = animate === false ? "none" : "transform 0.45s ease";
        tTrack.style.transform = "translate3d(-" + offset + "px, 0, 0)";

        var dots = tDotsWrap.querySelectorAll(".watch-testimonials__dot");
        dots.forEach(function (dot, index) {
          dot.classList.toggle("is-active", index === tPage);
        });

        if (tPrev) {
          tPrev.disabled = tPage <= 0;
        }

        if (tNext) {
          tNext.disabled = tPage >= pages - 1;
        }
      }

      tDotsWrap.addEventListener("click", function (e) {
        var dot = e.target.closest("[data-testimonial-dot]");
        if (!dot) return;
        var index = parseInt(dot.getAttribute("data-testimonial-dot"), 10);
        if (!isNaN(index)) {
          tPage = index;
          applyTestimonials();
        }
      });

      if (tPrev) {
        tPrev.addEventListener("click", function () {
          if (tPage > 0) {
            tPage -= 1;
            applyTestimonials();
          }
        });
      }

      if (tNext) {
        tNext.addEventListener("click", function () {
          if (tPage < getTestimonialPages() - 1) {
            tPage += 1;
            applyTestimonials();
          }
        });
      }

      window.addEventListener("resize", function () {
        buildDots();
        applyTestimonials(false);
      });

      window.addEventListener("load", function () {
        buildDots();
        applyTestimonials(false);
      });

      buildDots();
      applyTestimonials(false);
    }
  }

  var footer = document.querySelector("[data-watch-footer]");
  if (footer) {
    var footerMq = window.matchMedia("(max-width: 768px)");
    var footerItems = footer.querySelectorAll(".watch-footer__accordion");

    function syncFooterPanels() {
      footerItems.forEach(function (item) {
        var btn = item.querySelector(".watch-footer__trigger");
        var panel = item.querySelector(".watch-footer__panel");
        if (!btn || !panel) return;

        if (footerMq.matches) {
          var isOpen = item.classList.contains("is-open");
          panel.hidden = !isOpen;
          btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        } else {
          item.classList.remove("is-open");
          panel.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      });
    }

    footerItems.forEach(function (item) {
      var btn = item.querySelector(".watch-footer__trigger");
      var panel = item.querySelector(".watch-footer__panel");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        if (!footerMq.matches) return;

        var isOpen = item.classList.contains("is-open");

        footerItems.forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".watch-footer__trigger");
          var otherPanel = other.querySelector(".watch-footer__panel");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });

        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        panel.hidden = isOpen;
      });
    });

    if (footerMq.addEventListener) {
      footerMq.addEventListener("change", syncFooterPanels);
    } else if (footerMq.addListener) {
      footerMq.addListener(syncFooterPanels);
    }

    syncFooterPanels();
  }
})();
