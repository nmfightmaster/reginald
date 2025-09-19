// apps/web/src/data/ipc.ts
// Narrow message protocol for the SQLite worker.
// Small and explicit so we can evolve safely.

export type IpcRequest =
  | { id: string; type: 'ping' }
  | { id: string; type: 'status' };

export type IpcResponse =
  | { id: string; type: 'pong' }
  | { id: string; type: 'status'; ready: boolean }
  | { id: string; type: 'error'; error: string };

// Simple id helper for request/response correlation
export function makeRequestId(): string {
  // Not cryptographically strong; just unique enough for dev
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
