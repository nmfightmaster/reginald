// apps/web/src/data/dbWorkerAdapter.ts
import type { ExecParams, DatabaseAdapter } from './dbAdapter';
import { makeRequestId, type IpcRequest, type IpcResponse } from './ipc';
import { sendToWorker as send } from './workerClient';

export async function createWorkerAdapter(): Promise<DatabaseAdapter> {
  // Non-blocking status note (use shared worker)
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

      // Writes / DDL
      const sql = typeof params === 'string' ? params : params.sql;
      const bind = typeof params === 'string' ? undefined : params.bind;
      const res = await send({ id: makeRequestId(), type: 'execNoRows', sql, bind });
      if (res.type === 'error') throw new Error(res.error);
    },
  };
}
