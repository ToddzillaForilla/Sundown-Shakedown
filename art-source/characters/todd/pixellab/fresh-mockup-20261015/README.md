# Fresh Todd mockup — October 15, 2026

Retired Option A: Todd selected the retro Option B in `../retro-option-b-20261015/concept.png` as his approved master reference. This folder is historical source and must not be used as the base for the rebuild.

Todd requested a clean restart from his original reference photo, using PixelLab for substantial art work. This iteration starts with a mockup for approval; no animations are authorized until that design is approved.

The brief specifies recognizable photo likeness, natural adult proportions, black V-neck, dark jeans, black sneakers, colorful left forearm tattoo, bare wrists, and a hands-free fighting guard in detailed late-1990s arcade pixel art.

Reference provenance: user supplied `C:/Users/Todd/Pictures/19054920_1313183882052231_3825077483897746978_o.jpg` in this chat. `reference-original.jpg` is the preserved source; `reference-upload.png` is a proportional 1024px PNG for the Pro concept-image input. The photo is a likeness reference, not an existing sprite to rotate.

Generation: `/create-character-pro`, `method=create_from_concept`, side view, requested 168×168, mannequin template, transparent background, seed 151026. The MCP wrapper rejected 168px before submission because of its 128px cap; the official REST schema permits 32–168, and the direct Pro request was accepted. No fallback model was used.

- Character: `90989a91-68e7-460c-945d-5a67305c3368`
- Job: `e93c73c7-c052-4e69-8605-fd8b1f424eed`
- Creation receipt: `creation-receipt.json`
- Cost and acceptance status: `manifest.json`

Poll the existing character/job; do not resubmit it as a retry while processing. `node scripts/preview-todd-fresh-mockup.mjs` builds the review page and measured eight-direction contact sheet after the returned PNGs are saved here. This is source art, not runtime integration.

## Completed source review

The job completed after approximately 22 minutes and charged 25 subscription generations, confirmed by the job's `usage` and the balance change from 4,996 to 4,971. All eight transparent 168×168 originals are preserved without alignment or scale edits. No watch is visible and no opaque bounds touch a canvas edge. Silhouette heights are 101–106px and bottom insets vary 26–32px across directions; no animation continuity is implied by static views.

This is an artistic review candidate, not an approved animation base. The Pro result retained compact stylized proportions despite the natural seven-heads brief. The larger requested canvas did not increase the south-west silhouette beyond 105px. South-west/south-east show raised guards, while pure east/west lower their arms. Review face/likeness, proportions, tattoo fidelity and the chosen fighting pose before authorizing animation work. The request's pose/proportion wording is not a claim that the generated image satisfies it.

Preview generator syntax, generation, saved dimensions/alpha bounds and production build were checked. Gameplay was not changed or playtested for this source-only mockup.
