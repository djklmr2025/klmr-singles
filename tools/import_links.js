import { readFileSync } from 'node:fs';
import { db } from './_admin.js';
const items = JSON.parse(readFileSync(process.argv[2] || 'links.local.json', 'utf8')); // [{n,title,link}]
for (const { n, title, link } of items) {
  if (!/^https:\/\//.test(link)) { console.error('Enlace inválido en la pista', n); process.exit(1); }
  await db.collection('downloads').doc(String(n)).set({ title, link }); console.log('OK', n, title);
}
