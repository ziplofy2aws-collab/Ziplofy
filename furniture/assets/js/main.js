(() => {
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const openBtn = document.querySelector("[data-mobile-menu-open]");

  if (!mobileMenu || !openBtn) {
    return;
  }

  const closeBtns = mobileMenu.querySelectorAll("[data-mobile-menu-close]");

  const openMenu = () => {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-menu-open");
  };

  const closeMenu = () => {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-menu-open");
    openBtn.focus();
  };

  openBtn.addEventListener("click", openMenu);

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });
})();

(() => {
  const navMenu = document.querySelector(".nav-menu");

  if (!navMenu) {
    return;
  }

  navMenu.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      navMenu.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }, { passive: false });
})();

(() => {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const nextBtn = slider.querySelector("[data-hero-next]");
  const prevBtn = slider.querySelector("[data-hero-prev]");
  let activeIndex = 0;

  const showSlide = (nextIndex) => {
    const totalSlides = slides.length;
    activeIndex = (nextIndex + totalSlides) % totalSlides;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showSlide(activeIndex + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showSlide(activeIndex - 1);
    });
  }
})();

(() => {
  const carousel = document.querySelector("[data-products-carousel]");

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector("[data-products-track]");
  const nextBtn = carousel.querySelector("[data-products-next]");

  if (!track || !nextBtn) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".product-card"));
  const getStepWidth = () => {
    const firstCard = cards[0];

    if (!firstCard) {
      return 0;
    }

    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  nextBtn.addEventListener("click", () => {
    const stepWidth = getStepWidth();
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const nextScroll = track.scrollLeft + stepWidth;

    if (nextScroll >= maxScrollLeft - 1) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: stepWidth, behavior: "smooth" });
    }
  });
})();

(() => {
  const carousel = document.querySelector("[data-exclusive-carousel]");

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector("[data-exclusive-track]");
  const nextBtn = carousel.querySelector("[data-exclusive-next]");
  const prevBtn = carousel.querySelector("[data-exclusive-prev]");
  const cards = track ? Array.from(track.querySelectorAll(".exclusive-card")) : [];

  if (!track || !nextBtn || !prevBtn || !cards.length) {
    return;
  }

  const getStepWidth = () => {
    const firstCard = cards[0];
    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  nextBtn.addEventListener("click", () => {
    const stepWidth = getStepWidth();
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const nextScroll = track.scrollLeft + stepWidth;

    if (nextScroll >= maxScrollLeft - 1) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: stepWidth, behavior: "smooth" });
    }
  });

  prevBtn.addEventListener("click", () => {
    const stepWidth = getStepWidth();
    const prevScroll = track.scrollLeft - stepWidth;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;

    if (prevScroll <= 0) {
      track.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
    } else {
      track.scrollBy({ left: -stepWidth, behavior: "smooth" });
    }
  });
})();

(() => {
  const gallery = document.querySelector("[data-pdp-gallery]");

  if (!gallery) {
    return;
  }

  const mainImg = gallery.querySelector("[data-pdp-main-img]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-pdp-thumb][data-src]"));
  const prevBtn = gallery.querySelector("[data-pdp-prev]");
  const nextBtn = gallery.querySelector("[data-pdp-next]");
  let activeIndex = 0;

  if (!mainImg || !thumbs.length) {
    return;
  }

  const showThumb = (index) => {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const btn = thumbs[activeIndex];
    const nextSrc = btn.getAttribute("data-src");

    if (nextSrc) {
      mainImg.src = nextSrc;
    }

    thumbs.forEach((t, i) => {
      t.classList.toggle("is-active", i === activeIndex);
      t.setAttribute("aria-selected", String(i === activeIndex));
    });
  };

  thumbs.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      showThumb(index);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showThumb(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showThumb(activeIndex + 1);
    });
  }

  document.querySelectorAll(".pdp-orient-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pdp-orient-btn").forEach((b) => {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      const label = document.querySelector(".pdp-section__label strong");
      const name = btn.querySelector(".pdp-orient-btn__name")?.textContent;
      if (label && name) {
        label.textContent = name;
      }
    });
  });
})();

(() => {
  const tabsRoot = document.querySelector("[data-pdp-tabs]");

  if (!tabsRoot) {
    return;
  }

  const tabButtons = Array.from(tabsRoot.querySelectorAll("[data-pdp-tab]"));
  const panels = Array.from(tabsRoot.querySelectorAll(".pdp-tab-panel"));

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = btn.getAttribute("data-pdp-tab");
      const targetPanel = panelId ? document.getElementById(panelId) : null;

      if (!targetPanel) {
        return;
      }

      tabButtons.forEach((t) => {
        const isActive = t === btn;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel === targetPanel;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });

      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  });
})();

(() => {
  const mobileCartBtn = document.querySelector("[data-mobile-add-cart]");
  const desktopCartBtn = document.querySelector(".pdp-btn-cart");

  if (!mobileCartBtn || !desktopCartBtn) {
    return;
  }

  mobileCartBtn.addEventListener("click", () => {
    desktopCartBtn.click();
  });
})();

(() => {
  const scrollTopBtn = document.querySelector("[data-scroll-top]");

  if (!scrollTopBtn) {
    return;
  }

  const toggleVisibility = () => {
    scrollTopBtn.classList.toggle("is-visible", window.scrollY > 400);
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

(() => {
  const wrap = document.querySelector("[data-qty]");

  if (!wrap) {
    return;
  }

  const input = wrap.querySelector("[data-qty-input]");
  const minus = wrap.querySelector("[data-qty-minus]");
  const plus = wrap.querySelector("[data-qty-plus]");

  if (!input || !minus || !plus) {
    return;
  }

  const clamp = (n) => {
    const min = Number(input.min) || 1;
    const max = Number(input.max) || 99;
    return Math.min(max, Math.max(min, n));
  };

  minus.addEventListener("click", () => {
    input.value = String(clamp(Number(input.value || 1) - 1));
  });

  plus.addEventListener("click", () => {
    input.value = String(clamp(Number(input.value || 1) + 1));
  });

  input.addEventListener("change", () => {
    input.value = String(clamp(Number.parseInt(input.value, 10) || 1));
  });
})();

(() => {
  const filterDrawer = document.querySelector("[data-filter-drawer]");
  const sortSheet = document.querySelector("[data-sort-sheet]");
  const categorySheet = document.querySelector("[data-category-sheet]");

  if (!filterDrawer && !sortSheet && !categorySheet) {
    return;
  }

  const filterOpenBtns = document.querySelectorAll("[data-filter-open]");
  const sortOpenBtn = document.querySelector("[data-sort-open]");
  const categoryOpenBtn = document.querySelector("[data-category-open]");

  const closeAll = () => {
    if (filterDrawer) {
      filterDrawer.classList.remove("is-open");
      filterDrawer.setAttribute("aria-hidden", "true");
    }

    if (sortSheet) {
      sortSheet.classList.remove("is-open");
      sortSheet.setAttribute("aria-hidden", "true");
    }

    if (categorySheet) {
      categorySheet.classList.remove("is-open");
      categorySheet.setAttribute("aria-hidden", "true");
    }

    filterOpenBtns.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });

    if (sortOpenBtn) {
      sortOpenBtn.setAttribute("aria-expanded", "false");
    }

    if (categoryOpenBtn) {
      categoryOpenBtn.setAttribute("aria-expanded", "false");
    }

    document.body.classList.remove("filter-drawer-open", "cat-sheet-open");
  };

  const openFilter = () => {
    closeAll();

    if (!filterDrawer) {
      return;
    }

    filterDrawer.classList.add("is-open");
    filterDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("filter-drawer-open");
    filterOpenBtns.forEach((btn) => {
      btn.setAttribute("aria-expanded", "true");
    });
  };

  const openSort = () => {
    closeAll();

    if (!sortSheet) {
      return;
    }

    sortSheet.classList.add("is-open");
    sortSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("cat-sheet-open");

    if (sortOpenBtn) {
      sortOpenBtn.setAttribute("aria-expanded", "true");
    }
  };

  const openCategory = () => {
    closeAll();

    if (!categorySheet) {
      return;
    }

    categorySheet.classList.add("is-open");
    categorySheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("cat-sheet-open");

    if (categoryOpenBtn) {
      categoryOpenBtn.setAttribute("aria-expanded", "true");
    }
  };

  filterOpenBtns.forEach((btn) => {
    btn.addEventListener("click", openFilter);
  });

  if (sortOpenBtn) {
    sortOpenBtn.addEventListener("click", openSort);
  }

  if (categoryOpenBtn) {
    categoryOpenBtn.addEventListener("click", openCategory);
  }

  document.querySelectorAll("[data-filter-close], [data-sheet-close]").forEach((btn) => {
    btn.addEventListener("click", closeAll);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });

  const resetBtn = filterDrawer?.querySelector("[data-filter-reset]");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      filterDrawer.querySelectorAll("input[type='checkbox']").forEach((input) => {
        input.checked = false;
      });

      const sortRadios = filterDrawer.querySelectorAll("input[name='sort-filter']");
      sortRadios.forEach((input, index) => {
        input.checked = index === 0;
      });

      filterDrawer.querySelectorAll(".filter-accordion[open]").forEach((item) => {
        item.removeAttribute("open");
      });
    });
  }

  const filterPanel = filterDrawer?.querySelector(".filter-drawer__panel");

  if (filterPanel) {
    filterPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  const sortPanel = sortSheet?.querySelector(".cat-sheet__panel");

  if (sortPanel) {
    sortPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  const categoryPanel = categorySheet?.querySelector(".cat-sheet__panel");

  if (categoryPanel) {
    categoryPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  sortSheet?.querySelectorAll(".cat-sort-list__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sortSheet.querySelectorAll(".cat-sort-list__btn").forEach((item) => {
        item.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      closeAll();
    });
  });

  categorySheet?.querySelectorAll(".cat-category-list a").forEach((link) => {
    link.addEventListener("click", closeAll);
  });
})();

(() => {
  if (typeof PRODUCT_CATALOG === "undefined" || typeof getProductUrl !== "function") {
    return;
  }

  const cardSelector = ".product-card, .plp-card, .exclusive-card, .similar-card";
  const skipClick = "button, .plp-card__wish, .similar-card__wish, .exclusive-card__cta";

  document.querySelectorAll(cardSelector).forEach((card) => {
    const productId = resolveProductIdFromCard(card);

    if (!productId) {
      return;
    }

    card.dataset.productId = productId;
    card.classList.add("is-product-card");

    const productUrl = getProductUrl(productId);

    card.querySelectorAll(
      ".product-card__media, .plp-card__media, .plp-card__title a, .exclusive-card__media, .similar-card__media, .similar-card__title a"
    ).forEach((link) => {
      link.setAttribute("href", productUrl);
    });

    card.addEventListener("click", (event) => {
      if (event.target.closest(skipClick)) {
        return;
      }

      if (event.target.closest("a")) {
        return;
      }

      window.location.href = productUrl;
    });
  });
})();

(() => {
  const pdpPage = document.querySelector("[data-pdp-page]");

  if (!pdpPage || typeof getProductById !== "function") {
    return;
  }

  const product = getProductById(getProductIdFromUrl());

  const titleEl = document.querySelector(".pdp-info__title");
  const reviewsEl = document.querySelector(".pdp-info__reviews");
  const starsEl = document.querySelector(".pdp-info__rating .pdp-stars");
  const priceMainEl = document.querySelector(".pdp-price-main");
  const priceOffEl = document.querySelector(".pdp-price-off");
  const mrpEl = document.querySelector(".pdp-mrp span");
  const buyPriceEl = document.querySelector(".pdp-buy-price strong");
  const dealTagEl = document.querySelector(".pdp-deal-tag");
  const orientationSection = document.querySelector("[data-pdp-orientation]");
  const breadcrumbCurrent = document.querySelector("[data-pdp-breadcrumb-current]");
  const mainImg = document.querySelector("[data-pdp-main-img]");

  if (titleEl) {
    titleEl.textContent = product.title;
  }

  document.title = `${product.title.split("(")[0].trim()} | Furniture`;

  if (reviewsEl) {
    reviewsEl.textContent = product.reviews;
  }

  if (starsEl && typeof buildStarIconsHtml === "function") {
    starsEl.innerHTML = buildStarIconsHtml(product.rating);
    starsEl.setAttribute("aria-label", `Rated ${product.rating} out of 5 stars`);
  }

  if (priceMainEl) {
    priceMainEl.textContent = product.price;
  }

  if (priceOffEl) {
    priceOffEl.textContent = product.off;
  }

  if (mrpEl) {
    mrpEl.textContent = product.mrp;
  }

  if (buyPriceEl) {
    buyPriceEl.textContent = product.price;
  }

  document.querySelectorAll(".pdp-orient-btn__price").forEach((el) => {
    el.textContent = product.price;
  });

  if (dealTagEl) {
    dealTagEl.hidden = !product.deal;
  }

  if (orientationSection) {
    orientationSection.hidden = !product.showOrientation;
  }

  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = product.category;
  }

  if (mainImg && product.images?.length) {
    mainImg.src = product.images[0];
    mainImg.alt = product.title;

    const thumbs = Array.from(document.querySelectorAll("[data-pdp-thumb][data-src]"));

    product.images.forEach((src, index) => {
      const thumb = thumbs[index];

      if (!thumb) {
        return;
      }

      thumb.setAttribute("data-src", src);
      const thumbImg = thumb.querySelector("img");

      if (thumbImg) {
        thumbImg.src = src;
      }

      thumb.hidden = false;
    });

    for (let i = product.images.length; i < thumbs.length; i += 1) {
      if (!thumbs[i].classList.contains("pdp-thumb--more")) {
        thumbs[i].hidden = true;
      }
    }
  }
})();
