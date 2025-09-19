// apps/web/src/pages/NodesPage.tsx
import { useState } from 'react';
import { useNodes } from '../hooks/useNodes';
import { usePersistenceMode } from '../hooks/usePersistenceMode';

export default function NodesPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { nodes, isLoading, isSubmitting, deletingId, error, add, remove } = useNodes();
  const mode = usePersistenceMode();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t) return;
    await add(t, b || undefined);
    setTitle('');
    setBody('');
  }

  const pillStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'rgba(0,0,0,0.03)',
  };

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Nodes</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={pillStyle}>
            Persistence: {mode ?? '…'}
          </span>
        </div>
      </div>

      {mode === 'memory' ? (
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          Data is in memory for now and will reset on reload. We’ll switch to OPFS persistence by moving SQLite into a Web Worker soon.
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          style={{ padding: 8 }}
          aria-label="Node title"
        />
        <textarea
          placeholder="Body (optional)…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          style={{ padding: 8, resize: 'vertical' }}
          aria-label="Node body"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={isSubmitting || !title.trim()} style={{ padding: '8px 12px' }}>
            {isSubmitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>

      {error ? (
        <div role="alert" style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
      ) : null}

      {isLoading ? (
        <div style={{ opacity: 0.7 }}>Loading…</div>
      ) : nodes.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No nodes yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {nodes.map((n) => {
            const isDeleting = deletingId === n.id;
            return (
              <li
                key={n.id}
                style={{
                  padding: 12,
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{n.createdAt.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => remove(n.id)}
                    disabled={isDeleting}
                    style={{ padding: '6px 10px' }}
                    aria-label={`Delete ${n.title}`}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                {n.body ? (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.body}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
