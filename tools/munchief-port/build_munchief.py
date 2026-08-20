# -*- coding: utf-8 -*-
"""
Port the shopify-html home page (sections + blocks + CSS + JS) into the
Horizon theme at D:/Github/munchief.

Everything is prefixed `munchief-` and its CSS is namespaced under a
`.munchief` wrapper, so nothing collides with Horizon's own sections,
blocks, or generic class names (.btn, .container, .price, .badge...).
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scope_css import scope  # noqa: E402

SRC = 'd:/Github/shopify-html'
DST = 'D:/Github/munchief'

BANNER = ('/* Ported from the shopify-html static build. Namespaced under\n'
          '   .munchief so it cannot leak into Horizon\'s own components. */\n\n')

# block file stem in shopify-html  ->  block type/file stem in munchief
BLOCK_MAP = {
    'nav_link': 'munchief-nav-link',
    'menu_card': 'munchief-menu-card',
    'product_card': 'munchief-product-card',
    'world_card': 'munchief-world-card',
    'testimonial': 'munchief-testimonial',
    'footer_column': 'munchief-footer-column',
    'quiz_character_decor': 'munchief-quiz-decor',
    'quiz_character_result': 'munchief-quiz-character',
    'quiz_soda_result': 'munchief-quiz-soda',
    'quiz_intensity_option': 'munchief-quiz-intensity',
}

# section file stem in Liquid/sections -> (munchief stem, css asset stem, js asset or None)
SECTION_MAP = {
    'announcement_bar':     ('munchief-announcement-bar', 'announcement-bar', None),
    'header':               ('munchief-header',           'header',           'munchief-header.js'),
    'promo_marquee':        ('munchief-marquee',          'marquee',          None),
    'product_carousel':     ('munchief-product-carousel', 'product-carousel', 'munchief-carousel.js'),
    'world_grid':           ('munchief-world-grid',       'world-grid',       None),
    'brand_story':          ('munchief-brand-story',      'brand-story',      None),
    'flavor_quiz':          ('munchief-flavor-quiz',      'flavor-quiz',      'munchief-flavor-quiz.js'),
    'testimonial_carousel': ('munchief-testimonials',     'testimonials',     'munchief-testimonials.js'),
    'chaos_banner':         ('munchief-chaos-banner',     'chaos-banner',     None),
    'footer':               ('munchief-footer',           'footer',           None),
}

# section css source in shopify-html -> css asset stem above
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

JS_SOURCES = {
    'js/header.js': 'munchief-header.js',
    'Liquid/assets/product-carousel.js': 'munchief-carousel.js',
    'Liquid/assets/testimonial-carousel.js': 'munchief-testimonials.js',
    'Liquid/assets/flavor-quiz.js': 'munchief-flavor-quiz.js',
}


def read(path):
    return io.open(path, encoding='utf-8').read()


def write(path, text):
    io.open(path, 'w', encoding='utf-8', newline='\n').write(text)
    return path


def build_css():
    written = []
    base = BANNER + scope(read(os.path.join(SRC, 'css/tokens.css')))
    base += '\n\n' + scope(read(os.path.join(SRC, 'css/components.css')))
    written.append(write(os.path.join(DST, 'assets/munchief-base.css'), base))

    for src_stem, dst_stem in CSS_SOURCES.items():
        css = BANNER + scope(read(os.path.join(SRC, 'css/sections/%s.css' % src_stem)))
        written.append(write(os.path.join(DST, 'assets/munchief-%s.css' % dst_stem), css))
    return written


def build_js():
    written = []
    for src, dst in JS_SOURCES.items():
        written.append(write(os.path.join(DST, 'assets', dst), read(os.path.join(SRC, src))))
    return written


def rename_block_types(text):
    for old, new in BLOCK_MAP.items():
        text = text.replace('"type": "%s"' % old, '"type": "%s"' % new)
        text = text.replace('type: "%s"' % old, 'type: "%s"' % new)
        text = text.replace("type: '%s'" % old, "type: '%s'" % new)
    return text


def wrap_markup(text):
    """Wrap the section's markup (between the last {%- endstyle -%} / asset tag
    and {% schema %}) in <div class="munchief">, so the namespaced CSS applies."""
    schema_at = text.index('{% schema %}')
    head_end = text.rindex('{%- endstyle -%}') + len('{%- endstyle -%}')
    head, markup, tail = text[:head_end], text[head_end:schema_at], text[schema_at:]
    markup = markup.strip('\n')
    indented = '\n'.join(('  ' + line) if line.strip() else line for line in markup.split('\n'))
    return head + '\n\n<div class="munchief">\n' + indented + '\n</div>\n\n' + tail


def build_blocks():
    written = []
    for stem, new_stem in BLOCK_MAP.items():
        text = read(os.path.join(SRC, 'Liquid/blocks/%s.liquid' % stem))
        text = rename_block_types(text)
        written.append(write(os.path.join(DST, 'blocks/%s.liquid' % new_stem), text))
    return written


def build_sections():
    written = []
    for stem, (new_stem, css_stem, js_asset) in SECTION_MAP.items():
        text = read(os.path.join(SRC, 'Liquid/sections/%s.liquid' % stem))
        text = rename_block_types(text)

        # asset loading: fonts snippet + shared base + this section's own sheet
        loader = ('{' + "% render 'munchief-fonts' %" + '}\n'
                  + "{{ 'munchief-base.css' | asset_url | stylesheet_tag }}\n"
                  + "{{ 'munchief-" + css_stem + ".css' | asset_url | stylesheet_tag }}")
        text = re.sub(r"\{\{ 'section-[a-z-]+\.css' \| asset_url \| stylesheet_tag \}\}",
                      lambda m: loader, text, count=1)
        if loader not in text:  # section had no stylesheet tag (announcement bar, marquee)
            text = text.replace('{%- style -%}', loader + '\n\n{%- style -%}', 1)

        # page-wise JS
        js_tag = ''
        if js_asset:
            js_tag = '<script src="{{ \'' + js_asset + '\' | asset_url }}" defer></script>'
        text = re.sub(r"<script src=\"\{\{ '[a-z-]+\.js' \| asset_url \}\}\" defer></script>",
                      lambda m: js_tag, text, count=1)

        text = wrap_markup(text)
        written.append(write(os.path.join(DST, 'sections/%s.liquid' % new_stem), text))
    return written


if __name__ == '__main__':
    out = build_css() + build_js() + build_blocks() + build_sections()
    for path in out:
        print('wrote', os.path.relpath(path, DST))
    print(len(out), 'files')
