/* ==========================================================================
   Header nav behaviour — shared by every page that renders the `header`
   section. Replaces the inline copy each page used to carry, now that the
   nav items open full-bleed mega-menu panels and need a page scrim too.

   CSS already opens a panel on :hover / :focus-within; this adds:
     - click-to-toggle, so a click pins a panel open (and touch works)
     - .has-menu-open on .site-header, which fades in .site-header__scrim
     - close on outside click and on Escape (focus returns to the trigger)
   ========================================================================== */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  if (!header) return;

  var items = header.querySelectorAll('.site-header__nav-item');

  function syncScrim() {
    var open = header.querySelector('.site-header__nav-item.is-open');
    header.classList.toggle('has-menu-open', !!open);
  }

  function closeAll() {
    items.forEach(function (item) {
      item.classList.remove('is-open');
      var trigger = item.querySelector('.site-header__nav-link');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
    syncScrim();
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('.site-header__nav-link');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasOpen = item.classList.contains('is-open');
      closeAll();
      if (!wasOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      syncScrim();
    });
  });

  /* Clicks inside a panel (a real nav link) shouldn't close it early — the
     navigation itself takes over. Everything else outside closes. */
  header.querySelectorAll('.site-header__menu').forEach(function (menu) {
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  document.addEventListener('click', closeAll);

  /* Mobile hamburger sheet — separate from the desktop mega menus (they
     never render at the same width). Locks page scroll while open. */
  var burger = header.querySelector('[data-mobile-menu-toggle]');
  var sheet = header.querySelector('.site-header__mobile-menu');

  function setMobileMenu(open) {
    header.classList.toggle('has-mobile-menu', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger && sheet) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      setMobileMenu(!header.classList.contains('has-mobile-menu'));
    });

    /* Taps inside the sheet shouldn't close it — following a link navigates
       away, which resets everything anyway. */
    sheet.addEventListener('click', function (e) { e.stopPropagation(); });

    document.addEventListener('click', function () { setMobileMenu(false); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    if (header.classList.contains('has-mobile-menu')) {
      setMobileMenu(false);
      if (burger) burger.focus();
      return;
    }

    var open = header.querySelector('.site-header__nav-item.is-open');
    if (!open) return;
    var trigger = open.querySelector('.site-header__nav-link');
    closeAll();
    if (trigger) trigger.focus();
  });
})();
