# Todd Option B motion pilot — October 15, 2026

Four source clips generated from the approved Option B with Animate with Text v3 and matching last-frame guidance. Original reference and all raw returned frames are preserved. No gameplay assets or combat timing were changed. Artistic approval is pending.

Open `review.html` through Vite. Rebuild with `node scripts/preview-todd-retro-pilot.mjs`. Controls offer normal/slow playback, pause, frame stepping, and a mirrored preview. Mirroring is not a separately authored facing and does not establish anatomical tattoo correctness from the opposite side.

| Clip | Returned frames | Silhouette height | Foot bottom y | Review |
| --- | --- | --- | --- | --- |
| Idle | 5 | 232–236px | 251 | Planted feet; 4px breathing/head bob, larger than requested. |
| Walk | 9 | 235–244px | 245–251 | Clear alternating steps and guard, but vertical drift needs correction before integration. |
| Punch | 9 | 232–237px | 251–252 | Clear extension/retraction; punches with tattooed arm rather than clearly meeting the requested lead-hand action. Small baseline drift. |
| Kick | 9 | 230–237px | 245–251 | Fails side-kick requirement: knee remains bent, no long horizontal straight-leg extension. Supporting foot also rises 6px. Requires another pass before acceptance. |

All 32 returned frames are transparent 256×256 PNGs with no opaque edge contact (alpha threshold >8). Preview uses fixed canvas placement and scale; no per-frame normalization hides drift. Likeness, glasses, beard and bare wrists broadly persist. Tattoo detail varies during motion. Returned first/last frames have minor pixel differences from the reference; they are not exact copies. Contact sheets and source playback do not establish correct game transitions or runtime scale.

## Generation accounting

Manifest stores prompts, seeds, jobs and original references. Per-job usage receipts report 4 + 8 + 8 + 8 = 28 generations, matching the quote. Live balance was 4,961 before this pilot and 4,941 after completion: a 20-generation account delta. These disagree by 8; retain both observations rather than asserting the account was charged 28. No additional generation was submitted to reconcile the discrepancy.

## Validation

Measured every returned frame; visually inspected all contact sheets and the source browser preview. All 79 repository tests and the production build passed. Build retains its large-chunk warning. No runtime integration or gameplay playtest of these new frames has occurred. Review the pilot before retries, a broader animation set, or Kristen's matching design.
