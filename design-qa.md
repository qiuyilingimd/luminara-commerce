# Luminara Visual QA

Date: 2026-11-16

## Comparison target

- Colour reference: `D:/14488/Pictures/设计.library/images/MW6M8G7I1IFHD.info/搜索结果页面.webp`
- Editorial source asset: `assets/editorial-two-doves-white.webp`
- Implementation: `http://127.0.0.1:4175/`
- Desktop implementation capture: `../../outputs/storefront-audit-2026-11-16/desktop-01.png`
- Desktop catalogue capture: `../../outputs/storefront-audit-2026-11-16/desktop-04.png`
- Mobile implementation capture: `../../outputs/storefront-audit-2026-11-16/mobile-01.png`
- Mobile catalogue capture: `../../outputs/storefront-audit-2026-11-16/mobile-04.png`
- Desktop detail interaction: `../../outputs/interactive-storefront-1440-detail.png`
- Mobile detail interaction: `../../outputs/interactive-storefront-390-detail.png`

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

- The current editorial pass uses the warm paper field `#F5F1E8`, offset by
  near-black product photography and a deep petrol-blue accent.
- The former three-video strip is replaced by one still-life composition with a large image field and a restrained product-information column.
- The product catalogue keeps each original photograph intact on its black
  velvet or hand-held background. Plates alternate between 4:5 and 16:10 crops,
  with no borders or cut-out treatment.
- Navigation is fully transparent over the opening image. After the opening image it becomes a light translucent warm-grey blur so labels remain legible over editorial photography.
- Desktop navigation, section headings and product content share a stable left/right editorial grid; mobile collapses to a natural single column without horizontal overflow.

### Colors and tokens

- Current page background: `#F5F1E8`.
- Current highlight: `#FFF9EE`.
- Current accent: `#21454C`.
- Pale blue emphasis: `#B9D2CE`.
- Text: near-black ink and warm graphite.
- The palette otherwise comes from the supplied jewellery photography.
- Dividers use low-opacity ink rather than grey filled panels.
- Image frames have no outline or border.

### Image quality and assets

- The supplied photograph is preserved at native portrait composition and encoded as a `1329 x 1668` WebP asset.
- The page uses a deliberate central editorial crop. The product, flower, stone drop and reflective metal detail remain sharp with no halos, stretching or synthetic replacement.
- Six catalogue products retain their original photography, including black
  velvet, hand scale, surface texture and source lighting.
- The still-life image now has three accessible detail points for the wing structure, yellow drop and collar.

### Copy and content

- The still-life copy describes materials, form and styling rather than narrating the photograph.
- `Two Doves` is positioned as a balanced collar form with mirrored bird motifs, clear faceted detail and a yellow drop.
- The black-and-white model section and the repeated three-card curation explanation were removed.
- The former `THE CURATION NOTE` statement has been removed in full.
- Unsupported appointments, commissions, stockists, archive and payment-method claims were removed from the footer.
- Pricing is explicitly shown in US dollars and remains within the established `US$35–58` range.

### Responsiveness and interaction

- Checked at `1440 x 900`, `1024 x 768`, `820 x 1180`, `768 x 1024`, `390 x 844` and `320 x 760`: no horizontal overflow.
- Product plates now deliberately alternate between 4:5 and 16:10 crops while
  remaining responsive at every checked width.
- Product filtering, hover response, product drawer and bag action work with no browser console errors.
- The still-life detail markers move the camera toward the selected material or construction detail, update an `aria-live` note and can return to the full view.
- `Let the edit choose` scans the currently visible pieces and opens one product, including while a category filter is active.
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

### Pass 3 — interactive discovery

- Deleted the complete `THE CURATION NOTE` section and its statement-specific CSS/JavaScript.
- Added three product-specific detail points to the `Two Doves` still life. Desktop hover and mobile tap both reveal the same copy, with an explicit full-view reset.
- Added a playful random-selection control to the vitrine. It respects the active category and reduced-motion preference.
- Kept the page palette, borderless product plates, transparent hero navigation and US-dollar pricing unchanged.

## Checks

- `node ../layout-photo-system.mjs`: passed at six viewports; no overflow and all product plates use one `0.8` ratio.
- `node ../audit-photo-system.mjs`: passed before the product reduction; the
  final six-image catalogue is checked again after the warm editorial pass.
- `node ../check-motion-ui.mjs`: passed; filtering, hover, drawer and Motion interactions settle correctly.
- `node scripts/check-interactive-storefront.mjs`: passed on desktop and mobile; the removed statement is absent, all three detail points work, camera scale settles at `1.16`, reset returns to `1.001`, and random selection opens a product with no console errors.
- Reduced-motion mode keeps the detail copy and random selection functional while holding the image at `1.001` with no camera movement.
- Public GitHub Pages check: no 404 requests; catalogue, quote, order and contact requests reach the Render API.
- No JavaScript or console errors were recorded.

## Follow-up polish

- Future content additions should preserve the warm-ivory field, transparent
  opening navigation, restrained palette and product-first image treatment.

### Pass 4 — warm editorial cabinet

- Moved the page from cool warm-grey to warm ivory with oxblood and antique-gold
  accents.
- Added the “The bloom and the thorn.” hero narrative and removed all corner
  labels from the hero image.
- Rebuilt the point-of-view statement as an oversized asymmetric editorial
  spread.
- Removed `Morpho Nocturne` from the site, drawer data and backend catalogue so
  butterfly imagery no longer appears.
- Reduced the first product card from seven to six columns while preserving its
  offset editorial rhythm.
- Added the supplied blue-thorn worn-scale study in The House section.
- Updated closing and footer surfaces to oxblood and dark warm brown.

### Pass 5 — petrol-blue editorial transition

- Replaced the former oxblood interface colour with petrol blue `#21454C`.
- Rebuilt the belief and closing chapters as layered petrol fields rather than
  flat fills, retaining the warm ivory type and antique-gold details.
- Changed catalogue filters, links, focus states and product-detail markers to
  the same blue system.
- Moved the footer from warm brown-black to blue-black `#111F23` so the final
  page rhythm joins the supplied blue-hour photography.
- Kept the red, coral and turquoise colour inside the product photography
  unchanged so those jewellery details remain the focal points.

### Pass 6 — organic editorial rhythm

- Added a restrained shape system informed by the supplied asymmetric jewellery
  reference while keeping Luminara's photography, copy and page structure.
- Reshaped the belief portrait, Two Doves still life and worn-scale study into
  arched or stone-like openings with offset surrounding rules.
- Let the desktop Two Doves information column overlap the photographic field
  and use a curved filter path in the collection.
- Introduced three product-plate silhouettes across the six-piece edit instead
  of repeating one rounded card.
- Simplified the silhouette treatment on mobile so every product remains
  complete and easy to compare.
- Checked `1440 x 900`, `1024 x 768` and `390 x 844`: no horizontal overflow or
  console errors; filtering, product detail controls, random selection, bag and
  reduced-motion behaviour remain functional.

final result: passed
