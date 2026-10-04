# KLMR Admin Scripts

Estas son las instrucciones para administrar el backend con Firebase Admin SDK. Necesitarás Node.js y un archivo de credenciales de cuenta de servicio de Firebase.

1. Instala el SDK: `npm install firebase-admin`
2. El script asumirá que tienes `serviceAccountKey.json` (te indicaré la ruta).

## 1. Importar Enlaces de Drive (Descargas)
Crea o actualiza documentos en la colección `downloads`.
```javascript
const admin = require("firebase-admin");
const serviceAccount = require("RUTA_A_TU_SERVICE_ACCOUNT.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function addDownload(id, title, link) {
  await db.collection("downloads").doc(id).set({ title, link });
  console.log("Añadido:", title);
}
addDownload("mp3-album", "Disco Completo MP3", "https://drive.google.com/...");
```

## 2. Generar Códigos
Crea códigos en la colección `codes`.
```javascript
async function createCode(code) {
  await db.collection("codes").doc(code).set({ used: false, usedBy: null });
  console.log("Código creado:", code);
}
createCode("VIP2026");
```

## 3. Revocar Usuarios
Elimina o modifica los permisos en `entitlements` o desactiva la cuenta.
```javascript
async function revokeAccess(uid) {
  // Elimina su derecho de acceso
  await db.collection("entitlements").doc(uid).update({ hasAccess: false });
  // Opcional: deshabilita su cuenta para que no pueda entrar
  await admin.auth().updateUser(uid, { disabled: true });
  console.log("Acceso revocado para UID:", uid);
}
```
