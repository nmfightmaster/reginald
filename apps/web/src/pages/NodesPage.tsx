// apps/web/src/pages/NodesPage.tsx
import { useState } from 'react';
import { useNodes } from '../hooks/useNodes';

export default function NodesPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { nodes, isLoading, isSubmitting, deletingId, error, add, remove } = useNodes();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t) return;
    await add(t, b || undefined);
    setTitle('');
    setBody('');
  }

  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <h1 style={{ margin: '0 0 12px' }}>Nodes</h1>

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
