/* =========================================================
   Hero dashboard — counters, chart, activity feed
   ========================================================= */
(function () {
  var dash = document.getElementById("hww-dash");
  if (!dash) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;
  var W = 420;
  var H = 140;
  var PAD_X = 8;
  var PAD_Y = 16;
  var DAYS = 30;

  /* Daily revenue series (real $ amounts) with upward trend */
  var series = [];
  var coords = [];
  var hoverIdx = -1;

  var lineEl = document.getElementById("hww-dash-line");
  var fillEl = document.getElementById("hww-dash-fill");
  var tipEl = document.getElementById("hww-dash-tooltip");
  var tipVal = document.getElementById("hww-dash-tip-val");
  var tipDay = document.getElementById("hww-dash-tip-day");
  var tipDot = document.getElementById("hww-dash-tip");
  var wrap = dash.querySelector(".hww-dash__chart-wrap");
  var revTotalEl = document.getElementById("hww-dash-rev-total");
  var revMetricEl = dash.querySelector('[data-dash-count][data-dash-target="48240"]');
  var gridEl = document.getElementById("hww-dash-grid");

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function money(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function formatValue(el, value) {
    var format = el.getAttribute("data-dash-format") || "";
    var decimals = parseInt(el.getAttribute("data-dash-decimals") || "0", 10);
    if (format === "money") return money(value);
    if (format === "compact") {
      if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      }
      return Math.round(value).toString();
    }
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  }

  function sumSeries() {
    var t = 0;
    for (var i = 0; i < series.length; i++) t += series[i].amount;
    return t;
  }

  function formatDayLabel(date) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date.getMonth()] + " " + date.getDate();
  }

  function seedSeries() {
    series = [];
    var now = new Date();
    var base = 980;
    for (var i = 0; i < DAYS; i++) {
      var d = new Date(now);
      d.setDate(now.getDate() - (DAYS - 1 - i));
      /* Continuous growth: +1.8% / day baseline + weekday boost + noise */
      var growth = Math.pow(1.018, i);
      var weekday = d.getDay();
      var weekendDip = weekday === 0 || weekday === 6 ? 0.86 : 1;
      var noise = 0.92 + Math.random() * 0.16;
      var amount = Math.round(base * growth * weekendDip * noise);
      series.push({ date: d, amount: amount });
    }
  }

  function getRange() {
    var min = series[0].amount;
    var max = series[0].amount;
    for (var i = 1; i < series.length; i++) {
      if (series[i].amount < min) min = series[i].amount;
      if (series[i].amount > max) max = series[i].amount;
    }
    var pad = Math.max(80, (max - min) * 0.18);
    return { min: Math.max(0, min - pad), max: max + pad };
  }

  function renderGrid(range) {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    for (var g = 0; g < 4; g++) {
      var y = PAD_Y + ((H - PAD_Y * 2) * g) / 3;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(PAD_X));
      line.setAttribute("x2", String(W - PAD_X));
      line.setAttribute("y1", y.toFixed(2));
      line.setAttribute("y2", y.toFixed(2));
      line.setAttribute("stroke", "rgba(148,163,184,0.22)");
      line.setAttribute("stroke-width", "1");
      gridEl.appendChild(line);
    }
  }

  function buildPath(drawAnim) {
    if (!lineEl || !fillEl || !series.length) return;

    var range = getRange();
    var span = Math.max(1, range.max - range.min);
    var usableW = W - PAD_X * 2;
    var usableH = H - PAD_Y * 2;
    var step = series.length > 1 ? usableW / (series.length - 1) : usableW;
    var d = "";
    coords = [];

    renderGrid(range);

    for (var i = 0; i < series.length; i++) {
      var x = PAD_X + i * step;
      var y = PAD_Y + usableH - ((series[i].amount - range.min) / span) * usableH;
      coords.push({ x: x, y: y, amount: series[i].amount, date: series[i].date });
      d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    }

    lineEl.setAttribute("d", d);
    fillEl.setAttribute(
      "d",
      d +
        " L " +
        (PAD_X + usableW).toFixed(2) +
        " " +
        H +
        " L " +
        PAD_X +
        " " +
        H +
        " Z"
    );

    if (drawAnim && !reduceMotion) {
      var len = 0;
      try {
        len = lineEl.getTotalLength();
      } catch (e) {
        len = 900;
      }
      lineEl.style.transition = "none";
      lineEl.style.strokeDasharray = String(len);
      lineEl.style.strokeDashoffset = String(len);
      fillEl.style.opacity = "0";
      requestAnimationFrame(function () {
        lineEl.style.transition = "stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1)";
        fillEl.style.transition = "opacity 0.7s ease 0.35s";
        lineEl.style.strokeDashoffset = "0";
        fillEl.style.opacity = "1";
      });
    } else {
      lineEl.style.strokeDasharray = "none";
      lineEl.style.strokeDashoffset = "0";
      fillEl.style.opacity = "1";
    }

    updateTotals(false);
  }

  function updateTotals(animateMetric) {
    var total = sumSeries();
    if (revTotalEl) revTotalEl.textContent = "$" + money(total);
    if (revMetricEl) {
      revMetricEl.setAttribute("data-dash-target", String(total));
      if (animateMetric) {
        animateSingle(revMetricEl, total);
      } else if (started) {
        revMetricEl.textContent = money(total);
      }
    }
  }

  function animateSingle(el, target) {
    var from = parseFloat(String(el.textContent).replace(/[^0-9.]/g, "")) || 0;
    if (isNaN(from)) from = 0;
    var duration = 700;
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      el.textContent = formatValue(el, from + (target - from) * e);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateCounters() {
    var els = Array.prototype.slice.call(dash.querySelectorAll("[data-dash-count]"));
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-dash-target") || "0");
        el.textContent = formatValue(el, target);
      });
      return;
    }
    var duration = 1400;
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-dash-target") || "0");
        el.textContent = formatValue(el, target * e);
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function showTip(idx) {
    if (!tipEl || !tipVal || !tipDay || !tipDot || !coords[idx]) return;
    var p = coords[idx];
    hoverIdx = idx;
    tipEl.hidden = false;
    tipVal.textContent = "$" + money(p.amount);
    tipDay.textContent = formatDayLabel(p.date);
    tipDot.setAttribute("cx", p.x);
    tipDot.setAttribute("cy", p.y);
    if (wrap) wrap.classList.add("is-hover");
    var leftPct = (p.x / W) * 100;
    tipEl.style.left = Math.min(70, Math.max(2, leftPct - 10)) + "%";
    tipEl.style.top = Math.max(2, (p.y / H) * 100 - 34) + "%";
  }

  function hideTip() {
    if (tipEl) tipEl.hidden = true;
    if (wrap) wrap.classList.remove("is-hover");
    hoverIdx = -1;
  }

  function bindHover() {
    if (!wrap) return;
    wrap.addEventListener("mousemove", function (e) {
      if (!coords.length) return;
      var rect = wrap.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / Math.max(rect.width, 1);
      var idx = Math.round(ratio * (coords.length - 1));
      idx = Math.max(0, Math.min(coords.length - 1, idx));
      showTip(idx);
    });
    wrap.addEventListener("mouseleave", hideTip);
  }

  /* Continuously grow: push a new higher day, drop oldest */
  function growOnce() {
    if (!series.length) return;
    var last = series[series.length - 1];
    var nextDate = new Date(last.date);
    nextDate.setDate(nextDate.getDate() + 1);
    var weekday = nextDate.getDay();
    var weekendDip = weekday === 0 || weekday === 6 ? 0.88 : 1;
    var bump = 1.02 + Math.random() * 0.06;
    var nextAmount = Math.round(last.amount * bump * weekendDip);
    /* Keep a clear upward floor vs first point */
    var floor = series[0].amount * 1.35;
    if (nextAmount < floor) nextAmount = Math.round(floor + Math.random() * 120);

    series.push({ date: nextDate, amount: nextAmount });
    if (series.length > DAYS) series.shift();

    buildPath(false);
    updateTotals(true);

    if (hoverIdx >= 0) showTip(Math.min(hoverIdx, coords.length - 1));
  }

  var activityPool = [
    { icon: "fa-bag-shopping", title: "Recent Order", detail: "#4821 · $129.00" },
    { icon: "fa-circle-check", title: "Payment Success", detail: "Stripe · Instant" },
    { icon: "fa-user-plus", title: "Customer Signup", detail: "New account created" },
    { icon: "fa-robot", title: "Automation Completed", detail: "Welcome flow finished" },
    { icon: "fa-envelope", title: "Email Sent", detail: "Campaign · 1,240 opens" },
    { icon: "fa-boxes-stacked", title: "Inventory Updated", detail: "18 SKUs synced" },
    { icon: "fa-truck", title: "Order Shipped", detail: "#4818 · In transit" },
    { icon: "fa-rotate", title: "Refund Processed", detail: "#4792 · $42.00" },
  ];

  function rotateActivity() {
    var feed = document.getElementById("hww-dash-feed");
    if (!feed) return;
    var item = activityPool[Math.floor(Math.random() * activityPool.length)];
    var li = document.createElement("li");
    li.className = "hww-dash__feed-item is-enter";
    li.innerHTML =
      '<span class="hww-dash__feed-ico"><i class="fa-solid ' +
      item.icon +
      '"></i></span>' +
      '<div class="hww-dash__feed-body"><strong>' +
      item.title +
      "</strong><span>" +
      item.detail +
      "</span></div>" +
      '<em class="hww-dash__feed-meta"><span class="hww-dash__status"></span>now</em>';
    feed.insertBefore(li, feed.firstChild);
    requestAnimationFrame(function () {
      li.classList.remove("is-enter");
    });
    while (feed.children.length > 6) {
      feed.removeChild(feed.lastChild);
    }
  }

  function start() {
    if (started) return;
    started = true;
    seedSeries();
    if (revMetricEl) {
      revMetricEl.setAttribute("data-dash-target", String(sumSeries()));
    }
    buildPath(true);
    dash.classList.add("is-ready");
    animateCounters();
    bindHover();

    if (!reduceMotion) {
      setInterval(rotateActivity, 4200);
      setInterval(growOnce, 2800);
    }
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(dash);
  } else {
    start();
  }
})();


/* =========================================================
   How It Works — Mac dashboard animations (CSS + vanilla JS)
   ========================================================= */
(function () {
  var mac = document.getElementById("hww-mac");
  if (!mac) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatValue(el, value) {
    var format = el.getAttribute("data-hww-format") || "";
    var decimals = parseInt(el.getAttribute("data-hww-decimals") || "0", 10);
    if (format === "money") {
      return Math.round(value).toLocaleString("en-US");
    }
    if (format === "compact") {
      if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      return Math.round(value).toString();
    }
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  }

  function animateCounters() {
    var els = Array.prototype.slice.call(mac.querySelectorAll("[data-hww-count]"));
    var duration = 1400;
    var start = performance.now();

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-hww-target") || "0");
        el.textContent = formatValue(el, target * e);
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function buildGraph() {
    var line = document.getElementById("hww-mac-graph-line");
    var fill = document.getElementById("hww-mac-graph-fill");
    if (!line || !fill) return;

    var pts = [18, 52, 40, 68, 58, 78, 70, 92, 84, 108];
    var w = 360;
    var h = 120;
    var step = w / (pts.length - 1);
    var d = "";
    for (var i = 0; i < pts.length; i++) {
      var x = i * step;
      var y = h - pts[i];
      d += (i === 0 ? "M" : " L") + x.toFixed(1) + "," + y.toFixed(1);
    }
    line.setAttribute("d", d);
    fill.setAttribute("d", d + " L" + w + "," + h + " L0," + h + " Z");

    try {
      var len = line.getTotalLength();
      line.style.strokeDasharray = String(len);
      line.style.strokeDashoffset = String(len);
    } catch (e) {
      /* ignore */
    }
  }

  function runFlowSteps() {
    var steps = Array.prototype.slice.call(
      mac.querySelectorAll(".hww-mac__flow-step")
    );
    if (!steps.length) return;
    var i = 0;

    function tick() {
      steps.forEach(function (step, idx) {
        step.classList.toggle("is-active", idx === i);
        step.classList.toggle("is-done", idx < i);
      });
      i = (i + 1) % steps.length;
    }

    tick();
    setInterval(tick, 1600);
  }

  function runActivityFeed() {
    var list = document.getElementById("hww-mac-activity");
    if (!list) return;
    var messages = [
      "Customer purchased",
      "Campaign launched",
      "Inventory synced",
      "Payment received",
      "AI reply sent",
      "Cart recovered",
      "New subscriber",
      "Refund processed"
    ];
    var cursor = 0;

    function push() {
      var items = Array.prototype.slice.call(
        list.querySelectorAll(".hww-mac__activity-item")
      );
      var next = messages[cursor % messages.length];
      cursor += 1;

      var li = document.createElement("li");
      li.className = "hww-mac__activity-item is-new";
      li.textContent = next;
      list.insertBefore(li, list.firstChild);

      // Keep only 4 items
      while (list.children.length > 4) {
        list.removeChild(list.lastChild);
      }

      // Clear is-new from older items
      Array.prototype.slice.call(list.children).forEach(function (el, idx) {
        if (idx === 0) el.classList.add("is-new");
        else el.classList.remove("is-new");
      });
    }

    setInterval(push, 2000);
  }

  function start() {
    if (started) return;
    started = true;
    buildGraph();
    mac.classList.add("is-visible");
    if (!reduceMotion) {
      animateCounters();
      runFlowSteps();
      runActivityFeed();
    } else {
      Array.prototype.slice
        .call(mac.querySelectorAll("[data-hww-count]"))
        .forEach(function (el) {
          var target = parseFloat(el.getAttribute("data-hww-target") || "0");
          el.textContent = formatValue(el, target);
        });
      var line = document.getElementById("hww-mac-graph-line");
      if (line) line.style.strokeDashoffset = "0";
    }
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.28 }
    );
    io.observe(mac);
  } else {
    start();
  }
})();


/* =========================================================
   Interactive Workflow — horizontal cards + curved links
   ========================================================= */
(function () {
  var stage = document.getElementById("hww-flow-stage");
  if (!stage) return;

  var inner = document.getElementById("hww-flow-inner") || stage;
  var cards = Array.prototype.slice.call(
    stage.querySelectorAll(".hww-flow__card")
  );
  if (!cards.length) return;

  var svg = document.getElementById("hww-flow-svg");
  var linesG = document.getElementById("hww-flow-lines");
  var pulsesG = document.getElementById("hww-flow-pulses");
  if (!svg || !linesG || !pulsesG) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var linkBases = [];
  var linkPulses = [];
  var started = false;
  var pulseOffset = 0;
  var lastTs = 0;

  function clearLines() {
    while (linesG.firstChild) linesG.removeChild(linesG.firstChild);
    while (pulsesG.firstChild) pulsesG.removeChild(pulsesG.firstChild);
    linkBases = [];
    linkPulses = [];
  }

  function curvePath(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    /* Vertical stack (mobile) */
    if (Math.abs(dy) >= Math.abs(dx)) {
      var midY = (y1 + y2) / 2;
      return (
        "M" +
        x1 +
        " " +
        y1 +
        " C" +
        x1 +
        " " +
        midY +
        ", " +
        x2 +
        " " +
        midY +
        ", " +
        x2 +
        " " +
        y2
      );
    }

    var c1x = x1 + dx * 0.4;
    var c2x = x1 + dx * 0.6;
    var lift = Math.min(28, Math.abs(dx) * 0.12);
    return (
      "M" +
      x1 +
      " " +
      y1 +
      " C" +
      c1x +
      " " +
      (y1 - lift) +
      ", " +
      c2x +
      " " +
      (y2 + lift) +
      ", " +
      x2 +
      " " +
      y2
    );
  }

  function rebuildLines() {
    clearLines();
    var innerRect = inner.getBoundingClientRect();
    var w = inner.scrollWidth || innerRect.width;
    var h = inner.offsetHeight || innerRect.height;
    svg.setAttribute("viewBox", "0 0 " + Math.round(w) + " " + Math.round(h));
    svg.setAttribute("width", String(Math.round(w)));
    svg.setAttribute("height", String(Math.round(h)));
    svg.style.width = w + "px";
    svg.style.height = h + "px";

    var isMobile =
      window.matchMedia && window.matchMedia("(max-width: 640px)").matches;

    for (var i = 0; i < cards.length - 1; i++) {
      var a = cards[i].getBoundingClientRect();
      var b = cards[i + 1].getBoundingClientRect();
      var x1;
      var y1;
      var x2;
      var y2;

      if (isMobile) {
        x1 = a.left + a.width / 2 - innerRect.left;
        y1 = a.bottom - innerRect.top;
        x2 = b.left + b.width / 2 - innerRect.left;
        y2 = b.top - innerRect.top;
      } else {
        x1 = a.right - innerRect.left;
        y1 = a.top + a.height / 2 - innerRect.top;
        x2 = b.left - innerRect.left;
        y2 = b.top + b.height / 2 - innerRect.top;
      }
      var d = curvePath(x1, y1, x2, y2);

      var base = document.createElementNS("http://www.w3.org/2000/svg", "path");
      base.setAttribute("d", d);
      base.setAttribute("class", "hww-flow__link-base");
      base.style.opacity = "0";
      linesG.appendChild(base);

      var length = 120;
      try {
        length = base.getTotalLength() || 120;
      } catch (err) {
        length = 120;
      }
      base.style.strokeDasharray = String(length);
      base.style.strokeDashoffset = String(length);

      var pulse = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pulse.setAttribute("d", d);
      pulse.setAttribute("class", "hww-flow__link-pulse");
      pulse.style.strokeDasharray = "18 " + Math.round(length);
      pulse.style.strokeDashoffset = "0";
      pulsesG.appendChild(pulse);

      linkBases.push({ el: base, length: length });
      linkPulses.push({ el: pulse, length: length });
    }
  }

  function drawLink(index, duration) {
    return new Promise(function (resolve) {
      var item = linkBases[index];
      if (!item) {
        resolve();
        return;
      }
      var el = item.el;
      var len = item.length;
      el.style.opacity = "1";
      el.style.transition = "none";
      el.style.strokeDashoffset = String(len);

      // force reflow
      void el.getBoundingClientRect();
      el.style.transition =
        "stroke-dashoffset " + duration + "ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.strokeDashoffset = "0";

      var pulse = linkPulses[index];
      if (pulse) pulse.el.classList.add("is-flowing");

      setTimeout(resolve, duration + 40);
    });
  }

  function showCard(index) {
    var card = cards[index];
    if (!card) return;
    card.classList.add("is-visible");
    // Keep active card in view on narrower viewports
    try {
      card.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest"
      });
    } catch (e) {
      /* ignore */
    }
  }

  function completeCard(index) {
    var card = cards[index];
    if (!card) return;
    card.classList.add("is-complete");
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function runSequence() {
    rebuildLines();
    showCard(0);
    await wait(250);

    for (var i = 0; i < cards.length - 1; i++) {
      if (!reduceMotion) {
        await drawLink(i, 520);
      } else if (linkBases[i]) {
        linkBases[i].el.style.opacity = "1";
        linkBases[i].el.style.strokeDashoffset = "0";
        if (linkPulses[i]) linkPulses[i].el.classList.add("is-flowing");
      }
      completeCard(i);
      showCard(i + 1);
      await wait(250);
    }
    completeCard(cards.length - 1);

    // Ensure all links flowing
    linkPulses.forEach(function (p) {
      p.el.classList.add("is-flowing");
    });
  }

  function pulseTick(ts) {
    if (reduceMotion) return;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(32, ts - lastTs);
    lastTs = ts;
    pulseOffset -= 0.45 * dt;

    linkPulses.forEach(function (p) {
      if (!p.el.classList.contains("is-flowing")) return;
      var cycle = p.length + 40;
      var off = pulseOffset % cycle;
      p.el.style.strokeDashoffset = String(off);
    });
    requestAnimationFrame(pulseTick);
  }

  function start() {
    if (started) return;
    started = true;
    if (reduceMotion) {
      cards.forEach(function (c) {
        c.classList.add("is-visible", "is-complete");
      });
      rebuildLines();
      linkBases.forEach(function (b) {
        b.el.style.opacity = "1";
        b.el.style.strokeDashoffset = "0";
      });
      linkPulses.forEach(function (p) {
        p.el.classList.add("is-flowing");
      });
      return;
    }
    runSequence();
    requestAnimationFrame(pulseTick);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!started) return;
      // Preserve completion state; rebuild geometry
      var completed = cards.map(function (c) {
        return c.classList.contains("is-complete");
      });
      var visible = cards.map(function (c) {
        return c.classList.contains("is-visible");
      });
      rebuildLines();
      linkBases.forEach(function (b, i) {
        if (visible[i + 1] || completed[i]) {
          b.el.style.opacity = "1";
          b.el.style.strokeDashoffset = "0";
          b.el.style.transition = "none";
          if (linkPulses[i]) linkPulses[i].el.classList.add("is-flowing");
        }
      });
    }, 150);
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(stage);
  } else {
    start();
  }
})();

/* =========================================================
   Section 4 — AI Automation Compare (live before/after)
   ========================================================= */
(function () {
  var section = document.getElementById("hww-auto");
  if (!section) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;
  var running = false;
  var tasks = [];
  var lastFrame = 0;

  var times = [
    "0.4 sec",
    "0.2 sec",
    "Running",
    "0.6 sec",
    "0.3 sec",
    "0.1 sec",
    "Syncing",
    "0.5 sec",
    "0.7 sec",
    "0.3 sec",
    "0.2 sec",
    "0.4 sec",
  ];

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function schedule(every, fn) {
    tasks.push({ every: every, last: 0, fn: fn });
  }

  function animateCounters() {
    var els = Array.prototype.slice.call(
      section.querySelectorAll("[data-auto-count]")
    );
    var duration = 1500;
    var start = performance.now();

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-auto-target") || "0");
        var decimals = parseInt(el.getAttribute("data-auto-decimals") || "0", 10);
        var value = target * e;
        el.textContent =
          decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function jitterManual() {
    var cards = Array.prototype.slice.call(
      section.querySelectorAll("[data-manual-card]")
    );
    cards.forEach(function (card) {
      if (card.classList.contains("is-stuck")) return;
      var bar = card.querySelector(".hww-auto__track i");
      if (!bar) return;
      var cur = parseFloat(String(bar.style.getPropertyValue("--w") || "30").replace("%", ""));
      if (isNaN(cur)) cur = 30;
      var next = Math.max(8, Math.min(78, cur + (Math.random() * 10 - 6)));
      /* often stall */
      if (Math.random() > 0.55) next = cur;
      bar.style.setProperty("--w", next + "%");
    });
  }

  function refreshAutoTimes() {
    var els = Array.prototype.slice.call(
      section.querySelectorAll("[data-auto-time]")
    );
    els.forEach(function (el, i) {
      var base = times[i] || "0.3 sec";
      if (base === "Running" || base === "Syncing") {
        el.textContent = base;
        return;
      }
      var n = (0.1 + Math.random() * 0.8).toFixed(1);
      el.textContent = n + " sec";
    });
  }

  function pulseDoneBadges() {
    var badges = Array.prototype.slice.call(
      section.querySelectorAll(".hww-auto__done")
    );
    if (!badges.length) return;
    var b = badges[Math.floor(Math.random() * badges.length)];
    b.style.animation = "none";
    void b.offsetWidth;
    b.style.animation = "";
  }

  function loop(now) {
    if (!running) return;
    if (!lastFrame) lastFrame = now;
    lastFrame = now;

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if (now - task.last >= task.every) {
        task.last = now;
        task.fn();
      }
    }
    requestAnimationFrame(loop);
  }

  function startLive() {
    schedule(1800, jitterManual);
    schedule(3200, refreshAutoTimes);
    schedule(4000, pulseDoneBadges);
    running = true;
    requestAnimationFrame(loop);
  }

  function start() {
    if (started) return;
    started = true;
    section.classList.add("is-visible");

    if (reduceMotion) {
      Array.prototype.slice
        .call(section.querySelectorAll("[data-auto-count]"))
        .forEach(function (el) {
          var target = parseFloat(el.getAttribute("data-auto-target") || "0");
          var decimals = parseInt(el.getAttribute("data-auto-decimals") || "0", 10);
          el.textContent =
            decimals > 0 ? target.toFixed(decimals) : String(Math.round(target));
        });
      return;
    }

    setTimeout(animateCounters, 420);
    startLive();
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );
    io.observe(section);
  } else {
    start();
  }
})();

/* =========================================================
   Section 5 — AI Operating System
   ========================================================= */
(function () {
  var section = document.getElementById("hww-engine");
  if (!section) return;

  var stage = document.getElementById("hww-engine-stage");
  var core = document.getElementById("hww-engine-core");
  var svg = document.getElementById("hww-engine-svg");
  var linesG = document.getElementById("hww-engine-lines");
  var particlesG = document.getElementById("hww-engine-particles");
  var ring = document.getElementById("hww-engine-ring");
  var footer = document.getElementById("hww-engine-footer");
  var ambient = document.getElementById("hww-engine-ambient");

  if (!stage || !core || !svg || !linesG || !particlesG) return;

  var mods = Array.prototype.slice.call(
    stage.querySelectorAll(".hww-engine__mod")
  );

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;
  var paths = [];
  var particles = [];
  var lastTs = 0;
  var flowDir = 1; /* 1 = module → core, -1 = core → module */

  var marketingStates = ["Running", "Optimizing", "Scheduled", "Live"];
  var marketingIdx = 0;

  function clearSvg() {
    while (linesG.firstChild) linesG.removeChild(linesG.firstChild);
    while (particlesG.firstChild) particlesG.removeChild(particlesG.firstChild);
    paths = [];
    particles = [];
  }

  /* Elegant cubic curve from module edge toward core */
  function curve(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / dist;
    var ny = dx / dist;
    var bend = dist * 0.22;
    var c1x = x1 + dx * 0.35 + nx * bend;
    var c1y = y1 + dy * 0.35 + ny * bend;
    var c2x = x1 + dx * 0.7 - nx * bend * 0.45;
    var c2y = y1 + dy * 0.7 - ny * bend * 0.45;
    return (
      "M" +
      x1.toFixed(2) +
      " " +
      y1.toFixed(2) +
      " C" +
      c1x.toFixed(2) +
      " " +
      c1y.toFixed(2) +
      " " +
      c2x.toFixed(2) +
      " " +
      c2y.toFixed(2) +
      " " +
      x2.toFixed(2) +
      " " +
      y2.toFixed(2)
    );
  }

  function rebuild() {
    if (window.matchMedia("(max-width: 760px)").matches) {
      clearSvg();
      return;
    }

    clearSvg();
    var stageRect = stage.getBoundingClientRect();
    var w = stage.clientWidth || stageRect.width;
    var h = stage.clientHeight || stageRect.height;
    svg.setAttribute("viewBox", "0 0 " + Math.round(w) + " " + Math.round(h));
    svg.setAttribute("width", String(Math.round(w)));
    svg.setAttribute("height", String(Math.round(h)));

    var coreRect = core.getBoundingClientRect();
    var cx = coreRect.left + coreRect.width / 2 - stageRect.left;
    var cy = coreRect.top + coreRect.height / 2 - stageRect.top;
    var coreR = coreRect.width / 2;

    mods.forEach(function (mod, index) {
      if (getComputedStyle(mod).display === "none") return;
      var r = mod.getBoundingClientRect();
      var mx = r.left + r.width / 2 - stageRect.left;
      var my = r.top + r.height / 2 - stageRect.top;

      /* Start near card edge facing core */
      var vx = cx - mx;
      var vy = cy - my;
      var vlen = Math.sqrt(vx * vx + vy * vy) || 1;
      var ux = vx / vlen;
      var uy = vy / vlen;
      var startX = mx + ux * Math.min(r.width, r.height) * 0.42;
      var startY = my + uy * Math.min(r.width, r.height) * 0.42;
      var endX = cx - ux * (coreR + 4);
      var endY = cy - uy * (coreR + 4);

      var d = curve(startX, startY, endX, endY);
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "hww-engine__link");
      linesG.appendChild(path);

      var length = 180;
      try {
        length = path.getTotalLength() || 180;
      } catch (e) {
        length = 180;
      }

      /* Two particles per path for richer flow */
      for (var p = 0; p < 2; p++) {
        var dot = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        dot.setAttribute("r", p === 0 ? "2.6" : "1.8");
        dot.setAttribute("class", "hww-engine__particle");
        particlesG.appendChild(dot);
        particles.push({
          el: dot,
          path: path,
          length: length,
          offset: ((index + p * 0.5) / mods.length) * length,
          speed: 0.038 + (index % 3) * 0.01 + p * 0.008,
        });
      }

      paths.push({ el: path, length: length });
    });
  }

  function tick(ts) {
    if (reduceMotion) return;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(32, ts - lastTs);
    lastTs = ts;

    particles.forEach(function (p) {
      p.offset += p.speed * dt * flowDir;
      if (p.offset > p.length) p.offset = p.offset % p.length;
      if (p.offset < 0) p.offset = p.length + (p.offset % p.length);

      try {
        var pt = p.path.getPointAtLength(p.offset);
        p.el.setAttribute("cx", pt.x);
        p.el.setAttribute("cy", pt.y);
      } catch (e) {
        /* ignore */
      }
    });

    requestAnimationFrame(tick);
  }

  function pulseRing() {
    if (!ring || reduceMotion) return;
    ring.classList.remove("is-pulse");
    void ring.offsetWidth;
    ring.classList.add("is-pulse");
  }

  function formatInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function updateMetrics() {
    mods.forEach(function (mod) {
      var el = mod.querySelector("[data-os-metric]");
      if (!el) return;
      var type = el.getAttribute("data-os-type") || "int";
      var value = parseFloat(el.getAttribute("data-os-value") || "0");

      if (type === "int") {
        value += 1;
        el.setAttribute("data-os-value", String(value));
        el.textContent = formatInt(value);
      } else if (type === "money") {
        value += 18 + Math.floor(Math.random() * 42);
        el.setAttribute("data-os-value", String(value));
        el.textContent = formatInt(value);
      } else if (type === "pct") {
        var next = value + (Math.random() * 0.2 - 0.05);
        if (next > 99.4) next = 94 + Math.random() * 2;
        if (next < 90) next = 92;
        el.setAttribute("data-os-value", next.toFixed(1));
        el.textContent = next.toFixed(1);
      }
    });

    var statusEl = stage.querySelector("[data-os-status]");
    if (statusEl) {
      marketingIdx = (marketingIdx + 1) % marketingStates.length;
      statusEl.innerHTML = "<i></i> " + marketingStates[marketingIdx];
    }
  }

  function revealWords() {
    if (!footer) return;
    var words = Array.prototype.slice.call(
      footer.querySelectorAll("[data-os-word]")
    );
    if (reduceMotion) {
      footer.classList.add("is-revealed");
      return;
    }
    words.forEach(function (word, i) {
      setTimeout(function () {
        word.style.opacity = "1";
        word.style.transform = "translateY(0)";
      }, 80 + i * 70);
    });
    footer.classList.add("is-revealed");
  }

  /* Ambient floating dots */
  function startAmbient() {
    if (!ambient || reduceMotion) return;
    var ctx = ambient.getContext("2d");
    if (!ctx) return;
    var dots = [];
    var running = false;
    var raf = 0;

    function resize() {
      var rect = section.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ambient.width = Math.floor(rect.width * dpr);
      ambient.height = Math.floor(rect.height * dpr);
      ambient.style.width = rect.width + "px";
      ambient.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      var w = section.clientWidth;
      var h = section.clientHeight;
      var count = Math.max(14, Math.floor((w * h) / 52000));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.05 - Math.random() * 0.12,
          a: 0.12 + Math.random() * 0.28,
        });
      }
    }

    function draw() {
      var w = section.clientWidth;
      var h = section.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79, 70, 229," + p.a + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    seed();
    if (!running) {
      running = true;
      draw();
    }

    window.addEventListener("resize", function () {
      resize();
      seed();
    });
  }

  function start() {
    if (started) return;
    started = true;
    section.classList.add("is-visible");
    rebuild();
    startAmbient();

    setTimeout(revealWords, 500);

    if (!reduceMotion) {
      requestAnimationFrame(tick);
      pulseRing();
      setInterval(pulseRing, 5000);
      setInterval(function () {
        flowDir *= -1;
      }, 4500);
      setInterval(updateMetrics, 2600);
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (started) rebuild();
    }, 140);
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );
    io.observe(section);
  } else {
    start();
  }
})();

/* =========================================================
   Section 6 — Scaling with CODIIC
   ========================================================= */
(function () {
  var section = document.getElementById("hww-scale");
  if (!section) return;

  var journey = document.getElementById("hww-scale-journey");
  var svg = document.getElementById("hww-scale-svg");
  var linesG = document.getElementById("hww-scale-lines");
  var pulsesG = document.getElementById("hww-scale-pulses");
  var cards = Array.prototype.slice.call(
    section.querySelectorAll(".hww-scale__card")
  );
  if (!journey || !svg || !linesG || !pulsesG || !cards.length) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;
  var linkBases = [];
  var linkPulses = [];
  var pulseOffset = 0;
  var lastTs = 0;

  function clearLines() {
    while (linesG.firstChild) linesG.removeChild(linesG.firstChild);
    while (pulsesG.firstChild) pulsesG.removeChild(pulsesG.firstChild);
    linkBases = [];
    linkPulses = [];
  }

  function curvePath(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var c1x = x1 + dx * 0.4;
    var c2x = x1 + dx * 0.6;
    var lift = Math.min(24, Math.abs(dx) * 0.1);
    return (
      "M" +
      x1 +
      " " +
      y1 +
      " C" +
      c1x +
      " " +
      (y1 - lift) +
      ", " +
      c2x +
      " " +
      (y2 + lift) +
      ", " +
      x2 +
      " " +
      y2
    );
  }

  function rebuildLines() {
    if (window.matchMedia("(max-width: 1100px)").matches) {
      clearLines();
      return;
    }

    clearLines();
    var rect = journey.getBoundingClientRect();
    var w = journey.clientWidth || rect.width;
    var h = journey.clientHeight || rect.height;
    svg.setAttribute("viewBox", "0 0 " + Math.round(w) + " " + Math.round(h));
    svg.setAttribute("width", String(Math.round(w)));
    svg.setAttribute("height", String(Math.round(h)));

    for (var i = 0; i < cards.length - 1; i++) {
      var a = cards[i].getBoundingClientRect();
      var b = cards[i + 1].getBoundingClientRect();
      var x1 = a.right - rect.left;
      var y1 = a.top + a.height / 2 - rect.top;
      var x2 = b.left - rect.left;
      var y2 = b.top + b.height / 2 - rect.top;
      var d = curvePath(x1, y1, x2, y2);

      var base = document.createElementNS("http://www.w3.org/2000/svg", "path");
      base.setAttribute("d", d);
      base.setAttribute("class", "hww-scale__link-base");
      linesG.appendChild(base);

      var length = 120;
      try {
        length = base.getTotalLength() || 120;
      } catch (e) {
        length = 120;
      }

      var pulse = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pulse.setAttribute("d", d);
      pulse.setAttribute("class", "hww-scale__link-pulse");
      pulse.style.strokeDasharray = "18 " + Math.round(length);
      pulse.style.strokeDashoffset = "0";
      pulsesG.appendChild(pulse);

      linkBases.push({ el: base, length: length });
      linkPulses.push({ el: pulse, length: length });
    }
  }

  function pulseTick(ts) {
    if (reduceMotion) return;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(32, ts - lastTs);
    lastTs = ts;
    pulseOffset -= 0.42 * dt;

    linkPulses.forEach(function (p) {
      var cycle = p.length + 40;
      p.el.style.strokeDashoffset = String(pulseOffset % cycle);
    });
    requestAnimationFrame(pulseTick);
  }

  function revealCards() {
    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add("is-complete");
      }, reduceMotion ? 0 : 280 + i * 320);
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounters() {
    var els = Array.prototype.slice.call(
      section.querySelectorAll("[data-scale-count]")
    );
    var duration = 1400;
    var start = performance.now();

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-scale-target") || "0");
        var decimals = parseInt(el.getAttribute("data-scale-decimals") || "0", 10);
        var value = target * e;
        el.textContent =
          decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (started) return;
    started = true;
    section.classList.add("is-visible");
    rebuildLines();
    revealCards();

    if (!reduceMotion) {
      requestAnimationFrame(pulseTick);
      setTimeout(animateCounters, 420);
    } else {
      Array.prototype.slice
        .call(section.querySelectorAll("[data-scale-count]"))
        .forEach(function (el) {
          var target = parseFloat(el.getAttribute("data-scale-target") || "0");
          var decimals = parseInt(el.getAttribute("data-scale-decimals") || "0", 10);
          el.textContent =
            decimals > 0 ? target.toFixed(decimals) : String(Math.round(target));
        });
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (started) rebuildLines();
    }, 140);
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.22 }
    );
    io.observe(section);
  } else {
    start();
  }
})();

/* =========================================================
   Section 7 — Trust (live enterprise monitoring)
   ========================================================= */
(function () {
  var section = document.getElementById("hww-trust");
  if (!section) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;
  var running = false;

  var state = {
    uptime: { cur: 0, tgt: 0 },
    response: { cur: 55, tgt: 55 },
    rps: { cur: 1840, tgt: 1840 },
    threats: { cur: 1284, tgt: 1284 },
    score: { cur: 97, tgt: 97 },
    pagespeed: { cur: 97, tgt: 97 },
    ttfb: { cur: 86, tgt: 86 },
    lcp: { cur: 1.1, tgt: 1.1 },
    cls: { cur: 0.02, tgt: 0.02 },
    perfResp: { cur: 120, tgt: 120 },
    tickets: { cur: 6, tgt: 6 },
    success: { cur: 99, tgt: 99 },
    csat: { cur: 98, tgt: 98 },
  };

  var texts = {
    regions: "12 / 12",
    regionsLabel: "12 regions healthy",
    avgResp: "2m",
  };

  var scoreCycle = [95, 98, 99, 97, 96];
  var scoreIdx = 0;
  var flowStep = 0;
  var ticketsCycle = [6, 5, 4, 6];
  var ticketsIdx = 0;
  var avgCycle = ["2m", "1m", "3m", "2m"];
  var avgIdx = 0;
  var successCycle = [99, 98, 99];
  var successIdx = 0;

  var feedItems = [
    "Customer joined chat",
    "Refund approved",
    "Ticket resolved",
    "Priority updated",
    "Knowledge article shared",
    "Onboarding call booked",
    "Live chat answered",
  ];

  var elCache = {};
  var ringEl = null;
  var dialEl = null;
  var gaugeEl = null;
  var relBars = null;
  var secBars = null;
  var perfBars = null;
  var pins = [];
  var steps = [];
  var conns = [];
  var feedEl = null;

  var tasks = [];
  var lastFrame = 0;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function formatNum(key, value) {
    var el = elCache[key];
    if (!el) return "";
    var decimals = parseInt(el.getAttribute("data-trust-decimals") || "0", 10);
    var suffix = el.getAttribute("data-trust-suffix") || "";
    var text =
      decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString("en-US");
    return text + suffix;
  }

  function cacheEls() {
    Array.prototype.slice
      .call(section.querySelectorAll("[data-trust-smooth]"))
      .forEach(function (el) {
        elCache[el.getAttribute("data-trust-key")] = el;
      });
    Array.prototype.slice
      .call(section.querySelectorAll("[data-trust-text]"))
      .forEach(function (el) {
        elCache["text:" + el.getAttribute("data-trust-key")] = el;
      });
    ringEl = document.getElementById("hww-rel-ring");
    dialEl = document.getElementById("hww-perf-dial");
    gaugeEl = document.getElementById("hww-sup-gauge");
    relBars = document.getElementById("hww-rel-bars");
    secBars = document.getElementById("hww-sec-bars");
    perfBars = document.getElementById("hww-perf-bars");
    pins = Array.prototype.slice.call(section.querySelectorAll("[data-rel-pin]"));
    steps = Array.prototype.slice.call(section.querySelectorAll("[data-flow-step]"));
    conns = Array.prototype.slice.call(
      section.querySelectorAll(".hww-tflow__conn")
    );
    feedEl = document.getElementById("hww-sup-feed");
  }

  function setText(key, value) {
    texts[key] = value;
    var el = elCache["text:" + key];
    if (el) el.textContent = value;
  }

  function shiftBars(container, biasHigh) {
    if (!container) return;
    var spans = container.children;
    if (!spans.length) return;
    var heights = [];
    for (var i = 1; i < spans.length; i++) {
      heights.push(spans[i].style.getPropertyValue("--h") || "50%");
    }
    var next = biasHigh
      ? Math.round(72 + Math.random() * 26)
      : Math.round(35 + Math.random() * 55);
    heights.push(next + "%");
    for (var j = 0; j < spans.length; j++) {
      spans[j].style.setProperty("--h", heights[j]);
    }
  }

  function paintFlow(step) {
    steps.forEach(function (el, i) {
      el.classList.remove("is-done", "is-current", "is-pending");
      if (i < step) el.classList.add("is-done");
      else if (i === step) el.classList.add("is-current");
      else el.classList.add("is-pending");
    });
    conns.forEach(function (c, i) {
      c.classList.toggle("is-flow", i < step);
    });
  }

  function advanceFlow() {
    if (!steps.length) return;
    if (flowStep >= steps.length - 1) {
      flowStep = 0;
      paintFlow(0);
      return;
    }
    var conn = conns[flowStep];
    if (conn) {
      conn.classList.remove("is-flow");
      void conn.offsetWidth;
      conn.classList.add("is-flow");
    }
    flowStep += 1;
    paintFlow(flowStep);
  }

  function pushFeed() {
    if (!feedEl) return;
    var msg = feedItems[Math.floor(Math.random() * feedItems.length)];
    var li = document.createElement("li");
    li.className = "is-enter";
    li.innerHTML =
      "<i></i><strong>" + msg + "</strong><em>now</em>";
    feedEl.insertBefore(li, feedEl.firstChild);
    requestAnimationFrame(function () {
      li.classList.remove("is-enter");
    });
    while (feedEl.children.length > 3) {
      feedEl.removeChild(feedEl.lastChild);
    }
  }

  function pingPin() {
    if (!pins.length) return;
    var pin = pins[Math.floor(Math.random() * pins.length)];
    pin.classList.remove("is-ping");
    void pin.offsetWidth;
    pin.classList.add("is-ping");
  }

  function schedule(every, fn) {
    tasks.push({ every: every, last: 0, fn: fn });
  }

  function lerpState(dt) {
    var keys = Object.keys(state);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var s = state[key];
      var rate = key === "uptime" ? Math.min(1, dt / 900) : Math.min(1, dt / 280);
      var factor = key === "uptime" ? 0.06 + rate * 0.12 : 0.12 + rate * 0.2;
      s.cur += (s.tgt - s.cur) * factor;
      if (Math.abs(s.tgt - s.cur) < 0.001) s.cur = s.tgt;
    }
  }

  function render() {
    var keys = Object.keys(state);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var el = elCache[key];
      if (el) el.textContent = formatNum(key, state[key].cur);
    }
    if (ringEl) ringEl.style.setProperty("--p", String(state.uptime.cur));
    if (dialEl) dialEl.style.setProperty("--score", String(state.score.cur));
    if (gaugeEl) gaugeEl.style.setProperty("--csat", String(state.csat.cur));
  }

  function loop(now) {
    if (!running) return;
    if (!lastFrame) lastFrame = now;
    var dt = Math.min(48, now - lastFrame);
    lastFrame = now;

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if (now - task.last >= task.every) {
        task.last = now;
        task.fn();
      }
    }

    lerpState(dt);
    render();
    requestAnimationFrame(loop);
  }

  function animateBottomCounters() {
    var els = Array.prototype.slice.call(
      section.querySelectorAll("#hww-trust-metrics [data-trust-count]")
    );
    var duration = 1400;
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(t);
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-trust-target") || "0");
        var decimals = parseInt(el.getAttribute("data-trust-decimals") || "0", 10);
        var suffix = el.getAttribute("data-trust-suffix") || "";
        var value = target * e;
        el.textContent =
          (decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))) +
          suffix;
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function startLive() {
    schedule(1000, function () {
      state.rps.tgt = Math.round(rand(1800, 2400));
      state.response.tgt = Math.round(rand(48, 71));
      shiftBars(relBars, true);
    });

    schedule(1600, function () {
      state.threats.tgt = Math.round(state.threats.tgt + rand(2, 8));
      shiftBars(secBars, true);
    });

    schedule(2000, function () {
      scoreIdx = (scoreIdx + 1) % scoreCycle.length;
      state.score.tgt = scoreCycle[scoreIdx];
      state.pagespeed.tgt = Math.round(
        Math.max(94, Math.min(99, state.score.tgt + rand(-1, 1)))
      );
      state.ttfb.tgt = Math.round(rand(70, 110));
      state.lcp.tgt = Math.round(rand(0.9, 1.4) * 10) / 10;
      state.cls.tgt = Math.round(rand(0.01, 0.05) * 100) / 100;
      state.perfResp.tgt = Math.round(rand(95, 145));
      shiftBars(perfBars, false);
    });

    schedule(3000, function () {
      advanceFlow();
    });

    schedule(3500, function () {
      var active = Math.random() > 0.45 ? 12 : 11;
      setText("regions", active + " / 12");
      setText(
        "regionsLabel",
        active + " region" + (active === 1 ? "" : "s") + " healthy"
      );
      pingPin();
    });

    schedule(4000, function () {
      ticketsIdx = (ticketsIdx + 1) % ticketsCycle.length;
      avgIdx = (avgIdx + 1) % avgCycle.length;
      successIdx = (successIdx + 1) % successCycle.length;
      state.tickets.tgt = ticketsCycle[ticketsIdx];
      state.success.tgt = successCycle[successIdx];
      state.csat.tgt = Math.round(rand(97, 99));
      setText("avgResp", avgCycle[avgIdx]);
    });

    schedule(4500, function () {
      pushFeed();
      pingPin();
    });

    paintFlow(0);
    state.uptime.tgt = 99.99;
    running = true;
    requestAnimationFrame(loop);
  }

  function start() {
    if (started) return;
    started = true;
    section.classList.add("is-visible");
    cacheEls();

    if (reduceMotion) {
      state.uptime.cur = 99.99;
      state.uptime.tgt = 99.99;
      render();
      if (ringEl) ringEl.style.setProperty("--p", "99.99");
      paintFlow(steps.length - 1);
      Array.prototype.slice
        .call(section.querySelectorAll("#hww-trust-metrics [data-trust-count]"))
        .forEach(function (el) {
          var target = parseFloat(el.getAttribute("data-trust-target") || "0");
          var decimals = parseInt(el.getAttribute("data-trust-decimals") || "0", 10);
          var suffix = el.getAttribute("data-trust-suffix") || "";
          el.textContent =
            (decimals > 0 ? target.toFixed(decimals) : String(Math.round(target))) +
            suffix;
        });
      return;
    }

    animateBottomCounters();
    startLive();
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );
    io.observe(section);
  } else {
    start();
  }
})();

/* =========================================================
   Section 8 — Final CTA
   ========================================================= */
(function () {
  var section = document.getElementById("hww-finale");
  if (!section) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var started = false;

  function reveal() {
    if (started) return;
    started = true;
    section.classList.add("is-visible");
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
          }
        });
      },
      { threshold: 0.28 }
    );
    io.observe(section);
  } else {
    reveal();
  }

  /* Tiny floating particles */
  var canvas = document.getElementById("hww-finale-particles");
  if (!canvas || reduceMotion) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var particles = [];
  var raf = 0;
  var running = false;

  function resize() {
    var rect = section.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    var w = section.clientWidth;
    var h = section.clientHeight;
    var count = Math.max(18, Math.floor((w * h) / 42000));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.08 - Math.random() * 0.18,
        a: 0.18 + Math.random() * 0.35,
      });
    }
  }

  function draw() {
    var w = section.clientWidth;
    var h = section.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) {
        p.y = h + 4;
        p.x = Math.random() * w;
      }
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(79, 70, 229," + p.a + ")";
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function startParticles() {
    if (running) return;
    running = true;
    resize();
    seed();
    draw();
  }

  function stopParticles() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  var particleIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startParticles();
        else stopParticles();
      });
    },
    { threshold: 0.05 }
  );
  particleIO.observe(section);

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!running) return;
      resize();
      seed();
    }, 150);
  });
})();
