# Sundown Shakedown — Approved Project Plan

## Product vision

Sundown Shakedown is a browser-based, retro arcade fighting game that can be shared through an unlisted link and played without installation. Its world is a realistic but exaggerated parody of Todd and Kristen's neighborhood. Real people remain recognizable and likable while their hobbies and harmless habits become spectacular fighting-game abilities.

## First playable release

- Player chooses Todd or Kristen; the other fighter is computer-controlled.
- Easy, Normal, and Hard difficulty settings.
- One Backyard stage, with fictionalized Street and Campsite stages reserved for later.
- Best-of-three matches with sixty-second rounds and quick rematches.
- Landscape phone layout with a direction pad, Light, Heavy, and a Super button that appears only when the meter is full.
- Matching keyboard and gamepad commands for desktop browsers.
- Fast and responsive combat inspired by classic arcade fighters.
- Stylized pixel blood, finishers, and a user-facing blood toggle.
- Original music and sound effects; voice acting is deferred.
- Current iPhone, Android, and desktop-browser support targets.

## Character direction

### Todd

- Themes: computer hacking, video games, and technology.
- Style: fast, technical, and combo-focused.
- Harmless roast: falls asleep easily.
- Signature concepts: Quick Patch, Hard Reboot, Glitch Surge, System Crash, and Fatal Error.
- Todd carries a rugged laptop with cyan code effects; he has no skateboard or camping theme.

### Kristen

- Themes: plants, cooking, and camping.
- Style: space control, traps, and strong mid-range attacks.
- Harmless roast: becomes easily distracted.
- Signature concepts: Thorn Whip, Cast-Iron Crush, Wildfire Garden, and Campfire Cookout.
- Kristen has no painting theme.

## Art pipeline

The approved visual reference is the cool-natural Backyard concept: late-1990s arcade pixel art with slate-blue mountains and sky, pine and sage greens, weathered cedar, neutral stone, and warm amber reserved for the setting sun and practical lights.

Todd and Kristen each have an approved first-pass character concept. Optimized versions are used for character selection and as temporary static fighters until animation-ready sprite sheets replace them.

1. Approve one detailed standing portrait for each fighter from consented reference material.
2. Test one idle animation at actual phone size.
3. Lock the shared scale, lighting, palette, outline, and detail guide.
4. Produce reusable movement, defense, damage, victory, and defeat animations.
5. Produce character-specific attacks, Super moves, and finishers.
6. Export transparent runtime sprites through a fixed naming and alignment template.
7. Keep editable third-party source art separate from optimized runtime assets.

Real-person likenesses and private jokes require approval before a character is shared. Public builds must not expose exact house numbers or uniquely identifying home details.

## Architecture rules

- The shared combat engine contains no Todd- or Kristen-specific logic.
- Each fighter owns its definition, moves, presentation mapping, and assets.
- Each stage owns its layout, presentation mapping, and assets.
- Shared controls emit the same commands whether input comes from touch, keyboard, gamepad, computer logic, or a future network connection.
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

