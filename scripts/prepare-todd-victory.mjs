import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const folder = 'art-source/characters/todd/victory-laptop-v1';
await mkdir(folder, { recursive: true });
const source = `${folder}/source.png`;
if (process.argv[2]) await copyFile(process.argv[2], source);
const frames = [];
const measurements = [];
for (let index = 0; index < 13; index++) {
  const raw = await sharp(source)
    .extract({ left: index % 4 * 768, top: Math.floor(index / 4) * 768, width: 768, height: 768 })
    .resize(256, 256, { kernel: 'nearest' }).ensureAlpha().raw().toBuffer();
  // One common scale and pivot; only correct the two-pixel seated ground offset.
  const shiftY = index >= 2 ? -2 : 0;
  const aligned = Buffer.alloc(256 * 256 * 4);
  for (let y = 0; y < 256; y++) {
    if (y + shiftY < 0 || y + shiftY >= 256) continue;
    raw.copy(aligned, (y + shiftY) * 256 * 4, y * 256 * 4, (y + 1) * 256 * 4);
  }
  const xs = [], ys = [];
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    if (aligned[(y * 256 + x) * 4 + 3]) { xs.push(x); ys.push(y); }
  }
  const bounds = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
  if (bounds.left <= 0 || bounds.right >= 255 || bounds.top <= 0 || bounds.bottom !== 251) {
    throw new Error(`Unexpected frame ${index} bounds: ${JSON.stringify(bounds)}`);
  }
  measurements.push({ frame: index, shiftY, ...bounds });
  const png = await sharp(aligned, { raw: { width: 256, height: 256, channels: 4 } }).png().toBuffer();
  await writeFile(`${folder}/frame-${index}.png`, png);
  frames.push({ input: png, left: index * 256, top: 0 });
}
await sharp({ create: { width: 13 * 256, height: 256, channels: 4, background: '#00000000' } })
  .composite(frames).png().toFile('src/content/characters/todd/assets/sprites/todd-victory-laptop-v1.png');
await writeFile(`${folder}/manifest.json`, JSON.stringify({
  source: 'User-supplied pixellab-sits-down-cross-legged-with-a--1792108745138-3x.png',
  sourceGrid: { columns: 4, rows: 4, cellSize: 768, usedFrames: 13 },
  frameSize: 256, frameRate: 8, loopFrames: [6, 7, 8, 9, 10, 11, 12],
  nativeFacing: -1, measurements,
}, null, 2) + '\n');
console.log('Prepared 13 victory frames at a common scale and y251 baseline.');
