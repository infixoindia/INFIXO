import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyplrbzyqershqngrjwo.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "worker-media";
function isAdmin(request) { const expected = process.env.INFIXO_ADMIN_SECRET; return !!expected && request.cookies.get("infixo_admin")?.value === expected; }
function client() { if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured"); return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }); }
function unauthorized() { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const form = await request.formData(); const file = form.get("file"); const path = form.get("path"); const contentType = form.get("contentType") || "application/octet-stream";
    if (!file || !path) return NextResponse.json({ error: "File and path are required" }, { status: 400 });
    if (typeof path !== "string" || path.includes("..") || path.startsWith("/")) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer()); const sb = client();
    const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType, cacheControl: "3600", upsert: false });
    if (error) throw error; const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (e) { return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 }); }
}
export async function DELETE(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { path } = await request.json();
    if (!path || path.includes("..") || path.startsWith("/")) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    const { error } = await client().storage.from(BUCKET).remove([path]); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 }); }
}
