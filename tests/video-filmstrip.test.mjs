import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const editor = readFileSync(new URL('../app/components/admin/VideoThumbnailEditor.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/components/admin/WorkVideosEditor.module.css', import.meta.url), 'utf8');

test('thumbnail chooser uses a paused video without native player controls', () => {
  assert.match(editor, /onPlay=\{e => e\.currentTarget\.pause\(\)\}/);
  assert.match(editor, /onSeeked=\{e => \{ e\.currentTarget\.pause\(\); void captureFrame/);
  assert.doesNotMatch(editor, /\bsrc=\{src\}\s+controls\b/);
  assert.match(editor, /className=\{style\.thumbVideo\}/);
});
test('accessible filmstrip scrub controls timestamp and preserves editor export', () => {
  assert.match(editor, /aria-label="Seek video frame"/);
  assert.match(editor, /onChange=\{e => seekTo\(e\.target\.value\)\}/);
  assert.match(editor, /Confirm Frame/);
  assert.match(editor, /Confirm Thumbnail/);
  assert.match(editor, /onConfirm\(blob\)/);
  assert.match(editor, /const W = 360, H = 480;/);
  assert.match(css, /\.filmstrip\{/);
  assert.match(css, /\.filmRange\{/);
  assert.match(css, /\.cropStage\{/);
});
test('filmstrip frames are decoded offline and do not write video files', () => {
  assert.match(editor, /FRAME_COUNT = 9/);
  assert.match(editor, /decoder\.currentTime = t/);
  assert.match(editor, /toDataURL\('image\/jpeg'/);
  assert.doesNotMatch(editor, /uploadResumableVideo|uploadVideoThumbnail|deleteWorkerFile|updateWorker/);
});
