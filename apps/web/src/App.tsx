// apps/web/src/App.tsx
import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import NodesPage from './pages/NodesPage';
import { ensureSchema } from './data/db';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Ensure DB schema (nodes + staging_items) is created on startup
    ensureSchema().catch((err) => {
      console.error('Failed to ensure schema:', err);
    });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

      {/* Mount NodesPage so its useEffect runs initSqlite() */}
      <NodesPage />
    </>
  );
}

export default App;
