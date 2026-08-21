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
  templates/  index.json (home), product.json + product.pink.json (PDP),
              page.shop-all.json + collection.json (Shop All / collections)
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

## Product page (`templates/product.json`)

| Order | Section | File |
|---|---|---|
| 1 | product_main | `sections/product_main.liquid` |
| 2 | product_story | `sections/product_story.liquid` |
| 3 | product_photo_banner | `sections/product_photo_banner.liquid` |
| 4 | product_reviews | `sections/product_reviews.liquid` |
| 5 | combo_promo | `sections/combo_promo.liquid` |
| 6 | faq_section (`layout: compact`) | `sections/faq_section.liquid` |
| 7 | product_carousel — "Meet the Rest of the Family" | `sections/product_carousel.liquid` (4th instance of the same file) |
| 8 | chaos_banner | `sections/chaos_banner.liquid` |

`templates/product.pink.json` is the same template with every section's
`color_scheme` set to `pink` — the alternate-template stand-in for the
static build's `sections/product-main-pink.html`. Assign it per product in
the admin.

One `faq_section.liquid` backs both FAQ layouts: `layout: compact` is the
PDP block, `layout: page` is the standalone FAQ page (breadcrumb + stroked
page title, note moved under the photo). Same markup, same blocks, one
extra setting — not a second file.

## Shop All page (`templates/page.shop-all.json`)

| Order | Section | File |
|---|---|---|
| — | announcement_bar | `sections/announcement_bar.liquid` (header group) |
| — | header | `sections/header.liquid` (header group) |
| 1 | collection_grid | `sections/collection_grid.liquid` |
| 2 | chaos_banner | `sections/chaos_banner.liquid` |
| — | footer | `sections/footer.liquid` (footer group) |

Assign the template to a Shopify page with the handle `shop-all` (Admin →
Pages → Theme template → `shop-all`); the header's "Shop All" links point
at `/pages/shop-all`.

`collection_grid` runs in two modes off one `product_source` setting:

- `blocks` (the Shop All page) — one `collection_group` block per category
  row, each nesting the `product_card` blocks the carousel already uses.
  Every group renders its own filter tab, so adding or deleting a group
  adds or deletes its tab and no dead filters are possible. The section
  owns only the leading "All" tab.
- `collection` — the tabs and group headings are dropped and the grid
  renders straight from `collection.products`, with the page title and
  breadcrumb falling back to `collection.title`.
- `auto` (what `templates/collection.json` runs) — one collection template
  serves every collection *and* `/collections/all`, Shopify's virtual
  all-products listing, which is the store's Shop All URL. That listing has
  no admin record, so `collection.id` is nil; the section keys off that and
  renders the designed groups there, real products everywhere else. The
  template carries both configurations at once and the URL picks.

`collection_group` is the second block that nests other blocks (after
`nav_link` → `menu_card`); it can also take a `collection` of its own,
which then overrides its nested cards the same way `product_carousel`'s
collection setting does.

### Color schemes

Every PDP section carries a `color_scheme` select. Picking `pink` renders
the `theme-pink` class from `assets/tokens.css` on that section's root;
that class only *re-points color tokens*, so the pink PDP costs no
duplicated section CSS.

Because of that, each of those sections emits its color pickers **only on
the default scheme** — a hardcoded `background-color` in the scoped
`{% style %}` block would win over the class and the pink page would come
out cream. A section is driven by the scheme or by the pickers, never both.

### Blocks in more than one container

`{% content_for 'blocks' %}` can only be called once per section, so
`product_main` (gallery / variant pills / trust badges) and `product_story`
(testimonials / feature badges) place their blocks as **static blocks by
id**, the same way `flavor_quiz` does. The ids are declared in
`templates/product.json`; adding e.g. a 5th gallery thumb means one more
`{% content_for "block", ... %}` line in the section plus one more entry in
the template. `product_reviews` and `faq_section` fill one container each,
so they use the repeatable single-call form.

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
| `product-main.js` | `sections/product_main.liquid` |
| `combo-promo.js` | `sections/combo_promo.liquid` |
| `faq.js` | `sections/faq_section.liquid` |
| `collection-grid.js` | `sections/collection_grid.liquid` |

## Blocks

Theme blocks live in `blocks/` — see `blocks/README.md` for the full map.
Sections render them three ways:

1. `{% content_for 'blocks' %}` — all blocks into one container
   (`product_carousel`, `world_grid`, `testimonial_carousel`, `footer`,
   `cart_drawer`, `header`'s desktop nav, `product_reviews`, `faq_section`,
   `collection_grid` — whose `collection_group` blocks each call it again
   for their own `product_card` tiles).
2. `{% content_for "block", type: "...", id: "..." %}` — **static** blocks,
   used where one section places different block types in different
   containers: `flavor_quiz` (decor, crunch results, sip results, intensity
   options), `header`'s two mobile promo cards, `product_main` (gallery
   thumbs, variant pills, trust badges) and `product_story` (testimonials,
   feature badges).
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
