import { notFound } from "next/navigation";
import WorkerDetails from "../../../components/WorkerDetails/WorkerDetails";
import { getWorkerBySlug } from "@/lib/workerService";

// Always fetch fresh data — never cache this page, since admin edits
// must show up immediately on the public profile.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page({ params }) {
  const { slug } = await params;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  return <WorkerDetails worker={worker} backHref={`/w/${slug}`} />;
}
