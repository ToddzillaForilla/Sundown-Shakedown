import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = 'art-source/characters/todd/pixellab/retro-option-b-20261015';
const options = [
  { label: 'Approved Todd — retro arcade fighter', path: `${root}/concept.png` },
];
for (const option of options) {
  const image = await readFile(option.path);
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  const colors = new Set();
  let transparentPixels = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const offset = (y * info.width + x) * 4;
    if (data[offset + 3] === 0) transparentPixels++;
    if (data[offset + 3] > 8) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
      colors.add(data.subarray(offset, offset + 4).toString('hex'));
    }
  }
  if (bottom < 0) throw new Error(`Empty source: ${option.label}`);
  Object.assign(option, { width: info.width, height: info.height,
    bounds: { left, top, right, bottom }, silhouetteHeight: bottom - top + 1,
    transparentPixels, opaqueColors: colors.size,
    edgeClipping: left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1,
    source: `data:image/png;base64,${image.toString('base64')}` });
}
await writeFile(`${root}/measurements.json`, JSON.stringify(options.map(({ source, ...option }) => option), null, 2) + '\n');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Todd — approved master reference</title>
<style>*{box-sizing:border-box}body{font:17px system-ui;background:#18232d;color:#eef3f6;margin:24px}main{max-width:1100px;margin:auto}p,small{color:#c4d5df}section{display:flex;gap:24px;flex-wrap:wrap}article{background:#304451;padding:20px;border-radius:12px;flex:1;min-width:300px}canvas{display:block;max-width:100%;height:auto;image-rendering:pixelated}button{font:inherit;padding:9px 16px;margin:0 8px 18px 0}small{display:block;margin-top:12px}</style>
<main><h1>Todd — retro arcade option</h1><p>Approved master reference for the Todd animation rebuild: retro arcade proportions, bare wrists and a left forearm tattoo.</p>
<button id="game">Approximate game height</button><button id="native">Native pixels</button><section id="options"></section>
<p id="mode">Approved reference shown at approximately 232px silhouette height. Source artwork is unmodified.</p><p>Check facial likeness, glasses, V-neck, jeans, bare wrists, tattoo on the visible anatomical left forearm, and the fighting guard.</p></main>
<script>const options=${JSON.stringify(options)};let native=false;const cards=[];for(const option of options){const article=document.createElement('article');const heading=document.createElement('h2');heading.textContent=option.label;article.append(heading);const canvas=document.createElement('canvas');canvas.width=440;canvas.height=360;article.append(canvas);const label=document.createElement('small');label.textContent=option.width+'×'+option.height+' source · '+option.silhouetteHeight+'px silhouette';article.append(label);document.querySelector('#options').append(article);const image=new Image();image.onload=draw;image.src=option.source;cards.push({...option,canvas,image})}
function draw(){for(const option of cards){const ctx=option.canvas.getContext('2d');ctx.clearRect(0,0,440,360);ctx.imageSmoothingEnabled=false;const scale=native?1:232/option.silhouetteHeight;const x=220-(option.bounds.left+option.bounds.right+1)*scale/2;const y=310-(option.bounds.bottom+1)*scale;if(option.image.complete&&option.image.naturalWidth)ctx.drawImage(option.image,x,y,option.width*scale,option.height*scale);ctx.strokeStyle='#91aab8';ctx.beginPath();ctx.moveTo(12,311);ctx.lineTo(428,311);ctx.stroke()}document.querySelector('#mode').textContent=native?'Native pixels at 1× scale. Source artwork is unmodified.':'Approved reference shown at approximately 232px silhouette height. Source artwork is unmodified.'}
document.querySelector('#game').onclick=()=>{native=false;draw()};document.querySelector('#native').onclick=()=>{native=true;draw()};</script></html>`;
await writeFile(`${root}/comparison.html`, html);
console.log(`Saved ${root}/comparison.html`);
