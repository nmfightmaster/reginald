// apps/web/src/data/db.ts
import type { Sqlite3Static } from '@sqlite.org/sqlite-wasm';

// Vite trick: import the .wasm as a URL so locateFile can find it in dev/build
// (The package ships sqlite3.wasm alongside the JS loader.)
import sqlite3WasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';

// Lazy, idempotent init promise so we never double-initialize
let initPromise: Promise<{ sqlite3: Sqlite3Static; persistenceMode: 'opfs' | 'memory' }> | null = null;

export function initSqlite() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Dynamically import the module so it isn't loaded until requested
    // The default export is a function that returns a Promise<Sqlite3Static>
    const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;

    const sqlite3: Sqlite3Static = await sqlite3InitModule({
      // Tell Emscripten where to find the .wasm artifact that Vite bundled
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) return sqlite3WasmUrl;
        return file;
      },
    });

    // Detect OPFS availability. If OPFS VFS is registered, we’ll prefer it later.
    let persistenceMode: 'opfs' | 'memory' = 'memory';
    try {
      const hasOpfs =
        typeof (sqlite3 as any).vfs_find === 'function' &&
        !!(sqlite3 as any).vfs_find('opfs');
      if (hasOpfs) persistenceMode = 'opfs';
    } catch {
      // leave as memory
    }

    // One-time diagnostic to help you verify init in the console
    // (Safe to keep—runs once due to the singleton pattern)
    console.info('[sqlite-wasm] initialized; persistence:', persistenceMode);

    return { sqlite3, persistenceMode };
  })();

  return initPromise;
}

let dbInstance: any | null = null;

/**
 * Returns a singleton SQLite connection.
 * - OPFS: uses persistent storage
 * - Fallback: in-memory DB (non-persistent)
 */
export async function getDb() {
  if (dbInstance) return dbInstance;

  const { sqlite3, persistenceMode } = await initSqlite();

  // Prefer the convenience OpfsDb wrapper if available
  const OpfsDb = (sqlite3 as any)?.oo1?.OpfsDb;
  const DB = (sqlite3 as any)?.oo1?.DB;

  if (persistenceMode === 'opfs' && typeof OpfsDb === 'function') {
    dbInstance = new OpfsDb('reginald.db'); // persisted via OPFS
    console.info('[sqlite-wasm] DB opened in OPFS: reginald.db');
  } else if (typeof DB === 'function') {
    dbInstance = new DB(':memory:', 'ct'); // non-persistent fallback
    console.warn('[sqlite-wasm] OPFS unavailable; using in-memory DB');
  } else {
    throw new Error('sqlite3 oo1 API not available');
  }

  return dbInstance;
}

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;

  const db = await getDb();
  // Table: nodes(id, title, body, createdAt)
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