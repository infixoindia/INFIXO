import styles from "./VerifiedBadge.module.css";

export default function VerifiedBadge() {
  return (
    <div className={styles.badge}>

      <div className={styles.shield}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L20 5V11C20 16 16.8 20.3 12 22C7.2 20.3 4 16 4 11V5L12 2Z"
            fill="#FFFFFF"
          />
          <path
            d="M9.2 12.1L11.2 14.1L15.6 9.7"
            stroke="#18A34A"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span className={styles.text}>
        VERIFIED BY INFIXO
      </span>

      <div className={styles.stripes}></div>

    </div>
  );
}
