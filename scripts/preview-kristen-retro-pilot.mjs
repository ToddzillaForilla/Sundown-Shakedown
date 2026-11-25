import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

const root = process.argv[2] ?? 'art-source/characters/kristen/pixellab/retro-animation-pilot-20261015';
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
const clips = [];
for (const [name, record] of Object.entries(manifest.clips)) {
  if (!record.actualFrameCount) continue;
  const frames = [], measurements = [], tiles = [];
  const frameOrder = record.reviewFrameOrder ?? Array.from({ length: record.actualFrameCount }, (_, index) => index);
  for (const [sequenceIndex, sourceFrame] of frameOrder.entries()) {
    const png = await readFile(`${root}/${record.reviewFramePrefix ?? name}-${sourceFrame}.png`);
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = -1, bottom = -1, transparentPixels = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha === 0) transparentPixels++;
      if (alpha > 8) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
    }
    if (bottom < 0) throw new Error(`Empty frame: ${name}-${index}`);
    measurements.push({ index: sequenceIndex, sourceFrame, width: info.width, height: info.height, bounds: { left, top, right, bottom },
      silhouetteHeight: bottom - top + 1, bottomInset: info.height - 1 - bottom, transparentPixels,
      edgeClipping: left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1,
      sha256: createHash('sha256').update(png).digest('hex') });
    frames.push(`data:image/png;base64,${png.toString('base64')}`);
    tiles.push({ input: png, left: (sequenceIndex % 4) * info.width, top: Math.floor(sequenceIndex / 4) * (info.height + 20) + 20 });
  }
  const first = measurements[0];
  if (measurements.some(m => m.width !== first.width || m.height !== first.height)) throw new Error(`Unequal cells: ${name}`);
  await sharp({ create: { width: first.width * Math.min(4, frames.length), height: Math.ceil(frames.length / 4) * (first.height + 20), channels: 4, background: '#304451' } })
    .composite(tiles).png().toFile(`${root}/${name}-contact.png`);
  clips.push({ name, title: record.title, frames, measurements, fps: record.fps ?? (name === 'idle' ? 6 : name === 'walk' ? 8 : 12) });
}
await writeFile(`${root}/measurements.json`, JSON.stringify(clips.map(({ frames, ...clip }) => clip), null, 2) + '\n');
const reference = `data:image/png;base64,${(await readFile(manifest.source)).toString('base64')}`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kristen — idle/walk pilot</title>
<style>*{box-sizing:border-box}body{font:17px system-ui;background:#18232d;color:#eef3f6;margin:24px}main{max-width:1100px;margin:auto}p,small{color:#c4d5df}section{display:flex;gap:20px;flex-wrap:wrap}article{background:#304451;padding:18px;border-radius:12px}canvas{display:block;width:384px;height:320px;max-width:100%;image-rendering:pixelated}button,select{font:inherit;padding:8px;margin:5px}small{display:block;margin-top:10px}summary{cursor:pointer}img{image-rendering:pixelated}</style>
<main><h1>Kristen — idle/walk pilot</h1><p>Approved Kristen standing reference · Animate with Text v3 · Source review before game integration</p><button id="pause">Pause</button><button id="previous">Previous frame</button><button id="next">Next frame</button>
<label>Speed <select id="speed"><option value="1">Normal</option><option value="0.35">Slow</option></select></label><label><input id="flip" type="checkbox"> Face right</label>
<p>All frames share a fixed 1× pixel scale. Three walk frames have whole-frame vertical registration corrections of 3–4px; raw frames are preserved. The walk review plays those same frames in reverse order to test forward stepping toward Kristen's screen-left facing. The line marks the approved reference's foot baseline. Preview rates are for review, not final combat timing.</p><section id="clips"></section>
<details><summary>Approved standing reference</summary><img src="${reference}" width="256" height="256"></details></main>
<script>const clips=${JSON.stringify(clips)};let paused=false,last=0;const items=[];const titles={idle:'Fighting idle',walk:'Walk',punch:'Straight punch',kick:'Side kick'};for(const clip of clips){const article=document.createElement('article');const heading=document.createElement('h2');heading.textContent=clip.title??titles[clip.name]??clip.name;article.append(heading);const canvas=document.createElement('canvas');canvas.width=384;canvas.height=320;article.append(canvas);const label=document.createElement('small');article.append(label);document.querySelector('#clips').append(article);items.push({...clip,canvas,label,frame:0,accumulator:0,images:clip.frames.map(src=>{const im=new Image();im.src=src;return im})})}
const pause=document.querySelector('#pause');function stop(){paused=true;pause.textContent='Play'}pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Play':'Pause'};function step(direction){stop();for(const item of items){item.frame=(item.frame+direction+item.images.length)%item.images.length;item.accumulator=0}}document.querySelector('#previous').onclick=()=>step(-1);document.querySelector('#next').onclick=()=>step(1);
function draw(time){const delta=last?Math.min(time-last,100):0;last=time;for(const item of items){if(!paused){item.accumulator+=delta*Number(document.querySelector('#speed').value);while(item.accumulator>=1000/item.fps){item.accumulator-=1000/item.fps;item.frame=(item.frame+1)%item.images.length}}const c=item.canvas.getContext('2d');c.clearRect(0,0,384,320);c.imageSmoothingEnabled=false;c.strokeStyle='#91aab8';c.beginPath();c.moveTo(0,284);c.lineTo(384,284);c.stroke();const im=item.images[item.frame];c.save();if(document.querySelector('#flip').checked){c.translate(384,0);c.scale(-1,1)}if(im.complete&&im.naturalWidth)c.drawImage(im,64,32);c.restore();const m=item.measurements[item.frame];item.label.textContent='Frame '+(item.frame+1)+' / '+item.images.length+' · '+m.width+'×'+m.height+' · bottom inset '+m.bottomInset+'px'+(m.edgeClipping?' · EDGE CONTACT':'')}requestAnimationFrame(draw)}requestAnimationFrame(draw)</script></html>`;
await writeFile(`${root}/review.html`, html);
console.log(`Saved ${root}/review.html (${clips.length} clips)`);
