import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../');
const renderer = fs.readFileSync(
  path.join(root, 'components/invitation/InvitationRenderer.tsx'),
  'utf8'
);
const blocks = fs.readFileSync(
  path.join(root, 'components/invitation/blocks/InvitationBlocks.tsx'),
  'utf8'
);

test('public, demo, and preview share the same renderer contract', () => {
  const publicRoute = fs.readFileSync(path.join(root, 'app/[slug]/page.tsx'), 'utf8');
  const demoRoute = fs.readFileSync(path.join(root, 'app/demo/[slug]/page.tsx'), 'utf8');
  const previewRoute = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/create/live-preview.tsx'),
    'utf8'
  );
  assert.match(renderer, /InvitationRenderMode = 'public' \| 'demo' \| 'preview'/);
  assert.match(renderer, /data-render-mode=\{mode\}/);
  assert.match(renderer, /BlockRegistry/);
  assert.match(blocks, /CoupleBlock/);
  assert.match(publicRoute, /<InvitationRenderer/);
  assert.match(publicRoute, /mode="public"/);
  assert.match(demoRoute, /<InvitationRenderer/);
  assert.match(demoRoute, /mode="demo"/);
  assert.match(previewRoute, /<InvitationRenderer/);
  assert.match(previewRoute, /mode="preview"/);
});

test('shared blocks preserve interactive parity seams', () => {
  const audio = fs.readFileSync(
    path.join(root, 'components/invitation/blocks/AudioBlock.tsx'),
    'utf8'
  );
  const interactive = fs.readFileSync(
    path.join(root, 'components/invitation/blocks/InteractiveBlocks.tsx'),
    'utf8'
  );
  assert.match(blocks, /onOpenGallery/);
  assert.match(blocks, /InteractiveBlock/);
  assert.match(blocks, /calendar\.google\.com\/calendar\/render/);
  assert.match(renderer, /AudioBlock/);
  assert.match(renderer, /isOpen/);
  assert.match(audio, /detail\?\.music/);
  assert.match(audio, /\.catch\(/);
  assert.match(audio, /pause\(\)/);
  assert.match(interactive, /onSubmit=/);
  assert.match(interactive, /value="tidak_hadir"/);
  assert.doesNotMatch(interactive, /message:\s*'Konfirmasi dari preview'/);
});

test('preview adapter remains fixture-backed and non-persistent', () => {
  const adapter = fs.readFileSync(
    path.join(root, 'components/invitation/invitation-adapter.ts'),
    'utf8'
  );
  assert.match(adapter, /createPreviewInvitation/);
  assert.match(adapter, /wedding_event/);
  assert.match(adapter, /gallery/);
  assert.doesNotMatch(adapter, /fetch\(|api\./);
});

test('create and edit forms enforce upload-only for image inputs', () => {
  const createForm = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/create/page.tsx'),
    'utf8'
  );
  const editForm = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/[id]/page.tsx'),
    'utf8'
  );
  assert.match(editForm, /createWorkspace/);
  assert.match(editForm, /<LivePreview/);
  for (const src of [createForm, editForm]) {
    assert.doesNotMatch(src, /placeholder="https:\/\/\.\.\. atau unggah/);
    assert.doesNotMatch(src, /images\.unsplash\.com\/photo-1/);
  }
});

test('layout editor uses single manual save-and-publish button without autosave or green banner', () => {
  const layoutEditor = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/[id]/layout-editor.tsx'),
    'utf8'
  );
  const editPage = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/[id]/page.tsx'),
    'utf8'
  );
  assert.doesNotMatch(layoutEditor, /autosaveState|Autosave:|setTimeout|onPublish|Terbitkan/);
  assert.match(layoutEditor, /Simpan layout/);
  assert.doesNotMatch(editPage, /successBanner/);
  assert.match(editPage, /layout:\s*nextLayout[\s\S]*?status:\s*'active'/);
});

test('preview mockup frame renders realistic mobile chrome and locks viewport while cover is closed', () => {
  const frame = fs.readFileSync(
    path.join(root, 'components/invitation/InvitationPreviewFrame.tsx'),
    'utf8'
  );
  const livePreview = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/create/live-preview.tsx'),
    'utf8'
  );
  const demoPage = fs.readFileSync(path.join(root, 'app/demo/[slug]/page.tsx'), 'utf8');
  assert.match(frame, /phoneNotch/);
  assert.match(frame, /phoneStatusBar/);
  assert.match(frame, /phoneAddressBar/);
  assert.match(frame, /localhost/);
  assert.match(frame, /phoneBottomBar/);
  assert.match(frame, /phoneHomeIndicator/);
  assert.match(livePreview, /isCoverOpen=\{isPreviewOpen\}/);
  assert.match(demoPage, /<InvitationPreviewFrame/);
  assert.match(demoPage, /isCoverOpen=\{isOpen\}/);
  assert.doesNotMatch(demoPage, /Sampul Depan|RotateCcw/);
});

test('countdown boxes scale dynamically to container without overflow and mobile preview uses 80% zoom scale', () => {
  const pageCss = fs.readFileSync(path.join(root, 'app/[slug]/page.module.css'), 'utf8');
  const formCss = fs.readFileSync(
    path.join(root, 'app/dashboard/invitations/form.module.css'),
    'utf8'
  );
  assert.match(pageCss, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(pageCss, /min-width:\s*64px/);
  assert.match(formCss, /zoom:\s*0\.8/);
});
