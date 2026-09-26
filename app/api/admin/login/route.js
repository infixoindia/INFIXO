import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.INFIXO_ADMIN_PASSWORD;
    const secret = process.env.INFIXO_ADMIN_SECRET;
    if (!expectedPassword || !secret || password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set("infixo_admin", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
