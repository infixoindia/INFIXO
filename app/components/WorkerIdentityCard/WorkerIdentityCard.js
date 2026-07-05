'use client';

import { useState } from 'react';
import styles from './WorkerIdentityCard.module.css';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';

const FALLBACK_PHOTO = '/images/worker-placeholder.png';

export default function WorkerIdentityCard({ worker }) {
  const { photoUrl, fullName, isVerified, profession, experience, serviceArea } = worker;
  const [imgSrc, setImgSrc] = useState(photoUrl);

  return (
    <section className={styles.card}>
      <img
        src={imgSrc}
        alt={fullName}
        className={styles.photo}
        onError={() => setImgSrc(FALLBACK_PHOTO)}
      />

      <h1 className={styles.name}>{fullName}</h1>
      <p className={styles.profession}>{profession}</p>
      <p className={styles.experience}>{experience}+ Years Experience</p>
      <p className={styles.serviceArea}>{serviceArea.join(', ')}</p>

      {isVerified && (
        <div className={styles.badgeWrap}>
          <VerifiedBadge />
        </div>
      )}
    </section>
  );
}
