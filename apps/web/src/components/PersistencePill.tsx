// apps/web/src/components/PersistencePill.tsx
import { usePersistenceMode } from '../hooks/usePersistenceMode';

export default function PersistencePill() {
  const mode = usePersistenceMode();

  const pillStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'rgba(0,0,0,0.03)',
  };

  return (
    <span style={pillStyle}>
      Persistence: {mode ?? '…'}
    </span>
  );
}
