(() => {
  const PRODUCT_STORAGE_KEY = "stepupSelectedProduct";

  const readText = (root, selectors) => {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) {
        return text;
      }
    }
    return "";
  };

  const saveSelectedProduct = (card, productKey) => {
    if (!productKey) {
      return;
    }

    const imageEl = card.querySelector("img");
    const newPrice =
      readText(card, [".price-line strong", ".deal-price strong", ".sale-card__price strong"]) || "₹3,999";
    const oldPrice =
      readText(card, [".price-line del", ".deal-price del", ".sale-card__price del"]) || "₹6,999";
    const discount =
      readText(card, [".price-line em", ".deal-price em", ".sale-card__price em"]) || "43% off";
    const title =
      readText(card, [".product-info h3", ".deal-body h3", ".sale-card__body h3"]) || "Urban Runner X";
    const tag =
      readText(card, [".product-sub", ".deal-specs span:first-child", ".sale-card__featurebar span"]) ||
      "Premium comfort and performance";

    const selectedProduct = {
      key: productKey,
      title,
      tag,
      image: imageEl?.getAttribute("src") || "assets/img/product-main-buds.png",
      oldPrice,
      newPrice,
      discount,
    };

    try {
      sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(selectedProduct));
    } catch (_error) {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
  };

  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(document.querySelectorAll(".hero-dots .dot"));
  const heroPrev = document.querySelector(".hero-arrow-left");
  const heroNext = document.querySelector(".hero-arrow-right");
  const heroSection = document.querySelector(".cinematic-hero");

  let activeSlide = heroDots.findIndex((dot) => dot.classList.contains("dot-active"));
  let autoSlideTimer = null;

  if (activeSlide < 0) {
    activeSlide = 0;
  }

  const setActiveSlide = (index) => {
    if (!heroDots.length || !heroSlides.length) {
      return;
    }
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === activeSlide);
    });
    heroDots.forEach((dot, idx) => {
      dot.classList.toggle("dot-active", idx === activeSlide);
    });
  };

  const startAutoSlide = () => {
    if (!heroSlides.length) {
      return;
    }
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
      setActiveSlide(activeSlide + 1);
    }, 4500);
  };

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveSlide(index);
      startAutoSlide();
    });
  });

  if (heroPrev) {
    heroPrev.addEventListener("click", () => {
      setActiveSlide(activeSlide - 1);
      startAutoSlide();
    });
  }

  if (heroNext) {
    heroNext.addEventListener("click", () => {
      setActiveSlide(activeSlide + 1);
      startAutoSlide();
    });
  }

  if (heroSection) {
    heroSection.addEventListener("mouseenter", () => {
      clearInterval(autoSlideTimer);
    });
    heroSection.addEventListener("mouseleave", () => {
      startAutoSlide();
    });
  }

  setActiveSlide(activeSlide);
  startAutoSlide();

  const categoryTrack = document.getElementById("categoryTrack");
  const categoryNext = document.getElementById("categoryNext");

  if (categoryTrack && categoryNext) {
    categoryNext.addEventListener("click", () => {
      const firstCard = categoryTrack.querySelector(".category-card");
      if (!firstCard) {
        return;
      }
      const cardWidth = firstCard.getBoundingClientRect().width + 22;
      const maxScrollLeft = categoryTrack.scrollWidth - categoryTrack.clientWidth - 5;
      const nextLeft = Math.min(categoryTrack.scrollLeft + cardWidth, maxScrollLeft);
      categoryTrack.scrollTo({ left: nextLeft, behavior: "smooth" });

      if (nextLeft >= maxScrollLeft) {
        setTimeout(() => {
          categoryTrack.scrollTo({ left: 0, behavior: "smooth" });
        }, 420);
      }
    });
  }

  const saleLiveTrack = document.getElementById("saleLiveTrack");
  const saleLivePrev = document.getElementById("saleLivePrev");
  const saleLiveNext = document.getElementById("saleLiveNext");

  if (saleLiveTrack) {
    const getSaleStep = () => {
      const cards = saleLiveTrack.querySelectorAll(".sale-card");
      const firstCard = cards[0];
      if (!firstCard) {
        return 240;
      }
      const firstWidth = firstCard.getBoundingClientRect().width;
      if (cards.length > 1) {
        const secondLeft = cards[1].getBoundingClientRect().left;
        const firstLeft = firstCard.getBoundingClientRect().left;
        return secondLeft - firstLeft;
      }
      return firstWidth + 16;
    };

    const scrollSaleTrack = (direction) => {
      saleLiveTrack.scrollBy({ left: direction * getSaleStep(), behavior: "smooth" });
    };

    if (saleLivePrev) {
      saleLivePrev.addEventListener("click", () => scrollSaleTrack(-1));
    }
    if (saleLiveNext) {
      saleLiveNext.addEventListener("click", () => scrollSaleTrack(1));
    }
  }

  const testimonialTrack = document.getElementById("testimonialTrack");
  const testimonialPrev = document.getElementById("testimonialPrev");
  const testimonialNext = document.getElementById("testimonialNext");

  if (testimonialTrack) {
    const testimonialCards = Array.from(testimonialTrack.querySelectorAll(".testimonial-card"));
    const columnsCount = Math.floor(testimonialCards.length / 2);
    let activeColumn = 1;

    const getTestimonialStep = () => {
      const card = testimonialCards[0];
      return card ? card.getBoundingClientRect().width + 12 : 292;
    };

    const renderActiveTestimonialColumn = () => {
      testimonialCards.forEach((card) => card.classList.remove("is-featured"));
      const topCard = testimonialCards[activeColumn * 2];
      const bottomCard = testimonialCards[activeColumn * 2 + 1];
      if (topCard) topCard.classList.add("is-featured");
      if (bottomCard) bottomCard.classList.add("is-featured");
      testimonialTrack.scrollTo({ left: activeColumn * getTestimonialStep(), behavior: "smooth" });
    };

    renderActiveTestimonialColumn();

    if (testimonialPrev) {
      testimonialPrev.addEventListener("click", () => {
        activeColumn = (activeColumn - 1 + columnsCount) % columnsCount;
        renderActiveTestimonialColumn();
      });
    }

    if (testimonialNext) {
      testimonialNext.addEventListener("click", () => {
        activeColumn = (activeColumn + 1) % columnsCount;
        renderActiveTestimonialColumn();
      });
    }
  }

  const homeProductCards = Array.from(document.querySelectorAll(".product-card[data-product], .deal-card[data-product], .sale-card[data-product]"));

  homeProductCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      const interactiveEl = event.target.closest("button, a, input, label");
      if (interactiveEl) {
        return;
      }
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const productKey = card.dataset.product;
      if (!productKey) {
        return;
      }
      saveSelectedProduct(card, productKey);
      window.location.href = `product.html?product=${encodeURIComponent(productKey)}`;
    });
  });

  const influencerGrid = document.getElementById("influencerShowcaseGrid");
  if (influencerGrid) {
    const influencerCards = Array.from(influencerGrid.querySelectorAll("[data-influencer-card]"));
    const mqCarousel = window.matchMedia("(max-width: 640px)");

    const syncInfluencerActive = () => {
      if (!mqCarousel.matches || !influencerCards.length) {
        influencerCards.forEach((c) => c.classList.remove("is-active"));
        return;
      }
      const rect = influencerGrid.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let best = null;
      let bestDist = Infinity;
      influencerCards.forEach((card) => {
        const cr = card.getBoundingClientRect();
        const mid = cr.left + cr.width / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = card;
        }
      });
      influencerCards.forEach((c) => c.classList.toggle("is-active", c === best));
    };

    let raf = 0;
    const scheduleSync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncInfluencerActive);
    };

    influencerGrid.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    if (typeof mqCarousel.addEventListener === "function") {
      mqCarousel.addEventListener("change", scheduleSync);
    } else {
      mqCarousel.addListener(scheduleSync);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(scheduleSync, { root: influencerGrid, threshold: [0.15, 0.35, 0.55, 0.75] });
      influencerCards.forEach((c) => io.observe(c));
    }

    scheduleSync();
  }
})();
