// src/app/api/marine/route.ts
// ✅ Server-side proxy untuk open-meteo API
// Menghindari CORS crash di Chrome dan browser lain

import { NextRequest, NextResponse } from "next/server";

const MARINE_BASE  = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";

// ✅ FIX: wajib di-set agar API route bekerja meski next.config pakai output: export
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? "-5.70";
  const lon = searchParams.get("lon") ?? "106.60";

  const controller = new AbortController();
  // Timeout 8 detik agar tidak hang
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const [marineRes, weatherRes] = await Promise.all([
      fetch(
        `${MARINE_BASE}?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period,ocean_current_velocity&timezone=Asia%2FJakarta`,
        { signal: controller.signal, next: { revalidate: 300 } } // cache 5 menit
      ),
      fetch(
        `${WEATHER_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation&timezone=Asia%2FJakarta`,
        { signal: controller.signal, next: { revalidate: 300 } }
      ),
    ]);

    clearTimeout(timeout);

    if (!marineRes.ok || !weatherRes.ok) {
      return NextResponse.json(
        { error: "Upstream API error", status: marineRes.status },
        { status: 502 }
      );
    }

    const [marineJson, weatherJson] = await Promise.all([
      marineRes.json(),
      weatherRes.json(),
    ]);

    const data = {
      waveHeight:   marineJson?.current?.wave_height            ?? 0,
      wavePeriod:   marineJson?.current?.wave_period            ?? 0,
      oceanCurrent: marineJson?.current?.ocean_current_velocity ?? 0,
      waterTemp:    weatherJson?.current?.temperature_2m        ?? 0,
      windSpeed:    weatherJson?.current?.wind_speed_10m        ?? 0,
      precipitation:weatherJson?.current?.precipitation         ?? 0,
    };

    return NextResponse.json(data, {
      headers: {
        // Izinkan semua origin — karena ini server kita sendiri, aman
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}