# Kristen retro animation rebuild

## Approved standing reference

Todd explicitly approved Kristen's final standing reference on October 15, 2026.

- Approved source: [concept.png](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/concept.png).
- Approval, source hash, provenance and exact outline patch: [manifest.json](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/manifest.json).
- [Side-by-side reference page](../art-source/characters/kristen/pixellab/retro-outline-clean-20261015/review.html).

Use this exact reference for subsequent Kristen animation work: recognizable adult face, black glasses, wavy brown hair, fitted green shirt, detailed blue bandana, charcoal short cargo shorts, gray-green hiking socks, brown boots and empty-handed screen-left guard. Preserve the approved leg proportions; the narrower-leg experiment was rejected.

Verified source geometry: transparent 256×256 canvas, 224px silhouette, hair top y28, boot baseline y251, 58 colors. Todd's approved reference is 236px tall with the same baseline, making Kristen about 5.1% shorter. The final cleanup darkened 27 existing edge pixels on the screen-right leg without changing alpha, silhouette or any other pixels. Keep the approved source unchanged; save future experiments separately.

This approval covers the standing reference. It remains source art; no Kristen rebuild animations or runtime integration have been performed. The next planned phase is a small idle/walk pilot, scoped before generation.

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
2. Small idle/walk pilot; verify glasses, body proportions and foot registration before expanding.
3. Standing punches and side kick, with a review checkpoint for motion and anatomy.
4. Jump, standing block and crouch, then air attacks in a separate review batch.
5. Damage/KO and signature moves when the core set is ready; preserve plant/cooking/camping themes from the project plan.

Each phase needs an explicit scoped request before generation. Use Animate with Text v3 and the approved standing sprite, preserving returned individual frames. Follow [PixelLab generation](../.agents/skills/pixellab-generation/SKILL.md) and [fighter animation](../.agents/skills/fighter-animation/SKILL.md). Runtime integration is a later checkpoint with shared scale, anchors, combat timing and both fighters validated.
