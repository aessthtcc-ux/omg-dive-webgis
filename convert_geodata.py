#!/usr/bin/env python3
"""
convert_geodata.py
==================
Batch convert geodata untuk web mapping yang lebih ringan:
  • GeoJSON  → FlatGeobuf (.fgb)   — vektor lebih cepat + spatial index
  • GeoTIFF  → Cloud Optimized GeoTIFF (COG) — raster lazy-load per tile

CARA PAKAI
----------
    python3 convert_geodata.py --project-root /path/to/nextjs-project

Struktur direktori yang diharapkan (input):
    <project-root>/public/data/
        kontur/   *.geojson
        area/     *.geojson
        linesurvey/ *.geojson
        dem/      *.tif

Output ditulis ke:
    <project-root>/public/data/
        fgb/      *.fgb        (hasil konversi vektor)
        cog/      *.tif        (hasil konversi raster)

Jalankan sekali, lalu update path di Mapping2D.tsx (lihat bagian bawah script).
"""

import os
import sys
import time
import argparse
import json
import shutil
from pathlib import Path

# ── dependency check ────────────────────────────────────────────────────────
try:
    import rasterio
    from rasterio.enums import Resampling
    import numpy as np
except ImportError:
    sys.exit("❌  rasterio tidak ditemukan. Jalankan: pip install rasterio")

try:
    import fiona
except ImportError:
    sys.exit("❌  fiona tidak ditemukan. Jalankan: pip install fiona")


# ── helpers ─────────────────────────────────────────────────────────────────

def human_size(path: Path) -> str:
    s = path.stat().st_size
    for unit in ("B", "KB", "MB", "GB"):
        if s < 1024:
            return f"{s:.1f} {unit}"
        s /= 1024
    return f"{s:.1f} TB"


def ratio(before: int, after: int) -> str:
    if before == 0:
        return "—"
    pct = (1 - after / before) * 100
    sign = "↓" if pct > 0 else "↑"
    return f"{sign}{abs(pct):.0f}%"


def log(symbol: str, msg: str):
    print(f"  {symbol}  {msg}")


# ── FlatGeobuf conversion ────────────────────────────────────────────────────

VECTOR_DIRS = ["kontur", "area", "linesurvey"]

def _has_valid_geometry(feat) -> bool:
    """Return True jika feature punya geometri valid (bukan None / koordinat kosong)."""
    geom = feat.get("geometry")
    if geom is None:
        return False
    coords = geom.get("coordinates")
    if not coords:
        return False
    # Cek nested kosong: MultiLineString [[]] atau LineString []
    if isinstance(coords, (list, tuple)):
        # Flatten satu level untuk MultiGeometry
        inner = coords[0] if coords and isinstance(coords[0], (list, tuple)) else coords
        if not inner:
            return False
    return True


def convert_geojson_to_fgb(src: Path, dst: Path) -> bool:
    """Convert satu GeoJSON → FlatGeobuf, skip fitur dengan geometri kosong/NULL."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        with fiona.open(str(src), "r") as source:
            if len(source) == 0:
                log("⚠", f"SKIP (kosong): {src.name}")
                return False

            schema = source.schema.copy()
            crs    = source.crs

            written = skipped = 0
            with fiona.open(
                str(dst), "w",
                driver="FlatGeobuf",
                schema=schema,
                crs=crs,
            ) as sink:
                for feat in source:
                    if not _has_valid_geometry(feat):
                        skipped += 1
                        continue
                    sink.write(feat)
                    written += 1

        if written == 0:
            log("⚠", f"SKIP (semua geometri kosong): {src.name}")
            dst.unlink(missing_ok=True)
            return False

        before = src.stat().st_size
        after  = dst.stat().st_size
        skip_note = f", skip {skipped} null geom" if skipped else ""
        log("✅", f"{src.name}  →  {dst.name}  "
                   f"({human_size(src)} → {human_size(dst)}, {ratio(before, after)}{skip_note})")
        return True

    except Exception as exc:
        log("❌", f"GAGAL: {src.name} — {exc}")
        if dst.exists():
            dst.unlink()
        return False


def batch_convert_vectors(data_dir: Path, out_dir: Path):
    print("\n━━━  VEKTOR: GeoJSON → FlatGeobuf  ━━━")
    ok = fail = skip = 0
    for sub in VECTOR_DIRS:
        src_dir = data_dir / sub
        if not src_dir.exists():
            log("⚠", f"Direktori tidak ada, skip: {src_dir}")
            continue
        for geojson in sorted(src_dir.glob("*.geojson")):
            dst = out_dir / geojson.with_suffix(".fgb").name
            if dst.exists():
                log("⏭", f"SKIP (sudah ada): {dst.name}")
                skip += 1
                continue
            result = convert_geojson_to_fgb(geojson, dst)
            if result:
                ok += 1
            else:
                fail += 1

    print(f"\n  Vektor selesai — ✅ {ok}  ❌ {fail}  ⏭ {skip}")


# ── COG conversion ────────────────────────────────────────────────────────────

# Pisahkan RGB (3-band uint8) dan elevation (1-band float)
def _is_rgb(src: rasterio.DatasetReader) -> bool:
    return src.count >= 3 and src.dtypes[0] in ("uint8", "uint16")


def convert_tif_to_cog(src_path: Path, dst_path: Path) -> bool:
    """
    Convert GeoTIFF → Cloud Optimized GeoTIFF.

    Strategi kompresi:
      • RGB (uint8/uint16)   → WEBP  (lossy tapi sangat kecil, cocok untuk visual)
      • Elevation (float32)  → DEFLATE (lossless, nilai numerik harus presisi)
    """
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = dst_path.with_suffix(".tmp.tif")

    try:
        with rasterio.open(str(src_path)) as src:
            is_rgb   = _is_rgb(src)
            compress = "WEBP" if is_rgb else "DEFLATE"
            predictor = 2 if not is_rgb else None  # DEFLATE predictor untuk float

            profile = src.profile.copy()
            profile.update(
                driver      = "GTiff",
                tiled       = True,
                blockxsize  = 512,
                blockysize  = 512,
                compress    = compress,
                interleave  = "pixel",
            )
            if predictor:
                profile["predictor"] = predictor

            # Tulis intermediate tiled GeoTIFF
            with rasterio.open(str(tmp), "w", **profile) as dst:
                data = src.read()
                dst.write(data)

                # Build internal overviews (agar zoom-out ringan)
                overview_levels = [2, 4, 8, 16, 32]
                dst.build_overviews(overview_levels, Resampling.average)
                dst.update_tags(ns="rio_overview", resampling="average")

        # Copy-with-COG-layout (GDAL copy dengan copy_src_overviews)
        with rasterio.open(str(tmp)) as src_tiled:
            profile_cog = src_tiled.profile.copy()
            profile_cog.update(
                copy_src_overviews = True,
                tiled              = True,
                blockxsize         = 512,
                blockysize         = 512,
                compress           = compress,
            )
            if predictor:
                profile_cog["predictor"] = predictor

            with rasterio.open(str(dst_path), "w", **profile_cog) as dst:
                dst.write(src_tiled.read())

        tmp.unlink(missing_ok=True)

        before = src_path.stat().st_size
        after  = dst_path.stat().st_size
        label  = "RGB" if is_rgb else "Elev"
        log("✅", f"[{label}] {src_path.name}  →  {dst_path.name}  "
                   f"({human_size(src_path)} → {human_size(dst_path)}, {ratio(before, after)})")
        return True

    except Exception as exc:
        log("❌", f"GAGAL: {src_path.name} — {exc}")
        tmp.unlink(missing_ok=True)
        if dst_path.exists():
            dst_path.unlink()
        return False


def batch_convert_rasters(data_dir: Path, out_dir: Path):
    print("\n━━━  RASTER: GeoTIFF → COG  ━━━")
    dem_dir = data_dir / "dem"
    if not dem_dir.exists():
        log("⚠", f"Direktori tidak ada: {dem_dir}")
        return

    ok = fail = skip = 0
    for tif in sorted(dem_dir.glob("*.tif")):
        dst = out_dir / tif.name
        if dst.exists():
            log("⏭", f"SKIP (sudah ada): {dst.name}")
            skip += 1
            continue
        t0 = time.time()
        result = convert_tif_to_cog(tif, dst)
        elapsed = time.time() - t0
        if result:
            log("⏱", f"  selesai dalam {elapsed:.1f}s")
            ok += 1
        else:
            fail += 1

    print(f"\n  Raster selesai — ✅ {ok}  ❌ {fail}  ⏭ {skip}")


# ── path mapping print ────────────────────────────────────────────────────────

def print_path_mapping(data_dir: Path, fgb_dir: Path, cog_dir: Path):
    """
    Cetak daftar lengkap path lama → path baru untuk di-paste ke Mapping2D.tsx
    """
    print("\n━━━  PATH MAPPING untuk Mapping2D.tsx  ━━━\n")
    print("  Ganti path di layerGroups[] di Mapping2D.tsx:\n")

    # Vector
    print("  ── VEKTOR (GeoJSON → FlatGeobuf) ──")
    for sub in VECTOR_DIRS:
        src_dir = data_dir / sub
        if not src_dir.exists():
            continue
        for f in sorted(src_dir.glob("*.geojson")):
            old = f"/data/{sub}/{f.name}"
            new = f"/data/fgb/{f.with_suffix('.fgb').name}"
            print(f"  {old}")
            print(f"  → {new}\n")

    # Raster
    print("  ── RASTER (GeoTIFF → COG) ──")
    dem_dir = data_dir / "dem"
    if dem_dir.exists():
        for f in sorted(dem_dir.glob("*.tif")):
            old = f"/data/dem/{f.name}"
            new = f"/data/cog/{f.name}"
            print(f"  {old}")
            print(f"  → {new}\n")


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Convert geodata ke format web-optimized")
    parser.add_argument(
        "--project-root", "-p",
        default=".",
        help="Root direktori Next.js project (default: direktori saat ini)"
    )
    parser.add_argument(
        "--only", choices=["vector", "raster"],
        help="Konversi hanya vektor atau hanya raster (default: keduanya)"
    )
    parser.add_argument(
        "--force", "-f",
        action="store_true",
        help="Timpa file output yang sudah ada"
    )
    args = parser.parse_args()

    root     = Path(args.project_root).resolve()
    data_dir = root / "public" / "data"
    fgb_dir  = data_dir / "fgb"
    cog_dir  = data_dir / "cog"

    if not data_dir.exists():
        sys.exit(f"❌  Direktori tidak ditemukan: {data_dir}\n"
                 f"   Pastikan --project-root menunjuk ke root Next.js project.")

    print(f"\n{'='*56}")
    print(f"  GeoData Web Optimizer")
    print(f"  Input : {data_dir}")
    print(f"  FGB   : {fgb_dir}")
    print(f"  COG   : {cog_dir}")
    print(f"{'='*56}")

    # Hapus output jika --force
    if args.force:
        for d in (fgb_dir, cog_dir):
            if d.exists():
                shutil.rmtree(d)
                log("🗑", f"Dihapus (--force): {d}")

    t_start = time.time()

    if args.only != "raster":
        batch_convert_vectors(data_dir, fgb_dir)

    if args.only != "vector":
        batch_convert_rasters(data_dir, cog_dir)

    print_path_mapping(data_dir, fgb_dir, cog_dir)

    elapsed = time.time() - t_start
    print(f"\n{'='*56}")
    print(f"  Selesai dalam {elapsed:.1f}s")
    print(f"{'='*56}\n")


if __name__ == "__main__":
    main()