# Liquid theme blocks

Shopify **theme blocks** (`blocks/*.liquid`) converted from the home-page
(`index.html`) and product-page (`sections/product-main.html`) static
markup. Each file is standalone: markup + its own
`{% schema %}`, addressed by filename (`product_card.liquid` = block type
`product_card`).

Drop this folder in at the theme root as `blocks/` — theme blocks live at
`blocks/`, not `sections/blocks/`. See `../README.md` for how the sections
render them and for the CSS/JS loading rules.

| File | Section | Notes |
|---|---|---|
| `announcement_item.liquid` | `announcement_bar` | Ticker item + trailing sparkle. Section renders the loop 6x (1 real + 5 aria-hidden). |
| `nav_link.liquid` | `header` | Mega-menu disclosure; accepts nested `menu_card` blocks via `{% content_for 'blocks' %}`. Last link in `menu_links` is pushed to the panel bottom. |
| `menu_card.liquid` | `header` | Nested in `nav_link`; also reused by the mobile menu promo row. |
| `marquee_item.liquid` | `promo_marquee` | Same 6x-duplicate pattern as the announcement bar. |
| `product_card.liquid` | `product_carousel` | Real `product` reference — title/price/compare/image come from Shopify. |
| `world_card.liquid` | `world_grid` | Orange/cream background + white/outline heading variants. |
| `testimonial.liquid` | `testimonial_carousel` | |
| `quiz_character_result.liquid` | `flavor_quiz` | Emits the step-2 (crunch) option button **and** its hidden result-data node. |
| `quiz_soda_result.liquid` | `flavor_quiz` | Same shape, step-2 (sip) branch. |
| `quiz_intensity_option.liquid` | `flavor_quiz` | Cosmetic step, no effect on the match. |
| `quiz_character_decor.liquid` | `flavor_quiz` | Decorative cutouts; render inside `.flavor-quiz__characters`. |
| `footer_column.liquid` | `footer` | Static build's label/url pairs become one `link_list` menu picker. |
| `reward_milestone.liquid` | `cart_drawer` | Carries `data-threshold` + `data-message` for `js/cart.js`. |
| `gallery_image.liquid` | `product_main` | One PDP thumbnail; carries `data-image` for the viewer swap. Static block (`gallery-1`…`gallery-4`) — `product-main.js` marks the first one active, since a block can't know its own index. |
| `variant_option.liquid` | `product_main` | Weight/size pill. Matches a variant id (entered as text — there is no `product_variant` setting type) against `closest.product`; the two text fields are the fallback. Static block (`variant-1`, `variant-2`). |
| `trust_badge.liquid` | `product_main` | Icon + label in the buy box's reassurance row. Static block (`trust-1`…`trust-4`). |
| `feature_badge.liquid` | `product_story` | Icon + label in the 6-up trust row; `highlight` swaps in the filled-red circle. Static block (`story-badge-1`…`story-badge-6`). |
| `review.liquid` | `product_reviews` | Repeatable — the grid is one container. |
| `faq_item.liquid` | `faq_section` | Repeatable; backs both the compact PDP layout and the standalone FAQ page. |
| `collection_group.liquid` | `collection_grid` | One category row of the Shop All page. Nests `product_card` blocks via `{% content_for 'blocks' %}` (like `nav_link` → `menu_card`), and renders its own filter tab from `filter_label`/`filter_key`, so a group and its tab live and die together. A `collection` setting overrides the nested cards. |

## Conversion notes

- **Blocks reuse CSS, they never ship it.** No block loads a stylesheet:
  the shared component classes come from `assets/components.css`, loaded
  once in `layout/theme.liquid`. Section-specific CSS is loaded by the
  section itself.
- **Configurational CSS is per block.** `product_card`, `testimonial` and
  `world_card` render `id="block-{{ block.id }}"` plus a scoped
  `{% style %}` block, so product 1 can run one style and product 2 another
  inside the same section (background, border, media tint, title color,
  corner radius).
- **CSS class names are unchanged.** Everything matches
  `css/components.css` and `css/sections/*.css` as-is, so styling ports
  1:1. The one addition made during conversion:
  `.flavor-quiz__character--flip` in `css/sections/flavor-quiz.css`,
  backing the decor block's `flip` setting.
- **`collection_group` reuses `product_card` verbatim.** The Shop All tiles
  and the carousel tiles are the same block — only the container changes
  (a wrapping `.product-grid` here, a scrolling `.product-carousel__track`
  there), so nothing was forked to build the page.
- **Star ratings** are inlined in `product_card` and `testimonial` rather
  than shared. If more blocks need them, lift the 5-star loop into
  `snippets/rating-stars.liquid` and `{% render %}` it.
- **`{{ block.shopify_attributes }}`** is on every block's root element so
  theme-editor selection works. Where a block emits two roots
  (`quiz_*_result`), it sits on the option button — the visible one.
- **Sections live in `../sections/`.** Each one lists which block types it
  accepts and where it places them.
- **`product_story` reuses `testimonial` as-is.** The static build tagged
  those cards with an extra `.product-story__card` modifier; the Liquid
  section CSS targets `.product-story__reviews-track .testimonial-card`
  instead, so the block stays identical between `testimonial_carousel` and
  the PDP.
- **Richtext settings render inside a `<p>`.** Where a static `<p class=…>`
  became a `<div>` wrapping a richtext value (`product_main`'s description,
  `product_story`'s copy, `review`'s body, `combo_promo`'s description), the
  owning section's CSS resets that inner `<p>` — see the "Liquid build only"
  block at the end of each `assets/section-*.css`.
- **Line items and cart recommendations are not blocks** — they come from
  `cart.items` and the `recommendations` product_list.
