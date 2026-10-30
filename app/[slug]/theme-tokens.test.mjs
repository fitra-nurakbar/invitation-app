import assert from 'node:assert/strict';
import test from 'node:test';
import { themeTokens } from './theme-tokens-model.mjs';

test('returns default tokens when theme config is empty or missing', () => {
  const tokens = themeTokens(undefined);

  assert.equal(tokens['--theme-primary'], '#8a704c');
  assert.equal(tokens['--theme-secondary'], '#c7b89d');
  assert.equal(tokens['--theme-background'], '#faf9f6');
  assert.equal(tokens['--theme-surface'], '#ffffff');
  assert.equal(tokens['--theme-text'], '#181716');
  assert.equal(tokens['--theme-muted'], '#6b665f');
  assert.equal(tokens['--theme-border'], '#e4dfd5');

  // Mapped legacy variables for backward compatibility
  assert.equal(tokens['--accent-classic'], '#8a704c');
  assert.equal(tokens['--bg-primary'], '#faf9f6');
  assert.equal(tokens['--bg-card'], '#ffffff');
  assert.equal(tokens['--text-main'], '#181716');
  assert.equal(tokens['--text-muted'], '#6b665f');
  assert.equal(tokens['--border-light'], '#e4dfd5');

  // Fonts & layout defaults
  assert.equal(tokens['--theme-heading-font'], 'Cormorant Garamond');
  assert.equal(tokens['--theme-body-font'], 'Plus Jakarta Sans');
  assert.equal(tokens['--theme-accent-font'], 'Alex Brush');
  assert.equal(tokens['--font-serif'], '"Cormorant Garamond"');
  assert.equal(tokens['--font-sans'], '"Plus Jakarta Sans"');
  assert.equal(tokens['--theme-content-width'], '720px');
  assert.equal(tokens['--theme-section-spacing'], '80px');
  assert.equal(tokens['--theme-border-radius'], '0px');
  assert.equal(tokens['--theme-background-image'], 'none');
});

test('applies custom valid colors and updates mapped legacy tokens', () => {
  const tokens = themeTokens({
    version: 1,
    colors: {
      primary: '#123456',
      secondary: '#654321',
      background: '#f0f0f0',
      surface: '#ffffff',
      text: '#111111',
      muted: '#777777',
      border: '#cccccc',
    },
    fonts: { heading: 'Playfair Display', body: 'Inter' },
    layout: { content_width: 800, section_spacing: 60, border_radius: 4 },
    background: { type: 'color', color: '#f0f0f0' },
  });

  assert.equal(tokens['--theme-primary'], '#123456');
  assert.equal(tokens['--accent-classic'], '#123456');
  assert.equal(tokens['--theme-secondary'], '#654321');
  assert.equal(tokens['--theme-background'], '#f0f0f0');
  assert.equal(tokens['--bg-primary'], '#f0f0f0');
  assert.equal(tokens['--theme-heading-font'], 'Playfair Display');
  assert.equal(tokens['--theme-body-font'], 'Inter');
  assert.equal(tokens['--theme-content-width'], '800px');
  assert.equal(tokens['--theme-section-spacing'], '60px');
  assert.equal(tokens['--theme-border-radius'], '4px');
});

test('rejects unsafe non-hex colors and falls back safely', () => {
  const tokens = themeTokens({
    version: 1,
    colors: {
      primary: 'red; background:url(evil.com)',
      background: 'javascript:alert(1)',
      text: '<script>',
    },
  });

  assert.equal(tokens['--theme-primary'], '#8a704c');
  assert.equal(tokens['--accent-classic'], '#8a704c');
  assert.equal(tokens['--theme-background'], '#faf9f6');
  assert.equal(tokens['--bg-primary'], '#faf9f6');
  assert.equal(tokens['--theme-text'], '#181716');
});

test('rejects unapproved font families and falls back safely', () => {
  const tokens = themeTokens({
    version: 1,
    fonts: {
      heading: 'Comic Sans MS',
      body: 'Wingdings',
      accent: 'Papyrus',
    },
  });

  assert.equal(tokens['--theme-heading-font'], 'Cormorant Garamond');
  assert.equal(tokens['--theme-body-font'], 'Plus Jakarta Sans');
  assert.equal(tokens['--theme-accent-font'], 'Alex Brush');
});

test('clamps layout dimensions to safe bounds', () => {
  const tokensSmall = themeTokens({
    layout: { content_width: 100, section_spacing: -20, border_radius: -5 },
  });
  assert.equal(tokensSmall['--theme-content-width'], '320px');
  assert.equal(tokensSmall['--theme-section-spacing'], '0px');
  assert.equal(tokensSmall['--theme-border-radius'], '0px');

  const tokensLarge = themeTokens({
    layout: { content_width: 2500, section_spacing: 500, border_radius: 50 },
  });
  assert.equal(tokensLarge['--theme-content-width'], '1600px');
  assert.equal(tokensLarge['--theme-section-spacing'], '300px');
  assert.equal(tokensLarge['--theme-border-radius'], '32px');
});

test('builds background image with overlay gradient when specified', () => {
  const tokens = themeTokens({
    background: {
      type: 'image',
      color: '#faf9f6',
      image_url: 'https://images.example.com/wedding-bg.jpg',
      overlay_color: '#000000',
      overlay_opacity: 0.4,
    },
  });

  assert.equal(
    tokens['--theme-background-image'],
    'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.example.com/wedding-bg.jpg")'
  );
});

test('handles local uploads and images without overlay', () => {
  const tokens = themeTokens({
    background: {
      type: 'image',
      color: '#faf9f6',
      image_url: '/uploads/bg-123.webp',
      overlay_opacity: 0,
    },
  });

  assert.equal(tokens['--theme-background-image'], 'url("/uploads/bg-123.webp")');
});

test('rejects unsafe image URLs like javascript: or data:', () => {
  const tokens = themeTokens({
    background: {
      type: 'image',
      color: '#faf9f6',
      image_url: 'javascript:alert(1)',
    },
  });

  assert.equal(tokens['--theme-background-image'], 'none');
});

test('rejects CSS injection and traversal in image URLs', () => {
  const injected = themeTokens({
    background: {
      type: 'image',
      color: '#faf9f6',
      image_url: 'https://example.com/a.png"),url(javascript:alert(1))',
    },
  });
  const traversal = themeTokens({
    background: { type: 'image', color: '#faf9f6', image_url: '/uploads/../private.png' },
  });

  assert.equal(injected['--theme-background-image'], 'none');
  assert.equal(traversal['--theme-background-image'], 'none');
});

test('merges invitation overrides over template theme tokens', () => {
  const tokens = themeTokens(
    {
      colors: { primary: '#123456', background: '#ffffff' },
      fonts: { heading: 'Lora', body: 'Inter' },
      layout: { content_width: 800, section_spacing: 60, border_radius: 0 },
    },
    { colors: { primary: '#abcdef' }, layout: { section_spacing: 100 } }
  );

  assert.equal(tokens['--theme-primary'], '#abcdef');
  assert.equal(tokens['--theme-background'], '#ffffff');
  assert.equal(tokens['--theme-heading-font'], 'Lora');
  assert.equal(tokens['--theme-content-width'], '800px');
  assert.equal(tokens['--theme-section-spacing'], '100px');
});
