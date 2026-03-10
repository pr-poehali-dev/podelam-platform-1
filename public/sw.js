const CACHE_NAME = 'chess-game-v2';
const GAME_ASSETS = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(GAME_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.woff2')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'QUEUE_RESULT') {
    savePendingResult(event.data.payload);
  }

  if (event.data && event.data.type === 'FLUSH_RESULTS') {
    flushPendingResults();
  }
});

async function savePendingResult(payload) {
  const cache = await caches.open('chess-pending-results');
  const existing = await cache.match('/pending-results');
  let results = [];
  if (existing) {
    results = await existing.json();
  }
  results.push({ ...payload, queued_at: Date.now() });
  await cache.put('/pending-results', new Response(JSON.stringify(results)));
}

async function flushPendingResults() {
  const cache = await caches.open('chess-pending-results');
  const existing = await cache.match('/pending-results');
  if (!existing) return;

  let results = await existing.json();
  if (!results.length) return;

  const remaining = [];
  for (const r of results) {
    try {
      const res = await fetch(r.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r.body)
      });
      if (!res.ok) remaining.push(r);
    } catch {
      remaining.push(r);
    }
  }

  if (remaining.length) {
    await cache.put('/pending-results', new Response(JSON.stringify(remaining)));
  } else {
    await cache.delete('/pending-results');
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'RESULTS_FLUSHED', remaining: remaining.length });
  });
}