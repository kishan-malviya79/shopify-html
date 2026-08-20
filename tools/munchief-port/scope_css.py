# -*- coding: utf-8 -*-
"""
Namespace a stylesheet under a wrapper class so it cannot collide with the
host theme's own generic class names (.btn, .container, .price, ...).

Walks the sheet block by block:
  - :root            -> .munchief
  - every selector   -> ".munchief " + selector  (per comma-separated part)
  - @media/@supports -> recurse into the body
  - @keyframes/@font-face/@import -> left untouched
  - html/body selectors -> mapped onto the wrapper instead of dropped
"""
import io
import re
import sys

WRAP = '.munchief'
AT_PASSTHROUGH = ('@keyframes', '@-webkit-keyframes', '@font-face', '@import',
                  '@charset', '@namespace', '@property', '@page')
AT_RECURSE = ('@media', '@supports', '@layer', '@container')


def split_top_level(css):
    """Yield (kind, payload) chunks: ('text', str) or ('rule', (prelude, body))."""
    out = []
    i = 0
    n = len(css)
    start = 0
    while i < n:
        ch = css[i]
        if ch == '/' and i + 1 < n and css[i + 1] == '*':
            end = css.find('*/', i + 2)
            i = n if end == -1 else end + 2
            continue
        if ch in '"\'':
            quote = ch
            i += 1
            while i < n and css[i] != quote:
                i += 2 if css[i] == '\\' else 1
            i += 1
            continue
        if ch == ';':
            out.append(('text', css[start:i + 1]))
            i += 1
            start = i
            continue
        if ch == '{':
            prelude = css[start:i]
            depth = 1
            j = i + 1
            while j < n and depth:
                c = css[j]
                if c == '/' and j + 1 < n and css[j + 1] == '*':
                    end = css.find('*/', j + 2)
                    j = n if end == -1 else end + 2
                    continue
                if c in '"\'':
                    quote = c
                    j += 1
                    while j < n and css[j] != quote:
                        j += 2 if css[j] == '\\' else 1
                    j += 1
                    continue
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
                j += 1
            body = css[i + 1:j - 1]
            out.append(('rule', (prelude, body)))
            i = j
            start = i
            continue
        i += 1
    if start < n:
        out.append(('text', css[start:]))
    return out


def scope_selector(selector):
    sel = selector.strip()
    if not sel:
        return sel
    if sel.startswith('%') or sel.startswith('from') or sel.startswith('to'):
        return sel
    if sel == ':root' or sel == 'html' or sel == 'body' or sel == 'html, body':
        return WRAP
    # :root.theme-pink style compound -> .munchief.theme-pink
    if sel.startswith(':root'):
        return WRAP + sel[len(':root'):]
    if sel.startswith('html ') or sel.startswith('body '):
        return WRAP + ' ' + sel.split(' ', 1)[1]
    if sel.startswith(WRAP):
        return sel
    return WRAP + ' ' + sel


def scope_prelude(prelude):
    parts = []
    for part in re.split(r',(?![^(]*\))', prelude):
        parts.append(scope_selector(part))
    return ',\n'.join(parts)


def scope(css):
    out = []
    for kind, payload in split_top_level(css):
        if kind == 'text':
            out.append(payload)
            continue
        prelude, body = payload
        # A comment sitting above the rule is part of the prelude text — take
        # it out before deciding what kind of block this is, or an at-rule
        # with a comment above it gets treated as a selector and mangled into
        # `.munchief @media ...`, which browsers drop on the floor.
        comments = re.findall(r'/\*.*?\*/', prelude, flags=re.S)
        stripped = re.sub(r'/\*.*?\*/', '', prelude, flags=re.S).strip()
        lowered = stripped.lower()
        lead = ''.join(c + '\n' for c in comments)
        if lowered.startswith(AT_PASSTHROUGH):
            out.append(lead + stripped + ' {' + body + '}')
        elif lowered.startswith(AT_RECURSE):
            out.append(lead + stripped + ' {' + scope(body) + '}')
        else:
            leading = prelude[:len(prelude) - len(prelude.lstrip())]
            out.append(leading + lead + scope_prelude(stripped) + ' {' + body + '}')
    return ''.join(out)


def convert(src, dst, header):
    css = io.open(src, encoding='utf-8').read()
    io.open(dst, 'w', encoding='utf-8').write(header + scope(css))
    return dst


if __name__ == '__main__':
    print(scope(io.open(sys.argv[1], encoding='utf-8').read())[:2000])
