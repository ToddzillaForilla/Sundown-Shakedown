import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
import {pixelLabRequest} from '../../../../../scripts/pixellab.mjs';
const root='art-source/characters/kristen/pixellab/animation-completion-20261016';
const manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));
const clip=manifest.submittedJobs[0];
const job=await pixelLabRequest(`/background-jobs/${clip.jobId}`);
if(job.status!=='completed'){console.log(JSON.stringify({status:job.status}));process.exit(0);}
await writeFile(`${root}/kick-job.json`,JSON.stringify(job));
const images=job.last_response?.images;
if(!images?.length)throw Error('No returned images');
const measurements=[];const composites=[];
for(const [i,im] of images.entries()){
 if(im.format!=='png'||!im.base64)throw Error('Unexpected encoding');
 const b=Buffer.from(im.base64.replace(/^data:image\/png;base64,/,''),'base64');
 await writeFile(`${root}/kick-${i}.png`,b);
 const {data,info}=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let minX=info.width,minY=info.height,maxX=-1,maxY=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>8){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 measurements.push({frame:i,width:info.width,height:info.height,minX,maxX,minY,maxY,silhouetteHeight:maxY-minY+1,edgeContact:minX===0||minY===0||maxX===info.width-1||maxY===info.height-1});
 composites.push({input:b,left:(i%3)*256,top:Math.floor(i/3)*280+24});
 composites.push({input:Buffer.from(`<svg width="256" height="24"><text x="10" y="18" fill="white">Frame ${i}</text></svg>`),left:(i%3)*256,top:Math.floor(i/3)*280});
}
await sharp({create:{width:768,height:Math.ceil(images.length/3)*280,channels:4,background:'#202630'}}).composite(composites).png().toFile(`${root}/kick-contact.png`);
await writeFile(`${root}/kick-measurements.json`,JSON.stringify(measurements,null,2));
clip.status='completed';clip.actualFrameCount=images.length;clip.chargedGenerations=job.usage?.generations??null;
manifest.chargedGenerations=clip.chargedGenerations;manifest.balanceAfter=await pixelLabRequest('/balance');manifest.status='kick-pilot-awaiting-review';
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
const html=`<!doctype html><html><meta charset="utf-8"><title>Kristen kick pilot</title><style>body{background:#17202b;color:#eee;font:18px system-ui;margin:24px}canvas{background:#263342;image-rendering:pixelated}button,select{font:inherit;margin:10px}section{display:flex;gap:20px;flex-wrap:wrap}img{image-rendering:pixelated}</style><h1>Kristen — kick pilot</h1><p>Source review only. 8 generations. Current idle reference at left; candidate at right. Both at native pixel scale.</p><button id="pause">Pause</button><select id="speed"><option value="12">12 fps</option><option value="4">4 fps slow</option><option value="33">33 fps combat preview</option></select><button id="flip">Reverse facing</button><button id="step">Next frame</button><p id="label"></p><section><canvas id="ref" width="256" height="256"></canvas><canvas id="clip" width="256" height="256"></canvas></section><p>Check leftward extension, planted support foot, proportions, and return to guard. Preview rate does not change combat timing.</p><img src="kick-contact.png" width="768"><script>const frames=Array.from({length:${images.length}},(_,i)=>{const im=new Image();im.src='kick-'+i+'.png';return im});const idle=new Image();idle.src='../retro-animation-pilot-20261015/idle-0.png';let playing=true,flipped=false,frame=0,last=0;const draw=(id,im)=>{const c=document.getElementById(id).getContext('2d');c.clearRect(0,0,256,256);c.strokeStyle='#91a68e';c.beginPath();c.moveTo(0,251.5);c.lineTo(256,251.5);c.stroke();c.save();if(flipped){c.translate(256,0);c.scale(-1,1)}if(im.complete&&im.naturalWidth)c.drawImage(im,0,0);c.restore()};document.getElementById('pause').onclick=()=>playing=!playing;document.getElementById('flip').onclick=()=>flipped=!flipped;document.getElementById('step').onclick=()=>{playing=false;frame=(frame+1)%frames.length};function tick(t){if(playing&&t-last>1000/Number(document.getElementById('speed').value)){frame=(frame+1)%frames.length;last=t}draw('ref',idle);draw('clip',frames[frame]);document.getElementById('label').textContent='Frame '+frame;requestAnimationFrame(tick)}requestAnimationFrame(tick);</script></html>`;
await writeFile(`${root}/review.html`,html);
console.log(JSON.stringify({status:clip.status,frames:images.length,charged:clip.chargedGenerations,measurements}));
