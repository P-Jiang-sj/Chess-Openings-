import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {Chess} from '../dist/vendor/chess.js';
import {ChessOpponent,DIFFICULTIES,chooseMove,uciOf} from '../dist/engine.js';
assert.deepEqual(Object.keys(DIFFICULTIES),['800','1200','1500']);
assert.ok(DIFFICULTIES[800].randomChance>DIFFICULTIES[1200].randomChance);assert.equal(DIFFICULTIES[1500].randomChance,0);
assert.equal(chooseMove('e2e4',['e2e4','d2d4'],1500,()=>0),'e2e4');
let draws=[0,.9];assert.equal(chooseMove('e2e4',['e2e4','d2d4'],800,()=>draws.shift()),'d2d4');
assert.throws(()=>chooseMove('a1a8',['e2e4'],1500),/illegal/);
assert.equal(uciOf({from:'e7',to:'e8',promotion:'n'}),'e7e8n');
class FakeWorker{
 constructor(){this.commands=[];this.terminated=false;}
 postMessage(command){this.commands.push(command);const answer=command==='uci'?'uciok':command==='isready'?'readyok':command.startsWith('go ')?'bestmove c7c5 ponder g1f3':null;if(answer)queueMicrotask(()=>this.onmessage?.({data:answer}));}
 terminate(){this.terminated=true;}
}
const game=new Chess();game.move('e4');const bot=new ChessOpponent(FakeWorker);
const move=await bot.move(game,1500);assert.ok(game.moves({verbose:true}).map(uciOf).includes(move));
assert.ok(bot.worker.commands.includes('setoption name UCI_Elo value 1500'));assert.ok(bot.worker.commands.includes('position startpos moves e2e4'));assert.ok(bot.worker.commands.includes('setoption name UCI_LimitStrength value true'));
await bot.move(game,800);assert.ok(bot.worker.commands.includes('setoption name UCI_Elo value 1320'));bot.destroy();assert.ok(bot.worker.terminated);
class WaitingWorker extends FakeWorker{postMessage(command){this.commands.push(command);}}
const cancelled=new ChessOpponent(WaitingWorker),pending=cancelled.move(game,1200);cancelled.destroy();await assert.rejects(pending,/closed/);assert.equal(cancelled.waiters.size,0);
const wasm=await readFile(new URL('../dist/vendor/stockfish/stockfish-19-lite-single.wasm',import.meta.url));assert.deepEqual([...wasm.subarray(0,4)],[0,97,115,109]);assert.ok(wasm.byteLength>1000000);
await stat(new URL('../dist/vendor/stockfish/COPYING.txt',import.meta.url));
console.log('Passed: three distinct difficulty profiles, legal move filtering, UCI history and rating settings, promotion encoding, cancellation cleanup, and the local WASM engine asset.');
