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
| Jump | Space | — | Bottom action button |
| Punch | J | Right click | Top action button |
| Kick | K | Left click | Left action button |
| Special (Super) | L, when meter is full | Middle click, when meter is full | Right action button, when available |

- W/Up is reserved and must not jump. Space also starts the game from the title screen. The touch D-pad Up button is visible but intentionally inactive.
- Grounded punch input is ignored while crouching; K/left-click/touch Kick still performs the crouching low kick.
- L dispatches the Super move when the meter is full; there is no separate special-move keyboard slot. Keep move resolution in [CombatAttacks.ts](../src/engine/combat/CombatAttacks.ts) distinct from visual descriptions.
- Touch controls appear on touch-capable, coarse-pointer devices: translucent D-pad bottom-left and four-button diamond bottom-right. Preserve simultaneous direction/attack input and the four active pointers in [config.ts](../src/game/config.ts).
- The touch Super button remains dim and inactive until the meter is full. Desktop readiness is communicated through the HUD rather than a permanent touch overlay.

## Scenes and HUD

- Title, character selection, fight announcements, and post-match presentation use black with restrained amber/red late-1990s arcade styling. Preserve the black global Phaser transition background so purple does not flash between scenes.
- [TitleScene.ts](../src/game/scenes/TitleScene.ts) draws the title in code without Backyard or fighter raster art. Its attract-mode composition, scanlines, logo, `PRESS START`, control legend, copyright, and credit text are deliberate. Propose changes before introducing title artwork or modes.
- Title start input is Enter, Space, or the large pointer/touch zone around `PRESS START`. Preserve the repeated-start guard and short amber flash followed by a black fade to Character Select.
- Keep post-match winner wording compact, without a large enclosing panel. Place the winner's “shakes down the backyard” line directly above the Rematch/Characters buttons along the bottom center, clear of mobile controls.
- Super meters are half-width bars beneath the outside edges of the health bars. They fill inward, turn gold, and show `SUPER READY` when full.

## Mobile layout

[styles.css](../src/styles.css) rotates the game surface into landscape in portrait at `max-width: 820px`; [index.html](../index.html) provides non-interactive `ROTATE TO PLAY` guidance. Preserve safe-area handling, the fitted 16:9 canvas, and the reduced-motion fallback. Keep primary actions large and usable in mobile landscape with touch, keyboard, and mouse support.

## Runtime animation snapshot

The runtime uses authored sheets. Todd's approved retro idle, walk, jump, four-frame landing recovery, standing block, kick, weighted punches, hit reaction, and defeat clip are integrated. Kristen retains her authored landing clip. Verify imports and mappings in [Todd's definition](../src/content/characters/todd/character.ts) and [Kristen's definition](../src/content/characters/kristen/character.ts) before describing or replacing them.

| Fighter | Idle | Walk | Other authored sheets |
|---|---|---|---|
| Todd | 5 frames, 256x256 cells, 6 fps | 9 frames, 256x256 cells, 15 fps | 9-frame jump; 4-frame landing recovery at 18 fps; held pose from the approved 5-frame crouch; held standing guard; 9-frame approved side kick at 33 fps; weighted standing punches at 24 fps; 9-frame jump kick at 27 fps and jump punch at 15 fps; 9-frame hit reaction at 24 fps; 9-frame defeat/KO at 16 fps |
| Kristen | 5 frames, 256x256 cells, 6 fps | 9 frames, 256x256 cells, 10 fps forward moving right and reversed moving left | Kick; primary and 25% alternate punch; block/hit/landing reactions |

The shared [Fighter renderer](../src/engine/combat/Fighter.ts) uses walk while grounded movement is active, authored jump art when available (physics still controls the arc), dedicated crouch/block/hit/landing clips when available, and resumes the appropriate grounded or airborne clip after attacks. Air kick and punch use J and K while airborne. Preserve these transitions when changing sheets, frame rates, or action timing. Fighters without authored crouch art still compress their sprite; fighters without authored jump art tilt the paused sprite. Todd uses an authored defeat clip when knocked out; other fighters retain the code-driven fallback.

“High-Altitude Showdown” is loaded by [TitleScene.ts](../src/game/scenes/TitleScene.ts) and starts on the player's Start input at 35% volume. The global Phaser sound manager loops it continuously through character selection, fights, and rematches without restarting it on scene changes. The supplied MP3 lives in `src/content/audio/`.

Character select and fights share a floating, transparent speaker icon in the top-right corner (click, tap, or M). A slash marks muted music. It mutes only the music, preserves its playback position, and retains the setting across fights, rematches, and returns to character select for the current game session. Pointer presses on the icon do not trigger combat attacks.

Todd's laptop victory plays only when he wins the match (two round wins), starting with the “shakes down” result text, whether he is player or AI. It plays all 13 frames at 8 fps once, then loops the last seven (zero-based frames 6–12) until Rematch or Characters. Source art and a local gameplay review page are in `art-source/characters/todd/victory-laptop-v1/`; regenerate the export with `node scripts/prepare-todd-victory.mjs`. All poses share one scale and y251 foot baseline; the seated pose keeps its natural lower height.

Kristen's drink-and-cheer victory also starts only on a match win, alongside her “shakes down” result text. It plays 27 frames at 12 fps, then holds the last frame until Rematch or Characters. Her source sheet and aligned frames are in `art-source/characters/kristen/victory-drink-v1/`; regenerate with `node scripts/prepare-kristen-victory.mjs`. Its first pose matches the current idle at the same scale, and the export aligns the feet to y251 without resizing individual poses.

Character-specific Super animations/effects and stronger impact sounds remain presentation work. Existing code-driven effects do not establish completion of that work. Use the [fighter-animation workflow](../.agents/skills/fighter-animation/SKILL.md) for animation changes and the [Todd plan](TODD_PIXELLAB_ANIMATION_PLAN.md) for pilot details.
