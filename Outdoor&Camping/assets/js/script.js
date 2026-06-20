(function () {
  "use strict";

  /* Mobile navigation drawer */
  var menuToggle = document.querySelector("[data-et-menu-toggle]");
  var menuClose = document.querySelector("[data-et-menu-close]");
  var navMenu = document.getElementById("etNavMenu");
  var backdrop = document.querySelector("[data-et-drawer-backdrop]");

  function setMenuOpen(open) {
    if (!menuToggle || !navMenu) return;

    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("is-open", open);

    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.classList.toggle("is-visible", open);
    }

    document.body.style.overflow = open ? "hidden" : "";
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    menuClose?.addEventListener("click", function () {
      setMenuOpen(false);
    });

    backdrop?.addEventListener("click", function () {
      setMenuOpen(false);
    });

    navMenu.querySelectorAll(".et-nav__link, .et-nav__account").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 1024) {
          setMenuOpen(false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    });
  }

  /* Hero slider — auto fade */
  var heroRoot = document.querySelector("[data-et-hero-slider]");
  if (heroRoot) {
    var heroSlides = heroRoot.querySelectorAll("[data-et-hero-slide]");
    var heroDots = heroRoot.querySelectorAll("[data-et-hero-dot]");
    var heroIndex = 0;
    var heroTimer = null;
    var heroInterval = 5000;

    function heroGoTo(i) {
      if (!heroSlides.length) return;

      heroSlides[heroIndex].classList.remove("is-active");
      if (heroDots[heroIndex]) {
        heroDots[heroIndex].classList.remove("is-active");
        heroDots[heroIndex].setAttribute("aria-selected", "false");
      }

      heroIndex = (i + heroSlides.length) % heroSlides.length;

      heroSlides[heroIndex].classList.add("is-active");
      if (heroDots[heroIndex]) {
        heroDots[heroIndex].classList.add("is-active");
        heroDots[heroIndex].setAttribute("aria-selected", "true");
      }
    }

    function heroSchedule() {
      if (heroTimer) window.clearInterval(heroTimer);
      heroTimer = window.setInterval(function () {
        heroGoTo(heroIndex + 1);
      }, heroInterval);
    }

    heroDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-et-hero-dot"), 10);
        if (!isNaN(target) && target !== heroIndex) {
          heroGoTo(target);
          heroSchedule();
        }
      });
    });

    heroRoot.addEventListener("mouseenter", function () {
      if (heroTimer) window.clearInterval(heroTimer);
    });

    heroRoot.addEventListener("mouseleave", heroSchedule);

    if (heroSlides.length >= 2 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroSchedule();
    }
  }

  /* Products carousel — one card per click, prev/next navigation */
  var productsRoot = document.querySelector("[data-et-products]");
  if (productsRoot) {
    var productsViewport = productsRoot.querySelector("[data-et-products-viewport]");
    var productsTrack = productsRoot.querySelector("[data-et-products-track]");
    var productsCards = productsTrack ? productsTrack.querySelectorAll(".et-pcard") : [];
    var productsPrev = productsRoot.querySelector("[data-et-products-prev]");
    var productsNext = productsRoot.querySelector("[data-et-products-next]");
    var productsSliderWrap = productsRoot.querySelector(".et-products__slider-wrap");

    if (productsViewport && productsTrack && productsCards.length && productsNext) {
      var productsIndex = 0;

      function productsVisibleCount() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 1024) return 2;
        if (window.innerWidth <= 1200) return 3;
        return 4;
      }

      function productsMaxIndex() {
        return Math.max(0, productsCards.length - productsVisibleCount());
      }

      function productsGap() {
        return parseFloat(getComputedStyle(productsTrack).gap) || 16;
      }

      function productsStep() {
        var card = productsCards[0];
        if (!card) return 0;
        return card.getBoundingClientRect().width + productsGap();
      }

      function productsSyncSizes() {
        var visible = productsVisibleCount();
        var gap = productsGap();
        var viewW = productsViewport.getBoundingClientRect().width;
        var cardW =
          visible === 1 ? viewW : (viewW - gap * (visible - 1)) / visible;

        productsCards.forEach(function (card) {
          card.style.flex = "0 0 " + cardW + "px";
          card.style.width = cardW + "px";
          card.style.minWidth = cardW + "px";
          card.style.maxWidth = visible === 1 ? cardW + "px" : "";
        });
      }

      function productsUpdateNav() {
        var atStart = productsIndex <= 0;
        var atEnd = productsIndex >= productsMaxIndex();

        if (productsPrev) {
          productsPrev.hidden = atStart;
          productsPrev.disabled = atStart;
        }

        if (productsSliderWrap) {
          productsSliderWrap.classList.toggle("has-prev", !atStart);
        }

        productsNext.disabled = atEnd;
      }

      function productsGoTo(i) {
        productsSyncSizes();
        var max = productsMaxIndex();
        productsIndex = Math.max(0, Math.min(i, max));
        productsTrack.style.transform =
          "translate3d(-" + productsIndex * productsStep() + "px, 0, 0)";
        productsUpdateNav();
      }

      function productsOnResize() {
        productsGoTo(productsIndex);
      }

      if (productsPrev) {
        productsPrev.addEventListener("click", function () {
          if (productsIndex > 0) {
            productsGoTo(productsIndex - 1);
          }
        });
      }

      productsNext.addEventListener("click", function () {
        if (productsIndex < productsMaxIndex()) {
          productsGoTo(productsIndex + 1);
        }
      });

      window.addEventListener("resize", productsOnResize);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          productsGoTo(productsIndex);
        });
      }

      productsGoTo(0);
    }
  }

  /* Explore Collections — mobile swipe carousel (1 card at a time) */
  var collRoot = document.querySelector("[data-et-collections]");
  if (collRoot) {
    var collViewport = collRoot.querySelector("[data-et-collections-viewport]");
    var collTrack = collRoot.querySelector("[data-et-collections-track]");
    var collCards = collTrack ? collTrack.querySelectorAll(".et-coll-card") : [];

    if (collViewport && collTrack && collCards.length) {
      var collIndex = 0;
      var collActiveId = null;
      var collDidDrag = false;
      var collStartX = 0;
      var collDeltaX = 0;
      var collBaseX = 0;

      collCards.forEach(function (card) {
        card.setAttribute("draggable", "false");
        card.addEventListener("dragstart", function (e) {
          e.preventDefault();
        });
      });

      function collIsCarousel() {
        return window.innerWidth <= 768;
      }

      function collStep() {
        var card = collCards[0];
        if (!card) return 0;
        return card.getBoundingClientRect().width;
      }

      function collMaxIndex() {
        return Math.max(0, collCards.length - 1);
      }

      function collClearInlineSizes() {
        collCards.forEach(function (card) {
          card.style.flex = "";
          card.style.width = "";
          card.style.minWidth = "";
          card.style.maxWidth = "";
        });
      }

      function collSyncSizes() {
        if (!collIsCarousel()) {
          collClearInlineSizes();
          return;
        }

        var viewW = collViewport.getBoundingClientRect().width;
        collCards.forEach(function (card) {
          card.style.flex = "0 0 " + viewW + "px";
          card.style.width = viewW + "px";
          card.style.minWidth = viewW + "px";
          card.style.maxWidth = viewW + "px";
        });
      }

      function collApplyTransform(px, animate) {
        if (!collIsCarousel()) {
          collTrack.style.transition = "";
          collTrack.style.transform = "";
          return;
        }
        collTrack.style.transition =
          animate === false ? "none" : "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        collTrack.style.transform = "translate3d(" + -px + "px, 0, 0)";
      }

      function collGoTo(i, animate) {
        collSyncSizes();
        if (!collIsCarousel()) {
          collIndex = 0;
          collApplyTransform(0, false);
          return;
        }
        var max = collMaxIndex();
        collIndex = Math.max(0, Math.min(i, max));
        collApplyTransform(collIndex * collStep(), animate !== false);
      }

      function collSwipeThreshold() {
        return Math.max(36, Math.min(56, collStep() * 0.15));
      }

      function collEndDrag() {
        if (collActiveId === null) return;
        collViewport.classList.remove("is-dragging");

        if (collIsCarousel()) {
          var threshold = collSwipeThreshold();
          if (collDeltaX < -threshold && collIndex < collMaxIndex()) {
            collGoTo(collIndex + 1);
          } else if (collDeltaX > threshold && collIndex > 0) {
            collGoTo(collIndex - 1);
          } else {
            collGoTo(collIndex);
          }
        }

        collActiveId = null;
        collDeltaX = 0;
      }

      function collOnDown(e) {
        if (!collIsCarousel()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (collActiveId !== null) return;

        collActiveId = e.pointerId;
        collDidDrag = false;
        collStartX = e.clientX;
        collDeltaX = 0;
        collBaseX = collIndex * collStep();
        collViewport.classList.add("is-dragging");
        collApplyTransform(collBaseX, false);

        if (e.cancelable) e.preventDefault();

        if (collViewport.setPointerCapture) {
          try {
            collViewport.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      }

      function collOnMove(e) {
        if (!collIsCarousel() || collActiveId === null || e.pointerId !== collActiveId) {
          return;
        }

        collDeltaX = e.clientX - collStartX;
        if (Math.abs(collDeltaX) > 4) collDidDrag = true;

        var max = collMaxIndex() * collStep();
        var nextX = Math.max(0, Math.min(collBaseX - collDeltaX, max));
        collApplyTransform(nextX, false);

        if (collDidDrag && e.cancelable) e.preventDefault();
      }

      function collOnUp(e) {
        if (collActiveId === null || e.pointerId !== collActiveId) return;

        if (collViewport.releasePointerCapture) {
          try {
            collViewport.releasePointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }

        collEndDrag();
      }

      collViewport.addEventListener("pointerdown", collOnDown, { passive: false });
      collViewport.addEventListener("pointermove", collOnMove, { passive: false });
      collViewport.addEventListener("pointerup", collOnUp);
      collViewport.addEventListener("pointercancel", collOnUp);
      collViewport.addEventListener("lostpointercapture", function () {
        if (collActiveId !== null) collEndDrag();
      });

      collCards.forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (collDidDrag) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });

      window.addEventListener("resize", function () {
        collGoTo(collIndex, false);
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          collGoTo(collIndex, false);
        });
      }

      collGoTo(0, false);
    }
  }

  /* Promo carousel — swipe / drag one card at a time */
  var promoRoot = document.querySelector("[data-et-promo]");
  if (promoRoot) {
    var promoViewport = promoRoot.querySelector("[data-et-promo-viewport]");
    var promoTrack = promoRoot.querySelector("[data-et-promo-track]");
    var promoCards = promoTrack ? promoTrack.querySelectorAll(".et-promo-card") : [];

    if (promoViewport && promoTrack && promoCards.length) {
      var promoIndex = 0;
      var promoActiveId = null;
      var promoDidDrag = false;
      var promoStartX = 0;
      var promoDeltaX = 0;
      var promoBaseX = 0;

      promoCards.forEach(function (card) {
        card.setAttribute("draggable", "false");
        card.addEventListener("dragstart", function (e) {
          e.preventDefault();
        });
      });

      function promoIsMobile() {
        return window.innerWidth <= 640;
      }

      function promoVisibleCount() {
        if (promoIsMobile()) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 4;
      }

      function promoGap() {
        return parseFloat(getComputedStyle(promoTrack).gap) || 18;
      }

      function promoStep() {
        var card = promoCards[0];
        if (!card) return 0;
        return card.getBoundingClientRect().width + promoGap();
      }

      function promoMaxIndex() {
        return Math.max(0, promoCards.length - promoVisibleCount());
      }

      function promoSyncSizes() {
        var visible = promoVisibleCount();
        var gap = promoGap();
        var viewW = promoViewport.getBoundingClientRect().width;
        var cardW =
          visible === 1 ? viewW : (viewW - gap * (visible - 1)) / visible;

        promoCards.forEach(function (card) {
          card.style.flex = "0 0 " + cardW + "px";
          card.style.width = cardW + "px";
          card.style.minWidth = cardW + "px";
          card.style.maxWidth = visible === 1 ? cardW + "px" : "";
        });
      }

      function promoApplyTransform(px, animate) {
        promoTrack.style.transition =
          animate === false ? "none" : "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        promoTrack.style.transform = "translate3d(" + -px + "px, 0, 0)";
      }

      function promoGoTo(i, animate) {
        promoSyncSizes();
        var max = promoMaxIndex();
        promoIndex = Math.max(0, Math.min(i, max));
        promoApplyTransform(promoIndex * promoStep(), animate !== false);
      }

      function promoSwipeThreshold() {
        var step = promoStep();
        return Math.max(36, Math.min(promoIsMobile() ? 56 : 72, step * 0.18));
      }

      function promoEndDrag() {
        if (promoActiveId === null) return;

        promoViewport.classList.remove("is-dragging");
        var threshold = promoSwipeThreshold();

        if (promoDeltaX < -threshold && promoIndex < promoMaxIndex()) {
          promoGoTo(promoIndex + 1);
        } else if (promoDeltaX > threshold && promoIndex > 0) {
          promoGoTo(promoIndex - 1);
        } else {
          promoGoTo(promoIndex);
        }

        promoActiveId = null;
        promoDeltaX = 0;
      }

      function promoOnDown(e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (promoActiveId !== null) return;

        promoActiveId = e.pointerId;
        promoDidDrag = false;
        promoStartX = e.clientX;
        promoDeltaX = 0;
        promoBaseX = promoIndex * promoStep();
        promoViewport.classList.add("is-dragging");
        promoApplyTransform(promoBaseX, false);

        if (e.cancelable) e.preventDefault();

        if (promoViewport.setPointerCapture) {
          try {
            promoViewport.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      }

      function promoOnMove(e) {
        if (promoActiveId === null || e.pointerId !== promoActiveId) return;

        promoDeltaX = e.clientX - promoStartX;
        if (Math.abs(promoDeltaX) > 4) promoDidDrag = true;

        var max = promoMaxIndex() * promoStep();
        var nextX = Math.max(0, Math.min(promoBaseX - promoDeltaX, max));
        promoApplyTransform(nextX, false);

        if (promoDidDrag && e.cancelable) e.preventDefault();
      }

      function promoOnUp(e) {
        if (promoActiveId === null || e.pointerId !== promoActiveId) return;

        if (promoViewport.releasePointerCapture) {
          try {
            promoViewport.releasePointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }

        promoEndDrag();
      }

      promoViewport.addEventListener("pointerdown", promoOnDown, { passive: false });
      promoViewport.addEventListener("pointermove", promoOnMove, { passive: false });
      promoViewport.addEventListener("pointerup", promoOnUp);
      promoViewport.addEventListener("pointercancel", promoOnUp);
      promoViewport.addEventListener("lostpointercapture", function () {
        if (promoActiveId !== null) promoEndDrag();
      });

      promoCards.forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (promoDidDrag) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });

      window.addEventListener("resize", function () {
        promoGoTo(promoIndex);
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          promoGoTo(promoIndex, false);
        });
      }

      promoGoTo(0, false);
    }
  }

  /* Top Selling — mobile swipe carousel (1 card at a time) */
  var tsRoot = document.querySelector("[data-et-top-selling]");
  if (tsRoot) {
    var tsViewport = tsRoot.querySelector("[data-et-ts-viewport]");
    var tsTrack = tsRoot.querySelector("[data-et-ts-track]");
    var tsCards = tsTrack ? tsTrack.querySelectorAll(".et-ts-card") : [];

    if (tsViewport && tsTrack && tsCards.length) {
      var tsIndex = 0;
      var tsActiveId = null;
      var tsDidDrag = false;
      var tsStartX = 0;
      var tsDeltaX = 0;
      var tsBaseX = 0;

      tsCards.forEach(function (card) {
        card.setAttribute("draggable", "false");
        card.addEventListener("dragstart", function (e) {
          e.preventDefault();
        });
      });

      function tsIsCarousel() {
        return window.innerWidth <= 640;
      }

      function tsGap() {
        return parseFloat(getComputedStyle(tsTrack).gap) || 12;
      }

      function tsStep() {
        var card = tsCards[0];
        if (!card) return 0;
        return card.getBoundingClientRect().width + tsGap();
      }

      function tsMaxIndex() {
        return Math.max(0, tsCards.length - 1);
      }

      function tsClearInlineSizes() {
        tsCards.forEach(function (card) {
          card.style.flex = "";
          card.style.width = "";
          card.style.minWidth = "";
          card.style.maxWidth = "";
        });
      }

      function tsSyncSizes() {
        if (!tsIsCarousel()) {
          tsClearInlineSizes();
          return;
        }

        var viewW = tsViewport.getBoundingClientRect().width;
        tsCards.forEach(function (card) {
          card.style.flex = "0 0 " + viewW + "px";
          card.style.width = viewW + "px";
          card.style.minWidth = viewW + "px";
          card.style.maxWidth = viewW + "px";
        });
      }

      function tsApplyTransform(px, animate) {
        if (!tsIsCarousel()) {
          tsTrack.style.transition = "";
          tsTrack.style.transform = "";
          return;
        }
        tsTrack.style.transition =
          animate === false ? "none" : "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        tsTrack.style.transform = "translate3d(" + -px + "px, 0, 0)";
      }

      function tsGoTo(i, animate) {
        tsSyncSizes();
        if (!tsIsCarousel()) {
          tsIndex = 0;
          tsApplyTransform(0, false);
          return;
        }
        var max = tsMaxIndex();
        tsIndex = Math.max(0, Math.min(i, max));
        tsApplyTransform(tsIndex * tsStep(), animate !== false);
      }

      function tsSwipeThreshold() {
        return Math.max(36, Math.min(56, tsStep() * 0.15));
      }

      function tsEndDrag() {
        if (tsActiveId === null) return;
        tsViewport.classList.remove("is-dragging");

        if (tsIsCarousel()) {
          var threshold = tsSwipeThreshold();
          if (tsDeltaX < -threshold && tsIndex < tsMaxIndex()) {
            tsGoTo(tsIndex + 1);
          } else if (tsDeltaX > threshold && tsIndex > 0) {
            tsGoTo(tsIndex - 1);
          } else {
            tsGoTo(tsIndex);
          }
        }

        tsActiveId = null;
        tsDeltaX = 0;
      }

      function tsOnDown(e) {
        if (!tsIsCarousel()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (tsActiveId !== null) return;

        tsActiveId = e.pointerId;
        tsDidDrag = false;
        tsStartX = e.clientX;
        tsDeltaX = 0;
        tsBaseX = tsIndex * tsStep();
        tsViewport.classList.add("is-dragging");
        tsApplyTransform(tsBaseX, false);

        if (e.cancelable) e.preventDefault();

        if (tsViewport.setPointerCapture) {
          try {
            tsViewport.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      }

      function tsOnMove(e) {
        if (!tsIsCarousel() || tsActiveId === null || e.pointerId !== tsActiveId) return;

        tsDeltaX = e.clientX - tsStartX;
        if (Math.abs(tsDeltaX) > 4) tsDidDrag = true;

        var max = tsMaxIndex() * tsStep();
        var nextX = Math.max(0, Math.min(tsBaseX - tsDeltaX, max));
        tsApplyTransform(nextX, false);

        if (tsDidDrag && e.cancelable) e.preventDefault();
      }

      function tsOnUp(e) {
        if (tsActiveId === null || e.pointerId !== tsActiveId) return;

        if (tsViewport.releasePointerCapture) {
          try {
            tsViewport.releasePointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }

        tsEndDrag();
      }

      tsViewport.addEventListener("pointerdown", tsOnDown, { passive: false });
      tsViewport.addEventListener("pointermove", tsOnMove, { passive: false });
      tsViewport.addEventListener("pointerup", tsOnUp);
      tsViewport.addEventListener("pointercancel", tsOnUp);
      tsViewport.addEventListener("lostpointercapture", function () {
        if (tsActiveId !== null) tsEndDrag();
      });

      tsCards.forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (tsDidDrag) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });

      window.addEventListener("resize", function () {
        tsGoTo(tsIndex, false);
      });

      tsGoTo(0, false);
    }
  }

  /* Features — mobile carousel with dash pagination */
  var featuresRoot = document.querySelector("[data-et-features]");
  if (featuresRoot) {
    var featuresViewport = featuresRoot.querySelector("[data-et-features-viewport]");
    var featuresTrack = featuresRoot.querySelector("[data-et-features-track]");
    var featuresItems = featuresTrack
      ? featuresTrack.querySelectorAll(".et-features__item")
      : [];
    var featuresDashes = featuresRoot.querySelectorAll("[data-et-features-go]");

    if (featuresViewport && featuresTrack && featuresItems.length) {
      var featuresIndex = 0;
      var featuresActiveId = null;
      var featuresDidDrag = false;
      var featuresStartX = 0;
      var featuresDeltaX = 0;
      var featuresBaseX = 0;

      function featuresIsMobile() {
        return window.innerWidth <= 768;
      }

      function featuresGoTo(i, animate) {
        var max = featuresItems.length - 1;
        featuresIndex = Math.max(0, Math.min(i, max));

        featuresItems.forEach(function (item, idx) {
          item.classList.toggle("is-active", idx === featuresIndex);
        });

        featuresDashes.forEach(function (dash, idx) {
          var on = idx === featuresIndex;
          dash.classList.toggle("is-active", on);
          dash.setAttribute("aria-selected", on ? "true" : "false");
        });

        if (!featuresIsMobile()) {
          featuresTrack.style.transition = "";
          featuresTrack.style.transform = "";
          return;
        }

        featuresTrack.style.transition =
          animate === false ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        featuresTrack.style.transform =
          "translate3d(-" + featuresIndex * 100 + "%, 0, 0)";
      }

      function featuresOnResize() {
        featuresGoTo(featuresIndex, false);
      }

      featuresDashes.forEach(function (dash) {
        dash.addEventListener("click", function () {
          var idx = parseInt(dash.getAttribute("data-et-features-go"), 10);
          if (!isNaN(idx)) featuresGoTo(idx);
        });
      });

      function featuresEndDrag() {
        if (featuresActiveId === null) return;
        featuresViewport.classList.remove("is-dragging");

        if (featuresIsMobile()) {
          var threshold = 40;
          if (featuresDeltaX < -threshold && featuresIndex < featuresItems.length - 1) {
            featuresGoTo(featuresIndex + 1);
          } else if (featuresDeltaX > threshold && featuresIndex > 0) {
            featuresGoTo(featuresIndex - 1);
          } else {
            featuresGoTo(featuresIndex);
          }
        }

        featuresActiveId = null;
        featuresDeltaX = 0;
      }

      function featuresOnDown(e) {
        if (!featuresIsMobile()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (featuresActiveId !== null) return;

        featuresActiveId = e.pointerId;
        featuresDidDrag = false;
        featuresStartX = e.clientX;
        featuresDeltaX = 0;
        featuresBaseX = featuresIndex;
        featuresViewport.classList.add("is-dragging");

        if (e.cancelable) e.preventDefault();

        if (featuresViewport.setPointerCapture) {
          try {
            featuresViewport.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      }

      function featuresOnMove(e) {
        if (!featuresIsMobile() || featuresActiveId === null || e.pointerId !== featuresActiveId) {
          return;
        }

        featuresDeltaX = e.clientX - featuresStartX;
        if (Math.abs(featuresDeltaX) > 4) featuresDidDrag = true;

        if (featuresDidDrag && e.cancelable) e.preventDefault();
      }

      function featuresOnUp(e) {
        if (featuresActiveId === null || e.pointerId !== featuresActiveId) return;

        if (featuresViewport.releasePointerCapture) {
          try {
            featuresViewport.releasePointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }

        featuresEndDrag();
      }

      featuresViewport.addEventListener("pointerdown", featuresOnDown, { passive: false });
      featuresViewport.addEventListener("pointermove", featuresOnMove, { passive: false });
      featuresViewport.addEventListener("pointerup", featuresOnUp);
      featuresViewport.addEventListener("pointercancel", featuresOnUp);
      featuresViewport.addEventListener("lostpointercapture", function () {
        if (featuresActiveId !== null) featuresEndDrag();
      });

      window.addEventListener("resize", featuresOnResize);
      featuresGoTo(0, false);
    }
  }

  /* Category page — filters sidebar */
  var catSidebar = document.querySelector("[data-et-cat-sidebar]");
  var catBackdrop = document.querySelector("[data-et-cat-backdrop]");
  var catFilterOpen = document.querySelector("[data-et-cat-filter-open]");
  var catFilterClose = document.querySelector("[data-et-cat-sidebar-close]");

  function setCatSidebar(open) {
    if (!catSidebar) return;
    catSidebar.classList.toggle("is-open", open);
    if (catBackdrop) {
      catBackdrop.hidden = !open;
      catBackdrop.classList.toggle("is-visible", open);
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (catSidebar) {
    catFilterOpen?.addEventListener("click", function () {
      setCatSidebar(true);
    });

    catFilterClose?.addEventListener("click", function () {
      setCatSidebar(false);
    });

    catBackdrop?.addEventListener("click", function () {
      setCatSidebar(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) {
        setCatSidebar(false);
      }
    });
  }

  document.querySelectorAll("[data-et-cat-filter]").forEach(function (filter) {
    var trigger = filter.querySelector(".et-cat-filter__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var open = filter.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* Footer — mobile accordion tabs */
  var footerRoot = document.querySelector("[data-et-footer]");
  if (footerRoot) {
    var footerAccordions = footerRoot.querySelectorAll("[data-et-footer-accordion]");

    function footerIsMobile() {
      return window.innerWidth <= 1024;
    }

    function footerCloseAll(exceptCol) {
      footerAccordions.forEach(function (col) {
        if (col === exceptCol) return;
        var btn = col.querySelector(".et-footer__accordion-btn");
        var panel = col.querySelector(".et-footer__accordion-panel");
        col.classList.remove("is-open");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel && footerIsMobile()) panel.setAttribute("hidden", "");
      });
    }

    function footerSyncDesktop() {
      footerAccordions.forEach(function (col) {
        var btn = col.querySelector(".et-footer__accordion-btn");
        var panel = col.querySelector(".et-footer__accordion-panel");
        col.classList.remove("is-open");
        if (!footerIsMobile()) {
          if (btn) btn.setAttribute("aria-expanded", "true");
          if (panel) panel.removeAttribute("hidden");
        } else {
          if (btn) btn.setAttribute("aria-expanded", "false");
          if (panel) panel.setAttribute("hidden", "");
        }
      });
    }

    footerAccordions.forEach(function (col) {
      var btn = col.querySelector(".et-footer__accordion-btn");
      var panel = col.querySelector(".et-footer__accordion-panel");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        if (!footerIsMobile()) return;

        var willOpen = !col.classList.contains("is-open");
        footerCloseAll(willOpen ? col : null);

        if (willOpen) {
          col.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.removeAttribute("hidden");
        } else {
          col.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
          panel.setAttribute("hidden", "");
        }
      });
    });

    window.addEventListener("resize", footerSyncDesktop);
    footerSyncDesktop();
  }

})();
