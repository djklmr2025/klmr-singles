import admin from 'firebase-admin';
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) { console.error('Falta GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON de la cuenta de servicio, FUERA del repo).'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'arkaios-world' });
export { admin }; export const db = admin.firestore();
