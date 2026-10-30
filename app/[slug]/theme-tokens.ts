import type { CSSProperties } from 'react';
import type { ThemeConfig } from '@/types';
import { themeTokens as jsThemeTokens } from './theme-tokens-model.mjs';

export function themeTokens(
  theme?: ThemeConfig | null,
  overrides?: Partial<ThemeConfig> | null
): CSSProperties {
  return jsThemeTokens(theme, overrides) as CSSProperties;
}
