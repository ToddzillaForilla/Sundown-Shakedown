import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='art-source/characters/kristen/pixellab/retro-hiking-socks-20261015';
await copyFile(`${root}/concept-0.png`,`${root}/concept.png`);
execFileSync(process.execPath,['scripts/preview-kristen-retro-reference.mjs',root]);
let html=await readFile(`${root}/review.html`,'utf8');
html=html.replace('Requested revision: a slightly slimmer build, a little shorter than Todd, and short cargo shorts. The previous pants version is preserved below.','Requested revision: gray-green wool hiking socks above both boots, preserving the approved athletic silhouette and outfit. Previous versions remain preserved.');
await writeFile(`${root}/review.html`,html);
console.log(await readFile(`${root}/measurements.json`,'utf8'));
