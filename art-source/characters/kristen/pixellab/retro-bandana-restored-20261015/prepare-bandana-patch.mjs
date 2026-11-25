import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const root='art-source/characters/kristen/pixellab/retro-bandana-restored-20261015';
const previous='art-source/characters/kristen/pixellab/retro-hiking-socks-20261015/concept.png';
const detail='art-source/characters/kristen/pixellab/retro-bandana-balance-20261015/concept-0.png';
const a=await sharp(previous).ensureAlpha().raw().toBuffer();
const b=await sharp(detail).ensureAlpha().raw().toBuffer();
const blue=new Set(['0b224fff','364c7dff','596ea5ff']);
const cloth=new Set([...blue,'2d484aff','31323bff','041515ff']);
const pixels=[];
for(let y=68;y<=89;y++){
  const xs=[];for(let x=115;x<=139;x++)if(blue.has(a.subarray((y*256+x)*4,(y*256+x)*4+4).toString('hex')))xs.push(x);
  if(!xs.length)continue;
  for(let x=115;x<=139;x++){
    const i=(y*256+x)*4, old=a.subarray(i,i+4).toString('hex'), replacement=b.subarray(i,i+4).toString('hex');
    const inside=y<=72?cloth.has(old):x>=xs[0]&&x<=xs.at(-1);
    if(inside&&old!==replacement)pixels.push([x,y,'#'+old,'#'+replacement]);
  }
}
const changes=[{operation:'patch_pixels',layer:'image',frames:[1],pixels,reason:'Restore the previous hiking-socks sprite entirely, copying only the detailed bandana interior from the later Pro revision. User rejected leg narrowing; no body pixels change.'}];
await writeFile(`${root}/bandana-patch.json`,JSON.stringify(changes,null,2));
console.log(JSON.stringify(changes));
