import test from 'node:test';
import assert from 'node:assert/strict';
import {moveWorkPhoto} from '../lib/workPhotoOrder.mjs';
const p=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
test('third to first',()=>assert.deepEqual(moveWorkPhoto(p,'c','a').map(x=>x.id),['c','a','b','d']));
test('first to last',()=>assert.deepEqual(moveWorkPhoto(p,'a','d').map(x=>x.id),['b','c','d','a']));
test('backwards reorder preserves metadata',()=>{
  const x=[{id:'a',crop:{x:.2},url:'original'},{id:'b',file:{name:'x.png'}}], n=moveWorkPhoto(x,'b','a');
  assert.strictEqual(n[0],x[1]);assert.strictEqual(n[1],x[0]);
});
test('invalid/no-op are identity',()=>{
  assert.strictEqual(moveWorkPhoto(p,'a','a'),p);
  assert.strictEqual(moveWorkPhoto(p,'absent','b'),p);
  assert.strictEqual(moveWorkPhoto(p,'a','absent'),p);
});
