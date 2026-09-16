'use client';

import { useEffect, useState } from 'react';
import styles from './WorkerIdentityCard.module.css';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import HeroSlider from '../HeroSlider/HeroSlider';

function WorkerIdIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M12 9h6M12 13h4" />
    </svg>
  );
}

export default function WorkerIdentityCard({ worker }) {
  const {
    fullName,
    profession,
    experience,
    serviceArea,
    isVerified,
    heroSlides,
    workerId,
  } = worker;

  const [isWorkerIdOpen, setIsWorkerIdOpen] = useState(false);

  const toggleWorkerId = (e) => {
    e.stopPropagation();
    setIsWorkerIdOpen((open) => !open);
  };

  // Automatically close the Worker ID panel after 5 seconds.
  useEffect(() => {
    if (!isWorkerIdOpen) return undefined;

    const timer = setTimeout(() => {
      setIsWorkerIdOpen(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isWorkerIdOpen]);

  const closeWorkerId = () => setIsWorkerIdOpen(false);

  return (
    <section className={styles.card} onClick={closeWorkerId}>
      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <HeroSlider slides={heroSlides} workerName={fullName} />

        <div className={styles.pattern}></div>

        <svg
          className={styles.wave}
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
        >
          <path
            className={styles.wavePath}
            d="M0,0
Q45,10 90,24
Q128,62 165,62
Q195,64 230,62
Q275,62 310,24
Q355,10 400,0
L400,70
L0,70
Z"
          />
        </svg>

        {/* ================= WORKER ID ================= */}
        {workerId && (
          <>
            {!isWorkerIdOpen && (
              <button
                type="button"
                className={styles.workerIdButton}
                data-worker-id-control="true"
                onClick={toggleWorkerId}
                aria-label={`Show Worker ID ${workerId}`}
              >
                <WorkerIdIcon />
                <span>ID</span>
              </button>
            )}

            {isWorkerIdOpen && (
              <div
                className={styles.workerIdCloseLayer}
                data-worker-id-control="true"
                onClick={closeWorkerId}
                aria-hidden="true"
              />
            )}

            <button
              type="button"
              className={`${styles.workerIdTab} ${isWorkerIdOpen ? styles.workerIdTabOpen : ''}`}
              data-worker-id-control="true"
              onClick={toggleWorkerId}
              aria-label={isWorkerIdOpen ? 'Hide Worker ID' : `Show Worker ID ${workerId}`}
            >
              <span className={styles.workerIdTabText}>
                ID: {workerId}
              </span>
            </button>
          </>
        )}
      </div>

      {/* ================= WHITE PANEL ================= */}
      <div className={styles.whitePanel}>
        <div className={styles.content}>
          <h1 className={styles.name}>{fullName}</h1>
          <p className={styles.profession}>{profession}</p>
          <div className={styles.divider}>
            <span aria-hidden="true">&#9660;</span>
          </div>

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
                <span className={styles.infoValue}>{experience}+ Years</span>
                <span className={styles.infoLabel}>Experience</span>
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
