/* ===== Nivaas – Shop page ===== */
(function () {
  "use strict";

  /* Filter slide-in drawer */
  var drawer = document.querySelector("[data-fr2-filter]");
  var openBtn = document.querySelector("[data-fr2-filter-toggle]");

  if (drawer && openBtn) {
    function openFilter() {
      drawer.hidden = false;
      requestAnimationFrame(function () {
        drawer.classList.add("is-open");
      });
      document.body.style.overflow = "hidden";
    }

    function closeFilter() {
      drawer.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(function () {
        drawer.hidden = true;
      }, 280);
    }

    openBtn.addEventListener("click", openFilter);

    drawer.querySelectorAll("[data-fr2-filter-close]").forEach(function (el) {
      el.addEventListener("click", closeFilter);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) closeFilter();
    });

    var clearBtn = drawer.querySelector(".fr2-filter__clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        drawer.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
          cb.checked = false;
        });
      });
    }
  }

  /* Pagination active state */
  var pageBtns = document.querySelectorAll(".fr2-pagination__btn");
  pageBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!btn.textContent.trim().match(/^\d+$/)) return;
      pageBtns.forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  });
})();
