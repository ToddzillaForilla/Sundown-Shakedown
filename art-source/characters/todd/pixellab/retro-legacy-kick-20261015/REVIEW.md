# Retro Todd — approved side kick

Todd approved this nine-frame kick on October 16, 2026. It uses the approved retro Option B for adult identity, costume, palette and detail, and old `kick-4.png` for pose only. Two labelled image references produced a rotated impact pose, followed by Text v3 guard-to-impact and impact-to-guard segments. All original outputs are retained.

Open `review.html` through Vite; rebuild with `node scripts/preview-todd-legacy-kick.mjs`. The old reference is fixed at 2× native pixels for comparison, the new candidate at 1×. These are fixed clip-wide anchors and scales, never per-frame fitting. Automatic source playback is 12fps; normal/slow, frame stepping and mirrored review are available.

## Findings

- Nine combined 256×256 transparent frames, from two five-frame returned segments with one duplicated impact boundary skipped. No opaque edge contact (alpha >8).
- Clear hip/torso turn, back/side shirt view, straight heel-led strike and knee recoil. The tattooed arm follows the strike like the old reference.
- Opaque bottom y245–251: up to 6px support-foot vertical drift remains. Silhouette height 212–236px changes with the turned, leaning pose. No per-frame stretching or normalization hides this.
- Face/glasses are partly occluded at the profile/back angle; assess likeness and tattoo detail at intended runtime scale before integration. Mirroring does not establish separately authored opposite-facing tattoo anatomy.
- Source normal/slow and mirrored browser preview checked. The approved frames are exported to `src/content/characters/todd/assets/sprites/todd-kick-retro-v1.png`, facing left at 33fps. Nine frames at this rate take 273ms, matching the previous six-frame, 22fps clip and preserving the 310ms low-kick cooldown. The facing metadata matches the source's left-facing guard.
- The support-foot drift and profile face/glasses occlusion remain visible in the approved source. No artwork was altered to hide them.

## Provenance, cost and validation

`manifest.json` includes prompts, seeds, local/reference paths and job IDs; raw job receipts preserve outputs. Pro pose cost 10 generations; v3 outbound and recovery cost 4 each. Quote and actual usage total **18**, live balance 4,899 → 4,881. No purchases, commits or pushes.

`node scripts/export-todd-retro-kick.mjs` assembles the nine original 256×256 frames and verifies each exported frame's alpha and visible pixels against its source. Repository tests and production build are recorded in the implementation turn. Approved walk, idle glasses repairs and weighted punch artwork/behavior were not changed by this integration.
