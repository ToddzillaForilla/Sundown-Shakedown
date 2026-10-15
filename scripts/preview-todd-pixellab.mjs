import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = 'art-source/characters/todd/pixellab/photo-character';
const activeRoot = 'art-source/characters/todd/pixellab/watchless-20261015';
const manifest = JSON.parse(await readFile('art-source/characters/todd/pixellab/pilot-manifest.json', 'utf8'));
const clips = {};
for (const name of ['idle', 'walk', 'punch']) {
  const count = manifest.animationPilot?.[`${name}FrameCount`] ?? 0;
  if (!count) continue;
  clips[name] = await Promise.all(Array.from({ length: count }, async (_, i) =>
    'data:image/png;base64,' + (await readFile(path.join(activeRoot, `${name}-${i}.png`))).toString('base64')));
}
const correctionRoot = 'art-source/characters/todd/pixellab/kick-correction-20261015';
const correction = JSON.parse(await readFile(path.join(correctionRoot, 'manifest.json'), 'utf8'));
clips['Side kick'] = await Promise.all(Array.from({ length: correction.actualFrameCount }, async (_, i) =>
  'data:image/png;base64,' + (await readFile(path.join(activeRoot, `kick-${i}.png`))).toString('base64')));
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Todd PixelLab animation pilot</title>
<style>body{font:18px system-ui;background:#18232d;color:#eef3f6;margin:32px}main{max-width:1000px;margin:auto}button,select{font:inherit;padding:8px;margin:8px}section{display:flex;gap:24px;flex-wrap:wrap}.card{background:#304451;padding:20px;border-radius:12px}canvas{width:320px;height:320px;image-rendering:pixelated;display:block}p{color:#c4d5df}small{display:block}</style>
<main><h1>Todd — animation pilot</h1><p>Photo-based character • Animate with Text v3 • preview only</p>
<button id="pause">Pause</button><label>Playback <select id="speed"><option value="1">Normal</option><option value="0.35">Slow</option></select></label><label><input id="flip" type="checkbox"> Face right</label><section id="cards"></section>
<p>Check face, glasses, tattoo, planted feet, body scale, and return to guard. Interpolation v3 was unavailable; no v2 interpolation used.</p></main>
<script>const clips=${JSON.stringify(clips)};let paused=false,elapsed=0,last=0;const items=[];for(const [name,frames] of Object.entries(clips)){const card=document.createElement('article');card.className='card';const title=document.createElement('h2');title.textContent=({idle:'Fighting idle',walk:'Walk',punch:'Straight punch',kick:'Original kick'})[name] ?? name;card.append(title);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;card.append(canvas);const label=document.createElement('small');card.append(label);document.querySelector('#cards').append(card);items.push({name,canvas,label,images:frames.map(src=>{const im=new Image();im.src=src;return im})})}document.querySelector('#pause').onclick=()=>{paused=!paused;document.querySelector('#pause').textContent=paused?'Play':'Pause'};function draw(t){if(last&&!paused)elapsed+=(t-last)*Number(document.querySelector('#speed').value);last=t;for(const item of items){const fps=item.name==='idle'?6:item.name==='walk'?8:12;const i=Math.floor(elapsed*fps/1000)%item.images.length;const im=item.images[i];const c=item.canvas.getContext('2d');c.clearRect(0,0,256,256);c.imageSmoothingEnabled=false;c.save();if(document.querySelector('#flip').checked){c.translate(256,0);c.scale(-1,1)}if(im.complete&&im.naturalWidth)c.drawImage(im,(256-im.naturalWidth)/2,256-im.naturalHeight);c.restore();item.label.textContent='Frame '+(i+1)+' / '+item.images.length}requestAnimationFrame(draw)}requestAnimationFrame(draw)</script></html>`;
await writeFile(path.join(root, 'animation-preview.html'), html);
console.log(`Saved ${root}/animation-preview.html`);
