"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {
  
 const [selectedImage, setSelectedImage] = useState(null);
  
const images = [
  "/images/work1.png",
  "/images/work2.png",
  "/images/work3.png",
  "/images/work4.png",
  "/images/work5.png",
  "/images/work6.png",
];

const [currentIndex, setCurrentIndex] = useState(0);
const [previousImage, setPreviousImage] = useState(null);

  
const [touchStart, setTouchStart] = useState(null); 
const [touchEnd, setTouchEnd] = useState(null);
  
const [direction, setDirection] = useState(""); 
  
  const handleSwipe = () => {
  if (!touchStart || !touchEnd) return;

  const distance = touchStart - touchEnd;

// Left swipe (next image)
if (distance > 50) {

  if (currentIndex < images.length - 1) {

    setDirection("left");

    const nextIndex = currentIndex + 1;

    setPreviousImage(selectedImage);
    
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  }
}

// Right swipe (previous image)
if (distance < -50) {

  if (currentIndex > 0) {

    setDirection("right");

    const prevIndex = currentIndex - 1;

    setPreviousImage(selectedImage);
    
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  }
}

  setTouchStart(null);
  setTouchEnd(null);
};
  
  useEffect(() => {
  if (selectedImage) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [selectedImage]);
  
  return (
    
    <section className={styles.wrapper}>

      <div className={styles.header}>

        <Link href="/" className={styles.backLink}>
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
      onClick={() => {
        setCurrentIndex(index);
        setSelectedImage(image);
      }}
    >
      <img
        src={image}
        alt={`Work Photo ${index + 1}`}
      />
    </div>
  ))}

</div>


{selectedImage && (
  <div
  className={styles.viewer}
  onTouchStart={(e) => {
    setTouchStart(e.targetTouches[0].clientX);
  }}
  onTouchMove={(e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }}
  onTouchEnd={handleSwipe}
>

    <button
  className={styles.closeButton}
  onClick={() => setSelectedImage(null)}
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

<img
  key={currentIndex}
  src={selectedImage}
  alt="Work Photo"
  className={`${styles.viewerImage} ${
    direction === "left"
      ? styles.slideLeft
      : direction === "right"
      ? styles.slideRight
      : ""
  }`}
/>
  
  </div>
)}

  
    </section>
  );
}
