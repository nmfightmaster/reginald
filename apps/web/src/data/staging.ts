// apps/web/src/data/staging.ts
import { getDb } from './db';
import { addNode } from './nodes';

/**
 * Exact shape of a row in the staging_items table.
 * Mirrors the SQLite schema strictly.
 */
export interface StagingItemRow {
  id: number;
  kind: 'text' | 'file' | 'url' | 'clipboard';
  title: string | null;
  content: string | null;
  filePath: string | null;
  source: 'manual' | 'dragdrop' | 'clipboard' | 'import';
  tags: string | null; // JSON string (e.g. '["tag1","tag2"]')
  createdAt: number;   // ms since epoch
  meta: string | null; // JSON string (e.g. '{"size":123,"mime":"text/plain"}')
}

export async function insertStagingItem(
  item: Omit<StagingItemRow, 'id' | 'createdAt'>
): Promise<number> {
  const db = await getDb();
  const createdAt = Date.now();

  db.exec?.({
    sql: `
      INSERT INTO staging_items
        (kind, title, content, filePath, source, tags, createdAt, meta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    bind: [
      item.kind,
      item.title ?? null,
      item.content ?? null,
      item.filePath ?? null,
      item.source,
      item.tags ?? null,
      createdAt,
      item.meta ?? null,
    ],
  });

  const rows = db.selectObjects?.(
    'SELECT last_insert_rowid() as id;'
  ) as { id: number }[];
  return rows[0].id;
}

export async function listStagingItems(
  opts: { limit?: number; offset?: number } = {}
): Promise<StagingItemRow[]> {
  const db = await getDb();
  const { limit = 50, offset = 0 } = opts;

  const rows = db.selectObjects?.(
    `
      SELECT *
      FROM staging_items
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?;
    `,
    [limit, offset]
  ) as StagingItemRow[];

  return rows ?? [];
}

export async function discardStagingItem(id: number): Promise<void> {
  const db = await getDb();
  db.exec?.({
    sql: `DELETE FROM staging_items WHERE id = ?;`,
    bind: [id],
  });
}

export async function fileStagingItem(id: number): Promise<void> {
  const db = await getDb();

  const rows = db.selectObjects?.(
    `SELECT * FROM staging_items WHERE id = ?;`,
    [id]
  ) as StagingItemRow[];

  if (!rows || rows.length === 0) return;
  const item = rows[0];

  // Use the same API NodesPage uses
  await addNode(item.title ?? '(untitled)', item.content ?? undefined);

  // Remove from staging
  await discardStagingItem(id);
}

export async function updateStagingTags(id: number, tags: string[]): Promise<void> {
  const db = await getDb();
  db.exec?.({
    sql: `UPDATE staging_items SET tags = ? WHERE id = ?;`,
    bind: [JSON.stringify(tags), id],
  });
}

export async function updateStagingSummary(id: number, summary: string): Promise<void> {
  const db = await getDb();

  // Load current meta JSON (if any)
  const rows = db.selectObjects?.(
    `SELECT meta FROM staging_items WHERE id = ?;`,
    [id]
  ) as { meta: string | null }[];

  let meta: any = {};
  if (rows && rows.length > 0 && rows[0].meta) {
    try {
      meta = JSON.parse(rows[0].meta);
    } catch {
      meta = {};
    }
  }

  // Update summary
  meta.summary = summary;

  db.exec?.({
    sql: `UPDATE staging_items SET meta = ? WHERE id = ?;`,
    bind: [JSON.stringify(meta), id],
  });
}
