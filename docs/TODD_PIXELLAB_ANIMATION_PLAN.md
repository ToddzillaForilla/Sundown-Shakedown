# Todd animation rebuild with PixelLab

Status: proposal for review. No PixelLab generation authorized by this planning document.

## Goal

Replace Todd's mixed animation assets with a consistent set that retains his recognizable face, glasses, beard, clothing, tattoo, and technology theme. Match his established size in the Backyard stage. Standing side kicks should reach the midsection without shrinking his body.

## Current implementation

- Six-frame sheets: idle, walk, kick, punch, crouching punch.
- One six-frame reaction sheet: two frames each for block, hit, and landing.
- Crouching reuses idle with vertical compression; jumping/falling pause a sprite and tilt it; knockout uses a tween.
- Air attacks, special, and Super lack dedicated authored attack sheets.
- Forward movement and retreat share a walk animation.
- Idle carries a laptop, while some attack sheets are empty-handed; this prop transition needs an explicit art decision.
- The J kick currently resolves to the low `crouchLight` move while displaying the new mid-height side kick. Review the visual/gameplay mismatch separately before altering hit rules.
- Today's side-kick changes are uncommitted. Preserve this exact working state before implementation.

## 1. Approve a master reference

Use an existing approved Todd frame as the appearance reference. Prepare a side-view battle stance facing one direction, with fixed proportions and transparent background. Recommend a hands-free fighting stance with the laptop reserved for the special/Super; confirm this choice before creating the set.

PixelLab's current image-animation tools accept at most 256x256 inputs. Todd's existing standing silhouette is about 346 pixels tall, so fitting it to this canvas requires a smaller or redrawn reference. Inspect it at actual game size: fine face and tattoo detail may be reduced. Test a 256x256 canvas with sufficient empty space for extended limbs; do not simply fill the canvas with the standing pose.

## 2. Run a limited pilot

Create an idle loop and a mid side kick. Prefer text animation for subtle idle movement and skeleton-guided animation for the kick, where hip, knee, heel, and planted-foot positions matter. These tools are available through the connected MCP server, but generation quality and trial eligibility still need a real pilot.

Kick sequence: stance, knee chamber, extension, contact, recoil, stance. For text animation, optionally pin the ending to the starting stance. Inspect the actual returned frame count: the connected `animate_image` tool returns the input plus generated frames; skeleton v3 returns one image per supplied skeleton.

Propose a 6-10 generation pilot allowance, subject to the selected tool's stated cost. Check the balance before and after each job. Stop at the agreed allowance and review the result before another batch.

Review both animation previews and the actual game. Accept only if the face/outfit remain recognizable, body proportions stay stable, feet stay grounded, the heel reaches waist height, no limbs clip, and transitions to idle are smooth. Do not force every pose to the same total height: leaning and crouching must naturally lower the head.

## 3. Produce the animation set in batches

| Batch | Clips | Purpose |
|---|---|---|
| Movement | Idle, forward walk, retreat, crouch, jump ascent, fall, landing | Replace reused or transformed movement poses |
| Basic attacks | Standing mid side kick, low kick, standing punch, crouching uppercut, air kick, air punch | Distinct readable actions and stance recovery |
| Reactions | Standing guard, crouching guard, hit reaction, knockout | Real defensive/damage poses rather than compression/rotation |
| Signature moves | Glitch Surge special, System Crash Super | Technology-themed body animation with separate cyan effects |
| Optional polish | Victory pose | New presentation hook; defer until the core set works |

Reuse poses deliberately where they work (for example jump/fall frames), but keep state mappings distinct. Review movement before attacks, reactions before signature moves. Keep prompts and skeleton poses reproducible. Avoid generating a new character for every action.

## 4. Prepare reliable runtime exports

- Keep downloaded originals, prompts, skeletons, seeds, job IDs, and cost records in Todd's art-source package.
- Export equal-sized transparent frame cells with a consistent body anchor and ground baseline.
- Apply one calibrated scale from the approved reference across the set, with wider canvases where attacks need them. Do not independently resize every pose to fill its cell or center every silhouette by its changing bounds.
- Validate alpha, frame count, cell dimensions, clipping, and facing before integration.
- Import returned individual frames directly; avoid reconstructing them from connected components of a generated montage.
- Create versioned runtime assets and retain the current sheets for rollback.

## 5. Integrate and validate

Extend character presentation definitions and Fighter state playback for the new clips. Remove vertical compression/tilting where an authored crouch or airborne pose supplies that movement. Keep Kristen's existing presentation compatible.

Preserve existing damage, reach, cooldowns, match rules, and effective action-lock durations during the initial art replacement. New frame counts must not accidentally change how long a fighter cannot act. Separately decide whether the new standing mid kick should also become a mid-level gameplay attack.

Use existing tests plus targeted regression coverage for any state/timing changes. Run `npm test -- --run` and `npm run build`, then playtest both facings, state transitions, hit interruptions, jump/land, knockout, rematch, and phone landscape sizing. Preview attacks at normal speed and slowed down.

## Budget and approval

Verified balance at planning time: 40 trial generations, 0 used, $0 purchased credits; a separate daily bonus was reported. Base the first plan on the 40 remaining generations without assuming future bonuses or successful retries.

The full set may exceed the trial allocation at 256px, particularly with retries. Quote each batch after the pilot establishes costs and quality. Avoid expensive Pro edits by default and do not rely on the subscription-gated PixMiniMax tool. No paid upgrade is part of this proposal.

First approval: prop choice plus the master-reference/idle/kick pilot and its generation allowance. Later batches depend on review of the pilot.

## Sources

- Current local character definitions, Fighter playback, combat attack mapping, and animation state machine.
- Connected PixelLab MCP tool schemas and read-only account balance, October 12, 2026.
- https://www.pixellab.ai/docs/tools/animate-with-text-new
- https://www.pixellab.ai/docs/tools/animate-with-skeleton
