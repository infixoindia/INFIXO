// Admin session = idle timeout. The browser drops the cookie after `minutes` of
// inactivity; every admin request / user interaction pushes it forward again.
export const ALLOWED_MINUTES = [1, 5, 10, 30];
export const DEFAULT_MINUTES = 10;
export const SESSION_COOKIE = "infixo_admin";
export const TTL_COOKIE = "infixo_admin_ttl";

export function parseMinutes(value) {
  const n = Number(value);
  return ALLOWED_MINUTES.includes(n) ? n : null;
}

// Session is valid only with the secret AND a recognised timeout choice.
// (Old 12-hour cookies have no timeout cookie, so they are rejected -> login.)
export function isValidSession(secret, cookieValue, ttlValue) {
  return !!secret && cookieValue === secret && parseMinutes(ttlValue) !== null;
}

export function cookieOptions(minutes, isProd) {
  return { httpOnly: true, secure: !!isProd, sameSite: "lax", path: "/", maxAge: minutes * 60 };
}

export function setSessionCookies(response, secret, minutes, isProd) {
  const opts = cookieOptions(minutes, isProd);
  response.cookies.set(SESSION_COOKIE, secret, opts);
  response.cookies.set(TTL_COOKIE, String(minutes), opts);
}
