/*
  combo_promo — the combo card's quantity stepper.
  Imported page-wise by sections/combo_promo.liquid (defer). It binds every
  .combo-promo on the page and guards with a data-comboPromoReady flag.

  Deliberately its own file and its own data-combo-qty-* attributes rather
  than reusing product-main.js: both sections render an identically-shaped
  .qty-stepper and sit on the same PDP, so shared attributes would make one
  script drive the other section's counter.
*/
(function () {
  function initSection(section) {
    if (section.dataset.comboPromoReady === 'true') return;
    section.dataset.comboPromoReady = 'true';

    var value = section.querySelector('[data-combo-qty-value]');
    var down = section.querySelector('[data-combo-qty-decrease]');
    var up = section.querySelector('[data-combo-qty-increase]');
    if (!value || !down || !up) return;

    down.addEventListener('click', function () {
      value.textContent = Math.max(1, parseInt(value.textContent, 10) - 1);
    });
    up.addEventListener('click', function () {
      value.textContent = parseInt(value.textContent, 10) + 1;
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.combo-promo').forEach(initSection);
  }

  initAll();

  /* Theme editor: re-bind when a section is added or re-rendered. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
