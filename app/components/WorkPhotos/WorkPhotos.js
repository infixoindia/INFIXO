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

  const [currentIndex, setCurrentIndex]  useState(0);
  
  const [zoom, setZoom] = useState(1);

  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const pinchStart = useRef(null);

  const lastTap = useRef(0);
  
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

  setOffset({ x: 0, y: 0 });

  pinchStart.current = null;

  setViewerOpen(true);

};

  const closeViewer = () => {

  setViewerOpen(false);

  setZoom(1);

  setOffset({ x: 0, y: 0 });

  pinchStart.current = null;

};

  const handleTouchStart = (e) => {

  // pinch start
  if (e.touches.length === 2) {

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    pinchStart.current = {
      distance: Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      ),
      zoom
    };

    return;
  }

  // normal swipe
  isDragging.current = false;

  setTouchStartX(e.touches[0].clientX);

  setTouchEndX(e.touches[0].clientX);

};
  

const handleTouchMove = (e) => {

  // Pinch Zoom
  if (e.touches.length === 2 && pinchStart.current) {

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const newDistance = Math.hypot(
      t2.clientX - t1.clientX,
      t2.clientY - t1.clientY
    );

    let newZoom =
      pinchStart.current.zoom *
      (newDistance / pinchStart.current.distance);

    newZoom = Math.max(1, Math.min(4, newZoom));

    setZoom(newZoom);

    return;
  }

  // Swipe
  isDragging.current = true;

  setTouchEndX(e.touches[0].clientX);

};
  

const handleTouchEnd = () => {
  
  pinchStart.current = null;
  
  if(!isDragging.current) {

    setTouchStartX(0);
    setTouchEndX(0);

    return;
  }


  const distance = touchStartX - touchEndX;


  // small movement = tap ignore
  if (Math.abs(distance) < 80) {

    setTouchStartX(0);
    setTouchEndX(0);

    return;
  }


  // left swipe = next image
  if (distance > 80) {

    if (currentIndex < images.length - 1) {

      setCurrentIndex((prev) => prev + 1);

    }

  }


  // right swipe = previous image
  if (distance < -80) {

    if (currentIndex > 0) {

      setCurrentIndex((prev) => prev - 1);

    }

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
