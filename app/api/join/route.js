import { db, issueToken, validToken, rateKey, readBody, sameOrigin, json } from '@/lib/acquisition/server';
import { validateLead } from '@/lib/acquisition/config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return json({ token: issueToken(), serverNow: Date.now() }); }
  catch { return json({ error: 'अभी फ़ॉर्म उपलब्ध नहीं है। थोड़ी देर बाद फिर कोशिश करें।' }, 503); }
}
export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'कृपया पेज दोबारा खोलकर जानकारी भेजें।' }, 403);
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'कृपया फ़ॉर्म में सही जानकारी भरें।' }, 400); }
  try {
    if (body.website || !validToken(body.token)) return json({ error: 'कृपया पेज दोबारा खोलकर कोशिश करें।' }, 400);
    let lead;
    try { lead = validateLead(body); } catch (e) { return json({ error: e.message }, 400); }
    const client = db();
    const { data: allowed, error: rateError } = await client.rpc('acquisition_rate_limit', { p_key: rateKey(request) });
    if (rateError) throw rateError;
    if (!allowed) return json({ error: 'आपने कई बार कोशिश की है। एक घंटे बाद फिर कोशिश करें।' }, 429);
    const { error } = await client.from('acquisition_leads').insert(lead);
    // Same response for a duplicate: do not disclose whether someone else's phone is registered.
    if (error && error.code !== '23505') throw error;
    if (error?.code === '23505' && lead.question) {
      const { data: existing, error: lookupError } = await client.from('acquisition_leads').select('id').eq('phone', lead.phone).single();
      if (lookupError) throw lookupError;
      const { error: followupError } = await client.from('acquisition_followups').insert({ lead_id: existing.id, reason: lead.reason, question: lead.question });
      if (followupError && followupError.code !== '23505') throw followupError;
    }
    return json({ ok: true });
  } catch { return json({ error: 'जानकारी भेजी नहीं जा सकी। थोड़ी देर बाद फिर कोशिश करें।' }, 503); }
}
