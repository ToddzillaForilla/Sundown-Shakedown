import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const characters = [
  {
    id: 'todd',
    source: 'art-source/characters/todd/concepts/todd-fighter-concept-v2-laptop.png',
  },
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
  const portraitDestination = resolve(
    projectRoot,
    `src/content/characters/${character.id}/assets/portraits/${character.id}-portrait.png`,
  );

  await mkdir(dirname(spriteDestination), { recursive: true });
  await mkdir(dirname(portraitDestination), { recursive: true });

  const trimmed = sharp(source).trim({
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  await trimmed
    .clone()
    .resize({ height: 384, fit: 'inside', kernel: sharp.kernel.nearest })
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.35 })
    .toFile(spriteDestination);

  await trimmed
    .clone()
    .resize({ width: 320, height: 320, fit: 'cover', position: 'attention' })
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.35 })
    .toFile(portraitDestination);

  console.log(`Prepared ${character.id} fighter and portrait assets`);
}

async function prepareIdleSheet(sourcePath, destinationPath, sourceFrameEdges, label) {
  const idleFrameWidth = 220;
  const idleFrameHeight = 362;
  const idleFrameCount = 6;
  const sourceMetadata = await sharp(sourcePath).metadata();
  const alignedIdleFrames = [];

  await mkdir(dirname(destinationPath), { recursive: true });
  for (let frameIndex = 0; frameIndex < idleFrameCount; frameIndex += 1) {
    const sourceLeft = sourceFrameEdges[frameIndex];
    const sourceRight = sourceFrameEdges[frameIndex + 1];
    const frameBuffer = await sharp(sourcePath)
      .extract({ left: sourceLeft, top: 0, width: sourceRight - sourceLeft, height: sourceMetadata.height })
      .resize({ height: idleFrameHeight, kernel: sharp.kernel.nearest })
      .ensureAlpha()
      .png()
      .toBuffer();
    const { data, info } = await sharp(frameBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const cleanedData = Buffer.from(data);
    const edgeGuard = 7;
    for (let y = 0; y < info.height; y += 1) {
      if (frameIndex > 0) {
        for (let x = 0; x < edgeGuard; x += 1) cleanedData[(y * info.width + x) * info.channels + 3] = 0;
      }
      if (frameIndex < idleFrameCount - 1) {
        for (let x = info.width - edgeGuard; x < info.width; x += 1) {
          cleanedData[(y * info.width + x) * info.channels + 3] = 0;
        }
      }
    }

    const visited = new Uint8Array(info.width * info.height);
    for (let seedY = 0; seedY < info.height; seedY += 1) {
      for (let seedX = 0; seedX < info.width; seedX += 1) {
        const seedIndex = seedY * info.width + seedX;
        if (visited[seedIndex] || cleanedData[seedIndex * info.channels + 3] <= 8) continue;
        const component = [];
        const queue = [seedIndex];
        visited[seedIndex] = 1;
        for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
          const pixelIndex = queue[queueIndex];
          component.push(pixelIndex);
          const x = pixelIndex % info.width;
          const y = Math.floor(pixelIndex / info.width);
          for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
              if (offsetX === 0 && offsetY === 0) continue;
              const neighborX = x + offsetX;
              const neighborY = y + offsetY;
              if (neighborX < 0 || neighborX >= info.width || neighborY < 0 || neighborY >= info.height) continue;
              const neighborIndex = neighborY * info.width + neighborX;
              if (visited[neighborIndex] || cleanedData[neighborIndex * info.channels + 3] <= 8) continue;
              visited[neighborIndex] = 1;
              queue.push(neighborIndex);
            }
          }
        }
        if (component.length < 80) {
          for (const pixelIndex of component) cleanedData[pixelIndex * info.channels + 3] = 0;
        }
      }
    }

    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        if (cleanedData[(y * info.width + x) * info.channels + 3] <= 8) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) continue;
    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    const cleanedFrameBuffer = await sharp(cleanedData, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    }).png().toBuffer();
    const content = await sharp(cleanedFrameBuffer)
      .extract({ left: minX, top: minY, width: contentWidth, height: contentHeight })
      .png()
      .toBuffer();
    alignedIdleFrames.push({
      input: content,
      left: frameIndex * idleFrameWidth + Math.round((idleFrameWidth - contentWidth) / 2),
      top: Math.max(0, 356 - contentHeight + 1),
    });
  }

  await sharp({
    create: {
      width: idleFrameWidth * idleFrameCount,
      height: idleFrameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(alignedIdleFrames)
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.25 })
    .toFile(destinationPath);

  console.log(`Prepared ${label} six-frame idle animation sheet`);
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
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-idle-sheet-v2-laptop.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-idle-sheet-v2-laptop.png'),
  'Todd',
  'idle',
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-idle-sheet-v1.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-idle-sheet-v1.png'),
  'Kristen',
  'idle',
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-walk-sheet-v1-hands-free.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-walk-sheet-v1-hands-free.png'),
  'Kristen',
  'walk',
  { poseScale: 0.5334 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-walk-sheet-v5-idle-scale.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-walk-sheet-v5-idle-scale.png'),
  'Todd',
  'walk',
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-kick-attack-sheet-v2.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-kick-attack-sheet-v2.png'),
  'Todd',
  'kick attack',
  { frameWidth: 320 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-punch-attack-sheet-v7-arm-continuity.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-punch-attack-sheet-v7-arm-continuity.png'),
  'Todd',
  'punch attack',
  { poseScale: 0.821, frameWidth: 320, frameHeight: 430 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-crouch-punch-attack-sheet-v1.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-crouch-punch-attack-sheet-v1.png'),
  'Todd',
  'crouching punch attack',
  { frameWidth: 320, frameHeight: 430 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-kick-attack-sheet-v2.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-kick-attack-sheet-v2.png'),
  'Kristen',
  'kick attack',
  { poseScale: 0.5334, frameWidth: 320 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-punch-attack-sheet-v3.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-punch-attack-sheet-v3.png'),
  'Kristen',
  'punch attack',
  { poseScale: 0.6061, frameWidth: 320, frameHeight: 430 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/todd/animations/todd-reactions-sheet-v1.png'),
  resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-reactions-sheet-v1.png'),
  'Todd',
  'reaction',
  { frameWidth: 320 },
);
await prepareAnimationSheetFromComponents(
  resolve(projectRoot, 'art-source/characters/kristen/animations/kristen-reactions-sheet-v1.png'),
  resolve(projectRoot, 'src/content/characters/kristen/assets/sprites/kristen-reactions-sheet-v1.png'),
  'Kristen',
  'reaction',
  { poseScale: 0.5334, frameWidth: 320 },
);

// The concept illustration intentionally has an atmospheric backdrop. Runtime
// fighter and portrait assets come from a truly transparent animation frame.
const toddLaptopIdleRuntime = resolve(
  projectRoot,
  'src/content/characters/todd/assets/sprites/todd-idle-sheet-v2-laptop.png',
);
const toddLaptopFrameCell = await sharp(toddLaptopIdleRuntime)
  .extract({ left: 0, top: 0, width: 260, height: 362 })
  .png()
  .toBuffer();
const toddLaptopFirstFrame = await sharp(toddLaptopFrameCell)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(toddLaptopFirstFrame)
  .resize({ height: 384, fit: 'inside', kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.25 })
  .toFile(resolve(projectRoot, 'src/content/characters/todd/assets/sprites/todd-concept-fighter.png'));

await sharp(toddLaptopFirstFrame)
  .resize({
    width: 320,
    height: 320,
    fit: 'contain',
    kernel: sharp.kernel.nearest,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0.25 })
  .toFile(resolve(projectRoot, 'src/content/characters/todd/assets/portraits/todd-portrait.png'));

console.log('Prepared transparent Todd laptop fighter and portrait assets');

