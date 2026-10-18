// A move-order tree: every edge comes from a recorded opening, never an invented move.
export function buildOpeningTree(openings){
 const nodes=[];
 const create=(move,path,parent)=>{const node={id:nodes.length,move,path,parent,children:new Map(),endings:[],count:0,best:null};nodes.push(node);return node;};
 const root=create('',[],null);
 const prefer=(a,b)=>!b||a.moves.length<b.moves.length||(a.moves.length===b.moves.length&&a.name.length<b.name.length);
 for(const opening of openings){
  let node=root;node.count++;if(prefer(opening,node.best))node.best=opening;
  for(const move of opening.moves){if(!node.children.has(move))node.children.set(move,create(move,[...node.path,move],node.id));node=node.children.get(move);node.count++;if(prefer(opening,node.best))node.best=opening;}
  node.endings.push(opening);
 }
 function find(path){let node=root;for(const move of path){node=node.children.get(move);if(!node)return null;}return node;}
 return {root,nodes,find};
}
export function isPrefix(prefix,moves){return prefix.length<=moves.length&&prefix.every((m,i)=>m===moves[i]);}
export function firstDifferentStep(a,b){let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;return i+1;}
export function moveNumber(depth){return `${Math.ceil(depth/2)}${depth%2?'.':'...'} `;}
const popular={
 'Sicilian Defense':[
  ['纳道尔夫','Najdorf Variation'],['龙式','Dragon Variation'],['加速龙式','Accelerated Dragon'],['古典变例','Classical Variation'],['舍维宁根','Scheveningen Variation'],['斯维什尼科夫','Lasker-Pelikan Variation, Sveshnikov Variation'],['泰马诺夫','Taimanov Variation'],['卡恩','Kan Variation'],['阿拉平','Alapin Variation'],['封闭变例','Closed'],['罗索里莫','Nyezhmetdinov-Rossolimo Attack'],['莫斯科','Moscow Variation']
 ],
 'Italian Game':[['古典变例','Giuoco Piano'],['最安静变例','Giuoco Pianissimo'],['双马防御','Two Knights Defense'],['伊文斯弃兵','Evans Gambit'],['匈牙利防御','Hungarian Defense'],['苏格兰弃兵','Scotch Gambit']],
 'Ruy Lopez':[['柏林防御','Berlin Defense'],['墨菲防御','Morphy Defense'],['兑换变例','Exchange Variation'],['开放变例','Open'],['封闭变例','Closed'],['马歇尔进攻','Marshall Attack']],
 'French Defense':[['挺进变例','Advance Variation'],['兑换变例','Exchange Variation'],['塔拉什','Tarrasch Variation'],['维纳韦尔','Winawer Variation'],['古典变例','Classical Variation'],['鲁宾斯坦','Rubinstein Variation']],
 'Caro-Kann Defense':[['挺进变例','Advance Variation'],['兑换变例','Exchange Variation'],['古典变例','Classical Variation'],['潘诺夫进攻','Panov Attack'],['双马进攻','Two Knights Attack']],
 "King's Indian Defense":[['古典变例','Orthodox Variation'],['赛米什','Sämisch Variation'],['侧翼出象','Fianchetto Variation'],['四兵进攻','Four Pawns Attack']]
};
export function commonVariations(data,opening){
 const family=opening.name.split(':')[0];const records=data.filter(o=>o.name.startsWith(family+': '));
 const configured=popular[family];
 if(configured)return configured.flatMap(([label,variation])=>{const exact=records.filter(o=>o.name===family+': '+variation);const candidates=exact.length?exact:records.filter(o=>o.name.startsWith(family+': '+variation+','));candidates.sort((a,b)=>a.moves.length-b.moves.length);return candidates.length?[{label,opening:candidates[0]}]:[];});
 const groups=new Map();for(const o of records){const variation=o.name.split(': ')[1].split(',')[0];const old=groups.get(variation);if(!old||o.moves.length<old.moves.length)groups.set(variation,o);}
 return [...groups.entries()].sort((a,b)=>a[1].moves.length-b[1].moves.length).slice(0,8).map(([label,opening])=>({label,opening}));
}
