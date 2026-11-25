import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { pixelLabRequest } from './pixellab.mjs';

const root = 'art-source/characters/todd/pixellab/retro-animation-pilot-20261015';
const manifestPath = `${root}/manifest.json`;
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const name = process.argv[2];
if (!Object.hasOwn(manifest.clips, name ?? '')) throw new Error('Specify idle, walk, punch or kick.');
const clip = manifest.clips[name];
if (!clip.jobId) throw new Error(`No submitted job for ${name}.`);
const job = await pixelLabRequest(`/background-jobs/${clip.jobId}`);
await writeFile(`${root}/${name}-job.json`, JSON.stringify(job, null, 2) + '\n');
if (job.status !== 'completed') {
  console.log(JSON.stringify({ name, status: job.status }));
  if (job.status === 'failed') process.exitCode = 1;
} else {
  const images = job.last_response?.images;
  if (!Array.isArray(images) || !images.length) throw new Error(`No individual frames returned for ${name}.`);
  for (const [index, image] of images.entries()) {
    if (image.format !== 'png' || typeof image.base64 !== 'string') throw new Error('Unexpected image encoding; preserve receipt and inspect before export.');
    await writeFile(`${root}/${name}-${index}.png`, Buffer.from(image.base64.replace(/^data:image\/png;base64,/, ''), 'base64'));
  }
  const original = await sharp('art-source/characters/todd/pixellab/retro-option-b-20261015/concept.png').ensureAlpha().raw().toBuffer();
  const first = await sharp(`${root}/${name}-0.png`).ensureAlpha().raw().toBuffer();
  const last = await sharp(`${root}/${name}-${images.length - 1}.png`).ensureAlpha().raw().toBuffer();
  Object.assign(clip, { status: 'completed', actualFrameCount: images.length,
    chargedGenerations: job.usage?.type === 'generations' ? job.usage.generations : null,
    firstFrameMatchesReferencePixels: original.equals(first), lastFrameMatchesReferencePixels: original.equals(last) });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ name, ...Object.fromEntries(Object.entries(clip).filter(([key]) => key !== 'request')) }));
}
