// apps/web/src/pages/NodesPage.tsx
import { useNodes } from '../hooks/useNodes';
import CaptureForm from '../components/CaptureForm';
import PersistencePill from '../components/PersistencePill';
import NodeItem from '../components/NodeItem';

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
          {nodes.map((n) => (
            <NodeItem
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body ?? undefined}
              createdAt={n.createdAt}
              onDelete={remove}
              isDeleting={deletingId === n.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
