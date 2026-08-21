# -*- coding: utf-8 -*-
"""
Copy the About page's two new images into the Horizon theme's assets/.

Everything else the page needs already shipped with the home page port:

    CrunchWorld.png      -> munchief-crunch-world.webp      (world band 1)
    PREBIOTICWorld.png   -> munchief-prebiotic-world.webp   (world band 2)
    favorite.png         -> munchief-characters.webp        (character/collage)
    delicious.png        -> munchief-story-photo.webp       (character/collage,
                                                             our promise band)
    Perfect.png          -> munchief-review-photo-1.webp    (character/collage)

Only the hero sky photo and the manifesto packshot are new. Same encoding
rules as copy_images.py: PNG -> WebP with alpha kept, capped in width.

Safe to re-run.
"""
import os

from PIL import Image

SRC = 'd:/Github/shopify-html/assets/dummy'
DST = 'D:/Github/munchief/assets'

# source -> (theme asset name, max width)
CONVERT = {
    'Hero.png':        ('munchief-about-hero.webp', 2000),
    'chutney-pop.png': ('munchief-about-packshot.webp', 1400),
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

    print('%-20s -> %-32s %5.1fMB -> %5.2fMB  %dx%d'
          % (src_name, dst_name, os.path.getsize(src) / 1e6,
             os.path.getsize(dst) / 1e6, img.width, img.height))

print('\nAdd the printed dimensions to the size table in '
      'snippets/munchief-image.liquid.')
