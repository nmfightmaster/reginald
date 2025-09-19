// apps/web/src/data/dbWorkerAdapter.ts
// Worker-backed DatabaseAdapter (stub). In this step we only prove IPC typed wiring.
// All exec() calls still run on main thread (no behavior change).

import { getDb } from './db';
import type { ExecParams, DatabaseAdapter } from './dbAdapter';
import { makeRequestId, type IpcRequest, type IpcResponse } from './ipc';

export async function createWorkerAdapter(): Promise<DatabaseAdapter> {
  const worker = new Worker(new URL('../workers/sqlite.worker.ts', import.meta.url), {
    type: 'module',
  });

  // Simple request/response map
  const pending = new Map<string, (res: IpcResponse) => void>();

  worker.onmessage = (e: MessageEvent<IpcResponse>) => {
    const res = e.data;
    const key = res?.id;
    if (key && pending.has(key)) {
      const resolve = pending.get(key)!;
      pending.delete(key);
      resolve(res);
    }
    if (res?.type === 'error') {
      // eslint-disable-next-line no-console
      console.error('[sqlite-worker] error:', res.error);
    }
  };

  function send<T extends IpcRequest>(msg: T): Promise<IpcResponse> {
    return new Promise((resolve) => {
      pending.set(msg.id, resolve);
      worker.postMessage(msg);
    });
  }

  // Non-blocking pings just to prove wiring
  void send({ id: makeRequestId(), type: 'ping' }).then((r) => {
    if (r.type === 'pong') console.info('[sqlite-worker] pong');
  });
  void send({ id: makeRequestId(), type: 'status' }).then((r) => {
    if (r.type === 'status') console.info('[sqlite-worker] status.ready =', r.ready);
  });

  // TEMP: delegate to main-thread DB until we implement worker-side sqlite
  const db = await getDb();

  return {
    exec(params: ExecParams) {
      if (typeof params === 'string') {
        db.exec?.(params);
      } else {
        db.exec?.(params as any);
      }
    },
  };
}
