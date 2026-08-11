import { notFound } from "next/navigation";
import WorkerDetails from "../../../components/WorkerDetails/WorkerDetails";
import { getWorkerBySlug } from "@/lib/workerService";

export default async function Page({ params }) {
  const { slug } = await params;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  return <WorkerDetails worker={worker} backHref={`/w/${slug}`} />;
}
