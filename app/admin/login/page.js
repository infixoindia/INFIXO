"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) router.replace("/admin/workers");
    else { const body = await res.json().catch(() => ({})); setError(body.error || "Login failed"); }
    setLoading(false);
  }

  return (
    <main className={styles.page}>
      <div className={styles.bg} style={{ backgroundImage: "url(/images/admin-login-bg.webp)" }} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.logoChip}>
          <img className={styles.logo} src="/images/infixo-logo-transparent.png" alt="Infixo" />
        </div>
        <div className={styles.panelLabel}>Admin Panel</div>

        <form onSubmit={submit} className={styles.card}>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.sub}>Enter your password to access your panel.</p>

          <div className={styles.field}>
            <span className={styles.fieldIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /><circle cx="12" cy="15.5" r="1" fill="currentColor" /></svg>
            </span>
            <input
              className={styles.input}
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
            />
            <button type="button" className={styles.eye} onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.4 0 10 6 10 6a17.6 17.6 0 0 1-3.2 3.9M6.5 7.7A17.4 17.4 0 0 0 2 12s3.6 6 10 6c1.5 0 2.8-.3 4-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
              )}
            </button>
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Checking…" : (<>Login <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>)}
          </button>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.secure}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="M9.2 12.2l2.1 2.1 3.6-4" /></svg>
            Secure Access
          </div>
        </form>
      </div>
    </main>
  );
}
