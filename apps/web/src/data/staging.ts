// apps/web/src/data/staging.ts
import { getDbAdapter, getWriteAdapter } from './dbAdapter';
import { addNode } from './nodes';

export interface StagingItemRow {
  id: number;
  kind: 'text' | 'file' | 'url' | 'clipboard';
  title: string | null;
  content: string | null;
  filePath: string | null;
  source: 'manual' | 'dragdrop' | 'clipboard' | 'import';
  tags: string | null; // JSON string
  createdAt: number;
  meta: string | null; // JSON string
}

export async function insertStagingItem(
  item: Omit<StagingItemRow, 'id' | 'createdAt'>
): Promise<void> {
  const db = await getWriteAdapter();
  const createdAt = Date.now();

  await db.exec({
    sql: `
      INSERT INTO staging_items
        (kind, title, content, filePath, source, tags, createdAt, meta)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
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
}

export async function listStagingItems(
  opts: { limit?: number; offset?: number } = {}
): Promise<StagingItemRow[]> {
  const db = await getDbAdapter();
  const { limit = 50, offset = 0 } = opts;

  const rows: StagingItemRow[] = [];
  await db.exec({
    sql: `
      SELECT *
      FROM staging_items
      ORDER BY createdAt DESC
      LIMIT ?1 OFFSET ?2
    `,
    bind: [limit, offset],
    rowMode: 'object',
    callback: (row) => rows.push(row as StagingItemRow),
  });

  return rows;
}

export async function discardStagingItem(id: number): Promise<void> {
  const db = await getWriteAdapter();
  await db.exec({
    sql: `DELETE FROM staging_items WHERE id = ?1`,
    bind: [id],
  });
}

export async function updateStagingTags(id: number, tags: string[]): Promise<void> {
  const db = await getWriteAdapter();
  await db.exec({
    sql: `UPDATE staging_items SET tags = ?1 WHERE id = ?2`,
    bind: [JSON.stringify(tags), id],
  });
}

export async function updateStagingSummary(id: number, summary: string): Promise<void> {
  const db = await getWriteAdapter();

  // Load current meta JSON
  let meta: any = {};
  const rows: { meta: string | null }[] = [];
  await db.exec({
    sql: `SELECT meta FROM staging_items WHERE id = ?1`,
    bind: [id],
    rowMode: 'object',
    callback: (row) => rows.push(row as { meta: string | null }),
  });

  if (rows.length > 0 && rows[0].meta) {
    try {
      meta = JSON.parse(rows[0].meta);
    } catch {
      meta = {};
    }
  }

  meta.summary = summary;

  await db.exec({
    sql: `UPDATE staging_items SET meta = ?1 WHERE id = ?2`,
    bind: [JSON.stringify(meta), id],
  });
}

export async function updateStagingLinks(id: number, links: number[]): Promise<void> {
  const db = await getWriteAdapter();

  // Load current meta JSON
  let meta: any = {};
  const rows: { meta: string | null }[] = [];
  await db.exec({
    sql: `SELECT meta FROM staging_items WHERE id = ?1`,
    bind: [id],
    rowMode: 'object',
    callback: (row) => rows.push(row as { meta: string | null }),
  });

  if (rows.length > 0 && rows[0].meta) {
    try {
      meta = JSON.parse(rows[0].meta);
    } catch {
      meta = {};
    }
  }

  meta.links = links;

  await db.exec({
    sql: `UPDATE staging_items SET meta = ?1 WHERE id = ?2`,
    bind: [JSON.stringify(meta), id],
  });
}

export async function fileStagingItem(id: number): Promise<void> {
  const db = await getDbAdapter();

  const rows: StagingItemRow[] = [];
  await db.exec({
    sql: `SELECT * FROM staging_items WHERE id = ?1`,
    bind: [id],
    rowMode: 'object',
    callback: (row) => rows.push(row as StagingItemRow),
  });

  if (rows.length === 0) return;
  const item = rows[0];

  // Insert into nodes using shared helper
  await addNode(item.title ?? '(untitled)', item.content ?? undefined);

  // Remove from staging
  await discardStagingItem(id);
}
