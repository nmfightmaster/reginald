// apps/web/src/components/NodeItem.tsx
interface NodeItemProps {
  id: number;
  title: string;
  body?: string;
  createdAt: Date;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export default function NodeItem({
  id,
  title,
  body,
  createdAt,
  onDelete,
  isDeleting,
}: NodeItemProps) {
  return (
    <li
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
            {title}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{createdAt.toLocaleString()}</div>
        </div>
        <button
          onClick={() => onDelete(id)}
          disabled={isDeleting}
          style={{ padding: '6px 10px' }}
          aria-label={`Delete ${title}`}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {body ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body}</div>
      ) : null}
    </li>
  );
}
