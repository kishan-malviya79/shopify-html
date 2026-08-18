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

  document.addEventListener('DOMContentLoaded', function () {
    animateHeroHeading();
    animateOnScroll();
    animateChaosFooterTransition();
    animateFooterHeading();
  });
})();
