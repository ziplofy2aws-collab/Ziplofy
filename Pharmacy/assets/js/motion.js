(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var desktopNav = window.matchMedia("(min-width: 769px)");

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function createMotionShell() {
    var progress = document.createElement("div");
    progress.className = "phr-motion-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = '<span class="phr-motion-progress__fill"></span>';
    document.body.prepend(progress);

    var orbs = document.createElement("div");
    orbs.className = "phr-motion-orbs";
    orbs.setAttribute("aria-hidden", "true");
    orbs.innerHTML =
      '<span class="phr-motion-orbs__orb phr-motion-orbs__orb--1"></span>' +
      '<span class="phr-motion-orbs__orb phr-motion-orbs__orb--2"></span>' +
      '<span class="phr-motion-orbs__orb phr-motion-orbs__orb--3"></span>';
    document.body.prepend(orbs);

    if (finePointer && !reducedMotion) {
      var cursor = document.createElement("div");
      cursor.className = "phr-motion-cursor";
      cursor.setAttribute("aria-hidden", "true");
      document.body.appendChild(cursor);
    }

    document.documentElement.classList.add("phr-motion");

    return {
      progressFill: progress.querySelector(".phr-motion-progress__fill"),
      cursor: document.querySelector(".phr-motion-cursor")
    };
  }

  function initLenis(onScroll) {
    if (reducedMotion || coarsePointer || typeof Lenis === "undefined") return null;

    var lenis = new Lenis({
      duration: 1.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1
    });

    lenis.on("scroll", onScroll);

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop: function (value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect: function () {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        pinType: document.documentElement.style.transform ? "transform" : "fixed"
      });

      ScrollTrigger.addEventListener("refresh", function () {
        if (lenis && lenis.resize) lenis.resize();
      });

      lenis.on("scroll", ScrollTrigger.update);
    }

    if (typeof gsap !== "undefined") {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    return lenis;
  }

  function initHeaderMotion() {
    var header = document.querySelector(".phr-header");
    if (!header) return function () {};

    var lastY = window.scrollY || 0;
    var ticking = false;
    var hideEnabled = desktopNav.matches;

    desktopNav.addEventListener("change", function () {
      hideEnabled = desktopNav.matches;
      if (!hideEnabled) header.classList.remove("is-hidden");
    });

    return function (scrollY) {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        var y = typeof scrollY === "number" ? scrollY : window.scrollY;
        header.classList.toggle("is-scrolled", y > 12);

        if (hideEnabled && y > 120) {
          if (y > lastY + 4) {
            header.classList.add("is-hidden");
          } else if (y < lastY - 4) {
            header.classList.remove("is-hidden");
          }
        } else {
          header.classList.remove("is-hidden");
        }

        lastY = y;
        ticking = false;
      });
    };
  }

  function initCursor(cursorEl) {
    if (!cursorEl || reducedMotion) return;

    var x = 0;
    var y = 0;
    var cx = 0;
    var cy = 0;
    var active = false;

    document.documentElement.classList.add("phr-motion-cursor-on");

    document.addEventListener("mousemove", function (event) {
      x = event.clientX;
      y = event.clientY;
      if (!active) {
        active = true;
        cursorEl.style.opacity = "1";
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      active = false;
      cursorEl.style.opacity = "0";
    });

    function tick() {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      cursorEl.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";
      requestAnimationFrame(tick);
    }

    tick();
  }

  function initLazyImages() {
    if (reducedMotion) return;

    var images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;

    images.forEach(function (img) {
      img.classList.add("phr-motion-img");
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("is-visible");
      }
    });

    if (!("IntersectionObserver" in window)) {
      images.forEach(function (img) {
        img.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "80px 0px", threshold: 0.08 }
    );

    images.forEach(function (img) {
      if (!img.classList.contains("is-visible")) observer.observe(img);
    });
  }

  function initRevealAnimations() {
    if (reducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var targets = document.querySelectorAll(
      "main > section:not(.phr-hero), main > .phr-product, main > .phr-shop, " +
      "main > .phr-reviews--page, .phr-footer"
    );

    targets.forEach(function (section) {
      section.classList.add("phr-motion-reveal");

      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 86%",
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    });

    ScrollTrigger.refresh();
  }

  function advanceCarousel(root, prevSelector, nextSelector) {
    var nextBtn = root.querySelector(nextSelector);
    var prevBtn = root.querySelector(prevSelector);
    if (!nextBtn) return;

    if (!nextBtn.disabled && !nextBtn.hidden) {
      nextBtn.click();
      return;
    }

    if (!prevBtn) return;

    var guard = 0;
    while (!prevBtn.disabled && !prevBtn.hidden && guard < 40) {
      prevBtn.click();
      guard += 1;
    }
  }

  function initAutoCarousel(root, config) {
    if (reducedMotion || !root) return;

    var interval = config.interval || 4500;
    var timer = null;

    function start() {
      stop();
      timer = window.setInterval(function () {
        advanceCarousel(root, config.prev, config.next);
      }, interval);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    start();

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) start();
    });
  }

  function initAutoCarousels() {
    var hero = document.querySelector("[data-phr-hero]");
    if (hero) {
      initAutoCarousel(hero, {
        prev: "[data-phr-hero-prev]",
        next: "[data-phr-hero-next]",
        interval: 6000
      });
    }

    var fitness = document.querySelector("[data-phr-fitness]");
    if (fitness) {
      initAutoCarousel(fitness, {
        prev: "[data-phr-fitness-prev]",
        next: "[data-phr-fitness-next]",
        interval: 4800
      });
    }

    var promo = document.querySelector("[data-phr-promo]");
    if (promo) {
      initAutoCarousel(promo, {
        prev: "[data-phr-promo-prev]",
        next: "[data-phr-promo-next]",
        interval: 5200
      });
    }

    document.querySelectorAll("[data-phr-deals-block]").forEach(function (block) {
      initAutoCarousel(block, {
        prev: "[data-phr-deals-prev]",
        next: "[data-phr-deals-next]",
        interval: 4600
      });
    });

    var wellness = document.querySelector("[data-phr-wellness]");
    if (wellness) {
      initAutoCarousel(wellness, {
        prev: "[data-phr-wellness-prev]",
        next: "[data-phr-wellness-next]",
        interval: 5500
      });
    }

    var glance = document.querySelector("[data-phr-glance]");
    if (glance) {
      initAutoCarousel(glance, {
        prev: "[data-phr-glance-prev]",
        next: "[data-phr-glance-next]",
        interval: 5000
      });
    }

    var similar = document.querySelector("[data-phr-similar-slider]");
    if (similar) {
      initAutoCarousel(similar, {
        prev: "[data-phr-similar-prev]",
        next: "[data-phr-similar-next]",
        interval: 4700
      });
    }
  }

  ready(function () {
    var shell = createMotionShell();
    var updateHeader = initHeaderMotion();
    var lenis = null;

    function onScroll(data) {
      var scrollY = data && typeof data.scroll === "number" ? data.scroll : window.scrollY;
      if (shell.progressFill) {
        var limit = lenis
          ? lenis.limit
          : Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        var progress = Math.min(Math.max(scrollY / limit, 0), 1);
        shell.progressFill.style.transform = "scaleX(" + progress + ")";
      }
      updateHeader(scrollY);
    }

    lenis = initLenis(onScroll);

    if (!lenis) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll({ scroll: window.scrollY });
    }

    initCursor(shell.cursor);
    initLazyImages();

    window.setTimeout(function () {
      initRevealAnimations();
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 100);

    window.setTimeout(initAutoCarousels, 140);

    window.addEventListener("load", function () {
      initLazyImages();
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
      if (lenis && lenis.resize) lenis.resize();
    });

    window.addEventListener("resize", function () {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
      if (lenis && lenis.resize) lenis.resize();
    });
  });
})();
