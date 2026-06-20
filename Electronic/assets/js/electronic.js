(function () {
  function initLocationSelector() {
    var lineEl = document.querySelector(".vs-location__line");
    var changeEl = document.querySelector(".vs-location__change");
    if (!lineEl || !changeEl) {
      return;
    }

    var STORAGE_KEY = "voltixLocation";

    function applySavedLocation() {
      try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          return;
        }
        var parsed = JSON.parse(saved);
        if (parsed && parsed.label) {
          lineEl.textContent = parsed.label;
        }
      } catch (err) {
        /* ignore localStorage parse errors */
      }
    }

    function saveLocation(label, pin) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            label: label,
            pin: pin
          })
        );
      } catch (err) {
        /* ignore storage write errors */
      }
    }

    async function lookupPincode(pin) {
      try {
        var response = await fetch("https://api.postalpincode.in/pincode/" + pin, {
          method: "GET"
        });
        if (!response.ok) {
          return "";
        }
        var data = await response.json();
        if (!Array.isArray(data) || !data[0] || !Array.isArray(data[0].PostOffice) || !data[0].PostOffice[0]) {
          return "";
        }
        var office = data[0].PostOffice[0];
        var district = office.District || office.Name || "";
        var state = office.State || "";
        var formatted = [district, state].filter(Boolean).join(", ");
        return formatted ? formatted + " " + pin : "";
      } catch (err) {
        return "";
      }
    }

    changeEl.addEventListener("click", async function (event) {
      event.preventDefault();
      var input = window.prompt("Enter 6-digit pincode");
      if (input === null) {
        return;
      }
      var pin = String(input).trim();
      if (!/^[0-9]{6}$/.test(pin)) {
        window.alert("Please enter a valid 6-digit pincode.");
        return;
      }

      var oldText = lineEl.textContent;
      lineEl.textContent = "Checking pincode...";
      var label = await lookupPincode(pin);
      if (!label) {
        label = "Location " + pin;
      }
      lineEl.textContent = label;
      saveLocation(label, pin);

      if (oldText === label) {
        return;
      }
    });

    applySavedLocation();
  }

  function initMobileNav() {
    var openBtn = document.getElementById("vsMenuOpen");
    var closeBtn = document.getElementById("vsMenuClose");
    var drawer = document.getElementById("vsNavDrawer");
    var backdrop = document.getElementById("vsDrawerBackdrop");
    if (!openBtn || !closeBtn || !drawer) {
      return;
    }

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("vs-nav-open", open);
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        closeBtn.focus();
      } else {
        openBtn.focus();
      }
    }

    openBtn.addEventListener("click", function () {
      setOpen(true);
    });

    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    drawer.querySelectorAll(".vs-drawer__nav a, .vs-drawer__footer-link").forEach(function (el) {
      el.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  function initHeroCarousel() {
    const hero = document.getElementById("heroSection");
    const bg = document.getElementById("heroBg");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");
    if (!hero || !bg || !prevBtn || !nextBtn) {
      return;
    }

    const dots = Array.from(hero.querySelectorAll(".ac-dot"));
    if (!dots.length) {
      return;
    }

    const slides = [
      "assets/img/banner-1.png",
      "assets/img/banner-2.png",
      "assets/img/banner-3.png",
      "assets/img/banner-4.png",
      "assets/img/banner-5.png",
      "assets/img/banner-2.png",
      "assets/img/banner-3.png"
    ];
    let index = 0;

    function render() {
      bg.style.backgroundImage = `url('${slides[index]}')`;
      dots.forEach(function (dot, i) {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
          dot.removeAttribute("tabindex");
        } else {
          dot.removeAttribute("aria-current");
          dot.setAttribute("tabindex", "-1");
        }
      });
    }

    prevBtn.addEventListener("click", function () {
      index = (index - 1 + slides.length) % slides.length;
      render();
    });

    nextBtn.addEventListener("click", function () {
      index = (index + 1) % slides.length;
      render();
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const nextIndex = parseInt(dot.getAttribute("data-slide"), 10);
        if (!Number.isNaN(nextIndex)) {
          index = nextIndex;
          render();
        }
      });
    });

    render();
  }

  function initHorizontalSlider(config) {
    const track = document.getElementById(config.trackId);
    const viewport = document.getElementById(config.viewportId);
    const prevBtn = document.getElementById(config.prevId);
    const nextBtn = document.getElementById(config.nextId);

    if (!track || !viewport || !prevBtn || !nextBtn) {
      return;
    }

    const cards = Array.from(track.children);
    let currentX = 0;
    let wasFlexScroll = false;
    const flexScrollBelow =
      typeof config.flexScrollBelow === "number" ? config.flexScrollBelow : 0;
    const flexScrollClass = config.flexScrollClass || "hd-slider--scroll";

    function useFlexScroll() {
      return flexScrollBelow > 0 && window.innerWidth <= flexScrollBelow;
    }

    function getGap() {
      const trackStyle = window.getComputedStyle(track);
      return parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;
    }

    function getStep() {
      const firstCard = cards[0];
      if (!firstCard) {
        return 0;
      }
      const gap = getGap();
      const w = firstCard.getBoundingClientRect().width;
      if (useFlexScroll()) {
        return w * 2 + gap * 2;
      }
      return w + gap;
    }

    function getMaxX() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function updateButtons(maxX) {
      prevBtn.disabled = currentX <= 0;
      nextBtn.disabled = currentX >= maxX - 1;
    }

    function updateButtonsFromScroll() {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const sl = viewport.scrollLeft;
      prevBtn.disabled = sl <= 2;
      nextBtn.disabled = sl >= maxScroll - 2;
    }

    function render() {
      const flex = useFlexScroll();
      if (flex) {
        track.style.transform = "";
        viewport.classList.add(flexScrollClass);
        updateButtonsFromScroll();
        wasFlexScroll = true;
        return;
      }

      viewport.classList.remove(flexScrollClass);
      if (wasFlexScroll) {
        viewport.scrollLeft = 0;
        currentX = 0;
        wasFlexScroll = false;
      }
      const maxX = getMaxX();
      if (currentX > maxX) {
        currentX = maxX;
      }
      track.style.transform = `translateX(-${currentX}px)`;
      updateButtons(maxX);
    }

    prevBtn.addEventListener("click", function () {
      if (useFlexScroll()) {
        viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
        return;
      }
      const step = getStep();
      currentX = Math.max(0, currentX - step);
      render();
    });

    nextBtn.addEventListener("click", function () {
      if (useFlexScroll()) {
        viewport.scrollBy({ left: getStep(), behavior: "smooth" });
        return;
      }
      const step = getStep();
      const maxX = getMaxX();
      currentX = Math.min(maxX, currentX + step);
      render();
    });

    viewport.addEventListener("scroll", function () {
      if (useFlexScroll()) {
        updateButtonsFromScroll();
      }
    });

    window.addEventListener("resize", render);
    render();
  }

  function initContactPanIndiaScrollTop() {
    var btn = document.getElementById("contactPanIndiaScrollTop");
    if (!btn) {
      return;
    }
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initVoltixProductPage() {
    if (!document.querySelector(".pdp-page")) {
      return;
    }
    function initAccordions() {
        var items = document.querySelectorAll(".pdp-accordion");
        items.forEach(function (item) {
          var btn = item.querySelector(".pdp-accordion__head");
          if (!btn) {
            return;
          }
          btn.addEventListener("click", function () {
            var open = item.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", open ? "true" : "false");
          });
        });
      }

      function initOptionSelectors() {
        document.addEventListener("click", function (event) {
          var btn = event.target.closest(".pdp-option-list button");
          if (!btn) {
            return;
          }

          var list = btn.closest(".pdp-option-list");
          if (!list) {
            return;
          }

          list.querySelectorAll("button").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
        });
      }

      function updateGalleryPager(activeIdx) {
        var pill = document.querySelector(".pdp-ref__pager-pill");
        var dots = document.querySelectorAll(".pdp-ref__pager-dot");
        if (!pill) {
          return;
        }
        pill.classList.toggle("is-active", activeIdx === 0);
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", activeIdx > 0 && i === activeIdx - 1);
        });
      }

      function getThumbIndex(thumb) {
        var thumbs = Array.prototype.slice.call(document.querySelectorAll(".pdp-ref__thumb"));
        return thumbs.indexOf(thumb);
      }

      function initThumbStrip() {
        var scrollEl = document.getElementById("pdpThumbsScroll");
        var prevBtn = document.getElementById("pdpThumbsPrev");
        var nextBtn = document.getElementById("pdpThumbsNext");
        var mainImg = document.querySelector(".pdp-main-image img");

        if (prevBtn && scrollEl) {
          prevBtn.addEventListener("click", function () {
            scrollEl.scrollBy({ left: -120, behavior: "smooth" });
          });
        }
        if (nextBtn && scrollEl) {
          nextBtn.addEventListener("click", function () {
            scrollEl.scrollBy({ left: 120, behavior: "smooth" });
          });
        }

        document.querySelectorAll(".pdp-ref__thumb").forEach(function (thumb) {
          thumb.addEventListener("click", function () {
            var idx = getThumbIndex(thumb);
            if (idx < 0) {
              return;
            }
            updateGalleryPager(idx);

            var src = thumb.getAttribute("data-pdp-img");
            document.querySelectorAll(".pdp-ref__thumb").forEach(function (t) {
              t.classList.remove("is-active");
            });
            thumb.classList.add("is-active");
            if (src && mainImg) {
              mainImg.setAttribute("src", src);
            }
          });
        });

        document.querySelectorAll(".pdp-ref__pager-dot").forEach(function (dot, i) {
          dot.style.cursor = "pointer";
          dot.addEventListener("click", function () {
            var thumbs = document.querySelectorAll(".pdp-ref__thumb");
            if (!thumbs.length) {
              return;
            }
            var tIdx = Math.min(i + 1, thumbs.length - 1);
            var target = thumbs[tIdx];
            if (target) {
              target.click();
            }
          });
        });

        updateGalleryPager(0);
      }

      function normalize(text) {
        return String(text || "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
      }

      function parseAmount(priceText) {
        var n = Number(String(priceText || "").replace(/[^\d.]/g, ""));
        return Number.isFinite(n) ? n : 0;
      }

      function formatInr(amount) {
        return (
          "₹" +
          Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        );
      }

      function inferProfile(product) {
        var title = product.title || "";
        var t = normalize(title);
        var isApple = t.indexOf("apple") !== -1 || t.indexOf("iphone") !== -1 || t.indexOf("ipad") !== -1;
        var isSamsung = t.indexOf("samsung") !== -1 || t.indexOf("galaxy") !== -1;
        var isLaptop = t.indexOf("laptop") !== -1 || t.indexOf("macbook") !== -1 || t.indexOf("book") !== -1;
        var isTv = t.indexOf("tv") !== -1 || t.indexOf("bravia") !== -1 || t.indexOf("qled") !== -1 || t.indexOf("led") !== -1;

        var brand = "Voltix";
        if (isApple) {
          brand = "Apple";
        } else if (isSamsung) {
          brand = "Samsung";
        } else if (t.indexOf("vivo") !== -1) {
          brand = "Vivo";
        } else if (t.indexOf("oneplus") !== -1) {
          brand = "OnePlus";
        } else if (t.indexOf("redmi") !== -1 || t.indexOf("xiaomi") !== -1 || t.indexOf("mi ") !== -1) {
          brand = "Xiaomi";
        } else if (t.indexOf("google") !== -1 || t.indexOf("pixel") !== -1) {
          brand = "Google";
        } else if (t.indexOf("hp ") !== -1) {
          brand = "HP";
        } else if (t.indexOf("dell") !== -1) {
          brand = "Dell";
        } else if (t.indexOf("lenovo") !== -1) {
          brand = "Lenovo";
        }

        var category = isLaptop ? "Laptops" : isTv ? "Televisions" : "Mobile Phones";
        var family = isLaptop ? "Computers & Tablets" : isTv ? "TV & Entertainment" : "Phones & Wearables";
        var modelNumber = "VTX-" + Math.floor(100000 + Math.random() * 899999);

        var defaultColors = isApple
          ? ["Silver", "Cosmic Orange", "Deep Blue"]
          : isSamsung
            ? ["Black", "White", "Blue"]
            : ["Black", "Blue", "Grey"];

        var storages = isLaptop
          ? ["256GB", "512GB", "1TB"]
          : isTv
            ? ["43 Inch", "55 Inch", "65 Inch"]
            : isApple
              ? ["256GB", "512GB", "1TB", "2TB"]
              : ["128GB", "256GB", "512GB"];

        var rams = isLaptop ? ["8GB", "16GB"] : isTv ? ["3GB", "4GB"] : isApple ? ["12GB", "16GB"] : ["8GB", "12GB"];

        var breadcrumbLeaf =
          isApple && !isLaptop && !isTv ? "iPhones" : isSamsung && !isLaptop && !isTv ? "Galaxy" : brand;

        var baseTitle = title.split("(")[0].trim();
        var descTitle = baseTitle;
        if (brand && descTitle.toLowerCase().indexOf(brand.toLowerCase() + " ") === 0) {
          descTitle = descTitle.slice(brand.length).trim();
        }
        if (!descTitle) {
          descTitle = baseTitle || "Product";
        }
        if (descTitle.length > 44) {
          descTitle = descTitle.slice(0, 42) + "\u2026";
        }

        var parenMatch = title.match(/\(([^)]+)\)/);
        var descTagline = parenMatch
          ? parenMatch[1].replace(/\s*,\s*/g, " \u00b7 ")
          : isLaptop
            ? "Work-ready performance and dependable multitasking"
            : isTv
              ? "Cinematic picture and smart entertainment hub"
              : "Powerful features with all-day usability";

        var descKicker = brand;

        var keyFeatures = isLaptop
          ? [
              "Display: 15.6 inches, Full HD anti-glare panel",
              "Processor: High-performance multi-core architecture",
              "Memory: 8GB/16GB RAM with fast multitasking",
              "Storage: NVMe SSD for quicker boot and app load",
              "Battery: Long backup with intelligent power mode",
              "Connectivity: Wi-Fi, Bluetooth, USB, HDMI"
            ]
          : isTv
            ? [
                "Display: 4K Ultra HD panel with vivid color output",
                "Refresh Rate: Smooth playback for daily entertainment",
                "Audio: Clear stereo output with enhanced dialog mode",
                "Smart TV: Built-in apps and voice assistant support",
                "Connectivity: HDMI, USB, Wi-Fi and Bluetooth",
                "Design: Slim bezel profile for immersive viewing"
              ]
            : isApple
              ? [
                  "Display: Super Retina XDR OLED with ProMotion up to 120 Hz",
                  "Chip: Apple-designed processor for pro-level performance",
                  "Camera: Advanced multi-camera system for photos and video",
                  "Battery: All-day battery life with fast charging options",
                  "Durability: Premium materials with water and dust resistance",
                  "Software: Latest iOS with privacy-first intelligence features"
                ]
              : [
                  "Display: AMOLED panel with smooth refresh rate",
                  "Processor: Latest generation performance chipset",
                  "Memory: Optimized RAM for multitasking and gaming",
                  "Camera: High-resolution multi-camera setup",
                  "Battery: Fast charging with all-day performance",
                  "Security: Advanced biometric unlock support"
                ];

        var overviewTitle1 = isLaptop
          ? "Reliable Performance For Everyday Work"
          : isTv
            ? "Immersive Big-Screen Entertainment"
            : isApple
              ? "Pro display and premium build"
              : "Premium Smartphone Experience";

        var overviewPara1 = isLaptop
          ? "Built for productivity, the " +
            descTitle +
            " handles daily office tasks, browsing, streaming, and online meetings with stable performance. The efficient design ensures responsive operation across work and entertainment."
          : isTv
            ? "The " +
              descTitle +
              " delivers rich color, clear contrast, and sharp visuals for movies, sports, and OTT content. Display tuning and smart picture modes help you enjoy a premium home-viewing experience."
            : isApple
              ? "The " +
                descTitle +
                " is built for everyday speed and pro-level creativity — from gaming and streaming to capturing detailed photos and 4K video. The display, chip, and camera system work together for a smooth, responsive experience."
              : "The " +
                descTitle +
                " is designed to deliver smooth scrolling, vivid visuals, and responsive touch performance for daily use. Optimized hardware and software integration help keep performance consistent.";

        var overviewTitle2 = isLaptop
          ? "Fast Multitasking And Storage"
          : isTv
            ? "Smart Features And Easy Connectivity"
            : isApple
              ? "Cameras, battery, and intelligent features"
              : "Strong Camera And Battery Output";

        var overviewPara2 = isLaptop
          ? "With fast storage and capable memory, the " +
            descTitle +
            " supports multitasking across multiple apps with ease. From document editing to media consumption, performance remains efficient and dependable."
          : isTv
            ? "A smart interface, quick app launch, and multiple connectivity ports make the " +
              descTitle +
              " practical for modern setups. Switch between console, set-top box, and streaming apps without hassle."
            : isApple
              ? "With the " +
                descTitle +
                ", shoot in more lighting conditions, enjoy longer video recording, and get practical tools for editing and sharing. Battery optimisation and fast charging help you stay productive through busy days."
              : "Advanced camera processing on the " +
                descTitle +
                " captures detailed shots in different lighting conditions, while battery optimisation helps keep the device ready for long sessions. Fast charging support reduces downtime when you need a quick top-up.";

        return {
          family: family,
          category: category,
          brand: brand,
          breadcrumbLeaf: breadcrumbLeaf,
          rams: rams,
          modelSeries: title.split("(")[0].trim().slice(0, 48),
          modelNumber: modelNumber,
          colors: defaultColors,
          storages: storages,
          keyFeatures: keyFeatures,
          overviewTitle1: overviewTitle1,
          overviewPara1: overviewPara1,
          overviewTitle2: overviewTitle2,
          overviewPara2: overviewPara2,
          descKicker: descKicker,
          descTitle: descTitle,
          descTagline: descTagline
        };
      }

      function setText(selector, value) {
        var el = document.querySelector(selector);
        if (el && value !== undefined && value !== null) {
          el.textContent = value;
        }
      }

      function setImg(selector, src, alt) {
        var el = document.querySelector(selector);
        if (el) {
          el.setAttribute("src", src);
          el.setAttribute("alt", alt);
        }
      }

      function setSpecByLabel(label, value) {
        if (!label || value === undefined || value === null) {
          return;
        }
        var rows = document.querySelectorAll(".pdp-ref__spec-line");
        rows.forEach(function (row) {
          var p = row.querySelector("p");
          if (p && p.textContent.trim() === label) {
            var s = row.querySelector("strong");
            if (s) {
              s.textContent = value;
            }
          }
        });
      }

      var params = new URLSearchParams(window.location.search);
      var payload = {};
      try {
        payload = JSON.parse(sessionStorage.getItem("voltixSelectedProduct") || "{}");
      } catch (err) {
        payload = {};
      }

      var product = {
        title: payload.title || params.get("title") || "",
        price: payload.price || params.get("price") || "",
        img: payload.img || params.get("img") || "",
        mrp: payload.mrp || params.get("mrp") || "",
        offer: payload.offer || params.get("offer") || "",
        rating: payload.rating || ""
      };

      if (product.title && product.price && product.img) {
        var amount = parseAmount(product.price);
        var emi = amount ? formatInr(amount / 21.25).replace(".00", "") + "/mo*" : "";
        var profile = inferProfile(product);
        var mrpAmount = parseAmount(product.mrp);
        var offText = product.offer || (mrpAmount > amount && amount > 0 ? Math.round(((mrpAmount - amount) / mrpAmount) * 100) + "% off" : "");

        document.title = product.title + " | Voltix";
        setText(".pdp-title-row h1", product.title);
        setText(".pdp-price", formatInr(amount || parseAmount(product.price)));
        setText(".pdp-emi", emi || "₹7,056/mo*");
        setText(".pdp-sticky-product p", product.title);
        setText(".pdp-sticky-product strong", formatInr(amount || parseAmount(product.price)));
        var reviewProductLine = document.querySelector(".pdp-ref__review-product");
        if (reviewProductLine) {
          reviewProductLine.textContent = product.title;
        }

        var breadcrumbLinks = document.querySelectorAll(".pdp-breadcrumb a");
        if (breadcrumbLinks[0]) {
          breadcrumbLinks[0].textContent = profile.family;
        }
        if (breadcrumbLinks[1]) {
          breadcrumbLinks[1].textContent = profile.category;
        }
        if (breadcrumbLinks[2]) {
          breadcrumbLinks[2].textContent = profile.breadcrumbLeaf || profile.brand;
        }

        var optionLists = document.querySelectorAll(".pdp-option-group .pdp-option-list");
        var colorButtons = optionLists[0];
        if (colorButtons) {
          colorButtons.innerHTML = profile.colors
            .map(function (c, i) {
              return '<button type="button"' + (i === 1 ? ' class="is-active"' : "") + ">" + c + "</button>";
            })
            .join("");
        }
        var ramButtons = optionLists[1];
        if (ramButtons && profile.rams) {
          ramButtons.innerHTML = profile.rams
            .map(function (r, i) {
              return '<button type="button"' + (i === 0 ? ' class="is-active"' : "") + ">" + r + "</button>";
            })
            .join("");
        }
        var storageButtons = optionLists[2];
        if (storageButtons) {
          storageButtons.innerHTML = profile.storages
            .map(function (s, i) {
              return '<button type="button"' + (i === 0 ? ' class="is-active"' : "") + ">" + s + "</button>";
            })
            .join("");
        }

        var keyFeaturesList = document.querySelector(".pdp-features-list");
        if (keyFeaturesList) {
          keyFeaturesList.innerHTML = profile.keyFeatures
            .map(function (f) {
              var idx = f.indexOf(":");
              if (idx !== -1) {
                return (
                  "<li><strong>" +
                  f.slice(0, idx + 1) +
                  "</strong> " +
                  f.slice(idx + 1).trim() +
                  "</li>"
                );
              }
              return "<li>" + f + "</li>";
            })
            .join("");
        }

        var overviewH4 = document.querySelectorAll(".pdp-overview h4");
        var overviewP = document.querySelectorAll(".pdp-overview p");
        if (overviewH4[0]) {
          overviewH4[0].textContent = profile.overviewTitle1;
        }
        if (overviewP[0]) {
          overviewP[0].textContent = profile.overviewPara1;
        }
        if (overviewH4[1]) {
          overviewH4[1].textContent = profile.overviewTitle2;
        }
        if (overviewP[1]) {
          overviewP[1].textContent = profile.overviewPara2;
        }

        setText(".pdp-ref__desc-kicker", profile.descKicker);
        setText(".pdp-ref__desc-title", profile.descTitle);
        setText(".pdp-ref__desc-tagline", profile.descTagline);
        var descBanner = document.querySelector(".pdp-ref__desc-banner");
        if (descBanner) {
          descBanner.setAttribute("aria-label", product.title + " highlight");
        }

        setSpecByLabel("Brand", profile.brand);
        setSpecByLabel("Model", profile.modelSeries);
        setSpecByLabel("Item Code", profile.modelNumber);

        var mrpValueEl = document.querySelector(".pdp-mrp-value");
        var saveLineEl = document.querySelector(".pdp-save-line");
        if (mrpValueEl && product.mrp && mrpAmount > 0) {
          mrpValueEl.textContent = formatInr(mrpAmount);
        }
        if (saveLineEl && mrpAmount > amount && amount > 0) {
          var saveAmt = mrpAmount - amount;
          var pct = ((saveAmt / mrpAmount) * 100).toFixed(0);
          saveLineEl.textContent = "Save " + formatInr(saveAmt).replace(".00", "") + " vs MRP (" + pct + "% off)";
        }

        var offBadge = document.querySelector(".pdp-ref__off-badge");
        if (offBadge && mrpAmount > amount && amount > 0) {
          offBadge.textContent = Math.round(((mrpAmount - amount) / mrpAmount) * 100) + "% OFF";
        } else if (offBadge && offText) {
          offBadge.textContent = String(offText).replace(/off/i, "").trim() || offText;
        }

        setText(".pdp-review-box h4", "Review " + profile.modelSeries);
        setText(".pdp-review-box p", "Share your experience for " + profile.brand + " " + profile.category.toLowerCase());

        setImg(".pdp-main-image img", product.img, product.title);
        setImg(".pdp-sticky-product img", product.img, product.title);

        document.querySelectorAll(".pdp-ref__thumb[data-pdp-img]").forEach(function (thumb, idx) {
          var img = thumb.querySelector("img");
          if (img) {
            img.setAttribute("src", product.img);
            img.setAttribute("alt", product.title + " " + (idx + 1));
          }
          thumb.setAttribute("data-pdp-img", product.img);
        });
      }

      initAccordions();
      initOptionSelectors();
      initThumbStrip();
  }

  function initVoltixAccountTabs() {
    var tabs = document.querySelectorAll(".acc-dash__nav-link[data-acc-tab]");
      var panels = document.querySelectorAll(".acc-dash__main [data-acc-panel]");
      if (!tabs.length || !panels.length) {
        return;
      }

      function show(tab) {
        panels.forEach(function (panel) {
          var match = panel.getAttribute("data-acc-panel") === tab;
          panel.classList.toggle("is-active", match);
          panel.setAttribute("aria-hidden", match ? "false" : "true");
        });
        tabs.forEach(function (btn) {
          var match = btn.getAttribute("data-acc-tab") === tab;
          btn.classList.toggle("is-active", match);
          btn.setAttribute("aria-selected", match ? "true" : "false");
        });
      }

      tabs.forEach(function (btn) {
        btn.addEventListener("click", function () {
          show(btn.getAttribute("data-acc-tab"));
        });
      });

      document.querySelectorAll(".acc-js-goto-orders").forEach(function (el) {
        el.addEventListener("click", function () {
          show("orders");
          var t = document.getElementById("acc-tab-orders");
          if (t) {
            t.focus();
          }
        });
      });
  }

  function initVoltixAccountProfile() {
    var STORAGE_KEY = "voltixAccountProfile";
      var form = document.getElementById("accPersonalForm");
      var nameEl = document.getElementById("acc-overview-name");
      var emailEl = document.getElementById("acc-overview-email");
      var mobileEl = document.getElementById("acc-overview-mobile");
      var feedbackEl = document.getElementById("acc-personal-feedback");

      if (!form || !nameEl || !emailEl) {
        return;
      }

      function readStorage() {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            return null;
          }
          return JSON.parse(raw);
        } catch (err) {
          return null;
        }
      }

      function writeStorage(data) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
          /* ignore */
        }
      }

      function collectForm() {
        var genderChecked = form.querySelector('input[name="pd-gender"]:checked');
        return {
          gender: genderChecked ? genderChecked.value : "male",
          firstName: (document.getElementById("pd-first").value || "").trim(),
          lastName: (document.getElementById("pd-last").value || "").trim(),
          email: (document.getElementById("pd-email").value || "").trim(),
          mobile: (document.getElementById("pd-mobile").value || "").trim(),
          dob: (document.getElementById("pd-dob") && document.getElementById("pd-dob").value) || "",
          anniversary: (document.getElementById("pd-anniversary") && document.getElementById("pd-anniversary").value) || ""
        };
      }

      function applyToForm(data) {
        if (!data) {
          return;
        }
        form.querySelectorAll('input[name="pd-gender"]').forEach(function (r) {
          r.checked = r.value === data.gender;
        });
        document.getElementById("pd-first").value = data.firstName || "";
        document.getElementById("pd-last").value = data.lastName || "";
        document.getElementById("pd-email").value = data.email || "";
        document.getElementById("pd-mobile").value = data.mobile || "";
        var dob = document.getElementById("pd-dob");
        var ann = document.getElementById("pd-anniversary");
        if (dob) {
          dob.value = data.dob || "";
        }
        if (ann) {
          ann.value = data.anniversary || "";
        }
        syncDatePlaceholders();
      }

      function displayNameFrom(data) {
        var n = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
        return n || "guest user";
      }

      function updateOverview(data) {
        nameEl.textContent = displayNameFrom(data);
        emailEl.textContent = data.email || "—";
        if (mobileEl) {
          if (data.mobile) {
            mobileEl.textContent = data.mobile;
            mobileEl.removeAttribute("hidden");
          } else {
            mobileEl.textContent = "";
            mobileEl.setAttribute("hidden", "hidden");
          }
        }
      }

      function syncDatePlaceholders() {
        ["pd-dob", "pd-anniversary"].forEach(function (id) {
          var input = document.getElementById(id);
          if (!input) {
            return;
          }
          var wrap = input.closest(".acc-personal-field--date");
          if (wrap) {
            wrap.classList.toggle("has-value", !!input.value);
          }
        });
      }

      function initDateFields() {
        ["pd-dob", "pd-anniversary"].forEach(function (id) {
          var input = document.getElementById(id);
          if (!input) {
            return;
          }
          input.addEventListener("change", syncDatePlaceholders);
          input.addEventListener("input", syncDatePlaceholders);
        });
        syncDatePlaceholders();
      }

      var saved = readStorage();
      if (saved) {
        applyToForm(saved);
        updateOverview(saved);
      }

      initDateFields();

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = collectForm();
        writeStorage(data);
        updateOverview(data);
        if (feedbackEl) {
          feedbackEl.textContent = "Profile saved. Overview updated.";
          window.setTimeout(function () {
            if (feedbackEl) {
              feedbackEl.textContent = "";
            }
          }, 4000);
        }
      });

      document.querySelectorAll(".acc-js-goto-personal").forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          var btn = document.getElementById("acc-tab-personal");
          if (btn) {
            btn.click();
          }
        });
      });
  }

  function initVoltixAccountAddresses() {
    var STORAGE_KEY = "voltixAccountAddresses";
      var browseEl = document.getElementById("acc-addr-browse");
      var formViewEl = document.getElementById("acc-addr-form-view");
      var emptyEl = document.getElementById("acc-addr-empty");
      var listSectionEl = document.getElementById("acc-addr-list-section");
      var cardsEl = document.getElementById("acc-addr-cards");
      var formEl = document.getElementById("accAddressForm");
      var formHeadingEl = document.getElementById("acc-addr-form-heading");
      var feedbackEl = document.getElementById("acc-addr-form-feedback");
      var idInput = document.getElementById("adr-id");

      if (!browseEl || !formViewEl || !formEl || !cardsEl) {
        return;
      }

      function esc(s) {
        return String(s == null ? "" : s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function readList() {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            return [];
          }
          var parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          return [];
        }
      }

      function writeList(list) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (err) {
          /* ignore */
        }
      }

      function saveAsLabel(v) {
        if (v === "office") {
          return { text: "Office", icon: "fa-briefcase" };
        }
        if (v === "other") {
          return { text: "Others", icon: "fa-location-dot" };
        }
        return { text: "Home", icon: "fa-house" };
      }

      function formatAddress(a) {
        return [a.house, a.area, a.landmark, a.city, a.state, a.pincode].filter(Boolean).join(", ");
      }

      function renderCards(list) {
        cardsEl.innerHTML = list
          .map(function (a) {
            var sa = saveAsLabel(a.saveAs);
            var name = esc([a.firstName, a.lastName].filter(Boolean).join(" ").trim() || "—");
            var addr = esc(formatAddress(a));
            return (
              '<article class="acc-addr-card" data-addr-id="' +
              esc(a.id) +
              '">' +
              '<div class="acc-addr-card__top">' +
              '<div class="acc-addr-card__type"><i class="fa-solid ' +
              sa.icon +
              '" aria-hidden="true"></i> ' +
              esc(sa.text) +
              "</div>" +
              '<div class="acc-addr-card__actions">' +
              '<button type="button" class="acc-addr-card__action" data-acc-addr-edit="' +
              esc(a.id) +
              '"><i class="fa-solid fa-pencil" aria-hidden="true"></i> Edit</button>' +
              '<span class="acc-addr-card__sep" aria-hidden="true"></span>' +
              '<button type="button" class="acc-addr-card__action" data-acc-addr-remove="' +
              esc(a.id) +
              '"><i class="fa-solid fa-trash" aria-hidden="true"></i> Remove</button>' +
              "</div></div>" +
              '<p class="acc-addr-card__name">' +
              name +
              "</p>" +
              '<p class="acc-addr-card__addr">' +
              addr +
              "</p>" +
              "</article>"
            );
          })
          .join("");
      }

      function render() {
        var list = readList();
        if (!list.length) {
          emptyEl.hidden = false;
          listSectionEl.hidden = true;
        } else {
          emptyEl.hidden = true;
          listSectionEl.hidden = false;
          renderCards(list);
        }
      }

      function showBrowse() {
        browseEl.removeAttribute("hidden");
        formViewEl.setAttribute("hidden", "hidden");
        if (feedbackEl) {
          feedbackEl.textContent = "";
        }
        render();
      }

      function showForm(editId) {
        formEl.reset();
        if (idInput) {
          idInput.value = editId || "";
        }
        if (feedbackEl) {
          feedbackEl.textContent = "";
        }

        if (editId) {
          var list = readList();
          var a = list.find(function (x) {
            return x.id === editId;
          });
          if (a) {
            if (formHeadingEl) {
              formHeadingEl.textContent = "Edit Address";
            }
            document.getElementById("adr-first").value = a.firstName || "";
            document.getElementById("adr-last").value = a.lastName || "";
            document.getElementById("adr-email").value = a.email || "";
            document.getElementById("adr-mobile").value = a.mobile || "";
            document.getElementById("adr-house").value = a.house || "";
            document.getElementById("adr-area").value = a.area || "";
            document.getElementById("adr-landmark").value = a.landmark || "";
            document.getElementById("adr-pincode").value = a.pincode || "";
            document.getElementById("adr-city").value = a.city || "";
            document.getElementById("adr-state").value = a.state || "";
            document.getElementById("adr-default").checked = !!a.isDefault;
            var saveAs = a.saveAs || "home";
            formEl.querySelectorAll('input[name="adrSaveAs"]').forEach(function (r) {
              r.checked = r.value === saveAs;
            });
          }
        } else {
          if (formHeadingEl) {
            formHeadingEl.textContent = "Add new Address";
          }
        }

        browseEl.setAttribute("hidden", "hidden");
        formViewEl.removeAttribute("hidden");
      }

      function collectForm() {
        var saveAsEl = formEl.querySelector('input[name="adrSaveAs"]:checked');
        return {
          id: (idInput && idInput.value) || String(Date.now()) + "-" + Math.floor(Math.random() * 10000),
          firstName: (document.getElementById("adr-first").value || "").trim(),
          lastName: (document.getElementById("adr-last").value || "").trim(),
          email: (document.getElementById("adr-email").value || "").trim(),
          mobile: (document.getElementById("adr-mobile").value || "").trim(),
          house: (document.getElementById("adr-house").value || "").trim(),
          area: (document.getElementById("adr-area").value || "").trim(),
          landmark: (document.getElementById("adr-landmark").value || "").trim(),
          pincode: (document.getElementById("adr-pincode").value || "").trim(),
          city: (document.getElementById("adr-city").value || "").trim(),
          state: (document.getElementById("adr-state").value || "").trim(),
          isDefault: document.getElementById("adr-default").checked,
          saveAs: saveAsEl ? saveAsEl.value : "home"
        };
      }

      document.querySelectorAll(".acc-js-addr-open-form").forEach(function (btn) {
        btn.addEventListener("click", function () {
          showForm(null);
        });
      });

      document.querySelectorAll(".acc-js-addr-close-form").forEach(function (btn) {
        btn.addEventListener("click", function () {
          showBrowse();
        });
      });

      cardsEl.addEventListener("click", function (e) {
        var editBtn = e.target.closest("[data-acc-addr-edit]");
        var remBtn = e.target.closest("[data-acc-addr-remove]");
        if (editBtn) {
          showForm(editBtn.getAttribute("data-acc-addr-edit"));
          return;
        }
        if (remBtn) {
          var rid = remBtn.getAttribute("data-acc-addr-remove");
          var list = readList().filter(function (x) {
            return x.id !== rid;
          });
          writeList(list);
          render();
        }
      });

      formEl.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!formEl.checkValidity()) {
          formEl.reportValidity();
          return;
        }
        var data = collectForm();
        var list = readList();
        var editingId = idInput && idInput.value;

        if (editingId) {
          var idx = list.findIndex(function (x) {
            return x.id === editingId;
          });
          if (idx >= 0) {
            data.id = editingId;
            list[idx] = data;
          } else {
            list.push(data);
          }
        } else {
          list.push(data);
        }

        if (data.isDefault) {
          list.forEach(function (x) {
            if (x.id !== data.id) {
              x.isDefault = false;
            }
          });
        }

        writeList(list);
        showBrowse();
      });

      var addrTabBtn = document.getElementById("acc-tab-addresses");
      if (addrTabBtn) {
        addrTabBtn.addEventListener("click", function () {
          window.requestAnimationFrame(render);
        });
      }

      render();
  }

  initHeroCarousel();
  initLocationSelector();
  initMobileNav();
  initContactPanIndiaScrollTop();

  initHorizontalSlider({
    viewportId: "appleViewport",
    trackId: "appleTrack",
    prevId: "applePrev",
    nextId: "appleNext"
  });

  initHorizontalSlider({
    viewportId: "summerViewport",
    trackId: "summerTrack",
    prevId: "summerPrev",
    nextId: "summerNext",
    flexScrollBelow: 900,
    flexScrollClass: "summer-deals__viewport--scroll"
  });

  initHorizontalSlider({
    viewportId: "windowsViewport",
    trackId: "windowsTrack",
    prevId: "windowsPrev",
    nextId: "windowsNext"
  });

  initHorizontalSlider({
    viewportId: "trendingViewport",
    trackId: "trendingTrack",
    prevId: "trendingPrev",
    nextId: "trendingNext"
  });

  initHorizontalSlider({
    viewportId: "cromaViewport",
    trackId: "cromaTrack",
    prevId: "cromaPrev",
    nextId: "cromaNext"
  });
  initVoltixProductPage();
  initVoltixAccountTabs();
  initVoltixAccountProfile();
  initVoltixAccountAddresses();

})();
