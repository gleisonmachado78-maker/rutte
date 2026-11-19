// Service worker da Rutte: guarda o app para abrir rápido e sem internet.
// - arquivos com hash (/assets/…): cache primeiro (nunca mudam; abre instantâneo)
// - página e demais arquivos: rede primeiro, mas se a rede demorar mais de 2,5 s (ou cair) usa a cópia guardada
const CACHE = 'rutte-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

const save = (req, res) => {
  if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
};

/** Rede com prazo: se não responder a tempo, usa a cópia (e a rede continua atualizando a cópia por trás). */
function networkFirst(req, fallbackHtml) {
  const net = fetch(req).then((res) => save(req, res));
  const cached = () => caches.match(req).then((r) => r || (fallbackHtml ? caches.match('./index.html') : undefined));
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      cached().then((r) => {
        if (!done && r) {
          done = true;
          resolve(r);
        }
      });
    }, 2500);
    net
      .then((res) => {
        clearTimeout(timer);
        if (!done) {
          done = true;
          resolve(res);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        cached().then((r) => {
          if (!done) {
            done = true;
            resolve(r || Response.error());
          }
        });
      });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  if (!sameOrigin && !isFont) return;
  // versão e aviso de manutenção: sempre da rede (sem cópia)
  if (sameOrigin && /\/(version|status|news)\.json$/.test(url.pathname)) return;
  if ((sameOrigin && url.pathname.includes('/assets/')) || /fonts\.gstatic\.com/.test(req.url)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => save(req, res))));
    return;
  }
  // recarga pedida pelo app para pegar a versão nova (?v=…): espera a rede, sem prazo
  if (req.mode === 'navigate' && url.searchParams.has('v')) {
    e.respondWith(fetch(req).then((res) => save(new Request('./index.html'), res)).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(networkFirst(req, req.mode === 'navigate'));
});

// Toque na notificação: foca a Rutte aberta ou abre o endereço do alerta
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const same = list.find((c) => c.url.startsWith(self.registration.scope));
      if (same && url.startsWith(self.registration.scope)) return same.focus().then((c) => c && c.navigate ? c.navigate(url) : c);
      return self.clients.openWindow(url);
    }),
  );
});

// Alerta vindo do servidor (funciona com a Rutte fechada). Com a Rutte aberta na tela, ela mesma mostra o aviso com som.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Rutte', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const visible = list.find((c) => c.visibilityState === 'visible' && c.focused);
      if (visible) {
        visible.postMessage(Object.assign({ type: 'rutte-push' }, d));
        return;
      }
      return self.registration.showNotification(d.title || 'Rutte', {
        body: d.body || '',
        tag: d.tag,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { url: d.url || './' },
      });
    }),
  );
});
