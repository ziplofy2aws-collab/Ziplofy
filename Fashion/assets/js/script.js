const moreBrandsBtn = document.querySelector(".more-brands-btn");
const heroArrows = document.querySelectorAll(".hero-arrow");
const heroTrack = document.querySelector(".hero-track");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroDots = document.querySelectorAll(".hero-dot");
const heroPrevBtn = document.querySelector(".hero-arrow-left");
const heroNextBtn = document.querySelector(".hero-arrow-right");
const trendingCarousel = document.querySelector(".trending-carousel");
const trendingTrack = document.querySelector(".trending-track");
const trendingCards = document.querySelectorAll(".trend-card");
const trendingPrevBtn = document.querySelector(".trending-prev-btn");
const trendingNextBtn = document.querySelector(".trending-next-btn");
const trendingProgressFill = document.querySelector(".trending-progress-fill");
const curatedCards = document.querySelectorAll(".curated-card");
const curatedPrevBtn = document.querySelector(".curated-prev");
const curatedNextBtn = document.querySelector(".curated-next");
const arrivalCarousel = document.querySelector(".arrival-carousel");
const arrivalTrack = document.querySelector(".arrival-track");
const arrivalCards = document.querySelectorAll(".arrival-card");
const arrivalPrevBtn = document.querySelector(".arrival-prev-btn");
const arrivalNextBtn = document.querySelector(".arrival-next-btn");
const arrivalProgressFill = document.querySelector(".arrival-progress-fill");
const newArrivalsCarousel = document.querySelector(".new-arrivals-carousel");
const newArrivalsTrack = document.querySelector(".new-arrivals-track");
const newArrivalsCards = document.querySelectorAll(".new-arrival-card");
const newArrivalsPrevBtn = document.querySelector(".new-arrivals-prev");
const newArrivalsNextBtn = document.querySelector(".new-arrivals-next");
const newArrivalsProgressFill = document.querySelector(".new-arrivals-progress-fill");
let activeHeroIndex = 0;
let trendingScrollOffset = 0;
let activeCuratedIndex = 0;
let arrivalScrollOffset = 0;
let newArrivalsScrollOffset = 0;

if (moreBrandsBtn) {
  moreBrandsBtn.addEventListener("click", () => {
    moreBrandsBtn.classList.toggle("is-open");
  });
}

(function initCategoryCarousel() {
  const carousel = document.querySelector(".category-carousel");
  const grid = carousel?.querySelector(".category-grid");
  if (!carousel || !grid) return;

  const mq = window.matchMedia("(max-width: 768px)");

  const syncSlideWidth = () => {
    if (!mq.matches) {
      carousel.style.removeProperty("--cat-slide");
      return;
    }
    carousel.style.setProperty("--cat-slide", `${Math.round(carousel.clientWidth)}px`);
  };

  const gapPx = () => {
    const g = getComputedStyle(grid).gap || getComputedStyle(grid).columnGap;
    const n = parseFloat(g);
    return Number.isFinite(n) ? n : 12;
  };

  const scrollBySlide = (dir) => {
    const card = grid.querySelector(".category-card");
    if (!card) return;
    const step = card.offsetWidth + gapPx();
    carousel.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const scrollNextOrWrap = () => {
    if (!mq.matches) return;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth - 4;
    if (carousel.scrollLeft >= maxScroll) {
      carousel.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollBySlide(1);
    }
  };

  carousel.addEventListener("keydown", (e) => {
    if (!mq.matches) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNextOrWrap();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollBySlide(-1);
    }
  });

  mq.addEventListener("change", syncSlideWidth);
  window.addEventListener("resize", syncSlideWidth, { passive: true });
  window.addEventListener("load", syncSlideWidth, { passive: true });
  requestAnimationFrame(syncSlideWidth);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => syncSlideWidth());
    ro.observe(carousel);
  }
})();

(function initLpMobileDrawer() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const drawer = document.getElementById("lp-mobile-drawer");
  const backdrop = document.getElementById("lp-drawer-backdrop");
  const closeBtn = document.querySelector(".lp-drawer-close");
  if (!toggle || !drawer || !backdrop) return;

  const open = () => {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-visible");
    backdrop.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    drawer.removeAttribute("inert");
    document.body.classList.add("lp-drawer-open");
  };

  const close = () => {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    backdrop.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    document.body.classList.remove("lp-drawer-open");
  };

  toggle.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) close();
    else open();
  });

  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
  });

  drawer.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", close);
  });
})();

const updateHeroSlider = (nextIndex) => {
  if (!heroTrack || !heroSlides.length) return;

  const total = heroSlides.length;
  activeHeroIndex = (nextIndex + total) % total;
  heroTrack.style.transform = `translateX(-${activeHeroIndex * 100}%)`;

  heroSlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeHeroIndex);
  });

  heroDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeHeroIndex);
  });
};

heroArrows.forEach((arrow) => {
  arrow.addEventListener("click", () => {
    arrow.classList.add("is-tapped");
    setTimeout(() => arrow.classList.remove("is-tapped"), 120);
  });
});

if (heroPrevBtn) {
  heroPrevBtn.addEventListener("click", () => {
    updateHeroSlider(activeHeroIndex - 1);
  });
}

if (heroNextBtn) {
  heroNextBtn.addEventListener("click", () => {
    updateHeroSlider(activeHeroIndex + 1);
  });
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    updateHeroSlider(index);
  });
});

updateHeroSlider(0);

const getTrendingStep = () => {
  if (!trendingCards.length) return 0;
  const gap = 14;
  return trendingCards[0].offsetWidth + gap;
};

const applyTrendingScroll = (targetOffsetPx) => {
  if (!trendingCarousel || !trendingTrack || !trendingCards.length) return;

  const maxOffset = Math.max(0, trendingTrack.scrollWidth - trendingCarousel.clientWidth);
  trendingScrollOffset = Math.min(maxOffset, Math.max(0, targetOffsetPx));

  trendingTrack.style.transform = `translateX(-${trendingScrollOffset}px)`;

  if (trendingProgressFill) {
    const progress = maxOffset <= 0 ? 100 : (trendingScrollOffset / maxOffset) * 100;
    trendingProgressFill.style.width = `${progress}%`;
  }

  const edge = 2;
  const atStart = trendingScrollOffset <= edge;
  const atEnd = trendingScrollOffset >= maxOffset - edge;
  if (trendingPrevBtn) trendingPrevBtn.disabled = atStart || maxOffset <= 0;
  if (trendingNextBtn) trendingNextBtn.disabled = atEnd || maxOffset <= 0;
};

if (trendingPrevBtn) {
  trendingPrevBtn.addEventListener("click", () => {
    const step = getTrendingStep();
    if (!step) return;
    applyTrendingScroll(trendingScrollOffset - step);
  });
}

if (trendingNextBtn) {
  trendingNextBtn.addEventListener("click", () => {
    const step = getTrendingStep();
    if (!step) return;
    applyTrendingScroll(trendingScrollOffset + step);
  });
}

applyTrendingScroll(0);

const updateCuratedSlider = (nextIndex) => {
  if (!curatedCards.length) return;

  const total = curatedCards.length;
  activeCuratedIndex = (nextIndex + total) % total;

  curatedCards.forEach((card, index) => {
    const rawDelta = index - activeCuratedIndex;
    let wrappedDelta = rawDelta;

    if (wrappedDelta > total / 2) wrappedDelta -= total;
    if (wrappedDelta < -total / 2) wrappedDelta += total;

    card.classList.remove("pos--2", "pos--1", "pos-0", "pos-1", "pos-2");

    if (wrappedDelta >= -2 && wrappedDelta <= 2) {
      const mapped = wrappedDelta === 0 ? "0" : `${wrappedDelta}`;
      card.classList.add(`pos-${mapped}`);
      card.style.pointerEvents = wrappedDelta === 0 ? "auto" : "none";
    } else {
      card.style.pointerEvents = "none";
    }
  });
};

if (curatedPrevBtn) {
  curatedPrevBtn.addEventListener("click", () => {
    updateCuratedSlider(activeCuratedIndex - 1);
  });
}

if (curatedNextBtn) {
  curatedNextBtn.addEventListener("click", () => {
    updateCuratedSlider(activeCuratedIndex + 1);
  });
}

const ARRIVAL_CARD_GAP = 14;

const getArrivalTrackWidth = () => {
  if (!arrivalCards.length) return 0;
  let total = 0;
  arrivalCards.forEach((card, i) => {
    total += card.offsetWidth;
    if (i < arrivalCards.length - 1) total += ARRIVAL_CARD_GAP;
  });
  return total;
};

const getArrivalMaxOffset = () => {
  if (!arrivalCarousel || !arrivalCards.length) return 0;
  const viewport = arrivalCarousel.clientWidth;
  const content = Math.max(getArrivalTrackWidth(), arrivalTrack?.scrollWidth ?? 0);
  return Math.max(0, content - viewport);
};

const getArrivalStep = () => {
  if (!arrivalCards.length) return 0;
  return arrivalCards[0].offsetWidth + ARRIVAL_CARD_GAP;
};

const applyArrivalScroll = (targetOffsetPx) => {
  if (!arrivalCarousel || !arrivalTrack || !arrivalCards.length) return;

  const maxOffset = getArrivalMaxOffset();
  arrivalScrollOffset = Math.min(maxOffset, Math.max(0, targetOffsetPx));

  arrivalTrack.style.transform = `translateX(-${arrivalScrollOffset}px)`;

  if (arrivalProgressFill) {
    const progress = maxOffset <= 0 ? 100 : (arrivalScrollOffset / maxOffset) * 100;
    arrivalProgressFill.style.width = `${progress}%`;
  }

  const edge = 2;
  const atStart = arrivalScrollOffset <= edge;
  const atEnd = arrivalScrollOffset >= maxOffset - edge;
  if (arrivalPrevBtn) arrivalPrevBtn.disabled = atStart || maxOffset <= 0;
  if (arrivalNextBtn) arrivalNextBtn.disabled = atEnd || maxOffset <= 0;
};

if (arrivalPrevBtn) {
  arrivalPrevBtn.addEventListener("click", () => {
    const step = getArrivalStep();
    if (!step) return;
    applyArrivalScroll(arrivalScrollOffset - step);
  });
}

if (arrivalNextBtn) {
  arrivalNextBtn.addEventListener("click", () => {
    const step = getArrivalStep();
    if (!step) return;
    applyArrivalScroll(arrivalScrollOffset + step);
  });
}

const getNewArrivalsStep = () => {
  if (!newArrivalsCards.length) return 0;
  const gap = 14;
  return newArrivalsCards[0].offsetWidth + gap;
};

const applyNewArrivalsScroll = (targetOffsetPx) => {
  if (!newArrivalsCarousel || !newArrivalsTrack || !newArrivalsCards.length) return;

  const maxOffset = Math.max(0, newArrivalsTrack.scrollWidth - newArrivalsCarousel.clientWidth);
  newArrivalsScrollOffset = Math.min(maxOffset, Math.max(0, targetOffsetPx));

  newArrivalsTrack.style.transform = `translateX(-${newArrivalsScrollOffset}px)`;

  if (newArrivalsProgressFill) {
    const progress = maxOffset <= 0 ? 100 : (newArrivalsScrollOffset / maxOffset) * 100;
    newArrivalsProgressFill.style.width = `${progress}%`;
  }

  const edge = 2;
  const atStart = newArrivalsScrollOffset <= edge;
  const atEnd = newArrivalsScrollOffset >= maxOffset - edge;
  if (newArrivalsPrevBtn) newArrivalsPrevBtn.disabled = atStart;
  if (newArrivalsNextBtn) newArrivalsNextBtn.disabled = atEnd || maxOffset <= 0;
};

const stepNewArrivals = (direction) => {
  const step = getNewArrivalsStep();
  if (!step) return;
  applyNewArrivalsScroll(newArrivalsScrollOffset + direction * step);
};

if (newArrivalsPrevBtn) {
  newArrivalsPrevBtn.addEventListener("click", () => stepNewArrivals(-1));
}

if (newArrivalsNextBtn) {
  newArrivalsNextBtn.addEventListener("click", () => stepNewArrivals(1));
}

window.addEventListener("resize", () => {
  applyTrendingScroll(trendingScrollOffset);
  applyArrivalScroll(arrivalScrollOffset);
  applyNewArrivalsScroll(newArrivalsScrollOffset);
});

updateCuratedSlider(0);
applyArrivalScroll(0);
applyNewArrivalsScroll(0);
requestAnimationFrame(() => {
  applyArrivalScroll(arrivalScrollOffset);
});
window.addEventListener("load", () => {
  applyTrendingScroll(trendingScrollOffset);
  applyArrivalScroll(arrivalScrollOffset);
  applyNewArrivalsScroll(newArrivalsScrollOffset);
});

document.querySelectorAll(".pdp-acc").forEach((acc) => {
  const head = acc.querySelector(".pdp-acc-head");
  if (!head) return;
  head.addEventListener("click", () => {
    const willOpen = !acc.classList.contains("is-open");
    acc.classList.toggle("is-open", willOpen);
    head.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });
});

document.querySelectorAll(".pdp-sizes .pdp-size").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".pdp-sizes")?.querySelectorAll(".pdp-size").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  });
});

(() => {
  const bar = document.querySelector(".plp-filter-bar");
  const grid = document.getElementById("plp-grid");
  const emptyMsg = document.getElementById("plp-empty");
  if (!bar || !grid) return;

  const cards = () => Array.from(grid.querySelectorAll(".plp-card"));
  const filters = bar.querySelectorAll(".plp-filter[data-plp-key]");
  const sortWrap = bar.querySelector(".plp-filter--sort");
  const sortValueEl = bar.querySelector(".plp-sort-value");

  const state = {};
  let sortMode = "popular";

  const saveDefaultLabels = () => {
    filters.forEach((wrap) => {
      const textEl = wrap.querySelector(".plp-filter-trigger-text");
      if (textEl && !wrap.dataset.plpDefaultLabel) {
        wrap.dataset.plpDefaultLabel = textEl.textContent.trim();
      }
    });
  };

  const closeAllFilters = (except) => {
    bar.querySelectorAll(".plp-filter.is-open").forEach((el) => {
      if (el !== except) {
        el.classList.remove("is-open");
        const t = el.querySelector(".plp-filter-trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      }
    });
  };

  const setOpen = (wrap, open) => {
    if (open) {
      closeAllFilters(wrap);
      wrap.classList.add("is-open");
      wrap.querySelector(".plp-filter-trigger")?.setAttribute("aria-expanded", "true");
    } else {
      wrap.classList.remove("is-open");
      wrap.querySelector(".plp-filter-trigger")?.setAttribute("aria-expanded", "false");
    }
  };

  const updateFilterTriggerLabel = (wrap, selectedOptBtn) => {
    const textEl = wrap.querySelector(".plp-filter-trigger-text");
    const def = wrap.dataset.plpDefaultLabel || "";
    if (!textEl) return;
    if (!selectedOptBtn || selectedOptBtn.dataset.value === "") {
      textEl.textContent = def;
      return;
    }
    textEl.textContent = `${def} · ${selectedOptBtn.textContent.trim()}`;
  };

  const syncSelectedStyles = () => {
    filters.forEach((wrap) => {
      const key = wrap.dataset.plpKey;
      const val = state[key] || "";
      wrap.querySelectorAll(".plp-filter-opt").forEach((b) => {
        b.classList.toggle("is-selected", (b.dataset.value || "") === val);
      });
    });
  };

  const cardMatches = (card) => {
    for (const [key, val] of Object.entries(state)) {
      if (val === undefined || val === "") continue;
      const v = card.dataset[key];
      if (v === undefined) return false;
      if (v !== val) return false;
    }
    return true;
  };

  const sortCompare = (a, b) => {
    if (sortMode === "price-asc") {
      return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
    }
    if (sortMode === "price-desc") {
      return Number(b.dataset.price || 0) - Number(a.dataset.price || 0);
    }
    if (sortMode === "newest") {
      return Number(b.dataset.popular || 0) - Number(a.dataset.popular || 0);
    }
    return Number(a.dataset.popular || 0) - Number(b.dataset.popular || 0);
  };

  const applyFiltersAndSort = () => {
    let visible = 0;
    const list = cards();
    list.forEach((card) => {
      const ok = cardMatches(card);
      card.classList.toggle("is-plp-hidden", !ok);
      if (ok) visible += 1;
    });

    if (emptyMsg) {
      emptyMsg.hidden = visible > 0;
    }

    const countEl = document.getElementById("plp-visible-count");
    if (countEl) countEl.textContent = String(visible);

    const vis = list.filter((c) => !c.classList.contains("is-plp-hidden"));
    const hid = list.filter((c) => c.classList.contains("is-plp-hidden"));
    vis.sort(sortCompare);
    const frag = document.createDocumentFragment();
    vis.forEach((c) => frag.appendChild(c));
    hid.forEach((c) => frag.appendChild(c));
    grid.appendChild(frag);
  };

  saveDefaultLabels();
  sortWrap?.querySelector('.plp-sort-opt[data-sort="popular"]')?.classList.add("is-selected");

  filters.forEach((wrap) => {
    const key = wrap.dataset.plpKey;
    if (!key) return;
    state[key] = "";

    const trigger = wrap.querySelector(".plp-filter-trigger");
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !wrap.classList.contains("is-open");
      setOpen(wrap, open);
    });

    wrap.querySelectorAll(".plp-filter-opt").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = opt.dataset.value ?? "";
        state[key] = val;
        syncSelectedStyles();
        updateFilterTriggerLabel(wrap, val === "" ? null : opt);
        setOpen(wrap, false);
        applyFiltersAndSort();
      });
    });
  });

  if (sortWrap) {
    const sortTrigger = sortWrap.querySelector(".plp-sort-trigger");
    sortTrigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !sortWrap.classList.contains("is-open");
      setOpen(sortWrap, open);
    });

    sortWrap.querySelectorAll(".plp-sort-opt").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const mode = opt.dataset.sort || "popular";
        sortMode = mode;
        sortWrap.querySelectorAll(".plp-sort-opt").forEach((b) => {
          b.classList.toggle("is-selected", b === opt);
        });
        if (sortValueEl) sortValueEl.textContent = opt.textContent.trim();
        setOpen(sortWrap, false);
        applyFiltersAndSort();
      });
    });
  }

  document.addEventListener("click", () => closeAllFilters(null));

  applyFiltersAndSort();
})();

(function initCategoryPillStrip() {
  const strip = document.getElementById("category-pill-scroll");
  const nextBtn = document.getElementById("category-pill-next");
  if (!strip || !nextBtn) return;

  const scrollNext = () => {
    const amount = Math.max(140, Math.round(strip.clientWidth * 0.72));
    strip.scrollBy({ left: amount, behavior: "smooth" });
  };

  const syncNextVisibility = () => {
    const maxScroll = strip.scrollWidth - strip.clientWidth;
    const needsScroll = maxScroll > 6;
    nextBtn.toggleAttribute("hidden", !needsScroll);
    nextBtn.setAttribute("aria-hidden", needsScroll ? "false" : "true");
  };

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    scrollNext();
  });

  strip.addEventListener("scroll", syncNextVisibility, { passive: true });
  window.addEventListener("resize", syncNextVisibility, { passive: true });
  window.addEventListener("load", syncNextVisibility, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(syncNextVisibility);
    ro.observe(strip);
    const track = strip.querySelector(".category-pill-track");
    if (track) ro.observe(track);
  }
  requestAnimationFrame(syncNextVisibility);
})();

(function initPlpMobileChrome() {
  const backdrop = document.getElementById("plp-mobile-filter-backdrop");
  const bar = document.getElementById("plp-filter-bar");
  const openFilters = document.getElementById("plp-mobile-open-filters");
  const openSort = document.getElementById("plp-mobile-open-sort");
  const closeBtn = document.getElementById("plp-mobile-close-filters");
  const sortBlock = document.getElementById("plp-sort-block");
  if (!backdrop || !bar || !openFilters || !openSort) return;

  const mq = window.matchMedia("(max-width: 620px)");

  const closeSheet = () => {
    document.body.classList.remove("plp-mobile-filters-open");
    backdrop.setAttribute("aria-hidden", "true");
    bar.querySelectorAll(".plp-filter.is-open").forEach((el) => {
      el.classList.remove("is-open");
      el.querySelector(".plp-filter-trigger")?.setAttribute("aria-expanded", "false");
    });
  };

  const openSheet = (focusSort) => {
    if (!mq.matches) return;
    document.body.classList.add("plp-mobile-filters-open");
    backdrop.setAttribute("aria-hidden", "false");
    bar.scrollTop = 0;
    if (focusSort && sortBlock) {
      window.setTimeout(() => {
        sortBlock.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const sortWrap = bar.querySelector(".plp-filter--sort");
        const sortTrigger = sortWrap?.querySelector(".plp-sort-trigger");
        if (sortWrap && sortTrigger && !sortWrap.classList.contains("is-open")) {
          sortTrigger.click();
        }
      }, 320);
    }
  };

  openFilters.addEventListener("click", (e) => {
    e.stopPropagation();
    openSheet(false);
  });

  openSort.addEventListener("click", (e) => {
    e.stopPropagation();
    openSheet(true);
  });

  backdrop.addEventListener("click", closeSheet);
  closeBtn?.addEventListener("click", closeSheet);

  mq.addEventListener("change", (ev) => {
    if (!ev.matches) closeSheet();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("plp-mobile-filters-open")) {
      closeSheet();
    }
  });
})();

document.querySelectorAll(".plp-card-wish, .plp-card-similar-img, .plp-card-compare").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

const plpBackTop = document.getElementById("plp-back-top");
if (plpBackTop) {
  const onScroll = () => {
    plpBackTop.classList.toggle("is-visible", window.scrollY > 380);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  plpBackTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const plpLoadMore = document.getElementById("plp-load-more");
if (plpLoadMore) {
  plpLoadMore.addEventListener("click", () => {
    plpLoadMore.disabled = true;
    plpLoadMore.textContent = "NO MORE ITEMS";
    plpLoadMore.style.opacity = "0.6";
  });
}

(function similarProductsCarousel() {
  const track = document.querySelector(".similar-track");
  const viewport = document.querySelector(".similar-viewport");
  const prev = document.querySelector(".similar-prev");
  const next = document.querySelector(".similar-next");
  if (!track || !viewport || !prev || !next) return;

  const cards = () => Array.from(track.querySelectorAll(".similar-card"));
  let offset = 0;

  const gap = () => parseFloat(getComputedStyle(track).gap) || 18;

  const step = () => {
    const list = cards();
    if (!list.length) return 0;
    return list[0].offsetWidth + gap();
  };

  const maxOffset = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  const clampOffset = () => {
    const m = maxOffset();
    offset = Math.min(m, Math.max(0, offset));
  };

  const apply = () => {
    clampOffset();
    track.style.transform = `translateX(${-offset}px)`;
    const m = maxOffset();
    const edge = 2;
    const atStart = offset <= edge;
    const atEnd = offset >= m - edge;
    prev.disabled = atStart || m <= 0;
    next.disabled = atEnd || m <= 0;
  };

  prev.addEventListener("click", () => {
    const s = step();
    if (!s) return;
    offset -= s;
    apply();
  });

  next.addEventListener("click", () => {
    const s = step();
    if (!s) return;
    offset += s;
    apply();
  });

  window.addEventListener(
    "resize",
    () => {
      offset = 0;
      apply();
    },
    { passive: true }
  );

  window.addEventListener("load", apply, { passive: true });
  apply();
})();

document.querySelectorAll(".similar-wish, .similar-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

document.querySelectorAll(".similar-card").forEach((card) => {
  card.querySelectorAll(".similar-size").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.querySelectorAll(".similar-size").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
  card.querySelectorAll(".similar-swatch").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.querySelectorAll(".similar-swatch").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
});
