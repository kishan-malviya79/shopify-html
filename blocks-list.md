# Blocks List

Registry of reusable blocks/components so new sections can reuse existing HTML + CSS instead of rebuilding it. Includes both true Shopify blocks (repeatable block types within a section schema) and shared component classes from `css/components.css`.

| Block / component | Used in | Location | Notes |
|---|---|---|---|
| Pill button (`.btn--pill`) | `hero_banner` | css/components.css | Pill shape/sizing only — no color; compose with a skin class. |
| Icon-circle button (`.btn--icon-circle`) | `hero_banner` | css/components.css | Circular shape/sizing only — no color; compose with a skin class. |
| Primary button skin (`.btn--primary`) | `hero_banner` | css/components.css | Cream fill + navy-ink border/label (`--color-cream`, `--color-btn-ink`, `--border-width-btn`). Stacks with `.btn--pill` or `.btn--icon-circle` for shape, e.g. `class="btn btn--pill btn--primary"`. |
| Button group (`.btn-group`) | `hero_banner` | css/components.css | Flex row that pairs a primary pill CTA with a secondary icon button, wraps on small screens. |
| Marquee item (`marquee_item` block, `.marquee__item` + `.marquee__icon`) | `promo_marquee` | css/sections/marquee.css | Repeatable ticker text block; sparkle SVG divider renders after each item. Track is duplicated 2x in HTML and animated -50% via `@keyframes marquee-scroll` for a seamless CSS-only loop. |
| Stroked heading (`.stroke-heading`, `.stroke-heading--white`) | `hero_banner`, `world_grid` | css/components.css | Display-font headline, red fill + white outline stroke by default; add `--white` for a plain white fill (no stroke) on saturated backgrounds. Compose with a section class that sets font-size/line-height. |
| World card (`world_card` block, `.world-card` + `.world-card__media`) | `world_grid` | css/sections/world-grid.css | Repeatable rounded card block: heading top-left, supporting text bottom-left, image bleeding off the bottom-right corner (`object-fit: contain`, clipped by the card's `overflow: hidden`). `--orange`/`--cream` modifiers set the card skin. |

`marquee_item` (used in `promo_marquee`) is the first true Shopify block type (repeater content) implemented.
