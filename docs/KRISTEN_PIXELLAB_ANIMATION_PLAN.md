# Kristen retro animation rebuild

## Approved standing reference

Todd explicitly approved Kristen's final standing reference on October 15, 2026.

- Approved source: [concept.png](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/concept.png).
- Approval, source hash, provenance and exact outline patch: [manifest.json](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/manifest.json).
- [Side-by-side reference page](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/review.html).

Use this exact reference for subsequent Kristen animation work: recognizable adult face, black glasses, wavy brown hair, fitted green shirt, detailed blue bandana, charcoal short cargo shorts, gray-green hiking socks, brown boots and empty-handed screen-left guard. Preserve the approved leg proportions; the narrower-leg experiment was rejected.

Verified source geometry: transparent 256×256 canvas, 224px silhouette, hair top y28, boot baseline y251, 58 colors. Todd's approved reference is 236px tall with the same baseline, making Kristen about 5.1% shorter. The final cleanup darkened 27 existing edge pixels on the screen-right leg without changing alpha, silhouette or any other pixels. Keep the approved source unchanged; save future experiments separately.

This approval covers the standing reference. Kristen's scoped idle/walk source-art pilot is now generated and ready for review at [the pilot preview](../art-source/characters/kristen/pixellab/retro-animation-pilot-20261015/review.html). The manifest, prompts, job receipts, raw frames, and alignment records are preserved beside it. The 12-frame generation budget (5 idle frames and 9 walk frames, including each clip's reference frame) cost 12 generations; the recorded balance went from 4,781 to 4,769.

The idle holds the approved 224px silhouette height and y251 baseline with no clipping; small per-frame glasses-detail variation remains. The first walk playback read as moving away from Kristen's screen-left gaze, and reversing its frame order did not resolve the concern. A leftward walk retry was generated October 16 with an explicit screen-left heel plant and weight transfer. [Phone-friendly walk preview](../art-source/characters/kristen/pixellab/retro-animation-leftwalk-20261016/walk-phone-preview.gif). It uses 8 generations (balance 4,759.8 to 4,751.8); all nine raw generated frames are preserved, with review copies registered to y251 by whole-frame translations of at most 4px.

A second walk-only pass explicitly required both boots to point screen-left while stepping that way. [Phone-friendly preview](../art-source/characters/kristen/pixellab/retro-animation-toe-left-20261016/walk-phone-preview.gif) and [contact sheet](../art-source/characters/kristen/pixellab/retro-animation-toe-left-20261016/walk-toe-left-contact.png). It used 8 generations (balance 4,751.8 to 4,743.8); raw frames and review-only baseline-aligned copies are preserved. It still does not consistently turn both boots screen-left or read as a forward walk: several poses keep outward/front-facing boot angles and cross the legs. Both walk attempts remain unapproved and neither clip is integrated into runtime playback; the idle remains approved.

The October 16 attack batch used its full 16-generation allowance. The generated punch and kick both missed the requested screen-left direction. Todd selected PixelLab gallery item `gallery:1792158063158` as the current punch choice (nine 256×256 frames, 100ms each); it keeps Kristen facing screen-left and extends the far-side fist left. The earlier six-frame selection, `gallery:1792158337812`, remains available. Todd is preparing an alternative punch and will provide its gallery reference when ready. The local [attack review](../art-source/characters/kristen/pixellab/retro-attack-direction-corrected-20261016/review.html) records these choices and preserves the rejected generated punch and kick. The current punch is source-art approved so far; runtime integration remains pending. The kick still needs another direction pass, which requires a newly scoped generation allowance.

## Revision provenance

All earlier sources remain preserved under Kristen's PixelLab folder. The original reference and shorts attempt were followed by the leaner athletic redraw, hiking socks and bandana detail. Todd rejected the later leg narrowing; the restored version retained the earlier body exactly and copied only 279 bandana pixels. The approved version adds the 27-pixel outline cleanup. Per-step prompts, job IDs, costs and exact patches remain in their versioned manifests.

References:

- `art-source/characters/kristen/references/kristen-reference-photo-1.jpg`: primary facial likeness, dark wavy hair and black rectangular glasses.
- `art-source/characters/kristen/references/kristen-reference-photo-2.jpg`: additional profile likeness and natural adult build.
- `art-source/characters/kristen/concepts/kristen-fighter-concept-v1.png`: established green shirt, blue neck bandana, charcoal cargo pants and hiking boots. The new standing guard has empty hands.
- `art-source/characters/todd/pixellab/retro-option-b-20261015/concept.png`: pixel density, outline, stepped shading, adult proportions and source scale only. Do not transfer Todd's face, beard, clothing or tattoo to Kristen.

The original standing generation used Create Image (Pro) with a 48-color request. Subsequent approved bandana detail yields a 58-color final source; preserve that approved result rather than re-quantizing it solely to match the initial request.

Original generation provenance is recorded in [the original source manifest](../art-source/characters/kristen/pixellab/retro-reference-20261015/manifest.json); the approved manifest above identifies the selected final asset.

## Proposed phases after reference approval

1. Standing likeness, outfit and style beside Todd: approved October 15, 2026.
2. Small idle/walk pilot; generated and source-review ready October 15, 2026. Await review before expanding.
3. Standing punches and side kick, with a review checkpoint for motion and anatomy.
4. Jump, standing block and crouch, then air attacks in a separate review batch.
5. Damage/KO and signature moves when the core set is ready; preserve plant/cooking/camping themes from the project plan.

Each phase needs an explicit scoped request before generation. Use Animate with Text v3 and the approved standing sprite, preserving returned individual frames. Follow [PixelLab generation](../.agents/skills/pixellab-generation/SKILL.md) and [fighter animation](../.agents/skills/fighter-animation/SKILL.md). Runtime integration is a later checkpoint with shared scale, anchors, combat timing and both fighters validated.
