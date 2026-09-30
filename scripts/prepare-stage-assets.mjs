import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const stageAssets = [
  {
    source: resolve(
      projectRoot,
      'art-source/stages/backyard/concepts/backyard-concept-v3-natural-cool.png',
    ),
    destination: resolve(
      projectRoot,
      'src/content/stages/backyard/assets/backgrounds/backyard-cool.png',
    ),
  },
];

for (const asset of stageAssets) {
  await mkdir(dirname(asset.destination), { recursive: true });
  await sharp(asset.source)
    .resize({
      width: 960,
      height: 540,
      fit: 'cover',
      position: 'centre',
      kernel: sharp.kernel.nearest,
    })
    .png({
      compressionLevel: 9,
      palette: true,
      colours: 256,
      dither: 0.35,
    })
    .toFile(asset.destination);

  console.log(`Prepared ${asset.destination}`);
}

