// apps/web/src/components/CaptureForm.tsx
import { useState } from 'react';

interface CaptureFormProps {
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  disabled?: boolean;
  onSubmit: (title: string, body?: string) => Promise<void> | void;
}

export default function CaptureForm({
  titlePlaceholder = 'Title…',
  bodyPlaceholder = 'Body (optional)…',
  disabled = false,
  onSubmit,
}: CaptureFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t) return;
    setSubmitting(true);
    try {
      await onSubmit(t, b || undefined);
      setTitle('');
      setBody('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
      <input
        type="text"
        placeholder={titlePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled || submitting}
        style={{ padding: 8 }}
        aria-label="Title"
      />
      <textarea
        placeholder={bodyPlaceholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled || submitting}
        rows={3}
        style={{ padding: 8, resize: 'vertical' }}
        aria-label="Body"
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          disabled={disabled || submitting || !title.trim()}
          style={{ padding: '8px 12px' }}
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  );
}
