// Worker manifests are per profile, never a single global INFIXO application.
// Nested /w/[slug]/... routes inherit this manifest metadata.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { manifest: `/api/pwa/manifest/${encodeURIComponent(slug)}` };
}

export default function WorkerRouteLayout({ children }) {
  return <><script src="/worker-pwa-install-early.js" />{children}</>;
}
