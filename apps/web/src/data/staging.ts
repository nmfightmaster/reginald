// apps/web/src/data/staging.ts
import { getDb } from './db';

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

/**
 * Insert a new staging item.
 * - Fills in createdAt automatically.
 * - Returns the inserted row ID.
 */
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

  // SQLite oo1 API doesn’t return lastInsertRowId directly,
  // but we can query it in the same connection:
  const rows = db.selectObjects?.(
    'SELECT last_insert_rowid() as id;'
  ) as { id: number }[];
  return rows[0].id;
}

/**
 * List staging items, newest first.
 */
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
