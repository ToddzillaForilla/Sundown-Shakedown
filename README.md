# Sundown Shakedown

A browser-first, two-dimensional neighborhood fighting game starring Todd and Kristen. The game uses detailed pixel-art characters, exaggerated hobby-inspired powers, a good-natured roast tone, and a mobile-friendly two-button control scheme.

## Current foundation

- Phaser, TypeScript, and Vite
- Responsive landscape game canvas
- Title and character-select scenes
- Todd and Kristen as selectable fighters
- Easy, Normal, and Hard computer opponents
- Approved cool-natural Backyard pixel-art stage
- Approved Todd and Kristen concept art used as static fighter and selection assets
- Temporary code-driven idle, movement, attack, hit, knockout, and character-effect animation
- Touch and keyboard controls
- Health, power meter, blocking, jumping, attacks, rounds, and rematches
- Character- and stage-centered content folders

The approved Todd and Kristen concepts are integrated as optimized static fighter assets. They remain temporary until full animation sprite sheets are produced. The approved Backyard concept is also integrated as an optimized runtime asset. Runtime exports live inside each character or stage package, while editable source art remains under `art-source`.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move and block | WASD or arrow keys | Direction pad |
| Jump | W or Up arrow | Up |
| Crouch | S or Down arrow | Down |
| Light attack | J or Z; left mouse button | L |
| Heavy attack | K or X; right mouse button | H |
| Directional special | Down + toward + Heavy | Down + toward + H |
| Super | L, C, Space, or middle mouse when meter is full | Appears when meter is full |

Walking away from the opponent visibly retreats while blocking; a small `GUARD` label confirms that defense is active. Jumping fighters can cross over one another once they have enough clearance.

## Commands

```powershell
npm install
npm run dev
npm run build
npm test
```

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the approved product and architecture plan.

