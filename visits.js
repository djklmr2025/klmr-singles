// Contador externo sin Firebase. Base visual: 10,000.
// Moe Counter incrementa y almacena visitas; si falla la red, conservar la base visible.
(() => {
  const el = document.getElementById('visits');
  if (!el) return;
  el.textContent = '10,000 visitas';
  const img = document.createElement('img');
  img.alt = 'Contador de visitas de KLMR Singles';
  img.width = 126;
  img.height = 34;
  img.loading = 'eager';
  img.decoding = 'async';
  img.style.cssText = 'display:block;margin:8px auto;max-width:90%;height:auto';
  img.onload = () => { el.textContent = ''; el.append(img); };
  img.onerror = () => { el.textContent = '10,000 visitas'; };
  img.src = 'https://count.getloli.com/@klmr-singles-djklmr2025?name=klmr-singles-djklmr2025&theme=normal-1&offset=10000&padding=4&scale=1&darkmode=dark&t=' + Date.now();
})();
