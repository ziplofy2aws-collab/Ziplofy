(function () {
  const slideHeight = function (root) {
    const slide = root.querySelector(".announcement-slide");
    return slide ? slide.getBoundingClientRect().height : 42;
  };

  const initAnnouncementSlider = function () {
    const root = document.querySelector("[data-announcement-slider]");
    if (!root) return;

    const track = root.querySelector(".announcement-track");
    const slides = root.querySelectorAll(".announcement-slide");
    if (!track || slides.length < 2) return;

    let index = 0;

    const goTo = function (nextIndex) {
      index = nextIndex % slides.length;
      const h = slideHeight(root);
      track.style.transform = "translateY(-" + index * h + "px)";
    };

    const tick = function () {
      goTo(index + 1);
    };

    goTo(0);
    window.addEventListener("resize", function () {
      goTo(index);
    });

    window.setInterval(tick, 4500);
  };

  const initMobileNav = function () {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.getElementById("primary-nav");
    const backdrop = document.querySelector("[data-nav-backdrop]");
    if (!header || !toggle || !nav) return;

    const setOpen = function (open) {
      header.classList.toggle("is-nav-open", open);
      document.body.classList.toggle("is-nav-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    const close = function () {
      setOpen(false);
    };

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-nav-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", close);
    }

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 900) close();
      });
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) close();
    });
  };

  const initFooterAccordion = function () {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;

    const sections = Array.from(footer.querySelectorAll(".footer-col:not(.footer-community)"));
    if (!sections.length) return;

    const applyResponsiveState = function () {
      const isMobile = window.innerWidth <= 900;

      sections.forEach(function (section) {
        const heading = section.querySelector("h4");
        const panel = section.querySelector(".footer-two-col-list, ul");
        if (!heading || !panel) return;

        if (isMobile) {
          const isOpen = section.classList.contains("is-open");
          heading.setAttribute("role", "button");
          heading.setAttribute("tabindex", "0");
          heading.setAttribute("aria-expanded", isOpen ? "true" : "false");
          panel.hidden = !isOpen;
        } else {
          section.classList.remove("is-open");
          heading.removeAttribute("role");
          heading.removeAttribute("tabindex");
          heading.removeAttribute("aria-expanded");
          panel.hidden = false;
        }
      });
    };

    sections.forEach(function (section) {
      const heading = section.querySelector("h4");
      const panel = section.querySelector(".footer-two-col-list, ul");
      if (!heading || !panel) return;

      const toggle = function () {
        if (window.innerWidth > 900) return;
        const willOpen = !section.classList.contains("is-open");
        section.classList.toggle("is-open", willOpen);
        heading.setAttribute("aria-expanded", willOpen ? "true" : "false");
        panel.hidden = !willOpen;
      };

      heading.addEventListener("click", toggle);
      heading.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    applyResponsiveState();
    window.addEventListener("resize", applyResponsiveState);
  };

  initAnnouncementSlider();
  initMobileNav();
  initFooterAccordion();
})();
