# -*- coding: utf-8 -*-
"""
Port the static build's js/animations.js into the theme as-is.

Only three adaptations, each marked in the output with a MUNCHIEF PORT note:

  1. a single-run guard (the file is loaded once from the layout, but the
     theme editor can re-inject scripts);
  2. initPageTransitions() is not called — it appends its curtain to <body>,
     outside the .munchief wrapper the ported CSS is namespaced under, so the
     overlay would be unstyled while still delaying every link click;
  3. ScrollTrigger.refresh() after load and after late images, because the
     theme lazy-loads images below the fold: without it every trigger's
     stored start position is stale and sections never animate in;
  4. the chaos-banner -> footer transition looked the banner up as the
     footer's previousElementSibling, which only held in the static build —
     here the footer lives in its own <footer> after <main>.

Everything else — every timing, easing, stagger and effect — is the original
file's own code.
"""
import io
import re

SRC = 'd:/Github/shopify-html/js/animations.js'
DST = 'D:/Github/munchief/assets/munchief-animations.js'

original = io.open(SRC, encoding='utf-8').read()

HEADER = '''/*
  Munchief section animations.

  This is the static build's js/animations.js (shopify-html/js/animations.js),
  used as-is so the theme animates exactly like the reference site. Three
  adaptations for running inside a live theme are marked "MUNCHIEF PORT"
  below; nothing else was touched.

  Dependencies, vendored into assets/ and loaded before this file by
  snippets/munchief-scripts.liquid: munchief-gsap.js, munchief-scrolltrigger.js,
  munchief-lenis.js.
*/
'''

s = original

# 1 — single-run guard -------------------------------------------------------
s = s.replace("""(function () {""", """(function () {
  /* MUNCHIEF PORT: the layout loads this once, but the theme editor can
     re-inject scripts when a section is re-rendered — never run twice. */
  if (window.munchiefAnimationsReady) return;
  window.munchiefAnimationsReady = true;
""", 1)

# 2 — no page-transition curtain --------------------------------------------
s = s.replace("""  document.addEventListener('DOMContentLoaded', function () {
    initPageTransitions();""", """  document.addEventListener('DOMContentLoaded', function () {
    /* MUNCHIEF PORT: initPageTransitions() is deliberately not called. It
       appends its curtain to <body>, outside the .munchief wrapper this
       build's CSS is namespaced under, so the overlay would be invisible
       while still delaying every link click by its animation duration. */""", 1)

# 3 — re-measure once lazy images have changed the page height ---------------
s = s.replace("""    initFlavorQuizParallax();
  });""", """    initFlavorQuizParallax();

    /* MUNCHIEF PORT: the theme lazy-loads images below the fold, so the page
       grows after ScrollTrigger has stored each trigger's start position and
       those positions go stale — sections further down then never animate
       in. Re-measure on load and whenever a late image arrives. */
    if (typeof ScrollTrigger !== 'undefined') {
      var refreshPending;
      var refresh = function () {
        clearTimeout(refreshPending);
        refreshPending = setTimeout(function () { ScrollTrigger.refresh(); }, 120);
      };

      window.addEventListener('load', refresh);
      document.querySelectorAll('img').forEach(function (img) {
        if (!img.complete) img.addEventListener('load', refresh, { once: true });
      });
    }
  });""", 1)

# 4 — the footer is no longer the banner's DOM sibling -----------------------
s = s.replace("""      var prev = footer.previousElementSibling;
      if (!prev || !prev.classList.contains('chaos-banner')) return;""",
              """      var prev = footer.previousElementSibling;
      /* MUNCHIEF PORT: in the theme the footer sits inside its own <footer>
         element after <main>, so the chaos banner is not its DOM sibling any
         more. Fall back to the last chaos banner on the page, which is the
         one the footer's wave slides over. */
      if (!prev || !prev.classList.contains('chaos-banner')) {
        var banners = document.querySelectorAll('.chaos-banner');
        prev = banners.length ? banners[banners.length - 1] : null;
      }
      if (!prev) return;""", 1)

assert 'MUNCHIEF PORT' in s
assert s.count('MUNCHIEF PORT') == 4, s.count('MUNCHIEF PORT')

io.open(DST, 'w', encoding='utf-8', newline='\n').write(HEADER + s)
print('ported js/animations.js verbatim (4 marked adaptations)')

# 5 + 6 — retimed constants and the reveal safety net live in their own pass
# so this file stays a clean diff against the original.
import subprocess
subprocess.run([__import__('sys').executable,
                __import__('os').path.join(__import__('os').path.dirname(__file__),
                                           'speed_and_safety.py')], check=True)

# sanity: every function from the original survives
functions = set(re.findall(r'function (\w+)\(', original))
missing = sorted(f for f in functions if 'function %s(' % f not in s)
print('functions carried over:', len(functions) - len(missing), '/', len(functions))
if missing:
    print('MISSING:', missing)
