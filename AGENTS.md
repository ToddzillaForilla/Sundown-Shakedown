# Sundown Shakedown

## Project and architecture

Browser-first, playful neighborhood fighting game starring Todd and Kristen. The first polished slice is selectable Todd/Kristen against AI in the Backyard, with Easy/Normal/Hard difficulty; online PvP is deferred. Use the installed Phaser, TypeScript, Vite, and Vitest versions and existing patterns.

- `src/engine/`: shared combat rules and AI; keep character-specific definitions and assets in `src/content/characters/` and stage content in `src/content/stages/`.
- `src/game/scenes/`: scene flow and presentation; `src/game/input/`: keyboard, mouse, and touch; `src/game/layout.ts` and `src/styles.css`: layout.
- `art-source/`: editable source artwork; runtime exports belong with their character or stage package. Tests live alongside code as `*.test.ts`.

Preserve these module boundaries and the custom Phaser/TypeScript/Vite foundation. Keep the shared combat engine free of character-specific logic. External fighting games may inform implementation techniques; propose any wholesale architecture migration and explain its tradeoffs first. Product and architecture decisions live in [the project plan](docs/PROJECT_PLAN.md).

## Working rules and safeguards

- Inspect relevant code and applicable instructions before editing. Make scoped changes, preserve unrelated edits and staged changes, and do not reset the worktree. Avoid unrelated refactors or new dependencies without a clear need.
- Ask questions only when missing information materially affects the result; explain meaningful tradeoffs plainly.
- Commit or push only when requested. Before reporting a push, verify the commit, worktree status, and successful remote update.
- Build and test project iterations locally by default. Do not upload, sync, publish, deploy, or otherwise update GPT Sites with a new build unless Todd explicitly requests that Sites update. A request to iterate, fix, build, test, or preview the game does not authorize a Sites update; each Sites update requires its own explicit request.
- Never print or commit tokens or secrets. Keep credentials outside browser code, logs, and asset manifests; never use a `VITE_` variable for a secret. Keep Node-only asset clients outside the browser game.
- Keep real-person humor fictionalized and good-natured. Obtain explicit approval before adding or sharing future neighbor/family likenesses; public builds must exclude exact house numbers and uniquely identifying home details.
- Preserve approved detailed late-1990s pixel art and the cool, natural palette. Before substantial visual changes, inspect the scene, assets, and relevant plans, then propose a direction. Do not overwrite approved source art without approval; keep experiments separate.
- Prefer local or no-new-cost approaches. Confirm scope and allowance before paid generation batches; historical balances and estimates are not spending authorization.

## Commands

Run from the repository root:

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies when needed |
| `npm run dev` | Start Vite with network access enabled |
| `npm test` | Run the Vitest suite |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Serve the production build locally |

Use the URL printed by Vite. Before claiming a preview is live, check or restart its server; leave the requested scene visible for visual handoffs. Phone testing requires the computer's current LAN address and network reachability.

## Validation and completion

- For code changes, run relevant tests and the production build; broaden coverage when shared behavior changes. Combat refactors need meaningful coverage of affected timing, damage, blocking, state transitions, and round outcomes.
- For UI/input changes, check the affected flow in-game, including mobile landscape and relevant touch, keyboard, and mouse controls when available. Preserve usable mobile actions and simultaneous touch input.
- For fighter-animation changes, validate source dimensions, silhouette scale, foot baseline, anchors, and runtime transitions using the animation skill below. Source previews alone do not establish game integration or correct playback.
- For documentation-only edits, check statements against actual code/commands; do not add tests just for documentation.
- Before completing work, review the final diff and report what changed, what was verified, and any checks that could not be completed. Interrupted commands do not count as passing checks.

## Task-specific guidance

Read the relevant reference before changing its behavior. Check current code before describing controls or live asset mappings.

| Task | Required reference or workflow |
|---|---|
| Gameplay, scenes, HUD, controls, mobile layout | [Gameplay and presentation](docs/GAMEPLAY_AND_PRESENTATION.md) |
| Character identity, tone, visual direction, product scope | [Project plan](docs/PROJECT_PLAN.md) |
| Fighter sheets, playback, or animation integration | [Fighter-animation skill](.agents/skills/fighter-animation/SKILL.md) |
| Todd animation rebuild or photo pilot | [Todd animation plan](docs/TODD_PIXELLAB_ANIMATION_PLAN.md) |
| PixelLab asset generation | [PixelLab-generation skill](.agents/skills/pixellab-generation/SKILL.md) |
| PixelLab authentication, REST/MCP, preview tooling | [PixelLab access](docs/PIXELLAB_API.md) |
