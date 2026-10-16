'use client';

import { useEffect, useRef, useState } from 'react';
import css from './WorkVideosEditor.module.css';
import VideoThumbnailEditor from './VideoThumbnailEditor';
import { deleteWorkerFile } from '@/lib/storageService';
import { uploadResumableVideo, uploadVideoThumbnail, videoFileSignature } from '@/lib/videoResumableUpload';
import { validateVideoSelection, videoDuration } from '@/lib/workVideo.mjs';

function savedItems(videos) {
  return (videos || []).map((item, n) => ({
    id: 'saved-' + n + '-' + item.video,
    url: item.video, thumbnail: item.thumbnail, duration: item.duration || '00:00',
    file: null, preview: item.video, thumbBlob: null, thumbPreview: '',
    status: 'saved', progress: 100, error: '',
  }));
}
function readDuration(source) {
  return new Promise(resolve => {
    const el = document.createElement('video');
    let finished = false;
    const done = seconds => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      el.removeAttribute('src');
      el.load();
      resolve(videoDuration(seconds));
    };
    const timer = setTimeout(() => done(0), 12000);
    el.preload = 'metadata';
    el.onloadedmetadata = () => done(el.duration);
    el.onerror = () => done(0);
    el.src = source;
  });
}
export default function WorkVideosEditor({
  worker, onSave, onDirtyChange, onPreviewChange, saving, saveMessage, saveError,
}) {
  const [items, setItems] = useState(() => savedItems(worker.videos));
  const itemsRef = useRef(items);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [dragging, setDragging] = useState(null);
  const tempUrls = useRef(new Set());
  const savedRef = useRef(worker.videos || []);
  const touchRef = useRef(null);
  const busyRef = useRef(false);
  busyRef.current = busy || saving;
  itemsRef.current = items;

  const objectUrl = object => {
    const url = URL.createObjectURL(object);
    tempUrls.current.add(url);
    return url;
  };
  function release(url) {
    if (url && tempUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      tempUrls.current.delete(url);
    }
  }
  useEffect(() => {
    savedRef.current = worker.videos || [];
    setItems(savedItems(worker.videos));
    setDirty(false);
    setNotice('');
    return () => {
      for (const url of tempUrls.current) URL.revokeObjectURL(url);
      tempUrls.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker.id]);
  useEffect(() => { if (onDirtyChange) onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!onPreviewChange) return;
    onPreviewChange(dirty ? items.filter(x => x.preview).map(x => ({
      video: x.url || x.preview, thumbnail: x.thumbPreview || x.thumbnail || '',
      duration: x.duration,
    })) : null);
  }, [items, dirty, onPreviewChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const replaceItem = (id, patch) => setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
  const appendFiles = async e => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length || busyRef.current) return;
    if (files.length > 4) { setNotice('Ek baar mein maximum 4 videos select karein. Baad mein Add Videos dobara kar sakte hain.'); return; }
    const selected = [];
    const errors = [];
    for (const file of files) {
      const headerHex = await videoFileSignature(file);
      const issue = validateVideoSelection({ size: file.size, type: file.type, headerHex });
      if (issue) { errors.push(file.name + ': ' + issue); continue; }
      const preview = objectUrl(file);
      const duration = await readDuration(preview);
      selected.push({
        id: 'new-' + crypto.randomUUID(), file, preview, url: '',
        thumbnail: '', thumbBlob: null, thumbPreview: '',
        duration, status: 'pending', progress: 0, error: '',
      });
    }
    if (selected.length) { setItems(prev => [...prev, ...selected]); setDirty(true); }
    setNotice(errors.join(' '));
  };
  const remove = id => {
    if (busyRef.current) return;
    const item = itemsRef.current.find(x => x.id === id);
    if (!item) return;
    release(item.file && item.preview);
    release(item.thumbPreview);
    setItems(prev => prev.filter(x => x.id !== id));
    setDirty(true);
  };
  const move = (from, to) => {
    if (busyRef.current || from === to || to < 0 || to >= itemsRef.current.length) return;
    setItems(prev => {
      const all = [...prev], [item] = all.splice(from, 1);
      all.splice(to, 0, item);
      return all;
    });
    setDirty(true);
  };
  const startTouch = (event, i) => {
    if (busyRef.current) return;
    const touch = event.touches[0];
    const obj = { index: i, x: touch.clientX, y: touch.clientY, active: false, timer: null };
    obj.timer = setTimeout(() => { obj.active = true; setDragging(i); }, 350);
    touchRef.current = obj;
  };
  const movingTouch = event => {
    const d = touchRef.current;
    if (!d) return;
    if (!d.active && Math.abs(event.touches[0].clientY - d.y) > 10) {
      clearTimeout(d.timer); touchRef.current = null;
    } else if (d.active) event.preventDefault();
  };
  const endTouch = event => {
    const d = touchRef.current;
    if (!d) return;
    clearTimeout(d.timer);
    if (d.active) {
      const touch = event.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-video-index]');
      if (target) move(d.index, Number(target.dataset.videoIndex));
    }
    touchRef.current = null; setDragging(null);
  };
  const prepareThumb = (id, blob) => {
    const old = itemsRef.current.find(x => x.id === id);
    if (!old) return;
    release(old.thumbPreview);
    const thumbPreview = objectUrl(blob);
    replaceItem(id, { thumbBlob: blob, thumbPreview, error: '' });
    setDirty(true);
    setEditing(null);
  };
  const saveAll = async () => {
    if (busyRef.current || !dirty) return;
    const current = itemsRef.current;
    if (current.some(x => !x.thumbnail && !x.thumbBlob)) {
      setNotice('Har video ke liye pehle Choose Thumbnail se video frame confirm karein.');
      return;
    }
    setBusy(true); setNotice('');
    try {
      // Successful per-file uploads persist in draft state and survive Save retry.
      const complete = [];
      for (const original of current) {
        let item = { ...original };
        if (!item.url) {
          replaceItem(item.id, { status: 'uploading', progress: 0, error: '' });
          try {
            const url = await uploadResumableVideo(item.file, worker.id,
              progress => replaceItem(item.id, { progress, status: 'uploading' }));
            item.url = url;
            replaceItem(item.id, { url, status: 'uploaded', progress: 100 });
          } catch (e) {
            replaceItem(item.id, { status: 'failed', error: e.message || 'Upload failed' });
            throw Error('Video upload failed. Retry ' + (item.file?.name || '') + ' individually.');
          }
        }
        if (item.thumbBlob) {
          replaceItem(item.id, { status: 'thumbnail', error: '' });
          try {
            const thumbnail = await uploadVideoThumbnail(item.thumbBlob, worker.id);
            item.thumbnail = thumbnail;
            item.thumbBlob = null;
            replaceItem(item.id, { thumbnail, thumbBlob: null, status: 'uploaded' });
          } catch (e) {
            replaceItem(item.id, { status: 'failed', error: e.message || 'Thumbnail failed' });
            throw Error('Thumbnail upload failed. Retry this item.');
          }
        }
        complete.push({ video: item.url, thumbnail: item.thumbnail, duration: item.duration });
      }
      const saved = await onSave(complete);
      // Previous media is only deleted after the new DB record has committed.
      const originals = savedRef.current;
      const live = new Set(complete.flatMap(x => [x.video, x.thumbnail]));
      const removable = originals.flatMap(x => [x.video, x.thumbnail]).filter(url => url && !live.has(url));
      savedRef.current = Array.isArray(saved) ? saved : complete;
      for (const item of itemsRef.current) { release(item.file && item.preview); release(item.thumbPreview); }
      setItems(savedItems(savedRef.current));
      setDirty(false);
      if (removable.length) {
        const failures = await Promise.allSettled(removable.map(url => deleteWorkerFile(url)));
        if (failures.some(x => x.status === 'rejected')) setNotice('Saved. Some old media cleanup needs review; no media was deleted before save.');
      }
    } catch (e) { setNotice(e.message || 'Save failed. Existing saved videos have not changed.'); }
    finally { setBusy(false); }
  };
  const retry = id => { replaceItem(id, { status: 'pending', error: '', progress: 0 }); void saveAll(); };
  return (
    <section className={css.root}>
      <div className={css.heading}>
        <h3>Work Videos</h3>
        <label className={css.button} aria-label="Add videos">
          + Add Videos (1–4)
          <input style={{ display: 'none' }} type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
            multiple onChange={appendFiles} disabled={busy || saving}/>
        </label>
      </div>
      <p className={css.hint}>
        Gallery cards 3:4; tap opens the original video. Choose a frame from each video, then Save All.
        Select multiple in Gallery/File Manager or add one at a time. No automatic FREE/PRO blocking.
      </p>
      <div className={css.grid}>
        {items.map((item, i) => (
          <div key={item.id} data-video-index={i} className={css.card}
            style={dragging === i ? { outline: '2px solid #002d97' } : undefined}
            onTouchStart={e => startTouch(e, i)} onTouchMove={movingTouch} onTouchEnd={endTouch} onTouchCancel={endTouch}
            draggable={!busy} onDragStart={e => { e.dataTransfer.setData('text/plain', String(i)); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); move(Number(e.dataTransfer.getData('text/plain')), i); }}>
            <div className={css.preview}>
              {(item.thumbPreview || item.thumbnail) ?
                <img alt={'Video thumbnail ' + (i + 1)} src={item.thumbPreview || item.thumbnail}/> :
                <video muted playsInline preload="metadata" src={item.preview || item.url}/>}
              <span className={css.badge}>{item.duration}</span>
            </div>
            <div className={css.cardContent}>
              <p className={css.filename}>{item.file?.name || 'Saved video ' + (i + 1)}</p>
              <p className={css.sub}>
                {item.status === 'uploading' ? 'Uploading ' + item.progress + '%' :
                  item.status === 'thumbnail' ? 'Uploading thumbnail…' :
                  item.status === 'failed' ? 'Failed — retry' :
                  item.status === 'saved' ? 'Saved' : item.url ? 'Uploaded (unsaved)' : 'Ready'}
              </p>
              {item.status === 'uploading' && <div className={css.progress}><span style={{ width: item.progress + '%' }}/></div>}
              {item.error && <p className={css.error} role="alert">{item.error}</p>}
              <div className={css.smallButtons}>
                <button type="button" disabled={busy || saving} onClick={() => setEditing(item.id)}>Choose Thumbnail</button>
                <button type="button" disabled={busy || saving || i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">↑</button>
                <button type="button" disabled={busy || saving || i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">↓</button>
                <button type="button" disabled={busy || saving} onClick={() => remove(item.id)}>Remove</button>
                {item.status === 'failed' && <button type="button" disabled={busy || saving} onClick={() => { replaceItem(item.id, { status: 'pending', error: '' }); void saveAll(); }}>Retry</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {notice && <p className={css.error} role="alert">{notice}</p>}
      <div className={css.savebar}>
        <button className={css.primary} type="button" onClick={saveAll} disabled={!dirty || busy || saving}>
          {busy || saving ? 'Saving Videos…' : 'Save All Videos'}
        </button>
        {dirty && <span className={css.hint}>Unsaved changes — original public profile unchanged.</span>}
        {saveMessage && <span className={css.success}>{saveMessage}</span>}
        {saveError && <span className={css.error}>{saveError}</span>}
      </div>
      {editing && <VideoThumbnailEditor
        src={items.find(item => item.id === editing)?.preview || ''}
        onClose={() => setEditing(null)}
        onConfirm={blob => prepareThumb(editing, blob)}
      />}
    </section>
  );
}
