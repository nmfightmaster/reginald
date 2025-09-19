// apps/web/src/data/workerClient.ts
import type { IpcRequest, IpcResponse } from './ipc';

let workerSingleton: Worker | null = null;
const pending = new Map<string, (res: IpcResponse) => void>();

function ensureWorker(): Worker {
  if (workerSingleton) return workerSingleton;
  workerSingleton = new Worker(new URL('../workers/sqlite.worker.ts', import.meta.url), {
    type: 'module',
  });
  workerSingleton.onmessage = (e: MessageEvent<IpcResponse>) => {
    const res = e.data;
    const key = res?.id;
    if (key && pending.has(key)) {
      const resolve = pending.get(key)!;
      pending.delete(key);
      resolve(res);
    }
    if (res?.type === 'error') {
      // eslint-disable-next-line no-console
      console.error('[sqlite-worker] error:', res.error);
    }
  };
  return workerSingleton;
}

export function sendToWorker<T extends IpcRequest>(msg: T): Promise<IpcResponse> {
  const w = ensureWorker();
  return new Promise((resolve) => {
    pending.set(msg.id, resolve);
    w.postMessage(msg);
  });
}
