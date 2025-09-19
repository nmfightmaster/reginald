// apps/web/src/pages/NodesPage.tsx
import { useEffect } from 'react';
import { initSqlite, getDb, ensureSchema } from '../data/db';

export default function NodesPage() {
  useEffect(() => {
    (async () => {
      await initSqlite();
      const db = await getDb();
      void ensureSchema();
      // No schema yet—just verifying the connection exists.
      console.info('[sqlite-wasm] getDb() returned instance:', db ? 'ok' : 'null');
    })();
  }, []);

  return <div style={{ padding: 16 }}>Nodes (coming soon)</div>;
}
