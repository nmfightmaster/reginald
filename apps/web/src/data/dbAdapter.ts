// apps/web/src/data/dbAdapter.ts
import { getDb } from './db';

/**
 * Minimal exec() signature compatible with sqlite3.oo1 DB.exec:
 * - Either a raw SQL string, or
 * - An object with sql + optional bind/rowMode/callback
 */
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
  // In the future we can add: prepare/run/get/close, or message-passing details for a Worker impl.
}

/**
 * Current adapter: forwards to the main-thread sqlite DB.
 * Later, this can proxy to a Web Worker without changing callers.
 */
export async function getDbAdapter(): Promise<DatabaseAdapter> {
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
