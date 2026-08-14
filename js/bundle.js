/* ==========================================================================
   bundle_builder behaviour — the "Build Your Bundle" page only.

   Holds the in-progress bundle (up to 10 products), keeps the panel in sync
   (slot bars, count, item list, subtotal, reward milestones) and hands the
   finished bundle to the cart via window.MunchiefCart.add().

   In the Liquid build the bundle is still client-side up to the last step;
   only the final handoff becomes a /cart/add.js call with the selected
   variant ids.
   ========================================================================== */
(function () {
  'use strict';

  var section = document.querySelector('[data-bundle]');
  if (!section) return;

  var MAX_ITEMS = parseInt(section.dataset.bundleMax, 10) || 10;

  var slots = section.querySelectorAll('.bundle-panel__slot');
  var count = section.querySelector('[data-bundle-count]');
  var note = section.querySelector('[data-bundle-note]');
  var list = section.querySelector('[data-bundle-items]');
  var subtotal = section.querySelector('[data-bundle-subtotal]');
  var submit = section.querySelector('[data-bundle-submit]');
  var fill = section.querySelector('[data-cart-reward-fill]');
  var track = section.querySelector('.cart-rewards__track');
  var stepTitle = section.querySelector('[data-bundle-reward-message]');

  var items = [];

  function parsePrice(text) {
    var n = parseFloat(String(text || '').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function money(value) {
    return '₹' + Math.round(value);
  }

  function total() {
    return items.reduce(function (sum, item) { return sum + item.price; }, 0);
  }

  function readProduct(button) {
    var card = button.closest('.product-card');
    if (!card) return null;

    var select = card.querySelector('.select__input');
    var image = card.querySelector('.product-card__media img');

    return {
      title: card.querySelector('.product-card__title').textContent.trim(),
      price: parsePrice(card.querySelector('.price__sale').textContent),
      image: image ? image.getAttribute('src') : '',
      variant: select ? select.value.split('—')[0].trim() : 'Default',
      meta: /can-/.test(image ? image.getAttribute('src') : '') ? 'Soda' : 'Makhana Pack',
      href: '#',
      qty: 1
    };
  }

  function renderRewards() {
    if (!track || !fill) return;

    var milestones = Array.prototype.map.call(
      track.querySelectorAll('.cart-rewards__milestone'),
      function (node) {
        return {
          threshold: parseFloat(node.dataset.threshold) || 0,
          position: parseFloat(node.style.left) || 0,
          label: node.dataset.message || ''
        };
      }
    );

    var value = total();
    var previous = { threshold: 0, position: 0 };
    var next = null;

    for (var i = 0; i < milestones.length; i++) {
      if (value < milestones[i].threshold) { next = milestones[i]; break; }
      previous = milestones[i];
    }

    var percent;
    if (!next) {
      percent = 100;
    } else {
      var span = next.threshold - previous.threshold;
      var progress = span > 0 ? (value - previous.threshold) / span : 0;
      percent = previous.position + (next.position - previous.position) * progress;
    }

    fill.style.width = Math.max(0.5, Math.min(100, percent)) + '%';

    if (stepTitle) {
      stepTitle.innerHTML = next
        ? 'You are <span class="cart-rewards__amount">' + money(next.threshold - value) +
          '</span> away from ' + next.label + '!'
        : 'Every reward unlocked — nice bundle.';
    }
  }

  function render() {
    slots.forEach(function (slot, index) {
      slot.classList.toggle('is-filled', index < items.length);
    });

    count.textContent = items.length + ' of ' + MAX_ITEMS + ' selected';
    note.hidden = items.length > 0;
    subtotal.textContent = money(total());
    submit.disabled = items.length === 0;

    list.textContent = '';
    items.forEach(function (item, index) {
      var row = document.createElement('li');
      row.className = 'bundle-panel__item';

      var img = document.createElement('img');
      img.src = item.image;
      img.alt = '';

      var name = document.createElement('span');
      name.className = 'bundle-panel__item-name';
      name.textContent = item.title + ' — ' + item.variant;

      var price = document.createElement('span');
      price.textContent = money(item.price);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'bundle-panel__item-remove';
      remove.textContent = 'Remove';
      remove.addEventListener('click', function () {
        items.splice(index, 1);
        render();
      });

      row.appendChild(img);
      row.appendChild(name);
      row.appendChild(price);
      row.appendChild(remove);
      list.appendChild(row);
    });

    renderRewards();
  }

  /* Add buttons on the product tiles */
  section.querySelectorAll('[data-bundle-add]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (items.length >= MAX_ITEMS) {
        note.hidden = false;
        note.textContent = 'Bundle full — remove something to swap it out.';
        return;
      }
      var product = readProduct(button);
      if (!product) return;
      items.push(product);
      render();
    });
  });

  /* Hand the bundle to the cart drawer */
  submit.addEventListener('click', function () {
    if (!items.length || !window.MunchiefCart) return;
    items.forEach(function (item) { window.MunchiefCart.add(item); });
    items = [];
    render();
    window.MunchiefCart.open();
  });

  /* Category filter — same `.filter-tabs` component as collection_grid */
  var tabs = section.querySelectorAll('.filter-tab');
  var groups = section.querySelectorAll('.bundle__group');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (other) {
        var isCurrent = other === tab;
        other.classList.toggle('is-active', isCurrent);
        other.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      groups.forEach(function (group) {
        group.hidden = tab.dataset.filter !== 'all' && group.dataset.category !== tab.dataset.filter;
      });
    });
  });

  render();
})();
