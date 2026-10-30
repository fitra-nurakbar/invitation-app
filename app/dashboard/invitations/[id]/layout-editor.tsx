'use client';

import { useState } from 'react';
import type { BlockType, InvitationLayout } from '@/types';

function validateLayout(layout: InvitationLayout): string | null {
  if (
    !layout ||
    layout.version < 1 ||
    !Array.isArray(layout.sections) ||
    layout.sections.length === 0
  )
    return 'Layout harus memiliki minimal satu section.';
  const ids = new Set<string>();
  for (const section of layout.sections) {
    if (!section.id || ids.has(section.id)) return 'ID section tidak boleh kosong atau duplikat.';
    if (!Object.prototype.hasOwnProperty.call(labels, section.type))
      return `Block tidak didukung: ${section.type}`;
    ids.add(section.id);
  }
  return null;
}
import { GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import styles from '../form.module.css';

const labels: Record<BlockType, string> = {
  cover: 'Sampul',
  quote: 'Kutipan',
  couple: 'Pasangan',
  love_story: 'Kisah Cinta',
  event: 'Acara',
  gallery: 'Galeri',
  streaming: 'Streaming',
  gift: 'Hadiah',
  rsvp: 'RSVP',
  footer: 'Footer',
};

export function LayoutEditor({
  initial,
  onSave,
}: {
  initial: InvitationLayout;
  onSave: (layout: InvitationLayout) => Promise<void>;
}) {
  const [layout, setLayout] = useState(initial);
  const [dragged, setDragged] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const move = (from: string, to: string) => {
    if (from === to) return;
    const next = [...layout.sections];
    const a = next.findIndex(x => x.id === from);
    const b = next.findIndex(x => x.id === to);
    if (a < 0 || b < 0) return;
    const [item] = next.splice(a, 1);
    next.splice(b, 0, item);
    setLayout({ ...layout, sections: next });
  };
  const toggle = (id: string) =>
    setLayout({
      ...layout,
      sections: layout.sections.map(s => (s.id === id ? { ...s, visible: !s.visible } : s)),
    });
  const save = async () => {
    if (validateLayout(layout)) return;
    setSaving(true);
    try {
      await onSave(layout);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className={styles.layoutEditor}>
      <div className={styles.layoutEditorHeader}>
        <div>
          <h3>Susun tampilan undangan</h3>
          <p>Tarik block untuk mengubah urutan dan atur visibilitas section.</p>
        </div>
        <div className={styles.layoutEditorActions}>
          <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? 'Menyimpan...' : 'Simpan layout'}
          </button>
        </div>
      </div>
      <div className={styles.layoutBlockList}>
        {layout.sections.map(section => (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragged(section.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragged) move(dragged, section.id);
              setDragged(null);
            }}
            className={`${styles.layoutBlock} ${!section.visible ? styles.layoutBlockHidden : ''}`}
          >
            <GripVertical size={17} />
            <span>{labels[section.type] || section.type}</span>
            <small>{section.type}</small>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-label={section.visible ? 'Sembunyikan block' : 'Tampilkan block'}
            >
              {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
