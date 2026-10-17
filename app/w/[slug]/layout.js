import { getWorkerBySlug } from "@/lib/workerService";

// Android/Chrome shortcuts often take their default label from the page title.
// Only public worker data is read; this is NOT a PWA manifest or installation.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (typeof slug !== "string" || !/^[a-z0-9-]{1,100}$/i.test(slug)) {
    return { title: "INFIXO Worker Profile" };
  }
  try {
    const worker = await getWorkerBySlug(slug);
    const name = String(worker?.fullName || "").trim();
    if (name) {
      return { title: name.slice(0, 55) + " | INFIXO" };
    }
  } catch {
    // A metadata lookup must not break the worker's public profile.
  }
  return { title: "INFIXO Worker Profile" };
}

export default function WorkerLayout({ children }) {
  return children;
}
