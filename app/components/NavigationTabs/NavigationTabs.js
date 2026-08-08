'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { supabase } from '@/lib/supabaseClient';
import styles from './NavigationTabs.module.css';

export default function NavigationTabs() {
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Work Photos count
        const { count: photos } = await supabase
          .from('work_photos')
          .select('*', { count: 'exact', head: true });

        // Work Videos count
        const { count: videos } = await supabase
          .from('work_videos')
          .select('*', { count: 'exact', head: true });

        if (photos !== null) setPhotoCount(photos);
        if (videos !== null) setVideoCount(videos);
      } catch (err) {
        console.error('Error fetching counts:', err);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className={styles.grid}>
      {/* Work Details */}
      <Link href="/work-details" className={`${styles.card} ${styles.blue}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Details</span>
        </div>
      </Link>

      {/* Worker Details */}
      <Link href="/worker-details" className={`${styles.card} ${styles.orange}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="#EA580C">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Worker</span>
          <span>Details</span>
        </div>
      </Link>

      {/* Work Photos */}
      <Link href="/work-photos" className={`${styles.card} ${styles.green}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="#059669" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Photos</span>
        </div>
        <div className={styles.badge}>
          <span>{photoCount}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      </Link>

      {/* Work Videos */}
      <Link href="/work-videos" className={`${styles.card} ${styles.purple}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="#9333EA">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <polygon points="10,8 16,12 10,16" fill="#FFF" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Videos</span>
        </div>
        <div className={styles.badge}>
          <span>{videoCount}</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </div>
      </Link>
    </div>
  );
}
