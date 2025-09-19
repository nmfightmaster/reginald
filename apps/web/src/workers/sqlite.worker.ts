// apps/web/src/workers/sqlite.worker.ts
import type { IpcRequest, IpcResponse } from '../data/ipc';

let sqlite3: any = null;
let db: any = null;
let initPromise: Promise<void> | null = null;
let isReady = false;

function post(msg: IpcResponse) {
  (self as unknown as Worker).postMessage(msg);
}

async function ensureInit() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;
    const sqlite3WasmUrl = (await import('@sqlite.org/sqlite-wasm/sqlite3.wasm?url')).default as string;

    sqlite3 = await sqlite3InitModule({
      locateFile: (file: string) => (file.endsWith('.wasm') ? sqlite3WasmUrl : file),
    });

    const OpfsDb = sqlite3?.oo1?.OpfsDb;
    if (typeof OpfsDb !== 'function') throw new Error('OpfsDb API not available');

    db = new OpfsDb('reginald.db');

    // Ensure schema (nodes + staging_items)
    db.exec?.(`
      CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT,
        createdAt INTEGER NOT NULL
      );
    `);

    db.exec?.(`
      CREATE TABLE IF NOT EXISTS staging_items (
        id INTEGER PRIMARY KEY,
        kind TEXT NOT NULL CHECK(kind IN ('text','file','url','clipboard')),
        title TEXT,
        content TEXT,
        filePath TEXT,
        source TEXT NOT NULL CHECK(source IN ('manual','dragdrop','clipboard','import')),
        tags TEXT,
        createdAt INTEGER NOT NULL,
        meta TEXT
      );
    `);

    db.exec?.(`CREATE INDEX IF NOT EXISTS idx_staging_items_createdAt ON staging_items(createdAt DESC);`);
    db.exec?.(`CREATE INDEX IF NOT EXISTS idx_staging_items_kind ON staging_items(kind);`);

    isReady = true;
    console.info('[sqlite-worker] OPFS DB opened and schema ensured');
  })();

  return initPromise;
}

self.addEventListener('message', async (ev: MessageEvent<IpcRequest>) => {
  const msg = ev.data;
  try {
    if (!msg?.type || !msg?.id) return;

    switch (msg.type) {
      case 'ping': {
        post({ id: msg.id, type: 'pong' });
        break;
      }
      case 'status': {
        post({ id: msg.id, type: 'status', ready: isReady });
        break;
      }
      case 'init': {
        await ensureInit();
        post({ id: msg.id, type: 'status', ready: isReady });
        break;
      }
      case 'execNoRows': {
        await ensureInit();
        db.exec?.({ sql: msg.sql, bind: msg.bind ?? [] });
        post({ id: msg.id, type: 'ok' });
        break;
      }
      case 'select': {
        await ensureInit();
        const rows: any[] = [];
        db.exec?.({
          sql: msg.sql,
          bind: msg.bind ?? [],
          rowMode: msg.rowMode ?? 'object',
          callback: (row: any) => rows.push(row),
        });
        post({ id: msg.id, type: 'rows', rows });
        break;
      }
      default: {
        post({
          id: (msg as any)?.id ?? 'unknown',
          type: 'error',
          error: `unknown message type: ${String((msg as any)?.type ?? 'undefined')}`,
        });
      }
    }
  } catch (e: any) {
    post({ id: msg?.id ?? 'unknown', type: 'error', error: e?.message ?? String(e) });
  }
});

// Mark as module
export {};
