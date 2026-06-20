(function () {
  "use strict";

  var mainImg = document.querySelector("[data-pdp-main-img]");
  var thumbsContainer = document.querySelector(".aet-pdp__thumbs");
  var thumbs = [];
  var prevBtn = document.querySelector("[data-pdp-prev]");
  var nextBtn = document.querySelector("[data-pdp-next]");
  var qtyInput = document.getElementById("aetPdpQty");
  var qtyMinus = document.querySelector("[data-pdp-qty-minus]");
  var qtyPlus = document.querySelector("[data-pdp-qty-plus]");
  var qtySticky = document.getElementById("aetPdpQtySticky");
  var qtyStickyMinus = document.querySelector("[data-pdp-sticky-qty-minus]");
  var qtyStickyPlus = document.querySelector("[data-pdp-sticky-qty-plus]");
  var models = document.querySelectorAll("[data-pdp-model]");
  var fbtTrack = document.querySelector("[data-fbt-track]");
  var fbtPrev = document.querySelector("[data-fbt-prev]");
  var fbtNext = document.querySelector("[data-fbt-next]");
  var specTabs = document.querySelectorAll("[data-pdp-spec-tab]");
  var specPanels = document.querySelectorAll("[data-pdp-spec-panel]");
  var specHeading = document.querySelector("[data-pdp-spec-heading]");
  var specBody = document.querySelector("[data-pdp-spec-body]");

  var specHeadings = {
    "know-more": "Know More",
    "tech-specs": "Tech Specifications",
    compare: "Compare",
    reviews: "Customer Reviews"
  };

  var activeIndex = 0;

  function getQueryProductId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  }

  function setMrp(el, mrp) {
    if (!el || !mrp) return;
    if (mrp.indexOf("<") >= 0) {
      el.innerHTML = "MRP " + mrp + " (Tax Inclusive)";
    } else {
      el.innerHTML = "MRP <s>" + mrp + "</s> (Tax Inclusive)";
    }
  }

  function renderProduct(product) {
    if (!product) return;

    document.title = product.title + " — AETHER";

    setText(".aet-pdp__title", product.title);
    setText(".aet-pdp-breadcrumb span[aria-current]", product.title);
    setText(".aet-pdp-breadcrumb a[href='category.html']", product.category);
    setText(".aet-pdp__rating-text", product.rating + " (" + product.reviews + " reviews)");
    setText(".aet-pdp__price", product.price);
    var offBadge = document.querySelector(".aet-pdp__off-badge");
    if (offBadge) {
      offBadge.textContent = product.off || "";
      offBadge.style.display = product.off ? "" : "none";
    }
    var stickyOff = document.querySelector(".aet-pdp-sticky__off");
    if (stickyOff) {
      stickyOff.textContent = product.off || "";
      stickyOff.style.display = product.off ? "" : "none";
    }
    setMrp(document.querySelector(".aet-pdp__mrp"), product.mrp);

    setText(".aet-pdp-sticky__name", product.title.toUpperCase());
    setText(".aet-pdp-sticky__price", product.price);
    setText(".aet-pdp-sticky__off", product.off);
    setText(".aet-pdp-sticky__mrp", "MRP " + product.mrp.replace(/<[^>]+>/g, "") + " (Tax Inclusive)");

    var stickyThumb = document.querySelector(".aet-pdp-sticky__thumb");
    if (stickyThumb) {
      stickyThumb.src = product.image;
      stickyThumb.alt = product.title;
    }

    var ratingEl = document.querySelector(".aet-pdp__rating");
    if (ratingEl) {
      ratingEl.setAttribute(
        "aria-label",
        "Rated " + product.rating + " out of 5 stars, " + product.reviews + " reviews"
      );
    }

    var featureItems = document.querySelectorAll(".aet-pdp__features li");
    product.features.forEach(function (text, i) {
      if (!featureItems[i]) return;
      var span = featureItems[i].querySelector("span:last-child");
      if (span) span.textContent = text;
    });

    rebuildGallery(product);
  }

  function rebuildGallery(product) {
    if (!thumbsContainer || !mainImg) return;

    var images = product.images && product.images.length ? product.images : [product.image];
    thumbsContainer.innerHTML = "";

    images.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "aet-pdp__thumb" + (i === 0 ? " is-active" : "");
      btn.setAttribute("data-pdp-thumb", "");
      btn.setAttribute("data-image", src);
      btn.setAttribute("data-alt", product.title);
      btn.setAttribute("aria-label", "View image " + (i + 1));

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.width = 72;
      img.height = 72;
      img.decoding = "async";
      btn.appendChild(img);
      thumbsContainer.appendChild(btn);
    });

    mainImg.src = images[0];
    mainImg.alt = product.title;
    activeIndex = 0;
    initGalleryHandlers();
  }

  function setActiveThumb(index) {
    if (!thumbs.length || !mainImg) return;
    activeIndex = (index + thumbs.length) % thumbs.length;
    var btn = thumbs[activeIndex];
    var src = btn.getAttribute("data-image");
    if (!src) return;
    mainImg.src = src;
    mainImg.alt = btn.getAttribute("data-alt") || mainImg.alt;
    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === activeIndex);
    });
  }

  function initGalleryHandlers() {
    thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-pdp-thumb]"));

    thumbs.forEach(function (btn, i) {
      btn.replaceWith(btn.cloneNode(true));
    });
    thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-pdp-thumb]"));

    thumbs.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        setActiveThumb(i);
      });
    });
  }

  function loadProductFromUrl() {
    if (typeof window.AET_resolveProduct !== "function") return;
    var id = getQueryProductId();
    var product = window.AET_resolveProduct(id);
    renderProduct(product);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      setActiveThumb(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      setActiveThumb(activeIndex + 1);
    });
  }

  function setQty(n) {
    var val = Math.max(1, Math.min(99, n));
    if (qtyInput) qtyInput.value = String(val);
    if (qtySticky) qtySticky.value = String(val);
  }

  function readQty() {
    var el = qtyInput || qtySticky;
    return parseInt(el && el.value, 10) || 1;
  }

  if (qtyMinus) {
    qtyMinus.addEventListener("click", function () {
      setQty(readQty() - 1);
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", function () {
      setQty(readQty() + 1);
    });
  }

  if (qtyStickyMinus) {
    qtyStickyMinus.addEventListener("click", function () {
      setQty(readQty() - 1);
    });
  }

  if (qtyStickyPlus) {
    qtyStickyPlus.addEventListener("click", function () {
      setQty(readQty() + 1);
    });
  }

  if (qtyInput && qtySticky) {
    qtyInput.addEventListener("change", function () {
      setQty(parseInt(qtyInput.value, 10) || 1);
    });
    qtySticky.addEventListener("change", function () {
      setQty(parseInt(qtySticky.value, 10) || 1);
    });
  }

  models.forEach(function (btn) {
    btn.addEventListener("click", function () {
      models.forEach(function (m) {
        m.classList.toggle("is-active", m === btn);
      });
    });
  });

  if (fbtTrack && fbtPrev && fbtNext) {
    var scrollStep = 256;

    fbtPrev.addEventListener("click", function () {
      fbtTrack.scrollBy({ left: -scrollStep, behavior: "smooth" });
    });

    fbtNext.addEventListener("click", function () {
      fbtTrack.scrollBy({ left: scrollStep, behavior: "smooth" });
    });
  }

  specTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-pdp-spec-tab");
      if (!id) return;

      specTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.tabIndex = active ? 0 : -1;
      });

      specPanels.forEach(function (panel) {
        var match = panel.getAttribute("data-pdp-spec-panel") === id;
        panel.classList.toggle("is-active", match);
        if (match) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });

      if (specBody) {
        specBody.classList.toggle("is-reviews", id === "reviews");
      }

      if (specHeading && specHeadings[id]) {
        specHeading.textContent = specHeadings[id];
        specHeading.hidden = id === "reviews";
      }
    });
  });

  initGalleryHandlers();
  loadProductFromUrl();
})();
