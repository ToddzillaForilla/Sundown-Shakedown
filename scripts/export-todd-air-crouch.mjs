import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const frameWidth = 256;
const frameHeight = 256;
const exports = [
  {
    name: 'crouch',
    output: 'src/content/characters/todd/assets/sprites/todd-crouch-retro-v1.png',
    sources: Array.from({ length: 5 }, (_, index) => `art-source/characters/todd/pixellab/retro-air-crouch-20261015/crouch-${index}.png`),
  },
  {
    name: 'jump kick',
    output: 'src/content/characters/todd/assets/sprites/todd-jump-kick-retro-v1.png',
    sources: [
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-0.png',
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-1.png',
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-3.png',
      'art-source/characters/todd/pixellab/retro-kick-cleanup-20261015/kick-3.png',
      'art-source/characters/todd/pixellab/retro-kick-cleanup-20261015/kick-4.png',
      'art-source/characters/todd/pixellab/retro-kick-cleanup-20261015/kick-5.png',
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-6.png',
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-7.png',
      'art-source/characters/todd/pixellab/retro-jump-block-20261015/jump-8.png',
    ],
  },
  {
    name: 'jump punch',
    output: 'src/content/characters/todd/assets/sprites/todd-jump-punch-retro-v1.png',
    sources: Array.from({ length: 9 }, (_, index) => `art-source/characters/todd/pixellab/retro-air-crouch-20261015/jumpPunch-${index}.png`),
  },
];

await mkdir('src/content/characters/todd/assets/sprites', { recursive: true });
for (const animation of exports) {
  const sourcePixels = [];
  for (const input of animation.sources) {
    const metadata = await sharp(input).metadata();
    if (metadata.width !== frameWidth || metadata.height !== frameHeight || !metadata.hasAlpha) {
      throw new Error(`Unexpected source frame ${input}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`);
    }
    sourcePixels.push(await sharp(input).ensureAlpha().raw().toBuffer());
  }

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
    .toFile(animation.output);

  const metadata = await sharp(animation.output).metadata();
  if (metadata.width !== sheetWidth || metadata.height !== frameHeight) {
    throw new Error(`Unexpected ${animation.name} export dimensions: ${metadata.width}x${metadata.height}`);
  }
  for (let index = 0; index < sourcePixels.length; index += 1) {
    const frame = await sharp(animation.output)
      .extract({ left: index * frameWidth, top: 0, width: frameWidth, height: frameHeight })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const source = sourcePixels[index];
    for (let pixel = 0; pixel < frameWidth * frameHeight * 4; pixel += 4) {
      if (frame[pixel + 3] !== source[pixel + 3]) {
        throw new Error(`${animation.name} frame ${index} alpha differs at pixel ${pixel / 4}`);
      }
      if (source[pixel + 3] !== 0 && !frame.subarray(pixel, pixel + 4).equals(source.subarray(pixel, pixel + 4))) {
        throw new Error(`${animation.name} frame ${index} visible color differs at pixel ${pixel / 4}`);
      }
    }
  }
  console.log(`Exported ${animation.name}: ${sourcePixels.length} exact ${frameWidth}x${frameHeight} frames to ${animation.output}`);
}
