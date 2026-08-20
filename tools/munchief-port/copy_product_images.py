# -*- coding: utf-8 -*-
"""
Copy the product-page art into the Horizon theme's assets/.

Companion to copy_images.py (which did the home page). Only the two images
the PDP introduces are handled here — the gallery/testimonial/upsell art it
otherwise uses was already ported:

    Perfect.png   -> munchief-review-photo-1.webp   product_story testimonial 1
    favorite.png  -> munchief-characters.webp       product_story testimonial 2
    delicious.png -> munchief-story-photo.webp      product_story testimonial 3
    can-guava-chilli-lime.svg / pouch-chutney-pop.svg — combo + gallery

Safe to re-run: it only writes the two files below.
"""
import os

from PIL import Image

SRC = 'd:/Github/shopify-html/assets/dummy'
DST = 'D:/Github/munchief/assets'

# source -> (theme asset name, max width)
CONVERT = {
    # PDP gallery hero + the product shot the FAQ column reuses
    'chutney-pop.png': ('munchief-product-photo.webp', 900),
    # full-bleed wavy photo break; native 2172x724 (~3:1)
    'pop-bg.png':      ('munchief-photo-banner.webp', 2000),
}

for src_name, (dst_name, max_width) in CONVERT.items():
    src = os.path.join(SRC, src_name)
    dst = os.path.join(DST, dst_name)

    img = Image.open(src)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')
    if img.width > max_width:
        height = round(img.height * max_width / img.width)
        img = img.resize((max_width, height), Image.LANCZOS)
    img.save(dst, 'WEBP', quality=82, method=6)

    print('%-20s -> %-32s %5.2fMB -> %5.2fMB  %dx%d'
          % (src_name, dst_name, os.path.getsize(src) / 1e6,
             os.path.getsize(dst) / 1e6, img.width, img.height))
