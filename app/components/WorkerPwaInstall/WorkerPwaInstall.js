"use client";

import { useEffect, useState } from "react";

// The browser owns the install confirmation. INFIXO can open it in one tap
// ONLY after Chrome sends beforeinstallprompt for this worker's PWA.
export default function WorkerPwaInstall({ workerName = "My", workerId = "" }) {
  const [prompt, setPrompt] = useState(null);
  const [instructions, setInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) setInstalled(true);
    // The event may fire while the worker profile is still loading.
    // The small script in the route layout captures and saves it beforehand.
    const syncEarlyPrompt = () => {
      const saved = window.__infixoPwaInstall;
      if (saved?.installed) setInstalled(true);
      if (saved?.path === window.location.pathname && saved.prompt) {
        setPrompt(saved.prompt);
        setInstructions(false);
      }
    };
    syncEarlyPrompt();
    window.addEventListener("infixo-pwa-install-ready", syncEarlyPrompt);
    window.addEventListener("infixo-pwa-installed", syncEarlyPrompt);

    const onPrompt = (event) => {
      event.preventDefault();
      // Keep the early capture and late React handler in sync.
      const saved = window.__infixoPwaInstall;
      if (saved) { saved.prompt = event; saved.path = window.location.pathname; }
      setPrompt(event);
      setInstructions(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      setInstructions(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Early script also registers this SW; repeat safely if this link was loaded
    // through client-side navigation. Chrome can then promote
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
      window.removeEventListener("infixo-pwa-install-ready", syncEarlyPrompt);
      window.removeEventListener("infixo-pwa-installed", syncEarlyPrompt);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [workerId]);

  if (installed) return null;
  const inScope = workerId && typeof window !== "undefined" &&
    window.location.pathname.startsWith("/pwa/worker/" + encodeURIComponent(workerId));

  async function install() {
    // Prefer a captured event even on the original handover link.
    // This restores one-tap install when Chrome makes it available.
    const saved = window.__infixoPwaInstall;
    const activePrompt = saved?.path === window.location.pathname && saved.prompt
      ? saved.prompt : prompt;
    if (activePrompt) {
      try {
        // Called synchronously from the actual tap, not after navigation.
        await activePrompt.prompt();
        const result = await activePrompt.userChoice;
        if (result?.outcome !== "accepted") setInstructions(true);
      } catch {
        setInstructions(true);
      } finally {
        if (saved) saved.prompt = null;
        setPrompt(null);
      }
      return;
    }
    // If Chrome did not offer a prompt on the handover URL, move to
    // the isolated installable PWA page. A popup on that page still needs
    // a second user gesture; browser installation cannot be forced.
    if (!inScope) {
      window.location.assign("/pwa/worker/" + encodeURIComponent(workerId));
      return;
    }
    setInstructions(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  // Explicit user-gesture Chrome handoff: in-app browser/Custom Tabs cannot
  // be forced to show a native install prompt. The intent is best effort only.
  // Keep Copy link instructions as a reliable alternative.
  const workerPath = workerId ? `/pwa/worker/${encodeURIComponent(workerId)}` : "";
  const fullLink = typeof window !== "undefined" && workerPath
    ? window.location.origin + workerPath : "";
  const chromeIntent = fullLink && typeof window !== "undefined"
    ? `intent://${window.location.host}${workerPath}#Intent;scheme=${window.location.protocol === "https:" ? "https" : "http"};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(fullLink)};end;`
    : "";
  const buttonText = "Install";

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
        <button type="button" onClick={install}
          style={{
            border: 0, color: "#fff", background: "#002D97", padding: "10px 12px",
            borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0,
            cursor: "pointer"
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
            Chrome ke ⋮ menu mein <strong>Add to Home screen / Install app</strong> check karein.
            Agar Chrome mein bhi direct popup abhi nahi aata, thodi der profile khuli rakhein.
            PWA pehle se installed ho toh popup dobara nahi aayega.
          </div>
          {chromeIntent && <a href={chromeIntent} style={{ display: "inline-block", margin: "8px 9px 0 0", padding: "8px 12px", borderRadius: 8, background: "#002D97", color: "#fff", fontWeight: 700, textDecoration: "none" }}>Open in Chrome</a>}
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
