import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function makeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function text(value) { return String(value ?? "").trim(); }
function firstPoint(rows) {
  return (rows || []).find((row) => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude))) || null;
}

export async function GET(request) {
  try {
    const client = makeClient();
    if (!client) return NextResponse.json({ workers: [], configurationError: "Supabase environment variables are missing." }, { status: 200 });

    const q = text(new URL(request.url).searchParams.get("q")).toLowerCase();
    const [profilesResult, areasResult, availabilityResult] = await Promise.all([
      client.from("public_worker_profiles").select("id,slug,ipuc,worker_id,full_name,profession,experience,service_area,hero_slides,phone,primary_skill,services,working_hours,working_shift,about,verifications,photos,videos"),
      client.from("worker_service_areas").select("worker_id,city,locality,latitude,longitude,radius_km"),
      client.from("worker_availability").select("worker_id,is_available,day_of_week,start_time,end_time"),
    ]);

    const firstError = profilesResult.error || areasResult.error || availabilityResult.error;
    if (firstError && !profilesResult.data) {
      return NextResponse.json({ workers: [], configurationError: firstError.message || "Worker data could not be read." }, { status: 200 });
    }

    const profiles = profilesResult.data || [];
    const areas = areasResult.data || [];
    const availability = availabilityResult.data || [];
    const areasByWorker = new Map();
    for (const row of areas) {
      const id = row.worker_id;
      if (!id) continue;
      if (!areasByWorker.has(id)) areasByWorker.set(id, []);
      areasByWorker.get(id).push(row);
    }
    const availabilityByWorker = new Map();
    for (const row of availability) {
      if (!row.worker_id) continue;
      if (!availabilityByWorker.has(row.worker_id)) availabilityByWorker.set(row.worker_id, []);
      availabilityByWorker.get(row.worker_id).push(row);
    }

    const workers = profiles.map((row) => {
      const areaRows = areasByWorker.get(row.id) || [];
      const point = firstPoint(areaRows);
      const availabilityRows = availabilityByWorker.get(row.id) || [];
      const isAvailable = availabilityRows.length ? availabilityRows.some((item) => item.is_available === true) : null;
      const area = point || {};
      return {
        id: row.id,
        slug: row.slug || "",
        ipuc: row.ipuc || "",
        workerId: row.worker_id || "",
        fullName: row.full_name || "",
        profession: row.profession || "",
        experience: row.experience || "",
        primarySkill: row.primary_skill || "",
        services: Array.isArray(row.services) ? row.services : [],
        serviceArea: Array.isArray(row.service_area) ? row.service_area : [],
        city: area.city || "",
        locality: area.locality || "",
        latitude: Number(area.latitude),
        longitude: Number(area.longitude),
        radiusKm: Number(area.radius_km),
        isAvailable,
        workingHours: row.working_hours || "",
        verification: row.verifications || {},
      };
    }).filter((worker) => Number.isFinite(worker.latitude) && Number.isFinite(worker.longitude));

    const filtered = q ? workers.filter((worker) => [worker.workerId, worker.ipuc, worker.slug, worker.fullName, worker.profession, worker.primarySkill, worker.city, worker.locality, ...(worker.services || [])].join(" ").toLowerCase().includes(q)) : workers;
    return NextResponse.json({ workers: filtered, configurationError: firstError?.message || "" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ workers: [], error: error?.message || "Could not load worker map data." }, { status: 500 });
  }
}
