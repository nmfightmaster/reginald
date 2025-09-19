// apps/web/src/components/StagingItem.tsx
import type { StagingItemRow } from '../data/staging';

interface StagingItemProps {
  item: StagingItemRow;
  onDiscard: (id: number) => void;
  isDiscarding: boolean;
}

export default function StagingItem({ item, onDiscard, isDiscarding }: StagingItemProps) {
  return (
    <li
      style={{
        padding: 12,
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || '(untitled)'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {item.kind} • {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => onDiscard(item.id)}
          disabled={isDiscarding}
          style={{ padding: '6px 10px' }}
          aria-label={`Discard ${item.title ?? 'staging item'}`}
        >
          {isDiscarding ? 'Discarding…' : 'Discard'}
        </button>
      </div>
      {item.content ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</div>
      ) : null}
    </li>
  );
}
