# Liquid build

Shopify theme files converted from the static build. Drop the folders in at
a theme root as-is (`assets/`, `blocks/`, `layout/`, `sections/`,
`templates/`) — the folder names already match Shopify's structure.

```
Liquid/
  assets/     tokens.css, components.css, section-*.css, page-wise JS
  blocks/     theme blocks (one file = one block type, own {% schema %})
  layout/     theme.liquid — global CSS/JS + header/footer groups + cart drawer
  sections/   one file per section + header-group.json / footer-group.json
  templates/  index.json — the home page, sections in on-page order
```

## Home page (`templates/index.json`)

| Order | Section | File |
|---|---|---|
| — | announcement_bar | `sections/announcement_bar.liquid` (header group) |
| — | header | `sections/header.liquid` (header group) |
| 1 | hero_banner | `sections/hero_banner.liquid` |
| 2 | promo_marquee | `sections/promo_marquee.liquid` |
| 3 | product_carousel — "Meet the Munchief Family" | `sections/product_carousel.liquid` |
| 4 | world_grid | `sections/world_grid.liquid` |
| 5 | product_carousel — "Munchief Sodas" | same file, second instance |
| 6 | brand_story | `sections/brand_story.liquid` |
| 7 | product_carousel — combo rail (`nav_style: cta`) | same file, third instance |
| 8 | flavor_quiz | `sections/flavor_quiz.liquid` |
| 9 | testimonial_carousel | `sections/testimonial_carousel.liquid` |
| 10 | chaos_banner | `sections/chaos_banner.liquid` |
| — | footer | `sections/footer.liquid` (footer group) |
| — | cart_drawer | `sections/cart_drawer.liquid` (rendered once in theme.liquid) |

One `product_carousel.liquid` file backs all three carousel instances — the
differences (heading, anchor, arrows vs CTA pair, heading font) are
settings, not separate files.

## CSS rules

- **Global, loaded once in `layout/theme.liquid`:** `tokens.css` (design
  tokens) and `components.css` (every reusable component class the blocks
  share — `.btn`, `.badge`, `.price`, `.rating`, `.select`, `.container`,
  `.stroke-heading`, `.product-card`, `.testimonial-card`, `.menu-card`,
  `.qty-stepper`, `.newsletter-form`).
- **Blocks reuse; they do not ship CSS.** A block file adds no stylesheet of
  its own — it uses the shared component classes and only overrides values
  per instance.
- **Sections load their own CSS, and only their own.** Each section does
  `{{ 'section-<name>.css' | asset_url | stylesheet_tag }}` at the top, so a
  page downloads CSS for the sections it actually renders and nothing else.
  Section-group CSS (header + announcement bar, footer) comes from those
  sections' own files the same way.

### Configurational CSS

Values that a merchant can change are emitted as scoped `{% style %}`
blocks, not hardcoded in the stylesheet:

- **Per section** — scoped to `#shopify-section-{{ section.id }}`: colors,
  padding, columns/cards-per-row, corner radius, alignment, scroll speed.
  Two instances of the same section can therefore look completely
  different.
- **Per block** — scoped to `#block-{{ block.id }}`: product 1 can run one
  style and product 2 another *inside the same section*. `product_card`,
  `testimonial` and `world_card` each carry their own background, border,
  media tint, title/text color and radius settings.

## JS rules

- Scripts are **imported page-wise** by the section that needs them, with
  `defer` — never bundled into one global file:
  `<script src="{{ '<name>.js' | asset_url }}" defer></script>`.
- Each script binds **every instance on the page** and guards with a
  `data-*Ready` flag, so three product carousels still load one file and
  bind three times, not three files.
- Every script also re-initialises on `shopify:section:load`, so the theme
  editor keeps working when a section is added or re-rendered.
- `animations.js` is the one global script (scroll/reveal behaviour shared
  by all pages) and loads in `theme.liquid`.

| Asset | Loaded by |
|---|---|
| `animations.js` | `layout/theme.liquid` (global) |
| `header.js` | `sections/header.liquid` |
| `cart.js` | `sections/cart_drawer.liquid` |
| `product-carousel.js` | `sections/product_carousel.liquid` |
| `testimonial-carousel.js` | `sections/testimonial_carousel.liquid` |
| `flavor-quiz.js` | `sections/flavor_quiz.liquid` |

## Blocks

Theme blocks live in `blocks/` — see `blocks/README.md` for the full map.
Sections render them three ways:

1. `{% content_for 'blocks' %}` — all blocks into one container
   (`product_carousel`, `world_grid`, `testimonial_carousel`, `footer`,
   `cart_drawer`, `header`'s desktop nav).
2. `{% content_for "block", type: "...", id: "..." %}` — **static** blocks,
   used where one section places different block types in different
   containers: `flavor_quiz` (decor, crunch results, sip results, intensity
   options) and `header`'s two mobile promo cards.
3. Local section blocks declared in the section's own schema —
   `announcement_bar` and `promo_marquee` only, because their item set has
   to render six times back-to-back for the ticker loop and
   `{% content_for 'blocks' %}` can only be called once.

## Still to wire up in Shopify

- **Images.** Every `<img>` is an `image_picker` setting and renders empty
  until an asset is chosen. The dummy art in `assets/dummy/` is not copied
  into the theme.
- **Products.** `product_card` takes a real `product`; `product_carousel`
  also accepts a `collection` (which then overrides its blocks);
  `cart_drawer` recommendations take a `product_list`.
- **Cart.** `cart.js` still drives a localStorage state object as the
  stand-in for the Cart AJAX API — swap those calls for `/cart/add.js` and
  `/cart/change.js`. Line items already render server-side from
  `cart.items`.
- **Fonts.** Google Fonts are linked in `theme.liquid` for parity with the
  static build; move them to theme font settings or self-hosted
  `@font-face` before launch.
