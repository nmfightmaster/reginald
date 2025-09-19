// apps/web/src/hooks/usePersistenceMode.ts
import { useEffect, useState } from 'react';
import { getPersistenceMode } from '../data/db';

export function usePersistenceMode() {
  const [mode, setMode] = useState<'opfs' | 'memory' | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = await getPersistenceMode();
      if (!cancelled) setMode(m);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return mode;
}
