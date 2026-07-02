/* Brewloom Coffee Co. — Shared interactions (all pages) */

(function () {
  "use strict";

  const header = document.querySelector("[data-cf2-header]");

  if (header) {
    const nav = header.querySelector("#cf2-primary-nav");
    const toggle = header.querySelector("[data-cf2-menu-toggle]");
    const closeBtn = header.querySelector("[data-cf2-menu-close]");
    const overlay = header.querySelector("[data-cf2-menu-overlay]");

    const mqDesktop = window.matchMedia("(min-width: 901px)");

    function openMenu() {
      if (!nav) return;
      nav.classList.add("is-open");
      if (overlay) {
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("is-visible"));
      }
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      if (!nav) return;
      nav.classList.remove("is-open");
      if (overlay) {
        overlay.classList.remove("is-visible");
        overlay.hidden = true;
      }
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (toggle) toggle.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    mqDesktop.addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }

  /* ── Best Sellers carousel ── */

  const bs = document.querySelector("[data-cf2-bs]");
  if (bs) {
    const track = bs.querySelector("[data-cf2-bs-track]");
    const prevBtn = bs.querySelector("[data-cf2-bs-prev]");
    const nextBtn = bs.querySelector("[data-cf2-bs-next]");
    const cards = Array.from(track.children);
    let index = 0;

    function visibleCount() {
      if (window.innerWidth <= 560) return 2;
      if (window.innerWidth <= 1024) return 3;
      return 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    function step() {
      if (cards.length < 2) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function update() {
      index = Math.min(index, maxIndex());
      index = Math.max(index, 0);
      track.style.transform = `translateX(-${index * step()}px)`;
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        index = Math.min(index + 1, maxIndex());
        update();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        index = Math.max(index - 1, 0);
        update();
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(update, 150);
    });

    update();
  }

  /* ── Promo video play/pause ── */

  const promoToggle = document.querySelector("[data-cf2-promo-toggle]");
  const promoVideo = document.querySelector("[data-cf2-promo-video]");
  if (promoToggle && promoVideo) {
    const icon = promoToggle.querySelector("i");

    function syncIcon() {
      const paused = promoVideo.paused;
      if (icon) {
        icon.classList.toggle("fa-play", paused);
        icon.classList.toggle("fa-pause", !paused);
      }
      promoToggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    }

    promoToggle.addEventListener("click", () => {
      if (promoVideo.paused) {
        promoVideo.play();
      } else {
        promoVideo.pause();
      }
    });

    promoVideo.addEventListener("play", syncIcon);
    promoVideo.addEventListener("pause", syncIcon);
    syncIcon();
  }

  /* ── Back to top ── */

  const toTop = document.querySelector("[data-cf2-to-top]");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── Product catalog: card → product page ── */

  const RUPEE = "\u20B9";
  const PRODUCTS = {
    "dark-roast": {
      name: "Dark Roast",
      title: "Dark Roast Whole Bean",
      subtitle: "100% Arabica Coffee",
      category: "Coffee Beans",
      price: RUPEE + "699",
      image: "assets/img/BS-1.png",
      desc: "Bold, rich and intensely smooth. Our Dark Roast is crafted for those who love a strong and flavorful cup of coffee."
    },
    "espresso-blend": {
      name: "Espresso Blend",
      title: "Espresso Blend Whole Bean",
      subtitle: "Rich Espresso Roast",
      category: "Coffee Beans",
      price: RUPEE + "749",
      image: "assets/img/BS-2.png",
      desc: "A dark, syrupy blend built for espresso — deep crema, chocolatey body and a lingering, satisfying finish."
    },
    "medium-roast": {
      name: "Medium Roast",
      title: "Medium Roast Whole Bean",
      subtitle: "Balanced & Smooth",
      category: "Coffee Beans",
      price: RUPEE + "699",
      image: "assets/img/BS-3.png",
      desc: "Perfectly balanced with gentle acidity and notes of caramel and cocoa. An easy-drinking everyday favourite."
    },
    "cold-brew": {
      name: "Cold Brew",
      title: "Cold Brew Coffee",
      subtitle: "Ready to Drink · 250ml",
      category: "Cold Brew",
      price: RUPEE + "349",
      image: "assets/img/BS-4.png",
      desc: "Slow-steeped for 18 hours for a naturally sweet, ultra-smooth cold brew with zero bitterness. Just chill and sip."
    },
    "arabica-gold": {
      name: "Arabica Gold",
      title: "Arabica Gold Ground",
      subtitle: "Ground Coffee",
      category: "Ground Coffee",
      price: RUPEE + "799",
      image: "assets/img/BS-5.png",
      desc: "Premium 100% Arabica, slow-roasted and ground for maximum flavour and aroma in every cup."
    },
    "barista-machine": {
      name: "Barista Machine",
      title: "Barista Espresso Machine",
      subtitle: "Espresso Series",
      category: "Machines",
      price: RUPEE + "12,999",
      image: "assets/img/BS-6.png",
      desc: "Café-grade pressure and precision temperature control to pull rich, balanced espresso shots at home."
    },
    "gift-box": {
      name: "Gift Box",
      title: "Coffee Gift Box",
      subtitle: "Assorted Blends",
      category: "Gift Boxes",
      price: RUPEE + "1,499",
      image: "assets/img/BS-7.png",
      desc: "A curated selection of our finest small-batch blends, beautifully packaged — the perfect gift for coffee lovers."
    },
    "origin-gold": {
      name: "Origin Gold",
      title: "Origin Gold Whole Bean",
      subtitle: "Single Origin",
      category: "Coffee Beans",
      price: RUPEE + "729",
      image: "assets/img/BS-8.png",
      desc: "A distinctive single-origin roast with bright character and a clean, memorable finish sourced from one estate."
    }
  };

  const NAME_TO_ID = {};
  Object.keys(PRODUCTS).forEach((id) => {
    NAME_TO_ID[PRODUCTS[id].name.trim().toLowerCase()] = id;
  });

  // Make every product card navigate to the product page with its id.
  document.querySelectorAll(".cf2-pcard, .cf2-bs__card").forEach((card) => {
    const nameEl = card.querySelector(".cf2-pcard__name, .cf2-bs__name");
    const name = (card.dataset.name || (nameEl ? nameEl.textContent : "") || "").trim();
    const id = NAME_TO_ID[name.toLowerCase()];
    if (!id) return;

    card.style.cursor = "pointer";
    card.querySelectorAll('a[href="product.html"]').forEach((a) => {
      a.setAttribute("href", "product.html?id=" + id);
    });

    card.addEventListener("click", (event) => {
      if (event.target.closest(".cf2-pcard__cart, .cf2-bs__cart")) return;
      if (event.target.closest("a")) return;
      window.location.href = "product.html?id=" + id;
    });
  });

  /* ── Hydrate product page from ?id= ── */

  const pdTitle = document.querySelector("[data-cf2-pd-title]");
  if (pdTitle) {
    const params = new URLSearchParams(window.location.search);
    const product = PRODUCTS[params.get("id")];
    if (product) {
      pdTitle.textContent = product.title;

      const setText = (sel, value) => {
        const el = document.querySelector(sel);
        if (el) el.textContent = value;
      };
      setText("[data-cf2-pd-crumb]", product.title);
      setText("[data-cf2-pd-category]", product.category);
      setText("[data-cf2-pd-subtitle]", product.subtitle);
      setText("[data-cf2-pd-price]", product.price);
      setText("[data-cf2-pd-desc]", product.desc);

      const mainImg = document.querySelector("[data-cf2-pdp-main]");
      if (mainImg) {
        mainImg.src = product.image;
        mainImg.alt = product.title;
      }

      const firstThumb = document.querySelector(".cf2-pdp__thumb:not(.cf2-pdp__thumb--video)");
      if (firstThumb) {
        firstThumb.dataset.cf2PdpThumb = product.image;
        const timg = firstThumb.querySelector("img");
        if (timg) timg.src = product.image;
      }

      document.title = product.title + " — Brewloom Coffee Co.";
    }
  }
})();
