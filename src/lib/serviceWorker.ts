export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[SW] New version activated');
            }
          });
        }
      });
    } catch (e) {
      console.warn('[SW] Registration failed:', e);
    }
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'RESULTS_FLUSHED') {
      console.log('[SW] Pending results flushed, remaining:', event.data.remaining);
    }
  });
}

export function queueGameResult(url: string, body: Record<string, unknown>) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'QUEUE_RESULT',
      payload: { url, body }
    });
    return true;
  }
  return false;
}

export function flushPendingResults() {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'FLUSH_RESULTS' });
  }
}

export async function getPendingResultsCount(): Promise<number> {
  try {
    const cache = await caches.open('chess-pending-results');
    const response = await cache.match('/pending-results');
    if (!response) return 0;
    const results = await response.json();
    return results.length;
  } catch {
    return 0;
  }
}
