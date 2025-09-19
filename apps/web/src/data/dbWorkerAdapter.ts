// apps/web/src/data/dbWorkerAdapter.ts
// Worker-backed DatabaseAdapter (stub): constructs a Worker, but for now
// all exec() calls still run on the main thread to preserve behavior.

import { getDb } from './db';

// Duplicate of the minimal ExecParams to avoid circular imports.
// Keep in sync with dbAdapter.ts during this scaffold phase.
export type ExecParams =
  | string
  | {
      sql: string;
      bind?: any[];
      rowMode?: 'object' | 'array';
      callback?: (row: any) => void;
    };

export interface DatabaseAdapter {
  exec(params: ExecParams): void;
}

export async function createWorkerAdapter(): Promise<DatabaseAdapter> {
  // Construct the worker. This ensures the worker file compiles and loads.
  const worker = new Worker(new URL('../workers/sqlite.worker.ts', import.meta.url), {
    type: 'module',
  });

  // Simple connectivity check (non-blocking).
  worker.postMessage({ type: 'ping' });
  worker.onmessage = (e) => {
    if (e?.data?.type === 'pong') {
      // eslint-disable-next-line no-console
      console.info('[sqlite-worker] pong');
    }
  };

  // TEMP: delegate to main thread DB until we implement message-based exec.
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
