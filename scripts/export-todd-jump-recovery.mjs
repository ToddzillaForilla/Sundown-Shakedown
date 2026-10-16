import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = join(dirname(fileURLToPath(import.meta.url)), '../art-source/characters/todd/pixellab/retro-jump-recovery-20261016');
const targetGroundLine = 251;

for (let index = 1; index <= 4; index += 1) {
  const filename = `recovery-${String(index).padStart(2, '0')}.png`;
  const source = join(folder, filename);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== 256 || info.height !== 256) {
    throw new Error(`${filename} is ${info.width}x${info.height}; expected 256x256.`);
  }

  let minY = info.height;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + 3] === 0) continue;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxY < 0) throw new Error(`${filename} is fully transparent.`);

  const offsetY = targetGroundLine - maxY;
  if (minY + offsetY < 0 || maxY + offsetY >= info.height) {
    throw new Error(`${filename} cannot be anchored to y=${targetGroundLine} without clipping.`);
  }

  const aligned = join(folder, `recovery-${String(index).padStart(2, '0')}-aligned.png`);
  await sharp({ create: { width: 256, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: data, raw: info, left: 0, top: offsetY }])
    .png()
    .toFile(aligned);
  console.log(`${filename} -> y offset ${offsetY}; aligned opaque baseline y=${targetGroundLine}`);
}

const checkerboard = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="292"><defs><pattern id="c" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#12191d"/><rect width="12" height="12" fill="#1d272d"/><rect x="12" y="12" width="12" height="12" fill="#1d272d"/></pattern></defs><rect width="1024" height="292" fill="url(#c)"/><g fill="#d4dee3" font-family="Arial,sans-serif" font-size="15" text-anchor="middle"><text x="128" y="282">1 · absorb</text><text x="384" y="282">2 · rebound</text><text x="640" y="282">3 · rise</text><text x="896" y="282">4 · ready</text></g></svg>`);
const previewFrames = await Promise.all(
  Array.from({ length: 4 }, (_, index) =>
    sharp(join(folder, `recovery-${String(index + 1).padStart(2, '0')}-aligned.png`)).png().toBuffer(),
  ),
);
await sharp(checkerboard)
  .composite(previewFrames.map((input, index) => ({ input, left: index * 256, top: 0 })))
  .png()
  .toFile(join(folder, 'recovery-review.png'));
console.log('Created recovery-review.png.');

const runtimeSheet = join(dirname(fileURLToPath(import.meta.url)), '../src/content/characters/todd/assets/sprites/todd-jump-recovery-v1.png');
const runtimeFrames = await Promise.all(
  Array.from({ length: 4 }, (_, index) =>
    sharp(join(folder, `recovery-${String(index + 1).padStart(2, '0')}-aligned.png`)).png().toBuffer(),
  ),
);
await sharp({ create: { width: 1024, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(runtimeFrames.map((input, index) => ({ input, left: index * 256, top: 0 })))
  .png()
  .toFile(runtimeSheet);
console.log(`Created runtime sheet ${runtimeSheet}.`);
