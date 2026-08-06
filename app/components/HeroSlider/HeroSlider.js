'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './HeroSlider.module.css';

// Fixed slides: Full 100% width coverage (zoom: 1) with clean vertical alignment
const DEFAULT_SLIDES = [
  {
    image: '/images/worker-1.avif',
    objectPosition: 'center 12%',
    zoom: 1,
  },
  {
    image: '/images/worker-2.avif',
    objectPosition: 'center 12%',
    zoom: 1,
  },
  {
    image: '/images/worker-3.avif',
    objectPosition: 'center 12%',
    zoom: 1,
  },
];

export default function HeroSlider({ slides = DEFAULT_SLIDES, workerName = 'Worker' }) {
  const slideList = slides.map((slide) => {
    if (typeof slide === 'string') {
      return { image: slide, objectPosition: 'center 12%', zoom: 1 };
    }
    return {
      image: slide.image || slide.url,
      objectPosition: slide.objectPosition || 'center 12%',
      zoom: slide.zoom ?? 1,
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 40;

  useEffect(() => {
    if (slideList.length <= 1) return;
    const nextIndex = (currentIndex + 1) % slideList.length;
    const img = new Image();
    img.src = slideList[nextIndex].image;
  }, [currentIndex, slideList]);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slideList.length);
  }, [slideList.length]);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slideList.length) % slideList.length);
  }, [slideList.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext, currentIndex]);

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
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
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
          {slideList.map((slide, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={slide.image}
                alt={`${workerName} image ${index + 1}`}
                className={styles.slideImage}
                style={{
                  objectPosition: slide.objectPosition,
                  transform: `scale(${slide.zoom})`,
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close Preview">
              ✕
            </button>
            <img
              src={slideList[currentIndex].image}
              alt={`${workerName} full preview`}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </>
  );
}
