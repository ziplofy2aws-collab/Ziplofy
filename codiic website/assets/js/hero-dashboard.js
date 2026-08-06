(function () {
  "use strict";

  var root = document.getElementById("hero-codiic-dash");
  if (!root) return;
  var DASH_BASE_WIDTH = 1240;
  var DASH_BASE_HEIGHT = 940;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatINR(num) {
    return "₹" + Number(num).toLocaleString("en-IN");
  }

  function formatNumber(num) {
    return Number(num).toLocaleString("en-IN");
  }

  /* ---------- Sales line chart ---------- */
  var salesValues = [42, 58, 51, 73, 68, 92, 88, 105, 98, 120, 112, 135, 128, 148];
  var salesLabels = [
    "20 Jul",
    "22 Jul",
    "25 Jul",
    "28 Jul",
    "31 Jul",
    "3 Aug",
    "6 Aug",
    "8 Aug",
    "10 Aug",
    "13 Aug",
    "15 Aug",
    "17 Aug",
    "19 Aug",
    "20 Aug",
  ];
  var salesAmounts = [
    42000, 58000, 51000, 73000, 68000, 92000, 98765, 105000, 98000, 120000,
    112000, 135000, 128000, 148000,
  ];

  var chartLeft = 48;
  var chartRight = 540;
  var chartTop = 20;
  var chartBottom = 140;

  function salesPoint(i, value) {
    var x =
      chartLeft +
      (i / (salesValues.length - 1)) * (chartRight - chartLeft);
    var y =
      chartBottom -
      ((value - 0) / 150) * (chartBottom - chartTop);
    return { x: x, y: y };
  }

  function buildSalesPath() {
    var points = salesValues.map(function (v, i) {
      return salesPoint(i, v);
    });
    var d = "";
    points.forEach(function (p, i) {
      d += (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1) + " ";
    });
    var area =
      d +
      "L" +
      chartRight +
      " " +
      chartBottom +
      " L" +
      chartLeft +
      " " +
      chartBottom +
      " Z";
    return { line: d.trim(), area: area, points: points };
  }

  function initSalesChart() {
    var lineEl = document.getElementById("hdash-sales-line");
    var areaEl = document.getElementById("hdash-sales-area");
    var dotsEl = document.getElementById("hdash-sales-dots");
    var tip = document.getElementById("hdash-sales-tooltip");
    if (!lineEl || !areaEl || !dotsEl || !tip) return;

    var built = buildSalesPath();
    lineEl.setAttribute("d", built.line);
    areaEl.setAttribute("d", built.area);
    dotsEl.innerHTML = "";

    built.points.forEach(function (p) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", "3.2");
      c.setAttribute("fill", "#fff");
      c.setAttribute("stroke", "#06b6d4");
      c.setAttribute("stroke-width", "2");
      dotsEl.appendChild(c);
    });

    var tipLine = tip.querySelector("line");
    var tipCircle = tip.querySelector("circle");
    var tipText = tip.querySelector("text");
    var tipIndex = 6;

    function showTooltip(index) {
      var p = built.points[index];
      tip.setAttribute("opacity", "1");
      tip.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
      if (tipLine) {
        tipLine.setAttribute("x1", "0");
        tipLine.setAttribute("x2", "0");
        tipLine.setAttribute("y1", String(chartTop - p.y));
        tipLine.setAttribute("y2", String(chartBottom - p.y));
      }
      if (tipCircle) {
        tipCircle.setAttribute("cx", "0");
        tipCircle.setAttribute("cy", "0");
      }
      if (tipText) {
        tipText.textContent = formatINR(salesAmounts[index]);
      }
    }

    showTooltip(tipIndex);

    if (!reduceMotion) {
      setInterval(function () {
        tipIndex = (tipIndex + 1) % built.points.length;
        showTooltip(tipIndex);
      }, 2500);
    }
  }

  /* ---------- Donut chart ---------- */
  function initDonut() {
    var g = document.getElementById("hdash-donut-segments");
    if (!g) return;

    var segments = [
      { pct: 38, color: "#06b6d4" },
      { pct: 30, color: "#3b82f6" },
      { pct: 20, color: "#a855f7" },
      { pct: 11, color: "#f59e0b" },
      { pct: 1, color: "#94a3b8" },
    ];
    var radius = 42;
    var circumference = 2 * Math.PI * radius;
    var offset = 0;

    g.innerHTML = "";
    segments.forEach(function (seg) {
      var length = (seg.pct / 100) * circumference;
      var circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", "60");
      circle.setAttribute("cy", "60");
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", seg.color);
      circle.setAttribute("stroke-width", "12");
      circle.setAttribute(
        "stroke-dasharray",
        length + " " + (circumference - length)
      );
      circle.setAttribute("stroke-dashoffset", String(-offset));
      circle.setAttribute("stroke-linecap", "butt");
      g.appendChild(circle);
      offset += length;
    });
  }

  /* ---------- Live stats + activity ---------- */
  var stats = {
    revenue: 1245678,
    orders: 1243,
    customers: 856,
    conversion: 3.42,
    visitors: 32456,
  };

  var activitySets = [
    [
      {
        icon: "fa-bag-shopping",
        title: 'New order #COD1234 received',
        time: "2 mins ago",
      },
      {
        icon: "fa-box",
        title: 'Product "Smart Watch" updated',
        time: "15 mins ago",
      },
      {
        icon: "fa-user-plus",
        title: "Customer Neha Singh registered",
        time: "1 hour ago",
      },
      {
        icon: "fa-pen",
        title: 'Blog post "Summer Sale Tips" published',
        time: "3 hours ago",
      },
      {
        icon: "fa-tag",
        title: 'Discount "SUMMER20" created',
        time: "5 hours ago",
      },
    ],
    [
      {
        icon: "fa-credit-card",
        title: "Payment of ₹7,850 captured",
        time: "Just now",
      },
      {
        icon: "fa-bag-shopping",
        title: "New order #COD1235 received",
        time: "4 mins ago",
      },
      {
        icon: "fa-truck",
        title: "Order #COD1228 shipped",
        time: "28 mins ago",
      },
      {
        icon: "fa-users",
        title: "12 new customers joined today",
        time: "1 hour ago",
      },
      {
        icon: "fa-chart-line",
        title: "Conversion rate hit 3.5%",
        time: "2 hours ago",
      },
    ],
    [
      {
        icon: "fa-store",
        title: "Store theme published successfully",
        time: "1 min ago",
      },
      {
        icon: "fa-box",
        title: 'Inventory updated for "Running Shoes"',
        time: "12 mins ago",
      },
      {
        icon: "fa-envelope",
        title: "Campaign email sent to 2,450 subscribers",
        time: "45 mins ago",
      },
      {
        icon: "fa-bag-shopping",
        title: "New order #COD1236 received",
        time: "1 hour ago",
      },
      {
        icon: "fa-shield-halved",
        title: "SSL certificate verified",
        time: "3 hours ago",
      },
    ],
  ];

  var orderSets = [
    [
      ["#COD1234", "Amit Verma", "paid", "₹4,599"],
      ["#COD1233", "Neha Singh", "pending", "₹2,199"],
      ["#COD1232", "Rahul Mehta", "paid", "₹7,850"],
      ["#COD1231", "Priya Shah", "cancelled", "₹1,299"],
      ["#COD1230", "Karan Patel", "paid", "₹3,450"],
    ],
    [
      ["#COD1235", "Sneha Rao", "paid", "₹5,299"],
      ["#COD1234", "Amit Verma", "paid", "₹4,599"],
      ["#COD1233", "Neha Singh", "pending", "₹2,199"],
      ["#COD1232", "Rahul Mehta", "paid", "₹7,850"],
      ["#COD1231", "Priya Shah", "cancelled", "₹1,299"],
    ],
    [
      ["#COD1236", "Vikram Joshi", "pending", "₹1,899"],
      ["#COD1235", "Sneha Rao", "paid", "₹5,299"],
      ["#COD1234", "Amit Verma", "paid", "₹4,599"],
      ["#COD1233", "Neha Singh", "paid", "₹2,199"],
      ["#COD1232", "Rahul Mehta", "paid", "₹7,850"],
    ],
  ];

  var activityEl = document.getElementById("hdash-activity");
  var ordersBody = document.getElementById("hdash-orders-body");
  var tick = 0;

  function renderActivity(list) {
    if (!activityEl) return;
    activityEl.innerHTML = list
      .map(function (item) {
        return (
          '<li><div class="hdash__activity-icon"><i class="fa-solid ' +
          item.icon +
          '"></i></div><div><strong>' +
          item.title +
          "</strong><span>" +
          item.time +
          "</span></div></li>"
        );
      })
      .join("");
  }

  function renderOrders(rows) {
    if (!ordersBody) return;
    ordersBody.innerHTML = rows
      .map(function (row) {
        var statusClass =
          row[2] === "paid"
            ? "is-paid"
            : row[2] === "pending"
              ? "is-pending"
              : "is-cancelled";
        var statusLabel =
          row[2].charAt(0).toUpperCase() + row[2].slice(1);
        return (
          "<tr><td>" +
          row[0] +
          "</td><td>" +
          row[1] +
          '</td><td><span class="hdash__pill ' +
          statusClass +
          '">' +
          statusLabel +
          "</span></td><td>" +
          row[3] +
          "</td></tr>"
        );
      })
      .join("");
  }

  function updateStat(key, value, formatter) {
    var el = root.querySelector('[data-hdash-stat="' + key + '"]');
    if (!el) return;
    el.style.opacity = "0.45";
    window.setTimeout(function () {
      el.textContent = formatter(value);
      el.style.opacity = "1";
    }, 180);
  }

  function bumpStats() {
    stats.revenue += Math.floor(1800 + Math.random() * 6200);
    stats.orders += Math.floor(1 + Math.random() * 4);
    stats.customers += Math.floor(1 + Math.random() * 3);
    stats.conversion = Math.min(
      4.8,
      +(stats.conversion + (Math.random() * 0.08 - 0.02)).toFixed(2)
    );
    stats.visitors += Math.floor(40 + Math.random() * 180);

    updateStat("revenue", stats.revenue, formatINR);
    updateStat("orders", stats.orders, formatNumber);
    updateStat("customers", stats.customers, formatNumber);
    updateStat("conversion", stats.conversion, function (v) {
      return v.toFixed(2) + "%";
    });
    updateStat("visitors", stats.visitors, formatNumber);
  }

  function refreshLivePanel() {
    var idx = tick % activitySets.length;
    renderActivity(activitySets[idx]);
    renderOrders(orderSets[idx]);
    bumpStats();
    tick += 1;
  }

  function fitScale() {
    var frame = root.closest(".hdash-frame");
    if (!frame) return;
    var scaleByWidth = frame.clientWidth / DASH_BASE_WIDTH;
    var scaleByHeight = frame.clientHeight / DASH_BASE_HEIGHT;
    var scale = Math.min(scaleByWidth, scaleByHeight);
    root.style.setProperty("--hdash-scale", String(scale));
  }

  initSalesChart();
  initDonut();
  renderActivity(activitySets[0]);
  renderOrders(orderSets[0]);
  fitScale();

  window.addEventListener("resize", fitScale);

  if (!reduceMotion) {
    setInterval(refreshLivePanel, 8000);
  }
})();
