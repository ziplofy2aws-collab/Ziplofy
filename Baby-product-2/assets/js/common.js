(function () {
  "use strict";

  var toggle = document.querySelector("[data-bh-menu-toggle]");
  var nav = document.querySelector("[data-bh-nav]");

  if (!toggle || !nav) return;

  var overlay = document.createElement("div");
  overlay.className = "bh-nav-overlay";
  // Append inside the header so the overlay shares the same stacking
  // context as the drawer (header is position:sticky + z-index, which
  // would otherwise make a body-level overlay paint ABOVE the drawer
  // and swallow all clicks).
  var header = document.querySelector(".bh-header") || document.body;
  header.appendChild(overlay);

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "bh-nav__close";
  closeBtn.setAttribute("aria-label", "Close menu");
  closeBtn.innerHTML = "&times;";
  nav.insertBefore(closeBtn, nav.firstChild);

  function openMenu() {
    nav.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("bh-no-scroll");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.classList.remove("bh-no-scroll");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);
  closeBtn.addEventListener("click", closeMenu);

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") closeMenu();
  });
})();
