import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const root='art-source/characters/kristen/pixellab/retro-bandana-balance-20261015';
const input=await sharp(`${root}/concept-0.png`).ensureAlpha().raw().toBuffer();
const output=Buffer.from(input);
const knots=[[153,1],[161,0.82],[172,0.82],[183,0.9],[195,0.8],[204,0.82],[211,1]];
const rowScale=y=>{for(let i=1;i<knots.length;i++){const [end,b]=knots[i], [start,a]=knots[i-1];if(y<=end)return a+(b-a)*(y-start)/(end-start);}return 1;};
for(let y=154;y<211;y++){
  const runs=[];let start=null;
  for(let x=65;x<=175;x++){
    const opaque=x<175&&input[(y*256+x)*4+3]>8;
    if(opaque&&start===null)start=x;
    if(!opaque&&start!==null){runs.push([start,x-1]);start=null;}
  }
  if(runs.length!==2)throw Error(`Expected two distinct legs at row ${y}`);
  for(const [left,right] of runs){
    const width=right-left+1, target=Math.max(1,Math.round(width*rowScale(y)));
    const newLeft=Math.round((left+right-target+1)/2);
    for(let x=left;x<=right;x++)output.fill(0,(y*256+x)*4,(y*256+x+1)*4);
    for(let dx=0;dx<target;dx++){
      const sx=left+Math.round(dx*(width-1)/(target-1));
      input.copy(output,(y*256+newLeft+dx)*4,(y*256+sx)*4,(y*256+sx+1)*4);
    }
  }
}
const pixels=[];
for(let y=150;y<211;y++)for(let x=65;x<175;x++){
  const i=(y*256+x)*4,a=input.subarray(i,i+4),b=output.subarray(i,i+4);
  if(!a.equals(b))pixels.push([x,y,'#'+a.toString('hex'),'#'+b.toString('hex')]);
}
const changes=[{operation:'patch_pixels',layer:'image',frames:[1],pixels,reason:'Inspected thighs/calves are oversized versus torso. Narrow each leg around its existing centerline with smooth taper through hips, knees and ankles; preserve every row height, socks, boots, face, bandana and upper body.'}];
await writeFile(`${root}/leg-patches.json`,JSON.stringify(changes,null,2));
console.log(JSON.stringify(changes));
