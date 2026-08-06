(function () {
  "use strict";

  var root = document.getElementById("ai-store-lab");
  if (!root) return;

  var productData = {
    "shoes-1": {
      image: "assets/img/shoes-1.jpg",
      title: "Neon Runner Sneakers",
      price: "₹2,499",
      mobilePrice: "₹2,499",
    },
    "hoodie-2": {
      image: "assets/img/hoodie-2.jpg",
      title: "Aero Street Orange",
      price: "₹2,899",
      mobilePrice: "₹2,899",
    },
    "watch-2": {
      image: "assets/img/watch-2.jpg",
      title: "Stealth Black Sports",
      price: "₹3,249",
      mobilePrice: "₹3,249",
    },
    shoes: {
      image: "assets/img/shoes.jpg",
      title: "Azure Sprint Flow",
      price: "₹2,299",
      mobilePrice: "₹2,299",
    },
    watch: {
      image: "assets/img/watch.jpg",
      title: "Pearl White Trainers",
      price: "₹2,749",
      mobilePrice: "₹2,749",
    },
  };

  Object.keys(productData).forEach(function (k) {
    var img = new Image();
    img.src = productData[k].image;
  });

  var desktopImage = root.querySelector('[data-product-image="desktop"]');
  var mobileImage = root.querySelector('[data-product-image="mobile"]');
  var productTitle = root.querySelector(".ai-product__title");
  var priceDesktop = root.querySelector(".ai-price");
  var priceMobile = root.querySelector('[data-metric="mobile-price"]');
  var conversionMetric = root.querySelector('[data-metric="conversion"]');
  var revenueMetric = root.querySelector('[data-metric="revenue"]');


  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) {
      h = h
        .split("")
        .map(function (x) {
          return x + x;
        })
        .join("");
    }
    var num = parseInt(h, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function toHex(c) {
    var v = clamp(Math.round(c), 0, 255).toString(16);
    return v.length === 1 ? "0" + v : v;
  }

  function shade(hex, amount) {
    var rgb = hexToRgb(hex);
    var factor = amount / 100;
    var target = factor >= 0 ? 255 : 0;
    return (
      "#" +
      toHex(rgb.r + (target - rgb.r) * Math.abs(factor)) +
      toHex(rgb.g + (target - rgb.g) * Math.abs(factor)) +
      toHex(rgb.b + (target - rgb.b) * Math.abs(factor))
    );
  }

  function setColor(hex) {
    var primary = hex;
    var light = shade(hex, 84);
    var dark = shade(hex, -28);
    var shadowRgb = hexToRgb(hex);

    root.style.setProperty("--ai-primary", primary);
    root.style.setProperty("--ai-primary-light", light);
    root.style.setProperty("--ai-primary-dark", dark);
    root.style.setProperty(
      "--ai-primary-shadow",
      "rgba(" + shadowRgb.r + ", " + shadowRgb.g + ", " + shadowRgb.b + ", 0.28)"
    );
  }

  function withFadeSwap(elements, callback) {
    elements.forEach(function (el) {
      if (!el) return;
      el.style.opacity = "0.15";
      el.style.transform = "scale(0.98)";
    });
    window.setTimeout(function () {
      callback();
      elements.forEach(function (el) {
        if (!el) return;
        el.style.opacity = "1";
        el.style.transform = "";
      });
    }, 180);
  }

  function setProduct(key) {
    var item = productData[key];
    if (!item || !desktopImage || !mobileImage) return;

    withFadeSwap([desktopImage, mobileImage], function () {
      desktopImage.src = item.image;
      mobileImage.src = item.image;
      if (productTitle) productTitle.textContent = item.title;
      if (priceDesktop) priceDesktop.textContent = item.price;
      if (priceMobile) priceMobile.textContent = item.mobilePrice;
    });
  }

  function setShape(radius) {
    root.dataset.radius = radius;
  }

  function setFont(fontName) {
    var value = '"' + fontName + '", system-ui, sans-serif';
    root.style.setProperty("--lab-font", value);
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
  }

  function animateLayoutFlip(nextLayout) {
    var container = root.querySelector("[data-layout-container]");
    if (!container) return;
    var nodes = container.querySelectorAll("[data-flip-item]");
    var first = new Map();
    nodes.forEach(function (n) {
      first.set(n, n.getBoundingClientRect());
    });

    root.dataset.layout = nextLayout;

    nodes.forEach(function (n) {
      var f = first.get(n);
      var l = n.getBoundingClientRect();
      var dx = f.left - l.left;
      var dy = f.top - l.top;
      var sx = f.width / l.width;
      var sy = f.height / l.height;
      n.animate(
        [
          {
            transform:
              "translate(" +
              dx +
              "px, " +
              dy +
              "px) scale(" +
              sx +
              ", " +
              sy +
              ")",
          },
          { transform: "translate(0,0) scale(1,1)" },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }
      );
    });
  }

  function setAiToggle(isOn) {
    var toggleBtn = root.querySelector('[data-control="ai-toggle"]');
    if (!toggleBtn) return;
    toggleBtn.classList.toggle("is-on", isOn);
    toggleBtn.setAttribute("aria-pressed", isOn ? "true" : "false");
    toggleBtn.querySelector("span").textContent = isOn ? "ON" : "OFF";
    root.classList.toggle("ai-personalization-on", isOn);
  }

  function setActiveButton(group, selector, matchKey, matchValue) {
    group.querySelectorAll(selector).forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset[matchKey] === matchValue);
    });
  }

  function randomMetricTick() {
    if (!conversionMetric || !revenueMetric) return;
    var conversion = 3.2 + Math.random() * 0.45;
    var revenue = 1225000 + Math.floor(Math.random() * 55000);
    conversionMetric.textContent = conversion.toFixed(2) + "%";
    revenueMetric.textContent = "₹" + revenue.toLocaleString("en-IN");
  }

  function createRipple(target, x, y) {
    var ripple = document.createElement("span");
    ripple.className = "ai-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    target.appendChild(ripple);
    window.setTimeout(function () {
      ripple.remove();
    }, 620);
  }

  function markInteraction() {
    // Manual-only mode: changes happen only on explicit user actions.
  }

  root.addEventListener("click", function (event) {
    var colorBtn = event.target.closest('[data-control="color"] button');
    var productBtn = event.target.closest('[data-control="product"] button');
    var radiusBtn = event.target.closest('[data-control="radius"] button');
    var fontBtn = event.target.closest('[data-control="font"] button');
    var themeBtn = event.target.closest('[data-control="theme"] button');
    var layoutBtn = event.target.closest('[data-control="layout"] button');
    var aiToggle = event.target.closest('[data-control="ai-toggle"]');
    var aiButton = event.target.closest(".ai-btn");

    if (colorBtn) {
      setColor(colorBtn.dataset.color);
      setActiveButton(root.querySelector('[data-control="color"]'), "button", "color", colorBtn.dataset.color);
      markInteraction();
    }
    if (productBtn) {
      setProduct(productBtn.dataset.product);
      setActiveButton(root.querySelector('[data-control="product"]'), "button", "product", productBtn.dataset.product);
      markInteraction();
    }
    if (radiusBtn) {
      setShape(radiusBtn.dataset.radius);
      setActiveButton(root.querySelector('[data-control="radius"]'), "button", "radius", radiusBtn.dataset.radius);
      markInteraction();
    }
    if (fontBtn) {
      setFont(fontBtn.dataset.font);
      setActiveButton(root.querySelector('[data-control="font"]'), "button", "font", fontBtn.dataset.font);
      markInteraction();
    }
    if (themeBtn) {
      setTheme(themeBtn.dataset.theme);
      setActiveButton(root.querySelector('[data-control="theme"]'), "button", "theme", themeBtn.dataset.theme);
      markInteraction();
    }
    if (layoutBtn) {
      animateLayoutFlip(layoutBtn.dataset.layout);
      setActiveButton(root.querySelector('[data-control="layout"]'), "button", "layout", layoutBtn.dataset.layout);
      markInteraction();
    }
    if (aiToggle) {
      var turnOn = !aiToggle.classList.contains("is-on");
      setAiToggle(turnOn);
      markInteraction();
    }
    if (aiButton) {
      var rect = aiButton.getBoundingClientRect();
      createRipple(aiButton, event.clientX - rect.left, event.clientY - rect.top);
    }
  });

  root.addEventListener("mousemove", function (event) {
    var scene = root.querySelector(".ai-lab__scene");
    if (!scene) return;
    var bounds = root.getBoundingClientRect();
    var x = (event.clientX - bounds.left) / bounds.width - 0.5;
    var y = (event.clientY - bounds.top) / bounds.height - 0.5;
    var laptop = root.querySelector(".ai-laptop");
    var panel = root.querySelector(".ai-panel");
    var phone = root.querySelector(".ai-phone");
    if (laptop) laptop.style.transform = "translate3d(" + x * 8 + "px," + y * 8 + "px,0)";
    if (panel) panel.style.transform = "translate3d(" + x * -6 + "px," + y * -8 + "px,0)";
    if (phone) phone.style.transform = "translate3d(" + x * -4 + "px," + y * 6 + "px,0)";
  });

  root.addEventListener("mouseleave", function () {
    [".ai-laptop", ".ai-panel", ".ai-phone"].forEach(function (sel) {
      var node = root.querySelector(sel);
      if (node) node.style.transform = "";
    });
  });

  randomMetricTick();
  setAiToggle(true);
})();

