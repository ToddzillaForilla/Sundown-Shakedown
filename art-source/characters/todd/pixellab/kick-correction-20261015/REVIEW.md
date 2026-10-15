# Todd side-kick correction — October 15, 2026

One user-approved Text v3 correction attempt, capped at 10 subscription generations. Quoted and charged: 4 generations. Live balance changed from 5,000 to 4,996; USD credits remained $0. No retries submitted. Request, character ID, job ID, group ID and original download URLs are in `manifest.json`.

## Source review

- Preserved all nine returned transparent PNGs (one reference plus eight generated frames) on their original 164×164 canvas. No individual cropping, resizing, or alignment edits.
- Frame 7 (zero-based index 6) has a substantially straighter, nearly horizontal waist-height kick. Chamber, extension, recoil and return to guard are visible in the contact sheet. Identity remains recognizable through glasses, beard, clothing and tattoo.
- All frames have clear canvas margins. Alpha bounds use a threshold of 8/255. Lowest visible pixel varies from y=137 to y=139, versus y=132 to y=139 in the original kick. This measures vertical bottom variation, not proof of a perfectly planted support foot.
- Starting and ending silhouette heights are 103px, matching the original reference. Mid-action height reaches 114px as Todd straightens and turns; body scale is not inferred from height alone. Some torso/head rise and horizontal support-foot movement remain visible.
- Source preview loaded in the browser; normal and slow controls and right-facing reversal were checked with sampled screenshots. These samples do not prove continuous playback smoothness or exact frame order. Review screenshot captures slow right-facing extension.
- The comparison uses a shared bottom canvas anchor and 2× native scale, with all clips at 12fps (slow is 0.35×). The reference idle is included for proportions, not its final runtime timing.

## Status

Improved source candidate, pending user artistic acceptance. Not exported or integrated into gameplay. Runtime scale, facing transitions, attack timing, phone-size readability and combat interaction remain unverified. Original pilot and runtime artwork are preserved.

Rebuild the contact sheet, measurements and standalone review with `node scripts/preview-todd-kick-correction.mjs`. Serve `review.html` through Vite for playback, frame stepping and facing reversal.

Validation: preview generator executed successfully; Node syntax check passed; 79 tests passed; production build passed with the existing large-chunk warning. No gameplay files changed.
