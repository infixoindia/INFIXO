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
    if (typeof payload.is_active !== "undefined" && typeof payload.is_active !== "boolean") {
      return NextResponse.json({ error: "is_active must be true or false" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("workers").update(payload).eq("id", (await params).id).select().single();
    if (error) throw error;
    return NextResponse.json({ worker: data });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to update worker" }, { status: 500 }); }
}

async function removeWorkerMedia(supabase, workerId) {
  const root = String(workerId);
  const files = [];
  const walk = async (prefix) => {
    const { data, error } = await supabase.storage.from("worker-media").list(prefix, { limit: 1000, offset: 0 });
    if (error) throw error;
    for (const item of data || []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) files.push(path);
      else await walk(path);
    }
  };
  await walk(root);
  if (files.length) {
    for (let i = 0; i < files.length; i += 100) {
      const { error } = await supabase.storage.from("worker-media").remove(files.slice(i, i + 100));
      if (error) throw error;
    }
  }
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient();
    const id = (await params).id;

    // Remove this worker's uploaded media first so permanent deletion does not leave orphaned files.
    await removeWorkerMedia(supabase, id);

    const { error } = await supabase.from("workers").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to delete worker" }, { status: 500 }); }
}
