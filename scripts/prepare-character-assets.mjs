import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Legacy Kristen exports; Todd uses the dedicated retro export scripts.
const characters = [
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

  await mkdir(dirname(spriteDestination), { recursive: true });

  const trimmed = sharp(source).trim({
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  await trimmed
    .clone()
    .resize({ height: 384, fit: 'inside', kernel: sharp.kernel.nearest })
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.35 })
    .toFile(spriteDestination);

  console.log(`Prepared ${character.id} fallback fighter asset`);
}

async function prepareAnimationSheetFromComponents(
  sourcePath,
  destinationPath,
  label,
  animationName,
  options = {},
) {
  const {
    poseScale = 0.56,
    frameWidth = 260,
    frameHeight = 362,
  } = options;
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const visited = new Uint8Array(info.width * info.height);
  const components = [];

  for (let seedIndex = 0; seedIndex < visited.length; seedIndex += 1) {
    if (visited[seedIndex] || data[seedIndex * info.channels + 3] <= 8) continue;
    const pixels = [];
    const queue = [seedIndex];
    visited[seedIndex] = 1;
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;
    for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
      const pixelIndex = queue[queueIndex];
      pixels.push(pixelIndex);
      const x = pixelIndex % info.width;
      const y = Math.floor(pixelIndex / info.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const neighborX = x + offsetX;
          const neighborY = y + offsetY;
          if (neighborX < 0 || neighborX >= info.width || neighborY < 0 || neighborY >= info.height) continue;
          const neighborIndex = neighborY * info.width + neighborX;
          if (visited[neighborIndex] || data[neighborIndex * info.channels + 3] <= 8) continue;
          visited[neighborIndex] = 1;
          queue.push(neighborIndex);
        }
      }
    }
    if (pixels.length >= 1000) components.push({ pixels, minX, minY, maxX, maxY });
  }

  const poses = components
    .sort((a, b) => b.pixels.length - a.pixels.length)
    .slice(0, 6)
    .sort((a, b) => a.minX - b.minX);
  if (poses.length !== 6) throw new Error(`Expected six connected ${label} poses, found ${poses.length}`);

  const composites = [];
  for (let frameIndex = 0; frameIndex < poses.length; frameIndex += 1) {
    const pose = poses[frameIndex];
    const poseWidth = pose.maxX - pose.minX + 1;
    const poseHeight = pose.maxY - pose.minY + 1;
    const poseData = Buffer.alloc(poseWidth * poseHeight * 4);
    for (const pixelIndex of pose.pixels) {
      const sourceX = pixelIndex % info.width;
      const sourceY = Math.floor(pixelIndex / info.width);
      const destinationIndex = ((sourceY - pose.minY) * poseWidth + sourceX - pose.minX) * 4;
      const sourceIndex = pixelIndex * info.channels;
      poseData[destinationIndex] = data[sourceIndex];
      poseData[destinationIndex + 1] = data[sourceIndex + 1];
      poseData[destinationIndex + 2] = data[sourceIndex + 2];
      poseData[destinationIndex + 3] = data[sourceIndex + 3];
    }
    const outputWidth = Math.round(poseWidth * poseScale);
    const outputHeight = Math.round(poseHeight * poseScale);
    const poseBuffer = await sharp(poseData, {
      raw: { width: poseWidth, height: poseHeight, channels: 4 },
    })
      .resize({ width: outputWidth, height: outputHeight, fit: 'fill', kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();
    composites.push({
      input: poseBuffer,
      left: frameIndex * frameWidth + Math.round((frameWidth - outputWidth) / 2),
      top: frameHeight - 5 - outputHeight,
    });
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  await sharp({
    create: {
      width: frameWidth * 6,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.25 })
    .toFile(destinationPath);

  console.log(`Prepared ${label} six-frame ${animationName} animation sheet from connected poses`);
}

await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-reactions-sheet-v1.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-reactions-sheet-v1.png'),
  'Kristen',
  'reaction',
  { poseScale: 0.5334, frameWidth: 320 },
);

