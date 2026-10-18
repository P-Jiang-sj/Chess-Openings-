import {mkdir,writeFile,readFile} from 'node:fs/promises';
const base=new URL('../',import.meta.url);
async function download(url,file){const r=await fetch(url);if(!r.ok)throw Error(`${r.status}: ${url}`);const value=await r.text();await writeFile(new URL(file,base),value);return value;}
await mkdir(new URL('dist/pieces/',base),{recursive:true});
await Promise.all([
 download('https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js','dist/vendor/chess.js'),
 download('https://raw.githubusercontent.com/jhlywa/chess.js/v1.4.0/LICENSE','dist/vendor/chess-LICENSE'),
 ...'abcde'.split('').map(x=>download(`https://raw.githubusercontent.com/lichess-org/chess-openings/master/${x}.tsv`,`data/${x}.tsv`)),
 ...['w','b'].flatMap(c=>['K','Q','R','B','N','P'].map(p=>download(`https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/${c}${p}.svg`,`dist/pieces/${c}${p}.svg`)))
]);
const {Chess}=await import('../dist/vendor/chess.js');
const data=[];
for(const letter of 'abcde'){
 const lines=(await readFile(new URL(`data/${letter}.tsv`,base),'utf8')).trim().split(/\r?\n/).slice(1);
 for(const line of lines){const [eco,name,pgn]=line.split('\t');const game=new Chess();game.loadPgn(pgn);const moves=game.history();data.push({id:data.length,eco,name,pgn,moves});}
}
await writeFile(new URL('dist/openings.json',base),JSON.stringify(data));
console.log(JSON.stringify({openings:data.length,legal:true,families:new Set(data.map(x=>x.name.split(':')[0])).size}));
