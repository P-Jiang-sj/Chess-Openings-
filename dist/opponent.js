import {Chess} from './vendor/chess.js';
import {titleOf} from './catalog.js';
import {ChessOpponent,DIFFICULTIES} from './engine.js';
const $=selector=>document.querySelector(selector),names={p:'兵',n:'马',b:'象',r:'车',q:'后',k:'王'};
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initOpponent(){
 let opening=null,matchOpening=null,game=null,human='w',level=1200,base=0,selected=null,engine=null,busy=false,active=false,generation=0,errorMessage='',pendingPromotion=null;
 const setup=$('#opponent-setup'),dialog=$('#opponent-game');
 function sync(current,step,currentGame){opening=current;const complete=step===current.moves.length,ended=currentGame.isGameOver();$('#continue-game').disabled=!complete||ended;$('#continue-caption').textContent=ended?'这条棋谱已结束，可以选择其他变例。':complete?'可从开局结束局面与机器人对弈。':'点选最后一步后，就能从开局局面继续对弈。';}
 function closeEngine(){generation++;busy=false;if(engine){engine.destroy();engine=null;}selected=null;pendingPromotion=null;$('#match-promotion').hidden=true;}
 function stop(){active=false;closeEngine();}
 function reset(){closeEngine();active=true;errorMessage='';game=new Chess();matchOpening.moves.forEach(move=>game.move(move));base=game.history().length;render();maybeAI();}
 function status(){if(errorMessage)return errorMessage;if(game.isCheckmate())return game.turn()===human?'将死，机器人获胜。':'将死，你赢了！';if(game.isStalemate())return '无子可动，和棋。';if(game.isThreefoldRepetition())return '三次重复局面，和棋。';if(game.isInsufficientMaterial())return '子力不足，和棋。';if(game.isDraw())return '和棋。';if(busy)return '机器人正在思考…';return game.turn()===human?(game.isCheck()?'你正被将军，请应将。':selected?`已选中 ${selected}，点击标记的落点。`:'轮到你了，点击棋子选择落点。'):'轮到机器人走棋。';}
 function render(){
  const flipped=human==='b',files=flipped?'hgfedcba':'abcdefgh',ranks=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1],history=game.history({verbose:true}),last=history.at(-1),targets=selected?game.moves({square:selected,verbose:true}):[];let html='';
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){const square=files[f]+ranks[r],piece=game.get(square),legal=targets.some(move=>move.to===square);let cls=`square ${(r+f)%2?'dark':''}`;if(last&&(last.from===square||last.to===square))cls+=' last';if(selected===square)cls+=' selected';if(legal&&piece)cls+=' capture';if(game.isCheck()&&piece?.type==='k'&&piece.color===game.turn())cls+=' checked';html+=`<button class="${cls}" data-match-square="${square}" aria-label="对弈 ${square}${piece?' '+(piece.color==='w'?'白':'黑')+names[piece.type]:' 空格'}" ${busy||game.isGameOver()||game.turn()!==human?'disabled':''}>${piece?`<img src="./pieces/${piece.color}${piece.type.toUpperCase()}.svg" alt="" draggable="false">`:''}${f===0?`<span class="rank">${ranks[r]}</span>`:''}${r===7?`<span class="file">${files[f]}</span>`:''}${legal&&!piece?'<span class="legal-dot"></span>':''}</button>`;}
  $('#match-board').innerHTML=html;$('.human-avatar').textContent=human==='w'?'♔':'♚';$('#match-status').textContent=status();$('#match-status').classList.toggle('thinking',busy);$('#match-opponent-name').textContent=`${DIFFICULTIES[level].name} · ELO ${level}`;$('#match-human-name').textContent=`你 · ${human==='w'?'白方':'黑方'}`;$('#match-opponent-color').textContent=human==='w'?'黑方':'白方';$('#match-opening-name').textContent=titleOf(matchOpening);$('#match-level').textContent=`参考 ELO ${level}`;
  $('#match-history').innerHTML=history.map((move,i)=>`${i===base?'<li class="match-start-marker">从这里开始对弈</li>':''}<li class="${i<base?'book-move':'played-move'}"><span>${i+1}</span><small>${move.color==='w'?'白':'黑'}</small><strong>${esc(move.san)}</strong><span>${move.from} → ${move.to}</span></li>`).join('');$('#match-history').scrollTop=$('#match-history').scrollHeight;
  $('#match-undo').disabled=busy||!history.slice(base).some(move=>move.color===human);$('#match-retry').hidden=!errorMessage;$('#match-promotion').hidden=!pendingPromotion;
 }
 async function maybeAI(){
  if(!active||game.isGameOver()||game.turn()===human)return;
  const run=generation;busy=true;errorMessage='';render();
  try{if(!engine)engine=new ChessOpponent();const move=await engine.move(game,level);if(!active||run!==generation)return;if(move)game.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});busy=false;render();}
  catch(error){if(!active||run!==generation)return;busy=false;errorMessage='机器人暂时无法回应，请点击重试。';if(engine){engine.destroy();engine=null;}render();console.error('Chess opponent unavailable',error);}
 }
 function makeMove(from,to,promotion){if(!active||busy||game.turn()!==human)return;try{game.move({from,to,promotion});selected=null;pendingPromotion=null;render();maybeAI();}catch{selected=null;render();}}
 function clickSquare(square){if(!active||busy||game.isGameOver()||game.turn()!==human||pendingPromotion)return;const piece=game.get(square);if(piece?.color===human){selected=selected===square?null:square;render();return;}if(!selected)return;const moves=game.moves({square:selected,verbose:true}).filter(move=>move.to===square);if(!moves.length){selected=null;render();return;}if(moves[0].promotion){pendingPromotion={from:selected,to:square};$('#match-promotion-options').innerHTML=['q','r','b','n'].map(piece=>`<button data-match-promote="${piece}" aria-label="对弈升变为${names[piece]}"><img src="./pieces/${human}${piece.toUpperCase()}.svg" alt="${names[piece]}"></button>`).join('');render();}else makeMove(selected,square);}
 $('#continue-game').addEventListener('click',()=>{if(!opening||$('#continue-game').disabled)return;$('#opponent-opening-name').textContent=titleOf(opening);setup.showModal();});
 $('#opponent-setup-close').addEventListener('click',()=>setup.close());
 $('#opponent-start').addEventListener('click',()=>{human=document.querySelector('input[name="opponent-side"]:checked').value;level=Number(document.querySelector('input[name="opponent-level"]:checked').value);matchOpening=opening;setup.close();dialog.showModal();reset();});
 $('#match-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',stop);dialog.addEventListener('cancel',stop);$('#match-restart').addEventListener('click',reset);$('#match-retry').addEventListener('click',()=>{errorMessage='';maybeAI();});
 $('#match-undo').addEventListener('click',()=>{if(busy||!game.history({verbose:true}).slice(base).some(move=>move.color===human))return;game.undo();while(game.history().length>base&&game.turn()!==human)game.undo();selected=null;errorMessage='';render();});
 $('#match-board').addEventListener('click',event=>{const square=event.target.closest('[data-match-square]');if(square)clickSquare(square.dataset.matchSquare);});$('#match-promotion-options').addEventListener('click',event=>{const button=event.target.closest('[data-match-promote]');if(button&&pendingPromotion)makeMove(pendingPromotion.from,pendingPromotion.to,button.dataset.matchPromote);});
 return {sync};
}
