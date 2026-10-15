# Todd requested revisions — October 15, 2026

Source review only; runtime integration remains pending. Rebuild with `node scripts/preview-todd-retro-revisions.mjs`. Originals in the earlier pilot are retained, including the rejected kick.

## Latest follow-up

Idle frame 3 now has the same reference glasses repair, translated by (-3,+4) to match its head position. PixelLab image `2c61a170-5688-4702-b0be-b4140fed37e0` changed 40 pixels within x101–112, y42–51; every outside pixel was verified unchanged. The earlier frame-2 fix remains. Walking and both punch clips were explicitly approved and are preserved.

Punch selection in this gallery is now independent weighted randomness: 75% right arm and 25% left, allowing repeated arms. This applies to automatic playback and accepted button/K presses; busy presses and keyboard repeats do not consume a choice. Threshold selection was checked with deterministic samples; the production build passed. Real-game integration remains pending.

The guided kick was rejected. Before the user's request to identify the old kick arrived, one new 8-generation-quoted v3 job (`3ab3203a-2a4a-4ee2-beef-f185026055b7`) was submitted. Its status and receipts are separate in `fresh-kick-attempt.json` and `fresh-kick-job.json`; it is not selected and must not silently replace anything. Further kick work waits for confirmation of the historical **Corrected kick** in `../kick-correction-20261015/review.html` (nine frames, before the retro redesign). The latest source gallery labels the rejected kick accordingly.

- Idle frame 2: restored far glasses rim/lens from the approved reference at the head's shifted location. PixelLab exact edit changed 23 pixels within x103–114, y40–49. All pixels outside that rectangle are unchanged.
- Walk frame 8: replaced mismatched far lens with the reference detail aligned to the moving head. Exact edit changed 67 pixels within x106–117, y31–40. All other pixels are unchanged. Walk motion itself is preserved, including its previously noted 6px baseline drift.
- Original tattooed LEFT-arm punch: all nine files are copied unchanged.
- New bare RIGHT-arm punch: nine returned frames, 256×256, clearly extends the opposite arm while the tattooed arm guards. The alternating preview concatenates left then right for automatic playback. Throw punch/K starts with right, then left on successive accepted presses, ignoring keyboard auto-repeat and presses during an active punch. This behavior exists in the source gallery only, not the game.
- New side kick: Pro pose establishes full waist-high straight-leg extension. Two v3 clips animate guard to impact and impact to guard. Nine combined frames skip the duplicated boundary frame; all raw returned images remain available. Extension is substantially clearer than the rejected bent-knee kick. Chamber/recovery and remaining body shift still need artistic review.

## Measurements and limits

All frames use the common transparent 256×256 canvas, fixed scale and anchor; none touch the image edge (alpha >8). Silhouette height / opaque bottom-y ranges: idle 232–236 / 251; walk 235–244 / 245–251; original punch 232–237 / 251–252; new side kick 235–244 / 247–251; both punches 232–237 / 251–252. Some kick foot/body drift remains; no per-frame scaling or repositioning hides it. Normal/slow playback and mirrored preview do not establish runtime scale, combat timing, or independently authored opposite-facing tattoo anatomy.

## Provenance and cost

`manifest.json` stores prompts, seeds, jobs and quote/usage records. `glasses-decisions.json` records guarded source-pixel edits. Pixel tool image IDs retain exact-edit provenance; local validation checks changed pixels remain confined to the intended rectangles.

Balance before 4,933; after 4,907. Receipts: opposite punch 8, kick pose 10, outbound 4, recovery 4 = **26 subscription generations**, matching the live balance delta. Exact glasses edits were free. The previous pilot's delayed balance settled to 4,933 before this pass, reconciling its earlier recorded discrepancy.

Repository tests: 79 passed. Production build passed with the existing large-chunk warning. No new runtime animation mappings, combat changes, purchases, commits or pushes.
