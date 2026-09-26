"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) router.replace("/admin/workers");
    else { const body = await res.json().catch(() => ({})); setError(body.error || "Login failed"); }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 360, display: "grid", gap: 14 }}>
        <h1>Infixo Admin</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" autoFocus style={{ padding: 12 }} />
        <button type="submit" disabled={loading} style={{ padding: 12 }}>{loading ? "Checking…" : "Login"}</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}
