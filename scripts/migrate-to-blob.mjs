// scripts/migrate-to-blob.mjs
//
// Cara pakai:
//   1. Taruh file ini di folder: scripts/migrate-to-blob.mjs
//   2. Pastikan .env.local sudah ada BLOB_READ_WRITE_TOKEN (hasil `vercel env pull`)
//   3. Jalankan: node --env-file=.env.local scripts/migrate-to-blob.mjs
//      (kalau Node < 20, install dotenv dulu: npm install dotenv
//       lalu ganti baris "import 'dotenv/config'" seperti di bawah)
//
// Script ini akan:
//   - Scan semua file di dalam SOURCE_DIR (default: public/data)
//   - Upload tiap file ke Blob store dengan path yang sama (mempertahankan struktur folder)
//   - Skip file yang sudah pernah di-upload (dicek dari nama file yang sama)
//   - Cetak ringkasan di akhir: berapa berhasil, berapa gagal

import 'dotenv/config'; // hapus baris ini kalau pakai Node 20+ dengan --env-file
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// ==== KONFIGURASI ====
const SOURCE_DIR = './public/data';   // folder sumber file yang mau dipindah
const BLOB_PREFIX = 'data';           // prefix path di dalam Blob store
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
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

async function getExistingBlobPaths() {
  const existing = new Set();
  let cursor;
  do {
    const result = await list({ prefix: BLOB_PREFIX, cursor, limit: 1000 });
    result.blobs.forEach((b) => existing.add(b.pathname));
    cursor = result.cursor;
  } while (cursor);
  return existing;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN tidak ditemukan. Jalankan `vercel env pull .env.local` dulu.');
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Folder sumber tidak ditemukan: ${SOURCE_DIR}`);
    process.exit(1);
  }

  console.log(`🔍 Mengecek file yang sudah pernah di-upload...`);
  const existingPaths = await getExistingBlobPaths();
  console.log(`   Ditemukan ${existingPaths.size} file sudah ada di Blob store.\n`);

  const files = getAllFiles(SOURCE_DIR);
  console.log(`📦 Ditemukan ${files.length} file di ${SOURCE_DIR}\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, file] of files.entries()) {
    const blobPath = `${BLOB_PREFIX}/${file.relativePath}`;
    const progress = `[${index + 1}/${files.length}]`;

    if (existingPaths.has(blobPath)) {
      console.log(`${progress} ⏭️  Skip (sudah ada): ${blobPath}`);
      skipped++;
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(file.fullPath);
      const sizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);

      console.log(`${progress} ⬆️  Uploading: ${blobPath} (${sizeMB} MB)...`);

      const blob = await put(blobPath, fileBuffer, {
        access: 'private',
        addRandomSuffix: false, // supaya nama file tetap sama, tidak ditambah suffix acak
      });

      console.log(`${progress} ✅ Berhasil: ${blob.pathname}`);
      success++;
    } catch (err) {
      console.error(`${progress} ❌ Gagal upload ${blobPath}:`, err.message);
      failed++;
    }
  }

  console.log('\n========== RINGKASAN ==========');
  console.log(`✅ Berhasil upload : ${success}`);
  console.log(`⏭️  Dilewati (sudah ada): ${skipped}`);
  console.log(`❌ Gagal           : ${failed}`);
  console.log('================================\n');

  if (failed === 0) {
    console.log('🎉 Semua file berhasil dipindah ke private Blob store.');
    console.log('   Langkah selanjutnya: hapus file dari folder public/data setelah kamu verifikasi manual.');
  } else {
    console.log('⚠️  Ada file yang gagal. Cek pesan error di atas, lalu jalankan ulang script ini');
    console.log('   (file yang sudah berhasil akan otomatis di-skip di run berikutnya).');
  }
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
