import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const DEFAULT_SUPABASE_URL = "https://xyplrbzyqershqngrjwo.supabase.co";
function getSupabaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^[\"']|[\"']$/g, "");
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString().replace(/\/$/, "");
  } catch {}
  return DEFAULT_SUPABASE_URL;
}
const url = getSupabaseUrl();
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

export async function GET(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const checkSlug = searchParams.get("checkSlug");
    const excludeId = searchParams.get("excludeId");
    const supabase = getAdminClient();

    if (checkSlug) {
      let q = supabase.from("workers").select("id").eq("slug", checkSlug).limit(1);
      if (excludeId) q = q.neq("id", excludeId);
      const { data, error } = await q;
      if (error) throw error;
      return NextResponse.json({ exists: (data || []).length > 0 });
    }

    const { data, error } = await supabase.from("workers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ workers: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to load workers" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const payload = await request.json();
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("workers").insert({ ...payload, id: randomUUID() }).select().single();
    if (error) throw error;
    return NextResponse.json({ worker: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create worker" }, { status: 500 });
  }
}
