// Service Worker para PWA (JC Panorama 365)
const CACHE_NAME = 'jc-pwa-cache-v2';

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  try {
    const url = new URL(event.request.url);

    // NUNCA interceptar chamadas externas (como Supabase, APIs, fontes externas)
    // Isso garante total compatibilidade com Chrome legado no Windows 7 e evita bloqueios de CORS
    if (url.origin !== self.location.origin || url.hostname.includes('supabase.co')) {
      return;
    }

    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } catch (e) {
    // Se a URL for inválida para o navegador, ignorar e deixar a rede nativa lidar
  }
});
