import WorkerMasterProfile from '../../components/WorkerMasterProfile/WorkerMasterProfile';
import { supabase } from '../../../lib/supabase';

import { notFound } from 'next/navigation';

export default async function PublicWorkerProfilePage({ params }) {
  const { slug } = await params;

  // Supabase se worker fetch karo
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !worker) {
    notFound(); // Agar database me worker na mile toh 404
  }

  return <WorkerMasterProfile initialWorkerData={worker} mode="preview" />;
}
