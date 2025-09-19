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
  exec(params: ExecParams): Promise<void>;
}

// Flip the Worker adapter ON for both reads and writes.
const enableSqliteWorker = true;

async function createMainThreadAdapter(): Promise<DatabaseAdapter> {
  const db = await getDb();
  return {
    async exec(params: ExecParams): Promise<void> {
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

export async function getWriteAdapter(): Promise<DatabaseAdapter> {
  if (enableSqliteWorker) {
    const { createWorkerAdapter } = await import('./dbWorkerAdapter');
    return createWorkerAdapter();
  }
  return createMainThreadAdapter();
}
