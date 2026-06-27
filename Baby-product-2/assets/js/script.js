(function () {
  "use strict";

  /* ===== Hero slider ===== */
  var hero = document.querySelector("[data-bh-hero]");

  if (hero) {
    var track = hero.querySelector("[data-bh-hero-track]");
    var slides = hero.querySelectorAll("[data-bh-hero-slide]");
    var prevBtn = hero.querySelector("[data-bh-hero-prev]");
    var nextBtn = hero.querySelector("[data-bh-hero-next]");
    var dotsWrap = hero.querySelector("[data-bh-hero-dots]");
    var total = slides.length;
    var index = 0;
    var timer = null;
    var DELAY = 15000;

    var dots = [];
    for (var i = 0; i < total; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "bh-hero__dot";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      (function (n) {
        dot.addEventListener("click", function () {
          goTo(n);
          restart();
        });
      })(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    function update() {
      track.style.transform = "translateX(" + -index * 100 + "%)";
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle("is-active", d === index);
      }
    }

    function goTo(n) {
      index = (n + total) % total;
      update();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function start() {
      timer = setInterval(next, DELAY);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    update();
    start();
  }

  /* ===== Clothing categories slider ===== */
  var clothingViewport = document.querySelector("[data-bh-clothing-viewport]");
  var clothingPrev = document.querySelector("[data-bh-clothing-prev]");
  var clothingNext = document.querySelector("[data-bh-clothing-next]");

  if (clothingViewport) {
    function clothingStep() {
      var card = clothingViewport.querySelector(".bh-clothing__card");
      if (!card) return clothingViewport.clientWidth;
      var styles = window.getComputedStyle(clothingViewport);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    }

    if (clothingNext) {
      clothingNext.addEventListener("click", function () {
        clothingViewport.scrollBy({ left: clothingStep(), behavior: "smooth" });
      });
    }

    if (clothingPrev) {
      clothingPrev.addEventListener("click", function () {
        clothingViewport.scrollBy({ left: -clothingStep(), behavior: "smooth" });
      });
    }
  }

  /* ===== Parent favourite slider ===== */
  var favViewport = document.querySelector("[data-bh-favourite-viewport]");
  var favPrev = document.querySelector("[data-bh-favourite-prev]");
  var favNext = document.querySelector("[data-bh-favourite-next]");

  if (favViewport) {
    function favStep() {
      var card = favViewport.querySelector(".bh-favourite__card");
      if (!card) return favViewport.clientWidth;
      var styles = window.getComputedStyle(favViewport);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    }

    if (favNext) {
      favNext.addEventListener("click", function () {
        favViewport.scrollBy({ left: favStep(), behavior: "smooth" });
      });
    }

    if (favPrev) {
      favPrev.addEventListener("click", function () {
        favViewport.scrollBy({ left: -favStep(), behavior: "smooth" });
      });
    }
  }

  /* ===== Testimonials slider ===== */
  var reviewsViewport = document.querySelector("[data-bh-reviews-viewport]");
  var reviewsPrev = document.querySelector("[data-bh-reviews-prev]");
  var reviewsNext = document.querySelector("[data-bh-reviews-next]");

  if (reviewsViewport) {
    function reviewsStep() {
      var card = reviewsViewport.querySelector(".bh-review");
      if (!card) return reviewsViewport.clientWidth;
      var styles = window.getComputedStyle(reviewsViewport);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    }

    if (reviewsNext) {
      reviewsNext.addEventListener("click", function () {
        reviewsViewport.scrollBy({ left: reviewsStep(), behavior: "smooth" });
      });
    }

    if (reviewsPrev) {
      reviewsPrev.addEventListener("click", function () {
        reviewsViewport.scrollBy({ left: -reviewsStep(), behavior: "smooth" });
      });
    }
  }

  /* ===== Featured products ===== */
  var featuredGrid = document.querySelector("[data-bh-featured-grid]");
  if (featuredGrid && window.BHProducts && window.BH_PRODUCTS) {
    featuredGrid.innerHTML = window.BHProducts.renderProductCards(
      window.BH_PRODUCTS.slice(0, 4)
    );
  }
})();
