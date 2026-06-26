/* ===== Product: gallery thumbnails ===== */
(function () {
  "use strict";

  var thumbs = document.querySelector("[data-el2-thumbs]");
  var stage = document.querySelector("[data-el2-stage]");
  if (!thumbs || !stage) return;

  thumbs.querySelectorAll("[data-el2-thumb]").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var src = thumb.getAttribute("data-el2-thumb");
      stage.src = src;
      thumbs.querySelectorAll("[data-el2-thumb]").forEach(function (t) {
        t.classList.remove("is-active");
      });
      thumb.classList.add("is-active");
    });
  });
})();

/* ===== Product: specification collapse/expand ===== */
(function () {
  "use strict";

  document.querySelectorAll("[data-el2-spec-toggle]").forEach(function (head) {
    head.addEventListener("click", function () {
      var group = head.closest("[data-el2-spec]");
      if (!group) return;
      var collapsed = group.classList.toggle("is-collapsed");
      var icon = head.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-minus", !collapsed);
        icon.classList.toggle("fa-plus", collapsed);
      }
    });
  });
})();

/* ===== Product: color & storage selectors ===== */
(function () {
  "use strict";

  function group(selector) {
    var items = document.querySelectorAll(selector);
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        item.parentElement.querySelectorAll(selector.split(" ").pop()).forEach(function (sib) {
          sib.classList.remove("is-active");
        });
        item.classList.add("is-active");
      });
    });
  }

  group(".el2-pdp__swatch");
  group(".el2-pdp__variant");
})();
