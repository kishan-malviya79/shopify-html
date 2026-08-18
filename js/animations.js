/* ==========================================================================
   GSAP-powered section animations, shared across every page.

   Requires gsap.min.js (+ ScrollTrigger.min.js for the scroll-reveal) to be
   loaded via CDN before this file — see the <script> tags in each page's
   <head>/body. Every "hidden" starting state is set here in JS, not in CSS,
   so a blocked/slow CDN just means "no animation", never invisible content.
   ========================================================================== */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* --------------------------------------------------------------------
     Smooth scroll (Lenis), driven off gsap.ticker so its raf loop stays
     in lockstep with every ScrollTrigger-based animation above/below —
     without this, scroll-triggered reveals can fire a frame or two out
     of sync with the eased scroll position. Skipped entirely (native
     scroll) if Lenis didn't load or the visitor prefers reduced motion.
     -------------------------------------------------------------------- */
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var lenis = new Lenis();

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* --------------------------------------------------------------------
     Splits a heading's text into one <span class="word-reveal__word">
     per word, keeping its authored <br> line breaks intact. Returns the
     word spans so the caller can animate them. Shared by the hero and
     footer heading reveals below.
     -------------------------------------------------------------------- */
  function splitIntoWords(heading) {
    var lines = heading.innerHTML.split(/<br\s*\/?>/i);
    heading.textContent = '';

    var words = [];
    lines.forEach(function (line, lineIndex) {
      if (lineIndex > 0) heading.appendChild(document.createElement('br'));
      line.trim().split(/\s+/).forEach(function (word) {
        if (!word) return;
        var span = document.createElement('span');
        span.className = 'word-reveal__word';
        span.textContent = word;
        heading.appendChild(span);
        heading.appendChild(document.createTextNode(' '));
        words.push(span);
      });
    });

    return words;
  }

  /* --------------------------------------------------------------------
     Hero heading: split into words, reveal one word at a time on load.
     -------------------------------------------------------------------- */
  function animateHeroHeading() {
    var heading = document.querySelector('.hero__heading');
    if (!heading) return;

    var words = splitIntoWords(heading);
    if (!words.length) return;

    gsap.set(words, { display: 'inline-block', opacity: 0, y: '0.6em' });

    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.12
    });

    var rest = document.querySelectorAll('.hero__text, .hero .btn-group');
    if (rest.length) {
      gsap.set(rest, { opacity: 0, y: 20 });
      tl.to(rest, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1
      }, '-=0.25');
    }
  }

  /* --------------------------------------------------------------------
     Hero side images: on load, left_image/right_image rise up from below
     into their resting spot (same anchor point CSS already gives them),
     fading in as they arrive. Runs alongside the heading's word reveal,
     not blocking it — both start together.
     -------------------------------------------------------------------- */
  function animateHeroSideImages() {
    var left = document.querySelector('.hero__side--left');
    var right = document.querySelector('.hero__side--right');
    if (!left && !right) return;

    var tl = gsap.timeline({ delay: 0.1 });

    if (left) {
      gsap.set(left, { y: 140, opacity: 0 });
      tl.to(left, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);
    }
    if (right) {
      gsap.set(right, { y: 140, opacity: 0 });
      tl.to(right, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.12);
    }
  }

  /* --------------------------------------------------------------------
     Footer heading ("More Munch / More Crunch"): same word-by-word
     reveal as the hero, but scroll-triggered (it's below the fold) and
     with a smaller, fixed pixel offset per word instead of an em-based
     one — at the footer heading's huge font size, 0.6em would be a
     100px+ jump per word.
     -------------------------------------------------------------------- */
  function animateFooterHeading() {
    if (typeof ScrollTrigger === 'undefined') return;

    var heading = document.querySelector('.footer__heading');
    if (!heading) return;

    var words = splitIntoWords(heading);
    if (!words.length) return;

    gsap.set(words, { display: 'inline-block', opacity: 0, y: 30 });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: heading, start: 'top 85%' }
    });
  }

  /* --------------------------------------------------------------------
     Generic scroll-reveal, opt-in per element via a data attribute:
       data-animate="fade-up"          fades/slides the element itself in
       data-animate="fade-up-stagger"  fades/slides its direct children in,
                                        staggered (use on a card grid/row)
       data-animate="word-reveal"      splits the heading's own text into
                                        words and reveals them one at a
                                        time, same mechanic as the hero/
                                        footer headings (see splitIntoWords
                                        above) — use on big display
                                        headings (.stroke-heading etc.)
     -------------------------------------------------------------------- */
  function animateOnScroll() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('[data-animate="fade-up"]').forEach(function (el) {
      gsap.set(el, { opacity: 0, y: 40 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    document.querySelectorAll('[data-animate="fade-up-stagger"]').forEach(function (group) {
      var items = Array.prototype.slice.call(group.children);
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 40 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 85%' }
      });
    });

    document.querySelectorAll('[data-animate="word-reveal"]').forEach(function (heading) {
      var words = splitIntoWords(heading);
      if (!words.length) return;

      var fontSize = parseFloat(getComputedStyle(heading).fontSize) || 32;
      var offset = Math.min(40, fontSize * 0.3);

      gsap.set(words, { display: 'inline-block', opacity: 0, y: offset });
      gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: heading, start: 'top 85%' }
      });
    });
  }

  /* --------------------------------------------------------------------
     Chaos banner -> footer transition: wherever a chaos_banner section
     sits directly above the footer, its content drifts upward slightly
     faster than the page scrolls (scrubbed to scroll position), so the
     footer's wavy top edge (footer.css's .footer::before, which already
     rises 108px into whatever precedes it) reads as sliding up and over
     the banner rather than the two sections just being stacked.
     -------------------------------------------------------------------- */
  function animateChaosFooterTransition() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.footer').forEach(function (footer) {
      var prev = footer.previousElementSibling;
      if (!prev || !prev.classList.contains('chaos-banner')) return;

      var content = prev.querySelector('.chaos-banner__content');
      if (!content) return;

      gsap.to(content, {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: prev,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* --------------------------------------------------------------------
     Shop-now button group (.btn-group pairing a .btn--pill with a
     .btn--icon-circle, e.g. the hero's "Shop Now" + arrow CTA): on hover,
     the pair swaps sides — the icon slides to the pill's spot on the left,
     the pill slides to the icon's spot on the right — and the icon fills
     solid (see .btn--icon-circle.is-swapped in components.css) to read as
     the now-active control. Springs back apart on mouseleave. Distances
     are measured per pair (not hardcoded) so it works regardless of label
     length. Applies to every btn-group with both a pill and an
     icon-circle, not just the hero, since that pairing is the shared
     component used across sections.
     -------------------------------------------------------------------- */
  function initShopBtnGroupHover() {
    document.querySelectorAll('.btn-group').forEach(function (group) {
      var pill = group.querySelector('.btn--pill');
      var icon = group.querySelector('.btn--icon-circle');
      if (!pill || !icon) return;

      var pillRect = pill.getBoundingClientRect();
      var iconRect = icon.getBoundingClientRect();
      var iconShift = pillRect.left - iconRect.left;
      var pillShift = iconRect.right - pillRect.right;

      var pillTween = gsap.to(pill, { x: pillShift, duration: 0.4, ease: 'power3.inOut', paused: true });
      var iconTween = gsap.to(icon, { x: iconShift, duration: 0.4, ease: 'power3.inOut', paused: true });

      group.addEventListener('mouseenter', function () {
        pillTween.play();
        iconTween.play();
        icon.classList.add('is-swapped');
      });
      group.addEventListener('mouseleave', function () {
        pillTween.reverse();
        iconTween.reverse();
        icon.classList.remove('is-swapped');
      });
    });
  }

  /* --------------------------------------------------------------------
     Hero side-image parallax: while the cursor is over the hero section,
     the left/right cutouts (.hero__side--left/--right) drift a little
     toward the cursor — left moves a touch more than right so the two
     read as sitting at slightly different depths — and spring back to
     rest on mouseleave. gsap.quickTo instead of gsap.to since this fires
     on every mousemove and needs to be cheap.
     -------------------------------------------------------------------- */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var left = hero.querySelector('.hero__side--left');
    var right = hero.querySelector('.hero__side--right');
    if (!left && !right) return;

    function quickMover(el, strength) {
      if (!el) return null;
      return {
        x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }),
        strength: strength
      };
    }

    var movers = [quickMover(left, 26), quickMover(right, 16)].filter(Boolean);

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;

      movers.forEach(function (mover) {
        mover.x(relX * mover.strength);
        mover.y(relY * mover.strength * 0.6);
      });
    });

    hero.addEventListener('mouseleave', function () {
      movers.forEach(function (mover) {
        mover.x(0);
        mover.y(0);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    animateHeroHeading();
    animateHeroSideImages();
    animateOnScroll();
    animateChaosFooterTransition();
    animateFooterHeading();
    initShopBtnGroupHover();
    initHeroParallax();
  });
})();
