import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
const root='art-source/characters/kristen/pixellab/retro-reference-20261015';
await mkdir(root,{recursive:true});
const sources=[
  ['photo1','art-source/characters/kristen/references/kristen-reference-photo-1.jpg',true],
  ['photo2','art-source/characters/kristen/references/kristen-reference-photo-2.jpg',true],
  ['outfit','art-source/characters/kristen/concepts/kristen-fighter-concept-v1.png',false],
  ['toddStyle','art-source/characters/todd/pixellab/retro-option-b-20261015/concept.png',false],
];
const uploads={};
for(const [name,path,isPhoto] of sources){
  const bytes=isPhoto?await sharp(path).rotate().resize({height:1024,withoutEnlargement:true}).png().toBuffer():await readFile(path);
  if(isPhoto)await writeFile(`${root}/${name}-upload.png`,bytes);
  const form=new FormData();form.append('file',new Blob([bytes],{type:'image/png'}),`${name}.png`);
  const response=await fetch('https://api.pixellab.ai/v2/uploads',{method:'POST',headers:{Authorization:`Bearer ${process.env.PIXELLAB_API_TOKEN}`},body:form,signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`Upload ${name}: HTTP ${response.status}`);
  uploads[name]={source:path,...await response.json()};
  await writeFile(`${root}/uploads.json`,JSON.stringify(uploads,null,2));
  console.log(JSON.stringify({name,ref:uploads[name].ref,width:uploads[name].width,height:uploads[name].height}));
}
