(function () {
  var products = window.LV_PRODUCTS || [];
  if (!products.length) return;

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function rupee(n) {
    return "₹" + n;
  }

  var id = qs("id") || products[0].id;
  var product =
    products.find(function (p) {
      return p.id === id;
    }) || products[0];

  var offPct =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  var best = Math.max(product.price - 50, Math.round(product.price * 0.93));
  var cash = Math.max(10, Math.round(product.price * 0.1));

  document.title = product.title + " | Lyvora";

  var map = {
    "[data-lv-pdp-title]": product.title,
    "[data-lv-pdp-crumb]": product.title,
    "[data-lv-pdp-score]": String(product.rating),
    "[data-lv-pdp-reviews]": "(" + product.reviews + ")",
    "[data-lv-pdp-price]": rupee(product.price),
    "[data-lv-pdp-best]": rupee(best),
    "[data-lv-pdp-cash]": rupee(cash),
    "[data-lv-pdp-desc]": product.desc,
    "[data-lv-pdp-tag1]": product.benefit || "Clinically tested",
    "[data-lv-pdp-tag2]": product.benefitSub || "Everyday use",
    "[data-lv-pdp-callout]": null,
    "[data-lv-pdp-tagline]": "Beauty that feels considered.",
    "[data-lv-pdp-b1]": product.highlight || "Visible results with consistent use",
    "[data-lv-pdp-b2]": "Smoothens, soothes & moisturizes skin",
    "[data-lv-pdp-b3]": "Lightweight feel for everyday use"
  };

  Object.keys(map).forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el || map[sel] == null) return;
    if (sel === "[data-lv-pdp-callout]") return;
    el.textContent = map[sel];
  });

  var callout = document.querySelector("[data-lv-pdp-callout]");
  if (callout) {
    callout.innerHTML =
      "the cult-favourite<br />" +
      (product.benefitSub || product.benefit || "glow serum").toLowerCase();
  }

  var mrpEl = document.querySelector("[data-lv-pdp-mrp]");
  var offEl = document.querySelector("[data-lv-pdp-off]");
  if (mrpEl) {
    if (offPct > 0) {
      mrpEl.textContent = rupee(product.mrp);
      mrpEl.hidden = false;
    } else {
      mrpEl.hidden = true;
    }
  }
  if (offEl) {
    offEl.textContent = offPct > 0 ? "(" + offPct + "% OFF)" : "";
  }

  var sizesWrap = document.querySelector("[data-lv-pdp-sizes]");
  if (sizesWrap) {
    var sizes = [product.size];
    if (product.size.indexOf("50") !== -1) sizes = ["50 ml", "30 ml", "15 ml"];
    else if (product.size.indexOf("30") !== -1) sizes = ["30 ml", "15 ml"];
    else if (product.size.indexOf("100") !== -1) sizes = ["100 ml", "50 ml"];
    else if (product.size.indexOf("10") !== -1) sizes = [product.size, "5 gm"];

    sizesWrap.innerHTML = sizes
      .map(function (size, i) {
        return (
          '<button type="button" class="lv-pdp__size-opt' +
          (i === 0 ? " is-active" : "") +
          '" data-lv-size="' +
          size +
          '">' +
          '<span class="lv-pdp__size-box">' +
          size +
          "</span>" +
          '<span class="lv-pdp__size-off">' +
          (offPct || 12) +
          "% OFF</span>" +
          "</button>"
        );
      })
      .join("");

    sizesWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lv-size]");
      if (!btn) return;
      sizesWrap.querySelectorAll(".lv-pdp__size-opt").forEach(function (el) {
        el.classList.toggle("is-active", el === btn);
      });
    });
  }

  var mainImg = document.querySelector("[data-lv-pdp-main]");
  var thumbs = document.querySelector("[data-lv-pdp-thumbs]");
  var images = product.images && product.images.length ? product.images.slice() : [product.image];
  // Pad thumbs to feel like the reference strip
  while (images.length < 5) {
    images = images.concat(images);
  }
  images = images.slice(0, 7);

  function setMain(i) {
    if (mainImg) {
      mainImg.src = images[i];
      mainImg.alt = product.title;
    }
    if (thumbs) {
      thumbs.querySelectorAll(".lv-pdp__thumb").forEach(function (btn, idx) {
        btn.classList.toggle("is-active", idx === i);
      });
    }
  }

  if (thumbs) {
    thumbs.innerHTML = images
      .map(function (src, i) {
        return (
          '<button type="button" class="lv-pdp__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-lv-thumb="' +
          i +
          '"><img src="' +
          src +
          '" alt="" width="72" height="72" decoding="async" /></button>'
        );
      })
      .join("");

    thumbs.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lv-thumb]");
      if (!btn) return;
      setMain(parseInt(btn.getAttribute("data-lv-thumb"), 10) || 0);
    });
  }
  setMain(0);

  document.querySelectorAll("[data-lv-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-lv-copy");
      if (navigator.clipboard && code) {
        navigator.clipboard.writeText(code).then(function () {
          var prev = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = prev;
          }, 1200);
        });
      }
    });
  });

  var pinForm = document.querySelector(".lv-pdp__pin-form");
  if (pinForm) {
    pinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = pinForm.querySelector("input");
      if (!input || !input.value.trim()) return;
      alert("Delivery available for pincode " + input.value.trim());
    });
  }

  var related = document.querySelector("[data-lv-pdp-related]");
  var relatedViewport = document.querySelector("[data-lv-pdp-related-viewport]");
  if (related) {
    var others = products
      .filter(function (p) {
        return p.id !== product.id;
      })
      .slice(0, 4);

    related.innerHTML = others
      .map(function (p) {
        var old =
          p.mrp && p.mrp > p.price
            ? '<span class="lv-pcard__price-old">Rs. ' + p.mrp + "</span>"
            : "";
        return (
          '<article class="lv-pcard" data-lv-product-id="' +
          p.id +
          '">' +
          '<div class="lv-pcard__media">' +
          '<div class="lv-pcard__benefit">' +
          '<p class="lv-pcard__benefit-title">' +
          p.benefit +
          "</p>" +
          '<p class="lv-pcard__benefit-sub">' +
          p.benefitSub +
          "</p>" +
          "</div>" +
          '<img class="lv-pcard__img" src="' +
          p.image +
          '" alt="' +
          p.title.replace(/"/g, "&quot;") +
          '" width="220" height="280" loading="lazy" decoding="async" />' +
          "</div>" +
          '<div class="lv-pcard__body">' +
          '<p class="lv-pcard__size">' +
          p.size +
          "</p>" +
          '<p class="lv-pcard__highlight">' +
          p.highlight +
          "</p>" +
          '<h3 class="lv-pcard__name">' +
          p.title +
          "</h3>" +
          '<div class="lv-pcard__rating">' +
          '<span class="lv-pcard__score">' +
          p.rating +
          "</span>" +
          '<span class="lv-pcard__stars" aria-hidden="true">★★★★★</span>' +
          '<span class="lv-pcard__reviews">(' +
          p.reviews +
          ")</span>" +
          "</div>" +
          '<p class="lv-pcard__price">Rs. ' +
          p.price +
          " " +
          old +
          "</p>" +
          "</div>" +
          '<button type="button" class="lv-pcard__cart">Add To Cart</button>' +
          "</article>"
        );
      })
      .join("");

    var mqlRelated = window.matchMedia("(max-width: 768px)");
    var drag = {
      active: false,
      startX: 0,
      startScroll: 0,
      moved: false,
      pointerId: null
    };

    function relatedMobile() {
      return mqlRelated.matches;
    }

    function relatedCards() {
      return related.querySelectorAll(".lv-pcard");
    }

    function snapToIndex(index) {
      if (!relatedViewport || !relatedMobile()) return;
      var w = relatedViewport.clientWidth;
      if (w <= 0) return;
      var max = Math.max(0, relatedCards().length - 1);
      index = Math.max(0, Math.min(index, max));
      relatedViewport.scrollTo({ left: index * w, behavior: "smooth" });
    }

    /* Mouse-only drag: touch uses native scroll-snap (touch-action: pan-x). */
    if (relatedViewport) {
      relatedViewport.addEventListener("pointerdown", function (e) {
        if (!relatedMobile() || e.pointerType !== "mouse" || e.button !== 0) return;
        drag.active = true;
        drag.moved = false;
        drag.startX = e.clientX;
        drag.startScroll = relatedViewport.scrollLeft;
        drag.pointerId = e.pointerId;
        relatedViewport.classList.add("is-dragging");
        try {
          relatedViewport.setPointerCapture(e.pointerId);
        } catch (err) {}
      });

      relatedViewport.addEventListener("pointermove", function (e) {
        if (!drag.active || !relatedMobile()) return;
        var dx = e.clientX - drag.startX;
        if (Math.abs(dx) > 8) drag.moved = true;
        relatedViewport.scrollLeft = drag.startScroll - dx;
      });

      function endDrag(e) {
        if (!drag.active) return;
        drag.active = false;
        relatedViewport.classList.remove("is-dragging");
        if (drag.pointerId != null) {
          try {
            relatedViewport.releasePointerCapture(drag.pointerId);
          } catch (err) {}
          drag.pointerId = null;
        }
        if (!drag.moved) return;
        var dx = e && typeof e.clientX === "number" ? e.clientX - drag.startX : 0;
        var w = relatedViewport.clientWidth || 1;
        var current = Math.round(drag.startScroll / w);
        var next = current;
        if (dx < -40) next = current + 1;
        else if (dx > 40) next = current - 1;
        else next = Math.round(relatedViewport.scrollLeft / w);
        snapToIndex(next);
      }

      relatedViewport.addEventListener("pointerup", endDrag);
      relatedViewport.addEventListener("pointercancel", endDrag);
    }

    var relatedClickRoot = relatedViewport || related;
    relatedClickRoot.addEventListener(
      "click",
      function (e) {
        if (drag.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.moved = false;
          return;
        }
        var card = e.target.closest("[data-lv-product-id]");
        if (!card || !relatedClickRoot.contains(card)) return;
        e.stopPropagation();
        window.location.href =
          "product.html?id=" + encodeURIComponent(card.getAttribute("data-lv-product-id"));
      },
      true
    );

    related.style.transform = "";
  }

  var reviewPanel = document.querySelector("[data-lv-acc-reviews]");
  if (reviewPanel) {
    reviewPanel.textContent =
      "Rated " +
      product.rating +
      " by " +
      product.reviews +
      " customers. Real reviews highlight texture, finish, and visible results.";
  }

  var ingPanel = document.querySelector("[data-lv-acc-ingredients]");
  if (ingPanel) {
    ingPanel.textContent =
      "Formulated with actives that support " +
      (product.benefit || "skin health").toLowerCase() +
      ". Highlight: " +
      product.highlight +
      ". Full ingredient list on pack.";
  }
})();

(function () {
  var root = document.querySelector("[data-lv-acc]");
  if (!root) return;

  root.querySelectorAll("[data-lv-acc-trigger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".lv-acc__item");
      if (!item) return;
      var panel = item.querySelector(".lv-acc__panel");
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      if (open) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    });
  });
})();
