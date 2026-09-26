import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyplrbzyqershqngrjwo.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
function unauthorized() { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
function isAdmin(request) {
  const expected = process.env.INFIXO_ADMIN_SECRET;
  return !!expected && request.cookies.get("infixo_admin")?.value === expected;
}

export async function GET(request, { params }) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("workers").select("*").eq("id", (await params).id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ worker: data });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to load worker" }, { status: 500 }); }
}

export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const payload = await request.json();
    delete payload.id; delete payload.slug; delete payload.worker_id; delete payload.ipuc;
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("workers").update(payload).eq("id", (await params).id).select().single();
    if (error) throw error;
    return NextResponse.json({ worker: data });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to update worker" }, { status: 500 }); }
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("workers").delete().eq("id", (await params).id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to delete worker" }, { status: 500 }); }
}
