import WorkerMasterProfile from '../../components/WorkerMasterProfile/WorkerMasterProfile';
import { supabase } from '../../../lib/supabase';

import { notFound } from 'next/navigation';

export default async function PublicWorkerProfilePage({ params }) {
  const { slug } = await params;

  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !worker) {
    notFound();
  }

  return <WorkerMasterProfile initialWorkerData={worker} mode="preview" />;
}
