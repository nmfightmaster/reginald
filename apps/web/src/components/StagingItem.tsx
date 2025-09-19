// apps/web/src/components/StagingItem.tsx
import { useState } from 'react';
import type { StagingItemRow } from '../data/staging';

interface StagingItemProps {
  item: StagingItemRow;
  onDiscard: (id: number) => void;
  onFile: (id: number) => void;
  onUpdateTags: (id: number, tags: string[]) => Promise<void>;
  isDiscarding: boolean;
  isFiling: boolean;
}

export default function StagingItem({
  item,
  onDiscard,
  onFile,
  onUpdateTags,
  isDiscarding,
  isFiling,
}: StagingItemProps) {
  const [tagInput, setTagInput] = useState('');
  const tags: string[] = item.tags ? JSON.parse(item.tags) : [];

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    const t = tagInput.trim();
    if (!t) return;
    const newTags = [...tags, t];
    await onUpdateTags(item.id, newTags);
    setTagInput('');
  }

  async function removeTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag);
    await onUpdateTags(item.id, newTags);
  }

  return (
    <li
      style={{
        padding: 12,
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || '(untitled)'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {item.kind} • {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onFile(item.id)}
            disabled={isFiling}
            style={{ padding: '6px 10px' }}
            aria-label={`File ${item.title ?? 'staging item'}`}
          >
            {isFiling ? 'Filing…' : 'File'}
          </button>
          <button
            onClick={() => onDiscard(item.id)}
            disabled={isDiscarding}
            style={{ padding: '6px 10px' }}
            aria-label={`Discard ${item.title ?? 'staging item'}`}
          >
            {isDiscarding ? 'Discarding…' : 'Discard'}
          </button>
        </div>
      </div>

      {item.content ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</div>
      ) : null}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              fontSize: 12,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.03)',
            }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={addTag} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <input
          type="text"
          placeholder="Add tag…"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          style={{ flex: 1, padding: 6, fontSize: 14 }}
        />
        <button type="submit" disabled={!tagInput.trim()} style={{ padding: '6px 10px' }}>
          Add
        </button>
      </form>
    </li>
  );
}
