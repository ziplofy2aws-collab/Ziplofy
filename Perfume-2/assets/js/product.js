(function () {
  var mainImg = document.getElementById('pf2-pdp-main');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.pf2-pdp__thumb'));
  var sizeButtons = Array.prototype.slice.call(document.querySelectorAll('.pf2-pdp__size'));
  var accordions = Array.prototype.slice.call(document.querySelectorAll('.pf2-pdp__accordion'));
  var topBtn = document.querySelector('.pf2-pdp__top');

  function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id && window.PF2_PRODUCTS && window.PF2_PRODUCTS[id]) {
      return id;
    }
    return window.PF2_DEFAULT_PRODUCT_ID || 'davidoff-cool-water';
  }

  function renderStars(rating) {
    var html = '';
    var i;

    for (i = 1; i <= 5; i += 1) {
      if (rating >= i) {
        html += '<span class="pf2-pdp__star is-filled" aria-hidden="true"></span>';
      } else if (rating >= i - 0.5) {
        html += '<span class="pf2-pdp__star is-half" aria-hidden="true"></span>';
      } else {
        html += '<span class="pf2-pdp__star" aria-hidden="true"></span>';
      }
    }

    return html;
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el) {
      el.textContent = text;
    }
  }

  function setHtml(selector, html) {
    var el = document.querySelector(selector);
    if (el) {
      el.innerHTML = html;
    }
  }

  function renderProduct(product) {
    if (!product) {
      return;
    }

    document.title = product.name + ' | Perfume Store';

    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    thumbs.forEach(function (thumb) {
      thumb.setAttribute('data-image', product.image);
      var thumbImg = thumb.querySelector('img');
      if (thumbImg) {
        thumbImg.src = product.image;
      }
    });

    setText('.pf2-pdp__title', product.name);
    setText('.pf2-pdp__price', product.price);
    setText('.pf2-pdp__unit', product.unit);
    setText('.pf2-pdp__card-text', product.snapshot);

    var perfectEl = document.querySelector('.pf2-pdp__perfect span:last-child');
    if (perfectEl) {
      perfectEl.innerHTML = '<strong>Perfect For:</strong> ' + product.perfectFor;
    }

    var mrpEl = document.querySelector('.pf2-pdp__mrp');
    var saveEl = document.querySelector('.pf2-pdp__save');
    if (mrpEl) {
      mrpEl.textContent = product.mrp || '';
      mrpEl.hidden = !product.mrp;
    }
    if (saveEl) {
      saveEl.textContent = product.save || '';
      saveEl.hidden = !product.save;
    }

    var familyEl = document.querySelector('.pf2-pdp__card-family');
    if (familyEl) {
      familyEl.innerHTML = 'Fragrance Family: <strong>' + product.family + '</strong>';
    }

    var snapshotItems = document.querySelectorAll('.pf2-pdp__snapshot-item');
    if (snapshotItems.length >= 4) {
      snapshotItems[0].innerHTML = '<span>Smells Like</span>' + product.smellsLike;
      snapshotItems[1].innerHTML = '<span>Best For</span>' + product.bestFor;
      snapshotItems[2].innerHTML = '<span>When to Wear</span>' + product.whenToWear;
      snapshotItems[3].innerHTML = '<span>Season</span>' + product.season;
    }

    setHtml('.pf2-pdp__notes', [
      '<span class="pf2-pdp__notes-label">Notes (Top &bull; Heart &bull; Base)</span>',
      '<span class="pf2-pdp__note-item"><strong>Top:</strong> ' + product.notesTop + '</span>',
      '<span class="pf2-pdp__note-item"><strong>Heart:</strong> ' + product.notesHeart + '</span>',
      '<span class="pf2-pdp__note-item"><strong>Base:</strong> ' + product.notesBase + '</span>'
    ].join(''));

    document.dispatchEvent(new CustomEvent('pf2:notes-updated'));

    var descriptionPanel = document.querySelector('.pf2-pdp__accordions .pf2-pdp__accordion:first-child .pf2-pdp__accordion-panel');
    if (descriptionPanel) {
      descriptionPanel.textContent = product.description;
    }

    var collectionLink = document.getElementById('pf2-pdp-collection');
    if (collectionLink && product.collection) {
      collectionLink.textContent = product.collection;
    }

    var ratingEl = document.querySelector('.pf2-pdp__rating');
    if (ratingEl) {
      ratingEl.setAttribute('aria-label', 'Rated ' + product.rating + ' out of 5 stars');
      ratingEl.innerHTML = renderStars(product.rating);
    }

    var sizesWrap = document.querySelector('.pf2-pdp__sizes');
    if (sizesWrap && product.sizes) {
      sizesWrap.innerHTML = product.sizes.map(function (size, index) {
        var activeClass = index === 0 ? ' is-active' : '';
        return '<button class="pf2-pdp__size' + activeClass + '" type="button">' + size + '</button>';
      }).join('');

      sizeButtons = Array.prototype.slice.call(document.querySelectorAll('.pf2-pdp__size'));
      sizeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          sizeButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
        });
      });
    }
  }

  var productId = getProductIdFromUrl();
  var product = window.PF2_PRODUCTS && window.PF2_PRODUCTS[productId];
  renderProduct(product);

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var imageSrc = thumb.getAttribute('data-image');
      if (!imageSrc || !mainImg) {
        return;
      }

      mainImg.src = imageSrc;
      thumbs.forEach(function (item) {
        item.classList.toggle('is-active', item === thumb);
      });
    });
  });

  sizeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      sizeButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
    });
  });

  accordions.forEach(function (accordion) {
    var toggle = accordion.querySelector('.pf2-pdp__accordion-toggle');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = accordion.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      topBtn.classList.toggle('is-visible', window.scrollY > 420);
    }, { passive: true });
  }
})();
