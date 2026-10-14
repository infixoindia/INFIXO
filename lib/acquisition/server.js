import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isValidSession, SESSION_COOKIE, TTL_COOKIE } from '../adminSession';
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Acquisition storage unavailable');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function admin(request) {
  return isValidSession(process.env.INFIXO_ADMIN_SECRET, request.cookies.get(SESSION_COOKIE)?.value, request.cookies.get(TTL_COOKIE)?.value);
}
export function sameOrigin(request) { return request.headers.get('origin') === new URL(request.url).origin; }
function sign(value) {
  const secret = process.env.INFIXO_LEAD_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error('Acquisition signing unavailable');
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function issueToken() { const value = `${Date.now()}.${randomUUID()}`; return `${value}.${sign(value)}`; }
export function validToken(token) {
  if (typeof token !== 'string' || token.length > 200) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const age = Date.now() - Number(parts[0]);
  return age >= 1500 && age < 7200000 && timingSafeEqual(Buffer.from(parts[2]), Buffer.from(sign(parts.slice(0, 2).join('.'))));
}
export function rateKey(request) {
  // Vercel overwrites x-vercel-forwarded-for; never trust a client-provided x-forwarded-for.
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : 'local-preview';
  return sign(`rate:${ip || 'unknown'}:${new Date().toISOString().slice(0, 10)}`);
}
export async function readBody(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new Error('JSON required');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Body required');
  let size = 0; const chunks = [];
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 12000) { await reader.cancel(); throw new Error('Request too large'); } chunks.push(value); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export function json(data, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
