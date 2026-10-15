# Todd animation rebuild with PixelLab

Status: photo-based source-art pilot completed; runtime integration and motion acceptance remain separate work. This document does not authorize new generation, purchases, or an open-ended batch.

## Goal and approved identity

Replace Todd's mixed assets with a consistent set that preserves his glasses, brown hair and beard, black V-neck shirt, dark jeans, black sneakers, left forearm tattoo, and technology theme. Match his established size in the Backyard. Normal fighting stance is hands-free; reserve the rugged laptop and cyan code effects for signature/Super actions.

Todd's rebuild starts from the user-provided reference photo using `create_character`, rather than editing the old sprite. That photo-based character has already been created; reuse its identity for clips instead of creating a new character for every action. If a replacement character is needed, preserve this photo-based initialization requirement. Use `create_character_state` for budgeted identity-preserving pose/outfit variants; states are not motion clips.

## Selected tools

The user selected **Animate with Text v3** and **Interpolation v3**. Use character `animate_character` mode `v3` for Text v3 clips. The pilot found only `/interpolation-v2`; verify current availability before using interpolation. Do not silently substitute v2, skeleton animation, templates, or PixMiniMax.

Earlier image-animation tools were capped at 256x256. This is historical, not a universal/current limit: check the selected tool's actual limits and returned dimensions/frame counts. Inspect face and tattoo detail at actual game size before producing the full set.

For the repeatable generation/cost/provenance procedure, use the [PixelLab-generation skill](../.agents/skills/pixellab-generation/SKILL.md). Connection setup and commands are in [PIXELLAB_API.md](PIXELLAB_API.md).

## Runtime baseline and known defects

Runtime mappings checked October 15, 2026 still use the older authored sheets in [Todd's character definition](../src/content/characters/todd/character.ts). See [the runtime animation snapshot](GAMEPLAY_AND_PRESENTATION.md#runtime-animation-snapshot) for both fighters. Source preview approval and completed generation do not establish runtime integration.

- Todd has six-frame idle, walk, kick, punch, and crouching-punch sheets; the reaction sheet has two frames each for block, hit, and landing. Forward movement and retreat share walk.
- Legacy idle carries a laptop, while some attacks are hands-free. The approved hands-free rebuild direction above resolves the future prop choice without claiming the current idle has changed.
- Crouching compresses idle; jump/fall pause and tilt the sprite; KO is a tween. Air attacks, special, and Super lack dedicated authored attack sheets.
- The J kick resolves to the low `crouchLight` move while displaying a mid-height side kick. Evaluate this visual/hit-rule mismatch separately before changing hit rules.
- Earlier measurements found idle about 346px tall and kick silhouettes 278–286px tall inside 362px-high cells. The shared runtime scale and foot baseline make the smaller body appear to shrink and drop. These are recorded measurements, not fresh image analysis; remeasure after asset changes. Match body proportions/reference scale, not just sheet dimensions.

## Pilot artifacts and review

- Photo-based character: `67aac7e3-77cd-496b-abd3-a37637c3557f`.
- Eight rotations and Text v3 idle/walk/punch/kick clips: [photo-character/](../art-source/characters/todd/pixellab/photo-character/).
- Reference provenance, jobs, quotes, and charges: [pilot-manifest.json](../art-source/characters/todd/pixellab/pilot-manifest.json). It also contains superseded old-sprite experiments; use its `character` and `animationPilot` records for the photo pilot.
- Recorded photo-pilot frame counts: idle 5, walk 5, punch 5, kick 7. The animation pilot records 2 generations per clip, 8 total; the character creation record quotes 25 generations. Quotes and actual charges must remain distinct.
- Earlier old-sprite experiments in the parent directory are superseded.

Rebuild the standalone preview with `node scripts/preview-todd-pixellab.mjs`; see the API reference for serving and interpreting it. It supports slow playback and facing reversal.

The recorded pilot kick reads as a bent-knee front kick, not the requested fully extended side kick. Completion does not imply acceptance. Required sequence: chamber the knee, turn the hips, extend the heel horizontally toward the opponent's waist/midsection, recoil, and return to stance. Reject shin-height contact or a persistently bent knee at full extension.

Review at normal speed, slowed down, and facing both directions. Accept only when identity, body proportions, grounded feet, waist-height heel extension, unclipped limbs, and smooth stance recovery hold. Natural leans/crouches should lower the head.

## Remaining animation inventory

| Batch | Clips | Purpose |
|---|---|---|
| Movement | Idle, forward walk, retreat, crouch, jump ascent, fall, landing | Replace reused or transformed movement poses |
| Basic attacks | Standing mid side kick, low kick, standing punch, crouching uppercut, air kick, air punch | Distinct readable actions and stance recovery |
| Reactions | Standing guard, crouching guard, hit reaction, knockout | Authored defensive/damage poses |
| Signature moves | Glitch Surge special, System Crash Super | Technology-themed body animation with separate cyan effects |
| Optional polish | Victory pose | Defer until the core set works |

This inventory is a target set, not a claim that pilot clips are accepted or absent. Reuse suitable poses deliberately while keeping state mappings distinct. Review movement before attacks, reactions before signature moves. Correct/review a small pilot before producing further batches.

## Integration and validation

Use the [fighter-animation skill](../.agents/skills/fighter-animation/SKILL.md) for frame preservation, calibrated scale/anchors, versioned exports, integration, and full source/runtime playtesting. Preserve Kristen compatibility and existing combat damage, reach, hit levels, cooldowns, match rules, and effective action-lock durations. New frame counts/rates must not alter combat timing. Remove runtime crouch compression or airborne tilting when authored poses replace them.

## Historical context and superseded guidance

The October 12, 2026 proposal used an old sprite reference, recommended skeleton-guided kicks, left the laptop choice unresolved, and proposed 6–10 pilot generations. Those instructions are superseded by the photo-based identity, selected v3 tools, and hands-free direction above. Their budgets are not new authorization. Old skeleton/frame-return details apply only to superseded tools; preserve raw jobs/poses in source artifacts for provenance rather than using them as current procedure.

At original planning time, the recorded balance was 40 trial generations, 0 used, and $0 purchased credits, with a separate daily bonus reported. This is not a current balance or available allowance. Check live balances, tool eligibility, limits, and costs before a batch; do not assume bonuses/retries or require an upgrade based on old access claims. Prefer no-new-cost work and avoid expensive Pro edits by default.

An earlier read-only Todd runtime playtest recorded visible walking, stable apparent scale, idle/walk/reaction recovery, and no obvious slicing/bleed/stray pixels or browser warnings/errors. It did not conclusively establish exact six-frame leg order, a clean jump-over crossover, or Kristen-as-player behavior. Its observation of Kristen moving on idle art predates her current walk sheet and is obsolete. These observations are historical, not fresh runtime validation.

Recorded pre-PixelLab `main` baseline: `47b7f85` (`feat: add super meters and polish Todd portrait`), previously reported pushed to `origin/main`. Preserve it as a historical rollback reference for HUD, controls, scene styling, match reset, and older art; verify local/remote state before relying on it. It does not authorize resetting unrelated work.

The former instruction that “today's side-kick changes are uncommitted” was a one-time checkpoint and has been removed; inspect current Git status instead.

## Evidence

Current requirements were consolidated from the repository's former root instructions and checked against local definitions, playback, attack mapping, manifest, and preview script on October 15, 2026. The original planning observations were dated October 12, 2026; subsequent pilot observations are retained as historical records. No live account check is implied.

The original proposal cited PixelLab's [text-animation documentation](https://www.pixellab.ai/docs/tools/animate-with-text-new) and [skeleton documentation](https://www.pixellab.ai/docs/tools/animate-with-skeleton). The skeleton link records historical research, not the approved tool choice. Consult current tool schemas/API documentation when executing a batch.
