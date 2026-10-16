function trackId(value) {
  if (!Number.isInteger(value) || value < 1 || value > 28) throw new Error('Pista inválida.');
  return String(value).padStart(2, '0');
}
function verifiedUser(auth) {
  if (!auth || auth.token?.firebase?.sign_in_provider === 'anonymous' || auth.token?.email_verified !== true) throw new Error('Inicia sesión y verifica tu correo.');
  return auth.uid;
}
function commentText(value) {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 1000) throw new Error('Escribe entre 2 y 1000 caracteres.');
  return value.trim();
}
function voteValue(value) {
  if (![null, 'like', 'dislike'].includes(value)) throw new Error('Voto inválido.');
  return value;
}
function visitId(value) {
  if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/i.test(value)) throw new Error('Visita inválida.');
  return value;
}
function tally(old, next) {
  return { likes: Number(next === 'like') - Number(old === 'like'), dislikes: Number(next === 'dislike') - Number(old === 'dislike') };
}
module.exports = { trackId, verifiedUser, commentText, voteValue, visitId, tally };
