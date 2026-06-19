(function () {
  function formatProductPrice(n) {
    return "Rs. " + n.toLocaleString("en-IN") + ".00";
  }

  function getProductUrl(id) {
    var path = window.location.pathname.replace(/[^/]+$/, "");
    return path + "product.html?p=" + id;
  }

  function buildPcardHtml(p, btnLabel) {
    var url = getProductUrl(p.id);
    return (
      '<article class="bm-pcard" data-bm-product-id="' + p.id + '">' +
      '<span class="bm-pcard__badge">' + p.badge + "</span>" +
      '<a href="' + url + '" class="bm-pcard__media">' +
      '<img src="' + p.image + '" alt="" width="400" height="400" decoding="async" />' +
      "</a>" +
      '<div class="bm-pcard__body">' +
      '<h3 class="bm-pcard__title"><a href="' + url + '">' + p.title + "</a></h3>" +
      '<p class="bm-pcard__price">' +
      '<s class="bm-pcard__price-old">' + formatProductPrice(p.mrp) + "</s>" +
      '<span class="bm-pcard__price-sale">' + formatProductPrice(p.price) + "</span></p>" +
      '<button type="button" class="bm-pcard__btn">' + btnLabel + "</button>" +
      "</div></article>"
    );
  }

  var homeGrid = document.querySelector("[data-bm-home-products]");
  if (homeGrid && window.BM_PRODUCTS) {
    var idsAttr = homeGrid.getAttribute("data-bm-home-product-ids") || "";
    var ids = idsAttr.split(",").map(function (s) {
      return parseInt(s.trim(), 10);
    }).filter(Boolean);

    var labels = ["Add To Cart", "Add To Cart", "Add To Cart", "Quick Add"];
    homeGrid.innerHTML = ids
      .map(function (id, i) {
        var p = window.BM_PRODUCTS.find(function (item) {
          return item.id === id;
        });
        return p ? buildPcardHtml(p, labels[i] || "Quick Add") : "";
      })
      .join("");

    initHomeProductsCarousel();
  }

  function initHomeProductsCarousel() {
    var root = document.querySelector("[data-bm-home-carousel]");
    var viewport = document.querySelector("[data-bm-home-viewport]");
    var track = document.querySelector("[data-bm-home-products]");
    if (!root || !viewport || !track) return;

    var slides = track.querySelectorAll(".bm-pcard");
    if (slides.length < 2) return;

    var index = 0;
    var touchStartX = 0;
    var touchDeltaX = 0;
    var isDragging = false;
    var mqlDesktop = window.matchMedia("(min-width: 769px)");

    function isCarouselMode() {
      return !mqlDesktop.matches;
    }

    function goTo(i) {
      if (!isCarouselMode()) {
        track.style.transform = "";
        return;
      }
      index = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transform = "translate3d(-" + index * 100 + "%, 0, 0)";
    }

    viewport.addEventListener(
      "touchstart",
      function (e) {
        if (!isCarouselMode()) return;
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        isDragging = false;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (e) {
        if (!isCarouselMode()) return;
        touchDeltaX = e.touches[0].clientX - touchStartX;
        if (Math.abs(touchDeltaX) > 8) isDragging = true;
      },
      { passive: true }
    );

    viewport.addEventListener("touchend", function () {
      if (!isCarouselMode()) return;
      if (touchDeltaX < -50 && index < slides.length - 1) goTo(index + 1);
      else if (touchDeltaX > 50 && index > 0) goTo(index - 1);
      touchDeltaX = 0;
      setTimeout(function () {
        isDragging = false;
      }, 0);
    });

    track.addEventListener(
      "mousedown",
      function (e) {
        if (!isCarouselMode()) return;
        touchStartX = e.clientX;
        touchDeltaX = 0;
        isDragging = false;
      }
    );

    window.addEventListener("mousemove", function (e) {
      if (!isCarouselMode() || touchStartX === 0) return;
      touchDeltaX = e.clientX - touchStartX;
      if (Math.abs(touchDeltaX) > 8) isDragging = true;
    });

    window.addEventListener("mouseup", function () {
      if (!isCarouselMode() || touchStartX === 0) return;
      if (touchDeltaX < -50 && index < slides.length - 1) goTo(index + 1);
      else if (touchDeltaX > 50 && index > 0) goTo(index - 1);
      touchStartX = 0;
      touchDeltaX = 0;
      setTimeout(function () {
        isDragging = false;
      }, 0);
    });

    document.addEventListener(
      "click",
      function (e) {
        if (isDragging && e.target.closest("[data-bm-home-products]")) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    mqlDesktop.addEventListener("change", function () {
      goTo(index);
    });

    window.addEventListener("resize", function () {
      goTo(index);
    });

    goTo(0);
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest("[data-bm-product-id]");
    if (!card) return;

    if (e.target.closest("select, input, textarea, label")) return;

    var link = e.target.closest("a[href]");
    if (link) {
      var href = link.getAttribute("href");
      if (href && href !== "#" && href.indexOf("product.html") !== -1) return;
    }

    var id = card.getAttribute("data-bm-product-id");
    if (id) window.location.href = getProductUrl(id);
  });
})();

(function () {
  var announceTrack = document.querySelector("[data-bm-announce-track]");
  if (!announceTrack) return;

  var slides = announceTrack.querySelectorAll("[data-bm-announce-slide]");
  if (slides.length < 2) return;

  var index = 0;

  function showSlide(i) {
    index = (i + slides.length) % slides.length;
    announceTrack.style.transform = "translateX(-" + index * 100 + "%)";
  }

  document.querySelector("[data-bm-announce-prev]")?.addEventListener("click", function () {
    showSlide(index - 1);
  });

  document.querySelector("[data-bm-announce-next]")?.addEventListener("click", function () {
    showSlide(index + 1);
  });
})();

(function () {
  var header = document.querySelector(".bm-navbar");
  var toggle = document.querySelector("[data-bm-menu-toggle]");
  if (!header || !toggle) return;

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

(function () {
  var root = document.querySelector("[data-bm-hero-slider]");
  if (!root) return;

  var viewport = root.querySelector(".bm-hero__viewport");
  var track = root.querySelector("[data-bm-hero-track]");
  var slides = root.querySelectorAll("[data-bm-hero-slide]");
  if (!viewport || !track || !slides.length) return;

  var total = slides.length;
  var index = 0;
  var timerId = null;
  var intervalMs = 5000;

  function slideWidth() {
    return viewport.getBoundingClientRect().width;
  }

  function syncSlides() {
    var w = slideWidth();
    if (w <= 0) return;
    slides.forEach(function (slide) {
      slide.style.flex = "0 0 " + w + "px";
      slide.style.width = w + "px";
      slide.style.minWidth = w + "px";
    });
  }

  function goTo(i) {
    syncSlides();
    var w = slideWidth();
    index = ((i % total) + total) % total;
    if (w > 0) {
      track.style.transform = "translate3d(-" + index * w + "px, 0, 0)";
    }
  }

  function schedule() {
    if (timerId) window.clearInterval(timerId);
    if (total > 1) {
      timerId = window.setInterval(function () {
        goTo(index + 1);
      }, intervalMs);
    }
  }

  window.addEventListener("resize", function () {
    goTo(index);
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
  });

  root.addEventListener("mouseleave", schedule);

  goTo(0);
  schedule();
})();

(function () {
  var root = document.querySelector("[data-bm-offers-carousel]");
  if (!root) return;

  var viewport = root.querySelector("[data-bm-offers-viewport]");
  var track = root.querySelector("[data-bm-offers-track]");
  var dotsWrap = root.querySelector("[data-bm-offers-dots]");
  if (!viewport || !track) return;

  var slides = track.querySelectorAll(".bm-offer-card");
  if (slides.length < 2) return;

  var dots = dotsWrap ? dotsWrap.querySelectorAll("[data-bm-offers-dot]") : [];
  var index = 0;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var mqlDesktop = window.matchMedia("(min-width: 901px)");

  function isCarouselMode() {
    return !mqlDesktop.matches;
  }

  function goTo(i) {
    if (!isCarouselMode()) {
      track.style.transform = "";
      return;
    }
    index = Math.max(0, Math.min(i, slides.length - 1));
    track.style.transform = "translate3d(-" + index * 100 + "%, 0, 0)";
    dots.forEach(function (dot, di) {
      var active = di === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var i = parseInt(dot.getAttribute("data-bm-offers-dot"), 10);
      if (!isNaN(i)) goTo(i);
    });
  });

  viewport.addEventListener(
    "touchstart",
    function (e) {
      if (!isCarouselMode()) return;
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (e) {
      if (!isCarouselMode()) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", function () {
    if (!isCarouselMode()) return;
    if (touchDeltaX < -40 && index < slides.length - 1) goTo(index + 1);
    else if (touchDeltaX > 40 && index > 0) goTo(index - 1);
    touchDeltaX = 0;
  });

  mqlDesktop.addEventListener("change", function () {
    goTo(index);
  });

  goTo(0);
})();

(function () {
  var root = document.querySelector("[data-bm-cat-carousel]");
  if (!root) return;

  var viewport = root.querySelector("[data-bm-cat-viewport]");
  var track = root.querySelector("[data-bm-cat-track]");
  var prevBtn = root.querySelector("[data-bm-cat-prev]");
  var nextBtn = root.querySelector("[data-bm-cat-next]");
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  var items = track.querySelectorAll(".bm-cat__item");
  if (!items.length) return;

  var index = 0;
  var mqlMobileScroll = window.matchMedia("(max-width: 768px)");

  function isTouchScrollMode() {
    return mqlMobileScroll.matches;
  }

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap) || 28;
  }

  function getStep() {
    if (!items.length) return 0;
    return items[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var step = getStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.ceil((total - visible) / step));
  }

  function update() {
    if (isTouchScrollMode()) {
      track.style.transform = "";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    var step = getStep();
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex;
  }

  prevBtn.addEventListener("click", function () {
    if (isTouchScrollMode()) return;
    if (index > 0) {
      index -= 1;
      update();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (isTouchScrollMode()) return;
    if (index < getMaxIndex()) {
      index += 1;
      update();
    }
  });

  mqlMobileScroll.addEventListener("change", function () {
    index = 0;
    update();
  });

  window.addEventListener("resize", update);
  update();
})();

(function () {
  var root = document.querySelector("[data-bm-testimonial-slider]");
  if (!root) return;

  var viewport = root.querySelector("[data-bm-testimonial-viewport]");
  var track = root.querySelector("[data-bm-testimonial-track]");
  var cards = root.querySelectorAll("[data-bm-testimonial-card]");
  var dots = root.querySelectorAll("[data-bm-testimonial-dot]");
  var prevBtn = root.querySelector("[data-bm-testimonial-prev]");
  var nextBtn = root.querySelector("[data-bm-testimonial-next]");
  if (!viewport || !track || !cards.length) return;

  var index = 1;
  if (index >= cards.length) index = 0;

  function centerSlide(i) {
    var card = cards[i];
    if (!card) return;
    var offset =
      card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    track.style.transform = "translate3d(-" + Math.max(0, offset) + "px, 0, 0)";
  }

  function goTo(i) {
    index = ((i % cards.length) + cards.length) % cards.length;
    cards.forEach(function (card, ci) {
      card.classList.toggle("is-active", ci === index);
    });
    dots.forEach(function (dot, di) {
      var active = di === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      dot.setAttribute("tabindex", active ? "0" : "-1");
    });
    centerSlide(index);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      goTo(index - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      goTo(index + 1);
    });
  }

  dots.forEach(function (dot, di) {
    dot.addEventListener("click", function () {
      goTo(di);
    });
  });

  window.addEventListener("resize", function () {
    centerSlide(index);
  });

  goTo(index);
})();
