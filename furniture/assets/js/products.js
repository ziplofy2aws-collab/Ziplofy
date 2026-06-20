/**
 * Product catalog — IDs match listing cards via data-product-id or image/title.
 */
const PRODUCT_CATALOG = {
  "albert-right": {
    title: "Albert L Shape Right Aligned Corner Sofa with Tilt-Adjustable Headrests (Velvet, Graphite Grey)",
    image: "assets/img/exclusive-5.webp",
    images: [
      "assets/img/exclusive-5.webp",
      "assets/img/exclusive-4.webp",
      "assets/img/exclusive-3.webp",
      "assets/img/exclusive-2.webp",
      "assets/img/exclusive-1.webp",
      "assets/img/exclusive-6.webp",
      "assets/img/exclusive-7.webp",
    ],
    price: "₹59,999",
    mrp: "₹1,33,999",
    off: "55% Off",
    reviews: "(8)",
    rating: 4.5,
    deal: true,
    category: "Fabric Sofas",
    showOrientation: true,
  },
  "osbert": {
    title: "Osbert 3 Seater Curved Sofa (Cotton, Jade Ivory)",
    image: "assets/img/Top-rated-1.jpg",
    images: ["assets/img/Top-rated-1.jpg"],
    price: "₹45,999",
    mrp: "₹81,999",
    off: "44% OFF",
    reviews: "(385)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: false,
  },
  "mcbeth": {
    title: "Mcbeth - Sofie Sheesham Wood 6 Seater Dining Set",
    image: "assets/img/Top-rated-2.jpg",
    images: ["assets/img/Top-rated-2.jpg"],
    price: "₹59,999",
    mrp: "₹71,999",
    off: "51% OFF",
    reviews: "(25)",
    rating: 5,
    deal: false,
    category: "Dining",
    showOrientation: false,
  },
  "lorenz": {
    title: "Lorenz 3 Seater Sofa (Cotton, Jade Ivory)",
    image: "assets/img/Top-rated-3.jpg",
    images: ["assets/img/Top-rated-3.jpg"],
    price: "₹42,999",
    mrp: "₹91,999",
    off: "53% OFF",
    reviews: "(212)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: false,
  },
  "feltro": {
    title: "Feltro Sheesham Wood Sofa Bed With Storage",
    image: "assets/img/Top-rated-4.jpg",
    images: ["assets/img/Top-rated-4.jpg"],
    price: "₹39,999",
    mrp: "₹76,999",
    off: "48% OFF",
    reviews: "(170)",
    rating: 5,
    deal: false,
    category: "Sofa Cum Bed",
    showOrientation: false,
  },
  "oasis": {
    title: "Oasis L-Shape Left Aligned Sofa (Cotton, Jade Ivory)",
    image: "assets/img/Top-rated-5.jpg",
    images: ["assets/img/Top-rated-5.jpg"],
    price: "₹75,999",
    mrp: "₹1,45,999",
    off: "48% OFF",
    reviews: "(17)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: true,
  },
  "merlin": {
    title: "Merlin 2 Seater Fabric Sofa (Honey Beige)",
    image: "assets/img/Top-rated-6.jpg",
    images: ["assets/img/Top-rated-6.jpg"],
    price: "₹31,999",
    mrp: "₹63,999",
    off: "50% OFF",
    reviews: "(96)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: false,
  },
  "nova": {
    title: "Nova Sheesham Wood 3 Seater Sofa Set (Ivory)",
    image: "assets/img/Top-rated-7.jpg",
    images: ["assets/img/Top-rated-7.jpg"],
    price: "₹52,999",
    mrp: "₹96,999",
    off: "45% OFF",
    reviews: "(123)",
    rating: 5,
    deal: false,
    category: "Sofa Sets",
    showOrientation: false,
  },
  "aurora": {
    title: "Aurora 3 Seater Fabric Sofa (Pearl White)",
    image: "assets/img/Top-rated-1.jpg",
    images: ["assets/img/Top-rated-1.jpg"],
    price: "₹47,999",
    mrp: "₹89,999",
    off: "47% OFF",
    reviews: "(88)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: false,
  },
  "vesta": {
    title: "Vesta Sheesham Wood 6 Seater Dining Set",
    image: "assets/img/Top-rated-2.jpg",
    images: ["assets/img/Top-rated-2.jpg"],
    price: "₹57,999",
    mrp: "₹1,09,999",
    off: "47% OFF",
    reviews: "(64)",
    rating: 5,
    deal: false,
    category: "Dining",
    showOrientation: false,
  },
  "helios": {
    title: "Helios 3 Seater Premium Sofa (Honey Beige)",
    image: "assets/img/Top-rated-3.jpg",
    images: ["assets/img/Top-rated-3.jpg"],
    price: "₹49,999",
    mrp: "₹92,999",
    off: "46% OFF",
    reviews: "(141)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: false,
  },
  "casey": {
    title: "Casey Swivel Dining Chair In Olive And Tan Colour Set Of 2",
    image: "assets/img/exclusive-1.webp",
    images: ["assets/img/exclusive-1.webp"],
    price: "₹19,999",
    mrp: "₹29,999",
    off: "33% OFF",
    reviews: "(42)",
    rating: 4.5,
    deal: false,
    brand: "Urban Ladder",
    category: "Dining",
    showOrientation: false,
  },
  "caribu": {
    title: "Caribu Glass 4 To 6 Seater Extendable Dining Table In White High Gloss Finish",
    image: "assets/img/exclusive-2.webp",
    images: ["assets/img/exclusive-2.webp"],
    price: "₹41,999",
    mrp: "₹57,799",
    off: "27% OFF",
    reviews: "(58)",
    rating: 4,
    deal: false,
    brand: "Urban Ladder",
    category: "Dining",
    showOrientation: false,
  },
  "bennis": {
    title: "Bennis 25 Pair Shoe Rack in Dark Walnut Finish",
    image: "assets/img/exclusive-3.webp",
    images: ["assets/img/exclusive-3.webp"],
    price: "₹11,999",
    mrp: "₹17,799",
    off: "33% OFF",
    reviews: "(31)",
    rating: 4.5,
    deal: false,
    brand: "Urban Ladder",
    category: "Storage",
    showOrientation: false,
  },
  "taran": {
    title: "Taran 3 Seater Wooden Sofa in Deep Olive Velvet Colour",
    image: "assets/img/exclusive-4.webp",
    images: ["assets/img/exclusive-4.webp"],
    price: "₹64,999",
    mrp: "₹78,750",
    off: "17% OFF",
    reviews: "(76)",
    rating: 4.5,
    deal: false,
    brand: "Urban Ladder",
    category: "Sofas",
    showOrientation: false,
  },
  "aruba": {
    title: "Aruba Engineered Wood Queen Size Bed With Hydraulic Storage (Rustic Walnut Finish)",
    image: "assets/img/exclusive-5.webp",
    images: ["assets/img/exclusive-5.webp"],
    price: "₹26,999",
    mrp: "₹45,599",
    off: "41% OFF",
    reviews: "(112)",
    rating: 4,
    deal: false,
    brand: "Urban Ladder",
    category: "Beds",
    showOrientation: false,
  },
  "florence": {
    title: "Florence Solid Wood Lounge Chair in Calico Floral Colour",
    image: "assets/img/exclusive-6.webp",
    images: ["assets/img/exclusive-6.webp"],
    price: "₹10,999",
    mrp: "₹14,999",
    off: "27% OFF",
    reviews: "(19)",
    rating: 4.5,
    deal: false,
    brand: "Urban Ladder",
    category: "Living",
    showOrientation: false,
  },
  "raynor": {
    title: "Raynor 3 Seater Wooden Sofa in Macadamia Brown Colour",
    image: "assets/img/exclusive-7.webp",
    images: ["assets/img/exclusive-7.webp"],
    price: "₹32,999",
    mrp: "₹47,999",
    off: "31% OFF",
    reviews: "(54)",
    rating: 4,
    deal: false,
    brand: "Urban Ladder",
    category: "Sofas",
    showOrientation: false,
  },
  "amy": {
    title: "Amy Engineered Wood Queen Size Bed With Box Storage (Classic Walnut Finish, Brown Colour)",
    image: "assets/img/exclusive-8.webp",
    images: ["assets/img/exclusive-8.webp"],
    price: "₹15,999",
    mrp: "₹30,999",
    off: "48% OFF",
    reviews: "(67)",
    rating: 4.5,
    deal: false,
    brand: "Urban Ladder",
    category: "Beds",
    showOrientation: false,
  },
  "austin": {
    title: "Bharat Lifestyle Austin Fabric Recliner",
    image: "assets/img/exclusive-1.webp",
    images: ["assets/img/exclusive-1.webp"],
    price: "₹14,289",
    mrp: "₹15,780",
    off: "9% OFF",
    reviews: "(15)",
    rating: 5,
    deal: false,
    category: "Living",
    showOrientation: false,
  },
  "namur": {
    title: "Bharat Lifestyle Namur Engineered Wardrobe",
    image: "assets/img/exclusive-2.webp",
    images: ["assets/img/exclusive-2.webp"],
    price: "₹5,049",
    mrp: "₹7,855",
    off: "36% OFF",
    reviews: "(9)",
    rating: 5,
    deal: false,
    category: "Storage",
    showOrientation: false,
  },
  "lisbon": {
    title: "Bharat Lifestyle Lisbon Engineered Bed",
    image: "assets/img/exclusive-3.webp",
    images: ["assets/img/exclusive-3.webp"],
    price: "₹10,989",
    mrp: "₹14,285",
    off: "23% OFF",
    reviews: "(14)",
    rating: 5,
    deal: false,
    category: "Beds",
    showOrientation: false,
  },
  "spinet": {
    title: "Bharat Lifestyle Spinet Engineered TV Unit",
    image: "assets/img/exclusive-4.webp",
    images: ["assets/img/exclusive-4.webp"],
    price: "₹5,489",
    mrp: "₹7,142",
    off: "23% OFF",
    reviews: "(8)",
    rating: 5,
    deal: false,
    category: "Living",
    showOrientation: false,
  },
  "lshape-sofa": {
    title: "Bharat Lifestyle L-Shape Fabric Sofa",
    image: "assets/img/exclusive-5.webp",
    images: ["assets/img/exclusive-5.webp"],
    price: "₹37,990",
    mrp: "₹48,999",
    off: "22% OFF",
    reviews: "(11)",
    rating: 5,
    deal: false,
    category: "Sofas",
    showOrientation: true,
  },
  "marly": {
    title: "Bharat Lifestyle Marly Center Table",
    image: "assets/img/exclusive-6.webp",
    images: ["assets/img/exclusive-6.webp"],
    price: "₹6,899",
    mrp: "₹9,240",
    off: "25% OFF",
    reviews: "(6)",
    rating: 5,
    deal: false,
    category: "Living",
    showOrientation: false,
  },
  "orion": {
    title: "Bharat Lifestyle Orion King Bedside",
    image: "assets/img/exclusive-7.webp",
    images: ["assets/img/exclusive-7.webp"],
    price: "₹12,999",
    mrp: "₹16,499",
    off: "21% OFF",
    reviews: "(13)",
    rating: 5,
    deal: false,
    category: "Bedroom",
    showOrientation: false,
  },
  "aero": {
    title: "Bharat Lifestyle Aero Storage Cabinet",
    image: "assets/img/exclusive-8.webp",
    images: ["assets/img/exclusive-8.webp"],
    price: "₹8,499",
    mrp: "₹11,790",
    off: "28% OFF",
    reviews: "(10)",
    rating: 5,
    deal: false,
    category: "Storage",
    showOrientation: false,
  },
  "niwara": {
    title: "Niwara 3+1+1 Seater Fabric Sofa Set (Cotton, Azure Blue)",
    image: "assets/img/exclusive-5.webp",
    images: ["assets/img/exclusive-5.webp"],
    price: "₹56,999",
    mrp: "₹1,03,999",
    off: "45% Off",
    reviews: "(103)",
    rating: 4.5,
    deal: false,
    category: "Fabric Sofas",
    showOrientation: false,
  },
  "berlin": {
    title: "Berlin 3 Seater Sofa (Velvet, Indigo Blue)",
    image: "assets/img/exclusive-6.webp",
    images: ["assets/img/exclusive-6.webp"],
    price: "₹43,999",
    mrp: "₹83,999",
    off: "48% Off",
    reviews: "(337)",
    rating: 4,
    deal: true,
    category: "Fabric Sofas",
    showOrientation: false,
  },
  "albus": {
    title: "Albus 3+1+1 Seater Fabric Sofa Set (Velvet, Indigo Blue)",
    image: "assets/img/exclusive-7.webp",
    images: ["assets/img/exclusive-7.webp"],
    price: "₹65,999",
    mrp: "₹1,44,999",
    off: "54% Off",
    reviews: "(34)",
    rating: 4.5,
    deal: false,
    category: "Fabric Sofas",
    showOrientation: false,
  },
  "albert-left": {
    title: "Albert L Shape Left Aligned Corner Sofa with Tilt-Adjustable Headrests (Velvet, Graphite Grey)",
    image: "assets/img/exclusive-8.webp",
    images: ["assets/img/exclusive-8.webp"],
    price: "₹59,999",
    mrp: "₹92,999",
    off: "35% Off",
    reviews: "(12)",
    rating: 4.5,
    deal: true,
    category: "Fabric Sofas",
    showOrientation: true,
  },
};

const DEFAULT_PRODUCT_ID = "albert-right";

function getProductById(id) {
  return PRODUCT_CATALOG[id] || PRODUCT_CATALOG[DEFAULT_PRODUCT_ID];
}

function getProductUrl(id) {
  const base = "product.html";
  if (!id || id === DEFAULT_PRODUCT_ID) {
    return `${base}?id=${DEFAULT_PRODUCT_ID}`;
  }
  return `${base}?id=${encodeURIComponent(id)}`;
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id && PRODUCT_CATALOG[id] ? id : DEFAULT_PRODUCT_ID;
}

function resolveProductIdFromCard(card) {
  if (card.dataset.productId && PRODUCT_CATALOG[card.dataset.productId]) {
    return card.dataset.productId;
  }

  const imgSrc = card.querySelector("img")?.getAttribute("src")?.trim() || "";
  const imgFile = imgSrc.split("/").pop();

  const byImage = Object.entries(PRODUCT_CATALOG).find(([, product]) => {
    const catalogFile = product.image.split("/").pop();
    return imgFile && catalogFile === imgFile && imgSrc.includes(catalogFile);
  });

  if (byImage) {
    return byImage[0];
  }

  const titleEl = card.querySelector(
    ".product-card__name, .plp-card__title a, .plp-card__title, .exclusive-card__name, .similar-card__title a"
  );
  const title = titleEl?.textContent.replace(/\s+/g, " ").trim();

  if (title) {
    const byTitle = Object.entries(PRODUCT_CATALOG).find(([, product]) => product.title === title);
    if (byTitle) {
      return byTitle[0];
    }
  }

  return null;
}

function buildStarIconsHtml(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  let html = "";

  for (let i = 0; i < full; i += 1) {
    html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
  }
  if (half) {
    html += '<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>';
  }
  for (let i = 0; i < empty; i += 1) {
    html += '<i class="fa-regular fa-star" aria-hidden="true"></i>';
  }

  return html;
}
