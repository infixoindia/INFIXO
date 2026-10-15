import { db, sameOrigin, rateKey, readBody } from "@/lib/acquisition/server";
import { NextResponse } from "next/server";
import { DEFAULT_MINUTES, parseMinutes, setSessionCookies } from "../../../../lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let stage = "origin";
  try {
    if (!sameOrigin(request)) return NextResponse.json({error:"Invalid origin"},{status:403});
    stage = "rate-limit";
    const {data: allowed,error} = await db().rpc('acquisition_rate_limit',{p_key:rateKey(request, 'admin-login')});
    if(error) return NextResponse.json({error:"Login temporarily unavailable"},{status:503});
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
    // This message includes no credentials, IP, request body, or token.
    // A missing rate-limit dependency must not be mislabeled "Invalid request".
    console.error("[INFIXO] admin login failure stage:", stage, "type:", err?.name || "Error");
    if (stage === "body") return NextResponse.json(
      { error: "Invalid login request. Refresh the page and try again." },
      { status: 400 }
    );
    return NextResponse.json(
      { error: "Login service temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
