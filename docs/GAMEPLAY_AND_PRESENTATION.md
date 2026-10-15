# Gameplay and presentation

These are behavior-preservation requirements and a runtime snapshot checked against local code on October 15, 2026. Recheck the cited implementation when changing behavior or describing the live game. Approved visual/product direction is in [PROJECT_PLAN.md](PROJECT_PLAN.md).

## Match flow and combat

- Flow: Title -> Character Select -> Fight -> post-match Rematch or Characters. New fights and rematches must create a clean Round 1 match state. Preserve regression coverage in [session.test.ts](../src/game/session.test.ts) and [MatchState.test.ts](../src/engine/combat/MatchState.test.ts).
- Rounds last 60 seconds; first to two round wins takes the match. Drawn rounds award neither fighter a win. See [MatchState.ts](../src/engine/combat/MatchState.ts).
- Blocking is contextual: holding away becomes a guard while the opponent attacks; otherwise it must continue to move the fighter. Preserve standing/crouching guard rules and chip-damage coverage in [CombatBlocking.test.ts](../src/engine/combat/CombatBlocking.test.ts). Relevant logic is in [PlayerInput.ts](../src/game/input/PlayerInput.ts), [CombatBlocking.ts](../src/engine/combat/CombatBlocking.ts), and [FightScene.ts](../src/game/scenes/FightScene.ts).

## Controls

Current bindings are implemented in [FightScene.ts](../src/game/scenes/FightScene.ts) and [TouchControls.ts](../src/game/input/TouchControls.ts).

| Action | Keyboard | Mouse | Touch |
|---|---|---|---|
| Move | A/D or Left/Right | — | D-pad Left/Right |
| Crouch | S or Down | — | D-pad Down |
| Kick | J | Left click | Left action button |
| Punch | K | Right click | Top action button |
| Crouching uppercut | S+K or Down+K | Crouch + right click | Down + Punch |
| Jump | L | — | Bottom action button |
| Super | I, when meter is full | Middle click, when meter is full | Right action button, when available |

- W/Up is reserved and must not jump. The touch D-pad Up button is visible but intentionally inactive.
- I dispatches Super; it is not a separate Special key. Keep move resolution in [CombatAttacks.ts](../src/engine/combat/CombatAttacks.ts) distinct from visual descriptions.
- Touch controls appear on touch-capable, coarse-pointer devices: translucent D-pad bottom-left and four-button diamond bottom-right. Preserve simultaneous direction/attack input and the four active pointers in [config.ts](../src/game/config.ts).
- The touch Super button remains dim and inactive until the meter is full. Desktop readiness is communicated through the HUD rather than a permanent touch overlay.

## Scenes and HUD

- Title, character selection, fight announcements, and post-match presentation use black with restrained amber/red late-1990s arcade styling. Preserve the black global Phaser transition background so purple does not flash between scenes.
- [TitleScene.ts](../src/game/scenes/TitleScene.ts) draws the title in code without Backyard or fighter raster art. Its attract-mode composition, scanlines, logo, `PRESS START`, control legend, copyright, and credit text are deliberate. Propose changes before introducing title artwork or modes.
- Title start input is Enter, Space, or the large pointer/touch zone around `PRESS START`. Preserve the repeated-start guard and short amber flash followed by a black fade to Character Select.
- Keep post-match winner wording compact, without a large enclosing panel. Rematch/Characters buttons sit along the bottom center, clear of mobile controls.
- Super meters are half-width bars beneath the outside edges of the health bars. They fill inward, turn gold, and show `SUPER READY` when full.

## Mobile layout

[styles.css](../src/styles.css) rotates the game surface into landscape in portrait at `max-width: 820px`; [index.html](../index.html) provides non-interactive `ROTATE TO PLAY` guidance. Preserve safe-area handling, the fitted 16:9 canvas, and the reduced-motion fallback. Keep primary actions large and usable in mobile landscape with touch, keyboard, and mouse support.

## Runtime animation snapshot

The runtime uses older authored sheets; the photo-based Todd PixelLab pilot is not integrated. Verify imports and mappings in [Todd's definition](../src/content/characters/todd/character.ts) and [Kristen's definition](../src/content/characters/kristen/character.ts) before describing or replacing them.

| Fighter | Idle | Walk | Other authored sheets |
|---|---|---|---|
| Todd | 6 frames, 260x362 cells, 6 fps | 6 frames, 260x362 cells, 10 fps | Kick, punch, crouching punch; block/hit/landing reactions |
| Kristen | 6 frames, 260x362 cells, 7 fps | 6 frames, 260x362 cells, 10 fps | Kick, punch; block/hit/landing reactions |

The shared [Fighter renderer](../src/engine/combat/Fighter.ts) uses walk while grounded movement is active, pauses motion during jump/fall, uses dedicated block/hit/landing clips when available, and resumes the appropriate grounded clip afterward. Preserve these transitions when changing sheets, frame rates, or action timing. Crouching currently compresses idle; jump/fall tilt the paused sprite; KO is code-driven.

Dedicated authored KO/victory clips, character-specific Super animations/effects, and original music/stronger impact sounds remain presentation work. Existing code-driven effects do not establish completion of that work. Use the [fighter-animation workflow](../.agents/skills/fighter-animation/SKILL.md) for animation changes and the [Todd plan](TODD_PIXELLAB_ANIMATION_PLAN.md) for pilot details.
