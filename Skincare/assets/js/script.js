(() => {
  const closeBtn = document.getElementById("closeOfferBar");
  const offerBar = document.getElementById("offerBar");

  if (closeBtn && offerBar) {
    closeBtn.addEventListener("click", () => {
      offerBar.style.display = "none";
    });
  }
})();

(() => {
  const toggleBtn = document.querySelector("[data-menu-toggle]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const overlay = document.querySelector("[data-menu-overlay]");
  const drawer = document.getElementById("bbMobileDrawer");
  if (!toggleBtn || !closeBtn || !overlay || !drawer) return;

  const setOpen = (open) => {
    document.body.classList.toggle("bb-menu-open", open);
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    overlay.hidden = !open;
  };

  toggleBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setOpen(false);
  });
})();

(() => {
  const root = document.querySelector("[data-hero-slider]");
  if (!root) return;

  const viewport = root.querySelector(".bb-hero-viewport");
  const track = root.querySelector("[data-hero-track]");
  const slides = root.querySelectorAll("[data-hero-slide]");
  const dots = root.querySelectorAll("[data-hero-dot]");
  if (!viewport || !track || slides.length === 0) return;

  const total = slides.length;
  let index = 0;
  let timerId = null;
  const intervalMs = 5500;

  const slideWidth = () => viewport.getBoundingClientRect().width;

  const syncSlides = () => {
    const w = slideWidth();
    if (w <= 0) return;
    slides.forEach((slide) => {
      slide.style.flex = `0 0 ${w}px`;
      slide.style.width = `${w}px`;
      slide.style.minWidth = `${w}px`;
    });
  };

  const goTo = (i) => {
    syncSlides();
    const w = slideWidth();
    index = ((i % total) + total) % total;
    if (w > 0) {
      track.style.transform = `translate3d(-${index * w}px, 0, 0)`;
    }
    dots.forEach((dot, di) => {
      const active = di === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      dot.setAttribute("tabindex", active ? "0" : "-1");
    });
  };

  const schedule = () => {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      goTo(index + 1);
    }, intervalMs);
  };

  const restart = (i) => {
    goTo(i);
    schedule();
  };

  dots.forEach((dot, di) => {
    dot.addEventListener("click", () => restart(di));
    dot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        restart(di);
      }
    });
  });

  root.addEventListener("mouseenter", () => {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  });

  root.addEventListener("mouseleave", schedule);

  const onResize = () => {
    goTo(index);
  };
  window.addEventListener("resize", onResize);

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      goTo(index);
    });
    ro.observe(viewport);
  }

  const startAutoplay = () => {
    if (timerId) return;
    schedule();
  };

  const init = () => {
    goTo(0);
    if (slideWidth() > 0) {
      startAutoplay();
    }
  };

  requestAnimationFrame(() => {
    init();
    if (slideWidth() <= 0) {
      window.addEventListener(
        "load",
        () => {
          goTo(0);
          startAutoplay();
        },
        { once: true }
      );
    }
  });
})();

(() => {
  const cards = document.querySelectorAll("[data-bs-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const dots = card.querySelectorAll("[data-bs-dot]");
    const prev = card.querySelector("[data-bs-prev]");
    const next = card.querySelector("[data-bs-next]");
    if (!dots.length) return;

    const total = dots.length;
    let idx = 0;

    const setIdx = (n) => {
      idx = ((n % total) + total) % total;
      dots.forEach((dot, di) => {
        const on = di === idx;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    prev?.addEventListener("click", () => setIdx(idx - 1));
    next?.addEventListener("click", () => setIdx(idx + 1));
    dots.forEach((dot, di) => {
      dot.addEventListener("click", () => setIdx(di));
    });
  });
})();

(() => {
  const slider = document.querySelector(".bb-bs-grid");
  if (!slider) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const canDrag = () => slider.scrollWidth > slider.clientWidth + 4;

  const onDown = (clientX) => {
    if (!canDrag()) return;
    isDown = true;
    startX = clientX;
    startScrollLeft = slider.scrollLeft;
    slider.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    slider.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    slider.classList.remove("is-dragging");
  };

  slider.addEventListener("mousedown", (event) => onDown(event.clientX));
  slider.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    onMove(event.clientX);
  });
  slider.addEventListener("mouseup", onUp);
  slider.addEventListener("mouseleave", onUp);

  slider.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      onDown(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (event) => {
      if (!isDown) return;
      const touch = event.touches[0];
      if (!touch) return;
      onMove(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener("touchend", onUp, { passive: true });
  slider.addEventListener("touchcancel", onUp, { passive: true });
})();

(() => {
  document.querySelectorAll(".bb-rgk-visual").forEach((visual) => {
    const def = visual.querySelector(".bb-rgk-img--default");
    const hov = visual.querySelector(".bb-rgk-img--hover");
    if (!def || !hov) return;
    hov.addEventListener(
      "error",
      () => {
        hov.src = def.currentSrc || def.src;
      },
      { once: true }
    );
  });
})();

(() => {
  const slider = document.querySelector(".bb-rgk-grid");
  if (!slider) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const canDrag = () => slider.scrollWidth > slider.clientWidth + 4;

  const onDown = (clientX) => {
    if (!canDrag()) return;
    isDown = true;
    startX = clientX;
    startScrollLeft = slider.scrollLeft;
    slider.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    slider.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    slider.classList.remove("is-dragging");
  };

  slider.addEventListener("mousedown", (event) => onDown(event.clientX));
  slider.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    onMove(event.clientX);
  });
  slider.addEventListener("mouseup", onUp);
  slider.addEventListener("mouseleave", onUp);

  slider.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      onDown(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (event) => {
      if (!isDown) return;
      const touch = event.touches[0];
      if (!touch) return;
      onMove(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener("touchend", onUp, { passive: true });
  slider.addEventListener("touchcancel", onUp, { passive: true });
})();

(() => {
  const viewport = document.querySelector("[data-sbi-viewport]");
  const track = document.querySelector("[data-sbi-track]");
  const prevBtn = document.querySelector("[data-sbi-prev]");
  const nextBtn = document.querySelector("[data-sbi-next]");
  if (!viewport || !track) return;

  const getStep = () => {
    const first = track.querySelector(".bb-sbi-item");
    if (!first) return 0;
    const itemWidth = first.getBoundingClientRect().width;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0");
    return itemWidth + gap;
  };

  const updateButtons = () => {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 2;
    const atEnd = viewport.scrollLeft >= maxScroll - 2;

    prevBtn.classList.toggle("is-hidden", atStart);
    nextBtn.classList.toggle("is-hidden", atEnd);
  };

  prevBtn?.addEventListener("click", () => {
    const step = getStep();
    if (!step) return;
    viewport.scrollBy({ left: -step, behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    const step = getStep();
    if (!step) return;
    viewport.scrollBy({ left: step, behavior: "smooth" });
  });

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const canDrag = () => viewport.scrollWidth > viewport.clientWidth + 4;

  const onDown = (clientX) => {
    if (!canDrag()) return;
    isDown = true;
    startX = clientX;
    startScrollLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    viewport.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    viewport.classList.remove("is-dragging");
  };

  viewport.addEventListener("mousedown", (event) => onDown(event.clientX));
  viewport.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    onMove(event.clientX);
  });
  viewport.addEventListener("mouseup", onUp);
  viewport.addEventListener("mouseleave", onUp);

  viewport.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      onDown(touch.clientX);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      if (!isDown) return;
      const touch = event.touches[0];
      if (!touch) return;
      onMove(touch.clientX);
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", onUp, { passive: true });
  viewport.addEventListener("touchcancel", onUp, { passive: true });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
})();

(() => {
  const viewport = document.querySelector(".bb-promo-viewport");
  const track = document.querySelector("[data-promo-track]");
  const prev = document.querySelector("[data-promo-prev]");
  const next = document.querySelector("[data-promo-next]");
  if (!viewport || !track || !prev || !next) return;

  const cards = Array.from(track.children);
  if (!cards.length) return;

  const getStep = () => {
    const first = cards[0].getBoundingClientRect();
    if (!first.width) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0");
    return first.width + gap;
  };

  const scrollByCard = (dir) => {
    const step = getStep();
    if (!step) return;
    viewport.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
})();

(() => {
  const viewport = document.querySelector("[data-reviews-viewport]");
  if (!viewport) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const onDown = (clientX) => {
    isDown = true;
    startX = clientX;
    startScrollLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    viewport.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    viewport.classList.remove("is-dragging");
  };

  viewport.addEventListener("mousedown", (e) => {
    onDown(e.clientX);
  });

  window.addEventListener("mousemove", (e) => {
    onMove(e.clientX);
  });

  window.addEventListener("mouseup", onUp);
  viewport.addEventListener("mouseleave", onUp);

  viewport.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      onDown(e.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches.length) return;
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", onUp);
  viewport.addEventListener("touchcancel", onUp);

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
})();

(() => {
  const track = document.querySelector(".bb-sbc-grid");
  if (!track) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const onDown = (clientX) => {
    isDown = true;
    startX = clientX;
    startScrollLeft = track.scrollLeft;
    track.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    track.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    track.classList.remove("is-dragging");
  };

  track.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);
  track.addEventListener("mouseleave", onUp);

  track.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      onDown(e.touches[0].clientX);
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches.length) return;
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  track.addEventListener("touchend", onUp);
  track.addEventListener("touchcancel", onUp);
})();

(() => {
  const selectors = [".bb-bs-card", ".bb-tn-card", ".cat-card", ".bb-rgk-card"];

  const getText = (root, selector) => {
    const el = root.querySelector(selector);
    return el ? el.textContent.trim() : "";
  };

  const makePayload = (card) => {
    const img = card.querySelector(".bb-rgk-img--default") || card.querySelector("img");
    const title =
      getText(card, ".cat-card h3") ||
      getText(card, ".bb-bs-name") ||
      getText(card, ".bb-tn-name") ||
      getText(card, ".bb-rgk-name");

    const subtitle =
      getText(card, ".cat-card-sub") ||
      getText(card, ".bb-bs-desc") ||
      getText(card, ".bb-tn-copy") ||
      getText(card, ".bb-rgk-benefit");

    const price =
      getText(card, ".cat-card-price") ||
      getText(card, ".bb-bs-price") ||
      getText(card, ".bb-tn-price") ||
      getText(card, ".bb-rgk-price-new");

    const tag =
      getText(card, ".cat-card-tag") ||
      getText(card, ".bb-tn-cat") ||
      getText(card, ".bb-rgk-rating-text") ||
      "#1 in skincare";

    return {
      id: card.dataset.productId || "",
      title,
      subtitle,
      price,
      tag,
      image: img ? img.currentSrc || img.src : "",
      alt: img ? img.alt : "",
    };
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest(selectors.join(","));
    if (!card) return;

    const payload = makePayload(card);
    if (!payload.title && !payload.image) return;

    try {
      sessionStorage.setItem("selectedProductCard", JSON.stringify(payload));
    } catch (_err) {
      // ignore storage errors and continue with URL id fallback
    }

    const id = payload.id ? `?pid=${encodeURIComponent(payload.id)}` : "";
    window.location.href = `product.html${id}`;
  });
})();

(() => {
  const slider = document.querySelector(".bb-tn-grid");
  if (!slider) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  const canDrag = () => slider.scrollWidth > slider.clientWidth + 4;

  const onDown = (clientX) => {
    if (!canDrag()) return;
    isDown = true;
    startX = clientX;
    startScrollLeft = slider.scrollLeft;
    slider.classList.add("is-dragging");
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const walk = clientX - startX;
    slider.scrollLeft = startScrollLeft - walk;
  };

  const onUp = () => {
    isDown = false;
    slider.classList.remove("is-dragging");
  };

  slider.addEventListener("mousedown", (event) => onDown(event.clientX));
  slider.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    onMove(event.clientX);
  });
  slider.addEventListener("mouseup", onUp);
  slider.addEventListener("mouseleave", onUp);

  slider.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      onDown(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (event) => {
      if (!isDown) return;
      const touch = event.touches[0];
      if (!touch) return;
      onMove(touch.clientX);
    },
    { passive: true }
  );

  slider.addEventListener("touchend", onUp, { passive: true });
  slider.addEventListener("touchcancel", onUp, { passive: true });
})();

(() => {
  const trigger = document.querySelector(".bb-signin-link");
  if (!trigger) return;

  const authModal = document.createElement("div");
  authModal.className = "bb-auth-modal";
  authModal.setAttribute("hidden", "hidden");
  authModal.innerHTML = `
    <div class="bb-auth-overlay" data-auth-overlay></div>
    <section class="bb-auth-panel" role="dialog" aria-modal="true" aria-label="Login with OTP popup">
      <button type="button" class="bb-auth-close" data-auth-close aria-label="Close login popup">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <aside class="bb-auth-visual">
        <div class="bb-auth-visual-copy">
          <h2>Introducing <strong>TrustCircle.</strong></h2>
          <p>We value your loyalty to skincare.<br />Now get rewards at every step.</p>
        </div>
      </aside>
      <div class="bb-auth-content">
        <h1>Minimalist</h1>
        <h3>Login with OTP</h3>
        <p class="bb-auth-lead">Enter your log in details</p>
        <form class="bb-auth-form" novalidate>
          <label for="bb-auth-phone">Phone</label>
          <div class="bb-auth-phone-wrap">
            <span class="bb-auth-country">
              <span class="bb-auth-flag" aria-hidden="true"></span>
              <i class="fa-solid fa-angle-down" aria-hidden="true"></i>
            </span>
            <input id="bb-auth-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="Phone number" />
          </div>
          <button type="button" class="bb-auth-btn" data-auth-request>Request OTP</button>

          <div class="bb-auth-otp" hidden>
            <label for="bb-auth-otp-input">OTP</label>
            <input id="bb-auth-otp-input" type="text" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit OTP" />
            <button type="button" class="bb-auth-btn bb-auth-btn--verify" data-auth-verify>Verify OTP</button>
          </div>

          <p class="bb-auth-msg" data-auth-msg></p>
          <label class="bb-auth-consent">
            <input type="checkbox" data-auth-consent />
            <span>I accept that I have read & understood <a href="privacy-policy.html">Privacy Policy</a> and <a href="terms-and-conditions.html">T&amp;Cs</a>.</span>
          </label>
        </form>
      </div>
    </section>
  `;
  document.body.appendChild(authModal);

  const profileModal = document.createElement("div");
  profileModal.className = "bb-profile-modal";
  profileModal.setAttribute("hidden", "hidden");
  profileModal.innerHTML = `
    <div class="bb-profile-modal-overlay" data-profile-overlay></div>
    <section class="bb-profile-modal-panel" role="dialog" aria-modal="true" aria-label="Profile details popup">
      <button type="button" class="bb-profile-close" data-profile-close aria-label="Close profile popup">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <aside class="bb-profile-side">
        <div class="bb-profile-user">
          <div class="bb-profile-avatar">PR</div>
          <div>
            <strong data-profile-name>Piyush Rajput</strong>
            <p data-profile-email>singhpiyushrajput8279@g...</p>
            <p data-profile-phone>+919368486203</p>
          </div>
        </div>
        <nav class="bb-profile-menu" aria-label="Profile menu">
          <button type="button" class="bb-profile-menu-item is-active" data-profile-tab-btn="profile">
            <i class="fa-regular fa-user"></i>
            <div><strong>Profile</strong><span>Personal info</span></div>
          </button>
          <button type="button" class="bb-profile-menu-item" data-profile-tab-btn="orders">
            <i class="fa-regular fa-cube"></i>
            <div><strong>My Orders</strong><span>Order history</span></div>
          </button>
          <button type="button" class="bb-profile-menu-item" data-profile-tab-btn="addresses">
            <i class="fa-solid fa-location-dot"></i>
            <div><strong>Addresses</strong><span>Shipping & billing</span></div>
          </button>
        </nav>
        <div class="bb-profile-logout">
          <button type="button" data-profile-logout><i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out</button>
        </div>
      </aside>
      <div class="bb-profile-content">
        <article class="bb-profile-card" data-profile-tab="profile">
          <header class="bb-profile-head">
            <div class="bb-profile-head-left">
              <i class="fa-regular fa-user"></i>
              <div>
                <strong>Profile Details</strong>
                <span>Manage your personal information</span>
              </div>
            </div>
            <button type="button" class="bb-profile-edit-btn"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
          </header>
          <div class="bb-profile-form-block">
            <h3>Basic Information</h3>
            <div class="bb-profile-grid">
              <div class="bb-profile-field">
                <label>First Name</label>
                <div class="bb-profile-input-wrap"><i class="fa-regular fa-user"></i><input type="text" value="Piyush" /></div>
              </div>
              <div class="bb-profile-field">
                <label>Last Name</label>
                <div class="bb-profile-input-wrap"><i class="fa-regular fa-user"></i><input type="text" value="Rajput" /></div>
              </div>
              <div class="bb-profile-field">
                <label>Email Address</label>
                <div class="bb-profile-input-wrap"><i class="fa-regular fa-envelope"></i><input type="email" value="singhpiyushrajput8279@gmail.com" /></div>
              </div>
              <div class="bb-profile-field">
                <label>Phone Number</label>
                <div class="bb-profile-phone-row">
                  <div class="bb-profile-input-wrap"><select><option>IN +91</option></select></div>
                  <div class="bb-profile-input-wrap"><input type="tel" value="9368486203" /></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="bb-profile-card" data-profile-tab="orders" hidden>
          <div class="bb-address-header">
            <h3>My Orders</h3>
          </div>
          <div class="bb-address-empty">
            <span class="bb-address-empty-icon"><i class="fa-solid fa-box-open"></i></span>
            <p>No orders placed yet</p>
          </div>
        </article>

        <article class="bb-profile-card" data-profile-tab="addresses" hidden>
          <div class="bb-address-header">
            <h3>Saved Addresses</h3>
          </div>

          <div class="bb-address-empty" data-address-empty>
            <span class="bb-address-empty-icon"><i class="fa-solid fa-location-dot"></i></span>
            <p>No addresses saved yet</p>
            <button type="button" class="bb-address-primary-btn" data-address-add-open>Add Your First Address</button>
          </div>

          <form class="bb-address-form" data-address-form hidden>
            <h4>Add New Address</h4>
            <div class="bb-address-grid">
              <div class="bb-address-field">
                <label for="bb-address-first-name">First Name</label>
                <input id="bb-address-first-name" name="firstName" type="text" required />
              </div>
              <div class="bb-address-field">
                <label for="bb-address-last-name">Last Name (optional)</label>
                <input id="bb-address-last-name" name="lastName" type="text" />
              </div>
              <div class="bb-address-field bb-address-field--full">
                <label for="bb-address-company">Company (optional)</label>
                <input id="bb-address-company" name="company" type="text" />
              </div>
              <div class="bb-address-field bb-address-field--full">
                <label for="bb-address-line1">Address Line 1</label>
                <input id="bb-address-line1" name="line1" type="text" required />
              </div>
              <div class="bb-address-field bb-address-field--full">
                <label for="bb-address-line2">Address Line 2 (optional)</label>
                <input id="bb-address-line2" name="line2" type="text" />
              </div>
              <div class="bb-address-field">
                <label for="bb-address-city">City</label>
                <input id="bb-address-city" name="city" type="text" required />
              </div>
              <div class="bb-address-field">
                <label for="bb-address-country">Country</label>
                <select id="bb-address-country" name="country">
                  <option>India</option>
                  <option>United States</option>
                </select>
              </div>
              <div class="bb-address-field">
                <label for="bb-address-state">State/Province</label>
                <select id="bb-address-state" name="state" required>
                  <option value="">Select State/Province</option>
                  <option>Karnataka</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Uttar Pradesh</option>
                </select>
              </div>
              <div class="bb-address-field">
                <label for="bb-address-zip">ZIP/Postal Code</label>
                <input id="bb-address-zip" name="zip" type="text" required />
              </div>
              <div class="bb-address-field bb-address-field--full">
                <label for="bb-address-phone">Phone (optional)</label>
                <div class="bb-address-phone-row">
                  <select name="countryCode"><option>us +1</option><option selected>in +91</option></select>
                  <input id="bb-address-phone" name="phone" type="tel" placeholder="Enter phone number" />
                </div>
              </div>
              <label class="bb-address-checkbox bb-address-field--full">
                <input type="checkbox" name="isDefault" />
                <span>Set as default address</span>
              </label>
            </div>
            <div class="bb-address-actions">
              <button type="submit" class="bb-address-primary-btn">Add Address</button>
              <button type="button" class="bb-address-cancel-btn" data-address-cancel>Cancel</button>
            </div>
            <p class="bb-address-error" data-address-error></p>
          </form>

          <div class="bb-address-list" data-address-list hidden></div>
        </article>
      </div>
    </section>
  `;
  document.body.appendChild(profileModal);

  const phoneInput = authModal.querySelector("#bb-auth-phone");
  const otpWrap = authModal.querySelector(".bb-auth-otp");
  const otpInput = authModal.querySelector("#bb-auth-otp-input");
  const consentInput = authModal.querySelector("[data-auth-consent]");
  const requestBtn = authModal.querySelector("[data-auth-request]");
  const verifyBtn = authModal.querySelector("[data-auth-verify]");
  const message = authModal.querySelector("[data-auth-msg]");

  const profileName = profileModal.querySelector("[data-profile-name]");
  const profilePhone = profileModal.querySelector("[data-profile-phone]");
  const profileLogoutBtn = profileModal.querySelector("[data-profile-logout]");
  const tabButtons = Array.from(profileModal.querySelectorAll("[data-profile-tab-btn]"));
  const tabPanels = Array.from(profileModal.querySelectorAll("[data-profile-tab]"));
  const addressEmpty = profileModal.querySelector("[data-address-empty]");
  const addressForm = profileModal.querySelector("[data-address-form]");
  const addressList = profileModal.querySelector("[data-address-list]");
  const addressOpenBtn = profileModal.querySelector("[data-address-add-open]");
  const addressCancelBtn = profileModal.querySelector("[data-address-cancel]");
  const addressError = profileModal.querySelector("[data-address-error]");
  const ADDRESS_KEY = "bbUserAddresses";
  let generatedOtp = "";

  const showMessage = (text, ok = false) => {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle("is-ok", ok);
  };

  const openAuth = () => {
    authModal.removeAttribute("hidden");
    profileModal.setAttribute("hidden", "hidden");
    document.body.style.overflow = "hidden";
    showMessage("");
  };

  const openProfile = () => {
    const storedPhone = localStorage.getItem("bbUserPhone");
    if (profilePhone && storedPhone) {
      profilePhone.textContent = `+91${storedPhone}`;
    }
    if (profileName && localStorage.getItem("bbUserName")) {
      profileName.textContent = localStorage.getItem("bbUserName");
    }
    profileModal.removeAttribute("hidden");
    authModal.setAttribute("hidden", "hidden");
    document.body.style.overflow = "hidden";
    setActiveTab("profile");
    renderAddresses();
  };

  const closeAll = () => {
    authModal.setAttribute("hidden", "hidden");
    profileModal.setAttribute("hidden", "hidden");
    document.body.style.overflow = "";
  };

  const setActiveTab = (tabName) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.profileTabBtn === tabName);
    });
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.profileTab !== tabName;
    });
  };

  const getAddresses = () => {
    try {
      return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "[]");
    } catch (_err) {
      return [];
    }
  };

  const setAddresses = (list) => {
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(list));
    } catch (_err) {
      // ignore
    }
  };

  const showAddressForm = (show) => {
    if (!addressForm || !addressEmpty || !addressList) return;
    if (show) {
      addressForm.removeAttribute("hidden");
      addressEmpty.setAttribute("hidden", "hidden");
      addressList.setAttribute("hidden", "hidden");
    } else {
      addressForm.setAttribute("hidden", "hidden");
      addressForm.reset();
      if (addressError) addressError.textContent = "";
      if (!getAddresses().length) {
        addressEmpty.removeAttribute("hidden");
      }
    }
  };

  const renderAddresses = () => {
    if (!addressList || !addressEmpty) return;
    const list = getAddresses();
    addressList.innerHTML = "";

    if (!list.length) {
      addressEmpty.removeAttribute("hidden");
      addressList.setAttribute("hidden", "hidden");
      showAddressForm(false);
      return;
    }

    addressEmpty.setAttribute("hidden", "hidden");
    addressList.removeAttribute("hidden");
    showAddressForm(false);

    list.forEach((addr, idx) => {
      const card = document.createElement("article");
      card.className = "bb-address-card";
      card.innerHTML = `
        <h5>${addr.firstName} ${addr.lastName || ""} ${addr.isDefault ? '<span>Default</span>' : ""}</h5>
        <p>${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}</p>
        <p>${addr.city}, ${addr.state} - ${addr.zip}</p>
        <p>${addr.country}</p>
        ${addr.phone ? `<p>Phone: ${addr.countryCode || "in +91"} ${addr.phone}</p>` : ""}
        <button type="button" class="bb-address-remove" data-remove-index="${idx}">Remove</button>
      `;
      addressList.appendChild(card);
    });
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const isLoggedIn = localStorage.getItem("bbUserLoggedIn") === "true";
    if (isLoggedIn) {
      openProfile();
      return;
    }
    openAuth();
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.profileTabBtn || "profile";
      setActiveTab(tabName);
      if (tabName === "addresses") renderAddresses();
    });
  });

  addressOpenBtn?.addEventListener("click", () => showAddressForm(true));
  addressCancelBtn?.addEventListener("click", () => showAddressForm(false));

  addressForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(addressForm);
    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      line1: String(formData.get("line1") || "").trim(),
      line2: String(formData.get("line2") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      country: String(formData.get("country") || "India").trim(),
      state: String(formData.get("state") || "").trim(),
      zip: String(formData.get("zip") || "").trim(),
      countryCode: String(formData.get("countryCode") || "in +91").trim(),
      phone: String(formData.get("phone") || "").trim(),
      isDefault: Boolean(formData.get("isDefault")),
    };

    if (!payload.firstName || !payload.line1 || !payload.city || !payload.state || !payload.zip) {
      if (addressError) addressError.textContent = "Please fill all required fields.";
      return;
    }
    if (addressError) addressError.textContent = "";

    const list = getAddresses();
    if (payload.isDefault) {
      list.forEach((a) => {
        a.isDefault = false;
      });
    }
    list.push(payload);
    setAddresses(list);
    renderAddresses();
  });

  addressList?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove-index]");
    if (!btn) return;
    const idx = Number(btn.dataset.removeIndex);
    if (Number.isNaN(idx)) return;
    const list = getAddresses();
    list.splice(idx, 1);
    setAddresses(list);
    renderAddresses();
  });

  requestBtn?.addEventListener("click", () => {
    const phone = (phoneInput?.value || "").replace(/\D/g, "");
    if (!consentInput?.checked) {
      showMessage("Please accept Privacy Policy and T&Cs first.");
      return;
    }
    if (phone.length !== 10) {
      showMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    otpWrap?.removeAttribute("hidden");
    showMessage(`OTP sent to +91 ${phone}. (Demo OTP: ${generatedOtp})`, true);
    if (otpInput) otpInput.value = "";
    if (otpInput) otpInput.focus();
  });

  verifyBtn?.addEventListener("click", () => {
    const otp = (otpInput?.value || "").trim();
    if (!generatedOtp) {
      showMessage("Please request OTP first.");
      return;
    }
    if (otp !== generatedOtp) {
      showMessage("Invalid OTP. Please try again.");
      return;
    }
    try {
      localStorage.setItem("bbUserLoggedIn", "true");
      localStorage.setItem("bbUserPhone", (phoneInput?.value || "").replace(/\D/g, ""));
      if (!localStorage.getItem("bbUserName")) localStorage.setItem("bbUserName", "Piyush Rajput");
    } catch (_err) {
      // Ignore storage errors and continue.
    }
    showMessage("OTP verified. Redirecting to home page...", true);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });

  profileLogoutBtn?.addEventListener("click", () => {
    try {
      localStorage.removeItem("bbUserLoggedIn");
      localStorage.removeItem("bbUserPhone");
      localStorage.removeItem(ADDRESS_KEY);
    } catch (_err) {
      // ignore storage errors
    }
    closeAll();
    openAuth();
  });

  authModal.querySelector("[data-auth-overlay]")?.addEventListener("click", closeAll);
  authModal.querySelector("[data-auth-close]")?.addEventListener("click", closeAll);
  profileModal.querySelector("[data-profile-overlay]")?.addEventListener("click", closeAll);
  profileModal.querySelector("[data-profile-close]")?.addEventListener("click", closeAll);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!authModal.hasAttribute("hidden") || !profileModal.hasAttribute("hidden")) {
        closeAll();
      }
    }
  });
})();
