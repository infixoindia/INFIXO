import { admin, db, json, readBody, sameOrigin } from '@/lib/acquisition/server';
import { CATEGORIES, PLANS, STATUSES, profileLimitError } from '@/lib/acquisition/config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request) {
  if (!admin(request)) return json({ error: 'Unauthorized' }, 401);
  try {
    const p = new URL(request.url).searchParams, client = db();
    const page = Math.max(0, Math.min(10000, Number(p.get('page')) || 0));
    let query = client.from('acquisition_leads').select('*, acquisition_followups(id,reason,question,created_at)', { count: 'exact' }).order('created_at', { ascending: false }).range(page * 30, page * 30 + 29);
    for (const key of ['profession','selected_plan','status','working_model']) if (p.get(key)) query = query.eq(key, p.get(key));
    for (const key of ['area','source']) if (p.get(key)) query = query.ilike(key === 'source' ? 'attribution->>utm_source' : key, `%${p.get(key).replace(/[%_\\]/g, '').slice(0,120)}%`);
    if (p.get('from')) { if (!/^\d{4}-\d{2}-\d{2}$/.test(p.get('from'))) return json({error:'Invalid date'},400); query = query.gte('created_at', `${p.get('from')}T00:00:00+05:30`); }
    if (p.get('to')) { if (!/^\d{4}-\d{2}-\d{2}$/.test(p.get('to'))) return json({error:'Invalid date'},400); query = query.lte('created_at', `${p.get('to')}T23:59:59.999+05:30`); }
    const [{ data, error, count }, progress] = await Promise.all([query, client.rpc('acquisition_progress')]);
    if (error || progress.error) throw error || progress.error;
    return json({ leads: data, count, progress: progress.data });
  } catch { return json({ error: 'Leads load nahi hue. Database setup aur server configuration check karein.' }, 503); }
}
export async function PATCH(request) {
  if (!admin(request)) return json({ error: 'Unauthorized' }, 401);
  if (!sameOrigin(request)) return json({ error: 'Invalid origin' }, 403);
  try {
    const b = await readBody(request);
    if (!uuid.test(b.id || '') || !STATUSES.includes(b.status) || !PLANS.includes(b.selected_plan) || !CATEGORIES.some(c => c.name === b.profession) || typeof b.updated_at !== 'string') return json({ error: 'Invalid update' }, 400);
    const client = db();
    const workerId = b.worker_id || null;
    if (workerId && !uuid.test(workerId)) return json({ error: 'Sahi worker UUID bharein.' }, 400);
    if (b.status === 'Approved / Onboarded') {
      if (b.confirmed !== true || !workerId) return json({ error: 'Profile review aur applicable payment confirm karein.' }, 400);
      const { data: worker, error } = await client.from('workers').select('id,phone,profession,is_active,hero_slides,photos,videos').eq('id', workerId).single();
      if (error || !worker) return json({ error: 'Worker profile nahi mili.' }, 400);
      const issue = profileLimitError(worker, b.selected_plan);
      if (issue) return json({ error: issue }, 400);
    }
    const { data, error } = await client.from('acquisition_leads').update({ status: b.status, selected_plan: b.selected_plan, profession: b.profession, worker_id: workerId, approved_at: b.status === 'Approved / Onboarded' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', b.id).eq('updated_at', b.updated_at).select('id');
    if (error?.code === '23505') return json({ error: 'Yeh worker kisi aur lead se linked hai.' }, 409);
    if (error) throw error;
    if (!data?.length) return json({ error: 'Lead change ho chuki hai. Refresh karke try karein.' }, 409);
    return json({ ok: true });
  } catch { return json({ error: 'Update save nahi hua.' }, 503); }
}
