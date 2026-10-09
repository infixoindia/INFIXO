import { NextResponse } from "next/server";
import { SESSION_COOKIE, TTL_COOKIE, isValidSession, parseMinutes, setSessionCookies } from "./lib/adminSession";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  const secret = process.env.INFIXO_ADMIN_SECRET;
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const ttl = request.cookies.get(TTL_COOKIE)?.value;

  if (!isValidSession(secret, cookie, ttl)) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Active use pushes the expiry forward again (idle timeout, not a fixed kick-out).
  const response = NextResponse.next();
  setSessionCookies(response, secret, parseMinutes(ttl), process.env.NODE_ENV === "production");
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
