import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VIDEO_THUMB_RATIO, MAX_VIDEO_BYTES, VIDEO_CHUNK_BYTES, videoDuration,
  isVideoHeader, validateVideoSelection, validateVideoEntries,
  videoMediaPath, videoListChanged,
} from '../lib/workVideo.mjs';

test('3:4 card framing, chunk size and supported 15MB uploads', () => {
  assert.equal(VIDEO_THUMB_RATIO, .75);
  assert.equal(VIDEO_CHUNK_BYTES, 6 * 1024 * 1024);
  assert.ok(MAX_VIDEO_BYTES >= 15 * 1024 * 1024);
  assert.equal(validateVideoSelection({
    size: 15 * 1024 * 1024, type: 'video/mp4',
    headerHex: '000000186674797069736f6d00000000',
  }), '');
});
test('reject unsupported MIME, wrong signatures, zero and oversize files', () => {
  assert.match(validateVideoSelection({ size: 1000, type: 'application/pdf', headerHex: '' }), /MP4/);
  assert.match(validateVideoSelection({ size: 1000, type: 'video/mp4', headerHex: '00000000abcd' }), /signature/);
  assert.match(validateVideoSelection({ size: 0, type: 'video/mp4', headerHex: '0000001866747970' }), /45/);
  assert.match(validateVideoSelection({ size: MAX_VIDEO_BYTES + 1, type: 'video/mp4', headerHex: '0000001866747970' }), /45/);
});
test('accept verified WebM and QuickTime file headers', () => {
  assert.ok(isVideoHeader('video/webm', '1a45dfa3aabb'));
  assert.ok(isVideoHeader('video/quicktime', '000000186674797071742020'));
  assert.equal(isVideoHeader('video/mp4', '25504446'), false);
});
test('duration metadata formatting', () => {
  assert.equal(videoDuration(17), '00:17');
  assert.equal(videoDuration(61.3), '01:01');
  assert.equal(videoDuration(-1), '00:00');
  assert.equal(videoDuration(NaN), '00:00');
});
test('stable public record shape and empty payload', () => {
  assert.equal(validateVideoEntries([]), '');
  assert.equal(validateVideoEntries([{ video:'https://v', thumbnail:'https://t',duration:'00:17' }]), '');
  assert.match(validateVideoEntries([{ video: 'https://v', duration: '00:17' }]), /thumbnail/);
  assert.match(validateVideoEntries('oops'), /array/);
});
test('URL path belongs to correct worker folder and blocks traversal', () => {
  const u = 'https://example.supabase.co/storage/v1/object/public/worker-media/123/videos/abcd.mp4';
  assert.equal(videoMediaPath(u, '123'), '123/videos/abcd.mp4');
  assert.equal(videoMediaPath(u, '456'), null);
  assert.equal(videoMediaPath('http://example.supabase.co/storage/v1/object/public/worker-media/123/videos/a.mp4','123'), null);
  assert.equal(videoMediaPath('https://example.supabase.co/storage/v1/object/public/worker-media/123/%2e%2e/a.mp4','123'), null);
});
test('detect reorder without changing the public data schema', () => {
  const a = [{video:'a',thumbnail:'ta',duration:'00:20'}, {video:'b',thumbnail:'tb',duration:'00:16'}];
  assert.equal(videoListChanged(a,a), false);
  assert.equal(videoListChanged(a,a.slice().reverse()), true);
});
