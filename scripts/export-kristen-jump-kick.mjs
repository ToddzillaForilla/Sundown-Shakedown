import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const folder = join(root, 'art-source/characters/kristen/pixellab/jump-kick-20261022');
await mkdir(folder, { recursive: true });
const source = join(folder, 'jump-kick-source-3x.png');
if (process.argv[2]) await copyFile(process.argv[2], source);
const metadata = await sharp(source).metadata();
if (metadata.width !== 2304 || metadata.height !== 2304 || !metadata.hasAlpha) {
  throw new Error('Expected the transparent 2304x2304 PixelLab 3x grid.');
}
const frames = [];
const measurements = [];
for (let index = 0; index < 7; index += 1) {
  // Keep the common source grid/pivot; never center or stretch individual poses.
  const frame = await sharp(source)
    .extract({ left: (index % 3) * 768, top: Math.floor(index / 3) * 768, width: 768, height: 768 })
    .resize(256, 256, { kernel: 'nearest' }).png().toBuffer();
  const { data, info } = await sharp(frame).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let bounds = [256, 256, -1, -1];
  for (let y = 0; y < 256; y += 1) for (let x = 0; x < 256; x += 1) {
    if (!data[(y * info.width + x) * 4 + 3]) continue;
    bounds = [Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x), Math.max(bounds[3], y)];
  }
  if (bounds[2] < 0 || bounds[0] === 0 || bounds[1] === 0 || bounds[2] === 255 || bounds[3] === 255) {
    throw new Error(`Frame ${index} is empty or clipped at a cell edge.`);
  }
  measurements.push({ frame: index, bounds, silhouetteHeight: bounds[3] - bounds[1] + 1 });
  await writeFile(join(folder, `jump-kick-${index}.png`), frame);
  frames.push(frame);
}
await sharp({ create: { width: 1792, height: 256, channels: 4, background: '#00000000' } })
  .composite(frames.map((input, index) => ({ input, left: index * 256, top: 0 })))
  .png().toFile(join(root, 'src/content/characters/kristen/assets/sprites/kristen-jump-kick-v1.png'));
await writeFile(join(folder, 'manifest.json'), JSON.stringify({
  source: process.argv[2] ? basename(process.argv[2]) : 'pixellab-The-character-executes-a-sudde-1792680487318-3x.png',
  approval: 'User supplied and requested jump-kick integration on 2026-10-22.',
  grid: { columns: 3, rows: 3, sourceCell: 768, frameCount: 7, order: 'row-major; last two cells unused' },
  export: { cell: 256, resize: 'nearest', nativeFacing: -1, frameRate: 21, perFrameAlignment: false },
  reference: 'Idle silhouette is 224 px with foot baseline y251; first frame matches idle scale and baseline. Airborne poses retain authored offsets; no per-frame normalization. Existing airLight cooldown is 350 ms.',
  durationMs: 7 / 21 * 1000,
  measurements,
}, null, 2) + '\n');
console.log(measurements);
