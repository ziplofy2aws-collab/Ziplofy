(function () {
  "use strict";

  var toggle = document.querySelector("[data-fh-toggle]");
  var nav = document.getElementById("fh-mobile-nav");

  if (!toggle || !nav) return;

  var overlay = document.createElement("div");
  overlay.className = "fh-nav__overlay";
  document.body.appendChild(overlay);

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "fh-nav__close";
  closeBtn.setAttribute("aria-label", "Close menu");
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
  nav.appendChild(closeBtn);

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("fh-nav__list--open", open);
    overlay.classList.toggle("is-visible", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  overlay.addEventListener("click", function () {
    setOpen(false);
  });

  closeBtn.addEventListener("click", function () {
    setOpen(false);
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest(".fh-nav__link")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();

/* ===== Hero slider ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fh-track]");
  if (!track) return;

  var slides = Array.prototype.slice.call(track.children);
  var dotsWrap = document.querySelector("[data-fh-dots]");
  var prevBtn = document.querySelector("[data-fh-prev]");
  var nextBtn = document.querySelector("[data-fh-next]");

  var DELAY = 8000;
  var index = 0;
  var timer = null;
  var dots = [];

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "fh-hero__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    dot.addEventListener("click", function () {
      goTo(i);
      restart();
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach(function (dot, di) {
      dot.classList.toggle("fh-hero__dot--active", di === index);
      dot.setAttribute("aria-selected", String(di === index));
    });
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function start() {
    timer = window.setInterval(next, DELAY);
  }

  function stop() {
    window.clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      restart();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      restart();
    });
  }

  var hero = track.closest(".fh-hero");
  if (hero) {
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      restart();
    }
  });

  goTo(0);
  start();
})();

/* ===== Flash deals countdown ===== */
(function () {
  "use strict";

  var timer = document.querySelector("[data-fh-countdown]");
  if (!timer) return;

  var elDays = timer.querySelector("[data-fh-days]");
  var elHours = timer.querySelector("[data-fh-hours]");
  var elMins = timer.querySelector("[data-fh-mins]");
  var elSecs = timer.querySelector("[data-fh-secs]");

  var DURATION = (2 * 3600 + 57 * 60 + 6) * 1000;
  var deadline = Date.now() + DURATION;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var diff = deadline - Date.now();
    if (diff <= 0) {
      deadline = Date.now() + DURATION;
      diff = DURATION;
    }
    var totalSec = Math.floor(diff / 1000);
    elDays.textContent = pad(Math.floor(totalSec / 86400));
    elHours.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    elMins.textContent = pad(Math.floor((totalSec % 3600) / 60));
    elSecs.textContent = pad(totalSec % 60);
  }

  tick();
  window.setInterval(tick, 1000);
})();

/* ===== Flash deals slider ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fh-deals-track]");
  if (!track) return;

  var prevBtn = document.querySelector("[data-fh-deals-prev]");
  var nextBtn = document.querySelector("[data-fh-deals-next]");

  function step() {
    var card = track.querySelector(".fh-deal-card");
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap || "16") || 16;
    return card.getBoundingClientRect().width + gap;
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
  }
})();

/* ===== Best deals products slider ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fh-prod-track]");
  if (!track) return;

  var prevBtn = document.querySelector("[data-fh-prod-prev]");
  var nextBtn = document.querySelector("[data-fh-prod-next]");

  function step() {
    var card = track.querySelector(".fh-prod-card");
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap || "18") || 18;
    return card.getBoundingClientRect().width + gap;
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
  }
})();

/* ===== Blogs slider ===== */
(function () {
  "use strict";

  var track = document.querySelector("[data-fh-blog-track]");
  if (!track) return;

  var prevBtn = document.querySelector("[data-fh-blog-prev]");
  var nextBtn = document.querySelector("[data-fh-blog-next]");

  function step() {
    var card = track.querySelector(".fh-blog-card");
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
    return card.getBoundingClientRect().width + gap;
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
  }
})();

/* ===== Product gallery ===== */
(function () {
  "use strict";

  var thumbs = document.querySelector("[data-fh-thumbs]");
  var mainImg = document.querySelector("[data-fh-main-img]");
  if (!thumbs || !mainImg) return;

  thumbs.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-fh-thumb]");
    if (!btn) return;
    mainImg.src = btn.getAttribute("data-fh-thumb");
    thumbs.querySelectorAll(".fh-pdp__thumb").forEach(function (t) {
      t.classList.toggle("fh-pdp__thumb--active", t === btn);
    });
  });
})();

/* ===== Pack-size chips ===== */
(function () {
  "use strict";

  var list = document.querySelector(".fh-pdp__opt-list");
  if (!list) return;

  list.addEventListener("click", function (e) {
    var chip = e.target.closest(".fh-pdp__chip");
    if (!chip) return;
    list.querySelectorAll(".fh-pdp__chip").forEach(function (c) {
      c.classList.toggle("fh-pdp__chip--active", c === chip);
    });
  });
})();

/* ===== Quantity stepper ===== */
(function () {
  "use strict";

  var wrap = document.querySelector("[data-fh-qty]");
  if (!wrap) return;

  var val = wrap.querySelector("[data-fh-qty-val]");
  var minus = wrap.querySelector("[data-fh-minus]");
  var plus = wrap.querySelector("[data-fh-plus]");
  var count = 1;

  function render() {
    val.textContent = count;
  }

  minus.addEventListener("click", function () {
    if (count > 1) count -= 1;
    render();
  });

  plus.addEventListener("click", function () {
    if (count < 99) count += 1;
    render();
  });
})();

/* ===== Catalog category chips ===== */
(function () {
  "use strict";

  var chips = document.querySelector(".fh-chips");
  if (!chips) return;

  chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".fh-chip");
    if (!chip) return;
    chips.querySelectorAll(".fh-chip").forEach(function (c) {
      c.classList.toggle("fh-chip--active", c === chip);
    });
  });
})();

/* ===== Product card → product page ===== */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    if (e.target.closest("button")) return;
    var card = e.target.closest("[data-fh-product]");
    if (!card) return;
    var id = card.getAttribute("data-fh-product");
    if (!id) return;
    window.location.href = "product.html?id=" + encodeURIComponent(id);
  });
})();

/* ===== Load product detail from URL ===== */
(function () {
  "use strict";

  var pdp = document.querySelector("[data-fh-pdp]");
  if (!pdp || !window.FH_PRODUCTS) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id") || "valencia-orange";
  var product = window.FH_PRODUCTS[id] || window.FH_PRODUCTS["valencia-orange"];

  function money(n) {
    return "Rs. " + Number(n).toLocaleString("en-IN");
  }

  function setList(el, items) {
    if (!el) return;
    el.innerHTML = items.map(function (it) {
      return "<li>" + it + "</li>";
    }).join("");
  }

  document.title = product.name + " — FreshHaat";

  var crumb = document.querySelector("[data-fh-crumb]");
  if (crumb) crumb.textContent = product.name;

  var title = document.querySelector("[data-fh-title]");
  if (title) title.textContent = product.name;

  var ratingEl = document.querySelector("[data-fh-rating]");
  if (ratingEl) ratingEl.textContent = "(" + (product.rating || "4.9") + ")";

  var reviewsEl = document.querySelector("[data-fh-reviews]");
  if (reviewsEl) reviewsEl.textContent = (product.reviews || 209) + " reviews";

  var mainImg = document.querySelector("[data-fh-main-img]");
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  var badge = document.querySelector("[data-fh-badge]");
  if (badge) {
    if (product.badge || (product.mrp && product.price < product.mrp)) {
      badge.textContent = product.badge || Math.round((1 - product.price / product.mrp) * 100) + "% OFF";
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  var priceEl = document.querySelector("[data-fh-price]");
  if (priceEl) priceEl.textContent = money(product.mrp || product.price);

  var desc = document.querySelector("[data-fh-desc]");
  if (desc) {
    if (Array.isArray(product.descPoints)) {
      desc.innerHTML = "<ul>" + product.descPoints.map(function (p) {
        return "<li>" + p + "</li>";
      }).join("") + "</ul>";
    } else {
      desc.innerHTML = "<p>" + product.desc + "</p>";
    }
  }

  var benefits = product.benefits || (product.tags || []).concat(["Wholesome &amp; nutritious", "Everyday quality you can trust"]);
  setList(document.querySelector("[data-fh-benefits]"), benefits);

  var ingredients = product.ingredients || [
    "High quality " + product.name.toLowerCase(),
    "Net Weight: " + (product.qty && product.qty[0] ? product.qty[0] : "As per pack")
  ];
  setList(document.querySelector("[data-fh-ingredients]"), ingredients);

  var mfg = product.mfg || [
    "<strong>Marketed By:</strong> FreshHaat Retail Pvt Ltd, Delhi NCR, India - 110001",
    "<strong>Brand:</strong> " + product.brand,
    "<strong>Country of Origin:</strong> India"
  ];
  setList(document.querySelector("[data-fh-mfg]"), mfg);

  var thumbs = document.querySelector("[data-fh-thumbs]");
  if (thumbs) {
    var gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
    thumbs.innerHTML = gallery.map(function (src, i) {
      return '<button type="button" class="fh-pdp__thumb' + (i === 0 ? " fh-pdp__thumb--active" : "") +
        '" data-fh-thumb="' + src + '"><img src="' + src + '" alt="" /></button>';
    }).join("");
  }
})();

/* ===== Introduction See More / See Less ===== */
(function () {
  "use strict";

  var btn = document.querySelector("[data-fh-intro-toggle]");
  var text = document.querySelector("[data-fh-intro-text]");
  if (!btn || !text) return;

  btn.addEventListener("click", function () {
    var open = text.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "See Less" : "See More";
  });
})();

/* ===== Category View More / View Less (mobile) ===== */
(function () {
  "use strict";

  var grid = document.querySelector("[data-fh-cat-grid]");
  var btn = document.querySelector("[data-fh-cat-toggle]");
  if (!grid || !btn) return;

  var label = btn.querySelector(".fh-cat__more-text");

  btn.addEventListener("click", function () {
    var collapsed = grid.classList.toggle("is-collapsed");
    btn.setAttribute("aria-expanded", String(!collapsed));
    if (label) label.textContent = collapsed ? "View More" : "View Less";
  });
})();

/* ===== Filter modal ===== */
(function () {
  "use strict";

  var modal = document.querySelector("[data-fh-filter]");
  if (!modal) return;

  var openBtns = document.querySelectorAll("[data-fh-filter-open]");
  var closeBtns = modal.querySelectorAll("[data-fh-filter-close]");
  var clearBtn = modal.querySelector("[data-fh-filter-clear]");
  var tabs = modal.querySelectorAll("[data-fh-filter-tab]");
  var panes = modal.querySelectorAll("[data-fh-filter-pane]");

  function setOpen(open) {
    if (open) {
      modal.removeAttribute("hidden");
    } else {
      modal.setAttribute("hidden", "");
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOpen(true);
    });
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOpen(false);
    });
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) setOpen(false);
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-fh-filter-tab");
      tabs.forEach(function (t) {
        t.classList.toggle("fh-filter__tab--active", t === tab);
      });
      panes.forEach(function (pane) {
        pane.classList.toggle(
          "fh-filter__pane--active",
          pane.getAttribute("data-fh-filter-pane") === key
        );
      });
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      modal.querySelectorAll("input").forEach(function (input) {
        input.checked = false;
      });
    });
  }
})();

/* ===== Product accordion ===== */
(function () {
  "use strict";

  var heads = document.querySelectorAll(".fh-pdp__acc-head");
  if (!heads.length) return;

  heads.forEach(function (head) {
    head.addEventListener("click", function () {
      head.parentElement.classList.toggle("fh-pdp__acc--open");
    });
  });
})();

/* ===== Back to top ===== */
(function () {
  "use strict";

  var btn = document.querySelector("[data-fh-top]");
  if (!btn) return;

  window.addEventListener("scroll", function () {
    btn.classList.toggle("fh-top--show", window.scrollY > 400);
  });

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
