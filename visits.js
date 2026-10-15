// Contador real KLMR Singles. Los totales se almacenan en MongoDB.
(() => {
  const el = document.getElementById('visits');
  if (!el) return;
  const endpoint = 'https://cd-trckas-plataforma.vercel.app/api/visits';
  el.textContent = 'Consultando visitas…';
  const show = n => { el.textContent = new Intl.NumberFormat('es-MX').format(n) + ' visitas registradas'; };
  (async () => {
    try {
      let visitorId;
      try {
        visitorId = localStorage.getItem('klmr_visit_id');
        if (!visitorId || !/^[0-9a-f-]{36}$/.test(visitorId)) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('klmr_visit_id', visitorId);
        }
      } catch { visitorId = crypto.randomUUID(); }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({visitorId}),
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.visits) || data.visits < 0) throw new Error('Invalid total');
      show(data.visits);
    } catch {
      try {
        const response = await fetch(endpoint, {cache:'no-store'});
        const data = await response.json();
        if (response.ok && Number.isSafeInteger(data.visits) && data.visits >= 0) return show(data.visits);
      } catch {}
      el.textContent = 'Visitas no disponibles';
    }
  })();
})();
