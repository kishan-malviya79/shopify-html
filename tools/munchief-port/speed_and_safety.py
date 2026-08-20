# -*- coding: utf-8 -*-
"""
Two more adaptations for the ported animations.js:

5. Retimed. The static build's numbers were tuned for a standalone one-pager
   and read as sluggish in a live store — a long heading spent ~2.5s just on
   its per-character stagger. Durations and staggers are roughly halved and
   the triggers fire earlier.

6. A reveal safety net. Everything the module hides starts at opacity 0 and
   waits for a ScrollTrigger whose start position was measured up front. The
   theme lazy-loads images, so the page keeps growing while you scroll and
   those positions drift — the footer's hero stayed invisible even once it
   was on screen. An IntersectionObserver watches every hidden element and
   reveals anything that is actually visible but still transparent.

Applied by port_original_animations.py after its own four adaptations, so a
re-port keeps them.
"""
import io

DST = 'D:/Github/munchief/assets/munchief-animations.js'
s = io.open(DST, encoding='utf-8').read()


def once(old, new):
    global s
    assert s.count(old) == 1, '%r x%d' % (old[:60], s.count(old))
    s = s.replace(old, new)


# 5 — retimed ---------------------------------------------------------------
TIMINGS = [
    # hero heading chars + the copy/CTA that follow them
    ("var tl = gsap.timeline({ delay: 0.15 });\n    tl.to(chars, {\n      opacity: 1,\n      y: 0,\n      duration: 0.45,\n      ease: 'power3.out',\n      stagger: 0.045\n    });",
     "var tl = gsap.timeline({ delay: 0.05 });\n    tl.to(chars, {\n      opacity: 1,\n      y: 0,\n      duration: 0.3,\n      ease: 'power3.out',\n      stagger: 0.02\n    });"),
    ("      tl.to(rest, {\n        opacity: 1,\n        y: 0,\n        duration: 0.6,\n        ease: 'power3.out',\n        stagger: 0.1\n      }, '-=0.25');",
     "      tl.to(rest, {\n        opacity: 1,\n        y: 0,\n        duration: 0.4,\n        ease: 'power3.out',\n        stagger: 0.06\n      }, '-=0.2');"),
    # hero side art
    ("tl.to(left, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);",
     "tl.to(left, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0);"),
    ("tl.to(right, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.12);",
     "tl.to(right, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.08);"),
    # footer heading
    ("    gsap.to(chars, {\n      opacity: 1,\n      y: 0,\n      duration: 0.45,\n      ease: 'power3.out',\n      stagger: 0.06,\n      scrollTrigger: { trigger: heading, start: 'top 85%' }\n    });",
     "    gsap.to(chars, {\n      opacity: 1,\n      y: 0,\n      duration: 0.3,\n      ease: 'power3.out',\n      stagger: 0.02,\n      scrollTrigger: { trigger: heading, start: 'top 92%' }\n    });"),
    # brand story intro pair
    ("tl.to(heading, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);",
     "tl.to(heading, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0);"),
    ("tl.to(photo, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.1);",
     "tl.to(photo, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.08);"),
    # brand story about row
    ("      gsap.to(items, {\n        opacity: 1,\n        y: 0,\n        duration: 0.6,\n        ease: 'power3.out',\n        stagger: 0.15,\n        scrollTrigger: { trigger: row, start: 'top 85%' }\n      });",
     "      gsap.to(items, {\n        opacity: 1,\n        y: 0,\n        duration: 0.45,\n        ease: 'power3.out',\n        stagger: 0.08,\n        scrollTrigger: { trigger: row, start: 'top 92%' }\n      });"),
    # generic fade-up
    ("      gsap.to(el, {\n        opacity: 1,\n        y: 0,\n        duration: 0.8,\n        ease: 'power2.out',\n        scrollTrigger: { trigger: el, start: 'top 85%' }\n      });",
     "      gsap.to(el, {\n        opacity: 1,\n        y: 0,\n        duration: 0.45,\n        ease: 'power2.out',\n        scrollTrigger: { trigger: el, start: 'top 95%' }\n      });"),
    # generic stagger
    ("      gsap.to(items, {\n        opacity: 1,\n        y: 0,\n        duration: 0.7,\n        ease: 'power2.out',\n        stagger: 0.1,\n        scrollTrigger: { trigger: group, start: 'top 85%' }\n      });",
     "      gsap.to(items, {\n        opacity: 1,\n        y: 0,\n        duration: 0.45,\n        ease: 'power2.out',\n        stagger: 0.05,\n        scrollTrigger: { trigger: group, start: 'top 95%' }\n      });"),
    # section-title char reveal
    ("      gsap.to(chars, {\n        opacity: 1,\n        y: 0,\n        duration: 0.45,\n        ease: 'power3.out',\n        stagger: 0.06,\n        scrollTrigger: { trigger: heading, start: 'top 85%' }\n      });",
     "      gsap.to(chars, {\n        opacity: 1,\n        y: 0,\n        duration: 0.3,\n        ease: 'power3.out',\n        stagger: 0.02,\n        scrollTrigger: { trigger: heading, start: 'top 92%' }\n      });"),
]

for old, new in TIMINGS:
    once(old, new)

s = s.replace("""(function () {
  /* MUNCHIEF PORT: the layout loads this once""", """(function () {
  /* MUNCHIEF PORT: durations, staggers and trigger points below are tightened
     from the static build's. Those were tuned for a standalone one-pager and
     read as sluggish in a store — a long heading spent ~2.5s on its
     per-character stagger alone. Roughly halved throughout, and the triggers
     fire nearer the bottom of the viewport so content has settled by the time
     it is read. */

  /* MUNCHIEF PORT: the layout loads this once""", 1)

# 6 — reveal safety net ------------------------------------------------------
once("""    if (typeof ScrollTrigger !== 'undefined') {
      var refreshPending;""", """    revealStuck();

    if (typeof ScrollTrigger !== 'undefined') {
      var refreshPending;""")

once("""  document.addEventListener('DOMContentLoaded', function () {""", """  /* MUNCHIEF PORT: reveal safety net.

     Every animation above hides its target first and waits for a
     ScrollTrigger whose start position was measured when it was created. The
     theme lazy-loads images, so the page keeps growing as the visitor scrolls
     and those positions drift — the footer's hero stayed invisible even once
     it was fully on screen. This watches everything that starts hidden and
     shows anything that is genuinely visible but still transparent, so a
     mis-measured trigger can never cost the visitor the content. */
  function revealStuck() {
    if (typeof IntersectionObserver === 'undefined') return;

    var selectors = [
      '[data-animate]',
      '.word-reveal__char',
      '.hero__side',
      '.hero__text',
      '.hero .btn-group',
      '.brand-story__heading',
      '.brand-story__photo',
      '.brand-story__characters',
      '.brand-story__subheading',
      '.brand-story__text',
      '.brand-story .btn-group'
    ];

    var candidates = [];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
      candidates.push(el);
      Array.prototype.push.apply(candidates, el.children);
    });
    if (!candidates.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);

        /* Give the real animation a moment to run first — this only steps in
           when the element is on screen and still invisible. */
        setTimeout(function () {
          if (!el.isConnected) return;
          if (parseFloat(getComputedStyle(el).opacity) > 0.01) return;
          gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }, 400);
      });
    }, { threshold: 0 });

    candidates.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {""")

# 7 — always start at the top of the page ------------------------------------
once("""  document.addEventListener('DOMContentLoaded', function () {
    /* MUNCHIEF PORT: initPageTransitions()""", """  /* MUNCHIEF PORT: start at the top.

     Browsers restore the previous scroll offset on reload, and this page's
     height keeps changing as lazy images and the reveal animations resolve —
     so a restored offset lands somewhere in the middle, typically a couple of
     sections down. The static build never had this: every page was a fresh
     document that opened at the top.

     A real deep link (#reviews, #munchief-family) still wins; this only
     applies when there is no hash. */
  function startAtTop() {
    if (!document.querySelector('.munchief')) return;
    if (window.location.hash) return;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    function toTop() {
      if (window.location.hash) return;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }

    toTop();
    /* Late images and fonts shift the layout after first paint — hold the top
       until the page has actually finished loading. */
    window.addEventListener('load', toTop);
  }

  document.addEventListener('DOMContentLoaded', function () {
    startAtTop();

    /* MUNCHIEF PORT: initPageTransitions()""")

# 8 — chaos banner scrubs off ScrollTrigger ----------------------------------
once("""  function animateChaosFooterTransition() {""", """  /* MUNCHIEF PORT: the two chaos-banner scrubs are driven by a plain rAF
     scroll handler instead of ScrollTrigger's scrub. The values are the
     original's: the content drifts up 18% and the photo travels -10% -> +10%
     across the section's whole time on screen.

     ScrollTrigger stores its start/end positions when the tween is created,
     and this theme lazy-loads images, so the page height keeps changing while
     the visitor scrolls and the scrub silently stopped tracking. Reading the
     live rect every frame cannot go stale. */
  function initChaosScrollScrub() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var banners = Array.prototype.slice.call(document.querySelectorAll('.chaos-banner'));
    if (!banners.length) return;

    /* .chaos-banner__content is centred with transform: translateX(-50%) in
       CSS, so the drift has to compose with whatever transform is already
       there rather than replace it — GSAP parsed the existing transform for
       you; setting style.transform directly does not. */
    function baseTransform(el) {
      if (!el) return '';
      var current = getComputedStyle(el).transform;
      return (!current || current === 'none') ? '' : current + ' ';
    }

    var items = banners.map(function (banner) {
      var content = banner.querySelector('.chaos-banner__content');
      var image = banner.querySelector('.chaos-banner__media img');
      return {
        banner: banner,
        content: content,
        contentBase: baseTransform(content),
        image: image,
        imageBase: baseTransform(image)
      };
    });

    function update() {
      var viewport = window.innerHeight;

      items.forEach(function (item) {
        var rect = item.banner.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;

        /* 0 when the section's top meets the bottom of the viewport, 1 when
           its bottom leaves the top — the span the original scrubbed over. */
        var progress = (viewport - rect.top) / (rect.height + viewport);
        progress = Math.min(1, Math.max(0, progress));

        if (item.content) {
          item.content.style.transform =
            item.contentBase + 'translateY(' + (progress * -18).toFixed(2) + '%)';
        }
        if (item.image) {
          item.image.style.transform =
            item.imageBase + 'translateY(' + (progress * 20 - 10).toFixed(2) + '%)';
        }
      });
    }

    /* Driven by a rAF loop that runs only while a banner is on screen, rather
       than by scroll events. Smooth-scroll libraries, inertial touch scrolling
       and browser scroll anchoring all deliver scroll events on their own
       schedule (or, under a virtual scroller, not to window at all); a frame
       loop tracks whatever the page is actually doing. It idles completely
       once the section leaves the viewport. */
    var visible = 0;
    var running = false;

    function frame() {
      if (!visible) {
        running = false;
        return;
      }
      update();
      requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    if (typeof IntersectionObserver === 'undefined') {
      /* No observer: fall back to always running the loop. */
      visible = items.length;
      start();
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible += entry.isIntersecting ? 1 : -1;
        });
        visible = Math.max(0, visible);
        if (visible) start();
      }, { threshold: 0 });

      items.forEach(function (item) { observer.observe(item.banner); });
    }

    window.addEventListener('resize', update);
    update();
  }

  function animateChaosFooterTransition() {""")

# the two ScrollTrigger versions are superseded by the handler above
once("""    animateChaosFooterTransition();
    animateChaosBannerBackground();""", """    initChaosScrollScrub();""")

io.open(DST, 'w', encoding='utf-8', newline='\n').write(s)
print('retimed + safety net added (%d MUNCHIEF PORT notes)' % s.count('MUNCHIEF PORT'))
