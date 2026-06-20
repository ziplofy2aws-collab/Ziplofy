window.SH2_PRODUCTS = (function () {
  function tnGallery(num) {
    var imgs = [];
    var i;
    for (i = 0; i < 6; i += 1) {
      imgs.push("assets/img/TN-" + (((num - 1 + i) % 9) + 1) + ".avif");
    }
    return imgs;
  }

  function naGallery(num) {
    var imgs = [];
    var i;
    for (i = 0; i < 6; i += 1) {
      imgs.push("assets/img/NA-" + (((num - 1 + i) % 10) + 1) + ".webp");
    }
    return imgs;
  }

  function buildSpecs(name, type) {
    return [
      { label: "Upper Material", value: "Engineered Mesh + Synthetic Overlays" },
      { label: "Midsole", value: "High-Cushion EVA Foam" },
      { label: "Outsole", value: "Rubber with Multi-Directional Grip" },
      { label: "Closure", value: "Lace-Up" },
      { label: "Weight", value: "Approx. 280g (UK 8)" },
      { label: "Type", value: type || "Running Shoes" },
      { label: "Ideal For", value: "Running, Gym, Daily Wear" }
    ];
  }

  function buildHighlights(name) {
    return [
      "Responsive foam cushioning for impact protection on long runs",
      "Breathable engineered mesh upper keeps feet cool and dry",
      name + " designed for lightweight all-day comfort",
      "Durable rubber outsole with multi-surface grip",
      "Padded collar and tongue for secure ankle support"
    ];
  }

  function buildAbout(name) {
    return (
      "Engineered for runners who want speed and comfort in one package. The SOLVÉ " +
      name +
      " features a breathable mesh upper, cushioned midsole, and high-grip outsole for city streets and light training sessions."
    );
  }

  function enrich(item) {
    var off = Math.round((1 - item.price / item.mrp) * 100);
    return {
      id: item.id,
      name: item.name,
      title: "SOLVÉ " + item.name + " For Men",
      subtitle: item.subtitle,
      price: item.price,
      mrp: item.mrp,
      off: off,
      colors: item.colors,
      category: item.category,
      images: item.images,
      specs: buildSpecs(item.name, item.type),
      highlights: buildHighlights(item.name),
      about: buildAbout(item.name)
    };
  }

  var catalog = [
    enrich({
      id: "tn-1",
      name: "Fade Pro Running Shoes",
      subtitle: "High-Cushioned Midsole, Breathable Mesh Upper, All-Day Comfort",
      price: 3599,
      mrp: 7999,
      colors: 6,
      category: "Running Shoes",
      images: tnGallery(1)
    }),
    enrich({
      id: "tn-2",
      name: "Skyrocket Lite 2 Running Shoes",
      subtitle: "Featherlight Build, Responsive Cushioning, Daily Run Ready",
      price: 2749,
      mrp: 4999,
      colors: 3,
      category: "Running Shoes",
      images: tnGallery(2)
    }),
    enrich({
      id: "tn-3",
      name: "Conduct Pro Running Shoes",
      subtitle: "Stable Ride, Energy Return Foam, Long-Distance Comfort",
      price: 3599,
      mrp: 7999,
      colors: 2,
      category: "Running Shoes",
      images: tnGallery(3)
    }),
    enrich({
      id: "tn-4",
      name: "Club Kayzer Superior Cushioning Sneakers",
      subtitle: "Ultra Soft Cushioning, Street-Ready Style, All-Day Wear",
      price: 2749,
      mrp: 5499,
      colors: 4,
      category: "Sneakers",
      images: tnGallery(4)
    }),
    enrich({
      id: "tn-5",
      name: "Performance Runner Shoes",
      subtitle: "Speed-Focused Design, Lightweight Upper, Race-Day Feel",
      price: 3299,
      mrp: 5499,
      colors: 2,
      category: "Running Shoes",
      images: tnGallery(5)
    }),
    enrich({
      id: "tn-6",
      name: "Urban Street Sneakers",
      subtitle: "Casual Comfort, Bold Silhouette, Everyday Flexibility",
      price: 2999,
      mrp: 4599,
      colors: 3,
      category: "Sneakers",
      images: tnGallery(6)
    }),
    enrich({
      id: "tn-7",
      name: "Lite Walk Comfort Shoes",
      subtitle: "Soft Step Feel, Flexible Outsole, Walk-All-Day Support",
      price: 2499,
      mrp: 4799,
      colors: 2,
      category: "Walking Shoes",
      images: tnGallery(7)
    }),
    enrich({
      id: "tn-8",
      name: "Active Flex Training Shoes",
      subtitle: "Multi-Direction Grip, Gym-Ready Support, Dynamic Fit",
      price: 3149,
      mrp: 5399,
      colors: 4,
      category: "Training Shoes",
      images: tnGallery(8)
    }),
    enrich({
      id: "tn-9",
      name: "Motion Pro Sports Shoes",
      subtitle: "High-Impact Absorption, Sport-Ready Build, Secure Lockdown",
      price: 3449,
      mrp: 5599,
      colors: 3,
      category: "Sports Shoes",
      images: tnGallery(9)
    }),
    enrich({
      id: "na-1",
      name: "ZORO-02 Sports Shoes",
      subtitle: "New Launch — Multi-Surface Grip, Bold Athletic Style",
      price: 3149,
      mrp: 3699,
      colors: 4,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(1)
    }),
    enrich({
      id: "na-2",
      name: "Lifestyle-01 Wedge Shoes",
      subtitle: "New Launch — Elevated Comfort, Modern Lifestyle Design",
      price: 2949,
      mrp: 3699,
      colors: 2,
      category: "Lifestyle Shoes",
      type: "Lifestyle Shoes",
      images: naGallery(2)
    }),
    enrich({
      id: "na-3",
      name: "Mexico-01 Sports Shoes",
      subtitle: "New Launch — Cushioned Ride, Versatile Daily Performance",
      price: 3049,
      mrp: 3799,
      colors: 3,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(3)
    }),
    enrich({
      id: "na-4",
      name: "Court-Flex Sports Shoes",
      subtitle: "New Launch — Court-Ready Traction, Agile Footwork Support",
      price: 3199,
      mrp: 3999,
      colors: 4,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(4)
    }),
    enrich({
      id: "na-5",
      name: "Powerplay-21 Sports Shoes",
      subtitle: "New Launch — Power Cushioning, Game-Day Confidence",
      price: 3299,
      mrp: 4099,
      colors: 3,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(5)
    }),
    enrich({
      id: "na-6",
      name: "Roadster-85 Sports Shoes",
      subtitle: "New Launch — Road-Ready Durability, Smooth Transitions",
      price: 3099,
      mrp: 3899,
      colors: 4,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(6)
    }),
    enrich({
      id: "na-7",
      name: "Sprint-11 Sports Shoes",
      subtitle: "New Launch — Sprint-Optimized Flex, Lightweight Feel",
      price: 2999,
      mrp: 3799,
      colors: 2,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(7)
    }),
    enrich({
      id: "na-8",
      name: "Velocity-03 Sports Shoes",
      subtitle: "New Launch — Fast-Paced Comfort, Streamlined Upper",
      price: 3249,
      mrp: 4049,
      colors: 3,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(8)
    }),
    enrich({
      id: "na-9",
      name: "Aero-55 Sports Shoes",
      subtitle: "New Launch — Aero Mesh Ventilation, Cloud-Like Step",
      price: 3349,
      mrp: 4199,
      colors: 4,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(9)
    }),
    enrich({
      id: "na-10",
      name: "Glide-09 Sports Shoes",
      subtitle: "New Launch — Smooth Glide Platform, Everyday Sport Style",
      price: 3149,
      mrp: 3949,
      colors: 3,
      category: "Sports Shoes",
      type: "Sports Shoes",
      images: naGallery(10)
    })
  ];

  var map = {};
  catalog.forEach(function (product) {
    map[product.id] = product;
  });

  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function get(id) {
    return map[id] || map["tn-1"];
  }

  function getAll() {
    return catalog.slice();
  }

  function productHref(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function idFromImageSrc(src) {
    if (!src) return null;
    var match = src.match(/\/(TN|NA)-(\d+)/i);
    if (!match) return null;
    return match[1].toLowerCase() + "-" + parseInt(match[2], 10);
  }

  return {
    get: get,
    getAll: getAll,
    formatPrice: formatPrice,
    productHref: productHref,
    idFromImageSrc: idFromImageSrc
  };
})();
