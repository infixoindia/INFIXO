import { notFound } from "next/navigation";
import Header from "../../components/Header/Header";
import WorkerIdentityCard from "../../components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "../../components/NavigationTabs/NavigationTabs";
import Footer from "../../components/Footer/Footer";
import { getWorkerBySlug } from "@/lib/workerService";

export default async function WorkerProfilePage({ params }) {
  const { slug } = await params;
  const worker = await getWorkerBySlug(slug);
  if (!worker) notFound();

  return (
    <main>
      <Header />
      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={worker} />
        <NavigationTabs worker={worker} basePath={`/w/${slug}`} />
      </div>
      <Footer />
    </main>
  );
}
