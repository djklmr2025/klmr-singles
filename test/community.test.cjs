const { test } = require('node:test');
const assert = require('node:assert/strict');
const v = require('../functions/validation');
test('rechaza cuentas anónimas y correos sin verificar', () => {
  for (const auth of [null, {uid:'x',token:{email_verified:false}}, {uid:'x',token:{email_verified:true,firebase:{sign_in_provider:'anonymous'}}}]) assert.throws(() => v.verifiedUser(auth));
  assert.equal(v.verifiedUser({uid:'x',token:{email_verified:true,firebase:{sign_in_provider:'password'}}}), 'x');
});
test('cambiar o retirar un voto mantiene el balance', () => {
  assert.deepEqual(v.tally('like','dislike'), {likes:-1,dislikes:1});
  assert.deepEqual(v.tally('dislike',null), {likes:0,dislikes:-1});
  assert.deepEqual(v.tally('like','like'), {likes:0,dislikes:0});
});
test('rechaza pistas, votos y comentarios inválidos', () => {
  for (const x of [0,29,'1',1.5]) assert.throws(() => v.trackId(x));
  for (const x of ['', ' ', 'x'.repeat(1001), {}]) assert.throws(() => v.commentText(x));
  assert.throws(() => v.voteValue('both'));
  assert.throws(() => v.visitId('../stats'));
  assert.equal(v.trackId(28),'28');
});
