/** Infixo Storage Service. Admin uploads/deletes go through the protected server API. */
const BUCKET = 'worker-media';

async function adminStorageRequest(path, options = {}) {
  const res = await fetch(path, { ...options, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Storage request failed');
  return body;
}

// XHR gives per-photo upload progress; existing Identity/Video upload callers
// without onProgress continue using the original fetch behavior unchanged.
function uploadWithProgress(form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/storage', true);
    xhr.responseType = 'json';
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round(100 * event.loaded / event.total)));
      }
    };
    xhr.onerror = () => reject(new Error('Network error: upload dobara try karein.'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    xhr.onload = () => {
      const body = xhr.response && typeof xhr.response === 'object' ? xhr.response : {};
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.error || `Upload failed (HTTP ${xhr.status})`));
    };
    xhr.send(form);
  });
}

export async function uploadWorkerFile(file, { workerId, section, onProgress } = {}) {
  if (!file) throw new Error('No file provided');
  const ext = (file.name.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'bin';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${workerId || 'temp'}/${section}/${safeName}`;
  const form = new FormData();
  form.append('file', file);
  form.append('path', path);
  form.append('contentType', file.type || 'application/octet-stream');
  const body = typeof onProgress === 'function'
    ? await uploadWithProgress(form, onProgress)
    : await adminStorageRequest('/api/admin/storage', { method: 'POST', body: form });
  if (!body.publicUrl) throw new Error('Upload completed but media URL missing');
  return body.publicUrl;
}

export async function deleteWorkerFile(publicUrl) {
  if (!publicUrl || !publicUrl.includes(`/storage/v1/object/public/${BUCKET}/`)) return;
  const path = publicUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
  if (!path) return;
  await adminStorageRequest('/api/admin/storage', {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }),
  });
}
