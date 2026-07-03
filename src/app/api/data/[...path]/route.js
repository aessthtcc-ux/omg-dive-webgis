// app/api/data/[...path]/route.js
//
// Proxy untuk menyajikan file dari private Vercel Blob store.
// Menggantikan file statis publik di public/data/... yang sebelumnya
// bisa didownload langsung lewat DevTools Network tab.
//
// Proteksi yang diterapkan di sini:
//   1. Origin/Referer check  -> tolak request dari luar domain sendiri
//   2. Rate limiting per IP  -> tolak request bertubi-tubi (indikasi scraping)
//   3. File di-stream dari Blob PRIVATE, jadi URL asli Blob tidak pernah
//      terekspos ke client -- yang terlihat di Network tab cuma URL API ini.
//
// CATATAN JUJUR: karena situs ini publik tanpa login, proteksi ini
// TIDAK mencegah 100% orang mengambil data (siapa pun yang buka peta
// tetap bisa lihat responsnya di Network tab). Tujuannya membuat proses
// itu tidak praktis untuk di-otomasi/di-scrape massal, dan mencegah
// orang lain nge-hotlink file kamu dari situs mereka sendiri.

import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Ganti sesuai domain asli kamu. Bisa lebih dari satu (misal domain custom + vercel.app)
const ALLOWED_ORIGINS = [
  'https://omg-dive.vercel.app',
  'http://localhost:3000',
];

const BLOB_PREFIX = 'data'; // harus sama dengan BLOB_PREFIX di script migrasi

function isAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Request langsung dari browser navigasi (bukan fetch/XHR) biasanya
  // tidak mengirim header 'origin'. Kita fallback cek 'referer'.
  if (origin) {
    return ALLOWED_ORIGINS.includes(origin);
  }
  if (referer) {
    return ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed));
  }

  // Tidak ada origin maupun referer sama sekali (misal orang paste URL
  // langsung di address bar browser, atau tool seperti curl/Postman)
  // -> tolak.
  return false;
}

function getClientIp(request) {
  // Vercel meneruskan IP asli lewat header ini
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request, { params }) {
  const { path } = await params;
  // 1. Cek Origin/Referer
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: 'Forbidden: invalid origin' },
      { status: 403 }
    );
  }

  // 2. Rate limiting
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests, coba lagi sebentar' },
      { status: 429 }
    );
  }

  // 3. Ambil path file dari URL, mis. /api/data/dem/DEM_Tabularasa.tif
  //    -> params.path = ['dem', 'DEM_Tabularasa.tif']
  const relativePath = path.join('/');
  const blobPath = `${BLOB_PREFIX}/${relativePath}`;

  try {
    const result = await get(blobPath, { access: 'private' });

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        // private, no-cache -> browser boleh cache tapi wajib revalidate,
        // tidak bisa dishare/diakses ulang lewat CDN publik
        'Cache-Control': 'private, no-cache',
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  } catch (err) {
    console.error(`Blob fetch error for ${blobPath}:`, err.message);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
