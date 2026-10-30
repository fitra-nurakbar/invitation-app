import type { ThemeConfig } from '@/types';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  version: 1,
  colors: {
    primary: '#8a704c',
    secondary: '#c7b89d',
    background: '#faf9f6',
    surface: '#ffffff',
    text: '#181716',
    muted: '#6b665f',
    border: '#e4dfd5',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Plus Jakarta Sans',
    accent: 'Alex Brush',
  },
  layout: {
    content_width: 720,
    section_spacing: 80,
    border_radius: 0,
  },
  background: {
    type: 'color',
    color: '#faf9f6',
    overlay_opacity: 0,
  },
};

export function resolveThemeConfig(theme?: Partial<ThemeConfig> | null): ThemeConfig {
  return {
    ...DEFAULT_THEME_CONFIG,
    ...theme,
    colors: { ...DEFAULT_THEME_CONFIG.colors, ...(theme?.colors || {}) },
    fonts: { ...DEFAULT_THEME_CONFIG.fonts, ...(theme?.fonts || {}) },
    layout: { ...DEFAULT_THEME_CONFIG.layout, ...(theme?.layout || {}) },
    background: { ...DEFAULT_THEME_CONFIG.background, ...(theme?.background || {}) },
  };
}
