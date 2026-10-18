import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Chess} from '../dist/vendor/chess.js';
import {buildOpeningTree,isPrefix,commonVariations,firstDifferentStep} from '../dist/opening-tree.js';
const data=JSON.parse(await readFile(new URL('../dist/openings.json',import.meta.url),'utf8'));
const tree=buildOpeningTree(data);
assert.equal(tree.root.count,data.length);
for(const node of tree.nodes){
 assert.equal(node.count,node.endings.length+[...node.children.values()].reduce((sum,n)=>sum+n.count,0),'Branch counts must include both endpoints and descendants');
 assert.ok(isPrefix(node.path,node.best.moves),'A selected branch must map to an actual recorded continuation');
 for(const child of node.children.values()){assert.equal(child.parent,node.id);assert.deepEqual(child.path,[...node.path,child.move]);}
}
for(const opening of data)assert.ok(tree.find(opening.moves).endings.some(o=>o.id===opening.id),'Every named opening must remain reachable');
assert.equal(tree.find(['e4','e5','Ke7']),null,'An absent path must not be invented');
const sicilian=data.find(o=>o.name==='Sicilian Defense');
const common=commonVariations(data,sicilian);
assert.equal(common.length,12);
for(const {opening} of common){assert.ok(isPrefix(['e4','c5'],opening.moves));const game=new Chess();opening.moves.forEach(m=>game.move(m));}
assert.ok(common.some(v=>v.label==='纳道尔夫'));assert.ok(common.some(v=>v.label==='龙式'));
assert.equal(firstDifferentStep(['e4','c5','Nf3','d6'],['e4','c5','c3']),3);
const fixture=[{id:1,name:'A',moves:['e4','c5','Nf3','d6']},{id:2,name:'B',moves:['Nf3','c5','e4','d6']}];
const separate=buildOpeningTree(fixture);const games=fixture.map(o=>{const game=new Chess();o.moves.forEach(m=>game.move(m));return game;});
assert.equal(games[0].fen(),games[1].fen());assert.notEqual(separate.find(fixture[0].moves).id,separate.find(fixture[1].moves).id,'Transpositions retain separate move-order branches');
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
assert.ok(!/id="(?:play|speed|practice|progress-fill|promotion)"/.test(html));assert.ok(html.includes('PJ &amp; VLZ'));
console.log(`Passed: ${tree.nodes.length} tree nodes, ${data.length} reachable openings, accounting of all branches, distinct transpositions, 12 Sicilian variation entries, and removal of old controls.`);
