# Sundown Shakedown

A browser-first, two-dimensional neighborhood fighting game starring Todd and Kristen. The game uses detailed pixel-art characters, exaggerated hobby-inspired powers, a good-natured roast tone, and mobile-friendly four-button controls.

## Current foundation

- Phaser, TypeScript, and Vite
- Responsive landscape game canvas
- Title and character-select scenes
- Todd and Kristen as selectable fighters
- Easy, Normal, and Hard computer opponents
- Approved cool-natural Backyard pixel-art stage
- Approved Todd and Kristen portraits with authored idle, walk, attack, and reaction sheets
- Code-driven crouch/airborne transformations, knockout, and character effects
- Touch, keyboard, and mouse controls
- Health, power meter, blocking, jumping, attacks, rounds, and rematches
- Character- and stage-centered content folders

The approved Backyard and older authored fighter animation sets are integrated. Todd's photo-based PixelLab pilot is available for source-art review and is not mapped into the playable game. Runtime exports live inside each character or stage package, while editable source art remains under `art-source`.

## Controls

| Action | Keyboard | Mouse | Touch |
|---|---|---|---|
| Move | A/D or Left/Right | — | Direction pad Left/Right |
| Crouch | S or Down | — | Direction pad Down |
| Kick | J | Left click | Left action button |
| Punch | K | Right click | Top action button |
| Jump | L | — | Bottom action button |
| Crouching uppercut | S + K or Down + K | Crouch + right click | Down + Punch |
| Super | I when meter is full | Middle click when meter is full | Right action button when meter is full |

W/Up and touch D-pad Up are reserved and do not jump. Holding away retreats normally and becomes a guard while the opponent attacks. Jumping fighters can cross over one another once they have enough clearance. The touch Super button remains visible but dim and inactive until ready.

## Commands

```powershell
npm install
npm run dev
npm run build
npm test
npm run preview
```

Use the URL printed by Vite; the preview remains available only while its server runs. Phone access requires the computer's current LAN address and network reachability.

See [the project plan](docs/PROJECT_PLAN.md) for product and architecture direction, [gameplay and presentation](docs/GAMEPLAY_AND_PRESENTATION.md) for detailed runtime behavior, and [PixelLab access](docs/PIXELLAB_API.md) for asset tooling. The [Todd animation plan](docs/TODD_PIXELLAB_ANIMATION_PLAN.md) records the pilot and remaining rebuild work.

