import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { pixelLabRequest } from './pixellab.mjs';
const root = process.argv[3] ?? 'art-source/characters/todd/pixellab/retro-revisions-20261015';
await mkdir(root, { recursive: true });
const manifestPath = `${root}/manifest.json`;
const command = process.argv[2];
if (command === 'collect') {
  const manifest = JSON.parse(await readFile(manifestPath));
  for (const [name, record] of Object.entries(manifest.jobs)) {
    const job = await pixelLabRequest(`/background-jobs/${record.jobId}`);
    await writeFile(`${root}/${name}-job.json`, JSON.stringify(job, null, 2));
    record.status = job.status;
    if (job.status === 'completed') {
      const images = job.last_response?.images ?? (job.last_response?.image ? [job.last_response.image] : []);
      if (!images.length) throw new Error(`Missing images: ${name}`);
      for (const [i, im] of images.entries()) await writeFile(`${root}/${name}-${i}.png`, Buffer.from(im.base64, 'base64'));
      record.frameCount = images.length;
      record.usage = job.usage;
    }
    console.log(JSON.stringify({name,jobId:record.jobId,status:record.status,frameCount:record.frameCount,usage:record.usage}));
  }
  await writeFile(manifestPath, JSON.stringify(manifest,null,2));
} else if (command === 'patches') {
  const old = 'art-source/characters/todd/pixellab/retro-animation-pilot-20261015';
  const result = [];
  for (const [name, frame, dx, dy] of [['idle',1,-1,2],['walk',7,2,-7]]) {
    const source = await sharp(`${old}/${name}-0.png`).ensureAlpha().raw().toBuffer();
    const target = await sharp(`${old}/${name}-${frame}.png`).ensureAlpha().raw().toBuffer();
    const rgba = (data,x,y) => '#'+data.subarray((y*256+x)*4,(y*256+x)*4+4).toString('hex');
    const pixels=[];
    for(let y=38;y<=47;y++) for(let x=104;x<=115;x++) {
      const expected=rgba(target,x+dx,y+dy), replacement=rgba(source,x,y);
      if(expected!==replacement) pixels.push([x+dx,y+dy,expected,replacement]);
    }
    result.push({name,frame,region:[104+dx,38+dy,115+dx,47+dy],changes:[{operation:'patch_pixels',layer:'image',frames:[1],pixels,reason:'Restore clear far lens and complete black rim from the reference, aligned to head motion.'}]});
  }
  await writeFile(`${root}/glasses-decisions.json`,JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
}
