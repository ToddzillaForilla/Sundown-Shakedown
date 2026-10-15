import {readFile, writeFile, copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root=process.argv[2]??'art-source/characters/todd/pixellab/retro-legacy-kick-20261015';
const manifest=JSON.parse(await readFile(`${root}/manifest.json`));
manifest.clips={reference:{actualFrameCount:9,title:manifest.referenceTitle??'Approved old kick — motion reference'}};
for(let i=0;i<9;i++)await copyFile(`${manifest.referenceDirectory??'art-source/characters/todd/pixellab/kick-correction-20261015'}/kick-${i}.png`,`${root}/reference-${i}.png`);
if(manifest.assembly==='recovery-palindrome'&&manifest.jobs.recovery?.status==='completed'){
  const order=[4,3,2,1,0,1,2,3,4];
  for(const [i,source] of order.entries())await copyFile(`${root}/recovery-grounded-${source}.png`,`${root}/kick-${i}.png`);
  manifest.clips.kick={actualFrameCount:order.length,title:'Cleaned kick — candidate'};
  manifest.frameOrder=order;
}else if(manifest.jobs.outbound?.status==='completed'&&manifest.jobs.recovery?.status==='completed'){
  let index=0;
  for(const name of ['outbound','recovery'])for(let i=name==='recovery'?1:0;i<manifest.jobs[name].frameCount;i++)await copyFile(`${root}/${name}-${i}.png`,`${root}/kick-${index++}.png`);
  manifest.clips.kick={actualFrameCount:index,title:manifest.pageTitle?'Cleaned kick — candidate':'Retro Todd — matching kick candidate'};
}
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2));
execFileSync(process.execPath,['scripts/preview-todd-retro-pilot.mjs',root],{stdio:'inherit'});
let html=await readFile(`${root}/review.html`,'utf8');
html=html.replaceAll('Todd — retro animation pilot',manifest.pageTitle??'Todd — old kick style, retro rebuild')
  .replace('article{background','article{width:420px;max-width:100%;background')
  .replace('heading.textContent=titles[clip.name]','heading.textContent=clip.title??titles[clip.name]')
  .replace('All frames share a fixed 1× pixel scale and canvas anchor. The line marks the approved reference\'s foot baseline. Preview rates are for review, not final combat timing.','Old Todd is shown at a fixed 2× scale for motion comparison; retro Todd remains at 1×. Both use fixed anchors throughout each clip. The line marks the standing foot baseline. This is source review, not game integration.')
  .replace('if(im.complete&&im.naturalWidth)c.drawImage(im,64,32);',"if(im.complete&&im.naturalWidth){if(item.name==='reference')c.drawImage(im,28,4,im.naturalWidth*2,im.naturalHeight*2);else c.drawImage(im,64,32);}");
if(manifest.referenceScale===1){
  html=html.replace('Old Todd is shown at a fixed 2× scale for motion comparison; retro Todd remains at 1×. Both use fixed anchors throughout each clip.','Both clips use fixed 1× scale. Cleanup includes vertical foot-anchor corrections; body proportions are not rescaled.')
    .replace("if(item.name==='reference')c.drawImage(im,28,4,im.naturalWidth*2,im.naturalHeight*2);else c.drawImage(im,64,32);","c.drawImage(im,64,32);");
}
await writeFile(`${root}/review.html`,html);
console.log('Old-motion / retro comparison saved.');
