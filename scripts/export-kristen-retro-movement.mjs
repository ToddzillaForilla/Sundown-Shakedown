import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const sourceRoot = 'art-source/characters/kristen/pixellab/retro-animation-pilot-20261015';
const outputRoot = 'src/content/characters/kristen/assets/sprites';
const cellSize = 256;

async function readValidatedFrame(path) {
  const image = await sharp(path).ensureAlpha().png().toBuffer();
  const metadata = await sharp(image).metadata();
  if (metadata.width !== cellSize || metadata.height !== cellSize || !metadata.hasAlpha) {
    throw new Error(`Unexpected source frame ${path}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`);
  }
  return image;
}

async function exportSheet(name, paths) {
  const frames = await Promise.all(paths.map(readValidatedFrame));
  const outputPath = `${outputRoot}/${name}.png`;
  await sharp({
    create: {
      width: cellSize * frames.length,
      height: cellSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(frames.map((input, index) => ({ input, left: index * cellSize, top: 0 })))
    .png()
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  if (metadata.width !== cellSize * frames.length || metadata.height !== cellSize) {
    throw new Error(`Unexpected export dimensions for ${outputPath}: ${metadata.width}x${metadata.height}`);
  }
  for (const [index, source] of frames.entries()) {
    const outputFrame = await sharp(outputPath)
      .extract({ left: index * cellSize, top: 0, width: cellSize, height: cellSize })
      .png()
      .toBuffer();
    const sourcePixels = await sharp(source).raw().toBuffer();
    const outputPixels = await sharp(outputFrame).raw().toBuffer();
    for (let pixel = 0; pixel < sourcePixels.length; pixel += 4) {
      if (sourcePixels[pixel + 3] !== outputPixels[pixel + 3]) {
        throw new Error(`Export frame ${index} changed alpha at pixel ${pixel / 4} in ${outputPath}`);
      }
      if (sourcePixels[pixel + 3] > 0 && !sourcePixels.subarray(pixel, pixel + 4).equals(outputPixels.subarray(pixel, pixel + 4))) {
        throw new Error(`Export frame ${index} changed visible color at pixel ${pixel / 4} in ${outputPath}`);
      }
    }
  }

  console.log(`Exported ${frames.length} ${cellSize}x${cellSize} frames to ${outputPath}`);
}

const manifest = JSON.parse(await readFile(`${sourceRoot}/manifest.json`, 'utf8'));
if (manifest.clips.idle.actualFrameCount !== 5 || manifest.clips.walk.actualFrameCount !== 9) {
  throw new Error('Unexpected approved Kristen idle/walk frame counts.');
}

await mkdir(outputRoot, { recursive: true });
await exportSheet('kristen-idle-retro-v1', Array.from({ length: 5 }, (_, i) => `${sourceRoot}/idle-${i}.png`));
await exportSheet('kristen-walk-direction-combo-v1', Array.from({ length: 9 }, (_, i) => `${sourceRoot}/aligned/walk-${i}.png`));
