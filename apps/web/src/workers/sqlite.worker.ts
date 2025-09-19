// apps/web/src/workers/sqlite.worker.ts
// Minimal Worker skeleton for future SQLite OPFS work.
// For now it just answers a ping so we can verify wiring.

self.addEventListener('message', (ev: MessageEvent) => {
  const msg = ev.data;
  if (msg?.type === 'ping') {
    (self as unknown as Worker).postMessage({ type: 'pong' });
  } else {
    // Stub: not implemented yet
    (self as unknown as Worker).postMessage({ type: 'noop', echo: msg });
  }
});

// Mark this file as an ES module for Vite/TypeScript
export {};
