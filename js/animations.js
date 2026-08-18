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
     Brand story "intro" row ("Crunch it. Sip it. Repeat." + hero photo):
     on scroll into view, the heading slides in from off-screen left and
     the photo slides in from off-screen right, both converging on their
     normal resting position (the photo's own resting rotate(1.85deg) is
     untouched — gsap's x/y are a separate transform component from the
     CSS transform already on the element, so they compose instead of
     replacing it). Scroll-triggered rather than on-load since this row is
     well below the fold (7th section on the home page).
     -------------------------------------------------------------------- */
  function animateBrandStoryIntro() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.brand-story__row--intro').forEach(function (row) {
      var heading = row.querySelector('.brand-story__heading');
      var photo = row.querySelector('.brand-story__photo');
      if (!heading && !photo) return;

      var tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 80%' }
      });

      if (heading) {
        gsap.set(heading, { x: '-15vw', opacity: 0 });
        tl.to(heading, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);
      }
      if (photo) {
        gsap.set(photo, { x: '15vw', opacity: 0 });
        tl.to(photo, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.1);
      }
    });
  }

  /* --------------------------------------------------------------------
     Brand story "about" row (character photo, subheading, body copy, CTA
     pair): reveals one piece at a time, scroll-triggered since the row
     sits below the fold. Unlike the generic fade-up-stagger below, the
     four pieces here aren't direct siblings (heading/text/CTA are nested
     inside .brand-story__content alongside the photo), so this targets
     them explicitly instead of relying on childNodes order.
     -------------------------------------------------------------------- */
  function animateBrandStoryAbout() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.brand-story__row--about').forEach(function (row) {
      var items = [
        row.querySelector('.brand-story__characters'),
        row.querySelector('.brand-story__subheading'),
        row.querySelector('.brand-story__text'),
        row.querySelector('.btn-group')
      ].filter(Boolean);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 30 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: row, start: 'top 85%' }
      });
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
     Chaos banner background parallax: the photo drifts top-to-bottom,
     scrubbed to how far the section has scrolled through the viewport
     (top bottom -> bottom top covers the section's whole time on screen,
     so this is already "live" right on load if the section starts in
     view, and keeps tracking as the visitor scrolls). The img is sized
     30% taller than its box in CSS (chaos-banner.css) so this travel
     never reveals an edge past the section's own overflow: hidden crop.
     -------------------------------------------------------------------- */
  function animateChaosBannerBackground() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.chaos-banner__media img').forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.chaos-banner'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
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
     Mouse-parallax hover: while the cursor is over `container`, each
     entry's element drifts toward the cursor (higher strength = more
     drift, so entries read as sitting at slightly different depths),
     springing back to rest on mouseleave. gsap.quickTo instead of gsap.to
     since this fires on every mousemove and needs to be cheap. Shared by
     the hero side images, the footer's two cloud-photo bubbles, and the
     flavor quiz's three character cutouts. `entries` is an array of
     { el, strength }; entries with no el (or a falsy el) are skipped, so
     callers can pass a fixed-shape array even when an element is missing.
     -------------------------------------------------------------------- */
  function initParallaxHover(container, entries) {
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var movers = entries.filter(function (entry) {
      return entry && entry.el;
    }).map(function (entry) {
      return {
        x: gsap.quickTo(entry.el, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(entry.el, 'y', { duration: 0.6, ease: 'power3.out' }),
        strength: entry.strength
      };
    });
    if (!movers.length) return;

    container.addEventListener('mousemove', function (e) {
      var rect = container.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;

      movers.forEach(function (mover) {
        mover.x(relX * mover.strength);
        mover.y(relY * mover.strength * 0.6);
      });
    });

    container.addEventListener('mouseleave', function () {
      movers.forEach(function (mover) {
        mover.x(0);
        mover.y(0);
      });
    });
  }

  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    initParallaxHover(hero, [
      { el: hero.querySelector('.hero__side--left'), strength: 26 },
      { el: hero.querySelector('.hero__side--right'), strength: 16 }
    ]);
  }

  /* --------------------------------------------------------------------
     Footer bubble parallax: same mechanic as the hero, applied to the two
     cloud-photo callouts (.footer__bubble--left/--right) — see
     initParallaxHover above. Smaller strengths since the bubbles are much
     smaller than the hero's side images.
     -------------------------------------------------------------------- */
  function initFooterBubbleParallax() {
    var footerHero = document.querySelector('.footer__hero');
    if (!footerHero) return;
    initParallaxHover(footerHero, [
      { el: footerHero.querySelector('.footer__bubble--left'), strength: 18 },
      { el: footerHero.querySelector('.footer__bubble--right'), strength: 14 }
    ]);
  }

  /* --------------------------------------------------------------------
     Flavor quiz character parallax: same mechanic as the hero, applied to
     the three decorative cutouts bleeding off the section's edges (see
     initParallaxHover above). tl is the largest/closest cutout so it gets
     the most drift; tr and bl are smaller and sit further back.
     -------------------------------------------------------------------- */
  function initFlavorQuizParallax() {
    var quiz = document.querySelector('.flavor-quiz');
    if (!quiz) return;
    initParallaxHover(quiz, [
      { el: quiz.querySelector('.flavor-quiz__character--tl'), strength: 22 },
      { el: quiz.querySelector('.flavor-quiz__character--tr'), strength: 16 },
      { el: quiz.querySelector('.flavor-quiz__character--bl'), strength: 14 }
    ]);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    animateHeroHeading();
    animateHeroSideImages();
    animateBrandStoryIntro();
    animateBrandStoryAbout();
    animateOnScroll();
    animateChaosFooterTransition();
    animateChaosBannerBackground();
    animateFooterHeading();
    initShopBtnGroupHover();
    initHeroParallax();
    initFooterBubbleParallax();
    initFlavorQuizParallax();
  });
})();
