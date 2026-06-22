(function () {
  var toggle = document.querySelector("[data-pi2-menu-toggle]");
  var closeBtn = document.querySelector("[data-pi2-menu-close]");
  var nav = document.querySelector(".pi2-header__nav");
  var overlay = document.querySelector("[data-pi2-menu-overlay]");

  if (!toggle || !nav) return;

  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });
})();

(function () {
  var searchToggle = document.querySelector("[data-pi2-search-toggle]");
  var searchForm = document.querySelector("[data-pi2-header-search]");
  if (!searchToggle || !searchForm) return;

  searchToggle.addEventListener("click", function () {
    var open = searchForm.classList.toggle("is-open");
    searchToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var input = searchForm.querySelector("input");
      if (input) input.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (
      !searchForm.classList.contains("is-open") ||
      searchForm.contains(e.target) ||
      searchToggle.contains(e.target)
    ) {
      return;
    }
    searchForm.classList.remove("is-open");
    searchToggle.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      searchForm.classList.remove("is-open");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });
})();

(function () {
  var root = document.querySelector("[data-pi2-hero-slider]");
  if (!root) return;

  var slides = root.querySelectorAll("[data-pi2-hero-slide]");
  var dots = root.querySelectorAll("[data-pi2-hero-dot]");
  if (slides.length === 0) return;

  var total = slides.length;
  var index = 0;
  var timerId = null;
  var intervalMs = 7000;

  function goTo(i) {
    index = ((i % total) + total) % total;

    slides.forEach(function (slide, si) {
      slide.classList.toggle("is-active", si === index);
    });

    dots.forEach(function (dot, di) {
      var active = di === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      dot.setAttribute("tabindex", active ? "0" : "-1");
    });
  }

  function schedule() {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(function () {
      goTo(index + 1);
    }, intervalMs);
  }

  function restart(i) {
    goTo(i);
    schedule();
  }

  dots.forEach(function (dot, di) {
    dot.addEventListener("click", function () {
      restart(di);
    });
    dot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        restart(di);
      }
    });
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  });

  root.addEventListener("mouseleave", schedule);

  goTo(0);
  schedule();
})();

(function () {
  document.querySelectorAll(".pi2-product-card__qty").forEach(function (group) {
    var buttons = group.querySelectorAll(".pi2-product-card__qty-btn");
    var customInput = group.querySelector(".pi2-product-card__qty-field input");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        if (customInput) customInput.value = "";
      });
    });

    if (customInput) {
      customInput.addEventListener("focus", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
      });
    }
  });
})();

(function () {
  var qtyRoot = document.querySelector("[data-pi2-featured-qty]");
  if (!qtyRoot) return;

  var valueEl = qtyRoot.querySelector("[data-pi2-qty-value]");
  var minusBtn = qtyRoot.querySelector("[data-pi2-qty-minus]");
  var plusBtn = qtyRoot.querySelector("[data-pi2-qty-plus]");
  if (!valueEl || !minusBtn || !plusBtn) return;

  var qty = 1;

  function render() {
    valueEl.textContent = String(qty);
    minusBtn.disabled = qty <= 1;
  }

  minusBtn.addEventListener("click", function () {
    if (qty > 1) {
      qty -= 1;
      render();
    }
  });

  plusBtn.addEventListener("click", function () {
    qty += 1;
    render();
  });

  render();
})();

(function () {
  var accordion = document.querySelector("[data-pi2-faq-accordion]");
  if (!accordion) return;

  var items = accordion.querySelectorAll(".pi2-faq__item");

  items.forEach(function (item) {
    var trigger = item.querySelector(".pi2-faq__trigger");
    var panel = item.querySelector(".pi2-faq__panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      items.forEach(function (other) {
        other.classList.remove("is-open");
        var otherTrigger = other.querySelector(".pi2-faq__trigger");
        var otherPanel = other.querySelector(".pi2-faq__panel");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        if (otherPanel) otherPanel.hidden = true;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });
})();

(function () {
  var bar = document.querySelector("[data-pi2-footer-bar]");
  var panel = document.querySelector("[data-pi2-footer-bar-panel]");
  if (!bar || !panel) return;

  bar.addEventListener("click", function () {
    var isOpen = bar.getAttribute("aria-expanded") === "true";
    bar.setAttribute("aria-expanded", isOpen ? "false" : "true");
    panel.hidden = isOpen;
  });
})();

(function () {
  document.querySelectorAll(".pi2-shop__filters").forEach(function (group) {
    group.querySelectorAll(".pi2-shop__filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".pi2-shop__filter").forEach(function (item) {
          item.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  });
})();

(function () {
  var openBtn = document.querySelector("[data-pi2-shop-filter-open]");
  var sheet = document.querySelector("[data-pi2-shop-filter-sheet]");
  if (!openBtn || !sheet) return;

  var closeBtns = sheet.querySelectorAll("[data-pi2-shop-filter-close]");
  var clearBtn = sheet.querySelector(".pi2-shop__sheet-clear");
  var panel = sheet.querySelector(".pi2-shop__sheet-panel");

  function openSheet() {
    sheet.hidden = false;
    requestAnimationFrame(function () {
      sheet.classList.add("is-open");
    });
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSheet() {
    sheet.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      if (!sheet.classList.contains("is-open")) {
        sheet.hidden = true;
      }
    }, 320);
  }

  openBtn.addEventListener("click", openSheet);
  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeSheet);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      sheet.querySelectorAll(".pi2-shop__filter").forEach(function (btn, index) {
        btn.classList.toggle("is-active", index === 0);
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet.classList.contains("is-open")) {
      closeSheet();
    }
  });
})();

(function () {
  document.querySelectorAll(".pi2-shop__view-toggle").forEach(function (group) {
    group.querySelectorAll(".pi2-shop__view-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".pi2-shop__view-btn").forEach(function (item) {
          item.classList.remove("is-active");
          item.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      });
    });
  });
})();

(function () {
  document.querySelectorAll("[data-product-id]").forEach(function (card) {
    var id = card.getAttribute("data-product-id");
    if (!id) return;

    var url = "product.html?id=" + encodeURIComponent(id);

    card.querySelectorAll('a[href*="product.html"]').forEach(function (link) {
      link.href = url;
    });

    card.addEventListener("click", function (e) {
      if (e.target.closest("button, input, label, .pi2-product-card__wish, .pi2-product-card__qty")) {
        return;
      }
      if (e.target.closest("a")) return;
      window.location.href = url;
    });
  });
})();
