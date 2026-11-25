import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const folder = 'art-source/characters/kristen/victory-drink-v1';
await mkdir(folder, { recursive: true });
const source = `${folder}/source.png`;
if (process.argv[2]) await copyFile(process.argv[2], source);
const frames = [], measurements = [];
for (let index = 0; index < 27; index++) {
  const raw = await sharp(source)
    .extract({ left: index % 6 * 768, top: Math.floor(index / 6) * 768, width: 768, height: 768 })
    .resize(256, 256, { kernel: 'nearest' }).ensureAlpha().raw().toBuffer();
  const shiftY = index === 25 ? 4 : 0;
  const aligned = Buffer.alloc(256 * 256 * 4);
  for (let y = 0; y < 256 - shiftY; y++) {
    raw.copy(aligned, (y + shiftY) * 256 * 4, y * 256 * 4, (y + 1) * 256 * 4);
  }
  const xs = [], ys = [];
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    if (aligned[(y * 256 + x) * 4 + 3]) { xs.push(x); ys.push(y); }
  }
  const bounds = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
  if (bounds.top <= 0 || bounds.bottom !== 251) throw new Error(`Unexpected frame ${index} bounds`);
  measurements.push({ frame: index, shiftY, ...bounds });
  const png = await sharp(aligned, { raw: { width: 256, height: 256, channels: 4 } }).png().toBuffer();
  await writeFile(`${folder}/frame-${index}.png`, png);
  frames.push({ input: png, left: index * 256, top: 0 });
}
await sharp({ create: { width: 27 * 256, height: 256, channels: 4, background: '#00000000' } })
  .composite(frames).png().toFile('src/content/characters/kristen/assets/sprites/kristen-victory-drink-v1.png');
await writeFile(`${folder}/manifest.json`, JSON.stringify({
  source: 'User-supplied pixellab-Reach-into-a-pocket-to-pull-ou-1792695634290-3x.png',
  sourceGrid: { columns: 6, rows: 5, cellSize: 768, usedFrames: 27 },
  frameSize: 256, frameRate: 12, holdFrame: 26, nativeFacing: -1,
  note: 'The tossed can exits the right edge of source frame 24; preserved as supplied. One common scale and pivot match the idle pose.',
  measurements,
}, null, 2) + '\n');
console.log('Prepared 27 victory frames at a common scale and y251 baseline.');
