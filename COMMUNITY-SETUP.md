# Activar la comunidad KLMR

Las letras funcionan sin Firebase. Comentarios, votos y visitas requieren activar el proyecto. Mientras la configuración esté vacía, la página informa que la comunidad está pendiente y no presenta cifras inventadas.

1. En Firebase Console abre el proyecto `arkaios-world` indicado por las herramientas existentes. Confirma que es el proyecto correcto y registra una aplicación web.
2. Copia únicamente la configuración pública de la app web a `social-config.js`: `apiKey`, `authDomain`, `projectId`, `appId` y otros campos proporcionados por Firebase. Nunca copies claves de cuenta de servicio.
3. Activa Authentication > Email/Password y añade `djklmr2025.github.io` a los dominios autorizados.
4. Activa Cloud Firestore. Desde una copia completa del repositorio, ejecuta `npm install` y `npm --prefix functions install`.
5. Con una sesión Firebase autorizada, ejecuta `npx firebase-tools deploy --project arkaios-world --only firestore:rules,functions:community`. Las funciones pueden requerir el plan Blaze; confirma el estado de facturación del proyecto antes de activarlo.
6. Guarda la configuración pública en GitHub y espera la publicación de Pages.

## Verificación de producción

- Sin cuenta: se pueden leer los comentarios y totales; no se puede comentar ni votar.
- Cuenta con correo sin verificar: comentarios y votos bloqueados también en el servidor.
- Cuenta verificada: publicar comentario, cambiar like a dislike y retirar el voto. Cada cuenta tiene un documento de reacción por pista.
- Cambiar de pista muestra sus propios comentarios y totales. Solo se cargan los 50 comentarios más recientes.
- Recargar una pestaña conserva el identificador de visita y no incrementa el contador de nuevo. Una pestaña/sesión distinta puede contar otra visita.
- El contador mide visitas registradas desde la activación, no personas únicas, visitas históricas ni humanos garantizados. Puede incluir bots. Los visitantes sin cuenta se cuentan sin crear cuentas anónimas.
- El correo no se publica. El apodo elegido y comentario sí son públicos; los apodos no acreditan identidad.
- Hay una espera de 30 segundos entre comentarios de una misma cuenta. No hay moderación automática.

Las escrituras sociales directas a Firestore están denegadas. Las funciones verifican la cuenta, validan las entradas y actualizan votos/visitas con transacciones. Los documentos internos de visitas y límites no son públicos. No hay App Check configurado todavía; debe añadirse si se necesita protección adicional frente a tráfico automatizado. La interfaz no sustituye la aplicación de reglas y despliegue del servidor.

Validación local: `node --test test/community.test.cjs`. Estas pruebas cubren validación de cuentas, entradas y deltas de votos; no sustituyen la prueba de producción ni de reglas en emulador.
