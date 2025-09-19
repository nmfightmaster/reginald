// apps/web/src/pages/NodesPage.tsx
import { useNodes } from '../hooks/useNodes';
import CaptureForm from '../components/CaptureForm';
import PersistencePill from '../components/PersistencePill';

export default function NodesPage() {
  const { nodes, isLoading, isSubmitting, deletingId, error, add, remove } = useNodes();

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Nodes</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PersistencePill />
        </div>
      </div>

      <CaptureForm
        onSubmit={async (title, body) => {
          await add(title, body);
        }}
        disabled={isSubmitting}
      />

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
