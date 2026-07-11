import styles from './VerifiedBadge.module.css';

export default function VerifiedBadge() {
  return (
    <div className={styles.badge}>

      <div className={styles.shield}>
        🛡
      </div>

      <div className={styles.text}>
        VERIFIED BY <span>INFIXO</span>
      </div>

    </div>
  );
}
