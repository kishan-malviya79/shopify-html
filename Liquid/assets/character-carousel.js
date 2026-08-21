/*
  character_carousel — prev/next scroll, same pattern as
  product-carousel.js / testimonial-carousel.js on this section's own track.
  The gap is read from the track's computed style rather than hardcoded, so
  the desktop (24px) and mobile (16px) steps both land on a card edge.
  Imported page-wise by sections/character_carousel.liquid (defer).
*/
(function () {
  function gapOf(track) {
    var gap = parseFloat(window.getComputedStyle(track).columnGap);
    return isNaN(gap) ? 24 : gap;
  }

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
        left: direction * (card.getBoundingClientRect().width + gapOf(track)),
        behavior: 'smooth'
      });
    }

    prev.addEventListener('click', function () { scrollByCard(-1); });
    next.addEventListener('click', function () { scrollByCard(1); });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.character-carousel').forEach(initCarousel);
  }

  initAll();

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
