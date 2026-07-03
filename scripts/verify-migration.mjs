// scripts/verify-migration.mjs
//
// Cara pakai:
//   1. Pastikan dev server jalan duluan di terminal LAIN: npm run dev
//   2. Jalankan: node --env-file=.env.local scripts/verify-migration.mjs
//
// Script ini melakukan 2 pengecekan:
//   A. Bandingkan semua file di public/data dengan isi Blob store
//      -> laporkan file lokal yang belum ke-upload
//   B. Untuk setiap file itu, test fetch ke http://localhost:3000/api/data/...
//      dengan header Referer yang valid (simulasi seperti dipanggil browser)
//      -> laporkan file yang gagal diakses lewat API (bukan status 200)

import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// ==== KONFIGURASI ====
const SOURCE_DIR = './public/data';
const BLOB_PREFIX = 'data';
const API_BASE = 'https://omg-dive.vercel.app/api/data';
const REFERER = 'https://omg-dive.vercel.app/';
const REQUEST_DELAY_MS = 150; // jeda antar request supaya tidak kena rate limit sendiri
// =======================

function getAllFiles(dirPath, baseDir = dirPath) {
  let results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      results.push(relativePath);
    }
  }
  return results;
}

async function getBlobPaths() {
  const paths = new Set();
  let cursor;
  do {
    const result = await list({ prefix: BLOB_PREFIX, cursor, limit: 1000 });
    result.blobs.forEach((b) => paths.add(b.pathname));
    cursor = result.cursor;
  } while (cursor);
  return paths;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('========== BAGIAN A: Cek file lokal vs Blob store ==========\n');

  const localFiles = getAllFiles(SOURCE_DIR);
  console.log(`📁 File lokal ditemukan: ${localFiles.length}`);

  const blobPaths = await getBlobPaths();
  console.log(`☁️  File di Blob store : ${blobPaths.size}\n`);

  const missingInBlob = localFiles.filter(
    (f) => !blobPaths.has(`${BLOB_PREFIX}/${f}`)
  );

  if (missingInBlob.length === 0) {
    console.log('✅ Semua file lokal sudah ada di Blob store.\n');
  } else {
    console.log(`❌ Ada ${missingInBlob.length} file lokal yang BELUM ada di Blob store:`);
    missingInBlob.forEach((f) => console.log(`   - ${f}`));
    console.log('\n   Jalankan ulang: node --env-file=.env.local scripts/migrate-to-blob.mjs\n');
  }

  console.log('========== BAGIAN B: Test tiap file lewat endpoint API ==========\n');
  console.log(`(target: ${API_BASE}, dengan Referer: ${REFERER})\n`);

  let ok = 0;
  let failed = 0;
  const failedList = [];

  for (const [index, relativePath] of localFiles.entries()) {
    const url = `${API_BASE}/${relativePath}`;
    const progress = `[${index + 1}/${localFiles.length}]`;

    try {
      const res = await fetch(url, {
        headers: { Referer: REFERER },
      });

      if (res.status === 200) {
        console.log(`${progress} ✅ 200 - ${relativePath}`);
        ok++;
        // penting: baca/buang body supaya koneksi tidak menggantung
        await res.arrayBuffer();
      } else {
        console.log(`${progress} ❌ ${res.status} - ${relativePath}`);
        failed++;
        failedList.push({ path: relativePath, status: res.status });
      }
    } catch (err) {
      console.log(`${progress} ❌ ERROR - ${relativePath}: ${err.message}`);
      failed++;
      failedList.push({ path: relativePath, status: 'fetch error' });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\n========== RINGKASAN AKHIR ==========');
  console.log(`✅ Berhasil (200)      : ${ok}`);
  console.log(`❌ Gagal               : ${failed}`);
  console.log(`📁 File lokal belum di Blob : ${missingInBlob.length}`);
  console.log('======================================\n');

  if (failed > 0) {
    console.log('Detail yang gagal:');
    failedList.forEach((f) => console.log(`   - [${f.status}] ${f.path}`));
    console.log('\nCatatan:');
    console.log('  - Kalau status 429 -> itu rate limit KITA SENDIRI yang kena karena testing');
    console.log('    beruntun. Coba naikkan REQUEST_DELAY_MS di script ini, atau naikkan');
    console.log('    sementara MAX_REQUESTS di lib/rate-limit.js lalu restart dev server.');
    console.log('  - Kalau status 403 -> cek ALLOWED_ORIGINS di route.js sudah include');
    console.log('    origin/referer yang dipakai script ini.');
    console.log('  - Kalau status 404 -> file belum ke-upload ke Blob (lihat Bagian A di atas).');
  } else if (missingInBlob.length === 0) {
    console.log('🎉 Semua file lokal ada di Blob DAN semua berhasil diakses lewat API proxy.');
  }
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
