import { NextResponse } from 'next/server';
import { createClient } from '@/lib/guardedSupabase';
import { requestIsAdmin } from '@/lib/adminSession';
import { MAX_VIDEO_BYTES, MAX_THUMB_BYTES, validateVideoSelection } from '@/lib/workVideo.mjs';

export const runtime = 'nodejs';
const BUCKET = 'worker-media';
const PROD_URL = 'https://xyplrbzyqershqngrjwo.supabase.co';
function url() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  try { const parsed = new URL(raw); if (['http:', 'https:'].includes(parsed.protocol)) return parsed.toString().replace(/\/$/, ''); } catch {}
  return PROD_URL; // guardedSupabase rejects this fallback on preview.
}
function adminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw Error('Storage service configuration unavailable.');
  return createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
function reply(error, status = 400) { return NextResponse.json({ error }, { status }); }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host && new URL(origin).protocol === 'https:'; } catch { return false; }
}
async function authorize(request) {
  if (!await requestIsAdmin(request)) return reply('Unauthorized', 401);
  if (!validOrigin(request)) return reply('Cross-origin upload denied', 403);
  return null;
}
async function workerExists(sb, workerId) {
  if (!UUID.test(workerId || '')) return false;
  const { data, error } = await sb.from('workers').select('id').eq('id', workerId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
export async function POST(request) {
  const denied = await authorize(request);
  if (denied) return denied;
  try {
    const sb = adminClient();
    const type = request.headers.get('content-type') || '';
    if (type.includes('multipart/form-data')) {
      // Thumbnail is extracted in the browser, not chosen as a separate image.
      const form = await request.formData();
      const workerId = String(form.get('workerId') || '');
      const file = form.get('file');
      if (!await workerExists(sb, workerId)) return reply('Worker not found', 404);
      if (!(file instanceof File) || file.type !== 'image/jpeg' ||
          file.size <= 0 || file.size > MAX_THUMB_BYTES) return reply('Invalid thumbnail JPEG');
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) return reply('Invalid JPEG signature');
      const path = workerId + '/video-thumbs/' + crypto.randomUUID() + '.jpg';
      const { error } = await sb.storage.from(BUCKET).upload(path, bytes, {
        contentType: 'image/jpeg', cacheControl: '3600', upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      return NextResponse.json({ publicUrl: data.publicUrl });
    }
    if (!type.includes('application/json')) return reply('Expected JSON or thumbnail');
    const body = await request.json();
    const workerId = String(body.workerId || '');
    if (!await workerExists(sb, workerId)) return reply('Worker not found', 404);
    const mime = String(body.mime || '');
    const size = body.size;
    const issue = validateVideoSelection({ size, type: mime, headerHex: body.headerHex });
    if (issue) return reply(issue);
    const extension = mime === 'video/webm' ? 'webm' : mime === 'video/quicktime' ? 'mov' : 'mp4';
    const path = workerId + '/videos/' + crypto.randomUUID() + '.' + extension;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data?.token) throw error || Error('Could not authorize video upload');
    const { data: published } = sb.storage.from(BUCKET).getPublicUrl(path);
    const projectRef = new URL(url()).hostname.split('.')[0];
    return NextResponse.json({
      token: data.token,
      path,
      publicUrl: published.publicUrl,
      endpoint: 'https://' + projectRef + '.storage.supabase.co/storage/v1/upload/resumable',
      bucket: BUCKET,
      maxBytes: MAX_VIDEO_BYTES,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Admin video upload authorization failed', e?.message || 'error');
    return reply('Video storage request failed. Retry or check staging storage configuration.', 500);
  }
}
