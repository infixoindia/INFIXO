'use client';

import { useState } from 'react';
import styles from './WorkerIdentityCard.module.css';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';

const FALLBACK_PHOTO = '/images/worker-placeholder.png';

export default function WorkerIdentityCard({ worker }) {
  const {
    photoUrl,
    fullName,
    isVerified,
    profession,
    experience,
    serviceArea,
  } = worker;

  const [imgSrc, setImgSrc] = useState(photoUrl);

  return (
    <section className={styles.card}>

      {/* Photo Section */}
      <div className={styles.photoSection}>
        <img
          src={imgSrc}
          alt={fullName}
          className={styles.photo}
          onError={() => setImgSrc(FALLBACK_PHOTO)}
        />
      </div>

      {/* Wave */}
      <svg
        className={styles.wave}
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.wavePath}
          d="M0,18 C55,34 110,58 180,54 C255,50 315,8 400,20 L400,60 L0,60 Z"
        />
      </svg>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.name}>{fullName}</h1>

        <p className={styles.profession}>{profession}</p>

        <div className={styles.divider}></div>

        <div className={styles.infoBox}>
          <div className={styles.infoItem}>
            <span className={styles.infoIconWrap}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M3 12h18" />
              </svg>
            </span>

            <span className={styles.infoText}>
              <span className={styles.infoValue}>
                {experience}+ Years
              </span>

              <span className={styles.infoLabel}>
                Experience
              </span>
            </span>
          </div>

          <div className={styles.infoDivider}></div>

          <div className={styles.infoItem}>
            <span className={styles.infoIconWrap}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </span>

            <span className={styles.infoText}>
              <span className={styles.infoValue}>
                {serviceArea.join(', ')}
              </span>

              <span className={styles.infoLabel}>
                Service Area
              </span>
            </span>
          </div>
        </div>

        {isVerified && (
          <div className={styles.badgeWrap}>
            <VerifiedBadge />
          </div>
        )}
      </div>
    </section>
  );
          }
