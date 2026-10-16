'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Admin.module.css';
import photoStyles from './WorkPhotosEditor.module.css';
import { uploadWorkerFile, deleteWorkerFile } from '@/lib/storageService';
import { WORK_PHOTO_FRAME_RATIO, toWorkPhotoEntry, workPhotoCrop, workPhotoUrl } from '@/lib/workPhoto.mjs';
import PhotoCropper from './PhotoCropper';
import CroppedImage from '../CroppedImage/CroppedImage';

// Work Gallery cards are 3:4. These uploads are ORIGINAL image files;
// crop metadata only changes how the gallery thumbnail is framed.
const MAX_WORK_PHOTOS = 6; // PRO maximum; linked FREE profiles are further limited to 2 by the DB.
const MAX_PROXY_IMAGE_BYTES = 4 * 1024 * 1024; // Leave margin under Vercel's 4.5 MB request limit.
const SUPPORTED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

function savedItems(photos) {
  return (photos || []).filter(workPhotoUrl).map((entry, index) => ({
    id: `saved-${index}-${workPhotoUrl(entry)}`,
    url: workPhotoUrl(entry), preview: workPhotoUrl(entry), crop: workPhotoCrop(entry),
    file: null, status: 'saved', progress: 100, error: '',
  }));
}

function makeTemporaryItem(file, preview) {
  return {
    id: `pending-${crypto.randomUUID()}`, file, preview, url: '', crop: null,
    status: 'pending', progress: 0, error: '',
  };
}

function validateFile(file) {
  if (!SUPPORTED_IMAGES.has(file.type)) {
    return `${file.name}: JPG, PNG, WebP, AVIF ya GIF photo chunein. HEIC ko pehle convert karein.`;
  }
  if (file.size === 0 || file.size > MAX_PROXY_IMAGE_BYTES) {
    return `${file.name}: photo 4 MB se chhoti honi chahiye. Badi original files ko future R2 upload mein support karenge.`;
  }
  return '';
}

/**
 * Admin-only editor. Changes stay local until Save All succeeds. Old public
 * photo URLs are NEVER removed before the worker profile's DB update succeeds.
 */
export default function WorkPhotosEditor({ worker, onSave, onDirtyChange, onPreviewChange, saving, saveMessage, saveError }) {
  const [items, setItems] = useState(() => savedItems(worker.photos));
  const itemsRef = useRef(items);
  const [cropId, setCropId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const tempUrls = useRef(new Set());

  // Worker switching is rare, but never display another worker's staged photos.
  useEffect(() => {
    itemsRef.current = savedItems(worker.photos);
    setItems(itemsRef.current);
    setDirty(false);
    setCropId(null);
    setNotice('');
  }, [worker.id]);

  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  // Keep the existing Admin Live Preview in sync even before Save All. Local
  // blob: URLs are preview-only and NEVER persisted to Supabase.
  useEffect(() => {
    onPreviewChange?.(items.map(item => toWorkPhotoEntry(item.preview, item.crop)));
  }, [items, onPreviewChange]);
  useEffect(() => () => { onPreviewChange?.(null); }, [onPreviewChange]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warnOnLeave = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warnOnLeave);
    return () => window.removeEventListener('beforeunload', warnOnLeave);
  }, [dirty]);

  useEffect(() => () => {
    for (const url of tempUrls.current) URL.revokeObjectURL(url);
    tempUrls.current.clear();
  }, []);

  const setCurrent = next => { itemsRef.current = next; setItems(next); };
  const change = updater => { setCurrent(updater(itemsRef.current)); setDirty(true); setNotice(''); };
  const changeRow = (id, updater) => {
    setCurrent(itemsRef.current.map(item => item.id === id ? updater(item) : item));
  };
  const discardTemp = item => {
    if (item.preview?.startsWith('blob:') && tempUrls.current.delete(item.preview)) URL.revokeObjectURL(item.preview);
  };
  const discardUnsavedUpload = item => {
    if (item.file && item.url) deleteWorkerFile(item.url).catch(() => {});
  };

  const addFiles = e => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length || busy) return;
    const room = Math.max(0, MAX_WORK_PHOTOS - itemsRef.current.length);
    if (!room) { setNotice('Maximum 6 Work Photos. FREE plan mein sirf 2 allowed hain.'); return; }
    const accepted = [], problems = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) problems.push(error);
      else if (accepted.length >= room) problems.push('6-photo limit: kuch extra photos add nahi hui.');
      else accepted.push(file);
    }
    const next = accepted.map(file => {
      const preview = URL.createObjectURL(file);
      tempUrls.current.add(preview);
      return makeTemporaryItem(file, preview);
    });
    if (next.length) change(prev => [...prev, ...next]);
    if (problems.length) setNotice([...new Set(problems)].join(' '));
  };

  const replacePhoto = (id, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    const error = validateFile(file);
    if (error) { setNotice(error); return; }
    const old = itemsRef.current.find(item => item.id === id);
    if (!old) return;
    // A previous unsaved upload can be safely removed. Saved originals are
    // retained until the replacement's DB save is confirmed.
    discardUnsavedUpload(old);
    discardTemp(old);
    const preview = URL.createObjectURL(file);
    tempUrls.current.add(preview);
    change(prev => prev.map(item => item.id === id ? makeTemporaryItem(file, preview) : item));
  };

  const removePhoto = id => {
    if (busy) return;
    const old = itemsRef.current.find(item => item.id === id);
    if (!old) return;
    discardUnsavedUpload(old);
    discardTemp(old);
    change(prev => prev.filter(item => item.id !== id));
    if (cropId === id) setCropId(null);
  };

  const movePhoto = (id, direction) => {
    if (busy) return;
    const index = itemsRef.current.findIndex(item => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= itemsRef.current.length) return;
    change(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadItem = async id => {
    const current = itemsRef.current.find(item => item.id === id);
    if (!current?.file || current.url) return !!current?.url;
    changeRow(id, item => ({ ...item, status: 'uploading', progress: 0, error: '' }));
    try {
      const url = await uploadWorkerFile(current.file, {
        workerId: worker.id, section: 'photos',
        onProgress: progress => changeRow(id, item => ({ ...item, progress })),
      });
      changeRow(id, item => ({ ...item, url, status: 'uploaded', progress: 100 }));
      return true;
    } catch (error) {
      changeRow(id, item => ({ ...item, status: 'failed', progress: 0, error: error?.message || 'Upload failed' }));
      return false;
    }
  };

  const retry = async id => {
    if (busy) return;
    setBusy(true);
    try { await uploadItem(id); } finally { setBusy(false); }
  };

  const saveAll = async () => {
    if (busy || saving) return;
    if (!dirty) { setNotice('Koi pending changes nahi hain.'); return; }
    setBusy(true);
    setNotice('');
    try {
      // Upload originals in order. A failed upload leaves a retryable file in
      // place, and we do NOT save any partial photo array to the database.
      for (const item of itemsRef.current) {
        if (item.file && !item.url && !(await uploadItem(item.id))) {
          setNotice('Ek photo upload nahi hui. Retry dabayein, phir Save All karein.');
          return;
        }
      }
      const entries = itemsRef.current.map(item => toWorkPhotoEntry(item.url, item.crop));
      await onSave(entries); // caller updates Supabase workers.photos and parent preview.
      const referenced = new Set(entries.map(workPhotoUrl));
      const old = [...new Set((worker.photos || []).map(workPhotoUrl).filter(Boolean))];
      for (const item of itemsRef.current) discardTemp(item);
      // Keep originals for remaining photos. Delete only old work-photo files
      // no longer referenced, and only AFTER the successful DB update.
      const cleanup = old.filter(url => !referenced.has(url));
      const cleanupResults = await Promise.allSettled(cleanup.map(url => deleteWorkerFile(url)));
      const failedCleanups = cleanupResults.filter(r => r.status === 'rejected').length;
      setCurrent(savedItems(entries));
      setDirty(false);
      if (failedCleanups) setNotice('Photos save ho gayi hain. Kuch purani files ki cleanup pending hai.');
    } catch (error) {
      setNotice(`Photos save nahi hui: ${error?.message || 'Please retry.'}`);
      // Already-uploaded items keep their URLs; Save All can retry DB save.
    } finally {
      setBusy(false);
    }
  };

  const cropped = cropId ? items.find(item => item.id === cropId) : null;
  const locked = busy || saving;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Work Photos</h3>
      <p className={styles.hint}>
        Multiple photos ek saath choose karein. Har photo ka 3:4 gallery crop alag set karein.
        Original image fullscreen viewer mein safe rehti hai.
      </p>
      <p className={styles.hint}>
        PRO: maximum 6 photos · FREE: maximum 2 photos. File limit: 4 MB/photo (current upload server).
      </p>
      <p className={photoStyles.counter}>{items.length} / {MAX_WORK_PHOTOS} photos {dirty ? '· Unsaved changes' : '· Saved'}</p>

      <div className={styles.mediaGrid}>
        {items.map((item, idx) => (
          <div key={item.id} className={`${styles.mediaItem} ${photoStyles.photoCard}`}>
            {item.crop
              ? <CroppedImage src={item.preview} crop={item.crop} alt={`Work photo ${idx + 1}`} />
              : <img src={item.preview} alt={`Work photo ${idx + 1}`} />}
            <div className={photoStyles.photoControls}>
              <button type="button" onClick={() => setCropId(item.id)} disabled={locked} aria-label={`Crop photo ${idx + 1}`}>Crop</button>
              <label className={photoStyles.replace} aria-label={`Replace photo ${idx + 1}`}>
                Replace<input type="file" accept="image/*" disabled={locked} onChange={e => replacePhoto(item.id, e)} />
              </label>
            </div>
            <button type="button" className={styles.mediaRemoveBtn} onClick={() => removePhoto(item.id)}
              disabled={locked} aria-label={`Remove photo ${idx + 1}`} style={{ zIndex: 4 }}>✕</button>
            <div className={photoStyles.orderControls}>
              <button type="button" onClick={() => movePhoto(item.id, -1)} disabled={locked || idx === 0} aria-label={`Move photo ${idx + 1} left`}>↑</button>
              <button type="button" onClick={() => movePhoto(item.id, 1)} disabled={locked || idx === items.length - 1} aria-label={`Move photo ${idx + 1} right`}>↓</button>
            </div>
            {item.file && (
              <div className={photoStyles.uploadBadge} aria-live="polite">
                {item.status === 'uploading' ? `Uploading ${item.progress}%`
                  : item.status === 'failed' ? <><span>Upload failed</span><button type="button" disabled={locked} onClick={() => retry(item.id)}>Retry</button></>
                  : item.status === 'uploaded' ? 'Uploaded · Not saved' : 'Ready to upload'}
                {item.status === 'uploading' && <progress max="100" value={item.progress} />}
              </div>
            )}
            {item.error && <p className={photoStyles.itemError}>{item.error}</p>}
          </div>
        ))}
        {items.length < MAX_WORK_PHOTOS && (
          <label className={`${styles.uploadBox} ${photoStyles.addPhoto}`} aria-label="Select multiple work photos">
            {locked ? 'Please wait…' : '+ Add Photos'}
            <input type="file" accept="image/*" multiple disabled={locked} onChange={addFiles} />
          </label>
        )}
      </div>
      <p className={styles.hint}>Drag / zoom har photo ke Crop popup mein. ↑ ↓ se order change hota hai. Save All ke bina worker profile update nahi hogi.</p>
      {notice && <p className={photoStyles.notice} role="status">{notice}</p>}
      <div className={styles.saveRow}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveAll} disabled={locked}>
          {locked ? 'Uploading / Saving…' : 'Save All Photos'}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
      {cropped && (
        <PhotoCropper
          key={cropped.id}
          src={cropped.preview}
          initialCrop={cropped.crop}
          frameRatio={WORK_PHOTO_FRAME_RATIO}
          context="Work Gallery"
          onCancel={() => setCropId(null)}
          onApply={crop => {
            change(prev => prev.map(item => item.id === cropped.id ? { ...item, crop } : item));
            setCropId(null);
          }}
        />
      )}
    </div>
  );
}
