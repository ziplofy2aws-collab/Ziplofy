/* ===== Nivaas – Product catalog ===== */
(function (global) {
  "use strict";

  function formatPrice(amount) {
    return "\u20B9" + amount.toLocaleString("en-IN");
  }

  var PRODUCTS = {
    "bs-1": {
      id: "bs-1",
      brand: "HomeTown",
      title: "Lunaro Upholstered Queen Bed with Hydraulic Storage",
      shortTitle: "Lunaro Uphlstr Queen Bed W/hyd Storage",
      category: "Beds",
      image: "img/BS-1.webp",
      images: ["img/BS-1.webp", "img/BS-2.webp", "img/BS-6.webp", "img/BED_1.webp"],
      now: 81900,
      was: 199900,
      off: "59% OFF",
      rating: 4.5,
      reviews: 238,
      description:
        "The Lunaro Upholstered Queen Bed is a one of a kind, contemporary-modern bed. Its striking channel-tufted headboard sets it apart from your regular beds. Crafted in engineered wood with a premium soft-fabric finish, the bed offers durability and a stylish look, while built-in hydraulic storage keeps your bedroom clutter-free.",
    },
    "bs-2": {
      id: "bs-2",
      brand: "HomeTown",
      title: "Lunaro Upholstered King Bed with Hydraulic Storage",
      shortTitle: "Lunaro Uphlstr King Bed W/hyd Storage",
      category: "Beds",
      image: "img/BS-2.webp",
      images: ["img/BS-2.webp", "img/BS-1.webp", "img/BS-6.webp", "img/BED_1.webp"],
      now: 86900,
      was: 209900,
      off: "58% OFF",
      rating: 4.4,
      reviews: 192,
      description:
        "The Lunaro Upholstered King Bed combines spacious comfort with smart hydraulic storage. Its channel-tufted headboard and premium fabric upholstery elevate your bedroom, while the sturdy engineered wood frame ensures long-lasting support.",
    },
    "bs-3": {
      id: "bs-3",
      brand: "HomeTown",
      title: "Levanto Half Leather Zero Wall Electric Recliner | 2 Seater | Ocean Blue",
      shortTitle: "Levanto Half Leather Zero Wall Electric Recliner | 2 Seater | Ocean Blue",
      category: "Recliners",
      image: "img/BS-3.webp",
      images: ["img/BS-3.webp", "img/BS-4.webp", "img/BS-5.webp"],
      now: 96000,
      was: 279000,
      off: "65% OFF",
      rating: 4.6,
      reviews: 156,
      description:
        "The Levanto Half Leather Zero Wall Electric Recliner offers premium comfort with smooth electric reclining and a space-saving zero-wall design. Upholstered in half leather with Ocean Blue accents, it is perfect for modern living rooms.",
    },
    "bs-4": {
      id: "bs-4",
      brand: "HomeTown",
      title: "Levanto Half Leather Zero Wall Electric Recliner | 3 Seater | Ocean Blue",
      shortTitle: "Levanto Half Leather Zero Wall Electric Recliner | 3 Seater | Ocean Blue",
      category: "Recliners",
      image: "img/BS-4.webp",
      images: ["img/BS-4.webp", "img/BS-3.webp", "img/BS-5.webp"],
      now: 117900,
      was: 354900,
      off: "66% OFF",
      rating: 4.5,
      reviews: 143,
      description:
        "Relax in style with the Levanto 3 Seater Electric Recliner. Featuring zero-wall reclining, half leather upholstery, and Ocean Blue finishing, this sofa delivers lounge-level comfort for the whole family.",
    },
    "bs-5": {
      id: "bs-5",
      brand: "HomeTown",
      title: "Levanto Half Leather Zero Wall Electric Recliner | 3 Seater | Slate Grey",
      shortTitle: "Levanto Half Leather Zero Wall Electric Recliner | 3 Seater | Slate Grey",
      category: "Recliners",
      image: "img/BS-5.webp",
      images: ["img/BS-5.webp", "img/BS-4.webp", "img/BS-3.webp"],
      now: 117900,
      was: 354900,
      off: "66% OFF",
      rating: 4.5,
      reviews: 128,
      description:
        "The Levanto 3 Seater Recliner in Slate Grey blends contemporary design with electric reclining convenience. Its zero-wall mechanism and half leather build make it a refined centrepiece for any living space.",
    },
    "bs-6": {
      id: "bs-6",
      brand: "HomeTown",
      title: "Celesto Upholstered Hydraulic Bed | Queen | Light Brown",
      shortTitle: "Celesto Upholstered Hydraulic Bed | Queen | Light Brown",
      category: "Beds",
      image: "img/BS-6.webp",
      images: ["img/BS-6.webp", "img/BS-1.webp", "img/BS-2.webp", "img/BED_1.webp"],
      now: 61900,
      was: 199900,
      off: "69% OFF",
      rating: 4.3,
      reviews: 201,
      description:
        "The Celesto Upholstered Hydraulic Bed in Light Brown offers elegant upholstery, a sturdy queen frame, and generous under-bed storage. Ideal for compact bedrooms that need both style and practicality.",
    },
    "sofas-1": {
      id: "sofas-1",
      brand: "Urban Ladder",
      title: "Brentwood Leather Accent Chair in Rust Tan",
      category: "Sofas",
      image: "img/sofas-1.webp",
      images: ["img/sofas-1.webp", "img/sofas-2.webp"],
      now: 22999,
      was: 39999,
      off: "42% OFF",
      rating: 4.2,
      reviews: 87,
      description:
        "The Brentwood Leather Accent Chair in Rust Tan adds warmth and character to any corner. Premium leather upholstery and a solid frame make it a timeless accent piece for living rooms and reading nooks.",
    },
    "sofas-2": {
      id: "sofas-2",
      brand: "Urban Ladder",
      title: "Aspen Fabric 3 Seater Sofa in Mist Grey",
      category: "Sofas",
      image: "img/sofas-2.webp",
      images: ["img/sofas-2.webp", "img/sofas-3.webp"],
      now: 45999,
      was: 74999,
      off: "38% OFF",
      rating: 4.4,
      reviews: 112,
      description:
        "The Aspen Fabric 3 Seater Sofa in Mist Grey offers plush seating with a clean, modern silhouette. Soft fabric upholstery and a durable frame make it perfect for everyday lounging.",
    },
    "sofas-3": {
      id: "sofas-3",
      brand: "Urban Ladder",
      title: "Milano L-Shaped Sectional Sofa in Charcoal",
      category: "Sofas",
      image: "img/sofas-3.webp",
      images: ["img/sofas-3.webp", "img/sofas-6.webp"],
      now: 68999,
      was: 99999,
      off: "31% OFF",
      rating: 4.5,
      reviews: 94,
      description:
        "Maximise your living room with the Milano L-Shaped Sectional Sofa. Charcoal upholstery, generous seating, and a modular layout make it ideal for family gatherings and movie nights.",
    },
    "sofas-4": {
      id: "sofas-4",
      brand: "Nestroots",
      title: "Nordic 2 Seater Fabric Loveseat in Beige",
      category: "Sofas",
      image: "img/sofas-4.webp",
      images: ["img/sofas-4.webp", "img/sofas-2.webp"],
      now: 34999,
      was: 54999,
      off: "36% OFF",
      rating: 4.3,
      reviews: 76,
      description:
        "The Nordic 2 Seater Loveseat in Beige brings Scandinavian simplicity to compact spaces. Soft fabric, clean lines, and a comfortable seat make it a versatile choice for apartments and studios.",
    },
    "sofas-5": {
      id: "sofas-5",
      brand: "Woodbuzz",
      title: "Vienna 3 Seater Recliner Sofa in Slate Grey",
      category: "Sofas",
      image: "img/sofas-5.webp",
      images: ["img/sofas-5.webp", "img/BS-5.webp"],
      now: 57999,
      was: 89999,
      off: "36% OFF",
      rating: 4.4,
      reviews: 103,
      description:
        "Unwind on the Vienna 3 Seater Recliner Sofa in Slate Grey. Built for comfort with smooth reclining action and durable upholstery, it is designed for relaxed evenings at home.",
    },
    "sofas-6": {
      id: "sofas-6",
      brand: "Urban Ladder",
      title: "Oslo Fabric Corner Sofa in Forest Green",
      category: "Sofas",
      image: "img/sofas-6.webp",
      images: ["img/sofas-6.webp", "img/sofas-3.webp"],
      now: 72999,
      was: 109999,
      off: "34% OFF",
      rating: 4.5,
      reviews: 68,
      description:
        "The Oslo Fabric Corner Sofa in Forest Green offers expansive seating with a bold colour statement. Its corner configuration and plush cushions make it a standout piece for modern homes.",
    },
    "explore-1": {
      id: "explore-1",
      brand: "Urban Ladder",
      title: "Florence Solid Wood Lounge Chair in Calico Floral Colour",
      category: "Chairs",
      image: "img/explore-1.avif",
      images: ["img/explore-1.avif", "img/explore-4.avif"],
      now: 10999,
      was: 14999,
      off: "27% OFF",
      rating: 4.3,
      reviews: 54,
      description:
        "The Florence Solid Wood Lounge Chair features a charming calico floral upholstery and a sturdy solid wood frame — a perfect accent chair for living rooms and bedrooms.",
    },
    "explore-2": {
      id: "explore-2",
      brand: "Urban Ladder",
      title: "Genoa Fabric Wing Chair in Monochrome Paisley Colour",
      category: "Chairs",
      image: "img/explore-2.avif",
      images: ["img/explore-2.avif", "img/explore-8.avif"],
      now: 19999,
      was: 32999,
      off: "39% OFF",
      rating: 4.4,
      reviews: 61,
      description:
        "The Genoa Fabric Wing Chair in Monochrome Paisley adds classic elegance with its wingback silhouette and patterned fabric. Ideal for reading corners and formal living spaces.",
    },
    "explore-3": {
      id: "explore-3",
      brand: "Urban Ladder",
      title: "Odette Lounge Chair in Army Green Leather",
      category: "Chairs",
      image: "img/explore-3.avif",
      images: ["img/explore-3.avif", "img/explore-8.avif"],
      now: 44999,
      was: 89999,
      off: "50% OFF",
      rating: 4.6,
      reviews: 42,
      description:
        "The Odette Lounge Chair in Army Green Leather combines bold colour with premium leather upholstery. A statement piece that brings character and comfort to any room.",
    },
    "explore-4": {
      id: "explore-4",
      brand: "Urban Ladder",
      title: "Morgen Solid Wood Lounge Chair in Calico Print Colour",
      category: "Chairs",
      image: "img/explore-4.avif",
      images: ["img/explore-4.avif", "img/explore-1.avif"],
      now: 19999,
      was: 32999,
      off: "39% OFF",
      rating: 4.3,
      reviews: 48,
      description:
        "The Morgen Solid Wood Lounge Chair features a calico print fabric and a robust solid wood frame, offering timeless style and everyday comfort.",
    },
    "explore-5": {
      id: "explore-5",
      brand: "Urban Ladder",
      title: "Eclipse Fabric Lounge Chair in Pixel Blue Colour",
      category: "Chairs",
      image: "img/explore-5.avif",
      images: ["img/explore-5.avif", "img/explore-7.avif"],
      now: 39999,
      was: 89999,
      off: "56% OFF",
      rating: 4.5,
      reviews: 37,
      description:
        "The Eclipse Fabric Lounge Chair in Pixel Blue makes a vibrant design statement. Plush fabric upholstery and a contemporary form make it a standout accent chair.",
    },
    "explore-6": {
      id: "explore-6",
      brand: "Urban Ladder",
      title: "Sven Fabric Accent Lounge Chair in Stone Grey",
      category: "Chairs",
      image: "img/explore-6.avif",
      images: ["img/explore-6.avif", "img/explore-10.avif"],
      now: 15999,
      was: 27999,
      off: "42% OFF",
      rating: 4.2,
      reviews: 59,
      description:
        "The Sven Fabric Accent Lounge Chair in Stone Grey offers understated elegance with soft fabric upholstery and a compact footprint for smaller spaces.",
    },
    "explore-7": {
      id: "explore-7",
      brand: "Urban Ladder",
      title: "Aria Velvet Lounge Chair in Teal Colour",
      category: "Chairs",
      image: "img/explore-7.avif",
      images: ["img/explore-7.avif", "img/explore-5.avif"],
      now: 24999,
      was: 44999,
      off: "44% OFF",
      rating: 4.4,
      reviews: 45,
      description:
        "The Aria Velvet Lounge Chair in Teal brings luxurious velvet texture and rich colour to your living space. A refined accent chair for modern interiors.",
    },
    "explore-8": {
      id: "explore-8",
      brand: "Urban Ladder",
      title: "Bristol Leather Wing Chair in Tan Colour",
      category: "Chairs",
      image: "img/explore-8.avif",
      images: ["img/explore-8.avif", "img/explore-3.avif"],
      now: 49999,
      was: 89999,
      off: "44% OFF",
      rating: 4.6,
      reviews: 33,
      description:
        "The Bristol Leather Wing Chair in Tan combines classic wingback design with premium leather upholstery. A timeless piece for study rooms and living areas.",
    },
    "explore-9": {
      id: "explore-9",
      brand: "Urban Ladder",
      title: "Lumio Solid Wood Lounge Chair in Walnut Finish",
      category: "Chairs",
      image: "img/explore-9.avif",
      images: ["img/explore-9.avif", "img/explore-1.avif"],
      now: 17999,
      was: 29999,
      off: "40% OFF",
      rating: 4.3,
      reviews: 51,
      description:
        "The Lumio Solid Wood Lounge Chair in Walnut Finish showcases natural wood grain with a comfortable seat — perfect for adding warmth to contemporary spaces.",
    },
    "explore-10": {
      id: "explore-10",
      brand: "Urban Ladder",
      title: "Nordic Fabric Accent Lounge Chair in Mustard Colour",
      category: "Chairs",
      image: "img/explore-10.avif",
      images: ["img/explore-10.avif", "img/explore-6.avif"],
      now: 21999,
      was: 37999,
      off: "42% OFF",
      rating: 4.4,
      reviews: 46,
      description:
        "The Nordic Fabric Accent Lounge Chair in Mustard adds a pop of colour with Scandinavian-inspired design. Soft fabric and a sturdy frame make it a cheerful addition to any room.",
    },
  };

  function getProduct(id) {
    return PRODUCTS[id] || null;
  }

  function getProductUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function initProductLinks() {
    document.querySelectorAll("[data-product-id]").forEach(function (card) {
      var id = card.getAttribute("data-product-id");
      if (!PRODUCTS[id]) return;
      var url = getProductUrl(id);
      card.querySelectorAll("a").forEach(function (link) {
        link.setAttribute("href", url);
      });
      card.style.cursor = "pointer";
      card.addEventListener("click", function (e) {
        if (e.target.closest("button") || e.target.closest("a")) return;
        window.location.href = url;
      });
    });
  }

  global.FR2_PRODUCTS = {
    catalog: PRODUCTS,
    get: getProduct,
    getUrl: getProductUrl,
    formatPrice: formatPrice,
    initLinks: initProductLinks,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductLinks);
  } else {
    initProductLinks();
  }
})(window);
