# Luminara Visual QA

Date: 2026-11-14  
Reference: supplied Pearl Hour necklace photograph and the Luminara editorial photography brief  
Implementation: static Pearl Hour hero, object study, eight-product Cabinet

## Comparison

- The hero uses the supplied Pearl Hour product photograph without changing the product design, count or visible material.
- Desktop keeps the necklace as the largest visual field while headline and purchase information sit in a separate gallery-paper column.
- Mobile retains the same product crop and places type in a protected lower gradient so the clock face and pearl-tone drops remain visible.
- Product imagery now uses one 4:5 output ratio and a common saturation, contrast and crop treatment.
- The homepage has no video element, timer, playback control or corner caption.
- Colour is limited to gallery paper, near-black, graphite and the colours already present in the jewellery.

## Checks

- 1440×900, 1024×768, 820×1180, 768×1024, 390×844 and 320×760: no horizontal overflow.
- First-screen purchase action remains visible at every checked width.
- Pearl Hour drawer opens with materials and styling copy.
- Pearl Hour can be added to the bag.
- Necklace filter returns two products.
- Catalogue contains eight products.
- Render quote API returns USD 80 delivered for one Pearl Hour to the United States.
- No browser console errors or broken images.
- GitHub Pages cross-origin quote request returns HTTP 200.

## Open Issues

- Render's free web-service plan can still sleep when idle. The public frontend is now static on GitHub Pages and warms the API in the background, so browsing does not wait for Render.
- No image-generation model was available in the environment. No synthetic model, scene or replacement product was represented as an actual Luminara photograph.

final result: passed
