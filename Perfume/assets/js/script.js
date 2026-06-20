(() => {
  const offerText = document.querySelector(".offer-text");
  const offerArrows = document.querySelectorAll(".offer-arrow");
  if (offerText && offerArrows.length > 0) {
    const offers = [
      "Buy Any 3 Perfumes @ \u20B9367 Each",
      "Flat 15% Off On Bestsellers",
      "Free Shipping On Orders Above \u20B9499"
    ];

    let activeOffer = 0;

    const updateOffer = () => {
      offerText.textContent = offers[activeOffer];
    };

    offerArrows.forEach((button, index) => {
      button.addEventListener("click", () => {
        activeOffer = index === 0
          ? (activeOffer - 1 + offers.length) % offers.length
          : (activeOffer + 1) % offers.length;
        updateOffer();
      });
    });
  }

  const initNavDrawer = () => {
    const drawer = document.getElementById("site-nav-drawer");
    const openBtn = document.querySelector(".nav-menu-btn");
    const closeBtn = drawer?.querySelector(".nav-drawer-close");
    const backdrop = drawer?.querySelector(".nav-drawer-backdrop");

    if (!drawer || !openBtn) {
      return;
    }

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let lastFocus = null;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-drawer-open", open);
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");

      if ("inert" in HTMLElement.prototype) {
        drawer.inert = !open;
      }

      if (open) {
        lastFocus = document.activeElement;
        const panel = drawer.querySelector(".nav-drawer-panel");
        const focusable = panel?.querySelectorAll(focusableSelector);
        const first = focusable?.[0];
        if (first instanceof HTMLElement) {
          first.focus();
        }
      } else if (lastFocus instanceof HTMLElement) {
        lastFocus.focus();
      }
    };

    openBtn.addEventListener("click", () => {
      setOpen(!drawer.classList.contains("is-open"));
    });

    closeBtn?.addEventListener("click", () => setOpen(false));
    backdrop?.addEventListener("click", () => setOpen(false));

    drawer.querySelectorAll(".nav-drawer-nav a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  };

  const initFooterAccordion = () => {
    const isMobileViewport = () => window.matchMedia("(max-width: 980px)").matches;
    const footerCols = [...document.querySelectorAll(".site-footer .footer-col:not(.footer-newsletter)")];

    if (footerCols.length === 0) {
      return;
    }

    const closeAll = () => {
      footerCols.forEach((col) => {
        col.classList.remove("is-open");
        const heading = col.querySelector("h3");
        if (heading) {
          heading.setAttribute("aria-expanded", "false");
        }
      });
    };

    footerCols.forEach((col) => {
      const heading = col.querySelector("h3");
      if (!heading) {
        return;
      }

      heading.setAttribute("role", "button");
      heading.setAttribute("tabindex", "0");
      heading.setAttribute("aria-expanded", "false");

      const toggle = () => {
        if (!isMobileViewport()) {
          return;
        }
        const willOpen = !col.classList.contains("is-open");
        closeAll();
        if (willOpen) {
          col.classList.add("is-open");
          heading.setAttribute("aria-expanded", "true");
        }
      };

      heading.addEventListener("click", toggle);
      heading.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    window.addEventListener("resize", () => {
      if (!isMobileViewport()) {
        closeAll();
      }
    });
  };

  initNavDrawer();
  initFooterAccordion();

  const slider = document.querySelector(".hero-slider");
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll(".hero-dot")];
  const prevBtn = document.querySelector(".hero-prev");
  const nextBtn = document.querySelector(".hero-next");

  if (!slider || slides.length === 0 || !prevBtn || !nextBtn) {
    return;
  }

  const imageExtensions = ["webp", "jpg", "jpeg", "png"];
  const triedExtensions = new Map();

  const loadWithFallback = (img) => {
    const bannerNo = img.dataset.banner;
    if (!bannerNo) {
      return;
    }

    const currentTried = triedExtensions.get(bannerNo) ?? 1;
    triedExtensions.set(bannerNo, currentTried);

    img.addEventListener("error", () => {
      const attempt = triedExtensions.get(bannerNo) ?? 1;
      if (attempt >= imageExtensions.length) {
        return;
      }

      triedExtensions.set(bannerNo, attempt + 1);
      const nextExt = imageExtensions[attempt];
      img.src = `assets/img/hero-banner-${bannerNo}.${nextExt}`;
    });
  };

  slides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (img) {
      loadWithFallback(img);
    }
  });

  let activeSlide = Number(slider.dataset.currentSlide || 0);

  const goToSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slider.dataset.currentSlide = String(activeSlide);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  };

  prevBtn.addEventListener("click", () => goToSlide(activeSlide - 1));
  nextBtn.addEventListener("click", () => goToSlide(activeSlide + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  const collectionImages = [...document.querySelectorAll(".collection-tile img")];
  const collectionExtensions = ["png", "webp", "jpg", "jpeg"];

  collectionImages.forEach((img) => {
    const originalSrc = img.getAttribute("src") || "";
    const filePrefix = originalSrc.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    let extIndex = 0;

    img.addEventListener("error", () => {
      extIndex += 1;
      if (extIndex >= collectionExtensions.length) {
        return;
      }
      img.src = `${filePrefix}.${collectionExtensions[extIndex]}`;
    });
  });

  const getCardsPerView = () => {
    if (window.innerWidth <= 980) {
      return 1;
    }
    return 5;
  };

  const productExtensions = ["png", "webp", "jpg", "jpeg"];
  const productImages = [...document.querySelectorAll(".product-card img")];

  productImages.forEach((img) => {
    const originalSrc = img.getAttribute("src") || "";
    const filePrefix = originalSrc.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    let extIndex = 0;

    img.addEventListener("error", () => {
      extIndex += 1;
      if (extIndex >= productExtensions.length) {
        return;
      }
      img.src = `${filePrefix}.${productExtensions[extIndex]}`;
    });
  });

  const productSliders = [...document.querySelectorAll(".product-slider")];

  productSliders.forEach((productSlider) => {
    const productTrack = productSlider.querySelector(".product-track");
    const productCards = [...productSlider.querySelectorAll(".product-card")];
    const productPrev = productSlider.querySelector(".product-prev");
    const productNext = productSlider.querySelector(".product-next");

    if (!productTrack || productCards.length === 0 || !productPrev || !productNext) {
      return;
    }

    let currentCard = Number(productSlider.dataset.currentCard || 0);

    const updateProductSlider = () => {
      const cardWidth = productCards[0].offsetWidth;
      const trackStyle = window.getComputedStyle(productTrack);
      const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap || "0");
      const cardsPerView = getCardsPerView();
      const maxStart = Math.max(0, productCards.length - cardsPerView);

      currentCard = Math.max(0, Math.min(currentCard, maxStart));
      productSlider.dataset.currentCard = String(currentCard);

      const translateX = currentCard * (cardWidth + gap);
      productTrack.style.transform = `translateX(-${translateX}px)`;
    };

    productPrev.addEventListener("click", () => {
      currentCard -= 1;
      updateProductSlider();
    });

    productNext.addEventListener("click", () => {
      currentCard += 1;
      updateProductSlider();
    });

    window.addEventListener("resize", updateProductSlider);
    updateProductSlider();
  });

  const testimonialSlider = document.querySelector(".testimonial-slider");
  if (!testimonialSlider) {
    const productCards = [...document.querySelectorAll(".product-card")];
    productCards.forEach((card) => {
      const image = card.querySelector("img");
      const source = image?.getAttribute("src") || "";
      const match = source.match(/(product-\d+|new-arrival-\d+)/i);
      const key = card.dataset.productKey || (match ? match[1].toLowerCase() : "");
      if (!key) {
        return;
      }

      card.dataset.productKey = key;
      card.style.cursor = "pointer";
      card.addEventListener("click", (event) => {
        if (event.target.closest("button")) {
          event.preventDefault();
        }
        window.location.href = `product.html?product=${encodeURIComponent(key)}`;
      });
    });
    return;
  }

  const testimonialCards = [...testimonialSlider.querySelectorAll(".testimonial-card")];
  const testimonialPrev = testimonialSlider.querySelector(".testimonial-prev");
  const testimonialNext = testimonialSlider.querySelector(".testimonial-next");
  const testimonialStage = testimonialSlider.querySelector(".testimonial-stage");
  const testimonialTrack = testimonialSlider.querySelector(".testimonial-track");

  if (testimonialCards.length < 1 || !testimonialPrev || !testimonialNext || !testimonialStage || !testimonialTrack) {
    return;
  }

  const testimonialExts = ["png", "webp", "jpg", "jpeg"];
  testimonialCards.forEach((card) => {
    const img = card.querySelector("img");
    if (!img) {
      return;
    }

    const originalSrc = img.getAttribute("src") || "";
    const filePrefix = originalSrc.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    let extIndex = 0;

    img.addEventListener("error", () => {
      extIndex += 1;
      if (extIndex >= testimonialExts.length) {
        return;
      }
      img.src = `${filePrefix}.${testimonialExts[extIndex]}`;
    });
  });

  let activeIndex = Number(testimonialSlider.dataset.activeTestimonial || 0);
  activeIndex = Math.min(Math.max(activeIndex, 0), testimonialCards.length - 1);

  const centerTestimonialTrack = () => {
    const active = testimonialCards[activeIndex];
    if (!active) {
      return;
    }
    const stageWidth = testimonialStage.clientWidth;
    const cardCenter = active.offsetLeft + active.offsetWidth / 2;
    const offset = cardCenter - stageWidth / 2;
    testimonialTrack.style.transform = `translateX(${-offset}px)`;
  };

  const updateTestimonials = () => {
    testimonialCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
    });

    testimonialSlider.dataset.activeTestimonial = String(activeIndex);
    requestAnimationFrame(() => {
      centerTestimonialTrack();
    });
  };

  testimonialPrev.addEventListener("click", () => {
    activeIndex = (activeIndex - 1 + testimonialCards.length) % testimonialCards.length;
    updateTestimonials();
  });

  testimonialNext.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % testimonialCards.length;
    updateTestimonials();
  });

  updateTestimonials();

  window.addEventListener("resize", () => {
    centerTestimonialTrack();
  });

  window.addEventListener("load", () => {
    centerTestimonialTrack();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => centerTestimonialTrack());
  }

  testimonialCards.forEach((card) => {
    const img = card.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", () => centerTestimonialTrack(), { once: true });
    }
  });

  const productCards = [...document.querySelectorAll(".product-card")];
  productCards.forEach((card) => {
    const image = card.querySelector("img");
    const source = image?.getAttribute("src") || "";
    const match = source.match(/(product-\d+|new-arrival-\d+)/i);
    const key = card.dataset.productKey || (match ? match[1].toLowerCase() : "");
    if (!key) {
      return;
    }

    card.dataset.productKey = key;
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        event.preventDefault();
      }
      window.location.href = `product.html?product=${encodeURIComponent(key)}`;
    });
  });
})();
