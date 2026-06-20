(function () {
  var catalog = window.ProductCatalog;

  /* Mobile menu drawer */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menuClose = document.querySelector("[data-menu-close]");
  var mobileDrawer = document.querySelector("[data-mobile-drawer]");
  var mobileOverlay = document.querySelector("[data-mobile-overlay]");

  function openMobileMenu() {
    if (!mobileDrawer || !mobileOverlay) return;
    mobileDrawer.classList.add("is-open");
    mobileOverlay.hidden = false;
    requestAnimationFrame(function () {
      mobileOverlay.classList.add("is-visible");
    });
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    mobileDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  function closeMobileMenu() {
    if (!mobileDrawer || !mobileOverlay) return;
    mobileDrawer.classList.remove("is-open");
    mobileOverlay.classList.remove("is-visible");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    mobileDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    setTimeout(function () {
      mobileOverlay.hidden = true;
    }, 300);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMobileMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileMenu);
  }

  if (mobileDrawer) {
    mobileDrawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileMenu();
  });

  /* Top bar carousel (mobile) */
  var topMessage = document.querySelector("[data-top-message]");
  var topPrev = document.querySelector("[data-top-prev]");
  var topNext = document.querySelector("[data-top-next]");
  var topMessages = [
    "₹150 OFF on 1st Prepaid Order Over ₹2,999 – Use NutraNovaFIRST",
    "Free Shipping on Prepaid Orders Over ₹799"
  ];
  var topIndex = 0;

  function updateTopMessage() {
    if (topMessage) topMessage.textContent = topMessages[topIndex];
  }

  if (topPrev) {
    topPrev.addEventListener("click", function () {
      topIndex = (topIndex - 1 + topMessages.length) % topMessages.length;
      updateTopMessage();
    });
  }

  if (topNext) {
    topNext.addEventListener("click", function () {
      topIndex = (topIndex + 1) % topMessages.length;
      updateTopMessage();
    });
  }

  /* Hero slider */
  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = hero.querySelectorAll(".hero-slide");
    var lines = hero.querySelectorAll("[data-hero-line]");
    var currentIndex = 0;

    if (slides.length) {
      function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        lines.forEach(function (line, lineIndex) {
          line.classList.toggle("is-active", lineIndex === currentIndex);
        });
      }

      lines.forEach(function (line) {
        line.addEventListener("click", function () {
          var index = parseInt(line.getAttribute("data-hero-line"), 10);
          if (!isNaN(index)) goTo(index);
        });
      });
    }
  }

  /* Suggested For You carousel */
  var suggested = document.querySelector("[data-suggested-carousel]");
  if (suggested) {
    var track = suggested.querySelector("[data-suggested-track]");
    var viewport = suggested.querySelector("[data-suggested-viewport]");
    var prevBtn = suggested.querySelector("[data-suggested-prev]");
    var nextBtn = suggested.querySelector("[data-suggested-next]");
    var tabs = suggested.querySelectorAll("[data-suggested-tab]");
    var index = 0;
    var activeTab = "bestsellers";
    var gap = 16;

    var suggestedProducts = {
      bestsellers: [
        { id: 1, img: "assets/img/BS-1.png", alt: "100% Whey Protein", brand: "NutraNova", name: "100% Whey Protein", desc: "Faster Recovery & Lean Muscle Gain", rating: "4.6 (2315 reviews)", price: "₹1,099", mrp: "₹1,549", off: "-29%" },
        { id: 2, img: "assets/img/BS-2.png", alt: "Gold Series 100% Whey Protein Advanced", brand: "NutraNova AMP", name: "Gold Series 100% Whey Protein Advanced", desc: "Build Muscle Strength & Endurance", rating: "4.7 (1842 reviews)", price: "₹3,799" },
        { id: 3, img: "assets/img/BS-3.png", alt: "Pure Isolate Low Zero Carb", brand: "NutraNova AMP", name: "Pure Isolate (Low/Zero Carb)", desc: "Lean Muscle & Fast Absorption", rating: "4.5 (986 reviews)", price: "₹5,199", mrp: "₹5,339", off: "-2%" },
        { id: 4, img: "assets/img/BS-4.png", alt: "Pro Performance Power Protein", brand: "NutraNova", name: "Pro Performance Power Protein", desc: "High Protein for Strength & Recovery", rating: "4.4 (1520 reviews)", price: "₹2,149", mrp: "₹3,199", off: "-32%" },
        { id: 5, img: "assets/img/BS-5.png", alt: "Gold Series BCAA Advanced", brand: "NutraNova AMP", name: "Gold Series BCAA Advanced", desc: "Reduce Fatigue & Muscle Breakdown", rating: "4.6 (1124 reviews)", price: "₹1,299", mrp: "₹2,219", off: "-41%" },
        { id: 6, img: "assets/img/BS-6.png", alt: "Pro Performance Creatine Monohydrate", brand: "NutraNova", name: "Pro Performance Creatine Monohydrate", desc: "Boost Strength & Workout Performance", rating: "4.8 (876 reviews)", price: "₹3,999" }
      ],
      "new-arrivals": [
        { id: 13, img: "assets/img/Whey-Protein-Concentrate-1.webp", alt: "Whey Protein Concentrate", brand: "NutraNova", name: "Whey Protein Concentrate", desc: "Premium Quality Whey for Daily Use", rating: "4.5 (642 reviews)", price: "₹2,499", mrp: "₹2,999", off: "-16%" },
        { id: 20, img: "assets/img/Pea-Protein.webp", alt: "Pea & Plant Protein", brand: "NutraNova", name: "Pea & Plant Protein", desc: "100% Plant Based Protein Source", rating: "4.4 (518 reviews)", price: "₹1,899", mrp: "₹2,299", off: "-17%" },
        { id: 21, img: "assets/img/Yeast-Protein.webp", alt: "Yeast Protein", brand: "NutraNova", name: "Yeast Protein", desc: "Complete Amino Acid Profile", rating: "4.3 (412 reviews)", price: "₹1,699", mrp: "₹1,999", off: "-15%" },
        { id: 14, img: "assets/img/Pre-Workout.webp", alt: "Pre Workout", brand: "NutraNova AMP", name: "Pre Workout Energy Boost", desc: "Explosive Energy & Focus", rating: "4.6 (789 reviews)", price: "₹1,499", mrp: "₹1,899", off: "-21%" },
        { id: 15, img: "assets/img/Creatine-2.webp", alt: "Creatine Monohydrate", brand: "NutraNova", name: "Creatine Monohydrate", desc: "Pure Micronized Creatine", rating: "4.7 (934 reviews)", price: "₹899", mrp: "₹1,199", off: "-25%" },
        { id: 16, img: "assets/img/BCAA-1.webp", alt: "BCAA", brand: "NutraNova AMP", name: "BCAA Recovery Formula", desc: "Faster Recovery Between Sets", rating: "4.5 (567 reviews)", price: "₹1,199", mrp: "₹1,549", off: "-22%" }
      ],
      "top-rated": [
        { id: 12, img: "assets/img/WS-1.png", alt: "Omega 3 Fish Oil", brand: "NutraNova", name: "Omega 3 Fish Oil", desc: "Heart, Brain & Joint Support", rating: "4.9 (2104 reviews)", price: "₹899", mrp: "₹1,199", off: "-25%" },
        { id: 17, img: "assets/img/WS-2.png", alt: "Multivitamins for Men", brand: "NutraNova", name: "Multivitamins for Men", desc: "Complete Daily Nutrition", rating: "4.8 (1876 reviews)", price: "₹719", mrp: "₹999", off: "-28%" },
        { id: 2, img: "assets/img/BS-2.png", alt: "Gold Series Whey Advanced", brand: "NutraNova AMP", name: "Gold Series Whey Advanced", desc: "Top Rated Muscle Builder", rating: "4.9 (1642 reviews)", price: "₹3,799" },
        { id: 1, img: "assets/img/BS-1.png", alt: "100% Whey Protein", brand: "NutraNova", name: "100% Whey Protein", desc: "Customer Favorite Best Seller", rating: "4.8 (2315 reviews)", price: "₹1,099", mrp: "₹1,549", off: "-29%" },
        { id: 19, img: "assets/img/Ashwagandha.webp", alt: "Ashwagandha", brand: "NutraNova", name: "Ashwagandha Extract", desc: "Stress Relief & Vitality", rating: "4.7 (923 reviews)", price: "₹599", mrp: "₹799", off: "-25%" },
        { id: 5, img: "assets/img/BS-5.png", alt: "BCAA Advanced", brand: "NutraNova AMP", name: "BCAA Advanced", desc: "Highest Rated Amino Formula", rating: "4.8 (1124 reviews)", price: "₹1,299", mrp: "₹2,219", off: "-41%" }
      ],
      multivitamin: [
        { id: 17, img: "assets/img/Multivitamins-for-Men.webp", alt: "Multivitamins for Men", brand: "NutraNova", name: "Multivitamins for Men", desc: "One Daily High Potency Formula", rating: "4.6 (1543 reviews)", price: "₹719", mrp: "₹999", off: "-28%" },
        { id: 18, img: "assets/img/Omega.webp", alt: "Fish Oil Omega 3", brand: "NutraNova", name: "Fish Oil Omega 3", desc: "EPA & DHA for Daily Wellness", rating: "4.5 (1287 reviews)", price: "₹899", mrp: "₹1,199", off: "-25%" },
        { id: 22, img: "assets/img/Magnesium.webp", alt: "Magnesium", brand: "NutraNova", name: "Magnesium Glycinate", desc: "Muscle Relaxation & Sleep Support", rating: "4.4 (876 reviews)", price: "₹649", mrp: "₹849", off: "-23%" },
        { id: 23, img: "assets/img/Single-Vitamins.webp", alt: "Single Vitamins", brand: "NutraNova", name: "Vitamin D3 + K2", desc: "Bone & Immunity Support", rating: "4.5 (654 reviews)", price: "₹549", mrp: "₹699", off: "-21%" },
        { id: 24, img: "assets/img/Shilajit.webp", alt: "Shilajit", brand: "NutraNova", name: "Pure Shilajit Resin", desc: "Energy & Stamina Booster", rating: "4.7 (432 reviews)", price: "₹999", mrp: "₹1,299", off: "-23%" },
        { id: 25, img: "assets/img/Pre-&-Probiotic-1.webp", alt: "Pre & Probiotics", brand: "NutraNova", name: "Pre & Probiotics", desc: "Gut Health & Digestive Support", rating: "4.6 (567 reviews)", price: "₹799", mrp: "₹999", off: "-20%" }
      ]
    };

    function buildPriceHtml(product) {
      var html = '<span class="price-current">' + product.price + "</span>";
      if (product.mrp) {
        html += '<span class="price-mrp">' + product.mrp + "</span>";
      }
      if (product.off) {
        html += '<span class="price-off">' + product.off + "</span>";
      }
      return html;
    }

    function buildCardHtml(product) {
      var href = catalog ? catalog.getUrl(product.id) : "product.html?id=" + product.id;
      return (
        '<article class="suggested-card">' +
        '<a href="' + href + '" class="product-card-link">' +
        '<div class="suggested-card-media">' +
        '<img src="' + product.img + '" alt="' + product.alt + '">' +
        '<span class="veg-icon" aria-label="Vegetarian"></span>' +
        "</div>" +
        '<p class="suggested-card-brand">' + product.brand + "</p>" +
        '<h3 class="suggested-card-name">' + product.name + "</h3>" +
        '<p class="suggested-card-desc">' + product.desc + "</p>" +
        '<div class="suggested-card-rating">' +
        '<i class="fa-solid fa-star"></i>' +
        "<span>" + product.rating + "</span>" +
        '<i class="fa-solid fa-circle-check verified"></i>' +
        "</div>" +
        '<div class="suggested-card-price">' + buildPriceHtml(product) + "</div>" +
        "</a>" +
        '<button type="button" class="suggested-card-btn">Add To Cart</button>' +
        "</article>"
      );
    }

    function getCards() {
      return track ? track.querySelectorAll(".suggested-card") : [];
    }

    function getGap() {
      if (!track) return gap;
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap) || gap;
    }

    function getStep() {
      var cards = getCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getVisibleCount() {
      var cards = getCards();
      if (!viewport || !cards.length) return 1;
      var step = getStep();
      if (!step) return 1;
      return Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
    }

    function getMaxIndex() {
      var cards = getCards();
      if (!cards.length || !viewport || !track) return 0;

      var step = getStep();
      if (!step) return 0;

      var maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
      return Math.max(0, Math.round(maxScroll / step));
    }

    function updateCarousel() {
      var maxIndex = getMaxIndex();
      if (index > maxIndex) index = maxIndex;

      if (track) {
        track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
      }

      if (prevBtn) {
        var prevDisabled = index <= 0;
        prevBtn.disabled = prevDisabled;
        prevBtn.classList.toggle("is-disabled", prevDisabled);
      }

      if (nextBtn) {
        var nextDisabled = index >= maxIndex;
        nextBtn.disabled = nextDisabled;
        nextBtn.classList.toggle("is-disabled", nextDisabled);
      }
    }

    function renderTab(tabKey) {
      var products = suggestedProducts[tabKey];
      if (!track || !products) return;

      activeTab = tabKey;
      index = 0;
      track.style.transform = "translate3d(0, 0, 0)";
      track.innerHTML = products.map(buildCardHtml).join("");

      requestAnimationFrame(function () {
        updateCarousel();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index > 0) {
          index -= 1;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index < getMaxIndex()) {
          index += 1;
          updateCarousel();
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var tabKey = tab.getAttribute("data-suggested-tab");
        if (!tabKey || tabKey === activeTab) return;

        tabs.forEach(function (item) {
          item.classList.remove("is-active");
          item.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        renderTab(tabKey);
      });
    });

    window.addEventListener("resize", function () {
      updateCarousel();
    });

    if (viewport) {
      var touchStartX = 0;
      var touchDeltaX = 0;

      viewport.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.touches[0].clientX;
          touchDeltaX = 0;
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchmove",
        function (e) {
          touchDeltaX = e.touches[0].clientX - touchStartX;
        },
        { passive: true }
      );

      viewport.addEventListener("touchend", function () {
        if (Math.abs(touchDeltaX) > 40) {
          if (touchDeltaX < 0 && index < getMaxIndex()) index += 1;
          else if (touchDeltaX > 0 && index > 0) index -= 1;
          updateCarousel();
        }
        touchDeltaX = 0;
      });
    }

    renderTab(activeTab);
  }

  /* Promo cards carousel (mobile) */
  var promoCards = document.querySelector("[data-promo-cards-carousel]");
  if (promoCards) {
    var promoTrack = promoCards.querySelector("[data-promo-cards-track]");
    var promoViewport = promoCards.querySelector("[data-promo-cards-viewport]");
    var promoDots = promoCards.querySelector("[data-promo-cards-dots]");
    var promoIndex = 0;
    var promoGap = 12;

    function isPromoMobile() {
      return window.innerWidth <= 768;
    }

    function getPromoCards() {
      return promoTrack ? promoTrack.querySelectorAll(".promo-card") : [];
    }

    function getPromoGap() {
      if (!promoTrack) return promoGap;
      var styles = window.getComputedStyle(promoTrack);
      return parseFloat(styles.gap) || promoGap;
    }

    function getPromoStep() {
      var cards = getPromoCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getPromoGap();
    }

    function getPromoMaxIndex() {
      var cards = getPromoCards();
      if (!cards.length) return 0;
      if (isPromoMobile()) return cards.length - 1;
      return 0;
    }

    function buildPromoDots() {
      if (!promoDots) return;
      var cards = getPromoCards();
      promoDots.innerHTML = "";
      if (!isPromoMobile() || cards.length <= 1) return;

      cards.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "promo-cards-dot" + (i === promoIndex ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to promo " + (i + 1));
        dot.addEventListener("click", function () {
          promoIndex = i;
          updatePromoCarousel();
        });
        promoDots.appendChild(dot);
      });
    }

    function updatePromoCarousel() {
      if (!promoTrack) return;

      if (!isPromoMobile()) {
        promoTrack.style.transform = "translate3d(0, 0, 0)";
        promoIndex = 0;
        if (promoDots) promoDots.innerHTML = "";
        return;
      }

      var maxIndex = getPromoMaxIndex();
      if (promoIndex > maxIndex) promoIndex = maxIndex;
      if (promoIndex < 0) promoIndex = 0;

      promoTrack.style.transform = "translate3d(-" + promoIndex * getPromoStep() + "px, 0, 0)";

      if (promoDots) {
        promoDots.querySelectorAll(".promo-cards-dot").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === promoIndex);
        });
      }
    }

    buildPromoDots();
    updatePromoCarousel();

    window.addEventListener("resize", function () {
      buildPromoDots();
      updatePromoCarousel();
    });

    if (promoViewport) {
      var promoTouchStartX = 0;
      var promoTouchDeltaX = 0;

      promoViewport.addEventListener(
        "touchstart",
        function (e) {
          if (!isPromoMobile()) return;
          promoTouchStartX = e.touches[0].clientX;
          promoTouchDeltaX = 0;
        },
        { passive: true }
      );

      promoViewport.addEventListener(
        "touchmove",
        function (e) {
          if (!isPromoMobile()) return;
          promoTouchDeltaX = e.touches[0].clientX - promoTouchStartX;
        },
        { passive: true }
      );

      promoViewport.addEventListener("touchend", function () {
        if (!isPromoMobile()) return;
        if (Math.abs(promoTouchDeltaX) > 40) {
          if (promoTouchDeltaX < 0 && promoIndex < getPromoMaxIndex()) promoIndex += 1;
          else if (promoTouchDeltaX > 0 && promoIndex > 0) promoIndex -= 1;
          updatePromoCarousel();
        }
        promoTouchDeltaX = 0;
      });
    }
  }

  /* Blogs carousel (mobile) */
  var blogsCarousel = document.querySelector("[data-blogs-carousel]");
  if (blogsCarousel) {
    var blogsTrack = blogsCarousel.querySelector("[data-blogs-track]");
    var blogsViewport = blogsCarousel.querySelector("[data-blogs-viewport]");
    var blogsDots = blogsCarousel.querySelector("[data-blogs-dots]");
    var blogsIndex = 0;
    var blogsGap = 16;

    function isBlogsMobile() {
      return window.innerWidth <= 768;
    }

    function getBlogCards() {
      return blogsTrack ? blogsTrack.querySelectorAll(".blog-card") : [];
    }

    function getBlogsGap() {
      if (!blogsTrack) return blogsGap;
      var styles = window.getComputedStyle(blogsTrack);
      return parseFloat(styles.gap) || blogsGap;
    }

    function getBlogsStep() {
      var cards = getBlogCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getBlogsGap();
    }

    function getBlogsMaxIndex() {
      var cards = getBlogCards();
      if (!cards.length) return 0;
      if (isBlogsMobile()) return cards.length - 1;
      return 0;
    }

    function buildBlogsDots() {
      if (!blogsDots) return;
      var cards = getBlogCards();
      blogsDots.innerHTML = "";
      if (!isBlogsMobile() || cards.length <= 1) return;

      cards.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "blogs-dot" + (i === blogsIndex ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to blog " + (i + 1));
        dot.addEventListener("click", function () {
          blogsIndex = i;
          updateBlogsCarousel();
        });
        blogsDots.appendChild(dot);
      });
    }

    function updateBlogsCarousel() {
      if (!blogsTrack) return;

      if (!isBlogsMobile()) {
        blogsTrack.style.transform = "translate3d(0, 0, 0)";
        blogsIndex = 0;
        if (blogsDots) blogsDots.innerHTML = "";
        return;
      }

      var maxIndex = getBlogsMaxIndex();
      if (blogsIndex > maxIndex) blogsIndex = maxIndex;
      if (blogsIndex < 0) blogsIndex = 0;

      blogsTrack.style.transform = "translate3d(-" + blogsIndex * getBlogsStep() + "px, 0, 0)";

      if (blogsDots) {
        blogsDots.querySelectorAll(".blogs-dot").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === blogsIndex);
        });
      }
    }

    buildBlogsDots();
    updateBlogsCarousel();

    window.addEventListener("resize", function () {
      buildBlogsDots();
      updateBlogsCarousel();
    });

    if (blogsViewport) {
      var blogsTouchStartX = 0;
      var blogsTouchDeltaX = 0;

      blogsViewport.addEventListener(
        "touchstart",
        function (e) {
          if (!isBlogsMobile()) return;
          blogsTouchStartX = e.touches[0].clientX;
          blogsTouchDeltaX = 0;
        },
        { passive: true }
      );

      blogsViewport.addEventListener(
        "touchmove",
        function (e) {
          if (!isBlogsMobile()) return;
          blogsTouchDeltaX = e.touches[0].clientX - blogsTouchStartX;
        },
        { passive: true }
      );

      blogsViewport.addEventListener("touchend", function () {
        if (!isBlogsMobile()) return;
        if (Math.abs(blogsTouchDeltaX) > 40) {
          if (blogsTouchDeltaX < 0 && blogsIndex < getBlogsMaxIndex()) blogsIndex += 1;
          else if (blogsTouchDeltaX > 0 && blogsIndex > 0) blogsIndex -= 1;
          updateBlogsCarousel();
        }
        blogsTouchDeltaX = 0;
      });
    }
  }

  /* Wellness Stack carousel */
  var wellness = document.querySelector("[data-wellness-carousel]");
  if (wellness) {
    var wsTrack = wellness.querySelector("[data-wellness-track]");
    var wsViewport = wellness.querySelector("[data-wellness-viewport]");
    var wsPrevBtn = wellness.querySelector("[data-wellness-prev]");
    var wsNextBtn = wellness.querySelector("[data-wellness-next]");
    var wsIndex = 0;
    var wsGap = 16;

    var wellnessProducts = [
      { id: 7, img: "assets/img/WS-1.png", alt: "One Daily Multivitamin", brand: "NutraNova Mega Men", name: "One Daily Multivitamin", desc: "Improves Energy, Immunity & Overall Health", rating: "4.6 (599 reviews)", price: "₹499", mrp: "₹579", off: "-13%", veg: false },
      { id: 8, img: "assets/img/WS-2.png", alt: "Sport Multivitamin", brand: "NutraNova Mega Men", name: "Sport Multivitamin", desc: "Supports Muscle Performance & Recovery", rating: "4.7 (171 reviews)", price: "₹749", mrp: "₹949", off: "-21%", veg: false },
      { id: 9, img: "assets/img/WS-3.png", alt: "Women One Daily Multivitamin", brand: "NutraNova Women's", name: "One Daily Multivitamin", desc: "Improves Energy, Immunity, Skin and Hair", rating: "4.6 (101 reviews)", price: "₹469", mrp: "₹619", off: "-24%", veg: false },
      { id: 10, img: "assets/img/WS-4.png", alt: "Men's Staminol Max", brand: "NutraNova", name: "Men's Staminol Max", desc: "Testosterone Booster for Long-Lasting Energy", rating: "4.7 (15 reviews)", price: "₹1,499", mrp: "₹2,669", off: "-43%", veg: true },
      { id: 11, img: "assets/img/WS-5.png", alt: "Hair Skin & Nails", brand: "NutraNova Women's", name: "Hair, Skin & Nails", desc: "For Stronger Hair, Clearer Skin, and Nails", rating: "4.7 (165 reviews)", price: "₹949", mrp: "₹1,019", off: "-6%", veg: false },
      { id: 12, img: "assets/img/WS-6.png", alt: "Triple Strength Fish Oil", brand: "NutraNova", name: "Triple Strength Fish Oil", desc: "Heart, Brain & Joint Health Support", rating: "4.6 (892 reviews)", price: "₹899", mrp: "₹1,199", off: "-25%", veg: false },
      { id: 19, img: "assets/img/WS-7.png", alt: "Ashwagandha Extract", brand: "NutraNova", name: "Ashwagandha Extract", desc: "Stress Relief, Stamina & Vitality Boost", rating: "4.8 (534 reviews)", price: "₹599", mrp: "₹799", off: "-25%", veg: true }
    ];

    function buildWellnessPriceHtml(product) {
      var html = '<span class="price-current">' + product.price + "</span>";
      if (product.mrp) {
        html += '<span class="price-mrp">' + product.mrp + "</span>";
      }
      if (product.off) {
        html += '<span class="price-off">' + product.off + "</span>";
      }
      return html;
    }

    function buildWellnessCardHtml(product) {
      var dietIcon = product.veg
        ? '<span class="veg-icon" aria-label="Vegetarian"></span>'
        : '<span class="nonveg-icon" aria-label="Non-Vegetarian"></span>';
      var href = catalog ? catalog.getUrl(product.id) : "product.html?id=" + product.id;

      return (
        '<article class="wellness-card">' +
        '<a href="' + href + '" class="product-card-link">' +
        '<div class="wellness-card-media">' +
        '<img src="' + product.img + '" alt="' + product.alt + '">' +
        dietIcon +
        "</div>" +
        '<p class="wellness-card-brand">' + product.brand + "</p>" +
        '<h3 class="wellness-card-name">' + product.name + "</h3>" +
        '<p class="wellness-card-desc">' + product.desc + "</p>" +
        '<div class="wellness-card-rating">' +
        '<i class="fa-solid fa-star"></i>' +
        "<span>" + product.rating + "</span>" +
        '<i class="fa-solid fa-circle-check verified"></i>' +
        "</div>" +
        '<div class="wellness-card-price">' + buildWellnessPriceHtml(product) + "</div>" +
        "</a>" +
        '<button type="button" class="wellness-card-btn">Add To Cart</button>' +
        "</article>"
      );
    }

    function getWsCards() {
      return wsTrack ? wsTrack.querySelectorAll(".wellness-card") : [];
    }

    function getWsGap() {
      if (!wsTrack) return wsGap;
      var styles = window.getComputedStyle(wsTrack);
      return parseFloat(styles.gap) || wsGap;
    }

    function getWsStep() {
      var cards = getWsCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getWsGap();
    }

    function getWsVisibleCount() {
      var cards = getWsCards();
      if (!wsViewport || !cards.length) return 1;
      var step = getWsStep();
      if (!step) return 1;
      return Math.max(1, Math.floor((wsViewport.offsetWidth + getWsGap()) / step));
    }

    function getWsMaxIndex() {
      var cards = getWsCards();
      if (!cards.length || !wsViewport || !wsTrack) return 0;

      var step = getWsStep();
      if (!step) return 0;

      var maxScroll = Math.max(0, wsTrack.scrollWidth - wsViewport.clientWidth);
      return Math.max(0, Math.round(maxScroll / step));
    }

    function updateWellnessCarousel() {
      var maxIndex = getWsMaxIndex();
      if (wsIndex > maxIndex) wsIndex = maxIndex;

      if (wsTrack) {
        wsTrack.style.transform = "translate3d(-" + wsIndex * getWsStep() + "px, 0, 0)";
      }

      if (wsPrevBtn) {
        var prevDisabled = wsIndex <= 0;
        wsPrevBtn.disabled = prevDisabled;
        wsPrevBtn.classList.toggle("is-disabled", prevDisabled);
      }

      if (wsNextBtn) {
        var nextDisabled = wsIndex >= maxIndex;
        wsNextBtn.disabled = nextDisabled;
        wsNextBtn.classList.toggle("is-disabled", nextDisabled);
      }
    }

    if (wsTrack) {
      wsTrack.innerHTML = wellnessProducts.map(buildWellnessCardHtml).join("");
    }

    if (wsPrevBtn) {
      wsPrevBtn.addEventListener("click", function () {
        if (wsIndex > 0) {
          wsIndex -= 1;
          updateWellnessCarousel();
        }
      });
    }

    if (wsNextBtn) {
      wsNextBtn.addEventListener("click", function () {
        if (wsIndex < getWsMaxIndex()) {
          wsIndex += 1;
          updateWellnessCarousel();
        }
      });
    }

    window.addEventListener("resize", function () {
      updateWellnessCarousel();
    });

    if (wsViewport) {
      var wsTouchStartX = 0;
      var wsTouchDeltaX = 0;

      wsViewport.addEventListener(
        "touchstart",
        function (e) {
          wsTouchStartX = e.touches[0].clientX;
          wsTouchDeltaX = 0;
        },
        { passive: true }
      );

      wsViewport.addEventListener(
        "touchmove",
        function (e) {
          wsTouchDeltaX = e.touches[0].clientX - wsTouchStartX;
        },
        { passive: true }
      );

      wsViewport.addEventListener("touchend", function () {
        if (Math.abs(wsTouchDeltaX) > 40) {
          if (wsTouchDeltaX < 0 && wsIndex < getWsMaxIndex()) wsIndex += 1;
          else if (wsTouchDeltaX > 0 && wsIndex > 0) wsIndex -= 1;
          updateWellnessCarousel();
        }
        wsTouchDeltaX = 0;
      });
    }

    requestAnimationFrame(function () {
      updateWellnessCarousel();
    });
  }

  /* Back to top */
  var backToTop = document.querySelector("[data-back-to-top]");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 400);
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Footer accordions (mobile) */
  var footerAccordions = document.querySelectorAll("[data-footer-accordion]");
  if (footerAccordions.length) {
    function isFooterMobile() {
      return window.innerWidth <= 768;
    }

    function resetFooterAccordions() {
      footerAccordions.forEach(function (item) {
        var trigger = item.querySelector(".footer-accordion-trigger");
        item.classList.remove("is-open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    }

    footerAccordions.forEach(function (item) {
      var trigger = item.querySelector(".footer-accordion-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function () {
        if (!isFooterMobile()) return;

        var isOpen = item.classList.contains("is-open");
        footerAccordions.forEach(function (other) {
          var otherTrigger = other.querySelector(".footer-accordion-trigger");
          other.classList.remove("is-open");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });

    window.addEventListener("resize", function () {
      if (!isFooterMobile()) resetFooterAccordions();
    });
  }

  /* Newly Launched Brands carousel */
  var brands = document.querySelector("[data-brands-carousel]");
  if (brands) {
    var brandTrack = brands.querySelector("[data-brands-track]");
    var brandViewport = brands.querySelector("[data-brands-viewport]");
    var brandPrevBtn = brands.querySelector("[data-brands-prev]");
    var brandNextBtn = brands.querySelector("[data-brands-next]");
    var brandIndex = 0;
    var brandGap = 12;
    var brandImages = [];

    for (var bi = 1; bi <= 12; bi++) {
      brandImages.push("assets/img/NL-" + bi + ".png");
    }

    function getBrandVisibleCount() {
      var w = window.innerWidth;
      if (w <= 576) return 2;
      if (w <= 768) return 3;
      if (w <= 1200) return 5;
      return 7;
    }

    if (brandTrack) {
      brandTrack.innerHTML = brandImages
        .map(function (src, i) {
          return (
            '<a href="#" class="brand-card">' +
            '<img src="' + src + '" alt="Newly launched brand ' + (i + 1) + '">' +
            "</a>"
          );
        })
        .join("");
    }

    function getBrandCards() {
      return brandTrack ? brandTrack.querySelectorAll(".brand-card") : [];
    }

    function getBrandGap() {
      if (!brandTrack) return brandGap;
      var styles = window.getComputedStyle(brandTrack);
      return parseFloat(styles.gap) || brandGap;
    }

    function syncBrandCardSizes() {
      if (!brandViewport) return;
      var visible = getBrandVisibleCount();
      var gap = getBrandGap();
      var cardWidth = (brandViewport.offsetWidth - gap * (visible - 1)) / visible;

      if (cardWidth <= 0) return;

      getBrandCards().forEach(function (card) {
        card.style.flex = "0 0 " + cardWidth + "px";
        card.style.width = cardWidth + "px";
      });
    }

    function getBrandStep() {
      var cards = getBrandCards();
      if (!cards.length) return 0;
      return cards[0].offsetWidth + getBrandGap();
    }

    function getBrandMaxIndex() {
      var cards = getBrandCards();
      var visible = getBrandVisibleCount();
      return Math.max(0, cards.length - visible);
    }

    function updateBrandCarousel() {
      syncBrandCardSizes();

      var maxIndex = getBrandMaxIndex();
      if (brandIndex > maxIndex) brandIndex = maxIndex;
      if (brandIndex < 0) brandIndex = 0;

      var step = getBrandStep();

      if (brandTrack && step > 0) {
        brandTrack.style.transform = "translate3d(-" + brandIndex * step + "px, 0, 0)";
      }

      if (brandPrevBtn) {
        var prevDisabled = brandIndex <= 0;
        brandPrevBtn.disabled = prevDisabled;
        brandPrevBtn.classList.toggle("is-disabled", prevDisabled);
      }

      if (brandNextBtn) {
        var nextDisabled = brandIndex >= maxIndex;
        brandNextBtn.disabled = nextDisabled;
        brandNextBtn.classList.toggle("is-disabled", nextDisabled);
      }
    }

    function brandNext() {
      if (brandIndex < getBrandMaxIndex()) {
        brandIndex += 1;
        updateBrandCarousel();
      }
    }

    function brandPrev() {
      if (brandIndex > 0) {
        brandIndex -= 1;
        updateBrandCarousel();
      }
    }

    if (brandPrevBtn) {
      brandPrevBtn.addEventListener("click", function () {
        brandPrev();
      });
    }

    if (brandNextBtn) {
      brandNextBtn.addEventListener("click", function () {
        brandNext();
      });
    }

    var touchStartX = 0;
    var touchDeltaX = 0;
    var isDragging = false;
    var dragStartX = 0;
    var didSwipe = false;

    if (brandViewport) {
      brandViewport.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.touches[0].clientX;
          touchDeltaX = 0;
          didSwipe = false;
        },
        { passive: true }
      );

      brandViewport.addEventListener(
        "touchmove",
        function (e) {
          touchDeltaX = e.touches[0].clientX - touchStartX;
          if (Math.abs(touchDeltaX) > 10) {
            didSwipe = true;
          }
        },
        { passive: true }
      );

      brandViewport.addEventListener("touchend", function () {
        if (Math.abs(touchDeltaX) > 40) {
          if (touchDeltaX < 0) brandNext();
          else brandPrev();
        }
        touchDeltaX = 0;
      });

      brandViewport.addEventListener("mousedown", function (e) {
        isDragging = true;
        dragStartX = e.clientX;
        touchDeltaX = 0;
        didSwipe = false;
        brandViewport.classList.add("is-dragging");
      });

      window.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        touchDeltaX = e.clientX - dragStartX;
        if (Math.abs(touchDeltaX) > 10) {
          didSwipe = true;
        }
      });

      window.addEventListener("mouseup", function () {
        if (!isDragging) return;
        isDragging = false;
        brandViewport.classList.remove("is-dragging");
        if (Math.abs(touchDeltaX) > 40) {
          if (touchDeltaX < 0) brandNext();
          else brandPrev();
        }
        touchDeltaX = 0;
      });

      brandViewport.addEventListener("click", function (e) {
        if (didSwipe) {
          e.preventDefault();
          didSwipe = false;
        }
      }, true);
    }

    window.addEventListener("resize", function () {
      updateBrandCarousel();
    });

    window.addEventListener("load", function () {
      updateBrandCarousel();
    });

    requestAnimationFrame(function () {
      updateBrandCarousel();
    });
  }
})();
