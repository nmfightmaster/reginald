// apps/web/src/data/dbWorkerAdapter.ts
import type { ExecParams, DatabaseAdapter } from './dbAdapter';
import { makeRequestId, type IpcRequest, type IpcResponse } from './ipc';

export async function createWorkerAdapter(): Promise<DatabaseAdapter> {
  const worker = new Worker(new URL('../workers/sqlite.worker.ts', import.meta.url), { type: 'module' });

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
      console.error('[sqlite-worker] error:', res.error);
    }
  };

  function send<T extends IpcRequest>(msg: T): Promise<IpcResponse> {
    return new Promise((resolve) => {
      pending.set(msg.id, resolve);
      worker.postMessage(msg);
    });
  }

  // Non-blocking status note
  void send({ id: makeRequestId(), type: 'status' }).then((r) => {
    if (r.type === 'status') console.info('[sqlite-worker] status.ready =', r.ready);
  });

  return {
    async exec(params: ExecParams): Promise<void> {
      // Reads (SELECTs with callback): fetch rows and replay callback locally.
      if (typeof params !== 'string' && (params.rowMode || params.callback)) {
        const sql = params.sql;
        const bind = params.bind ?? [];
        const rowMode = params.rowMode ?? 'object';
        const cb = params.callback;
        const res = await send({ id: makeRequestId(), type: 'select', sql, bind, rowMode });
        if (res.type === 'rows' && cb) {
          for (const row of res.rows) cb(row);
        } else if (res.type === 'error') {
          throw new Error(res.error);
        }
        return;
      }

      // Writes / DDL: wait for 'ok' before returning to avoid races
      const sql = typeof params === 'string' ? params : params.sql;
      const bind = typeof params === 'string' ? undefined : params.bind;
      const res = await send({ id: makeRequestId(), type: 'execNoRows', sql, bind });
      if (res.type === 'error') throw new Error(res.error);
    },
  };
}
