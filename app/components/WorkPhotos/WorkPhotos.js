"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {
  const images = [
    "/images/work1.png",
    "/images/work2.png",
    "/images/work3.png",
    "/images/work4.png",
    "/images/work5.png",
    "/images/work6.png",
  ];

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);

  // Gesture tracking refs
  const lastTapRef = useRef(0);
  const touchStartRef = useRef([]);
  const initialPinchDistRef = useRef(0);
  const initialScaleRef = useRef(1);
  const pinchFocalRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (viewerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      resetZoom();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [viewerOpen]);

  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const openViewer = (index) => {
    setCurrentIndex(index);
    resetZoom();
    setIsClosing(false);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    resetZoom();
    setIsClosing(true);
    setTimeout(() => {
      setViewerOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const clampPosition = (newX, newY, targetScale) => {
    if (!imageRef.current || targetScale <= 1) return { x: 0, y: 0 };

    const rect = imageRef.current.getBoundingClientRect();
    const currentWidth = rect.width / scale;
    const currentHeight = rect.height / scale;

    const scaledWidth = currentWidth * targetScale;
    const scaledHeight = currentHeight * targetScale;

    const maxPanX = Math.max(0, (scaledWidth - currentWidth) / 2);
    const maxPanY = Math.max(0, (scaledHeight - currentHeight) / 2);

    const clampedX = Math.min(Math.max(newX, -maxPanX), maxPanX);
    const clampedY = Math.min(Math.max(newY, -maxPanY), maxPanY);

    return { x: clampedX, y: clampedY };
  };

  const handleTouchStart = (e) => {
    const touches = e.touches;
    touchStartRef.current = Array.from(touches);

    if (touches.length === 1) {
      const now = Date.now();
      const touch = touches[0];
      const timeDiff = now - lastTapRef.current;

      if (timeDiff < 300 && timeDiff > 0) {
        e.preventDefault();
        handleDoubleTap(touch);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        posStartRef.current = { ...position };
      } else {
        isSwipingRef.current = false;
        touchStartX.current = touch.clientX;
        touchEndX.current = touch.clientX;
      }
    } else if (touches.length === 2) {
      isDraggingRef.current = false;
      const dist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialScaleRef.current = scale;
      initialPosRef.current = { ...position };

      const midX = (touches[0].clientX + touches[1].clientX) / 2 - window.innerWidth / 2;
      const midY = (touches[0].clientY + touches[1].clientY) / 2 - window.innerHeight / 2;
      pinchFocalRef.current = { x: midX, y: midY };
    }
  };

  const handleTouchMove = (e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      if (scale > 1 && isDraggingRef.current) {
        e.preventDefault();
        setIsZoomAnimating(false);
        const deltaX = touches[0].clientX - dragStartRef.current.x;
        const deltaY = touches[0].clientY - dragStartRef.current.y;

        const rawX = posStartRef.current.x + deltaX;
        const rawY = posStartRef.current.y + deltaY;

        const clamped = clampPosition(rawX, rawY, scale);
        setPosition(clamped);
      } else if (scale === 1) {
        isSwipingRef.current = true;
        touchEndX.current = touches[0].clientX;
      }
    } else if (touches.length === 2) {
      e.preventDefault();
      setIsZoomAnimating(false);

      const dist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );

      if (initialPinchDistRef.current > 0) {
        const factor = dist / initialPinchDistRef.current;
        let targetScale = Math.min(Math.max(1, initialScaleRef.current * factor), 3);

        if (targetScale === 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          const scaleChange = targetScale - initialScaleRef.current;
          const rawX = initialPosRef.current.x - pinchFocalRef.current.x * (scaleChange / (initialScaleRef.current || 1));
          const rawY = initialPosRef.current.y - pinchFocalRef.current.y * (scaleChange / (initialScaleRef.current || 1));

          const clamped = clampPosition(rawX, rawY, targetScale);
          setScale(targetScale);
          setPosition(clamped);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }

    if (scale < 1.05) {
      setIsZoomAnimating(true);
      resetZoom();
    }

    if (scale === 1 && isSwipingRef.current) {
      const distance = touchStartX.current - touchEndX.current;

      if (Math.abs(distance) >= 80) {
        if (distance > 80 && currentIndex < images.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else if (distance < -80 && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      }

      touchStartX.current = 0;
      touchEndX.current = 0;
      isSwipingRef.current = false;
    }
  };

  const handleDoubleTap = (touch) => {
    setIsZoomAnimating(true);

    if (scale > 1.1) {
      resetZoom();
    } else {
      const targetScale = 2.5;

      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const tapY = touch.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = (centerX - tapX) * (targetScale - 1);
        const offsetY = (centerY - tapY) * (targetScale - 1);

        const clamped = clampPosition(offsetX, offsetY, targetScale);
        setScale(targetScale);
        setPosition(clamped);
      } else {
        setScale(targetScale);
      }
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <svg className={styles.backArrow} viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5L8 12L15 19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className={styles.headerText}>
          <h2>Work Gallery</h2>
          <p>Professional work photos.</p>
        </div>
      </div>

      <div className={styles.gallery}>
        {images.map((image, index) => (
          <div
            key={index}
            className={styles.photoItem}
            onClick={() => openViewer(index)}
          >
            <img src={image} alt={`Work ${index + 1}`} />
          </div>
        ))}
      </div>

      {viewerOpen && (
        <div
          className={`${styles.viewer} ${
            isClosing ? styles.viewerClosing : styles.viewerActive
          }`}
        >
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>

          <button
            className={styles.closeButton}
            onClick={closeViewer}
            aria-label="Close"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            ref={containerRef}
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
              {images.map((image, index) => {
                const isCurrent = index === currentIndex;

                return (
                  <div key={index} className={styles.slide}>
                    <img
                      ref={isCurrent ? imageRef : null}
                      src={image}
                      alt={`Work ${index + 1}`}
                      className={styles.viewerImage}
                      draggable={false}
                      style={
                        isCurrent
                          ? {
                              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
                              transition: isZoomAnimating
                                ? "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)"
                                : "none",
                            }
                          : {}
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`${styles.arrow} ${styles.leftArrow} ${
              currentIndex === 0 ? styles.disabled : ""
            }`}
            onClick={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19L8 12L15 5"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            className={`${styles.arrow} ${styles.rightArrow} ${
              currentIndex === images.length - 1 ? styles.disabled : ""
            }`}
            onClick={() => currentIndex < images.length - 1 && setCurrentIndex((p) => p + 1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5L16 12L9 19"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
