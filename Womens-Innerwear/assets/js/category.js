/**
 * Savante — category.html only
 * Load after script.js (shared bundles: header nav, scroll-to-top, etc.).
 */

(function initSavCatProductLinks() {
  document.querySelectorAll(".sav-cat-pcard").forEach(function (card) {
    if (card.querySelector(".sav-cat-pcard__link")) return;
    var codeEl = card.querySelector(".sav-cat-pcard__code");
    if (!codeEl) return;
    var raw = String(codeEl.textContent || "")
      .replace(/#/g, "")
      .trim()
      .toLowerCase();
    if (!raw) return;
    var a = document.createElement("a");
    a.className = "sav-cat-pcard__link";
    a.href = "product.html?p=" + encodeURIComponent(raw);
    a.setAttribute("aria-label", "View product " + String(codeEl.textContent || "").trim());
    card.insertBefore(a, card.firstChild);
  });
})();

(function initSavCatQuickFilters() {
  var track = document.querySelector("[data-cat-quick-track]");
  var prevBtn = document.querySelector("[data-cat-quick-prev]");
  var nextBtn = document.querySelector("[data-cat-quick-next]");
  if (!track || !prevBtn || !nextBtn) return;

  var step = 140;

  function update() {
    var maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      prevBtn.classList.add("is-disabled");
      prevBtn.disabled = true;
      nextBtn.classList.add("is-disabled");
      nextBtn.disabled = true;
      prevBtn.classList.remove("is-active");
      nextBtn.classList.remove("is-active");
      return;
    }

    var left = track.scrollLeft;
    var atStart = left <= 2;
    var atEnd = left >= maxScroll - 2;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.classList.toggle("is-disabled", atStart);
    nextBtn.classList.toggle("is-disabled", atEnd);
    prevBtn.classList.toggle("is-active", !atStart);
    nextBtn.classList.toggle("is-active", !atEnd);
  }

  prevBtn.addEventListener("click", function () {
    track.scrollBy({ left: -step, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", function () {
    track.scrollBy({ left: step, behavior: "smooth" });
  });

  track.addEventListener(
    "scroll",
    function () {
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  window.addEventListener("resize", update, { passive: true });
  update();
})();

(function initSavCatFilterDrawer() {
  var drawer = document.getElementById("savCatFilterDrawer");
  var openBtns = document.querySelectorAll("[data-cat-filter-open]");
  if (!drawer || !openBtns.length) return;

  var closeBtns = drawer.querySelectorAll("[data-cat-filter-close]");
  var clearBtn = drawer.querySelector(".sav-cat-filter__clear");
  var tabs = drawer.querySelectorAll("[data-cat-filter-tab]");
  var results = drawer.querySelector("[data-cat-filter-results]");
  var cardStyles = ["lavender", "gray", "blue", "green", "yellow", "peach", "pink"];
  var images = ["assets/img/category-2.WEBP", "assets/img/category-1.webp", "assets/img/category-3.WEBP"];
  var filterOptions = {
    "product-type": [
      ["Active Bras", "13 Products"],
      ["Beginners Bras", "2 Products"],
      ["Crop Tops", "3 Products"],
      ["Everyday Bras", "13 Products"],
      ["Lounge Bra", "1 Products"],
      ["Lounge Bras", "4 Products"],
      ["Multiway Backless Bra", "1 Products"],
      ["Nursing Bras", "1 Products"],
      ["Plus Size Bras", "7 Products"],
    ],
    size: [
      ["XS", "8 Products"],
      ["S", "18 Products"],
      ["M", "24 Products"],
      ["L", "20 Products"],
      ["XL", "16 Products"],
      ["XXL", "10 Products"],
    ],
    price: [
      ["Under ₹500", "12 Products"],
      ["₹500 - ₹999", "30 Products"],
      ["₹1000 - ₹1499", "14 Products"],
      ["₹1500 & Above", "6 Products"],
    ],
    colour: [
      ["Black", "18 Products"],
      ["Blue", "15 Products"],
      ["Green", "9 Products"],
      ["Pink", "11 Products"],
      ["Beige", "7 Products"],
      ["White", "5 Products"],
    ],
    coverage: [
      ["Full Coverage", "17 Products"],
      ["Medium Coverage", "24 Products"],
      ["Low Coverage", "8 Products"],
      ["Front Coverage", "13 Products"],
    ],
    straps: [
      ["Regular Straps", "24 Products"],
      ["Detachable Straps", "9 Products"],
      ["Transparent Straps", "5 Products"],
      ["Multiway Straps", "7 Products"],
    ],
    "back-style": [
      ["Regular Back", "22 Products"],
      ["Racer Back", "8 Products"],
      ["Cross Back", "6 Products"],
      ["Backless", "4 Products"],
    ],
    wiring: [
      ["Wirefree", "35 Products"],
      ["Underwired", "18 Products"],
      ["Flexible Wire", "9 Products"],
    ],
    closure: [
      ["Back Closure", "27 Products"],
      ["Front Closure", "7 Products"],
      ["Slip-On", "15 Products"],
      ["Hook & Eye", "13 Products"],
    ],
    padding: [
      ["Non Padded", "25 Products"],
      ["Lightly Padded", "19 Products"],
      ["Padded", "18 Products"],
      ["Removable Pads", "6 Products"],
    ],
    fabric: [
      ["Cotton", "26 Products"],
      ["Microfiber", "17 Products"],
      ["Lace", "9 Products"],
      ["Elastane Stretch", "21 Products"],
      ["Modal", "5 Products"],
    ],
    collection: [
      ["Savante Essentials", "18 Products"],
      ["Premium Innerwear", "12 Products"],
      ["Everyday Comfort", "20 Products"],
      ["Active Collection", "9 Products"],
    ],
    pattern: [
      ["Solid", "31 Products"],
      ["Printed", "12 Products"],
      ["Textured", "8 Products"],
      ["Lace Detail", "11 Products"],
    ],
  };

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderFilterOptions(key) {
    if (!results) return;
    var options = filterOptions[key] || [];
    results.innerHTML =
      '<div class="sav-cat-filter__options-grid">' +
      options
        .map(function (option, index) {
          var title = option[0];
          var count = option[1];
          var style = cardStyles[index % cardStyles.length];
          var img = images[index % images.length];
          return (
            '<label class="sav-cat-filter__option sav-cat-filter__option--' +
            style +
            '">' +
            '<input type="checkbox" name="' +
            esc(key) +
            '" value="' +
            esc(slug(title)) +
            '">' +
            '<span class="sav-cat-filter__option-text"><strong>' +
            esc(title) +
            "</strong><span>" +
            esc(count) +
            "</span></span>" +
            '<img src="' +
            esc(img) +
            '" alt="" loading="lazy">' +
            "</label>"
          );
        })
        .join("") +
      "</div>";
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-cat-filter-tab");
      tabs.forEach(function (item) {
        item.classList.toggle("is-active", item === tab);
      });
      tab.insertAdjacentElement("afterend", results);
      renderFilterOptions(key);
    });
  });

  if (tabs.length) {
    tabs[0].insertAdjacentElement("afterend", results);
    renderFilterOptions(tabs[0].getAttribute("data-cat-filter-tab"));
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    openBtns.forEach(function (btn) {
      btn.setAttribute("aria-expanded", "true");
    });
    document.body.classList.add("sav-cat-filter-open");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    openBtns.forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
    document.body.classList.remove("sav-cat-filter-open");
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", openDrawer);
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeDrawer);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      drawer.querySelectorAll('.sav-cat-filter__option input[type="checkbox"]').forEach(function (input) {
        input.checked = false;
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });
})();

(function initSavCatBuzz() {
  var root = document.querySelector("[data-sav-cat-buzz]");
  if (!root) return;

  var leftImg = root.querySelector("[data-cat-buzz-left]");
  var centerImg = root.querySelector("[data-cat-buzz-center]");
  var rightImg = root.querySelector("[data-cat-buzz-right]");
  var titleEl = root.querySelector("[data-cat-buzz-title]");
  var tagsWrap = root.querySelector("[data-cat-buzz-tags]");
  var prevBtn = root.querySelector("[data-cat-buzz-prev]");
  var nextBtn = root.querySelector("[data-cat-buzz-next]");

  if (!leftImg || !centerImg || !rightImg) return;

  var SLIDES = [
    {
      img: "./assets/img/category-1.WEBP",
      title: "Wirefree Non Padded Microfiber Elastane Stretch Full Cover...",
      tags: ["Brushed Lining Cups", "Sweat Channelling", "StayFresh"],
    },
    {
      img: "./assets/img/category-2.WEBP",
      title: "Seamless Wired T-Shirt Bra Rose Dust Microfiber Elastane Stretch...",
      tags: ["Brushed Lining Cups", "Sweat Channelling", "StayFresh"],
    },
    {
      img: "./assets/img/category-3.WEBP",
      title: "Cotton Stretch Full Coverage Lounge Bra With Soft Support Band...",
      tags: ["Brushed Lining Cups", "Sweat Channelling", "StayFresh"],
    },
  ];

  var n = SLIDES.length;
  var idx = 0;

  function mod(i) {
    return ((i % n) + n) % n;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTags(tags) {
    if (!tagsWrap) return;
    tagsWrap.innerHTML = tags
      .map(function (t) {
        return '<span class="sav-cat-buzz__tag">' + esc(t) + "</span>";
      })
      .join("");
  }

  function render() {
    var iL = mod(idx - 1);
    var iC = idx;
    var iR = mod(idx + 1);
    leftImg.src = SLIDES[iL].img;
    centerImg.src = SLIDES[iC].img;
    rightImg.src = SLIDES[iR].img;
    leftImg.alt = SLIDES[iL].title;
    centerImg.alt = SLIDES[iC].title;
    rightImg.alt = SLIDES[iR].title;
    if (titleEl) titleEl.textContent = SLIDES[iC].title;
    renderTags(SLIDES[iC].tags);
  }

  function go(delta) {
    idx = mod(idx + delta);
    render();
  }

  if (prevBtn) prevBtn.addEventListener("click", function () {
    go(-1);
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    go(1);
  });

  render();
})();
