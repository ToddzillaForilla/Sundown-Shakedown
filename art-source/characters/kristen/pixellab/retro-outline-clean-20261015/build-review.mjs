import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='art-source/characters/kristen/pixellab/retro-outline-clean-20261015';
const previous='art-source/characters/kristen/pixellab/retro-bandana-restored-20261015';

execFileSync(process.execPath,['scripts/preview-kristen-retro-reference.mjs',root]);
let html=await readFile(`${root}/review.html`,'utf8');
const match=html.match(/const options=(.*?);const cards=/);
const options=JSON.parse(match[1]);
const manifest=JSON.parse(await readFile(`${root}/manifest.json`));
if(manifest.accepted)options[0].label='Kristen — approved standing reference';
const prior=JSON.parse(await readFile(`${previous}/measurements.json`))[0];
options[2]={...prior,label:'Kristen — before outline cleanup',source:`data:image/png;base64,${(await readFile(`${previous}/concept.png`)).toString('base64')}`};
html=html.replace(match[0],`const options=${JSON.stringify(options)};const cards=`).replace('Requested revision: a slightly slimmer build, a little shorter than Todd, and short cargo shorts. The previous pants version is preserved below.','Cleaned the screen-right leg outline: 27 existing edge pixels darkened. Silhouette, proportions, bandana, socks and boots preserved. No new generation.');
html=html.replace('Edit Image (Pro)','PixelLab exact outline cleanup');
if(manifest.accepted)html=html.replace('Candidate for approval before animation','Standing reference approved by Todd · October 15, 2026').replace('Review Kristen’s likeness, glasses, hair, outfit, adult proportions and how well she fits beside Todd. Animations begin after this reference is approved.','Approved reference for future Kristen animation work. Next planned step: a scoped idle/walk pilot. Source art only; not yet integrated into the game.');
await writeFile(`${root}/review.html`,html);
await writeFile(`${root}/measurements.json`,JSON.stringify(options.map(({source,...o})=>o),null,2));
console.log(JSON.stringify(options.map(({source,...o})=>o),null,2));
