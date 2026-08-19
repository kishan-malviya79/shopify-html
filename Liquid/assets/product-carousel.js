/*
  product_carousel — prev/next arrows scroll the track by one card width.
  Imported page-wise by sections/product_carousel.liquid (defer), once per
  page no matter how many instances the page renders: the initialiser walks
  every .product-carousel on the page and binds each instance separately.
  Instances using nav_style = "cta" have no arrow buttons, so they no-op.
*/
(function () {
  var GAP = 32; /* var(--space-8) */

  function initCarousel(section) {
    if (section.dataset.carouselReady === 'true') return;
    section.dataset.carouselReady = 'true';

    var track = section.querySelector('[data-carousel-track]');
    var prev = section.querySelector('[data-carousel-prev]');
    var next = section.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    function scrollByCard(direction) {
      var card = track.querySelector('.product-card');
      if (!card) return;
      track.scrollBy({
        left: direction * (card.getBoundingClientRect().width + GAP),
        behavior: 'smooth'
      });
    }

    prev.addEventListener('click', function () { scrollByCard(-1); });
    next.addEventListener('click', function () { scrollByCard(1); });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.product-carousel').forEach(initCarousel);
  }

  initAll();

  /* Theme editor: re-bind when a section is added or re-rendered. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
