'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Admin.module.css';
import photoStyles from './WorkPhotosEditor.module.css';
import { uploadWorkerFile, deleteWorkerFile } from '@/lib/storageService';
import { WORK_PHOTO_FRAME_RATIO, toWorkPhotoEntry, workPhotoCrop, workPhotoUrl } from '@/lib/workPhoto.mjs';
import PhotoCropper from './PhotoCropper';
import CroppedImage from '../CroppedImage/CroppedImage';
import { moveWorkPhoto } from '@/lib/workPhotoOrder.mjs';

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
  const [viewerId, setViewerId] = useState(null);
  const [dragVisual, setDragVisual] = useState(null);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const replaceInput = useRef(null);
  const busyRef = useRef(false);
  busyRef.current = busy || saving;
  const tempUrls = useRef(new Set());

  // Worker switching is rare, but never display another worker's staged photos.
  useEffect(() => {
    itemsRef.current = savedItems(worker.photos);
    setItems(itemsRef.current);
    setDirty(false);
    setCropId(null);
    setViewerId(null);
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


  // Touch long-press + drag (Android) and press/drag (mouse).
  // Leave browser scrolling untouched until the long-press timer fires.
  useEffect(() => {
    const finish = () => {
      const d = dragRef.current;
      if (!d) return;
      clearTimeout(d.timer);
      if (d.active) {
        suppressClick.current = true;
        setTimeout(() => { suppressClick.current = false; }, 450);
      }
      dragRef.current = null;
      setDragVisual(null);
    };
    const move = (x, y) => {
      const d = dragRef.current;
      if (!d?.active) return;
      setDragVisual({ id:d.id, src:d.src, x, y });
      const target = document.elementFromPoint(x, y)?.closest('[data-photo-id]')?.getAttribute('data-photo-id');
      if (!target || target === d.id || busyRef.current) return;
      const next = moveWorkPhoto(itemsRef.current, d.id, target);
      if (next === itemsRef.current) return;
      itemsRef.current = next; setItems(next); setDirty(true); setNotice('');
    };
    const touchMove = e => {
      const d=dragRef.current;
      if (!d || d.kind!=='touch') return;
      const t=[...e.touches].find(t=>t.identifier===d.pointer);
      if (!t) return;
      if (!d.active) {
        if (Math.hypot(t.clientX-d.startX,t.clientY-d.startY)>10) finish();
        return;
      }
      if(e.cancelable)e.preventDefault();
      move(t.clientX,t.clientY);
    };
    const touchEnd = e => {
      const d=dragRef.current;
      if(d?.kind==='touch' && [...e.changedTouches].some(t=>t.identifier===d.pointer))finish();
    };
    const pointerMove = e => {
      const d=dragRef.current;
      if(!d || d.kind!=='mouse')return;
      if(!(e.buttons & 1)){finish();return;}
      if(!d.active && Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>7)d.active=true;
      if(d.active)move(e.clientX,e.clientY);
    };
    const pointerUp = () => {if(dragRef.current?.kind==='mouse')finish();};
    document.addEventListener('touchmove',touchMove,{passive:false});
    document.addEventListener('touchend',touchEnd);
    document.addEventListener('touchcancel',touchEnd);
    document.addEventListener('pointermove',pointerMove);
    document.addEventListener('pointerup',pointerUp);
    document.addEventListener('pointercancel',pointerUp);
    window.addEventListener('blur',finish);
    return () => {
      finish();
      document.removeEventListener('touchmove',touchMove);
      document.removeEventListener('touchend',touchEnd);
      document.removeEventListener('touchcancel',touchEnd);
      document.removeEventListener('pointermove',pointerMove);
      document.removeEventListener('pointerup',pointerUp);
      document.removeEventListener('pointercancel',pointerUp);
      window.removeEventListener('blur',finish);
    };
  }, []);

  useEffect(() => {
    if (!viewerId) return undefined;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const esc=e=>{if(e.key==='Escape' && !cropId)setViewerId(null);};
    document.addEventListener('keydown',esc);
    return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',esc);};
  },[viewerId,cropId]);

  const startDrag = (id,x,y,kind,pointer=null) => {
    if(busyRef.current || cropId || viewerId)return;
    const item=itemsRef.current.find(x=>x.id===id);
    if(!item)return;
    if(dragRef.current?.timer)clearTimeout(dragRef.current.timer);
    const d={id,src:item.preview,startX:x,startY:y,kind,pointer,active:false,timer:null};
    dragRef.current=d;
    if(kind==='touch')d.timer=window.setTimeout(()=>{
      if(dragRef.current!==d || busyRef.current)return;
      d.active=true;setDragVisual({id,src:item.preview,x,y});
    },320);
  };
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
    if (!file || busy) return false;
    const error = validateFile(file);
    if (error) { setNotice(error); return false; }
    const old = itemsRef.current.find(item => item.id === id);
    if (!old) return false;
    // A previous unsaved upload can be safely removed. Saved originals are
    // retained until the replacement's DB save is confirmed.
    discardUnsavedUpload(old);
    discardTemp(old);
    const preview = URL.createObjectURL(file);
    tempUrls.current.add(preview);
    change(prev => prev.map(item => item.id === id ? makeTemporaryItem(file, preview) : item));
    return true;
  };

  const removePhoto = id => {
    if (busy) return;
    const old = itemsRef.current.find(item => item.id === id);
    if (!old) return;
    discardUnsavedUpload(old);
    discardTemp(old);
    change(prev => prev.filter(item => item.id !== id));
    if (cropId === id) setCropId(null);
    if (viewerId === id) setViewerId(null);
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
  const viewed = viewerId ? items.find(item => item.id === viewerId) : null;
  const locked = busy || saving;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Work Photos</h3>
      <p className={styles.hint}>Photo par tap karke original dekhein. Long-press karke drag se order badlein. 3:4 Frame se sirf gallery thumbnail adjust hota hai.</p>
      <p className={styles.hint}>PRO: max 6 · FREE: max 2 · 4 MB/photo. Original image hamesha safe.</p>
      <p className={photoStyles.counter}>{items.length} / {MAX_WORK_PHOTOS} photos {dirty ? '· Unsaved changes' : '· Saved'}</p>
      <div className={styles.mediaGrid} aria-label="Long-press a work photo to reorder">
        {items.map((item,idx)=>(
          <div key={item.id} data-photo-id={item.id}
            className={styles.mediaItem+' '+photoStyles.photoCard+(dragVisual?.id===item.id?' '+photoStyles.dragSource:'')}
            role="button" tabIndex={0}
            aria-label={'View original work photo '+(idx+1)+'. Long-press to reorder.'}
            onClick={()=>{if(!locked && !suppressClick.current)setViewerId(item.id);}}
            onKeyDown={e=>{
              if((e.key==='Enter'||e.key===' ')&&!locked){e.preventDefault();setViewerId(item.id);}
              if(e.altKey && (e.key==='ArrowLeft'||e.key==='ArrowRight')&&!locked){
                e.preventDefault();const neighbour=items[idx+(e.key==='ArrowLeft'?-1:1)];
                if(neighbour)change(prev=>moveWorkPhoto(prev,item.id,neighbour.id));
              }
            }}
            onTouchStart={e=>{
              if(e.target.closest('button,input,label')||e.touches.length!==1)return;
              const t=e.touches[0];startDrag(item.id,t.clientX,t.clientY,'touch',t.identifier);
            }}
            onPointerDown={e=>{
              if(e.pointerType==='touch'||e.button!==0||e.target.closest('button,input,label'))return;
              startDrag(item.id,e.clientX,e.clientY,'mouse');
            }}
            onContextMenu={e=>{if(dragRef.current)e.preventDefault();}}
          >
            {item.crop
              ? <CroppedImage src={item.preview} crop={item.crop} alt={'Work photo '+(idx+1)} />
              : <img src={item.preview} alt={'Work photo '+(idx+1)} draggable={false} />}

            {/* Thumbnail X is REMOVE, always visible. Viewer has its own CLOSE X. */}
            <button type="button" className={styles.mediaRemoveBtn}
              onClick={e=>{e.stopPropagation();removePhoto(item.id);}}
              onTouchStart={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}
              disabled={locked} aria-label={'Remove photo '+(idx+1)} style={{zIndex:4}}>✕</button>

            {item.status==='uploading'&&(
              <div className={photoStyles.progressOverlay} role="status">
                <span className={photoStyles.progressPercent}>{item.progress}%</span>
                <div className={photoStyles.progressTrack}>
                  <div className={photoStyles.progressFill} style={{width:String(item.progress)+'%'}} />
                </div>
                <span className={photoStyles.progressCaption}>Uploading</span>
              </div>
            )}
            {item.status==='failed'&&(
              <div className={photoStyles.failedOverlay} role="status" onClick={e=>e.stopPropagation()}>
                <span>Upload failed</span>
                <button type="button" disabled={locked} onClick={e=>{e.stopPropagation();retry(item.id);}}>Retry</button>
              </div>
            )}
          </div>
        ))}
        {items.length<MAX_WORK_PHOTOS&&(
          <label className={styles.uploadBox+' '+photoStyles.addPhoto} aria-label="Select multiple work photos">
            {locked?'Please wait…':'+ Add Photos'}
            <input type="file" accept="image/*" multiple disabled={locked} onChange={addFiles} />
          </label>
        )}
      </div>
      <p className={styles.hint}>Android Files picker agar multiple select nahi kare, toh Add Photos dobara use karein. Pehle wali photos nahi hatengi.</p>
      {notice&&<p className={photoStyles.notice} role="status">{notice}</p>}
      <div className={styles.saveRow}>
        <button type="button" className={styles.btn+' '+styles.btnPrimary}
          onClick={saveAll} disabled={locked||!dirty}>
          {locked?'Uploading / Saving…':'Save All Photos'}
        </button>
        {saveMessage&&<span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError&&<span className={styles.saveMsgError}>{saveError}</span>}
      </div>

      {dragVisual&&(
        <div className={photoStyles.dragGhost} aria-hidden="true"
          style={{left:dragVisual.x,top:dragVisual.y}}>
          <img src={dragVisual.src} alt="" draggable={false} />
        </div>
      )}

      {viewed&&(
        <div className={photoStyles.viewer} role="dialog" aria-modal="true" aria-label="Original work photo">
          <header className={photoStyles.viewerHeader}>
            <span>Original photo · {items.findIndex(x=>x.id===viewed.id)+1} / {items.length}</span>
            <button type="button" className={photoStyles.viewerClose}
              onClick={()=>setViewerId(null)} aria-label="Close photo viewer">✕</button>
          </header>
          <div className={photoStyles.viewerCanvas}>
            <img src={viewed.preview} alt="Original work photo" draggable={false} />
          </div>
          <div className={photoStyles.viewerActions}>
            <button type="button" className={photoStyles.frameButton}
              onClick={()=>setCropId(viewed.id)} disabled={locked}>Frame</button>
            <button type="button" className={photoStyles.replaceButton}
              onClick={()=>replaceInput.current?.click()} disabled={locked}>Replace</button>
            <input ref={replaceInput} className={photoStyles.visuallyHidden} type="file"
              accept="image/*" onChange={e=>{if(replacePhoto(viewed.id,e))setViewerId(null);}} />
          </div>
        </div>
      )}
      {cropped&&(
        <PhotoCropper key={cropped.id} src={cropped.preview} initialCrop={cropped.crop}
          frameRatio={WORK_PHOTO_FRAME_RATIO} context="Work Gallery"
          onCancel={()=>setCropId(null)}
          onApply={crop=>{
            change(prev=>prev.map(item=>item.id===cropped.id?{...item,crop}:item));
            setCropId(null);
          }} />
      )}
    </div>
  );
}
