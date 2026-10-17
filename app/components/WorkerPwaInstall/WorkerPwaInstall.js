"use client";

import { useEffect, useState } from "react";

// The browser owns the install confirmation. INFIXO can open it in one tap
// ONLY after Chrome sends beforeinstallprompt for this worker's PWA.
export default function WorkerPwaInstall({ workerName = "My", workerId = "" }) {
  const [prompt, setPrompt] = useState(null);
  const [instructions, setInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) setInstalled(true);

    const onPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
      setChecking(false);
      setInstructions(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      setInstructions(false);
    };
    // A browser may take a few seconds to check eligibility, so do not
    // immediately show fallback instructions before it has a chance.
    const checkTimer = window.setTimeout(() => setChecking(false), 12000);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Chrome versions that still need a fetch-handling worker can now promote
    // installation. Scope is THIS worker alone; no caching or admin interception.
    const current = "/pwa/worker/" + encodeURIComponent(workerId);
    if (workerId && window.location.pathname.startsWith(current) && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/worker-pwa-sw.js", { scope: current })
        .catch(() => {
          // Protected previews/custom tabs may reject a registration.
          // Never block the real worker profile when installation is unavailable.
        });
    }
    return () => {
      window.clearTimeout(checkTimer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [workerId]);

  if (installed) return null;
  const inScope = workerId && typeof window !== "undefined" &&
    window.location.pathname.startsWith("/pwa/worker/" + encodeURIComponent(workerId));

  async function install() {
    if (!inScope) {
      // The handover link is outside this worker's app scope.
      window.location.assign("/pwa/worker/" + encodeURIComponent(workerId));
      return;
    }
    if (!prompt) {
      setInstructions(true);
      return;
    }
    try {
      // Must be called in the user's tap handler, not on page load.
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result?.outcome !== "accepted") setInstructions(true);
    } catch {
      setInstructions(true);
    } finally {
      setPrompt(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const buttonText = !inScope ? "Set up" : prompt ? "Install" : checking ? "Checking…" : "Install help";

  return (
    <section aria-label="Install my INFIXO worker profile" style={{
      background: "#f1f6ff", border: "1px solid #d4e1f9", borderRadius: 14,
      padding: "12px 14px", margin: "12px 0 18px", fontSize: 13, color: "#173264"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 14 }}>My INFIXO Profile</strong>
          <span>{prompt ? "Install dabayein aur Android se confirm karein." :
            "Home Screen par rakhein. Ek tap mein apni profile kholein."}</span>
        </div>
        <button type="button" onClick={install} disabled={Boolean(inScope && checking && !prompt)}
          style={{
            border: 0, color: "#fff", background: "#002D97", padding: "10px 12px",
            borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0,
            cursor: checking && inScope && !prompt ? "wait" : "pointer",
            opacity: checking && inScope && !prompt ? .65 : 1
          }}>{buttonText}</button>
      </div>
      {instructions && (
        <div style={{ marginTop: 12, borderTop: "1px solid #d4e1f9", paddingTop: 10, lineHeight: 1.6 }}>
          <strong>Install popup abhi available nahi hai.</strong>
          <div>
            ChatGPT/WhatsApp ke andar khuli browser window mein install prompt nahi mil sakta.
            Upar ⋮ menu mein <strong>Open in Chrome</strong> choose karein.
            Nahi mile toh Chrome app ke normal tab mein yeh profile link open karein.
          </div>
          <div style={{ marginTop: 6 }}>
            Phir Chrome ke ⋮ menu mein <strong>Add to Home screen / Install app</strong> check karein.
            PWA pehle se installed ho toh popup dobara nahi aayega.
          </div>
          <button type="button" onClick={copyLink} style={{
            marginTop: 8, padding: "6px 10px", background: "#fff", borderRadius: 8,
            border: "1px solid #b9cbe9", color: "#002D97", fontWeight: 700, cursor: "pointer"
          }}>{copied ? "Link copied ✓" : "Copy profile link"}</button>
          <div style={{ color: "#526684", marginTop: 6 }}>
            {workerName} ki INFIXO profile ke liye Play Store download zaroori nahi.
          </div>
          <button type="button" onClick={() => setInstructions(false)} style={{
            marginTop: 8, padding: 0, background: "none", border: 0,
            color: "#002D97", fontWeight: 700, cursor: "pointer"
          }}>Samajh gaya</button>
        </div>
      )}
    </section>
  );
}
