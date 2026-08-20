# Munchief port tooling

Scripts that move this static build into the Horizon theme at
`D:/Github/munchief`. They were written during the port and kept here so the
work is reproducible — paths are absolute at the top of each file, change
them if either repo moves.

Run them from anywhere with `python tools/munchief-port/<script>.py`.

| Script | What it does |
|---|---|
| `scope_css.py` | Rewrites a stylesheet under a `.munchief` wrapper so it can't collide with Horizon's own class names. Used as a library by the two build scripts. |
| `build_munchief.py` | Full first-time port: CSS, JS, blocks and sections. **Do not re-run** — the theme's Liquid has been hand-fixed since and this would overwrite it. Kept as the record of how the port was generated. |
| `rebuild_css.py` | Safe to re-run. Regenerates only `assets/munchief-*.css` from this repo's stylesheets, re-appending the hand-written tails (see below). |
| `port_original_animations.py` | Regenerates `assets/munchief-animations.js` from `js/animations.js`, applying the eight adaptations needed to run inside a live theme. Calls `speed_and_safety.py` itself. |
| `speed_and_safety.py` | The adaptations that aren't a clean one-line diff: retimed constants, reveal safety net, start-at-top, the rAF-driven chaos scrub. |
| `copy_images.py` | Re-encodes the home page art to WebP and copies it into the theme's `assets/`. 31MB of source PNGs became 1.5MB. |
| `test_scrub.js` | Node harness that exercises the chaos-banner scrub against a stub DOM — proves the loop tracks scroll position, composes with the existing transform, and idles off screen. `node test_scrub.js`. |

## Two traps worth knowing before you touch `scope_css.py`

1. **A comment above an at-rule is part of that rule's prelude.** A naive
   rewrite turns `/* … */ @media (min-width: 641px)` into
   `.munchief @media (min-width: 641px)`, which browsers drop silently. The
   first pass did exactly that and cost 25 media queries and all four
   keyframe animations — the wave drift, the ticker, the marquee, and every
   responsive breakpoint. The scoper now strips comments before deciding what
   kind of block it is looking at.

2. **Hand-written rules live outside the generated files.** Anything not in
   this repo's stylesheets goes in `munchief/.munchief-backup/<stem>-extra.css`
   and is re-appended by `rebuild_css.py`; `munchief-base.css` has its tail
   inline in that script. Otherwise a regeneration drops them.

See `munchief/MUNCHIEF-HANDOFF.md` for the full picture of what is in the
theme and what is left to do.
