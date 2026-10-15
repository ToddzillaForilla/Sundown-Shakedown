---
name: fighter-animation
description: Prepare, integrate, and validate Sundown Shakedown fighter sprite sheets or animation playback changes. Use for fighter animation work in this repository.
---

# Fighter animation

## Inspect and scope

Read the repository's [gameplay/presentation reference](../../../docs/GAMEPLAY_AND_PRESENTATION.md) and [project plan](../../../docs/PROJECT_PLAN.md), then inspect the affected character definition, source frames, `Fighter` playback, animation state machine, and attack timing. For Todd's rebuild, also read [the Todd plan](../../../docs/TODD_PIXELLAB_ANIMATION_PLAN.md).

Inspect the current scene/assets before substantial visual changes and propose a direction before editing or generating. Reuse approved modular artwork, preserve originals, and review a small pilot before batching frames. For PixelLab generation, use the [PixelLab-generation skill](../pixellab-generation/SKILL.md).

## Prepare exports

- Preserve returned individual frames and their common canvas/pivot. Do not reconstruct frames by extracting connected components from a generated montage.
- Export transparent sheets in equal-sized frame cells with a consistent body anchor and ground baseline.
- Check alpha, actual frame count, cell dimensions, facing, clipping, and room for extended limbs. Keep prompts, reference provenance, IDs, seeds when available, and cost records with source assets.
- Measure silhouette proportions, foot baseline, and body anchors against the approved reference. Use one calibrated scale across the set; do not independently resize each pose to fill its cell or center by changing opaque bounds.
- Natural crouches and leans should lower the head. Do not stretch them to standing height. Wider attack canvases may be needed without changing body scale.
- Create versioned runtime exports with the character package and retain existing sheets for rollback.

## Integrate

Update character presentation mappings and shared playback only as needed. Preserve existing damage, reach, hit levels, cooldowns, match rules, and effective action-lock durations. Frame counts/rates must not accidentally change combat timing. Evaluate visual/hit-level mismatches separately from art replacement.

Remove extra runtime crouch compression or airborne tilting when authored poses replace those transformations. Preserve walk/idle, block/hit, jump/fall, and landing recovery, both facing directions, and compatibility with the other fighter.

## Verify source and game

Review source playback at normal speed, slowed down, and facing both directions. Check character identity and motion quality; a completed generation is not acceptance.

Run relevant existing tests, meaningful regression coverage for changed timing/state behavior, and `npm run build`. `npm test` runs the full suite when shared behavior warrants it.

Browser-playtest:

- Sustained forward/backward movement and rapid walk/stop transitions.
- Jump/landing recovery, attacks, blocks, hit interruptions, KO, rematch, and both facings. Directly observe crossover mirroring when evaluating it.
- Frame order, foot sliding, ground-line bobbing, scale changes, clipping, neighboring-frame bleed, stray pixels, disappearance, and failure to resume the correct clip.
- Actual game-size face/tattoo detail, phone landscape sizing, and the other fighter's presentation after shared-renderer changes.

Sampled screenshots do not prove exact frame order or crossover mirroring. State which behaviors were directly observed and which remain unverified. Distinguish source-art preview from playable integration; leave the requested scene visible with a checked live server when handing off a visual change.
