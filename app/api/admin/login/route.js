import { NextResponse } from "next/server";
import { DEFAULT_MINUTES, parseMinutes, setSessionCookies } from "../../../../lib/adminSession";

export async function POST(request) {
  try {
    const { password, minutes } = await request.json();
    const expectedPassword = process.env.INFIXO_ADMIN_PASSWORD;
    const secret = process.env.INFIXO_ADMIN_SECRET;
    if (!expectedPassword || !secret || password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const chosen = parseMinutes(minutes) ?? DEFAULT_MINUTES;
    const response = NextResponse.json({ ok: true, minutes: chosen });
    setSessionCookies(response, secret, chosen, process.env.NODE_ENV === "production");
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
