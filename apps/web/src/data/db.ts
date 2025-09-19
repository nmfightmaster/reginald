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
