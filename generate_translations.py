#!/usr/bin/env python3
"""
generate_translations.py
========================
Scan semua file .tsx/.ts di src/, ekstrak teks Indonesia,
translate ke Inggris via Google Translate (gratis, tanpa API key),
lalu simpan ke messages/id.json dan messages/en.json.

Jalankan SEKALI saja dari root project:
    python generate_translations.py --project-root C:/template-1

Install dependency dulu:
    pip install deep-translator

Output:
    messages/
        id.json   ← teks asli Indonesia
        en.json   ← teks terjemahan Inggris
"""

import re
import sys
import json
import time
import argparse
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    sys.exit("❌  Jalankan dulu: pip install deep-translator")


# ── Config ───────────────────────────────────────────────────────────────────

# Folder yang di-scan
SCAN_DIRS = ["src", "app", "components", "pages"]

# File yang di-skip
SKIP_PATTERNS = [
    "node_modules", ".next", "dist", "build",
    "*.test.*", "*.spec.*", "*.d.ts",
    "menuData", "globals.css",
]

# Teks yang di-skip (terlalu pendek, kode, dll)
SKIP_TEXTS = {
    "en", "id", "EN", "ID", "px", "rem", "vh", "vw",
    "OK", "N/A", "URL", "API", "RGB", "PDF",
}


# ── Text extraction ───────────────────────────────────────────────────────────

def is_indonesian(text: str) -> bool:
    """Filter teks yang bukan natural language."""
    if re.search(r'[{}<>$@#|\\]', text):
        return False
    if re.match(r'^[a-z][a-zA-Z0-9]*$', text):
        return False
    if text.startswith(('http', '/', './')) or '.com' in text or '.id' in text:
        return False
    if text.isupper() and len(text) > 3:
        return False
    if re.match(r'^[\d\s.,%-]+$', text):
        return False
    english_words = {
        'the', 'and', 'or', 'is', 'are', 'was', 'were', 'to', 'of',
        'in', 'on', 'at', 'for', 'with', 'this', 'that', 'from',
        'our', 'your', 'we', 'you', 'it', 'its', 'be', 'by', 'an',
        'explore', 'dive', 'discover', 'view', 'map', 'data', 'site',
        'welcome', 'contact', 'about', 'home', 'back', 'next', 'save',
        'login', 'logout', 'sign', 'submit', 'cancel', 'close', 'open',
    }
    words = set(text.lower().split())
    has_english = bool(words & english_words)
    has_multiple_words = len(text.split()) >= 2
    has_capital = bool(re.search(r'[A-Z]', text[1:] if text else ''))

    return has_english or (has_multiple_words and has_capital)


def extract_texts_from_file(filepath: Path) -> set:
    """Ekstrak semua teks natural language dari file TSX/TS."""
    texts = set()
    try:
        content = filepath.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return texts

    patterns = [
        # Teks di antara tag JSX: >Teks di sini<
        r'>\s*([A-Za-z][^<>{}\n\r]{2,120}?)\s*<',
        # Attribute string: title="..." placeholder="..." alt="..." aria-label="..."
        r'(?:title|placeholder|alt|aria-label|label|description)=["\'`]([^"\'`\n]{3,120})["\`\'`]',
        # String literal yang panjang (kemungkinan UI text)
        r'["\'`]([A-Z][a-z].*?(?:\.|\?|!|nya|kan|lah|pun))["\`\'`]',
    ]

    for pat in patterns:
        for m in re.finditer(pat, content, re.MULTILINE):
            t = m.group(1).strip()
            t = re.sub(r'\s+', ' ', t)  # normalize whitespace
            if (
                3 <= len(t) <= 150
                and t not in SKIP_TEXTS
                and is_indonesian(t)
            ):
                texts.add(t)

    return texts


def scan_project(root: Path) -> list:
    """Scan seluruh project dan kumpulkan semua teks unik."""
    all_texts = set()
    scanned = 0

    for scan_dir in SCAN_DIRS:
        target = root / scan_dir
        if not target.exists():
            continue

        for filepath in target.rglob("*.tsx"):
            # Skip file yang tidak perlu
            skip = False
            for pat in SKIP_PATTERNS:
                if pat.replace('*', '') in str(filepath):
                    skip = True
                    break
            if skip:
                continue

            texts = extract_texts_from_file(filepath)
            all_texts.update(texts)
            scanned += 1

        for filepath in target.rglob("*.ts"):
            skip = False
            for pat in SKIP_PATTERNS:
                if pat.replace('*', '') in str(filepath):
                    skip = True
                    break
            if skip:
                continue

            texts = extract_texts_from_file(filepath)
            all_texts.update(texts)
            scanned += 1

    print(f"  📂  Scanned {scanned} files, found {len(all_texts)} unique texts")
    return sorted(all_texts)


# ── Translation ───────────────────────────────────────────────────────────────

def translate_batch(texts: list, batch_size: int = 20) -> dict:
    """
    Translate list teks ID → EN via Google Translate (gratis).
    Pakai batching untuk efisiensi dan hindari rate limit.
    """
    translator = GoogleTranslator(source='en', target='id')
    results = {}
    total = len(texts)

    for i in range(0, total, batch_size):
        batch = texts[i:i + batch_size]
        print(f"  🔄  Translating {i+1}–{min(i+batch_size, total)} / {total} ...")

        for text in batch:
            if text in results:
                continue
            try:
                translated = translator.translate(text)
                results[text] = translated if translated else text
                time.sleep(0.1)  # rate limit courtesy
            except Exception as e:
                print(f"       ⚠  Skip '{text[:40]}...' — {e}")
                results[text] = text  # fallback: teks asli

        # Jeda antar batch
        if i + batch_size < total:
            time.sleep(0.5)

    return results


# ── Save JSON ─────────────────────────────────────────────────────────────────

def save_json(data: dict, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size = path.stat().st_size / 1024
    print(f"  💾  Saved {path} ({size:.1f} KB, {len(data)} entries)")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Extract & translate TSX texts")
    parser.add_argument("--project-root", "-p", default=".",
                        help="Root Next.js project (default: .)")
    parser.add_argument("--no-translate", action="store_true",
                        help="Hanya ekstrak teks, skip translate")
    parser.add_argument("--output-dir", default="messages",
                        help="Output folder (default: messages/)")
    args = parser.parse_args()

    root    = Path(args.project_root).resolve()
    out_dir = root / args.output_dir

    print(f"\n{'='*56}")
    print(f"  Translation Generator")
    print(f"  Root   : {root}")
    print(f"  Output : {out_dir}")
    print(f"{'='*56}\n")

    # Step 1: Scan
    print("━━━  STEP 1: Scanning TSX files  ━━━")
    texts = scan_project(root)

    if not texts:
        print("  ⚠  Tidak ada teks yang ditemukan. Cek folder src/")
        return

    # Preview
    print(f"\n  Preview (10 pertama):")
    for t in texts[:10]:
        print(f"    • {t}")
    if len(texts) > 10:
        print(f"    ... dan {len(texts) - 10} lainnya")

    # Step 2: Simpan ID JSON
    print(f"\n━━━  STEP 2: Saving ID JSON  ━━━")
    id_dict = {text: text for text in texts}
    save_json(id_dict, out_dir / "en.json") 

    if args.no_translate:
        print("\n  --no-translate aktif, skip step translate.")
        print(f"\n{'='*56}")
        print(f"  Selesai. Edit {out_dir}/en.json secara manual.")
        print(f"{'='*56}\n")
        # Buat en.json kosong sebagai template
        save_json(en_dict, out_dir / "id.json")
        return

    # Step 3: Translate
    print(f"\n━━━  STEP 3: Translating ID → EN  ━━━")
    print(f"  Menggunakan Google Translate (gratis, tanpa API key)")
    print(f"  {len(texts)} teks akan ditranslate...\n")

    translations = translate_batch(texts)

    # Step 4: Simpan EN JSON
    print(f"\n━━━  STEP 4: Saving EN JSON  ━━━")
    en_dict = {text: translations.get(text, text) for text in texts}
    save_json(en_dict, out_dir / "en.json")

    # Summary
    success = sum(1 for k, v in en_dict.items() if v != k)
    print(f"\n{'='*56}")
    print(f"  Selesai!")
    print(f"  ✅  {success} teks berhasil ditranslate")
    print(f"  ⚠   {len(texts) - success} teks tidak berubah (mungkin sudah Inggris)")
    print(f"\n  Langkah selanjutnya:")
    print(f"  1. Cek hasil di {out_dir}/en.json")
    print(f"  2. Edit manual jika ada yang kurang tepat")
    print(f"  3. Jalankan: npm install next-intl")
    print(f"{'='*56}\n")


if __name__ == "__main__":
    main()