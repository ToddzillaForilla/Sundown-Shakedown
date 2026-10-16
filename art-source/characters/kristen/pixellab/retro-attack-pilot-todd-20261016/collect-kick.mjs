import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { pixelLabRequest } from '../../../../../scripts/pixellab.mjs';

const root = 'art-source/characters/kristen/pixellab/retro-attack-pilot-todd-20261016';
const manifestPath = `${root}/manifest.json`;
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const clip = manifest.clips.kick;
const job = await pixelLabRequest(`/background-jobs/${clip.jobId}`);
await writeFile(`${root}/kick-job.json`, JSON.stringify(job, null, 2) + '\n');
if (job.status !== 'completed') throw new Error(`Kick job status: ${job.status}`);
const images = job.last_response?.images;
if (!Array.isArray(images) || !images.length) throw new Error('No individual kick frames returned.');
for (const [index, image] of images.entries()) {
  if (image.format !== 'png' || typeof image.base64 !== 'string') throw new Error('Unexpected image encoding.');
  await writeFile(`${root}/kick-${index}.png`, Buffer.from(image.base64.replace(/^data:image\/png;base64,/, ''), 'base64'));
}
const original = await sharp(manifest.source).ensureAlpha().raw().toBuffer();
const first = await sharp(`${root}/kick-0.png`).ensureAlpha().raw().toBuffer();
const last = await sharp(`${root}/kick-${images.length - 1}.png`).ensureAlpha().raw().toBuffer();
Object.assign(clip, {
  status: 'completed', actualFrameCount: images.length,
  chargedGenerations: job.usage?.type === 'generations' ? job.usage.generations : null,
  assetStatus: job.last_response?.asset_status ?? null,
  firstFrameMatchesReferencePixels: original.equals(first),
  lastFrameMatchesReferencePixels: original.equals(last),
});
manifest.status = 'both-clips-collected';
manifest.chargedGenerations = (manifest.clips.punch.chargedGenerations ?? 0) + (clip.chargedGenerations ?? 0);
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ status: job.status, frames: images.length, charged: clip.chargedGenerations, assetStatus: clip.assetStatus }));

