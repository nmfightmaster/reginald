// apps/web/src/data/nodes.ts
import { ensureSchema } from './db';
import { getDbAdapter } from './dbAdapter';

export type Node = {
  id: number;
  title: string;
  body?: string | null;
  createdAt: Date;
};

export async function addNode(title: string, body?: string) {
  if (!title?.trim()) throw new Error('title is required');

  await ensureSchema();
  const db = await getDbAdapter();

  const createdAt = Date.now();
  db.exec({
    sql: 'INSERT INTO nodes (title, body, createdAt) VALUES (?1, ?2, ?3)',
    bind: [title.trim(), body ?? null, createdAt],
  });
}

export async function listNodesNewestFirst(): Promise<Node[]> {
  await ensureSchema();
  const db = await getDbAdapter();

  const rows: Array<{ id: number; title: string; body?: string | null; createdAt: number }> = [];
  db.exec({
    sql: 'SELECT id, title, body, createdAt FROM nodes ORDER BY createdAt DESC',
    rowMode: 'object',
    callback: (row: any) => {
      rows.push(row);
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body ?? null,
    createdAt: new Date(r.createdAt),
  }));
}

export async function deleteNode(id: number): Promise<void> {
  await ensureSchema();
  const db = await getDbAdapter();
  db.exec({
    sql: 'DELETE FROM nodes WHERE id = ?1',
    bind: [id],
  });
}
