"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// While the admin page is on screen (visible), the session is kept alive automatically,
// even if the admin is only reading and not tapping anything.
// The chosen time starts counting only when the admin LEAVES (switches app/tab, locks the
// screen, closes the page). Coming back after that time => password is asked again.
export default function AdminActivity() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return undefined;
    let minutes = null, last = 0, busy = false, gone = false;

    const ping = async (keepalive = false) => {
      if (busy || gone) return;
      busy = true;
      try {
        const r = await fetch("/api/admin/ping", { cache: "no-store", keepalive });
        if (r.status === 401) { gone = true; window.location.replace("/admin/login"); return; }
        const j = await r.json();
        minutes = j.minutes; last = Date.now();
      } catch { /* offline: try again later */ } finally { busy = false; }
    };

    // Keep-alive: only while the page is visible.
    const tick = () => {
      if (!minutes || document.visibilityState !== "visible") return;
      if (Date.now() - last >= (minutes * 60000) / 3) ping();
    };
    const timer = setInterval(tick, 5000);

    const onVisibility = () => {
      // Leaving: stamp "last seen" now, so the timer counts from this moment.
      // Returning: if the time already ran out, the server answers 401 -> login page.
      ping(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);

    ping();
    return () => {
      gone = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
