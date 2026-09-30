import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const characters = [
  {
    id: 'todd',
    source: 'art-source/characters/todd/concepts/todd-fighter-concept-v1.png',
  },
  {
    id: 'kristen',
    source: 'art-source/characters/kristen/concepts/kristen-fighter-concept-v1.png',
  },
];

for (const character of characters) {
  const source = resolve(projectRoot, character.source);
  const spriteDestination = resolve(
    projectRoot,
    `src/content/characters/${character.id}/assets/sprites/${character.id}-concept-fighter.png`,
  );
  const portraitDestination = resolve(
    projectRoot,
    `src/content/characters/${character.id}/assets/portraits/${character.id}-portrait.png`,
  );

  await mkdir(dirname(spriteDestination), { recursive: true });
  await mkdir(dirname(portraitDestination), { recursive: true });

  const trimmed = sharp(source).trim({
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  await trimmed
    .clone()
    .resize({ height: 384, fit: 'inside', kernel: sharp.kernel.nearest })
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.35 })
    .toFile(spriteDestination);

  await trimmed
    .clone()
    .resize({ width: 320, height: 320, fit: 'cover', position: 'attention' })
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.35 })
    .toFile(portraitDestination);

  console.log(`Prepared ${character.id} fighter and portrait assets`);
}

