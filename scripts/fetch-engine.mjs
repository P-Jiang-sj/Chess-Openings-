import {mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../dist/vendor/stockfish/',import.meta.url);
await mkdir(root,{recursive:true});
const release='https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/';
for(const file of ['stockfish-19-lite-single.js','stockfish-19-lite-single.wasm']){const response=await fetch(release+file);if(!response.ok)throw Error(`Engine download failed: ${response.status}`);const bytes=new Uint8Array(await response.arrayBuffer());await writeFile(new URL(file,root),bytes);console.log(`${file}: ${bytes.length} bytes`);}
const license=await fetch('https://raw.githubusercontent.com/nmrugg/stockfish.js/v19.0.1/Copying.txt');if(!license.ok)throw Error('Missing engine license');await writeFile(new URL('COPYING.txt',root),await license.text());
await writeFile(new URL('NOTICE.txt',root),'Stockfish.js 19.0.1 lite single-threaded engine. Copyright the Stockfish developers, Nathan Rugg and contributors. GPL-3.0.\nUnmodified engine binaries: https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1\nCorresponding source and build instructions: https://github.com/nmrugg/stockfish.js/tree/v19.0.1\nSource archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v19.0.1.tar.gz\n');
