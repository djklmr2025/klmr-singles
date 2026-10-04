
// Pruebas del emulador (a-h) para Firestore Rules
// Debes correr el emulador de Firebase para ejecutar estos tests.
// a) Usuario no autenticado NO puede leer downloads
// b) Usuario autenticado SIN correo verificado NO puede leer downloads
// c) Usuario autenticado CON correo pero SIN entitlements NO puede leer downloads
// d) Usuario con entitlements correctos SÍ puede leer downloads
// e) Cualquiera autenticado puede leer un código para validarlo
// f) Canjeo exitoso actualiza el código a used=true y entitlement hasAccess=true
// g) Código ya usado NO puede volver a canjearse
// h) Un usuario NO puede leer perfil/entitlements de otro

