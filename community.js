import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-functions.js';
import { firebaseConfig, functionsRegion } from './social-config.js';
const $ = id => document.getElementById(id);
let auth, db, functions, current = 0, vote = null, stopComments, stopStats, generation = 0;
const message = text => { $('community-status').textContent = text; };
const error = e => message(({ 'auth/email-already-in-use':'Ese correo ya tiene cuenta.', 'auth/invalid-credential':'Correo o contraseña incorrectos.', 'auth/invalid-email':'Escribe un correo válido.', 'auth/weak-password':'Usa una contraseña de al menos 8 caracteres.', 'functions/unauthenticated':'Inicia sesión y verifica tu correo.', 'functions/resource-exhausted':'Espera 30 segundos entre comentarios.' })[e.code] || 'No se pudo completar. Inténtalo de nuevo.');
const verified = () => !!auth?.currentUser?.emailVerified && !auth.currentUser.isAnonymous;
function enabled() {
  const allowed = verified();
  $('comment-send').disabled = $('like').disabled = $('dislike').disabled = !allowed;
  $('account-state').textContent = !auth?.currentUser ? 'Regístrate o inicia sesión para comentar y votar.' : allowed ? 'Cuenta verificada. Ya puedes comentar y votar.' : 'Verifica tu correo para comentar y votar.';
  $('account-logout').hidden = $('account-refresh').hidden = $('account-resend').hidden = !auth?.currentUser;
  $('account-form').hidden = !!auth?.currentUser;
}
function paintVote() { $('like').setAttribute('aria-pressed', String(vote === 'like')); $('dislike').setAttribute('aria-pressed', String(vote === 'dislike')); }
async function ownVote(n, version) {
  vote = null; paintVote();
  if (!auth?.currentUser || !n) return;
  const uid = auth.currentUser.uid;
  try { const snap = await getDoc(doc(db, 'tracks', String(n).padStart(2,'0'), 'reactions', uid)); if (generation === version && auth.currentUser?.uid === uid) { vote = snap.exists() ? snap.data().value : null; paintVote(); } } catch { /* no stored vote yet */ }
}
function track() {
  const m = location.hash.match(/^#\/(\d+)$/), n = m ? Number(m[1]) : 0;
  current = n >= 1 && n <= 28 ? n : 0;
  const version = ++generation;
  stopComments?.(); stopStats?.(); $('comments-list').replaceChildren();
  $('like-count').textContent = $('dislike-count').textContent = '—';
  $('comment-text').value = ''; message('');
  if (!db || !current) return;
  const id = String(current).padStart(2,'0');
  stopStats = onSnapshot(doc(db,'trackStats',id), snap => {
    if (version !== generation) return;
    $('like-count').textContent = snap.data()?.likes ?? 0;
    $('dislike-count').textContent = snap.data()?.dislikes ?? 0;
  }, () => message('Los votos no están disponibles en este momento.'));
  stopComments = onSnapshot(query(collection(db,'tracks',id,'comments'),orderBy('createdAt','desc'),limit(50)), snap => {
    if (version !== generation) return;
    const items = snap.docs.map(item => {
      const data = item.data(), li = document.createElement('li'), name = document.createElement('strong'), text = document.createElement('p'), date = document.createElement('small');
      name.textContent = data.name; text.textContent = data.text;
      date.textContent = data.createdAt?.toDate().toLocaleString('es-MX') || '';
      li.append(name,date,text); return li;
    });
    $('comments-list').replaceChildren(...items);
    $('comments-empty').hidden = items.length > 0;
    $('comments-empty').textContent = 'Todavía no hay comentarios. Sé el primero.';
  }, () => { $('comments-empty').textContent = 'No se pudieron cargar los comentarios.'; });
  ownVote(current,version);
}
async function run(button, action) {
  button.disabled = true;
  try { await action(); } catch(e) { error(e); } finally { button.disabled = false; enabled(); }
}
if (!firebaseConfig.projectId || !firebaseConfig.apiKey || !firebaseConfig.appId) {
  $('visits').textContent = 'Contador de visitas pendiente de activación';
  message('Los comentarios y votos estarán disponibles cuando se active la comunidad.');
  $('account-form').hidden = true;
} else {
  const app = getApps().find(app => app.name === 'klmr-community') || initializeApp(firebaseConfig, 'klmr-community');
  auth = getAuth(app); db = getFirestore(app); functions = getFunctions(app,functionsRegion);
  const post = httpsCallable(functions,'postTrackComment'), react = httpsCallable(functions,'setTrackReaction'), visit = httpsCallable(functions,'recordSiteVisit');
  $('account-form').onsubmit = e => {
    e.preventDefault(); const mode = e.submitter?.dataset.mode;
    run(e.submitter,async () => {
      const email = $('account-email').value.trim(), password = $('account-password').value;
      if (mode === 'register') {
        if (password.length < 8) return message('Usa una contraseña de al menos 8 caracteres.');
        const result = await createUserWithEmailAndPassword(auth,email,password);
        await sendEmailVerification(result.user); message('Cuenta creada. Revisa tu correo para verificarla.');
      } else await signInWithEmailAndPassword(auth,email,password);
      $('account-password').value = '';
    });
  };
  $('account-reset').onclick = e => run(e.target,async () => { await sendPasswordResetEmail(auth,$('account-email').value.trim()); message('Si corresponde, recibirás un correo para restablecer tu contraseña.'); });
  $('account-logout').onclick = () => signOut(auth).catch(error);
  $('account-refresh').onclick = e => run(e.target,async () => { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); enabled(); });
  $('account-resend').onclick = e => run(e.target,async () => { await sendEmailVerification(auth.currentUser); message('Correo de verificación enviado.'); });
  $('comment-form').onsubmit = e => {
    e.preventDefault(); const n = current, version = generation;
    if (!verified()) return message('Inicia sesión y verifica tu correo.');
    run($('comment-send'),async () => {
      await post({track:n,text:$('comment-text').value,name:$('comment-name').value.trim()});
      if (version === generation) { $('comment-text').value = ''; message('Comentario publicado.'); }
    });
  };
  for (const value of ['like','dislike']) $(value).onclick = e => {
    const n = current, version = generation, next = vote === value ? null : value;
    if (!verified()) return message('Inicia sesión y verifica tu correo.');
    $('like').disabled = $('dislike').disabled = true;
    run($(value), async () => { await react({track:n,value:next}); if (version === generation) { vote = next; paintVote(); } });
  };
  onAuthStateChanged(auth,() => { enabled(); ownVote(current,generation); });
  onSnapshot(doc(db,'siteStats','public'), snap => { $('visits').textContent = `${(snap.data()?.visits ?? 0).toLocaleString('es-MX')} visitas registradas`; }, () => { $('visits').textContent = 'Contador temporalmente no disponible'; });
  // Una visita por sesión de pestaña; el servidor deduplica también al recargar.
  let id;
  try { id = sessionStorage.getItem('klmr-visit'); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('klmr-visit',id); } } catch { id = crypto.randomUUID(); }
  visit({id}).catch(() => { $('visits').textContent = 'No se pudo registrar esta visita'; });
  addEventListener('hashchange',track); track();
}
