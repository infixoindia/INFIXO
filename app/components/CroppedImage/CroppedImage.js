'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { layoutCrop, validCrop } from '@/lib/photoCrop';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Shows the ORIGINAL image through the saved crop (position + zoom).
// Without a valid crop it renders exactly the plain <img> used before.
export default function CroppedImage({ src, crop, alt = '', className, loading }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  const ok = validCrop(crop);

  useIsoLayoutEffect(() => {
    if (!ok || !ref.current) return undefined;
    const el = ref.current;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h) setBox(prev => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ok]);

  if (!ok) return <img src={src} alt={alt} className={className} loading={loading} />;

  const l = box ? layoutCrop(box.w, box.h, crop) : null;
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {l ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          draggable={false}
          style={{ position: 'absolute', left: l.left, top: l.top, width: l.width, height: l.height, maxWidth: 'none', maxHeight: 'none', display: 'block' }}
        />
      ) : (
        <img src={src} alt={alt} className={className} loading={loading} />
      )}
    </div>
  );
}
