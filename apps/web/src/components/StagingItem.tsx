// apps/web/src/components/StagingItem.tsx
import { useState } from 'react';
import type { StagingItemRow } from '../data/staging';

interface NodeSummary {
  id: number;
  title: string;
}

interface StagingItemProps {
  item: StagingItemRow;
  availableNodes: NodeSummary[];
  onDiscard: (id: number) => void;
  onFile: (id: number) => void;
  onUpdateTags: (id: number, tags: string[]) => Promise<void>;
  onSummarize: (id: number) => Promise<void>;
  onUpdateLinks: (id: number, links: number[]) => Promise<void>;
  isDiscarding: boolean;
  isFiling: boolean;
  isSummarizing: boolean;
}

export default function StagingItem({
  item,
  availableNodes,
  onDiscard,
  onFile,
  onUpdateTags,
  onSummarize,
  onUpdateLinks,
  isDiscarding,
  isFiling,
  isSummarizing,
}: StagingItemProps) {
  const [tagInput, setTagInput] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<number | ''>('');

  const tags: string[] = item.tags ? JSON.parse(item.tags) : [];
  const meta = item.meta ? JSON.parse(item.meta) : {};
  const links: number[] = meta.links ?? [];

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

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNodeId) return;
    const newLinks = [...links, selectedNodeId];
    await onUpdateLinks(item.id, newLinks);
    setSelectedNodeId('');
  }

  async function removeLink(nodeId: number) {
    const newLinks = links.filter((id) => id !== nodeId);
    await onUpdateLinks(item.id, newLinks);
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
          >
            {isFiling ? 'Filing…' : 'File'}
          </button>
          <button
            onClick={() => onSummarize(item.id)}
            disabled={isSummarizing}
            style={{ padding: '6px 10px' }}
          >
            {isSummarizing ? 'Summarizing…' : 'Summarize'}
          </button>
          <button
            onClick={() => onDiscard(item.id)}
            disabled={isDiscarding}
            style={{ padding: '6px 10px' }}
          >
            {isDiscarding ? 'Discarding…' : 'Discard'}
          </button>
        </div>
      </div>

      {item.content ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</div>
      ) : null}

      {/* Summary */}
      {meta.summary ? (
        <div style={{ fontStyle: 'italic', fontSize: 13, background: 'rgba(0,0,0,0.03)', padding: 6, borderRadius: 6 }}>
          Summary: {meta.summary}
        </div>
      ) : null}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={addTag} style={{ display: 'flex', gap: 6 }}>
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

      {/* Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {links.map((nodeId) => {
          const node = availableNodes.find((n) => n.id === nodeId);
          return (
            <span
              key={nodeId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                fontSize: 12,
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.05)',
              }}
            >
              {node ? node.title : `Node ${nodeId}`}
              <button
                onClick={() => removeLink(nodeId)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      <form onSubmit={addLink} style={{ display: 'flex', gap: 6 }}>
        <select
          value={selectedNodeId}
          onChange={(e) => setSelectedNodeId(Number(e.target.value))}
          style={{ flex: 1, padding: 6 }}
        >
          <option value="">Select node…</option>
          {availableNodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.title}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selectedNodeId} style={{ padding: '6px 10px' }}>
          Link
        </button>
      </form>
    </li>
  );
}
