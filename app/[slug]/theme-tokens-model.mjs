const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;

const FONT_WHITELIST = new Set([
  'Cormorant Garamond',
  'Playfair Display',
  'Plus Jakarta Sans',
  'Inter',
  'Lora',
  'Cinzel',
  'Montserrat',
  'Alex Brush',
  'Great Vibes',
]);

const fallback = {
  primary: '#8a704c',
  secondary: '#c7b89d',
  background: '#faf9f6',
  surface: '#ffffff',
  text: '#181716',
  muted: '#6b665f',
  border: '#e4dfd5',
  heading: 'Cormorant Garamond',
  body: 'Plus Jakarta Sans',
  accent: 'Alex Brush',
};

function safeColor(value, defaultValue) {
  return typeof value === 'string' && HEX_COLOR.test(value.trim()) ? value.trim() : defaultValue;
}

function safeFont(value, defaultValue) {
  return typeof value === 'string' && FONT_WHITELIST.has(value.trim())
    ? value.trim()
    : defaultValue;
}

function clamp(value, min, max, fallbackValue) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallbackValue;
}

function hexToRgba(hex, opacity) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map(c => c + c)
      .join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function isValidImageUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject quotes, parenthesis, whitespace, backslashes, or directory traversal
  if (/[\s"'()\\<>]|\.\./.test(trimmed)) {
    return false;
  }

  // Allow only explicit HTTPS, HTTP, or safe /uploads/ path
  if (trimmed.startsWith('/uploads/')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function themeTokens(templateTheme, overrides) {
  const base = templateTheme || {};
  const ov = overrides || {};

  const colors = { ...(base.colors || {}), ...(ov.colors || {}) };
  const fonts = { ...(base.fonts || {}), ...(ov.fonts || {}) };
  const layout = { ...(base.layout || {}), ...(ov.layout || {}) };
  const background = { ...(base.background || {}), ...(ov.background || {}) };

  const primary = safeColor(colors.primary, fallback.primary);
  const secondary = safeColor(colors.secondary, fallback.secondary);
  const backgroundColor = safeColor(colors.background, fallback.background);
  const surface = safeColor(colors.surface, fallback.surface);
  const text = safeColor(colors.text, fallback.text);
  const muted = safeColor(colors.muted, fallback.muted);
  const border = safeColor(colors.border, fallback.border);

  const headingFont = safeFont(fonts.heading, fallback.heading);
  const bodyFont = safeFont(fonts.body, fallback.body);
  const accentFont = safeFont(fonts.accent, fallback.accent);

  const contentWidth = clamp(layout.content_width, 320, 1600, 720);
  const sectionSpacing = clamp(layout.section_spacing, 0, 300, 80);
  const borderRadius = clamp(layout.border_radius, 0, 32, 0);

  let backgroundImage = 'none';
  if (background.type === 'image' && isValidImageUrl(background.image_url)) {
    const sanitizedUrl = background.image_url.trim();
    const opacity =
      typeof background.overlay_opacity === 'number' && Number.isFinite(background.overlay_opacity)
        ? Math.min(1, Math.max(0, background.overlay_opacity))
        : 0;

    if (opacity > 0) {
      const overlayColorHex = safeColor(background.overlay_color, '#000000');
      const overlayRgba = hexToRgba(overlayColorHex, opacity);
      backgroundImage = `linear-gradient(${overlayRgba}, ${overlayRgba}), url("${sanitizedUrl}")`;
    } else {
      backgroundImage = `url("${sanitizedUrl}")`;
    }
  }

  return {
    '--theme-primary': primary,
    '--theme-secondary': secondary,
    '--theme-background': backgroundColor,
    '--theme-surface': surface,
    '--theme-text': text,
    '--theme-muted': muted,
    '--theme-border': border,
    '--theme-heading-font': headingFont,
    '--theme-body-font': bodyFont,
    '--theme-accent-font': accentFont,
    '--theme-content-width': `${contentWidth}px`,
    '--theme-section-spacing': `${sectionSpacing}px`,
    '--theme-border-radius': `${borderRadius}px`,
    '--theme-background-image': backgroundImage,

    // Mapped legacy CSS variables
    '--accent-classic': primary,
    '--accent-classic-hover': secondary,
    '--bg-primary': backgroundColor,
    '--bg-card': surface,
    '--text-main': text,
    '--text-muted': muted,
    '--border-light': border,
    '--font-serif': `"${headingFont}"`,
    '--font-sans': `"${bodyFont}"`,
    '--border-radius': `${borderRadius}px`,
  };
}
