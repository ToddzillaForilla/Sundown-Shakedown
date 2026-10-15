---
name: pixellab-generation
description: Run a scoped PixelLab asset generation batch for Sundown Shakedown with capability checks, cost accounting, job polling, and review. Use when generating project assets with PixelLab.
---

# PixelLab generation

## Establish the batch

Read [PixelLab access](../../../docs/PIXELLAB_API.md) for authentication and tooling. For Todd, read [the current rebuild plan](../../../docs/TODD_PIXELLAB_ANIMATION_PLAN.md) for identity, selected tools, existing character/job IDs, and motion acceptance criteria. Inspect the relevant scene, approved assets, and source manifest before proposing substantial visual work.

Check live balance and the selected tool's current limits/costs before each batch. Subscription generations and USD credits are different units. Earlier allowances, trial bonuses, and estimates are historical; confirm paid scope and allowance before spending. Prefer local or no-new-cost approaches when suitable.

Verify the requested tool/mode is available. Do not silently substitute versions or generation methods. Resolution, frame count, and cost can differ by tool; inspect detail at actual game size before producing a full set. If the required mode is unavailable, report the limitation and resolve the choice before generating dependent assets.

## Generate and record

- Use the agreed reference, identity, and mode. Reuse the established character for clips; use character states for identity-preserving pose/outfit variants when needed and budgeted. States are variants, not motion clips.
- Record prompts, reference provenance, character/state IDs, job IDs, seeds when available, requested dimensions/counts, and quoted costs with source assets. Keep credentials out of these records.
- Submit only within the agreed scope. Poll existing jobs rather than resubmitting duplicates; respect observed concurrency limits, which may be one job on a trial.
- Preserve downloaded originals and returned individual frames on their common canvas/pivot. Check actual dimensions and frame counts rather than assuming they match requests; do not independently crop/scale each pose to fill its cell.
- Check balance after completion and record actual charges separately from quotes. Stop at the agreed allowance. Review the pilot before another batch; failed or unsuitable output does not authorize extra retries or purchases.

## Review and hand off

Review character identity and motion at normal speed, slowed down, and facing both directions. Apply the project-specific motion criteria from the relevant plan. Treat job completion and artistic acceptance separately.

Use the [fighter-animation skill](../fighter-animation/SKILL.md) when preparing runtime exports or integrating playback. Report assets, charges, quality findings, and unresolved tool/quality limits. Source preview approval does not establish game integration. Do not describe historical account access, balances, or tool limits as live without a fresh check.
