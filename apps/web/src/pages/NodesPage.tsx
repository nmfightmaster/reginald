// apps/web/src/pages/NodesPage.tsx
import { useEffect, useRef } from 'react';
import { addNode, listNodesNewestFirst } from '../data/nodes';

export default function NodesPage() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      await addNode('First node from smoke test', 'optional body');
      const nodes = await listNodesNewestFirst();
      console.info('nodes:', nodes);
    })();
  }, []);

  return <div style={{ padding: 16 }}>Nodes (coming soon)</div>;
}
