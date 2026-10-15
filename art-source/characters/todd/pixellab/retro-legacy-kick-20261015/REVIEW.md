# Retro Todd — approved old kick style

Todd confirmed the nine-frame historical Corrected kick as the motion reference. This candidate uses the approved retro Option B for adult identity, costume, palette and detail, and old `kick-4.png` for pose only. Two labelled image references produced a rotated impact pose, followed by Text v3 guard-to-impact and impact-to-guard segments. All original outputs are retained.

Open `review.html` through Vite; rebuild with `node scripts/preview-todd-legacy-kick.mjs`. The old reference is fixed at 2× native pixels for comparison, the new candidate at 1×. These are fixed clip-wide anchors and scales, never per-frame fitting. Automatic source playback is 12fps; normal/slow, frame stepping and mirrored review are available.

## Findings

- Nine combined 256×256 transparent frames, from two five-frame returned segments with one duplicated impact boundary skipped. No opaque edge contact (alpha >8).
- Clearer hip/torso turn, back/side shirt view, straight heel-led strike and knee recoil than the rejected frontal kick attempts. Tattooed arm follows the strike like the old reference. Still requires Todd's artistic acceptance.
- Opaque bottom y245–251: up to 6px support-foot vertical drift remains. Silhouette height 212–236px changes with the turned, leaning pose. No per-frame stretching or normalization hides this.
- Face/glasses are partly occluded at the profile/back angle; assess likeness and tattoo detail at intended runtime scale before integration. Mirroring does not establish separately authored opposite-facing tattoo anatomy.
- Source normal/slow and mirrored browser preview checked. These clips are not integrated; real combat transitions, timing and runtime scale remain unverified.

## Provenance, cost and validation

`manifest.json` includes prompts, seeds, local/reference paths and job IDs; raw job receipts preserve outputs. Pro pose cost 10 generations; v3 outbound and recovery cost 4 each. Quote and actual usage total **18**, live balance 4,899 → 4,881. No purchases, commits or pushes.

All 79 repository tests and production build passed; existing large-chunk warning remains. Script syntax and final diff whitespace checks passed. Approved walk, idle glasses repairs and weighted punch artwork/behavior were not changed in this candidate.
