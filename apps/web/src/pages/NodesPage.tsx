// apps/web/src/pages/NodesPage.tsx
import { useState } from 'react';
import { useNodes } from '../hooks/useNodes';

export default function NodesPage() {
  const [title, setTitle] = useState('');
  const { nodes, isLoading, isSubmitting, deletingId, error, add, remove } = useNodes();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await add(t);
    setTitle('');
  }

  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <h1 style={{ margin: '0 0 12px' }}>Nodes</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          style={{ flex: 1, padding: 8 }}
          aria-label="Node title"
        />
        <button type="submit" disabled={isSubmitting || !title.trim()} style={{ padding: '8px 12px' }}>
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  justifyContent: 'space-between',
                }}
              >
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
