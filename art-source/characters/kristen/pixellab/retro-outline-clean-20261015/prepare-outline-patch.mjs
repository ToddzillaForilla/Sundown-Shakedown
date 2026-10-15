import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const root='art-source/characters/kristen/pixellab/retro-outline-clean-20261015';
const source='art-source/characters/kristen/pixellab/retro-bandana-restored-20261015/concept.png';
const data=await sharp(source).ensureAlpha().raw().toBuffer();
const alpha=(x,y)=>data[(y*256+x)*4+3];
const pixels=[];
for(let y=145;y<=211;y++)for(let x=123;x<=169;x++){
  const i=(y*256+x)*4,[r,g,b,a]=data.subarray(i,i+4);
  const exposed=a>8&&[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([nx,ny])=>alpha(nx,ny)<=8);
  const skin=r>40&&r>g*1.1&&g>b*1.05;
  if(exposed&&skin)pixels.push([x,y,'#'+data.subarray(i,i+4).toString('hex'),'#050202ff']);
}
const changes=[{operation:'patch_pixels',layer:'image',frames:[1],pixels,reason:'Screen-right thigh and calf contain exposed skin-colored edge pixels interrupting the dark contour. Recolor only existing boundary pixels to the existing near-black outline shade; preserve alpha, silhouette and all interior shading.'}];
await writeFile(`${root}/outline-patch.json`,JSON.stringify(changes,null,2));console.log(JSON.stringify(changes));
