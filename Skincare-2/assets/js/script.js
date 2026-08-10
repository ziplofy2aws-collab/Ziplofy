(function () {
  var announceTrack = document.querySelector("[data-lv-announce-track]");
  if (!announceTrack) return;

  var slides = announceTrack.querySelectorAll("[data-lv-announce-slide]");
  if (slides.length < 2) return;

  var index = 0;

  function showSlide(next) {
    index = (next + slides.length) % slides.length;
    announceTrack.style.transform = "translateX(-" + index * 100 + "%)";
  }

  document.querySelector("[data-lv-announce-prev]")?.addEventListener("click", function () {
    showSlide(index - 1);
  });

  document.querySelector("[data-lv-announce-next]")?.addEventListener("click", function () {
    showSlide(index + 1);
  });
})();

(function () {
  var header = document.querySelector(".lv-navbar");
  var toggle = document.querySelector("[data-lv-menu-toggle]");
  if (!header || !toggle) return;

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
})();

(function () {
  var root = document.querySelector("[data-lv-hero-slider]");
  if (!root) return;

  var viewport = root.querySelector(".lv-hero__viewport");
  var track = root.querySelector("[data-lv-hero-track]");
  var slides = root.querySelectorAll("[data-lv-hero-slide]");
  var dotsWrap = root.querySelector("[data-lv-hero-dots]");
  if (!viewport || !track || !slides.length) return;

  var total = slides.length;
  var index = 0;
  var timerId = null;
  var intervalMs = 8000;
  var dots = [];

  if (dotsWrap) {
    for (var d = 0; d < total; d++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lv-hero__dot" + (d === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", "Go to slide " + (d + 1));
      btn.addEventListener(
        "click",
        (function (i) {
          return function () {
            goTo(i);
            schedule();
          };
        })(d)
      );
      dotsWrap.appendChild(btn);
      dots.push(btn);
    }
  }

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

  function syncDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function goTo(i) {
    syncSlides();
    var w = slideWidth();
    index = ((i % total) + total) % total;
    if (w > 0) {
      track.style.transform = "translate3d(-" + index * w + "px, 0, 0)";
    }
    syncDots();
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
  var root = document.querySelector("[data-lv-explore]");
  if (!root) return;

  var viewport = root.querySelector("[data-lv-explore-viewport]");
  var track = root.querySelector("[data-lv-explore-track]");
  var prevBtn = root.querySelector("[data-lv-explore-prev]");
  var nextBtn = root.querySelector("[data-lv-explore-next]");
  var filterBtns = root.querySelectorAll("[data-lv-filter]");
  if (!viewport || !track) return;

  var index = 0;
  var gap = 16;

  function visibleCards() {
    return Array.prototype.filter.call(track.children, function (card) {
      return !card.classList.contains("is-hidden");
    });
  }

  function cardStep() {
    var cards = visibleCards();
    if (!cards.length) return 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function maxIndex() {
    var cards = visibleCards();
    var step = cardStep();
    if (!cards.length || step <= 0) return 0;
    var visible = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    return Math.max(0, cards.length - visible);
  }

  function syncArrows() {
    var max = maxIndex();
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  function goTo(i) {
    var max = maxIndex();
    index = Math.max(0, Math.min(i, max));
    var step = cardStep();
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    syncArrows();
  }

  function applyFilter(tag) {
    var cards = track.querySelectorAll("[data-lv-explore-card]");
    cards.forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var show = tag === "all" || tags.indexOf(tag) !== -1;
      card.classList.toggle("is-hidden", !show);
    });
    goTo(0);
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

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      applyFilter(btn.getAttribute("data-lv-filter") || "all");
    });
  });

  window.addEventListener("resize", function () {
    goTo(index);
  });

  goTo(0);
})();

(function () {
  var root = document.querySelector("[data-lv-dsd]");
  if (!root) return;

  var viewport = root.querySelector("[data-lv-dsd-viewport]");
  var track = root.querySelector("[data-lv-dsd-track]");
  var prevBtn = root.querySelector("[data-lv-dsd-prev]");
  var nextBtn = root.querySelector("[data-lv-dsd-next]");
  if (!viewport || !track) return;

  var cards = track.querySelectorAll("[data-lv-dsd-card]");
  if (!cards.length) return;

  var index = 0;
  var gap = 16;

  function perView() {
    var w = window.innerWidth;
    if (w <= 480) return 1.35;
    if (w <= 768) return 2.2;
    if (w <= 900) return 3.2;
    if (w <= 1100) return 4.2;
    return 5;
  }

  function syncCardWidths() {
    var n = perView();
    var w = (viewport.clientWidth - gap * (n - 1)) / n;
    cards.forEach(function (card) {
      card.style.flex = "0 0 " + w + "px";
      card.style.width = w + "px";
    });
    return w + gap;
  }

  function maxIndex(step) {
    var visible = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    return Math.max(0, cards.length - visible);
  }

  function syncArrows(max) {
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  function goTo(i) {
    var step = syncCardWidths();
    var max = maxIndex(step);
    index = Math.max(0, Math.min(i, max));
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    syncArrows(max);
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

  window.addEventListener("resize", function () {
    goTo(index);
  });

  goTo(0);
})();

(function () {
  var root = document.querySelector("[data-lv-trust]");
  if (!root) return;

  var tabs = root.querySelectorAll("[data-lv-trust-tab]");
  var copyEl = root.querySelector("[data-lv-trust-copy]");
  var stat1 = root.querySelector("[data-lv-trust-stat1]");
  var label1 = root.querySelector("[data-lv-trust-label1]");
  var stat2 = root.querySelector("[data-lv-trust-stat2]");
  var label2 = root.querySelector("[data-lv-trust-label2]");
  var promo = root.querySelector("[data-lv-trust-promo]");
  if (!tabs.length) return;

  var data = [
    {
      copy:
        "The Anti-Dandruff Shampoo & Conditioner duo combines Ketoconazole and Nano-Climbazole to reduce flakes, soothe itching, and hydrate hair.",
      stat1: "100%",
      label1: "100% Reduction in Dandruff Causing Fungus",
      stat2: "98%",
      label2: "Relief from Itchiness in 1 Wash",
      promo: "Add 4 more to unlock Buy 2 Get 2 + 2 freebies"
    },
    {
      copy:
        "Acne Spot Corrector Gel targets active breakouts with salicylic acid and niacinamide to calm redness and clear spots fast.",
      stat1: "93%",
      label1: "Visible Spot Reduction in 6 Hours",
      stat2: "91%",
      label2: "Said Skin Looked Calmer Overnight",
      promo: "Add 3 more to unlock free shipping + freebie"
    },
    {
      copy:
        "Blackhead Melting Water gently dissolves congestion with mild acids and cica to unclog pores and smooth texture without stripping.",
      stat1: "95%",
      label1: "Reported Fewer Blackheads in 2 Weeks",
      stat2: "89%",
      label2: "Said Skin Felt Softer After 1 Use",
      promo: "Buy 2 Get 1 free on pore care essentials"
    },
    {
      copy:
        "Berry Bright Sunscreen delivers lightweight SPF protection with niacinamide to brighten dull skin while staying sweat and water resistant.",
      stat1: "97%",
      label1: "Agreed Finish Felt Non-Greasy",
      stat2: "92%",
      label2: "Said Skin Looked Brighter in 4 Weeks",
      promo: "Add 2 sunscreens to unlock gift mini"
    }
  ];

  function setActive(i) {
    var item = data[i] || data[0];
    tabs.forEach(function (tab, idx) {
      var on = idx === i;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (copyEl) copyEl.textContent = item.copy;
    if (stat1) stat1.textContent = item.stat1;
    if (label1) label1.textContent = item.label1;
    if (stat2) stat2.textContent = item.stat2;
    if (label2) label2.textContent = item.label2;
    if (promo) promo.textContent = item.promo;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var i = parseInt(tab.getAttribute("data-lv-trust-tab"), 10) || 0;
      setActive(i);
    });
  });
})();

(function () {
  var root = document.querySelector("[data-lv-reviews]");
  if (!root) return;

  var viewport = root.querySelector("[data-lv-reviews-viewport]");
  var track = root.querySelector("[data-lv-reviews-track]");
  var prevBtn = root.querySelector("[data-lv-reviews-prev]");
  var nextBtn = root.querySelector("[data-lv-reviews-next]");
  var cards = root.querySelectorAll("[data-lv-reviews-card]");
  if (!viewport || !track || !cards.length) return;

  var index = 0;
  var gap = 28;

  function perView() {
    var w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function syncLayout() {
    gap = window.innerWidth <= 900 ? 20 : 28;
    var n = perView();
    var cardW = (viewport.clientWidth - gap * (n - 1)) / n;
    cards.forEach(function (card) {
      card.style.flex = "0 0 " + cardW + "px";
      card.style.width = cardW + "px";
    });
    return cardW + gap;
  }

  function maxIndex(step) {
    var visible = Math.max(1, Math.round(viewport.clientWidth / step));
    return Math.max(0, cards.length - visible);
  }

  function syncArrows(max) {
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  function goTo(i) {
    var step = syncLayout();
    var max = maxIndex(step);
    index = Math.max(0, Math.min(i, max));
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    syncArrows(max);
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

  window.addEventListener("resize", function () {
    goTo(index);
  });

  goTo(0);
})();

/* Product card → product detail page */
(function () {
  document.addEventListener("click", function (e) {
    var trustShop = e.target.closest(".lv-trust__shop");
    if (trustShop) {
      var trustItem = trustShop.closest("[data-lv-product-id]");
      if (trustItem) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href =
          "product.html?id=" + encodeURIComponent(trustItem.getAttribute("data-lv-product-id"));
        return;
      }
    }

    var card = e.target.closest(".lv-pcard[data-lv-product-id]");
    if (!card) return;
    window.location.href =
      "product.html?id=" + encodeURIComponent(card.getAttribute("data-lv-product-id"));
  });
})();
