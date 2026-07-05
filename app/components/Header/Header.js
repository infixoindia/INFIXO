import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <img
        src="/images/logo.png"
        alt="Infixo Logo"
        className={styles.logo}
      />

      <p className={styles.tagline}>
        Apno Se Judne Ka Naya Tarika
      </p>
    </header>
  );
}
