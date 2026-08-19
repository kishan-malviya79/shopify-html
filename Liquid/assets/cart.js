/* ==========================================================================
   Cart behaviour — shared by every page that renders the cart_drawer markup.

   Static-build stand-in for Shopify's Cart AJAX API: line items live in
   localStorage instead of /cart/add.js, and the drawer re-renders from that
   state. In the Liquid build, replace readProduct()/save() with fetch calls
   to /cart/add.js + /cart/change.js and re-render from the section-rendering
   API response — the markup, classes and data-attributes below stay as they
   are.

   Wiring per page:
     - the header's Cart button needs data-cart-open
     - every add-to-cart button needs data-add-to-cart
     - the cart_drawer markup (including its <template>) must be on the page
     - <script src="js/cart.js"></script> before </body>
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'munchief-cart';

  /* ---------------------------------------------------------------- state */

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      /* private mode / quota — the in-memory copy still drives this page */
    }
  }

  var items = load();

  /* ------------------------------------------------------------- helpers */

  function parsePrice(text) {
    if (!text) return 0;
    var n = parseFloat(String(text).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function money(value) {
    return '₹' + Math.round(value);
  }

  function subtotal() {
    return items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  /* Product type is inferred from the placeholder art's filename — the only
     signal the static markup carries. In Liquid this is product.type. */
  function metaFor(image) {
    return /can-/.test(image || '') ? 'Soda' : 'Makhana Pack';
  }

  /* Reads a product out of whichever card/buy-box the button sits in. Each
     entry is [container selector, title selector, price selector, image
     selector]; the variant comes from a <select> or a selected variant pill
     when the container has one. */
  var SOURCES = [
    ['.product-card', '.product-card__title', '.price__sale', '.product-card__media img'],
    ['.cart-rec-card', '.cart-rec-card__title', '.cart-rec-card__price', '.cart-rec-card__media img'],
    ['.upsell-card', '.upsell-card__title', '.price__sale', '.upsell-card__media'],
    ['.combo-card', '.combo-card__title', '.price__sale', '.combo-card__media img'],
    ['.product-main', '.product-main__title', '.price__sale', '.product-main__media img']
  ];

  function readProduct(button) {
    for (var i = 0; i < SOURCES.length; i++) {
      var source = SOURCES[i];
      var root = button.closest(source[0]);
      if (!root) continue;

      var titleEl = root.querySelector(source[1]);
      var priceEl = root.querySelector(source[2]);
      var imageEl = root.querySelector(source[3]);
      var select = root.querySelector('.select__input');
      var pill = root.querySelector('.variant-pill.is-selected');
      var link = root.querySelector('.product-card__link');
      var qtyValue = root.querySelector('[data-qty-value]');

      var image = imageEl ? imageEl.getAttribute('src') : '';
      var variant = '';
      var price = parsePrice(priceEl && priceEl.textContent);

      if (select) {
        variant = select.value.split('—')[0].trim();
      } else if (pill) {
        variant = pill.textContent.split('—')[0].trim();
        price = parsePrice(pill.dataset.variantPrice) || price;
      }

      return {
        title: titleEl ? titleEl.textContent.trim() : 'Product',
        meta: metaFor(image),
        price: price,
        image: image,
        href: link ? link.getAttribute('href') : '#',
        variant: variant || 'Default',
        qty: qtyValue ? parseInt(qtyValue.textContent, 10) || 1 : 1
      };
    }

    return null;
  }

  function keyOf(item) {
    return item.title + '|' + item.variant;
  }

  function addItem(product) {
    var existing = items.filter(function (item) {
      return keyOf(item) === keyOf(product);
    })[0];

    if (existing) {
      existing.qty += product.qty;
    } else {
      items.push(product);
    }

    save(items);
    render();
  }

  /* --------------------------------------------------------------- render */

  function render() {
    document.querySelectorAll('[data-cart-drawer]').forEach(function (drawer) {
      renderDrawer(drawer);
    });
    renderCount();
  }

  function renderCount() {
    var count = items.reduce(function (sum, item) { return sum + item.qty; }, 0);

    document.querySelectorAll('.site-header__cart-count').forEach(function (bubble) {
      bubble.textContent = count;
      bubble.dataset.count = count;
    });

    document.querySelectorAll('[data-cart-open]').forEach(function (button) {
      if (button.hasAttribute('aria-label')) {
        button.setAttribute('aria-label', 'Cart, ' + count + ' items');
      }
    });
  }

  function renderDrawer(drawer) {
    var list = drawer.querySelector('[data-cart-items]');
    var template = drawer.querySelector('[data-cart-item-template]');
    var empty = drawer.querySelector('[data-cart-empty]');
    var recs = drawer.querySelector('[data-cart-recs]');
    var promo = drawer.querySelector('[data-cart-promo]');
    var summary = drawer.querySelector('[data-cart-summary]');
    var isEmpty = items.length === 0;

    if (list && template) {
      list.textContent = '';

      items.forEach(function (item, index) {
        var row = template.content.firstElementChild.cloneNode(true);

        var media = row.querySelector('.cart-item__media');
        var image = row.querySelector('[data-item-image]');
        var title = row.querySelector('[data-item-title]');

        if (item.meta === 'Soda') media.classList.add('cart-item__media--yellow');
        image.src = item.image;
        image.alt = item.title;
        title.textContent = item.title;
        title.setAttribute('href', item.href || '#');
        row.querySelector('[data-item-meta]').textContent = item.meta;
        row.querySelector('[data-item-price]').textContent = money(item.price * item.qty);
        row.querySelector('[data-qty-value]').textContent = item.qty;

        var variant = row.querySelector('[data-item-variant]');
        variant.textContent = '';
        variant.appendChild(new Option(item.variant, item.variant, true, true));

        row.querySelector('[data-qty-decrease]').addEventListener('click', function () {
          if (item.qty <= 1) {
            items.splice(index, 1);
          } else {
            item.qty -= 1;
          }
          save(items);
          render();
        });

        row.querySelector('[data-qty-increase]').addEventListener('click', function () {
          item.qty += 1;
          save(items);
          render();
        });

        row.querySelector('[data-item-remove]').addEventListener('click', function () {
          items.splice(index, 1);
          save(items);
          render();
        });

        list.appendChild(row);
      });

      list.hidden = isEmpty;
    }

    if (empty) empty.hidden = !isEmpty;
    if (recs) recs.hidden = !isEmpty;
    if (promo) promo.hidden = isEmpty;
    if (summary) summary.hidden = isEmpty;

    var subtotalEl = drawer.querySelector('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = money(subtotal());

    renderRewards(drawer);
  }

  /* Milestone thresholds live on the markup (data-threshold), so the copy,
     the fill width and the puck positions all stay data-driven. */
  function renderRewards(drawer) {
    var track = drawer.querySelector('.cart-rewards__track');
    var fill = drawer.querySelector('[data-cart-reward-fill]');
    var message = drawer.querySelector('[data-cart-reward-message]');
    if (!track || !fill) return;

    var milestones = Array.prototype.map.call(
      track.querySelectorAll('.cart-rewards__milestone'),
      function (node) {
        return {
          threshold: parseFloat(node.dataset.threshold) || 0,
          position: parseFloat(node.style.left) || 0,
          /* data-message is the copy used in the "away from …" line; the
             visible label under the puck is shorter (e.g. "Get 5% Off"). */
          label: node.dataset.message || (node.querySelector('.cart-rewards__label') || {}).textContent || ''
        };
      }
    );

    var total = subtotal();
    var previous = { threshold: 0, position: 0 };
    var next = null;

    for (var i = 0; i < milestones.length; i++) {
      if (total < milestones[i].threshold) {
        next = milestones[i];
        break;
      }
      previous = milestones[i];
    }

    var percent;
    if (!next) {
      percent = 100;
    } else {
      var span = next.threshold - previous.threshold;
      var progress = span > 0 ? (total - previous.threshold) / span : 0;
      percent = previous.position + (next.position - previous.position) * progress;
    }

    fill.style.width = Math.max(0.5, Math.min(100, percent)) + '%';

    if (message) {
      message.innerHTML = next
        ? 'You are <span class="cart-rewards__amount">' +
          money(next.threshold - total) +
          '</span> away from ' + next.label + '!'
        : 'You have unlocked every reward — nice.';
    }
  }

  /* --------------------------------------------------------------- events */

  function open() {
    document.querySelectorAll('[data-cart-drawer]').forEach(function (drawer) {
      drawer.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.querySelectorAll('[data-cart-drawer]').forEach(function (drawer) {
      drawer.classList.remove('is-open');
    });
    document.body.style.overflow = '';
  }

  function bind() {
    document.querySelectorAll('[data-cart-open]').forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    document.querySelectorAll('[data-cart-close]').forEach(function (button) {
      button.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        var product = readProduct(button);
        if (!product) return;
        addItem(product);
        open();
      });
    });

    /* Recommendation rail arrows (empty state) */
    document.querySelectorAll('[data-recs-track]').forEach(function (track) {
      var drawer = track.closest('[data-cart-drawer]');
      var card = function () { return track.querySelector('.cart-rec-card'); };

      function scrollRail(direction) {
        var first = card();
        if (!first) return;
        track.scrollBy({ left: direction * (first.getBoundingClientRect().width + 8), behavior: 'smooth' });
      }

      var prev = drawer.querySelector('[data-recs-prev]');
      var next = drawer.querySelector('[data-recs-next]');
      if (prev) prev.addEventListener('click', function () { scrollRail(-1); });
      if (next) next.addEventListener('click', function () { scrollRail(1); });
    });
  }

  /* Minimal public surface so other section scripts can push items in —
     bundle_builder's "Add bundle to cart" uses it. In Liquid this is just
     a /cart/add.js call, so nothing here needs to survive the port. */
  window.MunchiefCart = {
    add: function (product) { addItem(product); },
    open: open
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bind(); render(); });
  } else {
    bind();
    render();
  }
})();
