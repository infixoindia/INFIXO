import WorkerMasterProfile from '@/app/components/WorkerMasterProfile/WorkerMasterProfile';
import dummyWorker from '@/app/data/dummyWorker'; // Apne dummy data file ka path check kar lena

export default function PublicWorkerProfilePage({ params }) {
  // Temporary initial data (Step 4 me Supabase fetch connect karenge)
  const workerData = {
    ...dummyWorker,
    full_name: params.slug.replace(/-/g, ' '),
    slug: params.slug,
  };

  return <WorkerMasterProfile initialWorkerData={workerData} mode="preview" />;
}
