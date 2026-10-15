import { db, sameOrigin, rateKey, readBody } from "@/lib/acquisition/server";
import { NextResponse } from "next/server";
import { DEFAULT_MINUTES, parseMinutes, setSessionCookies } from "../../../../lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let stage = "origin";
  try {
    if (!sameOrigin(request)) return NextResponse.json({error:"Invalid origin"},{status:403});
    stage = "db-client";
    const client = db();
    stage = "rate-key";
    const pKey = rateKey(request, "admin-login");
    stage = "rate-rpc";
    const { data: allowed, error } = await client.rpc("acquisition_rate_limit", { p_key: pKey });
    if (error) {
      // Never log query credentials, Supabase error details, tokens, or IPs.
      console.error("[INFIXO] admin login limiter RPC returned error");
      return NextResponse.json(
        { error: "Login service temporarily unavailable (Code L03)." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    if(!allowed) return NextResponse.json({error:"Too many attempts. Try later."},{status:429});
    stage = "body";
    const { password, minutes } = await readBody(request);
    const expectedPassword = process.env.INFIXO_ADMIN_PASSWORD;
    const secret = process.env.INFIXO_ADMIN_SECRET;
    if (!expectedPassword || !secret || password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    stage = "session";
    const chosen = parseMinutes(minutes) ?? DEFAULT_MINUTES;
    const response = NextResponse.json({ ok: true, minutes: chosen });
    await setSessionCookies(response, secret, chosen, process.env.NODE_ENV === "production");
    return response;
  } catch (err) {
    // Fixed diagnostic code only: no password, IP, URL, token, headers, or keys.
    const diagnostic = {
      "db-client": "L01",
      "rate-key": "L02",
      "rate-rpc": "L03",
      "session": "L04",
      "origin": "L05",
    }[stage] || "L00";
    console.error("[INFIXO] admin login failure diagnostic:", diagnostic, "type:", err?.name || "Error");
    if (stage === "body") return NextResponse.json(
      { error: "Invalid login request. Refresh the page and try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
    return NextResponse.json(
      { error: `Login service temporarily unavailable (Code ${diagnostic}).` },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
