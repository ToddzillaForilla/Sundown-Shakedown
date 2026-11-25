# Sundown Shakedown — Approved Project Plan

## Product vision

Sundown Shakedown is a browser-based, retro arcade fighting game that can be shared through an unlisted link and played without installation. Its world is a realistic but exaggerated parody of Todd and Kristen's neighborhood. Real people remain recognizable and likable while their hobbies and harmless habits become spectacular fighting-game abilities.

The name comes from Sundown Drive, the street where the real people represented in the game live. Keep humor an affectionate roast with some bite, never cruel. Personality gags should be visual; any gameplay use must be a deliberate, readable high-risk or fake-out mechanic, never a random unfair penalty.

This plan describes approved direction as well as future goals. See [gameplay and presentation](GAMEPLAY_AND_PRESENTATION.md) for the runtime snapshot and behavior-preservation requirements.

## First playable release

- Player chooses Todd or Kristen; the other fighter is computer-controlled.
- Easy, Normal, and Hard difficulty settings.
- One Backyard stage, with fictionalized Street and Campsite stages reserved for later.
- Best-of-three matches with sixty-second rounds and quick rematches.
- Landscape phone layout with a direction pad and Kick/Punch/Super/Jump diamond. The Super button remains visible but dim and inactive until ready.
- Matching keyboard, mouse, and touch commands. Gamepad input remains a planned input target, not a claim of current support.
- Fast and responsive combat inspired by classic arcade fighters.
- Stylized arcade pixel blood and dramatic finishers without realistic injury, plus a user-facing blood toggle, are approved presentation goals rather than claims of implemented features.
- Original music and stronger impact sounds remain presentation goals; voice acting is deferred.
- Current iPhone, Android, and desktop-browser support targets.

## Character direction

### Todd

- Themes: computer hacking, video games, and technology.
- Style: fast, technical, and combo-focused.
- Harmless roast: falls asleep easily.
- Signature concepts: Quick Patch, Hard Reboot, Glitch Surge, System Crash, and Fatal Error.
- Normal combat is hands-free; reserve the rugged laptop and cyan code effects for signature/Super actions. He has no skateboard or camping theme. The legacy runtime idle still carries a laptop; this describes the approved rebuild direction. See [the Todd plan](TODD_PIXELLAB_ANIMATION_PLAN.md).

### Kristen

- Themes: plants, cooking, and camping.
- Style: space control, traps, and strong mid-range attacks.
- Harmless roast: becomes easily distracted, not confused.
- Signature concepts: Thorn Whip, Cast-Iron Crush, Wildfire Garden, and Campfire Cookout.
- Kristen has no painting theme.

## Art pipeline

Keep real-person likenesses recognizable but highly exaggerated in detailed late-1990s pixel art. The approved visual reference is the cool-natural Backyard concept: slate-blue mountains and sky, pine and sage greens, weathered cedar, neutral stone, and restrained warm amber. Avoid a strong pink/purple cast. Reuse approved Backyard, Todd, and Kristen artwork. Scene UI uses the black, restrained amber/red treatment described in the gameplay reference.

Todd and Kristen have approved concept art, portraits, and authored runtime animation sheets. The photo-based Todd PixelLab pilot remains separate from the game. Inspect current character definitions before describing the live mapping.

1. Approve one detailed standing portrait for each fighter from consented reference material.
2. Test one idle animation at actual phone size.
3. Lock the shared scale, lighting, palette, outline, and detail guide.
4. Produce reusable movement, defense, damage, victory, and defeat animations.
5. Produce character-specific attacks, Super moves, and finishers.
6. Export transparent runtime sprites through a fixed naming and alignment template.
7. Keep editable third-party source art separate from optimized runtime assets.

Use the repository's [fighter-animation skill](../.agents/skills/fighter-animation/SKILL.md) for export, integration, and playback verification. For Todd's rebuild, the photo-based reference and selected tools in the Todd plan supersede the older concept-frame/skeleton proposal.

Real-person likenesses and private jokes require approval before a character is shared. Public builds must not expose exact house numbers or uniquely identifying home details.

## Architecture rules

- The shared combat engine contains no Todd- or Kristen-specific logic.
- Each fighter owns its definition, moves, presentation mapping, and assets.
- Each stage owns its layout, presentation mapping, and assets.
- Preserve a shared command vocabulary across input and computer logic. Gamepad and future network input should use that vocabulary when implemented.
- Timing, speed, damage, meter, input forgiveness, match rules, and presentation intensity remain configurable.
- Runtime assets and editable source artwork remain separate.
- Automated validation catches missing, duplicate, or invalid content definitions.

## Deferred work

- Online multiplayer
- Additional neighbors and family members
- Street and Campsite stages
- Story or tournament mode
- Achievements, leaderboards, and saved progression
- Voice acting
- Public promotion and discovery

