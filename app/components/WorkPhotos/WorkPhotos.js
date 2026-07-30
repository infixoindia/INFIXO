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
  
  const [zoom, setZoom] = useState(1);

const [translate, setTranslate] = useState({
  x: 0,
  y: 0,
});

const lastTapRef = useRef(0);

const pinchDistanceRef = useRef(0);

const startZoomRef = useRef(1);

const dragStartRef = useRef({
  x: 0,
  y: 0,
});

const translateStartRef = useRef({
  x: 0,
  y: 0,
});
  
  const [touchStartX, setTouchStartX] = useState(0);

  const [touchEndX, setTouchEndX] = useState(0);

  const isDragging = useRef(false);
  
  useEffect(() => {

    if (viewerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };

  }, [viewerOpen]);

  const openViewer = (index) => {

  setCurrentIndex(index);

  setZoom(1);

  setTranslate({
    x: 0,
    y: 0,
  });

  setViewerOpen(true);

};

  const closeViewer = () => {

  setViewerOpen(false);

  setZoom(1);

  setTranslate({
    x: 0,
    y: 0,
  });

};

  
  const handleTouchStart = (e) => {

  // Double tap
  if (e.touches.length === 1) {

    const now = Date.now();

    if (now - lastTapRef.current < 250) {

      if (zoom === 1) {

        setZoom(2);

      } else {

        setZoom(1);

        setTranslate({
          x: 0,
          y: 0,
        });

      }

    }

    lastTapRef.current = now;

  }


  // Pinch Start
  if (e.touches.length === 2) {

    const t1 = e.touches[0];

    const t2 = e.touches[1];

    pinchDistanceRef.current = Math.hypot(
      t2.clientX - t1.clientX,
      t2.clientY - t1.clientY
    );

    startZoomRef.current = zoom;

    return;

  }


  // Drag Start (only when zoomed)
  if (zoom > 1) {

    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    translateStartRef.current = {
      x: translate.x,
      y: translate.y,
    };

    return;

  }


  // Gallery Swipe
  isDragging.current = false;

  setTouchStartX(e.touches[0].clientX);

  setTouchEndX(e.touches[0].clientX);

};

  

const handleTouchMove = (e) => {

  // Pinch Zoom
  if (e.touches.length === 2) {

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const currentDistance = Math.hypot(
      t2.clientX - t1.clientX,
      t2.clientY - t1.clientY
    );

    let nextZoom =
      startZoomRef.current *
      (currentDistance / pinchDistanceRef.current);

    nextZoom = Math.max(1, Math.min(4, nextZoom));

    setZoom(nextZoom);

    return;

  }

  // Drag Image
  if (zoom > 1) {

    const dx =
      e.touches[0].clientX - dragStartRef.current.x;

    const dy =
      e.touches[0].clientY - dragStartRef.current.y;

    setTranslate({
      x: translateStartRef.current.x + dx,
      y: translateStartRef.current.y + dy,
    });

    return;

  }

  // Swipe Gallery
  isDragging.current = true;

  setTouchEndX(e.touches[0].clientX);

};
  

const handleTouchEnd = () => {

  pinchDistanceRef.current = 0;

  // Zoomed image → swipe mat chalao
  if (zoom > 1) {
    isDragging.current = false;
    return;
  }

  if (!isDragging.current) {

    setTouchStartX(0);
    setTouchEndX(0);

    return;
  }

  const distance = touchStartX - touchEndX;

  if (Math.abs(distance) < 80) {

    setTouchStartX(0);
    setTouchEndX(0);

    isDragging.current = false;

    return;
  }

  // Left swipe
  if (distance > 80 && currentIndex < images.length - 1) {

    setCurrentIndex((prev) => prev + 1);

  }

  // Right swipe
  if (distance < -80 && currentIndex > 0) {

    setCurrentIndex((prev) => prev - 1);

  }

  setTouchStartX(0);
  setTouchEndX(0);

  isDragging.current = false;

};


  
  return (

    <section className={styles.wrapper}>

      <div className={styles.header}>

        <Link
          href="/"
          className={styles.backLink}
        >

          <svg
            className={styles.backArrow}
            viewBox="0 0 24 24"
            fill="none"
          >
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

            <img
              src={image}
              alt={`Work ${index + 1}`}
            />

          </div>

        ))}

      </div>


{viewerOpen && (

  <div className={styles.viewer}>

  <div className={styles.imageCounter}>
  {currentIndex + 1} / {images.length}
  </div>
  
<button
  className={styles.closeButton}
  onClick={closeViewer}
  aria-label="Close"
>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
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
    transform: `translateX(-${currentIndex * 100}%)`
  }}
>

  {images.map((image, index) => (

    <div
      key={index}
      className={styles.slide}
    >

      <img
  src={image}
  alt={`Work ${index + 1}`}
  className={styles.viewerImage}
  draggable={false}
  style={{
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
    transition: isDragging.current ? "none" : "transform .25s ease"
  }}
/>

    </div>

  ))}

</div>

<div
  className={`${styles.arrow} ${styles.leftArrow} ${
    currentIndex === 0 ? styles.disabled : ""
  }`}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
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
    currentIndex === images.length - 1 ? styles.disabled : ""
  }`}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
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
</div>

)}

</section>

);

}
