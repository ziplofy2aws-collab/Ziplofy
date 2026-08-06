(function () {
  "use strict";

  var section = document.getElementById("codiic-automation");
  if (!section) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  var app = section.querySelector("[data-capp]");
  var stage = section.querySelector("[data-cauto-stage]");
  var steps = Array.prototype.slice.call(
    section.querySelectorAll("[data-step]")
  );
  var progress = section.querySelector(".capp__flow-progress");
  var feed = section.querySelector("[data-activity-feed]");
  var chartLine = section.querySelector(".capp__chart-line");
  var chartBars = Array.prototype.slice.call(
    section.querySelectorAll("[data-bar]")
  );

  var live = {
    followers: 2456,
    views: 18420,
    comments: 862,
    leads: 493,
    messages: 1284,
    revenue: 128400,
  };

  var activityQueue = [
    { title: "New Reel Published", meta: "Instagram · Summer Drop" },
    { title: "Customer Commented", meta: "“Price for running shoes?”" },
    { title: "AI Replied", meta: "Auto-reply sent in 1.2s" },
    { title: "Lead Captured", meta: "WhatsApp · Neha S." },
    { title: "Coupon Sent", meta: "SAVE15 · DM delivered" },
    { title: "Purchase Completed", meta: "Order #COD1842 · ₹2,799" },
  ];

  var stepIndex = 0;
  var activityIndex = 0;

  function formatLive(key, value) {
    if (key === "revenue") {
      return "₹" + Number(value).toLocaleString("en-IN");
    }
    return Number(value).toLocaleString("en-IN");
  }

  function paintLive() {
    Object.keys(live).forEach(function (key) {
      var el = section.querySelector('[data-live="' + key + '"]');
      if (el) el.textContent = formatLive(key, live[key]);
    });
  }

  function bumpLive() {
    live.followers += 1;
    live.views += Math.floor(3 + Math.random() * 9);
    if (Math.random() > 0.45) live.comments += 1;
    if (Math.random() > 0.55) live.leads += 1;
    live.messages += Math.floor(1 + Math.random() * 3);
    if (Math.random() > 0.6) live.revenue += Math.floor(199 + Math.random() * 900);
    paintLive();
  }

  function setWorkflowStep(index) {
    steps.forEach(function (step, i) {
      step.classList.toggle("is-active", i === index);
      step.classList.toggle("is-done", i < index);
    });

    if (progress) {
      var total = Math.max(steps.length - 1, 1);
      var pct = index / total;
      var length = 760;
      var offset = length - length * pct;
      if (hasGsap && !reduceMotion) {
        window.gsap.to(progress, {
          strokeDashoffset: offset,
          duration: 0.7,
          ease: "power2.out",
        });
      } else {
        progress.style.strokeDashoffset = String(offset);
      }
    }
  }

  function advanceWorkflow() {
    stepIndex = (stepIndex + 1) % steps.length;
    setWorkflowStep(stepIndex);
  }

  function pushActivity() {
    if (!feed) return;
    var item = activityQueue[activityIndex % activityQueue.length];
    activityIndex += 1;

    var node = document.createElement("div");
    node.className = "capp__activity";
    node.innerHTML =
      "<strong>" +
      item.title +
      "</strong><span>" +
      item.meta +
      " · just now</span>";

    feed.insertBefore(node, feed.firstChild);

    while (feed.children.length > 6) {
      feed.removeChild(feed.lastChild);
    }

    Array.prototype.forEach.call(feed.children, function (child, i) {
      child.classList.toggle("is-fade", i > 2);
    });

    if (hasGsap && !reduceMotion) {
      window.gsap.fromTo(
        node,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }
  }

  function initCharts() {
    if (!chartLine) return;
    if (hasGsap && !reduceMotion) {
      window.gsap.set(chartLine, { strokeDashoffset: 600 });
      window.gsap.to(chartLine, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power2.out",
      });

      chartBars.forEach(function (bar, i) {
        var h = bar.getAttribute("height");
        window.gsap.fromTo(
          bar,
          { scaleY: 0.15, opacity: 0.2 },
          {
            scaleY: 1,
            opacity: 0.35,
            duration: 0.8,
            delay: 0.08 * i,
            ease: "power2.out",
            transformOrigin: "50% 100%",
          }
        );
        // keep original height attribute meaning via scale
        if (h) bar.setAttribute("height", h);
      });
    } else {
      chartLine.style.strokeDashoffset = "0";
    }
  }

  function initParallax() {
    if (!app || !stage || reduceMotion) return;

    stage.addEventListener("mousemove", function (e) {
      var rect = stage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      if (hasGsap) {
        window.gsap.to(app, {
          rotateY: x * 4,
          rotateX: -y * 3,
          transformPerspective: 1200,
          duration: 0.6,
          ease: "power2.out",
        });
      } else {
        app.style.transform =
          "perspective(1200px) rotateY(" +
          x * 4 +
          "deg) rotateX(" +
          -y * 3 +
          "deg)";
      }
    });

    stage.addEventListener("mouseleave", function () {
      if (hasGsap) {
        window.gsap.to(app, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.7,
          ease: "power2.out",
        });
      } else {
        app.style.transform = "";
      }
    });
  }

  function initCardTilt() {
    if (reduceMotion) return;
    section.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        if (hasGsap) {
          window.gsap.to(card, {
            rotateY: x * 6,
            rotateX: -y * 6,
            transformPerspective: 800,
            duration: 0.35,
            ease: "power2.out",
          });
        }
      });
      card.addEventListener("mouseleave", function () {
        if (hasGsap) {
          window.gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.45,
            ease: "power2.out",
          });
        }
      });
    });
  }

  function initNav() {
    var items = section.querySelectorAll("[data-capp-nav]");
    items.forEach(function (btn) {
      btn.addEventListener("click", function () {
        items.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  }

  function seedFeed() {
    if (!feed) return;
    for (var i = 0; i < 4; i += 1) {
      pushActivity();
    }
  }

  // Init
  if (progress) {
    progress.style.strokeDasharray = "760";
    progress.style.strokeDashoffset = "760";
  }

  paintLive();
  setWorkflowStep(0);
  initCharts();
  initParallax();
  initCardTilt();
  initNav();
  seedFeed();

  if (!reduceMotion) {
    setInterval(advanceWorkflow, 2800);
    setInterval(pushActivity, 3000);
    setInterval(bumpLive, 1100);
  }

  if (hasGsap && !reduceMotion) {
    window.gsap.from(app, {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power2.out",
    });
  }
})();
