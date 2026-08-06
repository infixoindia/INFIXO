'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ImagePreview.module.css';

export default function ImagePreview({
  slides,
  initialIndex = 0,
  workerName = 'Worker',
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);

  // Drag / Swipe / Pinch Refs
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const dragTranslate = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const initialPinchDistance = useRef(null);
  const initialPinchScale = useRef(1);
  const modalRef = useRef(null);

  const totalSlides = slides.length;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose]);

  const handleNext = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // 1. Keyboard Navigation & Scroll Lock
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus management for accessibility
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, handleNext, handlePrev]);

  // 2. Double Tap / Pinch Zoom / Swipe Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch Zoom Start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistance.current = dist;
      initialPinchScale.current = scale;
      return;
    }

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double Tap Zoom
        if (scale > 1) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
      }
      lastTap.current = now;

      isDragging.current = true;
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragTranslate.current = { ...translate };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance.current) {
      // Pinch Zooming
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDistance.current;
      const newScale = Math.min(Math.max(initialPinchScale.current * factor, 1), 3);
      setScale(newScale);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
      return;
    }

    if (!isDragging.current || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - startPos.current.x;
    const deltaY = e.touches[0].clientY - startPos.current.y;

    if (scale > 1) {
      setTranslate({
        x: dragTranslate.current.x + deltaX,
        y: dragTranslate.current.y + deltaY,
      });
    }
  };

  const handleTouchEnd = (e) => {
    initialPinchDistance.current = null;

    if (!isDragging.current) return;
    isDragging.current = false;

    if (scale === 1 && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - startPos.current.x;
      if (deltaX < -50) handleNext();
      if (deltaX > 50) handlePrev();
    }
  };

  // 3. Mouse Drag Support
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    dragTranslate.current = { ...translate };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || scale <= 1) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setTranslate({
      x: dragTranslate.current.x + deltaX,
      y: dragTranslate.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={modalRef}
      className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {/* Top Header Controls */}
      <div className={styles.header} onClick={(e) => e.stopPropagation()}>
        <div className={styles.counter}>
          {currentIndex + 1} / {totalSlides}
        </div>
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close Preview"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className={styles.imageStage}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          src={slides[currentIndex].image}
          alt={`${workerName} preview ${currentIndex + 1}`}
          className={styles.previewImage}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isDragging.current ? 'none' : 'transform 0.25s ease-out',
          }}
          draggable={false}
        />
      </div>

      {/* Desktop Navigation Arrows */}
      <button
        className={`${styles.navBtn} ${styles.prevBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label="Previous Image"
      >
        &#10094;
      </button>

      <button
        className={`${styles.navBtn} ${styles.nextBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next Image"
      >
        &#10095;
      </button>
    </div>
  );
}
