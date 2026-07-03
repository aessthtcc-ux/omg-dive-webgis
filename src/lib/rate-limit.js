// lib/rate-limit.js
//
// Rate limiter sederhana berbasis in-memory (Map).
//
// PENTING - keterbatasan:
// Vercel Functions berjalan di banyak instance/region yang terpisah,
// dan Map ini akan RESET setiap kali instance cold-start.
// Artinya ini BUKAN rate limit yang presisi/global, tapi tetap berguna
// sebagai lapisan penghalang dasar terhadap script scraping sederhana.
//
// Kalau butuh rate limit yang akurat & konsisten di semua region,
// upgrade ke Upstash Redis (@upstash/ratelimit) — gratis untuk trafik kecil.
// Lihat catatan di bagian bawah file ini.

const requestLog = new Map(); // key: IP, value: array of timestamps (ms)

const WINDOW_MS = 60 * 1000; // jendela waktu: 1 menit
const MAX_REQUESTS = 100;     // maksimal 30 request per IP per menit

export function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];

  // buang timestamp yang sudah di luar jendela waktu
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  requestLog.set(ip, recent);

  // housekeeping ringan: cegah Map membengkak tak terbatas
  if (requestLog.size > 5000) {
    const oldestKey = requestLog.keys().next().value;
    requestLog.delete(oldestKey);
  }

  return { allowed: true, remaining: MAX_REQUESTS - recent.length };
}

/*
=== UPGRADE OPSIONAL: Upstash Redis (rate limit lebih akurat) ===

1. npm install @upstash/ratelimit @upstash/redis
2. Buat database Redis gratis di https://upstash.com (atau lewat Vercel Marketplace)
3. Ganti isi file ini dengan:

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '60 s'),
});

export async function checkRateLimit(ip) {
  const { success, remaining } = await ratelimit.limit(ip);
  return { allowed: success, remaining };
}

(lalu tambahkan `await` saat memanggil checkRateLimit di route.js)
*/
