import { notFound } from "next/navigation";
import WorkPhotos from "../../../components/WorkPhotos/WorkPhotos";
import AdminEditFab from "../../../components/AdminEditFab/AdminEditFab";
import { getWorkerBySlug } from "@/lib/workerService";

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
    <>
      <WorkPhotos worker={worker} backHref={`/w/${slug}${queryString}`} />
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
    </>
  );
}
