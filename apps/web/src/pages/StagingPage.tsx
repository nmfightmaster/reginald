// apps/web/src/pages/StagingPage.tsx
import { useEffect, useState } from 'react';
import { listStagingItems, type StagingItemRow } from '../data/staging';

export default function StagingPage() {
  const [items, setItems] = useState<StagingItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listStagingItems({ limit: 50 })
      .then((rows) => {
        if (mounted) {
          setItems(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load staging items:', err);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <h1>Staging</h1>

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No staging items yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                padding: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {item.title || '(untitled)'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {item.kind} • {new Date(item.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
