# Administración (en tu PC, con Node.js)
1. `npm install`
2. Descarga la clave de cuenta de servicio (Firebase > Configuración > Cuentas de servicio) y guárdala FUERA del repo.
   En PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ARKAIOS\secretos\clave.json"`
3. Enlaces: crea `links.local.json` (ignorado por git) con `[{"n":1,"title":"Pista 1","link":"https://..."}]` y corre `npm run import`
4. Códigos: `npm run codes -- 10 regalo "Preventa"` (aleatorios; se guardan en `codes.local.csv`, ignorado por git)
5. Revocar: `npm run revoke -- correo@ejemplo.com`
6. Pruebas de reglas: `npm test` (levanta el emulador de Firestore)
