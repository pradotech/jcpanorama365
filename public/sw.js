// Service Worker para PWA (JC Panorama 365)
// BUILD_TIMESTAMP: 2026-11-24T10:54:42.805Z
const CACHE_NAME = 'jc-pwa-cache-1795517682805';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  try {
    const url = new URL(event.request.url);

    // NUNCA interceptar chamadas externas (como Supabase, APIs, fontes externas)
    // Nem checagem de versão ou rotas administrativas
    if (
      url.origin !== self.location.origin ||
      url.hostname.includes('supabase.co') ||
      url.pathname.includes('version.json') ||
      url.pathname.startsWith('/admin')
    ) {
      return;
    }

    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } catch (e) {
    // Se a URL for inválida para o navegador, ignorar e deixar a rede nativa lidar
  }
});
