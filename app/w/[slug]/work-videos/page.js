import { notFound } from "next/navigation";
import WorkVideos from "../../../components/WorkVideos/WorkVideos";
import { getWorkerBySlug } from "@/lib/workerService";

export default async function Page({ params }) {
  const { slug } = await params;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  return <WorkVideos worker={worker} backHref={`/w/${slug}`} />;
}
