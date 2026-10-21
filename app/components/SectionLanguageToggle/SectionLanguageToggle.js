"use client";

import styles from "./SectionLanguageToggle.module.css";

export default function SectionLanguageToggle({ language, onChange, englishAvailable = false, label }) {
  return (
    <div className={styles.toggle} role="group" aria-label={`${label} language`}>
      <button
        type="button"
        className={`${styles.option} ${language === "hi" ? styles.selected : ""}`}
        aria-pressed={language === "hi"}
        onClick={() => onChange("hi")}
        lang="hi"
      >
        हिंदी
      </button>
      <button
        type="button"
        className={`${styles.option} ${language === "en" ? styles.selected : ""}`}
        aria-pressed={language === "en"}
        disabled={!englishAvailable}
        title={!englishAvailable ? "English content has not been added yet" : undefined}
        onClick={() => onChange("en")}
        lang="en"
      >
        English
      </button>
    </div>
  );
}
