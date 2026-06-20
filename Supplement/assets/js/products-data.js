window.ProductCatalog = (function () {
  var IMG = "assets/img/";

  function calcOffPercent(price, mrp) {
    if (!mrp || mrp <= price) return null;
    return Math.round((1 - price / mrp) * 100);
  }

  function defaultHighlights(p) {
    return [
      p.desc,
      "100% Genuine & Authentic Product",
      "Lab Tested for Quality and Purity",
      "Fast Delivery Across India"
    ];
  }

  function finalize(p) {
    p.images = p.images || [p.img];
    p.fullName = p.fullName || p.name;
    p.seller = p.seller || "NutraNova Retail Private Limited";
    p.expiry = p.expiry || "01-03-2027";
    p.offPercent = p.offPercent != null ? p.offPercent : calcOffPercent(p.price, p.mrp);
    p.offLabel = p.offLabel || (p.offPercent ? "( " + p.offPercent + "% OFF )" : null);
    p.highlights = p.highlights || defaultHighlights(p);
    p.specs = p.specs || ("Net Weight: " + (p.size || "Standard") + " · Brand: " + p.brand + " · Flavour: " + (p.flavour || "Unflavoured"));
    p.overview = p.overview || (p.name + " by " + p.brand + " — " + p.desc + " Formulated for daily fitness and wellness goals with premium quality ingredients.");
    p.benefits = p.benefits || [
      "Supports your daily nutrition and fitness goals",
      "Premium quality ingredients from a trusted brand",
      "Easy to use as part of your daily routine"
    ];
    p.suggestedUse = p.suggestedUse || "Use as directed on the product label or as advised by your healthcare professional. Store in a cool, dry place away from direct sunlight.";
    p.nutrition = p.nutrition || "Refer to the product label for complete nutritional information and ingredient list.";
    p.reviewsSummary = p.reviewsSummary || ("Rated " + p.rating.toFixed(1) + " out of 5 based on " + p.reviews + " verified reviews.");
    return p;
  }

  var raw = [
    { id: 1, img: "BS-1.png", images: ["BS-1.png", "BS-2.png", "BS-3.png", "BS-4.png"], brand: "NutraNova", name: "100% Whey Protein", fullName: "100% Whey Protein 2 Lbs Double Rich Chocolate + Creatine 100 g", desc: "Faster Recovery & Lean Muscle Gains", rating: 4.6, reviews: 2315, price: 1099, mrp: 1549, off: "-29%", category: "protein", collection: "bestseller", brandKey: "nutranova", foodType: "vegetarian", flavour: "chocolate", size: "2 kg", highlights: ["The World's Best-Selling Whey Protein Powder", "24 Grams of Protein per Serving to Help Build and Maintain Muscle", "5.5 Grams of Naturally Occurring BCAAs per Serving", "Gluten Free", "Banned Substance Tested", "Lab Tested for Quality and Purity"] },
    { id: 2, img: "BS-2.png", images: ["BS-2.png", "BS-1.png", "BS-3.png"], brand: "NutraNova AMP", name: "Gold Series 100% Whey Protein Advanced", desc: "Build Muscle Strength & Endurance", rating: 4.7, reviews: 1842, price: 3799, mrp: null, off: null, category: "protein", collection: "bestseller", brandKey: "nutranova", foodType: "vegetarian", flavour: "vanilla", size: "2 kg" },
    { id: 3, img: "BS-3.png", images: ["BS-3.png", "BS-1.png", "BS-4.png"], brand: "NutraNova AMP", name: "Pure Isolate (Low/Zero Carb)", desc: "Advanced Muscle Building To Amplify...", rating: 4.5, reviews: 615, price: 5199, mrp: 5339, off: "-2%", category: "protein", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "1 kg" },
    { id: 4, img: "BS-4.png", images: ["BS-4.png", "BS-2.png", "BS-5.png"], brand: "NutraNova Pro Performance", name: "Pro Performance Power Protein", desc: "High Protein for Strength & Recovery", rating: 4.4, reviews: 1520, price: 2149, mrp: 3199, off: "-32%", category: "fitness", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "chocolate", size: "1 kg" },
    { id: 5, img: "BS-5.png", images: ["BS-5.png", "BS-4.png", "BS-6.png"], brand: "NutraNova AMP", name: "Gold Series BCAA Advanced", desc: "Reduce Fatigue & Muscle Breakdown", rating: 4.6, reviews: 1124, price: 1299, mrp: 2219, off: "-41%", category: "fitness", collection: "bestseller", brandKey: "nutranova", foodType: "vegetarian", flavour: "fruit punch", size: "400 g" },
    { id: 6, img: "BS-6.png", images: ["BS-6.png", "BS-5.png", "BS-1.png"], brand: "NutraNova", name: "Pro Performance Creatine Monohydrate", desc: "Boost Strength & Workout Performance", rating: 4.8, reviews: 876, price: 3999, mrp: null, off: null, category: "fitness", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "300 g" },
    { id: 7, img: "WS-1.png", images: ["WS-1.png", "WS-2.png", "WS-3.png"], brand: "NutraNova Mega Men", name: "One Daily Multivitamin", desc: "Improves Energy, Immunity & Overall Health", rating: 4.6, reviews: 599, price: 499, mrp: 579, off: "-13%", category: "multivitamins", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 8, img: "WS-2.png", images: ["WS-2.png", "WS-1.png", "WS-3.png"], brand: "NutraNova Mega Men", name: "Sport Multivitamin", desc: "Supports Muscle Performance & Recovery", rating: 4.7, reviews: 171, price: 749, mrp: 949, off: "-21%", category: "multivitamins", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 9, img: "WS-3.png", images: ["WS-3.png", "WS-5.png", "WS-1.png"], brand: "NutraNova Women's", name: "One Daily Multivitamin", desc: "Improves Energy, Immunity, Skin and Hair", rating: 4.6, reviews: 101, price: 469, mrp: 619, off: "-24%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 10, img: "WS-4.png", images: ["WS-4.png", "WS-6.png"], brand: "NutraNova", name: "Men's Staminol Max", desc: "Testosterone Booster for Long-Lasting Energy", rating: 4.7, reviews: 15, price: 1499, mrp: 2669, off: "-43%", category: "fitness", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 capsules" },
    { id: 11, img: "WS-5.png", images: ["WS-5.png", "WS-3.png", "WS-9.png"], brand: "NutraNova Women's", name: "Hair, Skin & Nails", desc: "For Stronger Hair, Clearer Skin, and Nails", rating: 4.7, reviews: 165, price: 949, mrp: 1019, off: "-6%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 12, img: "WS-6.png", images: ["WS-6.png", "WS-4.png"], brand: "NutraNova", name: "Triple Strength Fish Oil", desc: "Heart, Brain & Joint Health Support", rating: 4.6, reviews: 892, price: 899, mrp: 1199, off: "-25%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "non-vegetarian", flavour: "unflavoured", size: "90 softgels" },
    { id: 13, img: "Whey-Protein-Concentrate-1.webp", brand: "NutraNova", name: "Whey Protein Concentrate", desc: "Premium Quality Whey for Daily Use", rating: 4.5, reviews: 642, price: 2499, mrp: 2999, off: "-16%", category: "protein", collection: "bestseller", brandKey: "nutranova", foodType: "vegetarian", flavour: "chocolate", size: "1 kg" },
    { id: 14, img: "Pre-Workout.webp", brand: "NutraNova AMP", name: "Pre Workout Energy Boost", desc: "Explosive Energy & Focus", rating: 4.6, reviews: 789, price: 1499, mrp: 1899, off: "-21%", category: "fitness", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "fruit punch", size: "250 g" },
    { id: 15, img: "Creatine-2.webp", brand: "NutraNova", name: "Creatine Monohydrate", desc: "Pure Micronized Creatine", rating: 4.7, reviews: 934, price: 899, mrp: 1199, off: "-25%", category: "fitness", collection: "bestseller", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "250 g" },
    { id: 16, img: "BCAA-1.webp", brand: "NutraNova AMP", name: "BCAA Recovery Formula", desc: "Faster Recovery Between Sets", rating: 4.5, reviews: 567, price: 1199, mrp: 1549, off: "-22%", category: "fitness", collection: "fitness", brandKey: "nutranova", foodType: "vegetarian", flavour: "lemon", size: "400 g" },
    { id: 17, img: "Multivitamins-for-Men.webp", brand: "NutraNova", name: "Multivitamins for Men", desc: "One Daily High Potency Formula", rating: 4.6, reviews: 1543, price: 719, mrp: 999, off: "-28%", category: "multivitamins", collection: "multivitamins", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 18, img: "Omega.webp", brand: "NutraNova", name: "Fish Oil Omega 3", desc: "EPA & DHA for Daily Wellness", rating: 4.5, reviews: 1287, price: 899, mrp: 1199, off: "-25%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "non-vegetarian", flavour: "unflavoured", size: "60 softgels" },
    { id: 19, img: "Ashwagandha.webp", images: ["Ashwagandha.webp", "WS-7.png"], brand: "NutraNova", name: "Ashwagandha Extract", desc: "Stress Relief & Vitality", rating: 4.8, reviews: 534, price: 599, mrp: 799, off: "-25%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 capsules" },
    { id: 20, img: "Pea-Protein.webp", brand: "NutraNova", name: "Pea & Plant Protein", desc: "100% Plant Based Protein Source", rating: 4.4, reviews: 518, price: 1899, mrp: 2299, off: "-17%", category: "protein", collection: "protein", brandKey: "nutranova", foodType: "vegan", flavour: "vanilla", size: "1 kg" },
    { id: 21, img: "Yeast-Protein.webp", brand: "NutraNova", name: "Yeast Protein", desc: "Complete Amino Acid Profile", rating: 4.3, reviews: 412, price: 1699, mrp: 1999, off: "-15%", category: "protein", collection: "protein", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "1 kg" },
    { id: 22, img: "Magnesium.webp", brand: "NutraNova", name: "Magnesium Glycinate", desc: "Muscle Relaxation & Sleep Support", rating: 4.4, reviews: 876, price: 649, mrp: 849, off: "-23%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 23, img: "Single-Vitamins.webp", brand: "NutraNova", name: "Vitamin D3 + K2", desc: "Bone & Immunity Support", rating: 4.5, reviews: 654, price: 549, mrp: 699, off: "-21%", category: "multivitamins", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 tablets" },
    { id: 24, img: "Shilajit.webp", brand: "NutraNova", name: "Pure Shilajit Resin", desc: "Energy & Stamina Booster", rating: 4.7, reviews: 432, price: 999, mrp: 1299, off: "-23%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "30 g" },
    { id: 25, img: "Pre-&-Probiotic-1.webp", brand: "NutraNova", name: "Pre & Probiotics", desc: "Gut Health & Digestive Support", rating: 4.6, reviews: 567, price: 799, mrp: 999, off: "-20%", category: "wellness", collection: "wellness", brandKey: "nutranova", foodType: "vegetarian", flavour: "unflavoured", size: "60 capsules" }
  ];

  var products = raw.map(finalize);

  function getById(id) {
    return products.find(function (p) { return p.id === id; }) || null;
  }

  function getUrl(id) {
    return "product.html?id=" + id;
  }

  function findByImage(path) {
    if (!path) return null;
    var file = path.split("/").pop().split("?")[0].toLowerCase();
    return products.find(function (p) {
      if (p.img.toLowerCase() === file) return true;
      return p.images && p.images.some(function (img) { return img.toLowerCase() === file; });
    }) || null;
  }

  function formatPrice(n) {
    return "₹ " + n.toLocaleString("en-IN");
  }

  function formatCardPrice(n) {
    return "₹" + n.toLocaleString("en-IN");
  }

  function imgSrc(file) {
    return IMG + file;
  }

  return {
    products: products,
    getById: getById,
    getUrl: getUrl,
    findByImage: findByImage,
    formatPrice: formatPrice,
    formatCardPrice: formatCardPrice,
    imgSrc: imgSrc
  };
})();
