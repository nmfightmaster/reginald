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

// Feature flag: keep Worker mode OFF for now (no behavior change).
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

export async function getDbAdapter(): Promise<DatabaseAdapter> {
  if (enableSqliteWorker) {
    const { createWorkerAdapter } = await import('./dbWorkerAdapter');
    return createWorkerAdapter();
  }
  return createMainThreadAdapter();
}
