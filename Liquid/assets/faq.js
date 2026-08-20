/*
  faq_section — accordion, one row open at a time.
  Imported page-wise by sections/faq_section.liquid (defer). It binds every
  .faq on the page (the PDP "compact" layout and the standalone "page"
  layout are the same section, so one script covers both) and guards with a
  data-faqReady flag.

  Clicking an open row closes it; clicking a closed row opens it and closes
  the rest. aria-expanded tracks the state on each trigger.
*/
(function () {
  function initSection(section) {
    if (section.dataset.faqReady === 'true') return;
    section.dataset.faqReady = 'true';

    var items = section.querySelectorAll('.accordion__item');

    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          other.classList.remove('is-open');
          var otherTrigger = other.querySelector('.accordion__trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        if (!wasOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.faq').forEach(initSection);
  }

  initAll();

  /* Theme editor: re-bind when a section is added or re-rendered. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
