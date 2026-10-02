import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sourcePath = fileURLToPath(
  new URL('../art-source/branding/sundown-shakedown-app-icon.svg', import.meta.url),
);
const outputDirectory = fileURLToPath(new URL('../public/icons/', import.meta.url));

await mkdir(outputDirectory, { recursive: true });

for (const size of [180, 192, 512]) {
  await sharp(sourcePath, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(`${outputDirectory}/sundown-shakedown-${size}.png`);
}
