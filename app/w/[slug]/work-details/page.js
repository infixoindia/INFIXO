import { notFound } from "next/navigation";
import WorkDetails from "../../../components/WorkDetails/WorkDetails";
import AdminEditFab from "../../../components/AdminEditFab/AdminEditFab";
import { getWorkerBySlug } from "@/lib/workerService";

// Always fetch fresh data — never cache this page, since admin edits
// must show up immediately on the public profile.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  const isAdminPreview = sp?.admin === worker.id;
  const queryString = isAdminPreview ? `?admin=${worker.id}` : "";

  return (
    <main>
      <div style={{ padding: "1rem" }}>
        <WorkDetails worker={worker} backHref={`/w/${slug}${queryString}`} />
      </div>
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
    </main>
  );
}
