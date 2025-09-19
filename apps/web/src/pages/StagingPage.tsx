// apps/web/src/pages/StagingPage.tsx
import { useEffect, useState } from 'react';
import {
  insertStagingItem,
  listStagingItems,
  discardStagingItem,
  fileStagingItem,
  updateStagingTags,
  updateStagingSummary,
  type StagingItemRow,
} from '../data/staging';
import CaptureForm from '../components/CaptureForm';
import PersistencePill from '../components/PersistencePill';
import StagingItem from '../components/StagingItem';

export default function StagingPage() {
  const [items, setItems] = useState<StagingItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [discardingId, setDiscardingId] = useState<number | null>(null);
  const [filingId, setFilingId] = useState<number | null>(null);
  const [summarizingId, setSummarizingId] = useState<number | null>(null);

  async function refresh() {
    const rows = await listStagingItems({ limit: 50 });
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((err) => {
      console.error('Failed to load staging items:', err);
      setLoading(false);
    });
  }, []);

  async function discard(id: number) {
    setDiscardingId(id);
    await discardStagingItem(id);
    await refresh();
    setDiscardingId(null);
  }

  async function fileItem(id: number) {
    setFilingId(id);
    await fileStagingItem(id);
    await refresh();
    setFilingId(null);
  }

  async function updateTags(id: number, tags: string[]) {
    await updateStagingTags(id, tags);
    await refresh();
  }

  async function summarize(id: number) {
    setSummarizingId(id);
    // Placeholder summary for now
    await updateStagingSummary(id, 'This is a placeholder summary.');
    await refresh();
    setSummarizingId(null);
  }

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Staging</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PersistencePill />
        </div>
      </div>

      <CaptureForm
        titlePlaceholder="Title…"
        bodyPlaceholder="Body (optional)…"
        onSubmit={async (title, body) => {
          await insertStagingItem({
            kind: 'text',
            title,
            content: body ?? null,
            filePath: null,
            source: 'manual',
            tags: null,
            meta: null,
          });
          await refresh();
        }}
      />

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No staging items yet.</div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 8,
          }}
        >
          {items.map((item) => (
            <StagingItem
              key={item.id}
              item={item}
              onDiscard={discard}
              onFile={fileItem}
              onUpdateTags={updateTags}
              onSummarize={summarize}
              isDiscarding={discardingId === item.id}
              isFiling={filingId === item.id}
              isSummarizing={summarizingId === item.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
