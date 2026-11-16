# Luminara Visual QA

Date: 2026-11-16

## Comparison target

- Colour reference: `D:/14488/Pictures/设计.library/images/MW6M8G7I1IFHD.info/搜索结果页面.webp`
- Editorial source asset: `assets/editorial-two-doves-white.webp`
- Implementation: `http://127.0.0.1:4180/`
- Desktop implementation capture: `../../outputs/photo-system-round/desktop-top.png`
- Desktop catalogue capture: `../../outputs/photo-system-round/desktop-vitrine.png`
- Mobile implementation capture: `../../outputs/photo-system-round/mobile-top.png`
- Mobile catalogue capture: `../../outputs/photo-system-round/mobile-vitrine.png`

The current direction is an original warm-gallery editorial system. The reference was used only to establish a quieter warm-grey field, product-on-surface contrast and editorial pacing. No reference photography, layout, copy or brand assets were copied.

## Normalization

- Source photograph: `1329 x 1668` px, portrait.
- Desktop implementation: `1440 x 900` CSS px at device scale factor `1`.
- Mobile implementation: `390 x 844` CSS px at device scale factor `2`.
- Compared in the page's settled state at the `#film` anchor with lazy images loaded.

## Required fidelity surfaces

### Fonts and typography

- The high-contrast display serif is reserved for statements and product names; uppercase sans labels carry navigation, specifications and controls.
- Desktop navigation measures `11.5px` and tablet/mobile navigation `11px`, both at a stronger weight and darker ink than the previous version.
- Heading, body, label and caption levels remain distinct on white without relying on boxes or heavy rules.

### Spacing and layout

- All primary sections resolve to the warm page colour `#E2E2E2`.
- The former three-video strip is replaced by one still-life composition with a large image field and a restrained product-information column.
- The product catalogue uses consistent `4:5` plates, warm `#EFEFED` fields and borderless cut-outs.
- Navigation is fully transparent over the opening image. After the opening image it becomes a light translucent warm-grey blur so labels remain legible over editorial photography.
- Desktop navigation, section headings and product content share a stable left/right editorial grid; mobile collapses to a natural single column without horizontal overflow.

### Colors and tokens

- Page background: `#E2E2E2`.
- Product and image frames: `#EFEFED`.
- Text: near-black ink and warm graphite.
- The palette otherwise comes from the supplied jewellery photography.
- Dividers use low-opacity ink rather than grey filled panels.
- Image frames have no outline or border.

### Image quality and assets

- The supplied photograph is preserved at native portrait composition and encoded as a `1329 x 1668` WebP asset.
- The page uses a deliberate central editorial crop. The product, flower, stone drop and reflective metal detail remain sharp with no halos, stretching or synthetic replacement.
- Seven catalogue products are real cut-outs on matching white backgrounds.

### Copy and content

- The still-life copy describes materials, form and styling rather than narrating the photograph.
- `Two Doves` is positioned as a balanced open-collar form with mirrored bird motifs, zircon detailing and a yellow-glass drop.
- The black-and-white model section and the repeated three-card curation explanation were removed.
- The remaining brand statement now has one editorial purpose: old-soul character, clear silhouette and tactile material.
- Unsupported appointments, commissions, stockists, archive and payment-method claims were removed from the footer.
- Pricing is explicitly shown in US dollars and remains within the established `US$35–58` range.

### Responsiveness and interaction

- Checked at `1440 x 900`, `1024 x 768`, `820 x 1180`, `768 x 1024`, `390 x 844` and `320 x 760`: no horizontal overflow.
- All seven product plates measure the same aspect ratio at every checked width.
- Product filtering, hover response, product drawer and bag action work with no browser console errors.
- On GitHub Pages, API requests resolve to the Render backend; local and Render-hosted copies continue using same-origin routes.

## Comparison history

### Pass 1 — white gallery

- Finding: `[P2]` The off-screen toast retained a few visible black pixels at the bottom edge of mobile and desktop captures.
- Fix: changed the hidden state to explicit `visibility:hidden` with a transform that clears the viewport; restored visibility only while the toast is active.
- Post-fix evidence: `final-desktop-top.png`, `final-mobile-top.png`, `final-desktop-still.png` and `final-mobile-still.png`.
- Post-fix behavior: toast is hidden on load, visible after adding a piece to the bag, and hidden again after its timed dismissal.

### Pass 2 — warm gallery

- Removed the black-and-white model section and its navigation entry.
- Matched page and product surfaces to the supplied warm-grey reference.
- Removed all image-frame borders.
- Deleted repeated curation cards, unsupported service links and unverified payment badges.
- Rebalanced the statement, closing CTA and footer into the lighter editorial system.
- Corrected currency presentation to explicit `US$`.

## Checks

- `node ../layout-photo-system.mjs`: passed at six viewports; no overflow and all product plates use one `0.8` ratio.
- `node ../audit-photo-system.mjs`: passed; all seven product images load and no console errors occur.
- `node ../check-motion-ui.mjs`: passed; filtering, hover, drawer and Motion interactions settle correctly.
- Public GitHub Pages check: no 404 requests; catalogue, quote, order and contact requests reach the Render API.
- No JavaScript or console errors were recorded.

## Follow-up polish

- Future content additions should preserve the warm-grey field, transparent opening navigation, restrained palette and product-first image treatment.

final result: passed
