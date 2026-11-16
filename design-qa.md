# Luminara Visual QA

Date: 2026-11-16

## Comparison target

- Source visual truth: `C:/Users/14488/Desktop/20261116-125029.png`
- Published source asset: `assets/editorial-two-doves-white.webp`
- Implementation: `http://127.0.0.1:4180/`
- Desktop implementation capture: `../outputs/white-editorial/final-desktop-still.png`
- Mobile implementation capture: `../outputs/white-editorial/final-mobile-still.png`
- Full-view comparison: `../outputs/white-editorial/design-qa-comparison-desktop.png`
- Focused product comparison: `../outputs/white-editorial/design-qa-comparison-still-focus.png`

The visual direction is an original white-gallery editorial system. David Webb was used only to study the broad principles of generous space, restrained navigation, isolated product presentation and editorial pacing. No layout, photography, type files or brand assets were copied.

## Normalization

- Source photograph: `1329 x 1668` px, portrait.
- Desktop implementation: `1440 x 900` CSS px at device scale factor `1`; screenshot `1440 x 900` px.
- Mobile implementation: `390 x 844` CSS px at device scale factor `2`; screenshot `780 x 1688` px.
- Focused still image: `933 x 761` CSS px at device scale factor `1`.
- The full-view comparison was normalized to one white canvas. The focused comparison uses a source crop matching the implementation's central editorial crop, with both sides rendered at `933 x 761`.
- Compared in the page's settled state at the `#film` anchor with lazy images loaded.

## Required fidelity surfaces

### Fonts and typography

- The high-contrast display serif is reserved for statements and product names; uppercase sans labels carry navigation, specifications and controls.
- Desktop navigation measures `11.5px` and tablet/mobile navigation `11px`, both at a stronger weight and darker ink than the previous version.
- Heading, body, label and caption levels remain distinct on white without relying on boxes or heavy rules.

### Spacing and layout

- All primary sections now resolve to `rgb(255, 255, 255)`.
- The former three-video strip is replaced by one still-life composition with a large image field and a restrained product-information column.
- The product catalogue uses consistent `4:5` plates, quiet white space and borderless cut-outs.
- Desktop navigation, section headings and product content share a stable left/right editorial grid; mobile collapses to a natural single column without horizontal overflow.

### Colors and tokens

- Palette is limited to white, near-black ink, warm graphite and the colours already present in the jewellery.
- Dividers use low-opacity ink rather than grey filled panels.
- The light interface does not flatten the supplied dark botanical photograph; its greens, warm whites and silver highlights remain intact.

### Image quality and assets

- The supplied photograph is preserved at native portrait composition and encoded as a `1329 x 1668` WebP asset.
- The page uses a deliberate central editorial crop. The product, flower, stone drop and reflective metal detail remain sharp with no halos, stretching or synthetic replacement.
- Seven catalogue products are real cut-outs on matching white backgrounds.

### Copy and content

- The still-life copy describes materials, form and styling rather than narrating the photograph.
- `Two Doves` is positioned as a balanced open-collar form with mirrored bird motifs, zircon detailing and a yellow-glass drop.
- Pricing remains in US dollars and within the established `US$35–58` range.

### Responsiveness and interaction

- Checked at `1440 x 900`, `1024 x 768`, `820 x 1180`, `768 x 1024`, `390 x 844` and `320 x 760`: no horizontal overflow.
- All seven product plates measure the same aspect ratio at every checked width.
- Product filtering, hover response, product drawer and bag action work with no browser console errors.

## Comparison history

### Pass 1

- Finding: `[P2]` The off-screen toast retained a few visible black pixels at the bottom edge of mobile and desktop captures.
- Fix: changed the hidden state to explicit `visibility:hidden` with a transform that clears the viewport; restored visibility only while the toast is active.
- Post-fix evidence: `final-desktop-top.png`, `final-mobile-top.png`, `final-desktop-still.png` and `final-mobile-still.png`.
- Post-fix behavior: toast is hidden on load, visible after adding a piece to the bag, and hidden again after its timed dismissal.

### Pass 2

- No actionable P0, P1 or P2 visual differences remain.
- Full-view composition, focused product crop, white-section audit, typography, spacing, imagery, content and responsive states were checked again after the fix.

## Checks

- `node ../check-white-editorial.mjs`: passed at four viewports; every primary section is white, video count is `0`, navigation is legible and the Two Doves drawer opens correctly.
- `node ../layout-photo-system.mjs`: passed at six viewports; no overflow and all product plates use one `0.8` ratio.
- `node ../audit-photo-system.mjs`: passed; all seven product images load and no console errors occur.
- `node ../check-motion-ui.mjs`: passed; filtering, hover, drawer and Motion interactions settle correctly.
- Direct toast-state check: hidden on load, visible while active, hidden after dismissal.
- No JavaScript or console errors were recorded.

## Follow-up polish

- None required for handoff. Future content additions should preserve the same white-gallery spacing, restrained palette and product-first image treatment.

final result: passed
