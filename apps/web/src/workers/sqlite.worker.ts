// apps/web/src/workers/sqlite.worker.ts
import type { IpcRequest, IpcResponse } from '../data/ipc';

// For now we are NOT initializing sqlite here yet.
// This step is only about typed IPC + "ready" handshake.
let isReady = true; // We'll switch this after we actually init sqlite in a later step.

function post(msg: IpcResponse) {
  (self as unknown as Worker).postMessage(msg);
}

self.addEventListener('message', (ev: MessageEvent<IpcRequest>) => {
  const msg = ev.data;
  try {
    if (!msg?.type || !msg?.id) return;

    switch (msg.type) {
      case 'ping':
        post({ id: msg.id, type: 'pong' });
        break;
      case 'status':
        post({ id: msg.id, type: 'status', ready: isReady });
        break;
      default:
        post({ id: (msg as any)?.id ?? 'unknown', type: 'error', error: `unknown message type: ${String((msg as any).type)}` });
    }
  } catch (e: any) {
    post({ id: msg?.id ?? 'unknown', type: 'error', error: e?.message ?? String(e) });
  }
});

// Mark as module for Vite
export {};
