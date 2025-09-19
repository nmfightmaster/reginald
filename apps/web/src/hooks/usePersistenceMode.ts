// apps/web/src/hooks/usePersistenceMode.ts
import { useEffect, useState } from 'react';
import { sendToWorker } from '../data/workerClient';
import { makeRequestId } from '../data/ipc';

export function usePersistenceMode() {
  const [mode, setMode] = useState<'opfs' | 'memory' | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    async function checkOnce(): Promise<boolean> {
      const res = await sendToWorker({ id: makeRequestId(), type: 'status' });
      if (cancelled) return true;
      const ready = res.type === 'status' && res.ready === true;
      setMode(ready ? 'opfs' : 'memory');
      return ready;
    }

    (async () => {
      try {
        // Kick the worker to initialize OPFS early
        await sendToWorker({ id: makeRequestId(), type: 'init' });

        // First status read
        const ready = await checkOnce();
        if (ready) return;

        // Light polling: up to ~3 seconds or until ready
        let attempts = 0;
        const maxAttempts = 6;
        const interval = 500;
        timer = window.setInterval(async () => {
          attempts += 1;
          const ok = await checkOnce();
          if (ok || attempts >= maxAttempts) {
            if (timer) {
              window.clearInterval(timer);
              timer = null;
            }
          }
        }, interval) as unknown as number;
      } catch {
        if (!cancelled) setMode('memory');
      }
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return mode;
}
