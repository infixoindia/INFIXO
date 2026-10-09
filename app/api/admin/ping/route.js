import { NextResponse } from "next/server";
import { SESSION_COOKIE, TTL_COOKIE, isValidSession, parseMinutes } from "../../../../lib/adminSession";

export const dynamic = "force-dynamic";

// Called by the admin pages only while the admin is actually interacting.
// The middleware has already pushed the cookie expiry forward for this request.
export async function GET(request) {
  const ttl = request.cookies.get(TTL_COOKIE)?.value;
  const ok = isValidSession(process.env.INFIXO_ADMIN_SECRET, request.cookies.get(SESSION_COOKIE)?.value, ttl);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ ok: true, minutes: parseMinutes(ttl) }, { headers: { "Cache-Control": "no-store" } });
}
