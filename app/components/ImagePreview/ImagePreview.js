'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ImagePreview.module.css';

export default function ImagePreview({
  slides = [],
  initialIndex = 0,
  workerName = 'Worker',
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleTouchStart = (e) => {
    isSwiping.current = false;
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    isSwiping.current = true;
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      setTouchStartX(0);
      setTouchEndX(0);
      return;
    }

    const distance = touchStartX - touchEndX;

    // Small movement ignore threshold
    if (Math.abs(distance) < 50) {
      setTouchStartX(0);
      setTouchEndX(0);
      isSwiping.current = false;
      return;
    }

    // Left swipe -> Next image (Bounded)
    if (distance > 50 && currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }

    // Right swipe -> Previous image (Bounded)
    if (distance < -50 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    setTouchStartX(0);
    setTouchEndX(0);
    isSwiping.current = false;
  };

  return (
    <div className={styles.viewer}>
      <div className={styles.imageCounter}>
        {currentIndex + 1} / {slides.length}
      </div>

      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={styles.sliderViewport}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.sliderTrack}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={typeof slide === 'string' ? slide : slide.image}
                alt={`${workerName} preview ${index + 1}`}
                className={styles.viewerImage}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${styles.arrow} ${styles.leftArrow} ${
          currentIndex === 0 ? styles.disabled : ''
        }`}
        onClick={() => currentIndex > 0 && setCurrentIndex((prev) => prev - 1)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 5L8 12L15 19"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className={`${styles.arrow} ${styles.rightArrow} ${
          currentIndex === slides.length - 1 ? styles.disabled : ''
        }`}
        onClick={() =>
          currentIndex < slides.length - 1 && setCurrentIndex((prev) => prev + 1)
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5L16 12L9 19"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
