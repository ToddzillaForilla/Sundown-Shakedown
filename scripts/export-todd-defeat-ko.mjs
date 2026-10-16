import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const frameWidth = 256;
const frameHeight = 256;
const sourceDirectory = 'art-source/characters/todd/pixellab/retro-hit-ko-revision-20261016';
const outputPath = 'src/content/characters/todd/assets/sprites/todd-defeat-ko-v1.png';
const sources = [
  ...Array.from({ length: 7 }, (_, index) => `${sourceDirectory}/defeat-${String(index).padStart(2, '0')}.png`),
  `${sourceDirectory}/defeat-07-cleanup-user.png`,
  `${sourceDirectory}/defeat-08.png`,
];

const sourcePixels = [];
for (const input of sources) {
  const metadata = await sharp(input).metadata();
  if (metadata.width !== frameWidth || metadata.height !== frameHeight || !metadata.hasAlpha) {
    throw new Error(`Unexpected source frame ${input}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`);
  }
  sourcePixels.push(await sharp(input).ensureAlpha().raw().toBuffer());
}

await mkdir('src/content/characters/todd/assets/sprites', { recursive: true });
const sheetWidth = frameWidth * sourcePixels.length;
const sheetPixels = Buffer.alloc(sheetWidth * frameHeight * 4);
for (let y = 0; y < frameHeight; y += 1) {
  const rowBytes = frameWidth * 4;
  for (let index = 0; index < sourcePixels.length; index += 1) {
    const sourceOffset = y * rowBytes;
    const destinationOffset = (y * sheetWidth + index * frameWidth) * 4;
    sourcePixels[index].copy(sheetPixels, destinationOffset, sourceOffset, sourceOffset + rowBytes);
  }
}

await sharp(sheetPixels, { raw: { width: sheetWidth, height: frameHeight, channels: 4 } })
  .png()
  .toFile(outputPath);

const metadata = await sharp(outputPath).metadata();
if (metadata.width !== sheetWidth || metadata.height !== frameHeight) {
  throw new Error(`Unexpected defeat export dimensions: ${metadata.width}x${metadata.height}`);
}
for (let index = 0; index < sourcePixels.length; index += 1) {
  const frame = await sharp(outputPath)
    .extract({ left: index * frameWidth, top: 0, width: frameWidth, height: frameHeight })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const source = sourcePixels[index];
  for (let pixel = 0; pixel < frameWidth * frameHeight * 4; pixel += 4) {
    if (frame[pixel + 3] !== source[pixel + 3]) {
      throw new Error(`Defeat frame ${index} alpha differs at pixel ${pixel / 4}`);
    }
    if (source[pixel + 3] !== 0 && !frame.subarray(pixel, pixel + 4).equals(source.subarray(pixel, pixel + 4))) {
      throw new Error(`Defeat frame ${index} visible color differs at pixel ${pixel / 4}`);
    }
  }
}

console.log(`Exported ${sourcePixels.length} exact ${frameWidth}x${frameHeight} defeat frames to ${outputPath}`);
