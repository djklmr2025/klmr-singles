const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { createHash } = require('node:crypto');
const { trackId, verifiedUser, commentText, voteValue, visitId, tally } = require('./validation');
initializeApp();
const db = getFirestore();
const options = { region: 'us-central1', maxInstances: 3 };
function validate(fn) { try { return fn(); } catch (e) { throw new HttpsError('invalid-argument', e.message); } }
function account(request) { try { return verifiedUser(request.auth); } catch (e) { throw new HttpsError('unauthenticated', e.message); } }
exports.postTrackComment = onCall(options, async request => {
  const uid = account(request), track = validate(() => trackId(request.data?.track));
  const text = validate(() => commentText(request.data?.text));
  const name = request.data?.name;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 30) throw new HttpsError('invalid-argument', 'El apodo debe tener entre 2 y 30 caracteres.');
  const limiter = db.doc(`communityLimits/${uid}`), comment = db.collection(`tracks/${track}/comments`).doc();
  await db.runTransaction(async tx => {
    const last = await tx.get(limiter), now = Date.now();
    if (last.exists && now - last.data().lastCommentAt.toMillis() < 30000) throw new HttpsError('resource-exhausted', 'Espera 30 segundos entre comentarios.');
    tx.set(limiter, { lastCommentAt: Timestamp.fromMillis(now) }, { merge: true });
    tx.create(comment, { uid, name: name.trim(), text, createdAt: FieldValue.serverTimestamp() });
  });
  return { id: comment.id };
});
exports.setTrackReaction = onCall(options, async request => {
  const uid = account(request), track = validate(() => trackId(request.data?.track));
  const next = validate(() => voteValue(request.data?.value));
  const vote = db.doc(`tracks/${track}/reactions/${uid}`), stats = db.doc(`trackStats/${track}`);
  await db.runTransaction(async tx => {
    const previous = await tx.get(vote), old = previous.exists ? previous.data().value : null;
    if (old === next) return;
    const delta = tally(old, next);
    if (next === null) tx.delete(vote); else tx.set(vote, { value: next, updatedAt: FieldValue.serverTimestamp() });
    tx.set(stats, { likes: FieldValue.increment(delta.likes), dislikes: FieldValue.increment(delta.dislikes) }, { merge: true });
  });
  return { value: next };
});
exports.recordSiteVisit = onCall(options, async request => {
  const id = validate(() => visitId(request.data?.id));
  const key = createHash('sha256').update(id).digest('hex');
  const visit = db.doc(`siteVisits/${key}`), stats = db.doc('siteStats/public');
  await db.runTransaction(async tx => {
    const found = await tx.get(visit);
    if (found.exists) return;
    tx.create(visit, { createdAt: FieldValue.serverTimestamp() });
    tx.set(stats, { visits: FieldValue.increment(1) }, { merge: true });
  });
  return { recorded: true };
});
