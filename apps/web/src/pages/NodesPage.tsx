// apps/web/src/pages/NodesPage.tsx
import { useEffect } from 'react';
import { initSqlite } from '../data/db';

export default function NodesPage() {
  useEffect(() => {
    void initSqlite();
  }, []);

  return <div style={{ padding: 16 }}>Nodes (coming soon)</div>;
}
