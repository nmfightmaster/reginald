// apps/web/src/data/db.ts
import type { Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import sqlite3WasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';

let initPromise: Promise<{ sqlite3: Sqlite3Static; persistenceMode: 'opfs' | 'memory' }> | null = null;

export function initSqlite() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;

    const sqlite3: Sqlite3Static = await sqlite3InitModule({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) return sqlite3WasmUrl;
        return file;
      },
    });

    let persistenceMode: 'opfs' | 'memory' = 'memory';
    try {
      const hasOpfs =
        typeof (sqlite3 as any).vfs_find === 'function' &&
        !!(sqlite3 as any).vfs_find('opfs');
      if (hasOpfs) persistenceMode = 'opfs';
    } catch {
      // keep memory
    }

    console.info('[sqlite-wasm] initialized; persistence:', persistenceMode);
    return { sqlite3, persistenceMode };
  })();

  return initPromise;
}

// --- DB singleton ---
let dbInstance: any | null = null;

/**
 * Returns a singleton SQLite connection.
 * - OPFS: persistent (when used from a Worker)
 * - Fallback: in-memory (non-persistent)
 */
export async function getDb() {
  if (dbInstance) return dbInstance;

  const { sqlite3, persistenceMode } = await initSqlite();
  const OpfsDb = (sqlite3 as any)?.oo1?.OpfsDb;
  const DB = (sqlite3 as any)?.oo1?.DB;

  if (persistenceMode === 'opfs' && typeof OpfsDb === 'function') {
    // Note: OPFS requires running in a Worker to fully persist.
    dbInstance = new OpfsDb('reginald.db');
    console.info('[sqlite-wasm] DB opened in OPFS: reginald.db');
  } else if (typeof DB === 'function') {
    dbInstance = new DB(':memory:', 'ct');
    console.warn('[sqlite-wasm] OPFS unavailable; using in-memory DB');
  } else {
    throw new Error('sqlite3 oo1 API not available');
  }

  return dbInstance;
}

// --- One-time schema ensure ---
let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;

  const db = await getDb();
  db.exec?.(`
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      createdAt INTEGER NOT NULL
    );
  `);

  schemaReady = true;
  console.info('[sqlite-wasm] schema ensured');
}

// --- Expose current persistence mode ---
export async function getPersistenceMode(): Promise<'opfs' | 'memory'> {
  const { persistenceMode } = await initSqlite();
  return persistenceMode;
}
