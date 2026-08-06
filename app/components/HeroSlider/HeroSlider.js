'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './HeroSlider.module.css';

// Future-Ready: Connect with Supabase or props easily
const DEFAULT_IMAGES = [
  '/images/worker-1.avif',
  '/images/worker-2.avif',
  '/images/worker-3.avif',
];

export default function HeroSlider({ images = DEFAULT_IMAGES, workerName = 'Worker' }) {
  const slideList = images && images.length > 0 ? images : DEFAULT_IMAGES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Touch Swipe State
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 40; // Minimum px distance for swipe detection

  // ----------------------------------------------------
  // 1. Preloading Next Image for Zero-Flicker Performance
  // ----------------------------------------------------
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % slideList.length;
    const img = new Image();
    img.src = slideList[nextIndex];
  }, [currentIndex, slideList]);

  // ----------------------------------------------------
  // 2. Auto-Slide Timer & Infinite Loop Handling
  // ----------------------------------------------------
  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slideList.length);
  }, [slideList.length]);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slideList.length) % slideList.length);
  }, [slideList.length]);

  useEffect(() => {
    // 5 Seconds Auto-Slide Interval
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext, currentIndex]); // Reset timer whenever currentIndex changes (manual swipe/click)

  // ----------------------------------------------------
  // 3. Touch Swipe Handlers (Mobile First)
  // ----------------------------------------------------
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped Right -> Left (Next Slide)
        handleNext();
      } else {
        // Swiped Left -> Right (Prev Slide)
        handlePrev();
      }
    }
  };

  // ----------------------------------------------------
  // 4. Modal Full Preview Handlers
  // ----------------------------------------------------
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Track Wrapper inside Hero */}
      <div
        className={styles.sliderContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={openModal}
      >
        <div
          className={styles.sliderTrack}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
        >
          {slideList.map((imgUrl, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={imgUrl}
                alt={`${workerName} image ${index + 1}`}
                className={styles.slideImage}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Full Preview Lightbox Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close Preview">
              ✕
            </button>
            <img
              src={slideList[currentIndex]}
              alt={`${workerName} full preview`}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </>
  );
}

