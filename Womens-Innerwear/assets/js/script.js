/**
 * Savante — Women's Innerwear (single bundle)
 * Each block runs in its own IIFE so variables/listeners never clash.
 */

(function initSavHeaderNav() {
  var header = document.getElementById("savHeader");
  var toggle = document.getElementById("savNavToggle");
  if (!header || !toggle) return;

  function setOpen(open) {
    header.classList.toggle("is-nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-nav-open"));
  });

  window.addEventListener(
    "resize",
    function () {
      if (window.matchMedia("(min-width: 901px)").matches) {
        setOpen(false);
      }
    },
    { passive: true }
  );
})();

(function initSavAnnounceSlider() {
  var root = document.querySelector("[data-sav-announce]");
  if (!root) return;

  var track = root.querySelector("[data-sav-announce-track]");
  if (!track) return;

  var slides = track.children;
  var n = slides.length;
  if (n === 0) return;

  var index = 0;
  var intervalMs = 4500;
  var timer = null;
  var mqDesktop = window.matchMedia("(min-width: 1025px)");

  function setTabOrder() {
    for (var j = 0; j < n; j++) {
      var active = j === index;
      slides[j].setAttribute("aria-hidden", active ? "false" : "true");
      var links = slides[j].querySelectorAll("a");
      for (var k = 0; k < links.length; k++) {
        if (active) links[k].removeAttribute("tabindex");
        else links[k].setAttribute("tabindex", "-1");
      }
    }
  }

  function applyTransform() {
    var pct = (100 * index) / n;
    track.style.transform = "translateX(-" + pct + "%)";
    setTabOrder();
  }

  function next() {
    index = (index + 1) % n;
    applyTransform();
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    if (mqDesktop.matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = window.setInterval(next, intervalMs);
  }

  applyTransform();
  start();

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) start();
  });

  window.addEventListener(
    "resize",
    function () {
      if (mqDesktop.matches) {
        stop();
        track.style.transform = "";
        for (var j = 0; j < n; j++) {
          slides[j].removeAttribute("aria-hidden");
          var links = slides[j].querySelectorAll("a");
          for (var k = 0; k < links.length; k++) links[k].removeAttribute("tabindex");
        }
      } else {
        index = 0;
        applyTransform();
        start();
      }
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });
})();

(function initSavFooterTabs() {
  var footer = document.querySelector(".sav-footer");
  if (!footer) return;

  var cols = footer.querySelectorAll(".sav-footer__grid > .sav-footer__col");
  if (!cols || cols.length < 4) return;

  var tabCols = Array.prototype.slice.call(cols, 0, 4);
  var mqMobile = window.matchMedia("(max-width: 720px)");

  function activate(col) {
    tabCols.forEach(function (c) {
      var isActive = c === col;
      c.classList.toggle("is-tab-active", isActive);
      var heading = c.querySelector(".sav-footer__heading");
      var list = c.querySelector(".sav-footer__list");
      if (heading) {
        heading.setAttribute("aria-selected", isActive ? "true" : "false");
        heading.setAttribute("tabindex", isActive ? "0" : "-1");
      }
      if (list) list.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  var isBound = false;

  function bind() {
    if (isBound) return;
    tabCols.forEach(function (c) {
      var heading = c.querySelector(".sav-footer__heading");
      if (!heading) return;
      heading.addEventListener("click", function () {
        if (!mqMobile.matches) return;
        activate(c);
      });
      heading.addEventListener("keydown", function (e) {
        if (!mqMobile.matches) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(c);
        }
      });
    });
    isBound = true;
  }

  function applyMobileSemantics() {
    if (!mqMobile.matches) return;
    tabCols.forEach(function (c, i) {
      var heading = c.querySelector(".sav-footer__heading");
      if (!heading) return;
      heading.setAttribute("role", "tab");
      heading.setAttribute("tabindex", i === 0 ? "0" : "-1");
      heading.setAttribute("aria-selected", i === 0 ? "true" : "false");
    });
    activate(tabCols[0]);
  }

  function resetDesktop() {
    if (mqMobile.matches) return;
    tabCols.forEach(function (c) {
      c.classList.remove("is-tab-active");
      var heading = c.querySelector(".sav-footer__heading");
      var list = c.querySelector(".sav-footer__list");
      if (heading) {
        heading.removeAttribute("role");
        heading.removeAttribute("tabindex");
        heading.removeAttribute("aria-selected");
      }
      if (list) list.removeAttribute("aria-hidden");
    });
  }

  bind();
  applyMobileSemantics();
  resetDesktop();

  window.addEventListener(
    "resize",
    function () {
      resetDesktop();
      applyMobileSemantics();
    },
    { passive: true }
  );
})();

(function initSavHeroCarousel() {
  var root = document.querySelector("[data-sav-hero]");
  if (!root) return;

  var track = root.querySelector("[data-sav-hero-track]");
  var slides = root.querySelectorAll("[data-sav-hero-slide]");
  var dots = root.querySelectorAll("[data-sav-hero-dot]");
  var prev = root.querySelector("[data-sav-hero-prev]");
  var next = root.querySelector("[data-sav-hero-next]");
  var line1El = root.querySelector("[data-sav-hero-line1]");
  var line2El = root.querySelector("[data-sav-hero-line2]");
  var total = slides.length;
  if (!track || total === 0) return;

  var index = 0;
  var autoplayMs = 6000;
  var timerId = null;

  function syncHeadline() {
    var slide = slides[index];
    if (!slide || !line1El || !line2El) return;
    var l1 = slide.getAttribute("data-hero-line1");
    var l2 = slide.getAttribute("data-hero-line2");
    if (l1) line1El.textContent = l1;
    if (l2) line2El.textContent = l2;
  }

  function goTo(i) {
    index = ((i % total) + total) % total;
    var pct = (100 * index) / total;
    track.style.transform = "translateX(-" + pct + "%)";
    slides.forEach(function (el, j) {
      el.classList.toggle("is-active", j === index);
    });
    dots.forEach(function (dot, j) {
      dot.classList.toggle("is-active", j === index);
      dot.setAttribute("aria-selected", j === index ? "true" : "false");
    });
    syncHeadline();
  }

  function nextSlide() {
    goTo(index + 1);
  }

  function prevSlide() {
    goTo(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timerId = window.setInterval(nextSlide, autoplayMs);
  }

  function stopAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  if (next) {
    next.addEventListener("click", function () {
      nextSlide();
      startAutoplay();
    });
  }
  if (prev) {
    prev.addEventListener("click", function () {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach(function (dot, j) {
    dot.addEventListener("click", function () {
      goTo(j);
      startAutoplay();
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  goTo(0);
  startAutoplay();
})();

(function initSavTrendingCarousel() {
  var root = document.querySelector("[data-sav-trend]");
  if (!root) return;

  var viewport = root.querySelector("[data-trend-viewport]");
  var track = root.querySelector("[data-trend-track]");
  var prevBtn = root.querySelector("[data-trend-prev]");
  var nextBtn = root.querySelector("[data-trend-next]");
  var filters = root.querySelectorAll("[data-trend-filter]");

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  var PRODUCTS = [
    {
      brand: "Zivame",
      title: "Padded Wired T-shirt Bra",
      price: 440,
      oldPrice: 1099,
      sold: "440 sold weekly",
      category: "bras",
      img: "./assets/img/TN-1.webp",
    },
    {
      brand: "Zelocity",
      title: "High-Waist Cotton Hipster Pack of 3",
      price: 599,
      oldPrice: 899,
      sold: "312 sold weekly",
      category: "panties",
      img: "./assets/img/TN-2.webp",
    },
    {
      brand: "Savante",
      title: "Lace Trim Camisole — Everyday Comfort",
      price: 520,
      oldPrice: null,
      sold: "128 sold weekly",
      category: "nightwear",
      img: "./assets/img/TN-3.webp",
    },
    {
      brand: "Zivame",
      title: "Wirefree Full Coverage Bra",
      price: 399,
      oldPrice: 799,
      sold: "890 sold weekly",
      category: "bras",
      img: "./assets/img/TN-4.webp",
    },
    {
      brand: "Zelocity",
      title: "Seamless Shapewear Shorts",
      price: 649,
      oldPrice: 1299,
      sold: "210 sold weekly",
      category: "shapewear",
      img: "./assets/img/TN-5.webp",
    },
    {
      brand: "Savante",
      title: "Quick-Dry Sports Bra Medium Impact",
      price: 799,
      oldPrice: 1199,
      sold: "556 sold weekly",
      category: "activewear",
      img: "./assets/img/TN-6.webp",
    },
    {
      brand: "Zivame",
      title: "Printed Cotton Briefs Set of 5",
      price: 349,
      oldPrice: 699,
      sold: "1200+ sold weekly",
      category: "panties",
      img: "./assets/img/TN-7.webp",
    },
    {
      brand: "Savante",
      title: "Satin Short Nightdress With Robe",
      price: 1299,
      oldPrice: 2499,
      sold: "95 sold weekly",
      category: "nightwear",
      img: "./assets/img/TN-8.webp",
    },
    {
      brand: "Zelocity",
      title: "Racerback Active Tank — Moisture Wicking",
      price: 449,
      oldPrice: null,
      sold: "403 sold weekly",
      category: "activewear",
      img: "./assets/img/TN-9.webp",
    },
    {
      brand: "Zivame",
      title: "Tummy Tucker High Rise Panel Brief",
      price: 499,
      oldPrice: 999,
      sold: "267 sold weekly",
      category: "shapewear",
      img: "./assets/img/TN-2.webp",
    },
    {
      brand: "Savante",
      title: "Non-Padded Non-Wired Everyday Bra",
      price: 359,
      oldPrice: 649,
      sold: "720 sold weekly",
      category: "bras",
      img: "./assets/img/TN-4.webp",
    },
    {
      brand: "Zelocity",
      title: "Hipster Period Panty — Leak Proof Lining",
      price: 699,
      oldPrice: 999,
      sold: "188 sold weekly",
      category: "panties",
      img: "./assets/img/TN-1.webp",
    },
  ];

  PRODUCTS.forEach(function (p, i) {
    p.id = "trend-" + i;
  });

  var activeFilter = "all";

  function formatRu(n) {
    return "₹" + n.toLocaleString("en-IN");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHtml(p) {
    var old =
      p.oldPrice != null
        ? '<span class="sav-trend__price-old">' + formatRu(p.oldPrice) + "</span>"
        : "";
    return (
      '<article class="sav-trend__card">' +
      '<a class="sav-trend__hit" href="product.html?p=' +
      escapeHtml(p.id) +
      '" aria-label="' +
      escapeHtml("View " + p.title) +
      '"></a>' +
      '<div class="sav-trend__media">' +
      '<img src="' +
      escapeHtml(p.img) +
      '" width="400" height="533" alt="' +
      escapeHtml(p.title) +
      '" loading="lazy" />' +
      '<button type="button" class="sav-trend__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      '<div class="sav-trend__price-pill">' +
      '<span class="sav-trend__price-current">' +
      formatRu(p.price) +
      "</span>" +
      old +
      "</div></div>" +
      '<div class="sav-trend__body">' +
      '<p class="sav-trend__brand">' +
      escapeHtml(p.brand) +
      "</p>" +
      '<p class="sav-trend__desc">' +
      escapeHtml(p.title) +
      "</p>" +
      '<p class="sav-trend__sold"><i class="fa-solid fa-bolt" aria-hidden="true"></i> ' +
      escapeHtml(p.sold) +
      "</p></div></article>"
    );
  }

  function filtered() {
    if (activeFilter === "all") return PRODUCTS.slice();
    return PRODUCTS.filter(function (p) {
      return p.category === activeFilter;
    });
  }

  function render() {
    var list = filtered();
    track.innerHTML = list.map(cardHtml).join("");
    viewport.scrollLeft = 0;
    bindWishlist();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(updateNavState);
    });
  }

  function stepSize() {
    var first = track.querySelector(".sav-trend__card");
    if (!first) return 232;
    var tStyle = getComputedStyle(track);
    var gap = parseFloat(tStyle.gap || tStyle.columnGap || "16") || 16;
    return first.getBoundingClientRect().width + gap;
  }

  function scrollByCards(dir) {
    viewport.scrollBy({ left: dir * stepSize(), behavior: "smooth" });
  }

  function updateNavState() {
    var max = viewport.scrollWidth - viewport.clientWidth - 2;
    prevBtn.disabled = viewport.scrollLeft <= 2;
    nextBtn.disabled = viewport.scrollLeft >= max;
  }

  function bindWishlist() {
    track.querySelectorAll(".sav-trend__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle("is-liked");
        var icon = btn.querySelector("i");
        if (icon) {
          icon.className = btn.classList.contains("is-liked")
            ? "fa-solid fa-heart"
            : "fa-regular fa-heart";
        }
      });
    });
  }

  prevBtn.addEventListener("click", function () {
    scrollByCards(-1);
  });

  nextBtn.addEventListener("click", function () {
    scrollByCards(1);
  });

  viewport.addEventListener("scroll", function () {
    window.requestAnimationFrame(updateNavState);
  });

  window.addEventListener(
    "resize",
    function () {
      updateNavState();
    },
    { passive: true }
  );

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-trend-filter") || "all";
      activeFilter = f;
      filters.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      render();
    });
  });

  render();
})();

(function initSavBondedCarousel() {
  var root = document.querySelector("[data-sav-bonded]");
  if (!root) return;

  var leftEl = root.querySelector("[data-bonded-left]");
  var centerEl = root.querySelector("[data-bonded-center]");
  var rightEl = root.querySelector("[data-bonded-right]");
  var dotsWrap = root.querySelector("[data-bonded-dots]");
  var prevBtn = root.querySelector("[data-bonded-prev]");
  var nextBtn = root.querySelector("[data-bonded-next]");

  if (!leftEl || !centerEl || !rightEl || !dotsWrap || !prevBtn || !nextBtn) return;

  var SLIDES = [
    {
      tagline: "From seamless to flawless.",
      title: "SHAPEWEAR",
      img: "./assets/img/cat-1.png",
    },
    {
      tagline: "From balance to brilliance.",
      title: "LOUNGE & YOGA BRAS",
      img: "./assets/img/cat-2.png",
    },
    {
      tagline: "From laptops to rooftops.",
      title: "LOUNGE BRAS",
      img: "./assets/img/cat-3.png",
    },
  ];

  var n = SLIDES.length;
  var index = 1;

  function mod(i) {
    return ((i % n) + n) % n;
  }

  function fillCard(article, slide) {
    var img = article.querySelector("[data-bonded-img]");
    var tag = article.querySelector("[data-bonded-tag]");
    var cat = article.querySelector("[data-bonded-cat]");
    if (img) {
      img.alt = slide.title + " — " + slide.tagline;
      img.src = slide.img;
    }
    if (tag) tag.textContent = slide.tagline;
    if (cat) cat.textContent = slide.title;
  }

  function render() {
    var iL = mod(index - 1);
    var iC = mod(index);
    var iR = mod(index + 1);
    fillCard(leftEl, SLIDES[iL]);
    fillCard(centerEl, SLIDES[iC]);
    fillCard(rightEl, SLIDES[iR]);

    dotsWrap.querySelectorAll("[data-bonded-dot]").forEach(function (dot, j) {
      dot.classList.toggle("is-active", j === index);
      dot.setAttribute("aria-selected", j === index ? "true" : "false");
    });
  }

  function go(delta) {
    index = mod(index + delta);
    render();
  }

  function goTo(i) {
    index = mod(i);
    render();
  }

  prevBtn.addEventListener("click", function () {
    go(-1);
  });

  nextBtn.addEventListener("click", function () {
    go(1);
  });

  dotsWrap.querySelectorAll("[data-bonded-dot]").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var j = parseInt(dot.getAttribute("data-bonded-dot"), 10);
      if (!isNaN(j)) goTo(j);
    });
  });

  root.querySelectorAll("[data-bonded-explore]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      go(1);
    });
  });

  render();
})();

(function initSavNewArrivalCarousel() {
  var root = document.querySelector("[data-sav-newarr]");
  if (!root) return;

  var viewport = root.querySelector("[data-newarr-viewport]");
  var track = root.querySelector("[data-newarr-track]");
  var prevBtn = root.querySelector("[data-newarr-prev]");
  var nextBtn = root.querySelector("[data-newarr-next]");

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  var PRODUCTS = [
    {
      title: "Femme Lace Bikini Panty — Green Heron",
      price: 1895,
      img: "assets/img/NA-2.WEBP",
      colors: ["#2d4a3e", "#1a1a1a", "#8b7355"],
    },
    {
      title: "Seamless Wired T-Shirt Bra — Rose Dust",
      price: 1499,
      img: "assets/img/NA-3.WEBP",
      colors: ["#c4a4a4", "#333", "#e8dcc8"],
    },
    {
      title: "Cotton Hipster Pack of 3 — Earth",
      price: 899,
      img: "assets/img/NA-4.WEBP",
      colors: ["#6b4423", "#3d2914", "#8f7e6a"],
    },
    {
      title: "High-Waist Shaping Brief — Black",
      price: 1299,
      img: "assets/img/NA-5.WEBP",
      colors: ["#111", "#4a4a4a"],
    },
    {
      title: "Lace Trim Camisole — Ivory",
      price: 999,
      img: "assets/img/NA-6.WEBP",
      colors: ["#f5f0e8", "#d4c4b0", "#2a2a2a"],
    },
    {
      title: "Sports Bra Medium Support — Olive",
      price: 1199,
      img: "assets/img/NA-7.WEBP",
      colors: ["#5c6b4a", "#2f3328"],
    },
  ];

  PRODUCTS.forEach(function (p, i) {
    p.id = "newarr-" + i;
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPrice(n) {
    return "MRP ₹ " + n.toLocaleString("en-IN");
  }

  function swatchesHtml(colors) {
    return colors
      .map(function (c) {
        return '<span class="sav-newarr__swatch" style="background:' + escapeHtml(c) + '" title=""></span>';
      })
      .join("");
  }

  function cardHtml(p) {
    return (
      '<article class="sav-newarr__card">' +
      '<a class="sav-newarr__hit" href="product.html?p=' +
      escapeHtml(p.id) +
      '" aria-label="' +
      escapeHtml("View " + p.title) +
      '"></a>' +
      '<div class="sav-newarr__card-media">' +
      '<img src="' +
      escapeHtml(p.img) +
      '" width="400" height="480" alt="' +
      escapeHtml(p.title) +
      '" loading="lazy" />' +
      '<button type="button" class="sav-newarr__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button></div>' +
      '<div class="sav-newarr__card-body">' +
      '<p class="sav-newarr__brand">Savante</p>' +
      '<h3 class="sav-newarr__card-title">' +
      escapeHtml(p.title) +
      "</h3>" +
      '<p class="sav-newarr__price">' +
      formatPrice(p.price) +
      "</p>" +
      '<div class="sav-newarr__swatches">' +
      swatchesHtml(p.colors) +
      "</div>" +
      '<button type="button" class="sav-newarr__cart" aria-label="Add to cart">' +
      '<i class="fa-solid fa-bag-shopping" aria-hidden="true"></i></button></div></article>'
    );
  }

  function render() {
    track.innerHTML = PRODUCTS.map(cardHtml).join("");
    viewport.scrollLeft = 0;
    bindCardActions();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(updateNav);
    });
  }

  function stepSize() {
    var card = track.querySelector(".sav-newarr__card");
    if (!card) return 238;
    var gap =
      parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;
    return card.getBoundingClientRect().width + gap;
  }

  function updateNav() {
    var max = viewport.scrollWidth - viewport.clientWidth - 2;
    prevBtn.disabled = viewport.scrollLeft <= 2;
    nextBtn.disabled = viewport.scrollLeft >= max;
  }

  function bindCardActions() {
    track.querySelectorAll(".sav-newarr__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle("is-liked");
        var icon = btn.querySelector("i");
        if (icon) {
          icon.className = btn.classList.contains("is-liked") ? "fa-solid fa-heart" : "fa-regular fa-heart";
        }
      });
    });
  }

  prevBtn.addEventListener("click", function () {
    viewport.scrollBy({ left: -stepSize(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", function () {
    viewport.scrollBy({ left: stepSize(), behavior: "smooth" });
  });

  viewport.addEventListener(
    "scroll",
    function () {
      window.requestAnimationFrame(updateNav);
    },
    { passive: true }
  );

  window.addEventListener("resize", updateNav, { passive: true });

  render();
})();

(function initSavPgridProductLinks() {
  document.querySelectorAll(".sav-pgrid__card[data-sav-product-id]").forEach(function (card) {
    if (card.querySelector(".sav-pgrid__hit")) return;
    var id = card.getAttribute("data-sav-product-id");
    if (!id) return;
    var a = document.createElement("a");
    a.className = "sav-pgrid__hit";
    a.href = "product.html?p=" + encodeURIComponent(id);
    a.setAttribute("aria-label", "View product details");
    card.insertBefore(a, card.firstChild);
  });
})();

(function initSavProductGridThumbs() {
  document.querySelectorAll(".sav-pgrid__card").forEach(function (card) {
    var media = card.querySelector(".sav-pgrid__media");
    var mainImg = media && media.querySelector("img");
    var wrap = card.querySelector(".sav-pgrid__thumbs");
    if (!mainImg || !wrap) return;

    var thumbs = wrap.querySelectorAll(".sav-pgrid__thumb");

    function thumbSrc(btn) {
      var im = btn.querySelector("img");
      return im ? im.getAttribute("src") || "" : "";
    }

    function activeThumbSrc() {
      var active = wrap.querySelector(".sav-pgrid__thumb.is-active");
      return active ? thumbSrc(active) : mainImg.getAttribute("src") || "";
    }

    var hoverSrc = thumbs.length >= 2 ? thumbSrc(thumbs[1]) : "";
    if (hoverSrc) {
      var pre = new Image();
      pre.src = hoverSrc;
    }

    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        wrap.querySelectorAll(".sav-pgrid__thumb").forEach(function (t) {
          t.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        var src = thumbSrc(btn);
        if (src) mainImg.src = src;
      });
    });

    if (media && hoverSrc) {
      media.addEventListener("mouseenter", function () {
        mainImg.src = hoverSrc;
      });
      media.addEventListener("mouseleave", function () {
        var back = activeThumbSrc();
        if (back) mainImg.src = back;
      });
    }
  });
})();

(function initSavReviewsSlider() {
  var root = document.querySelector("[data-sav-reviews]");
  if (!root) return;

  var track = root.querySelector("[data-reviews-track]");
  var slides = root.querySelectorAll("[data-reviews-slide]");
  var prevBtn = root.querySelector("[data-reviews-prev]");
  var nextBtn = root.querySelector("[data-reviews-next]");

  if (!track || !prevBtn || !nextBtn || slides.length === 0) return;

  var total = slides.length;
  var index = 0;

  function goTo(i) {
    index = ((i % total) + total) % total;
    var pct = (100 * index) / total;
    track.style.transform = "translateX(-" + pct + "%)";
  }

  prevBtn.addEventListener("click", function () {
    goTo(index - 1);
  });

  nextBtn.addEventListener("click", function () {
    goTo(index + 1);
  });

  goTo(0);
})();

(function initSavScrollTop() {
  document.querySelectorAll("[data-scroll-top]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
})();

(function initSavContactStores() {
  var root = document.querySelector("[data-sav-contact-stores]");
  if (!root) return;

  var stores = [
    {
      name: "Savvyy@Lajpat Nagar (Flagship Store)",
      address:
        "Shop No. 50, Central Market, Lajpat Nagar II, Lajpat Nagar, New Delhi, Delhi 110024",
      tel: "+918448393767",
      telDisplay: "84483 93767",
      email: "support@savvyy.in",
      img: "assets/img/shop-banner.png",
      imgAlt: "Savvyy flagship store interior at Lajpat Nagar, New Delhi",
    },
    {
      name: "Savvyy@Bengaluru (Indiranagar)",
      address:
        "Shop No. 8, 100 Feet Road, Near Metro Pillar 78, Indiranagar, Bengaluru, Karnataka 560038",
      tel: "+919876543210",
      telDisplay: "98765 43210",
      email: "support@savvyy.in",
      img: "assets/img/banner-2.png",
      imgAlt: "Savvyy store interior at Indiranagar, Bengaluru",
    },
  ];

  var nameEl = root.querySelector("[data-sav-store-name]");
  var addrEl = root.querySelector("[data-sav-store-address]");
  var telEl = root.querySelector("[data-sav-store-tel]");
  var mailEl = root.querySelector("[data-sav-store-mail]");
  var imgEl = root.querySelector("[data-sav-store-img]");
  var prevBtn = root.querySelector("[data-sav-store-prev]");
  var nextBtn = root.querySelector("[data-sav-store-next]");

  if (!nameEl || !addrEl || !telEl || !mailEl || !imgEl || !prevBtn || !nextBtn) return;

  var total = stores.length;
  var index = 0;

  function render() {
    var s = stores[index];
    nameEl.textContent = s.name;
    addrEl.textContent = s.address;
    telEl.textContent = s.telDisplay;
    telEl.setAttribute("href", "tel:" + s.tel.replace(/\s/g, ""));
    mailEl.textContent = s.email;
    mailEl.setAttribute("href", "mailto:" + s.email);
    imgEl.src = s.img;
    imgEl.alt = s.imgAlt;
  }

  function go(delta) {
    index = (index + delta + total) % total;
    render();
  }

  prevBtn.addEventListener("click", function () {
    go(-1);
  });
  nextBtn.addEventListener("click", function () {
    go(1);
  });

  render();
})();

(function initSavJournalInfinite() {
  var root = document.querySelector("[data-sav-journal]");
  if (!root) return;

  var grid = root.querySelector("[data-sav-journal-grid]");
  var sentinel = root.querySelector("[data-sav-journal-sentinel]");
  var statusEl = root.querySelector("[data-sav-journal-status]");
  if (!grid || !sentinel) return;

  var posts = [
    {
      href: "#",
      img: "assets/img/category-1.WEBP",
      alt: "Woman wearing everyday innerwear",
      title: "10 Must-Have Innerwear For Women",
      excerpt:
        "Build a drawer that covers workdays, workouts, and nights in with breathable fabrics and fits that stay comfortable from morning to night.",
    },
    {
      href: "#",
      img: "assets/img/category-2.WEBP",
      alt: "Person reviewing bra styles on a tablet",
      title: "Complete Push-Up Bra Guide: Push-Up Bra Benefits & Uses",
      excerpt:
        "Understand padding levels, wiring options, and when a gentle lift flatters your silhouette without compromising on comfort or support.",
    },
    {
      href: "#",
      img: "assets/img/category-3.WEBP",
      alt: "Group in sports bras after a workout",
      title: "Types Of Sports Bras For A Fitter You",
      excerpt:
        "From compression to encapsulation, learn which bra type matches high-impact training versus yoga so you can move with confidence.",
    },
    {
      href: "#",
      img: "assets/img/shapewear.png",
      alt: "Minimal lingerie styling",
      title: "What Is A Thong?",
      excerpt:
        "A quick primer on coverage, visible lines, and fabrics that feel invisible under fitted trousers and evening silhouettes.",
    },
    {
      href: "#",
      img: "assets/img/cotton-panties.png",
      alt: "Bras displayed on hangers",
      title: "What Is A Bra Cup Size And How To Find Your Correct Size?",
      excerpt:
        "Measure at home, decode sister sizing, and spot signs your cups or band are doing too much—or too little—work for your shape.",
    },
    {
      href: "#",
      img: "assets/img/layering.png",
      alt: "Two bra styles side by side",
      title: "Bra vs Bralette: Comfort, Style & Support Compared",
      excerpt:
        "See how structure, straps, and fabrics differ so you can choose the right piece for lounging, layering, or light support days.",
    },
    {
      href: "#",
      img: "assets/img/banner-2.png",
      alt: "Savante retail display",
      title: "How To Care For Delicates So They Last",
      excerpt:
        "Cold washes, mesh bags, and drying habits that protect lace, elastic, and underwire through dozens of wears.",
    },
    {
      href: "#",
      img: "assets/img/category-2.WEBP",
      alt: "Soft innerwear folded neatly",
      title: "Fabric Guide: Cotton, Modal, And Microfiber",
      excerpt:
        "Match fibre blends to climate and activity—breathability where you need it and smooth finishes where fabric shows through.",
    },
    {
      href: "#",
      img: "assets/img/category-1.WEBP",
      alt: "Everyday bra in neutral tone",
      title: "T-Shirt Bras: What To Look For",
      excerpt:
        "Seam placement, moulding, and colour choices that disappear under knits and tailored shirts for a clean everyday line.",
    },
    {
      href: "#",
      img: "assets/img/category-3.WEBP",
      alt: "Athleisure inner layer",
      title: "Layering Camis And Slips Without Bulk",
      excerpt:
        "Lengths, necklines, and weights that smooth without adding heat—ideal under dresses and lightweight tops.",
    },
    {
      href: "#",
      img: "assets/img/shapewear.png",
      alt: "Shapewear on mannequin",
      title: "Shapewear Compression Levels Explained",
      excerpt:
        "Light smoothing versus firm control: where each level works best and how to avoid rolling at the waist or thighs.",
    },
    {
      href: "#",
      img: "assets/img/cotton-panties.png",
      alt: "Colourful everyday basics",
      title: "Building A Neutral Basics Capsule",
      excerpt:
        "Three colours that work under most outfits and how to stagger replacements so your essentials never run out at once.",
    },
    {
      href: "#",
      img: "assets/img/layering.png",
      alt: "Loungewear set flat lay",
      title: "Sleepwear Fabrics For Warm Nights",
      excerpt:
        "Loose cuts and moisture-friendly blends that keep you cool when the thermostat—or the season—runs high.",
    },
    {
      href: "#",
      img: "assets/img/category-1.WEBP",
      alt: "Strap adjustment detail",
      title: "Strap Slipping? Common Causes And Fixes",
      excerpt:
        "Band fit, strap material, and hook position often matter more than tightening alone—here is what to adjust first.",
    },
    {
      href: "#",
      img: "assets/img/banner-2.png",
      alt: "Store fitting area",
      title: "What To Expect At A Professional Bra Fitting",
      excerpt:
        "How long it takes, what to bring, and how to communicate the support and shape you want before you try styles on.",
    },
  ];

  var loaded = 0;
  var initialCount = 6;
  var batchSize = 3;
  var loading = false;
  var io;

  function createCard(post, index) {
    var art = document.createElement("article");
    art.className = "sav-journal-card";
    art.setAttribute("role", "article");
    var row = Math.floor(index / 3);
    if (row % 2 === 1) {
      art.classList.add("sav-journal-card--bw");
    }

    var a = document.createElement("a");
    a.className = "sav-journal-card__link";
    a.href = post.href;

    var media = document.createElement("div");
    media.className = "sav-journal-card__media";
    var img = document.createElement("img");
    img.src = post.img;
    img.alt = post.alt;
    img.width = 640;
    img.height = 360;
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);

    var h = document.createElement("h2");
    h.className = "sav-journal-card__title";
    h.textContent = post.title;

    var ex = document.createElement("p");
    ex.className = "sav-journal-card__excerpt";
    var kw = document.createElement("span");
    kw.className = "sav-journal-card__kw";
    kw.textContent = "Key Takeaways ";
    ex.appendChild(kw);
    ex.appendChild(document.createTextNode(post.excerpt + " …"));

    var more = document.createElement("span");
    more.className = "sav-journal-card__more";
    more.textContent = "Read more";

    a.appendChild(media);
    a.appendChild(h);
    a.appendChild(ex);
    a.appendChild(more);
    art.appendChild(a);
    return art;
  }

  function appendNext(n) {
    var frag = document.createDocumentFragment();
    var end = Math.min(loaded + n, posts.length);
    var i;
    for (i = loaded; i < end; i++) {
      frag.appendChild(createCard(posts[i], i));
    }
    loaded = end;
    grid.appendChild(frag);
  }

  function setBusy(busy) {
    grid.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function finish() {
    if (io) {
      io.disconnect();
    }
    if (statusEl) {
      statusEl.textContent = "You've reached the end of the journal.";
    }
  }

  function checkStillAtBottom() {
    if (loading || loaded >= posts.length) return;
    var rect = sentinel.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.top < vh + 280) {
      tryLoadMore();
    }
  }

  function tryLoadMore() {
    if (loading || loaded >= posts.length) return;
    loading = true;
    setBusy(true);
    window.setTimeout(function () {
      appendNext(batchSize);
      loading = false;
      setBusy(false);
      if (loaded >= posts.length) {
        finish();
      } else {
        window.requestAnimationFrame(checkStillAtBottom);
      }
    }, 180);
  }

  appendNext(initialCount);
  window.requestAnimationFrame(checkStillAtBottom);

  if (loaded >= posts.length) {
    finish();
    return;
  }

  io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target === sentinel) {
          tryLoadMore();
        }
      });
    },
    { root: null, rootMargin: "240px 0px", threshold: 0 }
  );

  io.observe(sentinel);
})();
