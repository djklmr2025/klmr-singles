import { db, admin } from './_admin.js';
const who = process.argv[2]; if (!who) { console.error('Uso: npm run revoke -- correo|uid'); process.exit(1); }
const uid = who.includes('@') ? (await admin.auth().getUserByEmail(who)).uid : who;
await db.collection('entitlements').doc(uid).update({ active: false }); console.log('Acceso revocado:', uid);
