import { publishedWorkerById } from "@/lib/workerPwaServer";

export const dynamic = "force-dynamic";

// Only the installed worker-specific route advertises the installed app's manifest.
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const worker = await publishedWorkerById(id);
    if (worker) {
      return {
        title: String(worker.full_name || "My Profile") + " | INFIXO",
        manifest: "/api/pwa/manifest/" + encodeURIComponent(worker.slug),
      };
    }
  } catch (err) {
    console.error("PWA metadata unavailable:", err?.message || err);
  }
  return { title: "INFIXO Worker Profile" };
}

export default function WorkerPwaLayout({ children }) {
  return <><script src="/worker-pwa-install-early.js" />{children}</>;
}
