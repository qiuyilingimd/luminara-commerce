# Luminara Visual QA

Date: 2026-11-14
Reference: emotion-agency entrance interaction, supplied Pearl Hour necklace photograph, Pinterest jewellery staging references and the Luminara photography brief
Implementation: product threshold entry, restaged Pearl Hour hero, Act 04 jewellery theatre, eight-product Cabinet

## Comparison

- The entrance borrows the reference's full-screen brand threshold and sound/silence decision, while replacing its empty colour field with an actual Pearl Hour product scene.
- Pearl Hour is separated from its source photograph and placed on a new velvet stage. Product shape, asymmetrical line, clock face and drop count remain unchanged.
- Desktop keeps the necklace as the largest visual field while headline and purchase information sit in a separate gallery-paper column.
- Mobile places the extracted product above the type so the clock face and pearl-tone drops remain visible.
- Product imagery now uses one 4:5 output ratio and a common saturation, contrast and crop treatment.
- The homepage has no video element, timer, playback control or corner caption.
- Colour is limited to gallery paper, near-black, graphite and the colours already present in the jewellery.
- Act 04 uses four extracted product layers on a newly built dark stone stage; each object moves at a different speed on scroll and the light follows the pointer.

## Checks

- 1440×900, 1024×768, 820×1180, 768×1024, 390×844 and 320×760: no horizontal overflow.
- First-screen purchase action remains visible at every checked width.
- At 320×760 the threshold buttons remain fully inside the viewport.
- Pearl Hour drawer opens with materials and styling copy.
- Pearl Hour can be added to the bag.
- Necklace filter returns two products.
- Catalogue contains eight products.
- Render quote API returns USD 80 delivered for one Pearl Hour to the United States.
- No browser console errors or broken images.
- GitHub Pages cross-origin quote request returns HTTP 200.
- Intro focus is contained on its first action; the rest of the site is inert until entry.
- Choosing silence leaves the sound control off; choosing sound enables the ambient score.
- Session storage prevents the entrance from blocking repeat navigation during the same browsing session.
- Throttled 4G measurement: LCP 0.76 s, DOMContentLoaded 0.99 s, 460 KB total transfer.

## Open Issues

- Render's free web-service plan can still sleep when idle. The public frontend is now static on GitHub Pages and warms the API in the background, so browsing does not wait for Render.
- Product cut-outs were produced from the client's supplied product photographs. No replacement product design or synthetic model was represented as an actual Luminara photograph.
- The stone set is an abstract generated texture; no product or scene from a reference brand is published as site content.

final result: passed
