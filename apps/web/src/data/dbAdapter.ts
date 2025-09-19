// apps/web/src/data/dbAdapter.ts
import { getDb } from './db';

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

// Feature flag: keep Worker mode OFF for now.
const enableSqliteWorker = false;

async function createMainThreadAdapter(): Promise<DatabaseAdapter> {
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

/**
 * Returns a DatabaseAdapter. Currently main-thread only.
 * When enableSqliteWorker=true, it builds a Worker-backed adapter (still delegating to main thread until implemented).
 */
export async function getDbAdapter(): Promise<DatabaseAdapter> {
  if (enableSqliteWorker) {
    // Dynamic import to avoid circular deps and let Vite split chunks.
    const { createWorkerAdapter } = await import('./dbWorkerAdapter');
    return createWorkerAdapter();
  }
  return createMainThreadAdapter();
}
