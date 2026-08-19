# Liquid theme blocks

Shopify **theme blocks** (`blocks/*.liquid`) converted from the home-page
(`index.html`) static markup. Each file is standalone: markup + its own
`{% schema %}`, addressed by filename (`product_card.liquid` = block type
`product_card`).

Drop this folder in at the theme root as `blocks/` — theme blocks live at
`blocks/`, not `sections/blocks/`.

| File | Home-page section | Notes |
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

## Conversion notes

- **CSS is unchanged.** Every class matches `css/components.css` and
  `css/sections/*.css` as-is, so styling ports 1:1. The one addition made
  during conversion: `.flavor-quiz__character--flip` in
  `css/sections/flavor-quiz.css`, backing the decor block's `flip` setting.
- **Star ratings** are inlined in `product_card` and `testimonial` rather
  than shared. If more blocks need them, lift the 5-star loop into
  `snippets/rating-stars.liquid` and `{% render %}` it.
- **`{{ block.shopify_attributes }}`** is on every block's root element so
  theme-editor selection works. Where a block emits two roots
  (`quiz_*_result`), it sits on the option button — the visible one.
- **Sections are not converted here** — only blocks, per the request. The
  parent sections still live as static markup in `/sections/*.html`; each
  file's comment header lists the section-level settings to carry over.
- **Line items and cart recommendations are not blocks** — they come from
  `cart.items` and the `recommendations` product_list.
