# Todd kick — identity and shoe-sole cleanup

User requested the preferred rotated side kick retain adult retro Todd throughout and show the bottom of the kicking shoe at maximum reach. This candidate uses only approved Option B as image conditioning, with no old chibi reference. Original versions remain preserved.

## Changes and assembly

- Pro edit of the approved retro master creates a long-legged adult impact pose, heel leading, ankle flexed and broad dark tread visible in three-quarter underside view.
- Exact PixelLab copy_region translates the entire impact pose down 9px, from opaque bottom y242 to the approved baseline y251. Translation was verified pixel-for-pixel; no resizing or redrawing.
- Text v3 generated separate outbound and recovery segments. For this review, use the recovery frames backwards into impact and forwards out of impact: `[4,3,2,1,0,1,2,3,4]`. This keeps both halves visually matched. The separate outbound completed and is preserved as an unselected alternative; rebuilding does not silently switch assemblies.
- Recovery frames 1, 2 and 3 (zero-based) receive whole-frame vertical translations of 3, 3 and 14px respectively to ground the identified supporting shoe. Vacated top strips are cleared from transparent source margins. All artwork, proportions and raw generated frames are preserved; exact translated pixels and empty top strips were verified. Decisions and PixelLab IDs are in `ground-corrections.json` and the manifest.

## Review

`review.html` compares the previous retro kick against cleanup, both at the same fixed 1× scale and canvas anchor. Rebuild with `node scripts/preview-todd-legacy-kick.mjs art-source/characters/todd/pixellab/retro-kick-cleanup-20261015`.

Nine transparent 256×256 frames; no opaque edge contact (alpha >8). Corrected opaque bottoms are all y251. Silhouette heights 228–238px reflect crouching/turning rather than independently fitted scales. This reduces vertical drift and the earlier large apparent height change, but measurements alone do not establish likeness. Profile glasses/face occlusion and remaining palette/detail variation still require artistic review. The sole/tread is clearly visible in the maximum-extension pose.

Normal/slow playback, stepping and mirrored source preview are review tools. Mirroring does not establish separately authored opposite-facing tattoo anatomy. No game integration or real-game transitions/timing/scale checks have occurred.

## Cost and checks

Quote and receipts: Pro pose 10, outbound 4, recovery 4 = **18 subscription generations**. Live balance 4,881 → 4,863. Exact PixelLab translations were free. No extra retries or purchases.

All 79 repository tests and production build passed; existing large-chunk warning remains. Script syntax, exact translation checks, all-frame dimensions/baselines/clipping, and final whitespace review passed. Idle, walk and weighted punch assets were not changed.
