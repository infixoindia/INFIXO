"use client";

import { useEffect, useState } from "react";

// Visible only on the worker's own handover link, never on customer profiles.
// Browsers decide whether an install prompt can be shown. Explain manual steps
// instead of pretending that silent installation is possible.
export default function WorkerPwaInstall({ workerName = "My" }) {
  const [deferred, setDeferred] = useState(null);
  const [instructions, setInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) setInstalled(true);
    function onPrompt(event) { event.preventDefault(); setDeferred(event); }
    function onInstalled() { setInstalled(true); setDeferred(null); setInstructions(false); }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  const install = async () => {
    if (!deferred) { setInstructions(true); return; }
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === "accepted") setInstructions(false);
      else setInstructions(true);
    } catch { setInstructions(true); }
    finally { setDeferred(null); }
  };
  return (
    <section aria-label="Install my INFIXO worker profile" style={{
      background: "#f1f6ff", border: "1px solid #d4e1f9", borderRadius: 14,
      padding: "12px 14px", margin: "12px 0 18px", fontSize: 13, color: "#173264"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 14 }}>My INFIXO Profile</strong>
          <span>Home Screen par rakhein. Ek tap mein apni profile kholein.</span>
        </div>
        <button type="button" onClick={install} style={{
          border: 0, color: "#fff", background: "#002D97", padding: "10px 12px",
          borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: "pointer"
        }}>Install</button>
      </div>
      {instructions && (
        <div style={{ marginTop: 12, borderTop: "1px solid #d4e1f9", paddingTop: 10, lineHeight: 1.6 }}>
          <strong>Android Chrome:</strong> Browser ke ⋮ menu mein <strong>Add to Home screen</strong> ya <strong>Install app</strong> choose karein, phir confirm karein.
          <div style={{ color: "#526684", marginTop: 4 }}>
            Install option browser aur device par depend karta hai. {workerName} ki profile kholne ke liye alag Play Store app nahi chahiye.
          </div>
          <button type="button" onClick={() => setInstructions(false)} style={{
            marginTop: 8, padding: 0, background: "none", border: 0, color: "#002D97", fontWeight: 700, cursor: "pointer"
          }}>Samajh gaya</button>
        </div>
      )}
    </section>
  );
}
