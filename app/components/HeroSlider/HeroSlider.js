'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './HeroSlider.module.css';

const ImagePreview = dynamic(() => import('../ImagePreview/ImagePreview'), {
  ssr: false,
});

const DEFAULT_SLIDES = [
  { image: '/images/worker-1.avif' },
  { image: '/images/worker-2.avif' },
  { image: '/images/worker-3.avif' },
];

export default function HeroSlider({ slides = DEFAULT_SLIDES, workerName = 'Worker' }) {
  // Check if slides array is empty, fallback to DEFAULT_SLIDES for safety
  const safeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  const originalSlides = safeSlides.map((slide) => {
    if (typeof slide === 'string') return { image: slide };
    return { image: slide.image || slide.url };
  });

  const totalOriginal = originalSlides.length;

  // Infinite loop cloned array: [Last, ...Originals, First]
  const extendedSlides = [
    originalSlides[totalOriginal - 1],
    ...originalSlides,
    originalSlides[0],
  ];

  // Start at index 1 (First real slide)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Guard lock to prevent rapid spam-swiping breaking the track index
  const isAnimatingRef = useRef(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 40;

  // Real active index for indicators (0, 1, 2)
  const activeDotIndex = (currentIndex - 1 + totalOriginal) % totalOriginal;

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Handle seamless infinite reset after transition ends
  const handleTransitionEnd = () => {
    isAnimatingRef.current = false;

    if (currentIndex === extendedSlides.length - 1) {
      // Reached cloned first slide -> jump to real first slide seamlessly
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached cloned last slide -> jump to real last slide seamlessly
      setIsTransitioning(false);
      setCurrentIndex(totalOriginal);
    }
  };

  // Dynamic timing: First image = 5000ms, Others = 3000ms
  useEffect(() => {
    if (isPreviewOpen || totalOriginal <= 1) return;

    const currentSlideDelay = activeDotIndex === 0 ? 5000 : 3000;

    const timer = setTimeout(() => {
      handleNext();
    }, currentSlideDelay);

    return () => clearTimeout(timer);
  }, [handleNext, isPreviewOpen, totalOriginal, activeDotIndex]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (totalOriginal <= 1) return; // Prevent unnecessary swipe if only 1 slide exists

    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  };

  return (
    <>
      <div
        className={styles.sliderContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsPreviewOpen(true)}
      >
        <div
          className={styles.sliderTrack}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
        >
          {extendedSlides.map((slide, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={slide.image}
                alt={`${workerName} image ${index}`}
                className={styles.slideImage}
                loading={index === 1 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* FLOATING LIQUID DOT INDICATOR */}
        {totalOriginal > 1 && (
          <div className={styles.indicatorContainer}>
            {originalSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === activeDotIndex ? styles.activeDot : ''
                }`}
                onClick={(e) => handleDotClick(e, index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {isPreviewOpen && (
        <ImagePreview
          slides={originalSlides}
          initialIndex={activeDotIndex}
          workerName={workerName}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}
