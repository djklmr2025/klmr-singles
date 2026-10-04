import { randomInt } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { db } from './_admin.js';
const [count = '1', type = 'regalo', ...note] = process.argv.slice(2);
const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
for (let i = 0; i < Number(count); i++) {
  const code = Array.from({ length: 16 }, () => A[randomInt(A.length)]).join('');
  await db.collection('codes').doc(code).create({ usedBy: null, usedAt: null, type, note: note.join(' '), createdAt: new Date() });
  appendFileSync('codes.local.csv', `${code},${type},${note.join(' ')}\n`); console.log(code);
}
