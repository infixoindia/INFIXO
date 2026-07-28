"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {
  
 const [selectedImage, setSelectedImage] = useState(null);
  
  const images = [
  "/images/work1.png",
  "/images/work1.png",
  "/images/work1.png",
  "/images/work1.png",
  "/images/work1.png",
  "/images/work1.png",
];

const [currentIndex, setCurrentIndex] = useState(0);
  
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

  <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

  <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

    <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

    <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

    <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

    <div
  className={styles.photoItem}
  onClick={() => setSelectedImage("/images/work1.png")}
>
  <img src="/images/work1.png" alt="Work Photo" />
</div>

</div>


{selectedImage && (
  <div className={styles.viewer}>

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
      src={selectedImage}
      alt="Work Photo"
      className={styles.viewerImage}
    />

  </div>
)}

  
    </section>
  );
}
