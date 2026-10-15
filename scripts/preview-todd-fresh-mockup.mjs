import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = 'art-source/characters/todd/pixellab/fresh-mockup-20261015';
const directions = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];
const views = [];
for (const direction of directions) {
  const png = await readFile(`${root}/${direction}.png`);
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  views.push({ direction, width: info.width, height: info.height,
    bounds: { left, top, right, bottom }, silhouetteHeight: bottom - top + 1,
    bottomInset: info.height - 1 - bottom,
    edgeClipping: left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1,
    source: `data:image/png;base64,${png.toString('base64')}` });
}
const front = views.find(v => v.direction === 'south-west');
const scale = 232 / front.silhouetteHeight;
const photo = `data:image/png;base64,${(await readFile(`${root}/reference-upload.png`)).toString('base64')}`;
const card = v => `<article><h3>${v.direction}</h3><img class="pixel" src="${v.source}" width="${v.width * 2}" height="${v.height * 2}"><small>${v.width}×${v.height} canvas · ${v.silhouetteHeight}px silhouette · bottom inset ${v.bottomInset}px</small></article>`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Todd — fresh mockup review</title>
<style>*{box-sizing:border-box}body{margin:24px;background:#18232d;color:#eef3f6;font:16px system-ui}main{max-width:1300px;margin:auto}h1{margin-bottom:8px}p,small{color:#c4d5df}section{display:flex;gap:20px;flex-wrap:wrap;align-items:start}article{background:#304451;padding:18px;border-radius:12px}img{object-fit:contain;max-width:100%}.pixel{image-rendering:pixelated;display:block}.hero{min-height:310px;display:flex;align-items:end;justify-content:center}small{display:block;margin-top:10px}.photo{width:280px;height:280px;object-fit:cover}h2{margin-top:30px}</style>
<main><h1>Todd — fresh mockup</h1><p>Photo-based PixelLab Pro character · Design review before animation</p><section>
<article><h3>Your reference</h3><img class="photo" src="${photo}"></article>
<article><h3>Native pixels · south-west</h3><div class="hero"><img class="pixel" src="${front.source}" width="${front.width}" height="${front.height}"></div></article>
<article><h3>Approximate game height</h3><div class="hero"><img class="pixel" src="${front.source}" width="${Math.round(front.width * scale)}" height="${Math.round(front.height * scale)}"></div><small>232px silhouette target · source preview, not gameplay integration</small></article></section>
<h2>All eight directions · 2× pixels</h2><p>Review likeness, adult proportions, glasses, V-neck, left forearm tattoo, bare wrists and fighting stance.</p><section>${views.map(card).join('')}</section></main></html>`;
await writeFile(`${root}/mockup-review.html`, html);
await writeFile(`${root}/measurements.json`, JSON.stringify(views.map(({ source, ...v }) => v), null, 2) + '\n');
const largest = Math.max(...views.map(v => Math.max(v.width, v.height)));
const tiles = await Promise.all(views.map(async (v, i) => ({ input: await readFile(`${root}/${v.direction}.png`), left: (i % 4) * largest, top: Math.floor(i / 4) * largest })));
await sharp({ create: { width: largest * 4, height: largest * 2, channels: 4, background: '#304451' } })
  .composite(tiles).png().toFile(`${root}/directions-preview.png`);
console.log(`Saved ${root}/mockup-review.html`);
