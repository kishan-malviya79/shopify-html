# shopify-html

Static HTML/CSS build-out of page sections that will later be hand-converted into Shopify Liquid sections/blocks. This file is the standing spec for how every section in this repo must be built — follow it for all work here, not just when restated.

## Project structure

```
/sections/<section-name>.html   one file per section, section-based markup (see "Section file format")
/css/tokens.css                 design tokens: color, type, spacing, radius, shadow, etc. as CSS custom properties
/css/components.css             reusable component classes (buttons, cards, badges, grids, etc.) shared across sections
/css/sections/<section-name>.css  section-specific overrides only — anything reusable belongs in components.css instead
/assets/dummy/                  placeholder images/videos used until real assets are wired up in Shopify
/section-list.md                registry of every implemented section — check this BEFORE starting a new page
/blocks-list.md                 registry of every implemented block — check this BEFORE building a new one, reuse HTML+CSS where possible
/index.html                     home page preview — stitches implemented sections together in on-page order (see rule 8)
```

## Rules for every section

1. **Section-based HTML.** Each page section lives in its own file/block, clearly commented, with real spacing between sections — no dense unbroken markup.
2. **CSS as a component system.** Don't write one-off styles per section if the pattern already exists. Continuously refactor `components.css` so patterns stay reused and condensed rather than duplicated per section.
3. **Liquid-conversion comments.** Every section file must open with a comment block stating:
   - the proposed Shopify **section name** (snake_case, matches future `sections/<name>.liquid`)
   - the **settings to export** from the section schema (field name, type, default) — e.g. `heading (text)`, `image (image_picker)`, `cta_link (url)`
   - block settings too, if the section uses blocks
4. **Registries stay current.** After implementing a new section, update `section-list.md`. After implementing a new block, update `blocks-list.md`. Always check both files first before starting new work, to reuse instead of rebuild.
5. **Design tokens.** Any repeated value that's really a design-system value (font family, font size/weight, color, spacing, radius, shadow, breakpoints, etc.) must be standardized as a CSS custom property in `css/tokens.css`, not hardcoded inline or per-component.
6. **Responsive variants.** When multiple responsive variants of a section are supplied (mobile/tablet/desktop comps), merge them into one CSS ruleset per component/section using breakpoints — don't create separate parallel files per breakpoint.
7. **Assets.** No real images/videos in this repo. Use dummy/placeholder assets from `assets/dummy/`, and expose the asset as a section/block setting in the comment header (per rule 3) so it becomes an `image_picker`/`video` setting in Liquid. If it's unclear whether something should be a dummy asset vs. a setting, ask.
8. **Home page (`index.html`).** When a section is meant to appear on the home page, add it to `index.html` by copying its markup from the `/sections` file into `<body>` (in on-page order) and linking its `css/sections/<name>.css` file in `<head>` alongside the existing ones — don't `<iframe>` or otherwise reference the section file directly. Asset paths in `index.html` are root-relative (`assets/...`, `css/...`), not `../`-prefixed like the standalone section files.

## Section file comment header format

```html
<!--
  Section: <shopify-section-name>
  Settings:
    - heading (text) — default: "..."
    - image (image_picker)
    - cta_text (text), cta_link (url)
  Blocks:
    - block type "<block_name>": <settings...>
-->
```
