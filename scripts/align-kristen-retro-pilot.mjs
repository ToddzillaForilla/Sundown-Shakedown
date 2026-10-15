import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
const root='art-source/characters/kristen/pixellab/retro-animation-pilot-20261015';
const manifest=JSON.parse(await readFile(`${root}/manifest.json`));
const measurements=JSON.parse(await readFile(`${root}/measurements.json`));
const clip=measurements.find(c=>c.name==='walk');
await mkdir(`${root}/aligned`,{recursive:true});
const shifts=[];
for(const frame of clip.measurements){
  const dy=251-frame.bounds.bottom;
  if(dy<0||dy>4)throw Error('Unexpected baseline shift; review before aligning.');
  const source=`${root}/walk-${frame.index}.png`;
  const input=await sharp(source).extract({left:0,top:0,width:256,height:256-dy}).png().toBuffer();
  await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input,left:0,top:dy}]).png().toFile(`${root}/aligned/walk-${frame.index}.png`);
  shifts.push({frame:frame.index,dx:0,dy});
}
manifest.clips.walk.reviewFramePrefix='aligned/walk';
manifest.clips.walk.registration={method:'Whole-frame vertical translation only; no scaling or pixel repainting',targetBaseline:251,rawFramesPreserved:true,shifts};
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(shifts));
