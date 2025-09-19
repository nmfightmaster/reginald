// apps/web/src/data/sqlite.worker.ts
/// <reference lib="webworker" />
import type { Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import sqlite3WasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';

declare const self: DedicatedWorkerGlobalScope;

async function init() {
  try {
    const sqlite3Init = (await import('@sqlite.org/sqlite-wasm')).default;
    const sqlite3: Sqlite3Static = await sqlite3Init({
      locateFile: (file: string) => (file.endsWith('.wasm') ? sqlite3WasmUrl : file),
    });

    let persistenceMode: 'opfs' | 'memory' = 'memory';
    const vfsFind = (sqlite3 as any).vfs_find?.bind(sqlite3);

    if (typeof vfsFind === 'function' && vfsFind('opfs')) {
      persistenceMode = 'opfs';
      // Sanity: try opening/closing once to ensure OPFS is really usable here
      const OpfsDb = (sqlite3 as any).oo1?.OpfsDb;
      if (OpfsDb) {
        const testDb = new OpfsDb('reginald.db');
        testDb.close();
      }
    }

    self.postMessage({ type: 'ready', persistenceMode });
  } catch (err) {
    self.postMessage({ type: 'error', error: (err as Error)?.message ?? String(err) });
  }
}

self.addEventListener('message', (e) => {
  const { type } = e.data || {};
  if (type === 'init') void init();
});
