// apps/web/src/pages/NodesPage.tsx
import { useEffect, useRef, useState } from 'react';
import { addNode, listNodesNewestFirst, type Node } from '../data/nodes';

export default function NodesPage() {
  // Guard to avoid double-running effects in React StrictMode (dev only)
  const ran = useRef(false);

  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    const data = await listNodesNewestFirst();
    setNodes(data);
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    setIsSubmitting(true);
    try {
      await addNode(t);
      setTitle('');
      await refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <h1 style={{ margin: '0 0 12px' }}>Nodes</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={isSubmitting || !title.trim()} style={{ padding: '8px 12px' }}>
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      {nodes.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No nodes yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {nodes.map((n) => (
            <li
              key={n.id}
              style={{
                padding: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {n.createdAt.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
