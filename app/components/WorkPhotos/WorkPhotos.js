"use client";

import { useState } from "react";

import Link from "next/link";

import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {
  
 const [selectedImage, setSelectedImage] = useState(null);
  
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
  <div
    className={styles.viewer}
    onClick={() => setSelectedImage(null)}
  >
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
