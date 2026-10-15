// Signed sessions: server enforces expiry; raw-secret legacy cookies are rejected.
export const ALLOWED_MINUTES = [1, 5, 10, 30];
export const DEFAULT_MINUTES = 10;
export const SESSION_COOKIE = "infixo_admin";
export const TTL_COOKIE = "infixo_admin_ttl";
export function parseMinutes(value) { const n=Number(value); return ALLOWED_MINUTES.includes(n)?n:null; }
const enc = new TextEncoder();
async function key(secret) { return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']); }
export async function issueSession(secret, minutes) {
 if (!secret || !parseMinutes(minutes)) throw new Error('Session configuration unavailable');
 const value=`v1.${Date.now()}.${minutes}.${crypto.randomUUID()}`;
 const signature=await crypto.subtle.sign('HMAC',await key(secret),enc.encode(value));
 return `${value}.${Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('')}`;
}
export async function isValidSession(secret, token, ttl) {
 try {
 if (!secret || typeof token!=='string' || token.length>240) return false;
 const parts=token.split('.'); if(parts.length!==5 || parts[0]!=='v1' || !/^[a-f0-9]{64}$/.test(parts[4]))return false;
 const minutes=parseMinutes(parts[2]), age=Date.now()-Number(parts[1]);
 if(!minutes || minutes!==parseMinutes(ttl) || !Number.isFinite(age) || age<0 || age>=minutes*60000)return false;
 return await crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(parts[4].match(/../g),x=>parseInt(x,16)),enc.encode(parts.slice(0,4).join('.')));
 } catch { return false; }
}
export function cookieOptions(minutes,isProd) {return {httpOnly:true,secure:!!isProd,sameSite:'lax',path:'/',maxAge:minutes*60};}
export async function setSessionCookies(response,secret,minutes,isProd) {
 const opts=cookieOptions(minutes,isProd);
 response.cookies.set(SESSION_COOKIE,await issueSession(secret,minutes),opts);
 response.cookies.set(TTL_COOKIE,String(minutes),opts);
}
export async function requestIsAdmin(request) {
 return isValidSession(process.env.INFIXO_ADMIN_SECRET,request.cookies.get(SESSION_COOKIE)?.value,request.cookies.get(TTL_COOKIE)?.value);
}
