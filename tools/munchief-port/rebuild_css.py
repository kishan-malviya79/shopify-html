# -*- coding: utf-8 -*-
"""
Regenerate only the CSS assets (the Liquid files have since been hand-fixed
and must not be rebuilt), then re-append the two hand-written blocks that
live at the end of munchief-base.css.

Why: the first scoping pass mangled every at-rule that had a comment above
it into `.munchief @media ...` / `.munchief @keyframes ...`, which browsers
drop — so 25 media queries and all four keyframe animations were missing.
That is what killed the footer/brand-story wave drift, the ticker and
marquee scroll, and every responsive rule.
"""
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scope_css import scope  # noqa: E402

SRC = 'd:/Github/shopify-html'
DST = 'D:/Github/munchief'

BANNER = ('/* Ported from the shopify-html static build. Namespaced under\n'
          '   .munchief so it cannot leak into Horizon\'s own components. */\n\n')

CSS_SOURCES = {
    'announcement-bar': 'announcement-bar',
    'header': 'header',
    'marquee': 'marquee',
    'product-carousel': 'product-carousel',
    'world-grid': 'world-grid',
    'brand-story': 'brand-story',
    'flavor-quiz': 'flavor-quiz',
    'testimonial-carousel': 'testimonials',
    'chaos-banner': 'chaos-banner',
    'footer': 'footer',
}

TAIL = '''

/* Theme block wrappers ------------------------------------------------------
   Shopify renders every theme block inside <div class="shopify-block">.
   That wrapper would become the grid/flex item, so rules like
   `.footer__columns > *` or `.product-carousel__track .product-card` stop
   describing the real card. `display: contents` removes the wrapper from
   layout while keeping the element in the DOM (the theme editor needs it
   for section-block selection).                                           */
.munchief .shopify-block {
  display: contents;
}

/* Host-theme collision resets ---------------------------------------------
   A handful of class names exist in both this design and Horizon's own
   base.css: .product-card, .product-card__link, .price, .product-grid.
   Namespacing under .munchief keeps our rules from leaking outward, but it
   does not stop the host's un-namespaced rules from applying inward — and
   any property the host sets that we don't declare still lands on our
   markup. The visible break: Horizon's

     .product-card__link { position: absolute; inset: 0; }

   pulled the card's media/title/price out of flow and stacked them on top
   of the Add to Cart button. These resets restore normal flow. Keep this
   block in sync if either side adds rules on a shared class name.        */
.munchief .product-card__link {
  position: static;
  inset: auto;
}

.munchief .product-card {
  position: relative;
  transition: none;
  transform: none;
}

.munchief .price {
  white-space: normal;
}

/* Shopify wraps a {% form %} in a real <form> element, which would become
   the flex item in .product-card's column — the variant select and the Add
   to Cart button need to stay siblings of the card's other rows.          */
.munchief .product-card > form {
  display: contents;
}
'''


# Hand-written rules that aren't in the static source live in
# .munchief-backup/<stem>-extra.css — outside assets/, since everything there
# is uploaded to the store — and are re-appended on every regeneration.
def extra_for(stem):
    path = os.path.join(DST, '.munchief-backup/%s-extra.css' % stem)
    return io.open(path, encoding='utf-8').read() if os.path.exists(path) else ''


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)


base = BANNER + scope(read(os.path.join(SRC, 'css/tokens.css')))
base += '\n\n' + scope(read(os.path.join(SRC, 'css/components.css')))
base += TAIL
write(os.path.join(DST, 'assets/munchief-base.css'), base)
print('rebuilt munchief-base.css (+ hand-written tail)')

for src_stem, dst_stem in CSS_SOURCES.items():
    css = BANNER + scope(read(os.path.join(SRC, 'css/sections/%s.css' % src_stem)))
    css += extra_for(dst_stem)
    write(os.path.join(DST, 'assets/munchief-%s.css' % dst_stem), css)
    print('rebuilt munchief-%s.css' % dst_stem)

# nothing should be left mangled
import glob
import re
bad = 0
for path in glob.glob(DST + '/assets/munchief-*.css'):
    for line in read(path).split('\n'):
        if re.match(r'\s*\.munchief\s+@', line):
            print('STILL MANGLED:', os.path.basename(path), line.strip()[:60])
            bad += 1
print('mangled at-rules remaining:', bad)
