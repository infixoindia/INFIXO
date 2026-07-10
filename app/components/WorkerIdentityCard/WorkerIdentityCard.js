'use client';

import { useState } from 'react';
import styles from './WorkerIdentityCard.module.css';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';

const FALLBACK_PHOTO = '/images/worker-placeholder.png';

export default function WorkerIdentityCard({ worker }) {
  const {
    photoUrl,
    fullName,
    profession,
    experience,
    serviceArea,
    isVerified,
  } = worker;

  const [imgSrc, setImgSrc] = useState(photoUrl);

  return (
    <section className={styles.card}>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
  <div className={styles.heroBackground}></div>
  <div className={styles.pattern}></div>

  <img
    src={imgSrc}
    alt={fullName}
    className={styles.photo}
    onError={() => setImgSrc(FALLBACK_PHOTO)}
  />

  <svg
  className={styles.wave}
  viewBox="0 0 400 70"
  preserveAspectRatio="none"
>
  <path
    className={styles.wavePath}
    d="M0,0
       Q45,10 90,24
       Q130,62 170,62
       Q230,62
       Q270,62 310,24
       Q355,10 400,0
       L400,70
       L0,70
       Z"
</svg>
</div>

      {/* ================= WHITE PANEL ================= */}
      <div className={styles.whitePanel}>
  
        <div className={styles.content}>
          <h1 className={styles.name}>{fullName}</h1>
          <p className={styles.profession}>{profession}</p>
          <div className={styles.divider}></div>

          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoIconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M3 12h18" />
                </svg>
              </span>
              <span className={styles.infoText}>
                <span className={styles.infoValue}>{experience}+ Years</span>
                <span className={styles.infoLabel}>Experience</span>
              </span>
            </div>

            <div className={styles.infoDivider}></div>

            <div className={styles.infoItem}>
              <span className={styles.infoIconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </span>
              <span className={styles.infoText}>
                <span className={styles.infoValue}>{serviceArea.join(', ')}</span>
                <span className={styles.infoLabel}>Service Area</span>
              </span>
            </div>
          </div>

          {isVerified && (
            <div className={styles.badgeWrap}>
              <VerifiedBadge />
            </div>
          )}
        </div>
      </div>
    </section>
  );
        }
