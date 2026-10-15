import {readFile, writeFile, copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const root='art-source/characters/todd/pixellab/retro-revisions-20261015';
const old='art-source/characters/todd/pixellab/retro-animation-pilot-20261015';
const manifest=JSON.parse(await readFile(`${root}/manifest.json`));
for(const name of ['punchRight','kickOut','kickBack']) if(manifest.jobs[name].status!=='completed') throw Error(`${name} not complete`);
manifest.clips={};
for(const [name,count] of [['idle',5],['walk',9],['punch',9]]) {
  for(let i=0;i<count;i++) await copyFile(`${old}/${name}-${i}.png`,`${root}/${name}-${i}.png`);
  manifest.clips[name]={actualFrameCount:count};
}
for(const [name,index] of [['idle',1],['walk',7]]) {
  const original=await sharp(`${old}/${name}-${index}.png`).ensureAlpha().raw().toBuffer();
  const fixed=await sharp(`${root}/${name}-fixed.png`).ensureAlpha().raw().toBuffer();
  const decision=JSON.parse(await readFile(`${root}/glasses-decisions.json`)).find(d=>d.name===name);
  const [x0,y0,x1,y1]=decision.region;
  let changed=0;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++) {
    const i=(y*256+x)*4;
    if(!original.subarray(i,i+4).equals(fixed.subarray(i,i+4))) {
      changed++;
      if(x<x0||x>x1||y<y0||y>y1)throw Error('Pixel change outside approved glasses region');
    }
  }
  manifest.glasses[name].verifiedChangedPixels=changed;
  await copyFile(`${root}/${name}-fixed.png`,`${root}/${name}-${index}.png`);
}
await copyFile(`${root}/idle-frame3-fixed.png`,`${root}/idle-2.png`);
const kickSource='art-source/characters/todd/pixellab/retro-kick-cleanup-20261015';
for(let i=0;i<9;i++)await copyFile(`${kickSource}/kick-${i}.png`,`${root}/kick-${i}.png`);
manifest.clips.punch.title='Left-arm punch';
manifest.clips.punchRight={actualFrameCount:9,title:'Right-arm punch'};
manifest.clips.kick={actualFrameCount:9,title:'Cleaned side kick',source:`${kickSource}/manifest.json`};
for(let i=0;i<9;i++) {
  await copyFile(`${old}/punch-${i}.png`,`${root}/alternating-${i}.png`);
  await copyFile(`${root}/punchRight-${i}.png`,`${root}/alternating-${i+9}.png`);
}
manifest.clips.alternating={actualFrameCount:18,title:'Random punches — left arm favored'};
const movementSource='art-source/characters/todd/pixellab/retro-jump-block-20261015';
let movement;
try { movement=JSON.parse(await readFile(`${movementSource}/manifest.json`)); }
catch(error) { if(error.code!=='ENOENT')throw error; }
if(movement&&['jump','block'].every(name=>movement.jobs[name].status==='completed')) {
  const additions={};
  for(const [name,title] of [['jump','Jump'],['block','Standing block']]) {
    const count=movement.jobs[name].frameCount;
    for(let i=0;i<count;i++)await copyFile(`${movementSource}/${name}-${i}.png`,`${root}/${name}-${i}.png`);
    additions[name]={actualFrameCount:count,title,fps:name==='jump'?10:6,source:`${movementSource}/manifest.json`};
  }
  manifest.clips={...additions,...manifest.clips};
}
const airSource='art-source/characters/todd/pixellab/retro-air-crouch-20261015';
let air;
try { air=JSON.parse(await readFile(`${airSource}/manifest.json`)); }
catch(error) { if(error.code!=='ENOENT')throw error; }
if(air&&['crouch','jumpKick','jumpPunch'].every(name=>air.jobs[name]?.status==='completed')) {
  const additions={};
  for(const [name,title] of [['crouch','Crouch'],['jumpKick','Jump kick'],['jumpPunch','Jump punch']]) {
    const assembly=air.reviewOverrides?.[name]?.frames;
    const count=assembly?.length??air.jobs[name].frameCount;
    for(let i=0;i<count;i++)await copyFile(assembly?.[i]??`${airSource}/${name}-${i}.png`,`${root}/${name}-${i}.png`);
    additions[name]={actualFrameCount:count,title,fps:name==='crouch'?6:10,source:`${airSource}/manifest.json`,reviewNote:name==='crouch'?'Shallow crouch candidate':name==='jumpKick'?'Approved jump + side-kick frame assembly':'Left-arm airborne punch'};
  }
  manifest.clips={...additions,...manifest.clips};
}
manifest.punchSelection={rightProbability:0.25,leftProbability:0.75,scope:'source gallery; runtime integration pending'};
manifest.glasses.idleFrame3={imageId:'2c61a170-5688-4702-b0be-b4140fed37e0',changedPixels:40,region:[101,42,112,51]};
manifest.status='revised-source-review';
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2));
execFileSync(process.execPath,['scripts/preview-todd-retro-pilot.mjs',root],{stdio:'inherit'});
let html=await readFile(`${root}/review.html`,'utf8');
html=html.replaceAll('Todd — retro animation pilot','Todd — latest animation gallery')
  .replace('article{background','article{width:420px;max-width:100%;background')
  .replace("heading.textContent=titles[clip.name]","heading.textContent=clip.title??titles[clip.name]")
  .replace('canvas.height=320;',"canvas.height=clip.name.startsWith('jump')?420:320;if(clip.name.startsWith('jump'))canvas.style.height='420px';")
  .replace('c.clearRect(0,0,384,320)',"c.clearRect(0,0,384,item.canvas.height)")
  .replace('c.moveTo(0,284);c.lineTo(384,284)',"const baseline=item.name.startsWith('jump')?384:284;c.moveTo(0,baseline);c.lineTo(384,baseline)")
  .replace('c.drawImage(im,64,32)',"c.drawImage(im,64,item.name.startsWith('jump')?132-([0,0,30,65,90,65,30,0,0][item.frame]??0):32)")
  .replace('<script>','<script type="module">import {chooseToddPunch} from "/scripts/lib/todd-punch-choice.mjs";')
  .replace('<section id="clips">','<p>Latest retro Todd: crouch, jump kick, jump punch, jump, standing block, repaired idle and walk, both punches, and the cleaned side kick. Crouch is a shallow candidate. Jump kick combines approved jump and side-kick frames. Jump clips use demonstration arcs added by this preview; their source frames contain poses only. Random punches favor the left arm 75% / right 25%; try K or the button. Source preview only; not integrated into the game.</p><button id="punch">Throw punch (K)</button><span id="arm" aria-live="polite">Left arm favored (75%)</span><section id="clips">')
  .replace('function draw(time)',`function throwPunch(){const item=items.find(i=>i.name==='alternating');if(item.manual&&item.attacking)return;const choice=chooseToddPunch();item.manual=true;item.attacking=true;item.frame=choice.start;item.endFrame=choice.end;item.accumulator=0;document.querySelector('#arm').textContent='Punch: '+choice.arm+' arm';paused=false;pause.textContent='Pause'}document.querySelector('#punch').onclick=throwPunch;document.addEventListener('keydown',e=>{if(e.code==='KeyK'&&!e.repeat){e.preventDefault();throwPunch()}});function draw(time)`)
  .replace('if(!paused){item.accumulator','if(!paused&&(!item.manual||item.attacking)){item.accumulator')
  .replace('item.frame=(item.frame+1)%item.images.length',`if(item.manual&&item.frame===item.endFrame){item.attacking=false;item.accumulator=0;break}if(!item.manual&&item.name==='alternating'&&(item.frame===8||item.frame===17)){item.frame=chooseToddPunch().start}else{item.frame=(item.frame+1)%item.images.length}`);
await writeFile(`${root}/review.html`,html);
console.log('Revised gallery ready; original punch and all source frames preserved.');
