// Service worker da Rutte: guarda o app para abrir sem internet.
const CACHE = 'rutte-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Rede primeiro (pega atualizações); sem internet, usa a cópia guardada.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  if (!sameOrigin && !isFont) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
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
