// ═══════════════════════════════════════════════════════
// UnaAlDia — Service Worker v5.0 (PWA / Offline-First)
// ═══════════════════════════════════════════════════════
const CACHE_NAME = 'unaaldia-v5';
const APP_SHELL_CACHE = 'unaaldia-shell-v5';
const MEDIA_CACHE = 'unaaldia-media-v5';

// Recursos del shell de la aplicación (cargados en el install)
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/icon-192.png',
  '/css/estilos.css',
  '/js/helpers.js',
  '/js/database.js',
  '/js/drive.js',
  '/js/ai.js',
  '/js/settings.js',
  '/js/movie.js',
  '/js/components.js',
  '/js/modals/edit-memory-modal.js',
  '/js/modals/profile-modal.js',
  '/js/modals/confirm-delete-modal.js',
  '/js/capture.js',
  '/js/history.js',
  '/js/albums.js',
  '/js/biographer.js',
  '/js/video.js',
  '/js/app.js'
];

// CDN resources to cache
const CDN_URLS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// ═══════════════════════════════════════════════════════
// INSTALL — Pre-cachear el shell de la app
// ═══════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando UnaAlDia v4...');
  event.waitUntil(
    (async () => {
      // Cachear shell local
      const shellCache = await caches.open(APP_SHELL_CACHE);
      try {
        await shellCache.addAll(APP_SHELL_URLS);
        console.log('[SW] App shell cacheado correctamente.');
      } catch (err) {
        console.warn('[SW] Error cacheando shell:', err);
        // Intentar uno a uno para no fallar todo
        for (const url of APP_SHELL_URLS) {
          try { await shellCache.add(url); } catch (e) { console.warn('[SW] No se pudo cachear:', url); }
        }
      }

      // Cachear CDN resources
      const appCache = await caches.open(CACHE_NAME);
      for (const url of CDN_URLS) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) await appCache.put(url, response);
        } catch (e) {
          console.warn('[SW] No se pudo pre-cachear CDN:', url);
        }
      }

      self.skipWaiting();
      console.log('[SW] Instalación completada.');
    })()
  );
});

// ═══════════════════════════════════════════════════════
// ACTIVATE — Limpiar caches antiguas
// ═══════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando nueva versión...');
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const validCaches = [CACHE_NAME, APP_SHELL_CACHE, MEDIA_CACHE];
      await Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => {
            console.log('[SW] Eliminando cache obsoleta:', key);
            return caches.delete(key);
          })
      );
      await self.clients.claim();
      console.log('[SW] Activación completada. App lista para uso offline.');
    })()
  );
});

// ═══════════════════════════════════════════════════════
// FETCH — Estrategia de caché inteligente
// ═══════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no son GET
  if (request.method !== 'GET') return;

  // Ignorar peticiones a extensiones de Chrome
  if (url.protocol === 'chrome-extension:') return;

  // Ignorar peticiones a Google APIs (Drive, OAuth) — siempre red
  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('accounts.google.com') ||
      url.hostname.includes('api.deepseek.com')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  // ── 0. API del Servidor local o externas (/api/) → Siempre red directa (sin caché)
  if (url.pathname.includes('/api/')) {
    return fetch(request);
  }

  // Navegación de la PWA: conserva una entrada funcional aun sin red.
  if (request.mode === 'navigate') {
    try {
      return await fetch(request);
    } catch (err) {
      const cache = await caches.open(APP_SHELL_CACHE);
      return (await cache.match('/index.html')) || (await cache.match('/')) ||
        new Response('La aplicación no está disponible sin conexión.', { status: 503 });
    }
  }

  // ── 1. App Shell (HTML, íconos, manifest) → Cache First
  if (isAppShell(url)) {
    return cacheFirst(request, APP_SHELL_CACHE);
  }

  // ── 2. CDN (React, Babel, Tailwind, Fonts) → Cache First con fallback de red
  if (isCDN(url)) {
    return cacheFirst(request, CACHE_NAME);
  }

  // ── 3. Media de Drive o externos → Network First con fallback a cache
  if (url.pathname.includes('drive.google.com') || url.pathname.includes('unsplash.com')) {
    return networkFirst(request, MEDIA_CACHE);
  }

  // ── 4. Resto → Network First con fallback a cache
  return networkFirst(request, CACHE_NAME);
}

function isAppShell(url) {
  return url.pathname === '/' ||
         url.pathname.endsWith('.html') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('manifest.json') ||
         url.pathname.includes('/static/icon');
}

function isCDN(url) {
  return url.hostname.includes('unpkg.com') ||
         url.hostname.includes('cdn.tailwindcss.com') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    console.warn('[SW] Red no disponible y no hay caché para:', request.url);
    return new Response('Recurso no disponible offline.', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Sin conexión y sin caché disponible.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ═══════════════════════════════════════════════════════
// BACKGROUND SYNC — Sincronización diferida con Drive
// ═══════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-drive') {
    console.log('[SW] Background sync: sync-drive disparado');
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        if (!clients || clients.length === 0) return Promise.resolve();
        return Promise.all(clients.map(client =>
          client.postMessage({ type: 'SYNC_DRIVE' })
        ));
      })
    );
  }
});

// ═══════════════════════════════════════════════════════
// MENSAJES desde la app
// ═══════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'PING') {
    event.source.postMessage({ type: 'PONG', version: CACHE_NAME });
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

