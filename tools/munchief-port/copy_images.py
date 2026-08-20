# -*- coding: utf-8 -*-
"""
Copy the static build's home-page art into the Horizon theme's assets/.

PNGs are re-encoded to WebP (alpha kept) and capped in width — the raw
originals are ~31MB for the home page alone, which would blow the theme's
size budget. SVGs and the already-small WebP clouds are copied as-is.
"""
import io
import os
import shutil

from PIL import Image

SRC = 'd:/Github/shopify-html/assets/dummy'
DST = 'D:/Github/munchief/assets'

# source -> (theme asset name, max width)
CONVERT = {
    'CrunchWorld.png':      ('munchief-crunch-world.webp', 1600),
    'PREBIOTICWorld.png':   ('munchief-prebiotic-world.webp', 1600),
    'delicious.png':        ('munchief-story-photo.webp', 1400),
    'favorite.png':         ('munchief-characters.webp', 1600),
    'Perfect.png':          ('munchief-review-photo-1.webp', 1000),
    'faqbg.png':            ('munchief-quiz-bg.webp', 2000),
    'Boy-LT.png':           ('munchief-quiz-decor-tl.webp', 900),
    'Girl-RT.png':          ('munchief-quiz-decor-tr.webp', 900),
    'Girl_BL.png':          ('munchief-quiz-decor-bl.webp', 900),
    'chos-bg.png':          ('munchief-chaos-bg.webp', 2000),
}

COPY = {
    'logo.png':                  'munchief-logo.png',
    'footer-cloud-left.webp':    'munchief-footer-cloud-left.webp',
    'footer-cloud-right.webp':   'munchief-footer-cloud-right.webp',
    'can-guava-chilli-lime.svg': 'munchief-can-guava-chilli-lime.svg',
    'can-nimbu-jeera.svg':       'munchief-can-nimbu-jeera.svg',
    'can-jamun-jeera.svg':       'munchief-can-jamun-jeera.svg',
    'can-mixed-berry.svg':       'munchief-can-mixed-berry.svg',
    'pouch-chutney-pop.svg':     'munchief-pouch-chutney-pop.svg',
    'pouch-salt-pop.svg':        'munchief-pouch-salt-pop.svg',
    'pouch-noodle-blast.svg':    'munchief-pouch-noodle-blast.svg',
    'pouch-pickle-punch.svg':    'munchief-pouch-pickle-punch.svg',
    'pouch-popn-pani.svg':       'munchief-pouch-popn-pani.svg',
}

total_before = 0
total_after = 0

for src_name, (dst_name, max_width) in CONVERT.items():
    src = os.path.join(SRC, src_name)
    dst = os.path.join(DST, dst_name)
    total_before += os.path.getsize(src)

    img = Image.open(src)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')
    if img.width > max_width:
        height = round(img.height * max_width / img.width)
        img = img.resize((max_width, height), Image.LANCZOS)
    img.save(dst, 'WEBP', quality=82, method=6)

    total_after += os.path.getsize(dst)
    print('%-26s -> %-32s %5.1fMB -> %5.2fMB  %dpx'
          % (src_name, dst_name, os.path.getsize(src) / 1e6,
             os.path.getsize(dst) / 1e6, img.width))

for src_name, dst_name in COPY.items():
    src = os.path.join(SRC, src_name)
    dst = os.path.join(DST, dst_name)
    shutil.copyfile(src, dst)
    total_before += os.path.getsize(src)
    total_after += os.path.getsize(dst)
    print('%-26s -> %-32s copied' % (src_name, dst_name))

print('\ntotal %.1fMB -> %.2fMB' % (total_before / 1e6, total_after / 1e6))
