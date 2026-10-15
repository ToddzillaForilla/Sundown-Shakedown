import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = 'art-source/characters/todd/pixellab';
const output = `${root}/kick-correction-20261015`;
const manifest = JSON.parse(await readFile(`${output}/manifest.json`, 'utf8'));
const clips = [];
for (const [label, directory, prefix, count] of [
  ['Original kick', `${root}/photo-character`, 'kick', 7],
  ['Corrected kick', output, 'kick', manifest.actualFrameCount],
  ['Reference idle', `${root}/photo-character`, 'idle', 5],
]) {
  if (!count) throw new Error(`Missing frame count: ${label}`);
  const frames = [];
  const measurements = [];
  const tiles = [];
  for (let index = 0; index < count; index++) {
    const buffer = await readFile(`${directory}/${prefix}-${index}.png`);
    const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = -1, bottom = -1;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
    measurements.push({ index, width: info.width, height: info.height,
      bounds: { left, top, right, bottom }, silhouetteHeight: bottom - top + 1,
      bottomInset: info.height - bottom - 1,
      touchesEdge: left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1 });
    frames.push(`data:image/png;base64,${buffer.toString('base64')}`);
    tiles.push({ input: buffer, left: index * info.width, top: 0 });
  }
  if (label === 'Corrected kick') {
    const first = measurements[0];
    if (measurements.some(m => m.width !== first.width || m.height !== first.height)) throw new Error('Unequal frame cells');
    await sharp({ create: { width: first.width * count, height: first.height, channels: 4, background: '#304451' } })
      .composite(tiles).png().toFile(`${output}/contact.png`);
  }
  clips.push({ label, frames, measurements });
}
await writeFile(`${output}/measurements.json`, JSON.stringify(clips.map(({label, measurements}) => ({label, measurements})), null, 2) + '\n');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Todd side-kick review</title>
<style>body{font:16px system-ui;background:#18232d;color:#eef3f6;margin:24px}main{max-width:1350px;margin:auto}button,select{font:inherit;padding:8px;margin:6px}section{display:flex;gap:16px;flex-wrap:wrap}.card{background:#304451;padding:14px;border-radius:10px}canvas{width:400px;height:320px;max-width:100%;image-rendering:pixelated;display:block}p{color:#c4d5df}small{display:block}</style>
<main><h1>Todd — side-kick correction</h1><p>Source-art comparison · Animate with Text v3 · Not integrated into the game</p>
<button id="pause">Pause</button><button id="previous">Previous frame</button><button id="next">Next frame</button>
<label>Speed <select id="speed"><option value="1">Normal</option><option value="0.35">Slow</option></select></label>
<label><input id="flip" type="checkbox"> Face right</label><section id="cards"></section>
<p>Frames use their original canvas and a common bottom anchor at 2× native pixel scale. The line marks the canvas baseline, not a fitted foot position. Check full heel extension, support-foot drift, body proportions, clipping, and the return to guard.</p></main>
<script>const clips=${JSON.stringify(clips)};let paused=false,elapsed=0,last=0;const items=[];
for(const clip of clips){const card=document.createElement('article');card.className='card';const title=document.createElement('h2');title.textContent=clip.label;card.append(title);const canvas=document.createElement('canvas');canvas.width=400;canvas.height=320;card.append(canvas);const label=document.createElement('small');card.append(label);document.querySelector('#cards').append(card);items.push({...clip,canvas,label,images:clip.frames.map(src=>{const im=new Image();im.src=src;return im})})}
const pause=document.querySelector('#pause');function stop(){paused=true;pause.textContent='Play'}pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Play':'Pause'};
document.querySelector('#next').onclick=()=>{stop();elapsed+=1000/12};document.querySelector('#previous').onclick=()=>{stop();elapsed=Math.max(0,elapsed-1000/12)};
function draw(t){if(last&&!paused)elapsed+=(t-last)*Number(document.querySelector('#speed').value);last=t;for(const item of items){const i=Math.floor((elapsed*12/1000)+0.00001)%item.images.length;const im=item.images[i],c=item.canvas.getContext('2d');c.clearRect(0,0,400,320);c.strokeStyle='#91aab8';c.beginPath();c.moveTo(0,300);c.lineTo(400,300);c.stroke();c.imageSmoothingEnabled=false;c.save();if(document.querySelector('#flip').checked){c.translate(400,0);c.scale(-1,1)}if(im.complete&&im.naturalWidth)c.drawImage(im,(400-im.naturalWidth*2)/2,300-im.naturalHeight*2,im.naturalWidth*2,im.naturalHeight*2);c.restore();const m=item.measurements[i];item.label.textContent='Frame '+(i+1)+' / '+item.images.length+' · canvas '+m.width+'×'+m.height+' · foot/bottom inset '+m.bottomInset+'px'}requestAnimationFrame(draw)}requestAnimationFrame(draw)</script></html>`;
await writeFile(`${output}/review.html`, html);
console.log(`Saved ${output}/review.html and measurements.json`);
