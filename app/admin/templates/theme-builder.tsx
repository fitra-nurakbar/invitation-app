'use client';

import { useMemo, useState } from 'react';
import type { BlockConfig, BlockType, ThemeConfig } from '@/types';
import styles from '../admin.module.css';

const BLOCK_LABELS: Record<BlockType, string> = {
  cover: 'Sampul',
  couple: 'Pasangan',
  quote: 'Kutipan',
  event: 'Acara',
  love_story: 'Kisah Cinta',
  gallery: 'Galeri',
  gift: 'Hadiah',
  streaming: 'Streaming',
  rsvp: 'RSVP',
  footer: 'Footer',
};

export type ThemeBuilderValue = { theme_config: ThemeConfig; block_config: BlockConfig };

export function ThemeBuilder({
  value,
  onChange,
}: {
  value: ThemeBuilderValue;
  onChange: (value: ThemeBuilderValue) => void;
}) {
  const [tab, setTab] = useState<'theme' | 'blocks'>('theme');
  const theme = value.theme_config;
  const blocks = value.block_config;
  const updateTheme = (patch: Partial<ThemeConfig['colors']>) =>
    onChange({ ...value, theme_config: { ...theme, colors: { ...theme.colors, ...patch } } });
  const order = useMemo(() => blocks.default_order || [], [blocks.default_order]);
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...value, block_config: { ...blocks, default_order: next } });
  };
  return (
    <div className={styles.themeBuilder}>
      <div className={styles.builderTabs}>
        <button
          type="button"
          className={tab === 'theme' ? styles.builderTabActive : styles.builderTab}
          onClick={() => setTab('theme')}
        >
          Token Tema
        </button>
        <button
          type="button"
          className={tab === 'blocks' ? styles.builderTabActive : styles.builderTab}
          onClick={() => setTab('blocks')}
        >
          Urutan Block
        </button>
      </div>
      {tab === 'theme' ? (
        <div className={styles.builderGrid}>
          {(Object.keys(theme.colors) as Array<keyof ThemeConfig['colors']>).map(key => (
            <label key={key} className={styles.builderField}>
              <span>{key.replace('_', ' ')}</span>
              <input
                type="color"
                value={theme.colors[key] || '#ffffff'}
                onChange={e => updateTheme({ [key]: e.target.value })}
              />
            </label>
          ))}
          <label className={styles.builderField}>
            <span>Font heading</span>
            <select
              value={theme.fonts.heading}
              onChange={e =>
                onChange({
                  ...value,
                  theme_config: { ...theme, fonts: { ...theme.fonts, heading: e.target.value } },
                })
              }
            >
              <option>Cormorant Garamond</option>
              <option>Playfair Display</option>
              <option>Lora</option>
              <option>Cinzel</option>
            </select>
          </label>
          <label className={styles.builderField}>
            <span>Font body</span>
            <select
              value={theme.fonts.body}
              onChange={e =>
                onChange({
                  ...value,
                  theme_config: { ...theme, fonts: { ...theme.fonts, body: e.target.value } },
                })
              }
            >
              <option>Plus Jakarta Sans</option>
              <option>Inter</option>
              <option>Montserrat</option>
            </select>
          </label>
          <label className={styles.builderField}>
            <span>Lebar konten (px)</span>
            <input
              type="number"
              min={320}
              max={1600}
              value={theme.layout.content_width}
              onChange={e =>
                onChange({
                  ...value,
                  theme_config: {
                    ...theme,
                    layout: { ...theme.layout, content_width: Number(e.target.value) },
                  },
                })
              }
            />
          </label>
          <label className={styles.builderField}>
            <span>Jarak section (px)</span>
            <input
              type="number"
              min={0}
              max={300}
              value={theme.layout.section_spacing}
              onChange={e =>
                onChange({
                  ...value,
                  theme_config: {
                    ...theme,
                    layout: { ...theme.layout, section_spacing: Number(e.target.value) },
                  },
                })
              }
            />
          </label>
        </div>
      ) : (
        <div className={styles.blockList}>
          {order.map((block, index) => (
            <div className={styles.blockRow} key={block}>
              <span>
                {index + 1}. {BLOCK_LABELS[block] || block}
              </span>
              <span>
                <button
                  type="button"
                  className={styles.builderMove}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  Naik
                </button>
                <button
                  type="button"
                  className={styles.builderMove}
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                >
                  Turun
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
