export const DIFFICULTIES={
 800:{name:'入门棋友',target:1320,time:120,randomChance:.30},
 1200:{name:'进阶棋友',target:1320,time:280,randomChance:.08},
 1500:{name:'思考型棋手',target:1500,time:500,randomChance:0}
};
export const uciOf=move=>move.from+move.to+(move.promotion||'');
export function chooseMove(best,legal,level,random=Math.random){const profile=DIFFICULTIES[level]||DIFFICULTIES[1200];if(!legal.includes(best))throw Error('Engine returned an illegal move');if(legal.length>1&&random()<profile.randomChance)return legal[Math.floor(random()*legal.length)];return best;}
export class ChessOpponent{
 constructor(WorkerClass=Worker){
  this.worker=new WorkerClass(new URL('./vendor/stockfish/stockfish-19-lite-single.js',import.meta.url));this.waiters=new Set();this.closed=false;
  this.worker.onmessage=event=>{if(typeof event.data!=='string')return;for(const line of event.data.split(/\r?\n/))for(const waiter of [...this.waiters])if(waiter.test(line)){this.waiters.delete(waiter);clearTimeout(waiter.timer);waiter.resolve(line);}};
  this.worker.onerror=()=>this.fail(Error('Chess engine could not load'));
  this.ready=this.boot();
 }
 send(command){if(this.closed)throw Error('Engine closed');this.worker.postMessage(command);}
 request(command,test,timeout=20000){return new Promise((resolve,reject)=>{if(this.closed){reject(Error('Engine closed'));return;}const waiter={test,resolve,reject};waiter.timer=setTimeout(()=>{this.waiters.delete(waiter);reject(Error('Engine response timed out'));},timeout);this.waiters.add(waiter);try{this.send(command);}catch(error){this.waiters.delete(waiter);clearTimeout(waiter.timer);reject(error);}});}
 async boot(){await this.request('uci',line=>line==='uciok');this.send('setoption name Hash value 16');this.send('setoption name UCI_LimitStrength value true');await this.request('isready',line=>line==='readyok');}
 async move(game,level){await this.ready;if(game.isGameOver())return null;const profile=DIFFICULTIES[level]||DIFFICULTIES[1200],legal=game.moves({verbose:true}).map(uciOf);this.send('setoption name UCI_Elo value '+profile.target);this.send('position startpos moves '+game.history({verbose:true}).map(uciOf).join(' '));const answer=await this.request('go movetime '+profile.time,line=>line.startsWith('bestmove '),15000);const best=answer.split(/\s+/)[1];return chooseMove(best,legal,level);}
 fail(error){for(const waiter of this.waiters){clearTimeout(waiter.timer);waiter.reject(error);}this.waiters.clear();}
 destroy(){if(this.closed)return;this.closed=true;this.fail(Error('Engine closed'));this.worker.terminate();}
}
