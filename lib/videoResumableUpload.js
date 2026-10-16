/** Browser TUS 1.0 upload. No service key or video bytes pass through Vercel. */
import { VIDEO_CHUNK_BYTES, validateVideoSelection } from './workVideo.mjs';

function xhrRequest(method, endpoint, headers, data, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, endpoint, true);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.timeout = 90000;
    if (data && onProgress) {
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) onProgress(event.loaded, event.total);
      };
    }
    xhr.onerror = () => reject(Error('Network interrupted'));
    xhr.ontimeout = () => reject(Error('Upload timed out'));
    xhr.onabort = () => reject(Error('Upload cancelled'));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ status: xhr.status, offset: Number(xhr.getResponseHeader('Upload-Offset')), location: xhr.getResponseHeader('Location') });
      } else reject(Error('Storage request failed (HTTP ' + xhr.status + '): ' + String(xhr.responseText || '').slice(0, 220)));
    };
    xhr.send(data || null);
  });
}
const meta = s => btoa(String(s).split('').map(c => String.fromCharCode(c.charCodeAt(0))).join(''));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function videoFileSignature(file) {
  const view = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return [...view].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function signVideo(file, workerId, headerHex) {
  const res = await fetch('/api/admin/video-upload', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId, mime: file.type, size: file.size, headerHex }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(body.error || 'Upload authorization failed (HTTP ' + res.status + ')');
  return body;
}
export async function uploadResumableVideo(file, workerId, onProgress = () => {}) {
  const headerHex = await videoFileSignature(file);
  const issue = validateVideoSelection({ size: file.size, type: file.type, headerHex });
  if (issue) throw Error(issue);
  const signed = await signVideo(file, workerId, headerHex);
  if (!signed.endpoint?.endsWith('/storage/v1/upload/resumable/sign'))
    throw Error('Signed Storage endpoint is misconfigured');
  if (!signed.publicApiKey || signed.publicApiKey.startsWith('sb_secret_'))
    throw Error('Staging public API key is unavailable');
  const headers = {
    'Tus-Resumable': '1.0.0',
    'x-signature': signed.token,
    apikey: signed.publicApiKey,
  };
  const uploadMetadata = 'bucketName ' + meta(signed.bucket) +
    ',objectName ' + meta(signed.path) +
    ',contentType ' + meta(file.type) +
    ',cacheControl ' + meta('3600');
  const start = await xhrRequest('POST', signed.endpoint, {
    ...headers, 'Upload-Length': String(file.size), 'Upload-Metadata': uploadMetadata,
  });
  if (!start.location) throw Error('Storage did not return resumable upload location');
  const uploadUrl = new URL(start.location, signed.endpoint).href;
  // Supabase returns the unique signed URL for this upload; keep it private.
  let offset = 0;
  let failures = 0;
  while (offset < file.size) {
    try {
      // HEAD detects bytes already received after a dropped response.
      const head = await xhrRequest('HEAD', uploadUrl, headers);
      offset = head.offset;
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > file.size) throw Error('Invalid storage offset');
      if (offset === file.size) break;
      const end = Math.min(offset + VIDEO_CHUNK_BYTES, file.size);
      const chunk = file.slice(offset, end);
      const patch = await xhrRequest('PATCH', uploadUrl, {
        ...headers, 'Upload-Offset': String(offset), 'Content-Type': 'application/offset+octet-stream',
      }, chunk, (sent) => onProgress(Math.min(99, Math.round(100 * (offset + sent) / file.size))));
      offset = Number.isInteger(patch.offset) ? patch.offset : end;
      failures = 0;
      onProgress(Math.min(99, Math.round(100 * offset / file.size)));
    } catch (e) {
      if (++failures > 4) throw Error('Upload interrupted. Retry this video only. ' + (e.message || ''));
      await pause([1000, 2500, 5000, 10000][failures - 1]);
    }
  }
  onProgress(100);
  return signed.publicUrl;
}
export async function uploadVideoThumbnail(blob, workerId) {
  if (!(blob instanceof Blob)) throw Error('Thumbnail not prepared');
  const form = new FormData();
  form.append('workerId', workerId);
  form.append('file', blob, 'thumbnail.jpg');
  const res = await fetch('/api/admin/video-upload', { method: 'POST', body: form, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.publicUrl) throw Error(body.error || 'Thumbnail upload failed');
  return body.publicUrl;
}
