// Contador público: base visual 10,000 + registros nuevos del servicio externo.
// La sesión de la pestaña evita sumar de nuevo al recargar.
(() => {
  const el = document.getElementById('visits');
  if (!el) return;
  const base = 10000;
  const endpoint = 'https://api.counterapi.dev/v1/klmr-singles-official/site-visits';
  const key = 'klmr-counted-session-v1';
  const show = n => { el.textContent = (base + n).toLocaleString('es-MX') + ' visitas'; };
  const counted = (() => { try { return sessionStorage.getItem(key) === 'yes'; } catch { return false; } })();
  fetch(endpoint + (counted ? '/' : '/up'), { cache: 'no-store' })
    .then(r => { if (!r.ok) throw Error('Counter unavailable'); return r.json(); })
    .then(data => {
      const n = Number(data.count);
      if (!Number.isSafeInteger(n) || n < 0) throw Error('Invalid counter');
      show(n);
      if (!counted) { try { sessionStorage.setItem(key, 'yes'); } catch {} }
    })
    .catch(() => { el.textContent = 'Visitas no disponibles'; });
})();
