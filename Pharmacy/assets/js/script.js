(function () {
  "use strict";

  var menuToggle = document.querySelector("[data-phr-menu-toggle]");
  var navList = document.querySelector(".phr-header__nav-list");

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", function () {
      var expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      navList.classList.toggle("is-open", !expanded);
    });
  }
})();

(function () {
  "use strict";

  var hero = document.querySelector("[data-phr-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".phr-hero__slide");
  var dots = hero.querySelectorAll("[data-phr-hero-dot]");
  var prevBtn = hero.querySelector("[data-phr-hero-prev]");
  var nextBtn = hero.querySelector("[data-phr-hero-next]");
  var currentIndex = 0;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-phr-hero-dot"), 10);
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

  goTo(0);
})();

(function () {
  "use strict";

  function initProductSlider(section, config) {
    var viewport = section.querySelector(config.viewport);
    var track = section.querySelector(config.track);
    var cards = section.querySelectorAll(config.card);
    var prevBtn = section.querySelector(config.prev);
    var nextBtn = section.querySelector(config.next);
    var progressThumb = config.progress ? section.querySelector(config.progress) : null;

    if (!viewport || !track || !cards.length || !prevBtn || !nextBtn) return;

    var index = 0;

    function getStep() {
      var card = cards[0];
      if (!card) return 0;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "12") || 12;
      return card.getBoundingClientRect().width + gap;
    }

    function getVisibleCount() {
      var step = getStep();
      if (!step) return 1;
      return Math.max(1, Math.floor(viewport.getBoundingClientRect().width / step));
    }

    function getMaxIndex() {
      var step = getStep();
      if (!step) return 0;

      var visible = getVisibleCount();
      return Math.max(0, cards.length - visible);
    }

    function updateProgress() {
      if (!progressThumb) return;

      var visible = getVisibleCount();
      var maxIndex = getMaxIndex();
      var thumbWidth = (visible / cards.length) * 100;
      var travel = 100 - thumbWidth;
      var progress = maxIndex > 0 ? index / maxIndex : 0;

      progressThumb.style.width = thumbWidth + "%";
      progressThumb.style.left = progress * travel + "%";
    }

    function updateControls() {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(index, maxIndex));

      track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

      prevBtn.hidden = index <= 0;
      nextBtn.hidden = index >= maxIndex;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;

      updateProgress();
    }

    prevBtn.addEventListener("click", function () {
      index -= 1;
      updateControls();
    });

    nextBtn.addEventListener("click", function () {
      index += 1;
      updateControls();
    });

    window.addEventListener("resize", updateControls);
    updateControls();
  }

  var fitness = document.querySelector("[data-phr-fitness]");
  if (fitness) {
    initProductSlider(fitness, {
      viewport: "[data-phr-fitness-viewport]",
      track: "[data-phr-fitness-track]",
      card: ".phr-fitness__card",
      prev: "[data-phr-fitness-prev]",
      next: "[data-phr-fitness-next]"
    });
  }

  var promo = document.querySelector("[data-phr-promo]");
  if (promo) {
    initProductSlider(promo, {
      viewport: "[data-phr-promo-viewport]",
      track: "[data-phr-promo-track]",
      card: ".phr-promo__card",
      prev: "[data-phr-promo-prev]",
      next: "[data-phr-promo-next]",
      progress: "[data-phr-promo-progress]"
    });
  }

  document.querySelectorAll("[data-phr-deals-block]").forEach(function (dealsBlock) {
    initProductSlider(dealsBlock, {
      viewport: "[data-phr-deals-viewport]",
      track: "[data-phr-deals-track]",
      card: ".phr-deals__card",
      prev: "[data-phr-deals-prev]",
      next: "[data-phr-deals-next]"
    });
  });
})();

(function () {
  "use strict";

  var wellness = document.querySelector("[data-phr-wellness]");
  if (!wellness) return;

  var viewport = wellness.querySelector("[data-phr-wellness-viewport]");
  var track = wellness.querySelector("[data-phr-wellness-track]");
  var prevBtn = wellness.querySelector("[data-phr-wellness-prev]");
  var nextBtn = wellness.querySelector("[data-phr-wellness-next]");
  var mobileQuery = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  var index = 0;
  var pages = [];
  var desktopGroups = null;
  var allCards = [];
  var isMobileLayout = false;

  function initDesktopGroups() {
    if (desktopGroups) return;

    var pageNodes = track.querySelectorAll(".phr-wellness__page");
    desktopGroups = [];
    allCards = [];

    pageNodes.forEach(function (page) {
      var cards = Array.from(page.querySelectorAll(".phr-wellness__card"));
      desktopGroups.push(cards);
      allCards = allCards.concat(cards);
    });
  }

  function refreshPages() {
    pages = track.querySelectorAll(".phr-wellness__page");
  }

  function buildPages(groups) {
    track.innerHTML = "";

    groups.forEach(function (group) {
      var page = document.createElement("div");
      page.className = "phr-wellness__page";
      group.forEach(function (card) {
        page.appendChild(card);
      });
      track.appendChild(page);
    });

    refreshPages();
  }

  function chunkCards(cards, size) {
    var groups = [];
    var i;

    for (i = 0; i < cards.length; i += size) {
      groups.push(cards.slice(i, i + size));
    }

    return groups;
  }

  function applyLayout(forceReset) {
    var shouldUseMobile = mobileQuery.matches;

    if (shouldUseMobile === isMobileLayout && !forceReset) {
      updateControls();
      return;
    }

    initDesktopGroups();

    if (shouldUseMobile) {
      buildPages(chunkCards(allCards, 1));
      wellness.classList.add("phr-wellness--mobile");
      isMobileLayout = true;
    } else {
      buildPages(desktopGroups);
      wellness.classList.remove("phr-wellness--mobile");
      isMobileLayout = false;
    }

    if (forceReset) {
      index = 0;
    } else {
      index = Math.min(index, Math.max(0, pages.length - 1));
    }

    updateControls();
  }

  function updateControls() {
    if (!pages.length) return;

    var maxIndex = Math.max(0, pages.length - 1);
    index = Math.max(0, Math.min(index, maxIndex));

    track.style.transform = "translate3d(-" + index * 100 + "%, 0, 0)";

    if (isMobileLayout) {
      prevBtn.hidden = false;
      nextBtn.hidden = false;
    } else {
      prevBtn.hidden = index <= 0;
      nextBtn.hidden = index >= maxIndex;
    }

    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex;
  }

  prevBtn.addEventListener("click", function () {
    index -= 1;
    updateControls();
  });

  nextBtn.addEventListener("click", function () {
    index += 1;
    updateControls();
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", function () {
      applyLayout(true);
    });
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(function () {
      applyLayout(true);
    });
  }

  window.addEventListener("resize", function () {
    applyLayout(false);
  });

  applyLayout(true);
})();

(function () {
  "use strict";

  var glance = document.querySelector("[data-phr-glance]");
  if (!glance) return;

  var viewport = glance.querySelector("[data-phr-glance-viewport]");
  var track = glance.querySelector("[data-phr-glance-track]");
  var cards = glance.querySelectorAll(".phr-glance__card");
  var dots = glance.querySelectorAll("[data-phr-glance-dot]");
  var prevBtn = glance.querySelector("[data-phr-glance-prev]");
  var nextBtn = glance.querySelector("[data-phr-glance-next]");

  if (!viewport || !track || !cards.length || !prevBtn || !nextBtn) return;

  var index = 0;

  function getStep() {
    var card = cards[0];
    if (!card) return 0;

    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function getVisibleCount() {
    var step = getStep();
    if (!step) return 1;
    return Math.max(1, Math.floor(viewport.getBoundingClientRect().width / step));
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function updateDots() {
    var maxIndex = getMaxIndex();
    var activeDot = index >= maxIndex && maxIndex > 0 ? dots.length - 1 : index;

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeDot;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function updateControls() {
    var maxIndex = getMaxIndex();
    index = Math.max(0, Math.min(index, maxIndex));

    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

    prevBtn.hidden = index <= 0;
    nextBtn.hidden = index >= maxIndex;
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex;

    updateDots();
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var dotIndex = parseInt(dot.getAttribute("data-phr-glance-dot"), 10);
      if (!isNaN(dotIndex)) {
        index = Math.min(dotIndex, getMaxIndex());
        updateControls();
      }
    });
  });

  prevBtn.addEventListener("click", function () {
    index -= 1;
    updateControls();
  });

  nextBtn.addEventListener("click", function () {
    index += 1;
    updateControls();
  });

  window.addEventListener("resize", updateControls);
  updateControls();
})();
