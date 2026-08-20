/*
  product_main — buy-box interactivity.
  Imported page-wise by sections/product_main.liquid (defer), once per page
  no matter how many instances render: the initialiser walks every
  .product-main on the page and binds each instance separately, guarding
  with a data-productMainReady flag so a re-render can't double-bind.

  Three behaviours, all from the static build (sections/product-main.html):
    1. thumbnail click swaps the big image
    2. variant pill click re-labels the Add to cart button with that pill's
       price and hands its variant id to the cart
    3. quantity stepper counts up/down, floor 1

  It also does two things the static markup did inline, because a theme
  block cannot know its own index: it marks the FIRST thumb active (and
  fills an empty viewer from it), and selects the first variant pill when
  no block set default_selected.
*/
(function () {
  function initGallery(section) {
    var mainImage = section.querySelector('[data-gallery-main]');
    var thumbs = section.querySelectorAll('[data-gallery-thumb]');
    if (!mainImage || !thumbs.length) return;

    /* No block knows it is first — pick the active thumb here. */
    var active = section.querySelector('[data-gallery-thumb].is-active');
    if (!active) {
      active = thumbs[0];
      active.classList.add('is-active');
    }

    /* Product with no featured image: fall back to the active thumb, so
       the viewer never renders blank beside a filled thumbnail rail. */
    if (!mainImage.getAttribute('src')) {
      mainImage.src = active.getAttribute('data-image') || '';
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        mainImage.src = thumb.getAttribute('data-image');
      });
    });
  }

  function initVariants(section) {
    var pills = section.querySelectorAll('.variant-pill');
    var label = section.querySelector('[data-add-to-cart-label]');
    if (!pills.length) return;

    /* Keep the button's own wording (and its translation) — only the price
       after the em dash is rewritten. */
    var prefix = label ? label.textContent.split('—')[0] : '';

    var selected = section.querySelector('.variant-pill.is-selected');
    if (!selected) {
      selected = pills[0];
      selected.classList.add('is-selected');
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-selected'); });
        pill.classList.add('is-selected');

        if (label) {
          label.textContent = prefix + '— ' + pill.getAttribute('data-variant-price');
        }

        /* The cart reads the chosen variant off the add-to-cart button. */
        var addButton = section.querySelector('[data-add-to-cart]');
        var variantId = pill.getAttribute('data-variant-id');
        if (addButton && variantId) {
          addButton.setAttribute('data-variant-id', variantId);
        }
      });
    });
  }

  function initQty(section) {
    var value = section.querySelector('[data-qty-value]');
    var down = section.querySelector('[data-qty-decrease]');
    var up = section.querySelector('[data-qty-increase]');
    if (!value || !down || !up) return;

    down.addEventListener('click', function () {
      value.textContent = Math.max(1, parseInt(value.textContent, 10) - 1);
    });
    up.addEventListener('click', function () {
      value.textContent = parseInt(value.textContent, 10) + 1;
    });
  }

  function initSection(section) {
    if (section.dataset.productMainReady === 'true') return;
    section.dataset.productMainReady = 'true';

    initGallery(section);
    initVariants(section);
    initQty(section);
  }

  function initAll(root) {
    (root || document).querySelectorAll('.product-main').forEach(initSection);
  }

  initAll();

  /* Theme editor: re-bind when a section is added or re-rendered. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
