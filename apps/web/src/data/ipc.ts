// apps/web/src/data/ipc.ts
// Narrow message protocol for the SQLite worker.

export type IpcRequest =
  | { id: string; type: 'ping' }
  | { id: string; type: 'status' }
  | { id: string; type: 'init' }
  | { id: string; type: 'execNoRows'; sql: string; bind?: any[] }
  | { id: string; type: 'select'; sql: string; bind?: any[]; rowMode?: 'object' | 'array' };

export type IpcResponse =
  | { id: string; type: 'pong' }
  | { id: string; type: 'status'; ready: boolean }
  | { id: string; type: 'ok' }
  | { id: string; type: 'rows'; rows: any[] }
  | { id: string; type: 'error'; error: string };

// Simple id helper for request/response correlation
export function makeRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
