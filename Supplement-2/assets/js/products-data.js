window.SP2_PRODUCTS = [
  {
    id: 1,
    img: "product-1.png",
    name: "Impact Whey Protein",
    category: "protein",
    rating: 4.5,
    reviews: 2711,
    price: 1699,
    was: 1899,
    save: 200,
    desc: "Premium whey protein blend to support muscle recovery and lean muscle growth."
  },
  {
    id: 2,
    img: "product-2.png",
    name: "Impact Whey Isolate",
    category: "protein",
    rating: 4.5,
    reviews: 1794,
    price: 2299,
    was: 2599,
    save: 300,
    desc: "Ultra-filtered whey isolate with high protein and low carbs per serving."
  },
  {
    id: 3,
    img: "product-3.png",
    name: "Creatine Monohydrate Powder",
    category: "fitness",
    rating: 4,
    reviews: 117,
    price: 299,
    was: 699,
    save: 400,
    desc: "Micronized creatine monohydrate for strength, power, and performance."
  },
  {
    id: 4,
    img: "product-4.png",
    name: "Impact Hot Protein",
    category: "protein",
    rating: 4.5,
    reviews: 13,
    price: 3499,
    was: 4499,
    save: 1000,
    desc: "Delicious hot protein drink for convenient post-workout nutrition."
  },
  {
    id: 5,
    img: "product-5.png",
    name: "Muscle Xcel Pre-Workout + Burner",
    category: "pre-workout",
    rating: 4.7,
    reviews: 10,
    price: 1495,
    was: 2969,
    save: 1474,
    desc: "Advanced pre-workout formula with thermogenic support for intense training."
  },
  {
    id: 6,
    img: "product-6.png",
    name: "Muscle Xcel Whey Protein Isolate",
    category: "protein",
    rating: 4.8,
    reviews: 24,
    price: 2299,
    was: 3499,
    save: 1200,
    desc: "Rich chocolate whey isolate for fast absorption and lean muscle support."
  },
  {
    id: 7,
    img: "product-7.png",
    name: "Muscle Xcel Creatine Monohydrate",
    category: "fitness",
    rating: 4.6,
    reviews: 18,
    price: 899,
    was: 1499,
    save: 600,
    desc: "Pure creatine monohydrate to boost strength and workout performance."
  },
  {
    id: 8,
    img: "product-8.png",
    name: "Muscle Xcel BCAA Recovery",
    category: "fitness",
    rating: 4.5,
    reviews: 12,
    price: 1199,
    was: 1999,
    save: 800,
    desc: "BCAA recovery formula to reduce fatigue and support muscle repair."
  },
  {
    id: 9,
    img: "product-9.png",
    name: "Muscle Xcel Serious Mass Gainer",
    category: "gainer",
    rating: 4.7,
    reviews: 31,
    price: 2499,
    was: 3999,
    save: 1500,
    desc: "High-calorie mass gainer for bigger gains and better recovery."
  },
  {
    id: 10,
    img: "product-10.png",
    name: "Muscle Xcel Fish Oil Omega 3",
    category: "vitamins",
    rating: 4.4,
    reviews: 9,
    price: 699,
    was: 999,
    save: 300,
    desc: "Omega-3 fish oil softgels for heart, brain, and joint support."
  },
  {
    id: 11,
    img: "product-11.png",
    name: "Muscle Xcel Daily Multivitamin",
    category: "vitamins",
    rating: 4.6,
    reviews: 15,
    price: 549,
    was: 799,
    save: 250,
    desc: "Complete daily multivitamin for energy, immunity, and overall wellness."
  }
];

(function () {
  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function formatWas(amount) {
    return (
      "Was ₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  function formatSave(amount) {
    return (
      "Save ₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  function starsHtml(rating) {
    var html = "";
    var i;

    for (i = 1; i <= 5; i += 1) {
      if (rating >= i) {
        html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
      } else if (rating >= i - 0.5) {
        html += '<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>';
      } else {
        html += '<i class="fa-regular fa-star" aria-hidden="true"></i>';
      }
    }

    return html;
  }

  function productUrl(id) {
    return "product.html?id=" + id;
  }

  function cardHtml(product) {
    var url = productUrl(product.id);

    return (
      '<article class="sp2-product-card">' +
      '<div class="sp2-product-card__media">' +
      '<button type="button" class="sp2-product-card__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      '<a href="' +
      url +
      '" class="sp2-product-card__img-link">' +
      '<img src="assets/img/' +
      product.img +
      '" alt="' +
      product.name +
      '" loading="lazy" decoding="async" />' +
      "</a></div>" +
      '<div class="sp2-product-card__info">' +
      '<h3 class="sp2-product-card__name"><a href="' +
      url +
      '">' +
      product.name +
      "</a></h3>" +
      '<div class="sp2-product-card__rating">' +
      '<span class="sp2-product-card__stars" aria-hidden="true">' +
      starsHtml(product.rating) +
      "</span>" +
      '<span class="sp2-product-card__reviews">(' +
      product.reviews +
      ")</span>" +
      "</div>" +
      '<p class="sp2-product-card__price">' +
      formatPrice(product.price) +
      "</p>" +
      '<div class="sp2-product-card__discount">' +
      '<span class="sp2-product-card__was">' +
      formatWas(product.was) +
      "</span>" +
      '<span class="sp2-product-card__save">' +
      formatSave(product.save) +
      "</span>" +
      "</div>" +
      '<p class="sp2-product-card__tax">Inclusive of all taxes</p>' +
      "</div>" +
      '<div class="sp2-product-card__footer">' +
      '<a href="' +
      url +
      '" class="sp2-product-card__buy">' +
      '<i class="fa-solid fa-cart-plus" aria-hidden="true"></i> QUICK BUY</a>' +
      '<p class="sp2-product-card__offer">EXTRA ₹1000 OFF ABOVE ₹8000 + FREE DELIVERY &amp; GIFTS</p>' +
      "</div></article>"
    );
  }

  window.SP2Helpers = {
    formatPrice: formatPrice,
    formatWas: formatWas,
    formatSave: formatSave,
    starsHtml: starsHtml,
    productUrl: productUrl,
    cardHtml: cardHtml
  };
})();
