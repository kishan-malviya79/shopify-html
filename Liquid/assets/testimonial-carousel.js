/*
  testimonial_carousel — same prev/next scroll pattern as
  product-carousel.js, on this section's own track/card class names.
  Imported page-wise by sections/testimonial_carousel.liquid (defer).
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
      var card = track.querySelector('.testimonial-card');
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
    (root || document).querySelectorAll('.testimonial-carousel').forEach(initCarousel);
  }

  initAll();

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
