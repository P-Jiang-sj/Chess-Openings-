import {readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selectFeatured,categoryOf,searchable} from '../dist/catalog.js';
const base=new URL('../',import.meta.url);
for(const file of ['app.js','catalog.js','opening-tree.js','engine.js','opponent.js']){const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL('dist/'+file,base))],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
const data=JSON.parse(await readFile(new URL('dist/openings.json',base),'utf8'));
if(data.length<3000)throw Error('Opening dataset is incomplete');
const featured=selectFeatured(data);if(featured.length!==24)throw Error(`Missing a featured opening: ${featured.length}/24`);
for(const c of ['e4','d4','flank','other'])if(!data.some(o=>categoryOf(o)===c))throw Error('Missing category '+c);
if(!data.some(o=>searchable(o).includes('西西里')))throw Error('Chinese search failed');
for(const c of ['w','b'])for(const p of ['K','Q','R','B','N','P'])await access(new URL(`dist/pieces/${c}${p}.svg`,base));
console.log(`Passed: JavaScript syntax, ${data.length} openings, 24 featured openings, four categories, Chinese search, and 12 local chess assets.`);
