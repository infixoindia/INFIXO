import { db, sameOrigin, rateKey, readBody } from "@/lib/acquisition/server";
import { NextResponse } from "next/server";
import { DEFAULT_MINUTES, parseMinutes, setSessionCookies } from "../../../../lib/adminSession";

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({error:"Invalid origin"},{status:403});
    const {data: allowed,error} = await db().rpc('acquisition_rate_limit',{p_key:rateKey(request, 'admin-login')});
    if(error) return NextResponse.json({error:"Login temporarily unavailable"},{status:503});
    if(!allowed) return NextResponse.json({error:"Too many attempts. Try later."},{status:429});
    const { password, minutes } = await readBody(request);
    const expectedPassword = process.env.INFIXO_ADMIN_PASSWORD;
    const secret = process.env.INFIXO_ADMIN_SECRET;
    if (!expectedPassword || !secret || password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const chosen = parseMinutes(minutes) ?? DEFAULT_MINUTES;
    const response = NextResponse.json({ ok: true, minutes: chosen });
    await setSessionCookies(response, secret, chosen, process.env.NODE_ENV === "production");
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
