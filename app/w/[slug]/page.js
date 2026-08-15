import { notFound } from "next/navigation";
import Header from "../../components/Header/Header";
import WorkerIdentityCard from "../../components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "../../components/NavigationTabs/NavigationTabs";
import Footer from "../../components/Footer/Footer";
import AdminEditFab from "../../components/AdminEditFab/AdminEditFab";
import { getWorkerBySlug } from "@/lib/workerService";

// Always fetch fresh data — never cache this page, since admin edits
// must show up immediately on the public profile.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function WorkerProfilePage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  const isAdminPreview = sp?.admin === worker.id;
  const queryString = isAdminPreview ? `?admin=${worker.id}` : "";

  return (
    <main>
      <Header />
      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={worker} />
        <NavigationTabs worker={worker} basePath={`/w/${slug}`} queryString={queryString} />
      </div>
      <Footer slug={slug} />
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
    </main>
  );
}
