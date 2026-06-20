(function () {
  var CARD_SELECTORS = [
    ".p-card",
    ".apple-card",
    ".summer-card",
    ".windows-card",
    ".trending-card",
    ".croma-card",
    ".Voltix-card"
  ].join(",");

  function parsePrice(text) {
    if (!text) {
      return "";
    }
    var m = text.match(/₹\s?[\d,]+(?:\.\d+)?/);
    return m ? m[0].replace(/\s+/g, "") : "";
  }

  function parseMrp(text) {
    if (!text) {
      return "";
    }
    var m = text.match(/MRP\s*₹\s?[\d,]+(?:\.\d+)?/i);
    if (m) {
      return m[0].replace(/MRP\s*/i, "").replace(/\s+/g, "");
    }
    var prices = text.match(/₹\s?[\d,]+(?:\.\d+)?/g);
    return prices && prices[1] ? prices[1].replace(/\s+/g, "") : "";
  }

  function parseOffer(text) {
    if (!text) {
      return "";
    }
    var m = text.match(/\d+\s*%[\w\s]*/i);
    return m ? m[0].trim() : "";
  }

  function getCardData(card) {
    var titleEl = card.querySelector(
      ".p-card__body h3, .apple-card__name, .summer-card__name, .windows-card__name, .trending-card__name, .croma-card__name, h3"
    );
    var priceEl = card.querySelector(
      ".apple-card__now, .summer-card__now, .p-card__price, .apple-card__price, .summer-card__price, .windows-card__price, .trending-card__price, .croma-card__price"
    );
    var mrpEl = card.querySelector(
      ".p-card__mrp-wrap, .apple-card__mrp, .summer-card__mrp, .windows-card__mrp, .trending-card__mrp, .Voltix-card__mrp"
    );
    var offEl = card.querySelector(
      ".p-card__off, .apple-card__off, .summer-card__off, .windows-card__off, .trending-card__off"
    );
    var ratingEl = card.querySelector(
      ".p-card__meta, .apple-card__stars, .summer-card__stars, .Voltix-card__rating"
    );
    var imgEl = card.querySelector("img");

    var title = titleEl ? titleEl.textContent.trim() : "";
    var price = parsePrice(priceEl ? priceEl.textContent : "");
    var img = imgEl ? imgEl.getAttribute("src") || "" : "";
    var mrp = parseMrp(mrpEl ? mrpEl.textContent : (priceEl ? priceEl.textContent : ""));
    var offer = parseOffer(offEl ? offEl.textContent : (priceEl ? priceEl.textContent : ""));
    var rating = ratingEl ? ratingEl.textContent.trim() : "";

    if (!title || !price || !img) {
      return null;
    }

    return {
      title: title,
      price: price,
      img: img,
      mrp: mrp,
      offer: offer,
      rating: rating
    };
  }

  document.addEventListener("click", function (event) {
    var interactive = event.target.closest("a, button, input, select, label");
    if (interactive) {
      return;
    }

    var card = event.target.closest(CARD_SELECTORS);
    if (!card) {
      return;
    }

    var data = getCardData(card);
    if (!data) {
      return;
    }

    try {
      sessionStorage.setItem("voltixSelectedProduct", JSON.stringify(data));
    } catch (err) {
      /* ignore session storage errors */
    }

    var url =
      "product.html?title=" +
      encodeURIComponent(data.title) +
      "&price=" +
      encodeURIComponent(data.price) +
      "&img=" +
      encodeURIComponent(data.img) +
      "&mrp=" +
      encodeURIComponent(data.mrp || "") +
      "&offer=" +
      encodeURIComponent(data.offer || "");

    window.location.href = url;
  });
})();
