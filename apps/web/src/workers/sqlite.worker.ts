// apps/web/src/workers/sqlite.worker.ts
import type { IpcRequest, IpcResponse } from '../data/ipc';

let initPromise: Promise<void> | null = null;
let sqlite3: any = null;
let db: any = null;
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

    // Ensure schema here so both writes and reads work without main thread touching DB
    db.exec?.(`
      CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT,
        createdAt INTEGER NOT NULL
      );
    `);

    isReady = true;
    console.info('[sqlite-worker] initialized with OPFS DB: reginald.db');
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
          error: `unknown message type: ${String((msg as any).type)}`,
        });
      }
    }
  } catch (e: any) {
    post({ id: msg?.id ?? 'unknown', type: 'error', error: e?.message ?? String(e) });
  }
});

// Mark as module
export {};
