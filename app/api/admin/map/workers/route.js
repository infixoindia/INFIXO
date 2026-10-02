import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://xyplrbzyqershqngrjwo.supabase.co";

function getSupabaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString().replace(/\/$/, "");
  } catch {}
  return DEFAULT_SUPABASE_URL;
}

function isAdmin(request) {
  const expected = process.env.INFIXO_ADMIN_SECRET;
  return !!expected && request.cookies.get("infixo_admin")?.value === expected;
}

const norm = (value) => String(value ?? "").trim().toLowerCase();

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!serviceKey) {
    return NextResponse.json({
      workers: [],
      totalWorkers: 0,
      configurationError: "SUPABASE_SERVICE_ROLE_KEY is not configured. Add the server-only Supabase service-role key to the deployment environment to load live workers.",
    });
  }

  try {
    const query = norm(new URL(request.url).searchParams.get("q"));
    const supabase = createClient(getSupabaseUrl(), serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from("workers")
      .select("id,worker_id,slug,ipuc,full_name,profession,primary_skill,is_active,worker_service_areas(latitude,longitude,radius_km,city,locality)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const workers = (data || []).map((worker) => {
      const areas = Array.isArray(worker.worker_service_areas) ? worker.worker_service_areas : [];
      const area = areas.find((item) => Number.isFinite(Number(item?.latitude)) && Number.isFinite(Number(item?.longitude))) || null;
      return {
        id: worker.id,
        workerId: worker.worker_id || "",
        slug: worker.slug || "",
        ipuc: worker.ipuc || "",
        fullName: worker.full_name || "",
        profession: worker.profession || worker.primary_skill || "",
        isActive: worker.is_active !== false,
        latitude: area ? Number(area.latitude) : null,
        longitude: area ? Number(area.longitude) : null,
        radiusKm: area?.radius_km == null ? null : Number(area.radius_km),
        locality: area?.locality || "",
        city: area?.city || "",
      };
    }).filter((worker) => !query || [worker.workerId, worker.fullName, worker.profession, worker.ipuc, worker.slug].some((value) => norm(value).includes(query)));

    return NextResponse.json({ workers, totalWorkers: data?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Failed to load map workers" }, { status: 500 });
  }
}
