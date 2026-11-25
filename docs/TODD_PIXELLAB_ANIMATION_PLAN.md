# Todd animation rebuild with PixelLab

Status: Option B is Todd's approved master reference. As of October 16, the repaired idle, walk, both punches, jump, four-frame landing recovery, standing block, retro side kick, crouch, jump kick, jump punch, hit reaction, and defeat/KO clip are integrated in the runtime. The KO uses the user's manually cleaned eighth displayed frame. The left-arm standing punch fires 75% of the time and the right-arm punch 25%. The nine-frame grounded kick remains at 33fps; the nine-frame air kick runs at 27fps and air punch at 15fps so neither exceeds its existing cooldown. The crouch uses its approved lowest held pose without runtime vertical compression. This document does not authorize purchases or an open-ended batch.

## Goal and approved identity

Follow-up on the side kick: Todd approved the corrected motion direction and requested less morphing toward the old design and a visible shoe underside at maximum extension. The separate `retro-kick-cleanup-20261015/` candidate retained visible shoe tread and remains an unselected candidate. The later `retro-legacy-kick-20261015/` candidate used the approved retro master for identity and old `kick-4.png` for pose only; Todd approved it on October 16, and it is now integrated. Its source review documents the remaining support-foot drift and partial profile occlusion.

Todd confirmed the historical **Corrected kick** as the desired motion for retro Todd. The `art-source/characters/todd/pixellab/retro-legacy-kick-20261015/` candidate uses labelled references: approved Option B for adult identity/style, and old `kick-4.png` for the impact pose/hip turn only. Its Pro pose and Text v3 clips used 18 generations; this candidate was approved and integrated October 16. The old chibi reference remains motion guidance only.

Latest review: walk and both punch artworks approved. The corrected idle frame with the glasses repair is included in the runtime set. The game randomly chooses the tattooed left punch 75% / bare right punch 25%. The approved retro side kick is now mapped in the runtime. Earlier retro kick attempts remain rejected or unselected, and the photo-based `kick-correction-20261015/` gallery remains historical motion provenance rather than the runtime source.

October 15 follow-up: the revised source gallery is `art-source/characters/todd/pixellab/retro-revisions-20261015/review.html`. Idle frame 2 and walk frame 8 have exact PixelLab glasses repairs. The approved tattooed-left-arm punch is unchanged; a new bare-right-arm punch enables weighted variety. The generated kick in that gallery remains unselected; the separately reviewed `retro-legacy-kick-20261015/` source is the approved runtime kick. Generation receipts and balance agree on 26 generations for this pass.

Replace Todd's mixed assets with a consistent set that preserves his glasses, brown hair and beard, black V-neck shirt, dark jeans, black sneakers, left forearm tattoo, and technology theme. Match his established size in the Backyard. Normal fighting stance is hands-free; reserve the rugged laptop and cyan code effects for signature/Super actions.

Todd requested a clean restart from his original reference photo, with PixelLab handling substantial art work rather than prioritizing free/local edits. The approved Option B is a transparent 256×256 sprite with a 236px silhouette and 48 visible colors, facing screen-left in a three-quarter guard. Preserve its mature arcade-fighter proportions, shading, likeness, glasses, beard, black V-neck, jeans, sneakers, bare wrists and anatomical left forearm tattoo. Use this exact artwork as the visual reference; do not regenerate the base from text or reuse Option A's character ID (`90989a91-68e7-460c-945d-5a67305c3368`) for the new body. Photo provenance remains in `fresh-mockup-20261015/`. Use `create_character_state` for identity-preserving variants only after the approved design has an appropriate stored character; states are not motion clips.

Before the fresh restart, the October 15 review selected a watch-free design and the corrected side-kick motion; retain those design requirements for the new character. Watch removal was completed for the prior four source clips in `art-source/characters/todd/pixellab/watchless-20261015/` (24 frames), using free PixelLab pixel edits. That prior iteration and its stored PixelLab character rotations are historical; future clips should use the fresh identity after mockup approval. The nine-frame corrected side kick in `art-source/characters/todd/pixellab/kick-correction-20261015/` records the selected Side kick motion direction for the previous body. The original seven-frame kick is superseded and omitted from the active gallery; its raw source is retained for provenance. Runtime integration remains pending.

## Selected tools

October 15 selection: Option B is approved; Option A is retired and retained only as historical source. The 256×256 Create Image (Pro) master is under `art-source/characters/todd/pixellab/retro-option-b-20261015/`, job `3d51b9df-6cdc-462a-8d09-8839c395c37a`, asset `24d1909c-8e34-5ae3-b4f8-fb47f295937a`. It cost 10 generations; the last verified balance was 4,961. Future animation must preserve this design. The tattoo belongs only on the anatomical left forearm where visible; east may correctly hide that arm, and other views require anatomical review.

The user selected **Animate with Text v3** and **Interpolation v3**. Use character `animate_character` mode `v3` for Text v3 clips. The pilot found only `/interpolation-v2`; verify current availability before using interpolation. Do not silently substitute v2, skeleton animation, templates, or PixMiniMax.

Approved Option B pilot: Todd authorized idle, walk, punch and side kick before Kristen's matching design. Animate the exact loose sprite with `/animate-with-text-v3` (`animate_image` MCP) rather than recreating its facings or reusing a retired character ID. This is the selected Text v3 model with a direct first-frame input. Last-frame guidance stays on that same v3 endpoint; no v2 interpolation is used. The scoped pilot requests 4 idle frames and 8 per other clip at 256×256, quoted 28 generations total. Source, prompts, seeds, job IDs, returned frame counts and charges are recorded in `art-source/characters/todd/pixellab/retro-animation-pilot-20261015/manifest.json`. Review the pilot before any broader set or integration.

Earlier image-animation tools were capped at 256x256. This is historical, not a universal/current limit: check the selected tool's actual limits and returned dimensions/frame counts. Inspect face and tattoo detail at actual game size before producing the full set.

For the repeatable generation/cost/provenance procedure, use the [PixelLab-generation skill](../.agents/skills/pixellab-generation/SKILL.md). Connection setup and commands are in [PIXELLAB_API.md](PIXELLAB_API.md).

## Runtime baseline and known defects

Runtime mappings checked October 16, 2026 include the approved retro idle, walk, jump, block, kick and weighted standing punches in [Todd's character definition](../src/content/characters/todd/character.ts). See [the runtime animation snapshot](GAMEPLAY_AND_PRESENTATION.md#runtime-animation-snapshot) for both fighters. Source preview approval and completed generation do not establish runtime integration.

- Todd's current authored runtime sheets have five idle frames, nine walk frames, nine kick frames, nine frames for each weighted standing punch at 24fps, nine jump frames, a four-frame landing recovery at 18fps, five block frames, a nine-frame hit reaction, and a nine-frame defeat clip. The crouching-punch and block sheets remain older assets. Kristen continues to use her landing reaction. Forward movement and retreat share walk.
- The October 16 hit/KO revision used 16 approved PixelLab generations. The hit reaction and nine-frame KO are approved and integrated. Displayed frame 8 uses the user's manually cleaned source, with the original frame and full edited sheet preserved in [the revision gallery](../art-source/characters/todd/pixellab/retro-hit-ko-revision-20261016/review.html).
- The approved hands-free idle, walk, block, kick and punch clips now drive normal combat; the older laptop-bearing artwork remains preserved as source art.
- The approved crouch and air attack sheets now replace the old crouch compression and generic air-attack motions. Special and Super still lack dedicated authored attack sheets; jump/fall physics still controls the airborne arc.
- The J kick resolves to the low `crouchLight` move while displaying a mid-height side kick. Evaluate this visual/hit-rule mismatch separately before changing hit rules.
- The approved kick uses 256×256 cells with 212–236px silhouette heights and opaque bottoms from y245 to y251. The shared runtime scale keeps Todd aligned with his other clips; the accepted support-foot drift remains visible. Match body proportions/reference scale, not just sheet dimensions.

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

October 15 source-review addition: [jump and standing block](../art-source/characters/todd/pixellab/retro-jump-block-20261015/REVIEW.md) have 9 and 5 frames respectively and were approved by the user. [Crouch, jump kick and jump punch](../art-source/characters/todd/pixellab/retro-air-crouch-20261015/REVIEW.md) were approved and integrated on October 16. Crouch is shallow and uses its deepest frame as the held pose; the selected jump kick combines approved jump and cleaned side-kick frames because the new generated kick failed to extend. The rejected raw knee-lift kick remains unused. Gallery jump arcs are demonstrations; game physics controls the runtime arc.

| Batch | Clips | Purpose |
|---|---|---|
| Movement | Idle, forward walk, retreat, crouch, jump ascent, fall, landing | Replace reused or transformed movement poses |
| Basic attacks | Standing mid side kick, low kick, standing punch, crouching uppercut (paused; source art retained for rebuild), air kick, air punch | Distinct readable actions and stance recovery |
| Reactions | Standing guard, crouching guard, hit reaction, knockout | Authored defensive/damage poses |
| Signature moves | Glitch Surge special, System Crash Super | Technology-themed body animation with separate cyan effects |
| Optional polish | Victory pose | Defer until the core set works |

This inventory is a target set, not a claim that pilot clips are accepted or absent. Reuse suitable poses deliberately while keeping state mappings distinct. Review movement before attacks, reactions before signature moves. Correct/review a small pilot before producing further batches.

## Integration and validation

Use the [fighter-animation skill](../.agents/skills/fighter-animation/SKILL.md) for frame preservation, calibrated scale/anchors, versioned exports, integration, and full source/runtime playtesting. Preserve Kristen compatibility and existing combat damage, reach, hit levels, cooldowns, match rules, and effective action-lock durations. New frame counts/rates must not alter combat timing. Remove runtime crouch compression or airborne tilting when authored poses replace them.

## Historical context and superseded guidance

The October 12, 2026 proposal used an old sprite reference, recommended skeleton-guided kicks, left the laptop choice unresolved, and proposed 6–10 pilot generations. Those instructions are superseded by the photo-based identity, selected v3 tools, and hands-free direction above. Their budgets are not new authorization. Old skeleton/frame-return details apply only to superseded tools; preserve raw jobs/poses in source artifacts for provenance rather than using them as current procedure.

At original planning time, the recorded balance was 40 trial generations, 0 used, and $0 purchased credits, with a separate daily bonus reported. This is not a current balance or available allowance. Check live balances, tool eligibility, limits, and costs before a batch; do not assume bonuses/retries or require an upgrade based on old access claims. The later October 15 instruction supersedes the free/local-first preference: use PixelLab for substantial art work when suitable, with scoped batches and cost records.

An earlier read-only Todd runtime playtest recorded visible walking, stable apparent scale, idle/walk/reaction recovery, and no obvious slicing/bleed/stray pixels or browser warnings/errors. It did not conclusively establish exact six-frame leg order, a clean jump-over crossover, or Kristen-as-player behavior. Its observation of Kristen moving on idle art predates her current walk sheet and is obsolete. These observations are historical, not fresh runtime validation.

Recorded pre-PixelLab `main` baseline: `47b7f85` (`feat: add super meters and polish Todd portrait`), previously reported pushed to `origin/main`. Preserve it as a historical rollback reference for HUD, controls, scene styling, match reset, and older art; verify local/remote state before relying on it. It does not authorize resetting unrelated work.

The former instruction that “today's side-kick changes are uncommitted” was a one-time checkpoint and has been removed; inspect current Git status instead.

## Evidence

Current requirements were consolidated from the repository's former root instructions and checked against local definitions, playback, attack mapping, manifest, and preview script on October 15, 2026. The original planning observations were dated October 12, 2026; subsequent pilot observations are retained as historical records. No live account check is implied.

The original proposal cited PixelLab's [text-animation documentation](https://www.pixellab.ai/docs/tools/animate-with-text-new) and [skeleton documentation](https://www.pixellab.ai/docs/tools/animate-with-skeleton). The skeleton link records historical research, not the approved tool choice. Consult current tool schemas/API documentation when executing a batch.
