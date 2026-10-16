import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const sourceDirectory = 'art-source/characters/todd/pixellab/retro-legacy-kick-20261015';
const outputPath = 'src/content/characters/todd/assets/sprites/todd-kick-retro-v1.png';
const frameWidth = 256;
const frameHeight = 256;
const frameCount = 9;

const sourcePixels = [];
for (let index = 0; index < frameCount; index += 1) {
  const input = `${sourceDirectory}/kick-${index}.png`;
  const metadata = await sharp(input).metadata();
  if (metadata.width !== frameWidth || metadata.height !== frameHeight || !metadata.hasAlpha) {
    throw new Error(`Unexpected source frame ${input}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`);
  }
  sourcePixels.push(await sharp(input).ensureAlpha().raw().toBuffer());
}

await mkdir('src/content/characters/todd/assets/sprites', { recursive: true });
const sheetWidth = frameWidth * frameCount;
const sheetPixels = Buffer.alloc(sheetWidth * frameHeight * 4);
for (let y = 0; y < frameHeight; y += 1) {
  for (let index = 0; index < frameCount; index += 1) {
    const rowBytes = frameWidth * 4;
    const sourceOffset = y * rowBytes;
    const destinationOffset = (y * sheetWidth + index * frameWidth) * 4;
    sourcePixels[index].copy(sheetPixels, destinationOffset, sourceOffset, sourceOffset + rowBytes);
  }
}
await sharp(sheetPixels, { raw: { width: sheetWidth, height: frameHeight, channels: 4 } })
  .png()
  .toFile(outputPath);

const metadata = await sharp(outputPath).metadata();
if (metadata.width !== frameWidth * frameCount || metadata.height !== frameHeight) {
  throw new Error(`Unexpected export dimensions: ${metadata.width}x${metadata.height}`);
}
for (let index = 0; index < frameCount; index += 1) {
  const frame = await sharp(outputPath)
    .extract({ left: index * frameWidth, top: 0, width: frameWidth, height: frameHeight })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const frameBytes = frameWidth * frameHeight * 4;
  const source = sourcePixels[index];
  for (let pixel = 0; pixel < frameBytes; pixel += 4) {
    if (frame[pixel + 3] !== source[pixel + 3]) {
      throw new Error(`Export frame ${index} alpha differs at pixel ${pixel / 4}`);
    }
    if (source[pixel + 3] !== 0 && !frame.subarray(pixel, pixel + 4).equals(source.subarray(pixel, pixel + 4))) {
      throw new Error(`Export frame ${index} visible color differs at pixel ${pixel / 4}`);
    }
  }
}

console.log(`Exported ${frameCount} ${frameWidth}x${frameHeight} frames with matching alpha and visible pixels to ${outputPath}`);
