import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const original='art-source/characters/kristen/pixellab/retro-reference-20261015';
const root=process.argv[2]??original;
const revised=root!==original;
const options=[];
const sources=[[revised?'Kristen — revised candidate':'Kristen — standing candidate',`${root}/concept.png`],['Todd — approved style reference','art-source/characters/todd/pixellab/retro-option-b-20261015/concept.png']];
if(revised)sources.push(['Kristen — previous pants version',`${original}/concept.png`]);
for(const [label,path] of sources){
  const bytes=await readFile(path);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=-1,bottom=-1,transparentPixels=0;const colors=new Set();
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const i=(y*info.width+x)*4;
    if(data[i+3]===0)transparentPixels++;
    if(data[i+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);colors.add(data.subarray(i,i+4).toString('hex'));}
  }
  if(right<0)throw Error(`Empty image: ${label}`);
  options.push({label,path,width:info.width,height:info.height,bounds:{left,top,right,bottom},silhouetteHeight:bottom-top+1,opaqueColors:colors.size,transparentPixels,edgeContact:left===0||top===0||right===info.width-1||bottom===info.height-1,source:`data:image/png;base64,${bytes.toString('base64')}`});
}
await writeFile(`${root}/measurements.json`,JSON.stringify(options.map(({source,...o})=>o),null,2));
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kristen — retro standing reference</title>
<style>*{box-sizing:border-box}body{font:17px system-ui;background:#18232d;color:#eef3f6;margin:24px}main{max-width:1100px;margin:auto}p,small{color:#c4d5df}section{display:flex;gap:20px;flex-wrap:wrap}article{background:#304451;padding:18px;border-radius:12px;width:420px;max-width:100%}article h2{min-height:2.5em;line-height:1.25;margin:0 0 16px}canvas{display:block;width:384px;max-width:100%;height:auto;image-rendering:pixelated}small{display:block;margin-top:12px}label{display:block;margin:18px 0}details img{max-width:220px;max-height:300px;object-fit:contain;margin:12px}summary{cursor:pointer}</style>
<main><h1>Kristen — retro standing reference</h1><p>Standing reference only · ${revised?'Edit Image (Pro)':'Create Image (Pro)'} · Candidate for approval before animation</p>
<p>${revised?'Requested revision: a slightly slimmer build, a little shorter than Todd, and short cargo shorts. The previous pants version is preserved below.':'Kristen’s two project photos guide her likeness; her existing concept guides the green shirt, blue bandana, cargo pants and boots.'} Todd’s approved sprite guides the arcade pixel style.</p>
<label><input id="flip" type="checkbox"> Face right</label><section id="options"></section><p>All sprites use the same native 1× pixel scale and canvas origin. The line is Todd’s approved foot baseline; sprites are not resized to fit their silhouettes. This source comparison is separate from the game.</p>
<p>Review Kristen’s likeness, glasses, hair, outfit, adult proportions and how well she fits beside Todd. Animations begin after this reference is approved.</p>
<details><summary>Kristen reference photos and previous outfit concept</summary><img alt="Kristen primary reference photo" src="/art-source/characters/kristen/references/kristen-reference-photo-1.jpg"><img alt="Kristen secondary reference photo" src="/art-source/characters/kristen/references/kristen-reference-photo-2.jpg"><img alt="Previous Kristen concept, outfit only" src="/art-source/characters/kristen/concepts/kristen-fighter-concept-v1.png"></details></main>
<script>const options=${JSON.stringify(options)};const cards=[];for(const o of options){const a=document.createElement('article');const h=document.createElement('h2');h.textContent=o.label;a.append(h);const canvas=document.createElement('canvas');canvas.width=384;canvas.height=320;a.append(canvas);const s=document.createElement('small');s.textContent=o.width+'×'+o.height+' · '+o.silhouetteHeight+'px silhouette · '+o.opaqueColors+' colors'+(o.edgeContact?' · EDGE CONTACT':'');a.append(s);document.querySelector('#options').append(a);const im=new Image();im.onload=draw;im.src=o.source;cards.push({canvas,im})}function draw(){for(const {canvas,im} of cards){const c=canvas.getContext('2d');c.clearRect(0,0,384,320);c.imageSmoothingEnabled=false;c.strokeStyle='#91aab8';c.beginPath();c.moveTo(0,284);c.lineTo(384,284);c.stroke();c.save();if(document.querySelector('#flip').checked){c.translate(384,0);c.scale(-1,1)}if(im.complete&&im.naturalWidth)c.drawImage(im,64,32);c.restore()}}document.querySelector('#flip').onchange=draw;</script></html>`;
await writeFile(`${root}/review.html`,html);
console.log(JSON.stringify(options.map(({source,...o})=>o)));
