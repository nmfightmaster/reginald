// apps/web/src/pages/StagingPage.tsx
import { useEffect, useState } from 'react';
import { insertStagingItem, listStagingItems, type StagingItemRow } from '../data/staging';
import CaptureForm from '../components/CaptureForm';
import PersistencePill from '../components/PersistencePill';

export default function StagingPage() {
  const [items, setItems] = useState<StagingItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const rows = await listStagingItems({ limit: 50 });
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((err) => {
      console.error('Failed to load staging items:', err);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Staging</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PersistencePill />
        </div>
      </div>

      <CaptureForm
        titlePlaceholder="Title…"
        bodyPlaceholder="Body (optional)…"
        onSubmit={async (title, body) => {
          await insertStagingItem({
            kind: 'text',
            title,
            content: body ?? null,
            filePath: null,
            source: 'manual',
            tags: null,
            meta: null,
          });
          await refresh();
        }}
      />

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
              <div style={{ fontWeight: 600 }}>{item.title || '(untitled)'}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {item.kind} • {new Date(item.createdAt).toLocaleString()}
              </div>
              {item.content ? (
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
