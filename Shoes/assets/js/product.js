(() => {
  const PRODUCT_STORAGE_KEY = "stepupSelectedProduct";

  const productData = {
    "mustang-racer-black-blaze": {
      tag: "Mustang Original",
      title: "Mustang Racer Black Blaze",
      image: "assets/img/Nike Air Force 1 '07 LV8.avif",
      oldPrice: "₹12,999",
      newPrice: "₹3,999",
      discount: "69% OFF",
      description: "Ignition switch series design with sharp dial detail and premium comfort strap for all day wear.",
      meta: ["Free Shipping", "1 Year Warranty", "7 Days Easy Return"],
    },
    "mustang-stallion-nitro-black": {
      tag: "Mustang Original",
      title: "Mustang Stallion Nitro Black",
      image: "assets/img/Nike Court Shot.avif",
      oldPrice: "₹14,999",
      newPrice: "₹4,999",
      discount: "66% OFF",
      description: "Signature motorsport inspired watch face with durable body and performance-focused styling.",
      meta: ["Free Shipping", "AMOLED Display", "1 Year Warranty"],
    },
    "mustang-racer-apex-blue": {
      tag: "Mustang Original",
      title: "Mustang Racer Apex Blue",
      image: "assets/img/Nike Journey Run.avif",
      oldPrice: "₹12,999",
      newPrice: "₹3,999",
      discount: "69% OFF",
      description: "Apex blue edition with refined chronograph cues and lightweight build for daily active use.",
      meta: ["Free Shipping", "Metal Frame", "7 Days Easy Return"],
    },
    "mustang-stallion-turbo-orange": {
      tag: "Mustang Original",
      title: "Mustang Stallion Turbo Orange",
      image: "assets/img/Nike Pegasus 42.avif",
      oldPrice: "₹14,999",
      newPrice: "₹4,999",
      discount: "66% OFF",
      description: "Turbo orange strap watch designed for bold styling with all day battery and rugged durability.",
      meta: ["Free Shipping", "Ignition Switch", "1 Year Warranty"],
    },
    "saber-amoled": {
      tag: "Amoled Display",
      title: "Saber",
      image: "assets/img/Nike Pegasus Premium.avif",
      oldPrice: "₹8,999",
      newPrice: "₹2,999",
      discount: "67% OFF",
      description: "Elegant dual-tone watch with AOD support and high clarity display built for everyday premium look.",
      meta: ["AOD Mode", "AMOLED Display", "7 Days Easy Return"],
    },
    "mustang-muscle-black-fury": {
      tag: "Mustang Original",
      title: "Mustang Muscle Black Fury",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      oldPrice: "₹9,999",
      newPrice: "₹2,999",
      discount: "70% OFF",
      description: "Black fury edition with racing-inspired bezel and a sporty strap that delivers confident statement style.",
      meta: ["Free Shipping", "Ignition Strap", "1 Year Warranty"],
    },
    "noisefit-halo-2-limited": {
      tag: "Limited Edition",
      title: "NoiseFit Halo 2 Limited",
      image: "assets/img/Air Jordan 1 Low.avif",
      oldPrice: "₹6,999",
      newPrice: "₹3,999",
      discount: "42% OFF",
      description: "Premium limited series built for all-day comfort with sharp styling and dependable performance.",
      meta: ["Free Shipping", "1 Year Warranty", "7 Days Easy Return"],
    },
    "airwave-max-xr": {
      tag: "Performance Line",
      title: "Airwave Max XR",
      image: "assets/img/Air Jordan Skyline Low.avif",
      oldPrice: "₹4,999",
      newPrice: "₹3,499",
      discount: "30% OFF",
      description: "Lightweight and responsive everyday pair with long-use comfort and sporty visual detailing.",
      meta: ["Free Shipping", "Premium Build", "7 Days Easy Return"],
    },
    "buds-marine": {
      tag: "Bestseller",
      title: "Buds Marine",
      image: "assets/img/Nike Air Force 1 '07 LV8.avif",
      oldPrice: "₹3,999",
      newPrice: "₹1,999",
      discount: "50% OFF",
      description: "Urban-ready design featuring versatile comfort and bold aesthetics for everyday wear.",
      meta: ["Free Shipping", "Durable Sole", "7 Days Easy Return"],
    },
    "noisefit-twist-go": {
      tag: "Daily Wear",
      title: "NoiseFit Twist Go",
      image: "assets/img/Nike Court Shot.avif",
      oldPrice: "₹4,999",
      newPrice: "₹1,599",
      discount: "68% OFF",
      description: "Built for casual and active movement, delivering reliable support with clean modern styling.",
      meta: ["Free Shipping", "Comfort Fit", "1 Year Warranty"],
    },
    "master-buds-max": {
      tag: "Premium Pick",
      title: "Master Buds Max",
      image: "assets/img/Air Jordan 1 Mid.avif",
      oldPrice: "₹11,999",
      newPrice: "₹9,999",
      discount: "16% OFF",
      description: "High-end silhouette engineered for premium feel, smooth ride, and standout street look.",
      meta: ["Free Shipping", "Premium Cushion", "1 Year Warranty"],
    },
    "endeavour-pulse": {
      tag: "Active Series",
      title: "Endeavour Pulse",
      image: "assets/img/Nike Victori One.avif",
      oldPrice: "₹7,999",
      newPrice: "₹5,499",
      discount: "31% OFF",
      description: "A performance-inspired pair designed for stability, comfort, and confident daily movement.",
      meta: ["Free Shipping", "7 Days Easy Return", "Secure Payment"],
    },
    "mustang-torq-green": {
      tag: "Top Deal",
      title: "Mustang Torq Green",
      image: "assets/img/Nike Journey Run.avif",
      oldPrice: "₹5,999",
      newPrice: "₹1,799",
      discount: "70% OFF",
      description: "Torque-inspired styling with dynamic comfort and lightweight feel for routine wear.",
      meta: ["Free Shipping", "Top Deal Offer", "7 Days Easy Return"],
    },
    "alora-women": {
      tag: "Top Deal",
      title: "Alora (For women)",
      image: "assets/img/Nike Pegasus 42.avif",
      oldPrice: "₹7,999",
      newPrice: "₹2,499",
      discount: "69% OFF",
      description: "Elegant women-focused design with all-day comfort and versatile styling for every outing.",
      meta: ["Free Shipping", "Comfort Fit", "7 Days Easy Return"],
    },
    "mustang-stallion-nitro-black-index": {
      tag: "Top Deal",
      title: "Mustang Stallion Nitro Black",
      image: "assets/img/Nike Pegasus Premium.avif",
      oldPrice: "₹14,999",
      newPrice: "₹4,999",
      discount: "66% OFF",
      description: "Sport-luxe silhouette designed with bold detailing and confident road-ready appeal.",
      meta: ["Free Shipping", "Premium Build", "1 Year Warranty"],
    },
    "mustang-thunder": {
      tag: "Top Deal",
      title: "Mustang Thunder",
      image: "assets/img/Nike Structure 26.avif",
      oldPrice: "₹4,999",
      newPrice: "₹2,999",
      discount: "40% OFF",
      description: "Dynamic, lightweight pair with enhanced grip and comfort for everyday active usage.",
      meta: ["Free Shipping", "Shock Absorption", "7 Days Easy Return"],
    },
    "mustang-torq-yellow": {
      tag: "Top Deal",
      title: "Mustang Torq Yellow",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      oldPrice: "₹1,999",
      newPrice: "₹1,799",
      discount: "10% OFF",
      description: "Vibrant yellow edition with easy-on design and supportive daily comfort.",
      meta: ["Free Shipping", "Easy Fit", "Secure Payment"],
    },
  };

  const productImage = document.getElementById("productImage");
  const productCrumbName = document.getElementById("productCrumbName");
  const productTag = document.getElementById("productTag");
  const productTitle = document.getElementById("productTitle");
  const productOldPrice = document.getElementById("productOldPrice");
  const productNewPrice = document.getElementById("productNewPrice");
  const productDiscount = document.getElementById("productDiscount");
  const productDescription = document.getElementById("productDescription");
  const productMetaList = document.getElementById("productMetaList");

  const formatTitleFromKey = (key) =>
    key
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const readStoredSelection = () => {
    try {
      const raw = sessionStorage.getItem(PRODUCT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_error) {
      return null;
    }
  };

  const normalizeData = (data) => {
    if (!data) {
      return null;
    }
    return {
      title: data.title || "Urban Runner X",
      tag: data.tag || "Premium comfort and performance",
      image: data.image || "assets/img/product-main-buds.png",
      oldPrice: data.oldPrice || "₹6,999",
      newPrice: data.newPrice || "₹3,999",
      discount: data.discount || "43% off",
      description:
        data.description ||
        "Designed for performance and everyday comfort with lightweight construction and responsive cushioning.",
      meta: Array.isArray(data.meta) && data.meta.length
        ? data.meta
        : ["7 day replacement", "6 months warranty", "Secure payment"],
    };
  };

  if (productTitle) {
    const selectedProduct = new URLSearchParams(window.location.search).get("product");
    const storedProduct = readStoredSelection();
    const fromStorage =
      selectedProduct && storedProduct && storedProduct.key === selectedProduct ? storedProduct : null;
    const fromStaticData = selectedProduct ? productData[selectedProduct] : null;
    const fallbackFromKey = selectedProduct
      ? {
          title: formatTitleFromKey(selectedProduct),
          tag: "Premium comfort and performance",
        }
      : null;
    const data = normalizeData(fromStorage || fromStaticData || fallbackFromKey);

    if (data) {
      if (productImage) {
        productImage.src = data.image;
        productImage.alt = data.title;
        productImage.loading = "eager";
        productImage.onerror = () => {
          productImage.onerror = null;
          productImage.src = "assets/img/product-main-buds.png";
        };
      }
      if (productTag) productTag.textContent = data.tag;
      if (productCrumbName) productCrumbName.textContent = data.title;
      productTitle.textContent = data.title;
      if (productOldPrice) productOldPrice.textContent = data.oldPrice;
      if (productNewPrice) productNewPrice.textContent = data.newPrice;
      if (productDiscount) productDiscount.textContent = data.discount.toLowerCase();
      if (productDescription) productDescription.textContent = data.description;
      if (productMetaList) {
        productMetaList.innerHTML = data.meta
          .map((item) => `<div><i class="bi bi-check-circle"></i><span>${item}</span></div>`)
          .join("");
      }
      document.title = `StepUp Shoes - ${data.title}`;
    }
  }

  const productAccordion = document.querySelector(".product-info-accordion");
  if (productAccordion) {
    const accordionItems = Array.from(productAccordion.querySelectorAll(".info-item"));
    if (accordionItems.length) {
      const setAccordionState = (openItem) => {
        accordionItems.forEach((item) => {
          const btn = item.querySelector(".info-toggle");
          const icon = btn ? btn.querySelector("i") : null;
          const isOpen = item === openItem;
          item.classList.toggle("is-open", isOpen);
          if (btn) {
            btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
          }
          if (icon) {
            icon.className = isOpen ? "bi bi-chevron-up" : "bi bi-chevron-down";
          }
        });
      };

      const defaultOpen = productAccordion.querySelector(".info-item.is-open") || accordionItems[0];
      setAccordionState(defaultOpen);

      productAccordion.addEventListener("click", (event) => {
        const clickedToggle = event.target.closest(".info-toggle");
        if (!clickedToggle) {
          return;
        }
        const clickedItem = clickedToggle.closest(".info-item");
        if (!clickedItem) {
          return;
        }
        setAccordionState(clickedItem);
      });
    }
  }

  const tabSection = document.querySelector(".pdp-tabs-section");
  if (tabSection) {
    const siteHeader = document.querySelector(".site-header");
    const stickyNav = tabSection.querySelector(".pdp-sticky-nav");
    const panels = Array.from(tabSection.querySelectorAll(".pdp-panel"));
    const tabs = Array.from(tabSection.querySelectorAll(".pdp-sticky-nav .pdp-tab"));

    const syncPdpScrollOffsets = () => {
      const headerH = siteHeader?.offsetHeight ?? 0;
      const navH = stickyNav?.offsetHeight ?? 52;
      document.documentElement.style.setProperty("--pdp-header-h", `${headerH}px`);
      document.documentElement.style.setProperty("--pdp-sticky-tabs-h", `${navH}px`);
      document.documentElement.style.setProperty("--pdp-scroll-margin", `${headerH + navH + 12}px`);
    };

    const syncActivePdpTab = () => {
      if (!panels.length || !tabs.length) {
        return;
      }
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--pdp-scroll-margin").trim();
      const margin = Number.parseFloat(raw) || 188;
      let activeId = panels[0].id;
      for (const panel of panels) {
        if (panel.getBoundingClientRect().top <= margin + 2) {
          activeId = panel.id;
        }
      }
      tabs.forEach((tab) => {
        const href = tab.getAttribute("href");
        const id = href && href.startsWith("#") ? href.slice(1) : "";
        const on = id === activeId;
        tab.classList.toggle("is-active", on);
        if (on) {
          tab.setAttribute("aria-current", "true");
        } else {
          tab.removeAttribute("aria-current");
        }
      });
    };

    syncPdpScrollOffsets();
    syncActivePdpTab();
    window.addEventListener(
      "resize",
      () => {
        syncPdpScrollOffsets();
        syncActivePdpTab();
      },
      { passive: true },
    );
    window.addEventListener("scroll", syncActivePdpTab, { passive: true });

    let hashTarget = null;
    if (window.location.hash) {
      try {
        hashTarget = tabSection.querySelector(window.location.hash);
      } catch (_error) {
        hashTarget = null;
      }
    }
    if (hashTarget) {
      requestAnimationFrame(() => {
        syncPdpScrollOffsets();
        hashTarget.scrollIntoView({ behavior: "auto", block: "start" });
        syncActivePdpTab();
      });
    }

    const compareGrid = tabSection.querySelector("#pdpCompareGrid");
    if (compareGrid) {
      const compareProducts = {
        "urban-runner-green": {
          title: "ADIDAS FEROZA AUDI REVOLUT F1 TEAM SHOES",
          image: "assets/img/ADIDAS FEROZA AUDI REVOLUT F1 TEAM SHOES.avif",
          alt: "Urban Runner Green",
          specs: "Lightweight | Air Cushion | All-Day Comfort",
          newPrice: "₹2,499",
          oldPrice: "₹5,999",
          off: "58% OFF",
          offerPrice: "₹2,299",
          swatches: ["#2f2f2f", "#14532d", "#f59e0b"],
          more: "+2",
        },
        "street-flex-women": {
          title: "ULTRABOOST 5 AUDI REVOLUT F1 TEAM SHOES",
          image: "assets/img/ULTRABOOST 5 AUDI REVOLUT F1 TEAM SHOES.avif",
          alt: "Street Flex Women Sneakers",
          specs: "Breathable Mesh | Flexible Sole | Stylish Fit",
          newPrice: "₹2,999",
          oldPrice: "₹6,999",
          off: "57% OFF",
          offerPrice: "₹2,699",
          swatches: ["#111827", "#2563eb", "#4b5563"],
          more: "+3",
        },
        "airstride-black": {
          title: "Lightblaze Shoes",
          image: "assets/img/Lightblaze Shoes.avif",
          alt: "AirStride Black Sneakers",
          specs: "Shock Absorption | Premium Build | Grip Sole",
          newPrice: "₹3,499",
          oldPrice: "₹7,999",
          off: "56% OFF",
          offerPrice: "₹3,499",
          swatches: ["#111827", "#16a34a", "#f97316"],
          more: "+2",
        },
        "powerfit-trainer": {
          title: "Rapidmove ADV 2 Training Shoes",
          image: "assets/img/Rapidmove ADV 2 Training Shoes.avif",
          alt: "PowerFit Trainer Sneakers",
          specs: "High Grip | Training Ready | Durable",
          newPrice: "₹2,999",
          oldPrice: "₹4,999",
          off: "40% OFF",
          offerPrice: "₹2,799",
          swatches: ["#1d4ed8", "#111827", "#334155"],
          more: "+2",
        },
        "cloudwalk-yellow": {
          title: "CLOUDFOAM CUXXION RAPIDFIT SHOES",
          image: "assets/img/CLOUDFOAM CUXXION RAPIDFIT SHOES.avif",
          alt: "CloudWalk Yellow Sneakers",
          specs: "Ultra Light | Comfort Fit | Everyday Wear",
          newPrice: "₹2,499",
          oldPrice: "₹3,999",
          off: "37% OFF",
          offerPrice: "₹2,349",
          swatches: ["#0ea5e9", "#111827", "#facc15"],
          more: "+3",
        },
      };

      const compareSlotState = ["urban-runner-green", "street-flex-women", "airstride-black", null];

      const getSelectOptionsHtml = () => {
        const used = new Set(compareSlotState.filter(Boolean));
        const options = ['<option value="">Select Product</option>'];
        Object.entries(compareProducts).forEach(([key, product]) => {
          const disabled = used.has(key) ? "disabled" : "";
          options.push(`<option value="${key}" ${disabled}>${product.title}</option>`);
        });
        return options.join("");
      };

      const renderCompare = () => {
        const selectOptions = getSelectOptionsHtml();
        compareGrid.innerHTML = compareSlotState
          .map((productKey, index) => {
            if (!productKey || !compareProducts[productKey]) {
              return `
                <article class="pdp-compare-add pdp-compare-add-slot" data-slot-index="${index}">
                  <h3>Add a product to compare</h3>
                  <label class="pdp-compare-select-wrap">
                    <span class="visually-hidden">Select product</span>
                    <select class="pdp-compare-select" aria-label="Select product to compare" data-slot-index="${index}">
                      ${selectOptions}
                    </select>
                    <i class="bi bi-chevron-down"></i>
                  </label>
                </article>
              `;
            }

            const product = compareProducts[productKey];
            const swatchHtml = product.swatches
              .map((color) => `<span style="--c:${color}"></span>`)
              .join("");
            return `
              <article class="pdp-compare-card" data-slot-index="${index}" data-compare-product="${productKey}">
                <div class="pdp-compare-media">
                  <button type="button" class="pdp-compare-remove" aria-label="Remove from compare"><i class="bi bi-x-lg"></i></button>
                  <img src="${product.image}" alt="${product.alt}">
                </div>
                <div class="pdp-compare-body">
                  <h3>${product.title}</h3>
                  <p class="pdp-compare-specs">${product.specs}</p>
                  <p class="pdp-compare-price-row"><strong>${product.newPrice}</strong> <del>${product.oldPrice}</del> <span class="pdp-compare-off">${product.off}</span></p>
                  <p class="pdp-compare-offer"><span class="pdp-coin" aria-hidden="true"></span> Offer Price <strong>${product.offerPrice}</strong></p>
                  <div class="pdp-compare-swatches">${swatchHtml}<span class="pdp-more">${product.more}</span></div>
                  <label class="pdp-compare-check"><input type="checkbox"> Add to Compare</label>
                </div>
              </article>
            `;
          })
          .join("");
      };

      compareGrid.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".pdp-compare-remove");
        if (!removeBtn) {
          return;
        }
        const card = removeBtn.closest("[data-slot-index]");
        if (!card) {
          return;
        }
        const slotIndex = Number(card.getAttribute("data-slot-index"));
        if (Number.isNaN(slotIndex)) {
          return;
        }
        compareSlotState[slotIndex] = null;
        renderCompare();
      });

      compareGrid.addEventListener("change", (event) => {
        const select = event.target.closest(".pdp-compare-select");
        if (!select) {
          return;
        }
        const selectedKey = select.value;
        if (!selectedKey || !compareProducts[selectedKey]) {
          return;
        }
        const slotIndex = Number(select.getAttribute("data-slot-index"));
        if (Number.isNaN(slotIndex)) {
          return;
        }
        if (compareSlotState.includes(selectedKey)) {
          window.alert("This product is already added in compare.");
          select.value = "";
          return;
        }
        compareSlotState[slotIndex] = selectedKey;
        renderCompare();
      });

      renderCompare();
    }

    tabSection.querySelectorAll(".pdp-spec-acc").forEach((wrap) => {
      const trigger = wrap.querySelector(".pdp-spec-acc-trigger");
      const panel = wrap.querySelector(".pdp-spec-acc-panel");
      if (!trigger || !panel) {
        return;
      }
      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        trigger.classList.toggle("is-open", !open);
        panel.toggleAttribute("hidden", open);
      });
    });

    tabSection.querySelectorAll(".pdp-faq-item").forEach((wrap) => {
      const trigger = wrap.querySelector(".pdp-faq-trigger");
      const panel = wrap.querySelector(".pdp-faq-panel");
      if (!trigger || !panel) {
        return;
      }
      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        trigger.classList.toggle("is-open", !open);
        panel.toggleAttribute("hidden", open);
      });
    });
  }
})();
