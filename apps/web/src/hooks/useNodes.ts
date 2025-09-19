// apps/web/src/hooks/useNodes.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { addNode, deleteNode, listNodesNewestFirst, type Node } from '../data/nodes';

/**
 * Minimal data hook for the Nodes feature.
 * - Encapsulates loading and mutations
 * - Shields components from future persistence/worker changes
 */
export function useNodes() {
  const ran = useRef(false); // dev-only: guard StrictMode double-run

  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listNodesNewestFirst();
      setNodes(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load nodes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (title: string, body?: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await addNode(title, body);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to add node');
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      setDeletingId(id);
      setError(null);
      try {
        await deleteNode(id);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to delete node');
      } finally {
        setDeletingId(null);
      }
    },
    [refresh]
  );

  return {
    nodes,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    refresh,
    add,
    remove,
  };
}
