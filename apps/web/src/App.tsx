// apps/web/src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';

import NodesPage from './pages/NodesPage';
import StagingPage from './pages/StagingPage';
import { ensureSchema } from './data/db';

type Page = 'nodes' | 'staging';

function App() {
  const [page, setPage] = useState<Page>('nodes');

  useEffect(() => {
    // Ensure DB schema (nodes + staging_items) is created on startup
    ensureSchema().catch((err) => {
      console.error('Failed to ensure schema:', err);
    });
  }, []);

  return (
    <div>
      <header style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #ddd' }}>
        <button onClick={() => setPage('nodes')} disabled={page === 'nodes'}>
          Nodes
        </button>
        <button onClick={() => setPage('staging')} disabled={page === 'staging'}>
          Staging
        </button>
      </header>

      <main>
        {page === 'nodes' ? <NodesPage /> : <StagingPage />}
      </main>
    </div>
  );
}

export default App;
