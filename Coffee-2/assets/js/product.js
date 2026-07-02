/* Brewloom Coffee Co. — Product page interactions */

(function () {
  "use strict";

  /* ── Product gallery ── */

  const pdpMain = document.querySelector("[data-cf2-pdp-main]");
  const pdpThumbs = document.querySelectorAll("[data-cf2-pdp-thumb]");
  if (pdpMain && pdpThumbs.length) {
    pdpThumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        pdpMain.src = thumb.dataset.cf2PdpThumb;
        pdpThumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  }

  /* ── Option choice groups ── */

  document.querySelectorAll("[data-cf2-choices]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const choice = event.target.closest(".cf2-pdp__choice, .cf2-pdp__size");
      if (!choice) return;
      group
        .querySelectorAll(".cf2-pdp__choice, .cf2-pdp__size")
        .forEach((c) => c.classList.remove("is-active"));
      choice.classList.add("is-active");
    });
  });

  /* ── Quantity stepper ── */

  document.querySelectorAll("[data-cf2-qty]").forEach((widget) => {
    const input = widget.querySelector("[data-cf2-qty-input]");
    const dec = widget.querySelector("[data-cf2-qty-dec]");
    const inc = widget.querySelector("[data-cf2-qty-inc]");

    function getVal() {
      const n = parseInt(input.value, 10);
      return Number.isNaN(n) ? 1 : n;
    }

    if (dec) dec.addEventListener("click", () => (input.value = Math.max(1, getVal() - 1)));
    if (inc) inc.addEventListener("click", () => (input.value = Math.min(99, getVal() + 1)));
    if (input) {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, "");
      });
      input.addEventListener("blur", () => {
        input.value = Math.min(99, Math.max(1, getVal()));
      });
    }
  });

  /* ── Wishlist toggle ── */

  const wish = document.querySelector(".cf2-pdp__wish");
  if (wish) {
    wish.addEventListener("click", () => {
      wish.classList.toggle("is-active");
      const icon = wish.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
      }
    });
  }

  /* ── Product tabs ── */

  const tabsRoot = document.querySelector("[data-cf2-tabs]");
  if (tabsRoot) {
    const tabs = tabsRoot.querySelectorAll("[data-cf2-tab]");
    const panels = tabsRoot.querySelectorAll("[data-cf2-panel]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        const target = tab.dataset.cf2Tab;
        panels.forEach((panel) => {
          const match = panel.dataset.cf2Panel === target;
          panel.classList.toggle("is-active", match);
          panel.hidden = !match;
        });
      });
    });
  }

  /* ── Customer testimonials carousel ── */

  const ctest = document.querySelector("[data-cf2-ctest]");
  if (ctest) {
    const track = ctest.querySelector("[data-cf2-ctest-track]");
    const prevBtn = ctest.querySelector("[data-cf2-ctest-prev]");
    const nextBtn = ctest.querySelector("[data-cf2-ctest-next]");
    const dotsWrap = ctest.querySelector("[data-cf2-ctest-dots]");
    const cards = Array.from(track.children);
    let index = 0;

    function visibleCount() {
      if (window.innerWidth <= 560) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    function step() {
      if (!cards.length) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 0; i <= maxIndex(); i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "cf2-ctest__dot" + (i === index ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => {
          index = i;
          update();
        });
        dotsWrap.appendChild(dot);
      }
    }

    function update() {
      index = Math.min(Math.max(index, 0), maxIndex());
      track.style.transform = `translateX(-${index * step()}px)`;
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, i) =>
          dot.classList.toggle("is-active", i === index)
        );
      }
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { index += 1; update(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { index -= 1; update(); });

    let ctestTimer;
    window.addEventListener("resize", () => {
      clearTimeout(ctestTimer);
      ctestTimer = setTimeout(() => {
        buildDots();
        update();
      }, 150);
    });

    buildDots();
    update();
  }
})();
