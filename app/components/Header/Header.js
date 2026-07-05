import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <img
        src="/images/logo.png"
        alt="Infixo Logo"
        className={styles.logo}
      />
    </header>
  );
}
