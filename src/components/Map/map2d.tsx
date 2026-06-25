"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, Layers,
  Map as MapIcon, Info, Eye, EyeOff, 
  List, MousePointer2, Activity, Image as ImageIcon, Box
} from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== 'undefined') {
  (window as any).L = L;
}

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),    { ssr: false });
const GeoJSON      = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON),      { ssr: false });
const ZoomControl  = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl),  { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then((mod) => mod.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then((mod) => mod.Popup),        { ssr: false });
const Pane         = dynamic(() => import("react-leaflet").then((mod) => mod.Pane),         { ssr: false });

const AutoFitBounds = ({ geoData }: { geoData: Record<string, any> }) => {
  const { useMap: useMapLeaflet } = require("react-leaflet");
  const map = useMapLeaflet();
  useEffect(() => {
    const ids = Object.keys(geoData);
    if (!ids.length || !map) return;
    const group = new L.FeatureGroup();
    ids.forEach(id => {
      if (geoData[id]?.features) {
        try { group.addLayer(L.geoJSON(geoData[id])); } catch (e) {}
      }
    });
    const bounds = group.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [70, 70], maxZoom: 20 });
  }, [geoData, map]);
  return null;
};

// ---------------------------------------------------------------------------
// PinMarkers — tidak diubah
// ---------------------------------------------------------------------------
const PinMarkers = () => {
  const pins = [
    { id: "tabularasa", lat: -5.751326, lng: 106.618027, label: "Tabularasa Wreck", color: "#ec4899" },
    { id: "poso",       lat: -5.705181, lng: 106.596702, label: "Poso Wreck",       color: "#f97316" },
  ];

  const createPinIcon = (color: string) => {
    if (typeof window === "undefined") return undefined;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <defs>
          <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
          </filter>
        </defs>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26S32 26.5 32 16C32 7.163 24.837 0 16 0z"
              fill="${color}" filter="url(#shadow)"/>
        <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
        <circle cx="16" cy="16" r="4" fill="${color}"/>
      </svg>
    `;
    return L.divIcon({
      html: svg,
      className: "",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -44],
    });
  };

  return (
    <>
      {pins.map(pin => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          // @ts-ignore
          icon={createPinIcon(pin.color)}
        >
          <Popup>
            <div className="p-1">
              <div className="text-[10px] font-black uppercase tracking-widest border-b border-gray-100 mb-1.5 pb-1" style={{ color: pin.color }}>
                Survey Site
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">{pin.label}</div>
              <div className="text-[11px] text-gray-500 mt-1 font-mono">
                {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------
// GeoTIFFLayer — sama seperti sebelumnya, hanya path berubah ke /data/cog/
// ---------------------------------------------------------------------------
const GeoTIFFLayer = ({ url, elevUrl, isVisible, title }: {
  url: string;
  elevUrl?: string;
  isVisible: boolean;
  title: string;
}) => {
  const { useMap: useMapLeaflet } = require("react-leaflet");
  const map          = useMapLeaflet();
  const layerRef     = useRef<any>(null);
  const georasterRef = useRef<any>(null);
  const elevRef      = useRef<any>(null);
  const tooltipRef   = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (document.getElementById('dem-tip-css')) return;
    const s = document.createElement('style');
    s.id = 'dem-tip-css';
    s.textContent = `
      @keyframes dem-in {
        from { opacity:0; transform:scale(0.93) translateY(4px); }
        to   { opacity:1; transform:scale(1)    translateY(0); }
      }
      @keyframes dem-dot {
        0%,100% { opacity:1; transform:scale(1); }
        50%      { opacity:0.35; transform:scale(1.6); }
      }
      .dem-in  { animation: dem-in  0.14s cubic-bezier(.21,.47,.32,.98) both; }
      .dem-dot { animation: dem-dot 1.6s ease-in-out infinite; }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const div = document.createElement("div");
    div.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      display: none;
      width: 196px;
    `;
    document.body.appendChild(div);
    tooltipRef.current = div;
    return () => { if (div.parentNode) document.body.removeChild(div); };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      if (layerRef.current && map) {
        layerRef.current._cleanupEvents?.();
        map.removeLayer(layerRef.current);
        layerRef.current = null;
        georasterRef.current = null;
        elevRef.current = null;
      }
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
      return;
    }
    if (!map || layerRef.current) return;

    let isMounted = true;

    const load = async () => {
      try {
        // @ts-ignore
        const parseGeoraster = (await import('georaster')).default;
        // @ts-ignore
        const GeoRasterLayer = (await import('georaster-layer-for-leaflet')).default;

        // ── COG: fetch dengan range-request agar hanya tile yang dibutuhkan
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
        const buf = await res.arrayBuffer();
        if (!isMounted) return;

        const gr = await parseGeoraster(buf);
        georasterRef.current = gr;

        if (elevUrl) {
          try {
            const resE = await fetch(elevUrl);
            if (resE.ok) {
              const bufE = await resE.arrayBuffer();
              if (isMounted) elevRef.current = await parseGeoraster(bufE);
            } else {
              console.warn(`Elevation file not found: ${elevUrl}`);
            }
          } catch { console.warn(`Could not load: ${elevUrl}`); }
        }

        const layer = new GeoRasterLayer({
          georaster: gr, opacity: 0.9, resolution: 256,
          pixelValuesToColorFn: (v: any) => {
            if (v[0] === gr.noDataValue || v[0] === undefined || isNaN(v[0]) || v[0] === 0) return null;
            if (v.length >= 3) return `rgb(${Math.round(v[0])},${Math.round(v[1])},${Math.round(v[2])})`;
            const mn = gr.mins[0], mx = gr.maxs[0], range = (mx - mn) || 1;
            const p = Math.max(0, Math.min(1, (v[0] - mn) / range));
            let r=0,g=0,b=0;
            if      (p<.25){r=0;g=Math.round(4*p*255);b=255;}
            else if (p<.5) {r=0;g=255;b=Math.round(255-4*(p-.25)*255);}
            else if (p<.75){r=Math.round(4*(p-.5)*255);g=255;b=0;}
            else            {r=255;g=Math.round(255-4*(p-.75)*255);b=0;}
            return `rgba(${r},${g},${b},0.9)`;
          },
        });

        if (isMounted) {
          layer.addTo(map);
          layerRef.current = layer;
          const b = layer.getBounds();
          if (b?.isValid()) map.fitBounds(b, { padding:[50,50], maxZoom:20 });
        }

        const accentFor = (z: number | null) =>
          !z || z >= 0 ? { fg:"#34d399", glow:"rgba(52,211,153,0.35)",  bg:"rgba(52,211,153,0.08)"  } :
          z > -5       ? { fg:"#67e8f9", glow:"rgba(103,232,249,0.35)", bg:"rgba(103,232,249,0.08)" } :
          z > -15      ? { fg:"#60a5fa", glow:"rgba(96,165,250,0.35)",  bg:"rgba(96,165,250,0.08)"  } :
          z > -30      ? { fg:"#818cf8", glow:"rgba(129,140,248,0.35)", bg:"rgba(129,140,248,0.08)" } :
                         { fg:"#a78bfa", glow:"rgba(167,139,250,0.35)", bg:"rgba(167,139,250,0.08)" };

        const buildHTML = (
          lat: number, lng: number,
          zValue: number | null,
          rVal: number, gVal: number, bVal: number
        ) => {
          const ac   = accentFor(zValue);
          const hasZ = zValue !== null;
          const isD  = hasZ && zValue! < 0;
          const zAbs = hasZ ? Math.abs(zValue!).toFixed(3) : null;
          const maxD = 50;
          const barW = isD ? Math.min(100, (Math.abs(zValue!)/maxD)*100) : 0;

          return `
            <div class="dem-in" style="
              background: linear-gradient(145deg,rgba(6,12,28,0.97),rgba(12,22,48,0.97));
              border: 1px solid rgba(255,255,255,0.09);
              border-radius: 14px;
              overflow: hidden;
              box-shadow: 0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07);
              font-family: ui-sans-serif,system-ui,sans-serif;
            ">
              <div style="background:${ac.bg};border-bottom:1px solid rgba(255,255,255,0.06);padding:7px 11px;display:flex;align-items:center;gap:6px;">
                <div class="dem-dot" style="width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${ac.fg};box-shadow:0 0 7px ${ac.glow};"></div>
                <span style="color:rgba(255,255,255,0.45);font-size:8.5px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${title}</span>
              </div>
              <div style="padding:10px 11px 9px;">
                <div style="color:rgba(255,255,255,0.25);font-size:7.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:2px;">
                  ${hasZ ? (isD ? "DEPTH" : "DEPTH") : "Z VALUE"}
                </div>
                <div style="display:flex;align-items:baseline;gap:3px;margin-bottom:${isD?'7px':'10px'};">
                  ${isD?`<span style="color:rgba(255,255,255,0.2);font-size:17px;font-weight:300;line-height:1;">−</span>`:''}
                  <span style="color:${hasZ?ac.fg:'rgba(255,255,255,0.25)'};font-size:${hasZ?'24px':'12px'};font-weight:900;letter-spacing:-0.04em;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 16px ${ac.glow};">
                    ${hasZ ? zAbs : 'N/A'}
                  </span>
                  ${hasZ?`<span style="color:rgba(255,255,255,0.25);font-size:10px;font-weight:600;margin-bottom:2px;">m</span>`:''}
                </div>
                ${isD ? `
                  <div style="margin-bottom:9px;">
                    <div style="width:100%;height:2.5px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;">
                      <div style="width:${barW}%;height:100%;background:linear-gradient(90deg,${ac.fg}30,${ac.fg});border-radius:99px;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:2.5px;">
                      <span style="color:rgba(255,255,255,0.15);font-size:6.5px;font-weight:700;">0 m</span>
                      <span style="color:rgba(255,255,255,0.15);font-size:6.5px;font-weight:700;">${maxD} m</span>
                    </div>
                  </div>
                ` : ''}
                <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);margin-bottom:8px;"></div>
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">
                  <div style="width:20px;height:20px;border-radius:6px;flex-shrink:0;background:rgb(${rVal},${gVal},${bVal});border:1px solid rgba(255,255,255,0.15);box-shadow:0 0 9px rgba(${rVal},${gVal},${bVal},0.55);"></div>
                  <div>
                    <div style="color:rgba(255,255,255,0.18);font-size:6.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Pixel Color</div>
                    <div style="color:rgba(255,255,255,0.4);font-size:8.5px;font-weight:700;font-family:ui-monospace,monospace;">rgb(${rVal},&thinsp;${gVal},&thinsp;${bVal})</div>
                  </div>
                </div>
                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:7px;padding:4px 7px;display:flex;align-items:center;gap:4px;">
                  <span style="color:rgba(255,255,255,0.18);font-size:7px;">📍</span>
                  <span style="color:rgba(255,255,255,0.28);font-size:7.5px;font-family:ui-monospace,monospace;font-weight:600;">${lat.toFixed(5)}°,&thinsp;${lng.toFixed(5)}°</span>
                </div>
              </div>
            </div>
          `;
        };

        const readPixel = (graster: any, lat: number, lng: number) => {
          const xIdx = Math.floor((lng - graster.xmin) / graster.pixelWidth);
          const yIdx = Math.floor((graster.ymax - lat)  / graster.pixelHeight);
          if (xIdx<0||yIdx<0||xIdx>=graster.width||yIdx>=graster.height) return null;
          return { xIdx, yIdx };
        };

        const processAndShow = (lat: number, lng: number, clientX: number, clientY: number) => {
          const grRGB  = georasterRef.current;
          const grElev = elevRef.current;
          const tip    = tooltipRef.current;
          if (!grRGB || !tip || !layerRef.current) return;

          const bounds = layerRef.current.getBounds?.();
          if (bounds && !bounds.contains([lat, lng])) { tip.style.display="none"; return; }

          const rgbPx = readPixel(grRGB, lat, lng);
          if (!rgbPx) { tip.style.display="none"; return; }

          const rVal = Math.round(grRGB.values[0]?.[rgbPx.yIdx]?.[rgbPx.xIdx] ?? 0);
          const gVal = Math.round(grRGB.values[1]?.[rgbPx.yIdx]?.[rgbPx.xIdx] ?? 0);
          const bVal = Math.round(grRGB.values[2]?.[rgbPx.yIdx]?.[rgbPx.xIdx] ?? 0);
          if (rVal===0 && gVal===0 && bVal===0) { tip.style.display="none"; return; }

          let zValue: number | null = null;
          if (grElev) {
            const elevPx = readPixel(grElev, lat, lng);
            if (elevPx) {
              const raw = grElev.values[0]?.[elevPx.yIdx]?.[elevPx.xIdx];
              if (raw !== undefined && raw !== grElev.noDataValue && !isNaN(raw) && raw !== 0)
                zValue = raw;
            }
          }

          tip.innerHTML = buildHTML(lat, lng, zValue, rVal, gVal, bVal);
          tip.style.display = "block";

          const tw = 204, th = 230;
          const vw = window.innerWidth, vh = window.innerHeight;
          tip.style.left = (clientX + 18 + tw > vw ? clientX - tw - 10 : clientX + 18) + "px";
          tip.style.top  = (clientY + th      > vh ? clientY - th - 10 : clientY + 2)  + "px";
        };

        const onMouseMove = (e: L.LeafletMouseEvent) => {
          processAndShow(e.latlng.lat, e.latlng.lng, e.originalEvent.clientX, e.originalEvent.clientY);
        };
        const onMouseOut = () => {
          if (tooltipRef.current) tooltipRef.current.style.display = "none";
        };

        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        const onTap = (e: L.LeafletMouseEvent) => {
          if (hideTimer) clearTimeout(hideTimer);
          const tip = tooltipRef.current;
          if (!tip) return;
          if (tip.style.display === "block") { tip.style.display = "none"; return; }
          processAndShow(e.latlng.lat, e.latlng.lng, e.originalEvent.clientX, e.originalEvent.clientY);
          if (tip.style.display === "block") {
            hideTimer = setTimeout(() => {
              if (tooltipRef.current) tooltipRef.current.style.display = "none";
            }, 4000);
          }
        };

        if (isMounted) {
          const isTouch = typeof window !== 'undefined' &&
            ('ontouchstart' in window || navigator.maxTouchPoints > 0);

          if (isTouch) {
            map.on("click", onTap);
            layerRef.current._cleanupEvents = () => {
              map.off("click", onTap);
              if (hideTimer) clearTimeout(hideTimer);
            };
          } else {
            map.on("mousemove", onMouseMove);
            map.on("mouseout",  onMouseOut);
            layerRef.current._cleanupEvents = () => {
              map.off("mousemove", onMouseMove);
              map.off("mouseout",  onMouseOut);
            };
          }
        }

      } catch(e) { console.error("GeoTIFF error:", e); }
    };

    load();

    return () => {
      isMounted = false;
      if (layerRef.current) {
        layerRef.current._cleanupEvents?.();
        if (map) map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      georasterRef.current = null;
      elevRef.current = null;
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };
  }, [url, elevUrl, map, isVisible, title]);

  return null;
};

// ---------------------------------------------------------------------------
// ── PERUBAHAN UTAMA: FlatGeobufLayer ────────────────────────────────────────
// Menggantikan fetch().json() biasa dengan parser flatgeobuf yang streaming
// ---------------------------------------------------------------------------
const useFlatGeobuf = (url: string, isActive: boolean) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    if (!isActive || geoJsonData) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { deserialize } = await import("flatgeobuf/lib/mjs/geojson.js");
        const res = await fetch(url);
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const features: any[] = [];
        // flatgeobuf.deserialize streaming — hanya baca header dulu, lalu fitur
        for await (const feature of deserialize(res.body)) {
          if (cancelled) return;
          features.push(feature);
        }

        if (!cancelled) {
          setGeoJsonData({ type: "FeatureCollection", features });
        }
      } catch (err) {
        console.error(`FlatGeobuf load error (${url}):`, err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [url, isActive]);

  return geoJsonData;
};

// ---------------------------------------------------------------------------
// LAYER GROUPS — path diubah ke /data/fgb/ (vektor) dan /data/cog/ (raster)
// Semua config lainnya TIDAK BERUBAH
// ---------------------------------------------------------------------------

const DEM_TO_KONTUR: Record<string, string> = {
  dem_tabularasa: "kontur_tabularasa",
  dem_poso:       "kontur_poso",
};

const layerGroups = [
  {
    groupId: "dem", title: "Digital Elevation Model",
    icon: <ImageIcon size={18} className="text-purple-500" />,
    subLayers: [
      // ── path berubah: /data/dem/ → /data/cog/
      { id: "dem_tabularasa",      filePath: "/data/cog/DEM_Tabularasa_RGB_1m_WGS84.tif",                   elevPath: "/data/cog/DEM_Tabularasa_elev_1m_WGS84.tif",            title: "DEM Tabularasa Shipwreck", project: "Site 1", color: "#8b5cf6", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_poso",            filePath: "/data/cog/DEM_Poso_RGB_1m_WGS84.tif",                         elevPath: "/data/cog/DEM_Poso_elev_0.5m_WGS84.tif",                  title: "DEM Poso Shipwreck",       project: "Site 2", color: "#ec4899", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_perairandangkal", filePath: "/data/cog/DEM_PerairanDangkal_RGB_1m_WGS84.tif",              elevPath: "/data/cog/DEM_PerairanDangkal_elev_1m_WGS84.tif",        title: "DEM Perairan Dangkal",     project: "Site 3", color: "#06b6d4", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_pesisirpanggang", filePath: "/data/cog/DEM_PesisirPanggangRidge_RGB_1m_WGS84.tif",        elevPath: "/data/cog/DEM_PesisirPanggangRidge_elev_1m_WGS84.tif",   title: "DEM Pesisir Panggang",     project: "Site 4", color: "#f97316", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_kanalpramuka",    filePath: "/data/cog/DEM_KanalPramuka_RGB_1m.tif",                       elevPath: "/data/cog/DEM_KanalPramuka_elev_1m_WGS84.tif",           title: "DEM Kanal Pramuka",        project: "Site 5", color: "#22c55e", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_pesisirpramuka",  filePath: "/data/cog/DEM_PesisirPramuka_ProjectALB_RGB_0.5m_WGS84.tif", elevPath: "/data/cog/DEM_PesisirPramuka_ProjectALB_elev_0.5m_WGS84.tif", title: "DEM Pesisir Pramuka", project: "Site 6", color: "#eab308", dash: "0", isDummy: false, isRaster: true },
    ]
  },
  {
    groupId: "kontur", title: "Contour Lines",
    icon: <Activity size={18} className="text-teal-400" />,
    subLayers: [
      // ── path berubah: /data/kontur/*.geojson → /data/fgb/*.fgb
      { id: "kontur_tabularasa", filePath: "/data/fgb/Kontur_Tabularasa_Interval_1m.fgb", title: "Kontur Tabularasa", project: "Site 1", color: "#2dd4bf", dash: "4, 3" },
      { id: "kontur_poso",       filePath: "/data/fgb/Kontur_Poso_Interval_1m.fgb",       title: "Kontur Poso",       project: "Site 2", color: "#fb923c", dash: "4, 3" },
    ]
  },
  {
    groupId: "area", title: "Area Boundaries",
    icon: <Box size={18} className="text-red-500" />,
    subLayers: [
      // ── path berubah: /data/area/*.geojson → /data/fgb/*.fgb
      { id: "aoi_poso", filePath: "/data/fgb/AOI_POSO.fgb",      title: "Poso Wreck",       project: "Poso",       color: "#ef4444", dash: "5, 5", isPolygon: true },
      { id: "aoi_tabu", filePath: "/data/fgb/AOI_TABULARASA.fgb", title: "Tabularasa Wreck", project: "Tabularasa", color: "#ef4444", dash: "5, 5", isPolygon: true },
    ]
  },
  {
    groupId: "survey_lines", title: "Survey Lines",
    icon: <Activity size={18} className="text-blue-500" />,
    subLayers: [
      // ── path berubah: /data/linesurvey/*.geojson → /data/fgb/*.fgb
      { id: "cross_poso",  filePath: "/data/fgb/crossline_poso.fgb",       title: "Crossline Poso",        project: "Poso",       color: "#3b82f6", dash: "5, 10" },
      { id: "cross_tabu",  filePath: "/data/fgb/crossline_tabularasa.fgb", title: "Crossline Tabularasa",  project: "Tabularasa", color: "#3b82f6", dash: "5, 10" },
      { id: "diag_poso",   filePath: "/data/fgb/diagline_poso.fgb",        title: "Diagline Poso",         project: "Poso",       color: "#a855f7", dash: "2, 5" },
      { id: "diag_tabu",   filePath: "/data/fgb/diagline_tabularasa.fgb",  title: "Diagline Tabularasa",   project: "Tabularasa", color: "#a855f7", dash: "2, 5" },
      { id: "main_poso",   filePath: "/data/fgb/mainline_poso2.fgb",       title: "Mainline Poso",         project: "Poso",       color: "#10b981", dash: "0" },
      { id: "main_tabu",   filePath: "/data/fgb/mainline_tabularasa.fgb",  title: "Mainline Tabularasa",   project: "Tabularasa", color: "#10b981", dash: "0" },
      { id: "patch_poso",  filePath: "/data/fgb/patchtest_poso.fgb",       title: "Patch Test Poso",       project: "Poso",       color: "#f59e0b", dash: "0" },
      { id: "patch_tabu",  filePath: "/data/fgb/patchtest_tabularasa.fgb", title: "Patch Test Tabularasa", project: "Tabularasa", color: "#f59e0b", dash: "0" },
    ]
  },
];

const baseMaps = [
  { id: 'osm',       name: 'Open Street Map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                            thumbnail: 'https://a.tile.openstreetmap.org/0/0/0.png' },
  { id: 'satellite', name: 'Satellite',       url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/546/388' },
  { id: 'dark',      name: 'Esri Dark',       url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                                thumbnail: 'https://a.basemaps.cartocdn.com/dark_all/0/0/0.png' },
];

const PANEL_W = { mobile: 280, tablet: 300, desktop: 360 };

const DEFAULT_ACTIVE_SUBLAYERS: Record<string, boolean> = layerGroups
  .flatMap(g => g.subLayers)
  .reduce((acc, sub) => ({
    ...acc,
    [sub.id]: sub.id === "dem_tabularasa" || sub.id === "dem_poso" ||
              sub.id === "kontur_tabularasa" || sub.id === "kontur_poso",
  }), {});

const DEFAULT_ACTIVE_GROUPS: Record<string, boolean> = layerGroups
  .reduce((acc, g) => ({
    ...acc,
    [g.groupId]: g.subLayers.some(s => DEFAULT_ACTIVE_SUBLAYERS[s.id]),
  }), {});

// ---------------------------------------------------------------------------
// VectorLayer — wrapper per-sublayer yang pakai useFlatGeobuf
// Memisahkan state load per layer agar tidak semua load sekaligus
// ---------------------------------------------------------------------------
const VectorLayer = ({
  config,
  isActive,
  geoData,          // legacy: dipakai untuk kontur yang tetap perlu bounds
  onDataReady,
}: {
  config: any;
  isActive: boolean;
  geoData: Record<string, any>;
  onDataReady: (id: string, data: any) => void;
}) => {
  // Deteksi apakah ini file .fgb atau .geojson
  const isFgb = config.filePath.endsWith(".fgb");

  // FlatGeobuf: load on demand
  const fgbData = useFlatGeobuf(isFgb ? config.filePath : "", isActive && isFgb);

  // GeoJSON legacy (fallback jika masih .geojson)
  const legacyData = !isFgb ? geoData[config.id] : null;

  const data = isFgb ? fgbData : legacyData;

  // Beritahu parent saat data siap (untuk AutoFitBounds)
  useEffect(() => {
    if (data) onDataReady(config.id, data);
  }, [data, config.id]);

  if (!isActive || !data?.features?.length) return null;

  // Kontur
  if (["kontur_tabularasa", "kontur_poso"].includes(config.id)) {
    const styleFn = (feature: any) => {
      const elev: number = feature?.properties?.ELEV ?? 0;
      const isIndex = Math.round(Math.abs(elev)) % 5 === 0;
      return {
        color:       config.color,
        weight:      isIndex ? 2.5 : 0.8,
        opacity:     isIndex ? 1   : 0.45,
        fillOpacity: 0,
      };
    };
    return (
      <GeoJSON
        key={`geojson-${config.id}-${data.features.length}`}
        data={data}
        style={styleFn as any}
        eventHandlers={{ contextmenu: e => { const l=e.target; if(l._map) l._map.flyToBounds(l.getBounds(),{padding:[100,100],duration:1.5,maxZoom:20}); }}}
        onEachFeature={(feature, layer: any) => {
          const elev: number = feature?.properties?.ELEV ?? null;
          const isIndex = elev !== null && Math.round(Math.abs(elev)) % 5 === 0;
          layer.bindTooltip(
            elev !== null ? `${elev} m` : config.title,
            { permanent: false, sticky: true, direction: "auto", className: isIndex ? "kontur-index-label" : "" }
          );
          const indexBadge = isIndex
            ? `<span style="background:#0d9488;color:white;font-size:7px;font-weight:800;padding:1px 5px;border-radius:4px;text-transform:uppercase;">INDEX</span>`
            : `<span style="background:#374151;color:#9ca3af;font-size:7px;font-weight:800;padding:1px 5px;border-radius:4px;text-transform:uppercase;">1m</span>`;
          layer.bindPopup(`<div class="p-2">
            <div style="display:flex;align-items:center;gap:6px;" class="border-b border-gray-100 mb-2 pb-1">
              <span class="text-[10px] font-black text-teal-500 uppercase tracking-widest">Contour</span>
              ${indexBadge}
            </div>
            <div class="text-sm font-bold text-gray-800">${elev !== null ? elev + " m" : "N/A"}</div>
            <div class="text-[11px] text-gray-500 mt-1 italic">${config.title} — ${config.project}</div>
          </div>`);
        }}
      />
    );
  }

  // Area & Survey Lines
  const styleFn = {
    color:       config.color,
    weight:      config.isPolygon ? 2 : 4,
    opacity:     0.9,
    dashArray:   config.dash,
    fillColor:   config.color,
    fillOpacity: config.isPolygon ? 0.15 : 0,
  };
  return (
    <GeoJSON
      key={`geojson-${config.id}-${data.features.length}`}
      data={data}
      style={styleFn as any}
      eventHandlers={{ contextmenu: e => { const l=e.target; if(l._map) l._map.flyToBounds(l.getBounds(),{padding:[100,100],duration:1.5,maxZoom:20}); }}}
      onEachFeature={(feature, layer: any) => {
        if (config.isPolygon) {
          const c = layer.getBounds().getCenter();
          layer.bindTooltip(config.title, { permanent: true, direction: "center", className: "permanent-label" });
          layer.bindPopup(`<div class="p-2"><div class="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Area Boundary</div><div class="text-sm font-bold text-gray-800 uppercase">${config.title}</div><div class="text-[11px] text-gray-500 mt-1 italic font-mono">Center: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</div></div>`);
        } else {
          const elev = feature?.properties?.depth ?? feature?.properties?.elevation ?? feature?.properties?.z ?? feature?.properties?.contour ?? null;
          const elevLabel = elev !== null ? `<div class="text-[11px] text-gray-500 mt-1">Elevation: <b>${elev} m</b></div>` : "";
          layer.bindPopup(`<div class="p-2"><div class="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Survey Segment</div><div class="text-sm font-bold text-gray-800 uppercase italic">${config.title}</div><div class="text-[11px] text-gray-500 mt-1 italic">Project: ${config.project}</div>${elevLabel}</div>`);
        }
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Mapping2D — komponen utama, hanya bagian data loading yang berubah
// ---------------------------------------------------------------------------
const Mapping2D = () => {
  const [mounted,       setMounted]       = useState(false);
  const [isPanelOpen,   setIsPanelOpen]   = useState(false);
  const [isLegendOpen,  setIsLegendOpen]  = useState(false);
  const [isBaseMapOpen, setIsBaseMapOpen] = useState(false);
  const [openDesc,      setOpenDesc]      = useState<string | null>(null);
  const [activeBasemap, setActiveBasemap] = useState(baseMaps[1]);

  // ── geoData sekarang hanya diisi oleh VectorLayer.onDataReady (bukan fetch massal)
  const [geoData, setGeoData] = useState<Record<string, any>>({});

  const [winWidth, setWinWidth] = useState(1024);
  useEffect(() => {
    setWinWidth(window.innerWidth);
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [activeGroups,    setActiveGroups]    = useState<Record<string, boolean>>(DEFAULT_ACTIVE_GROUPS);
  const [activeSubLayers, setActiveSubLayers] = useState<Record<string, boolean>>(DEFAULT_ACTIVE_SUBLAYERS);

  useEffect(() => { setMounted(true); }, []);

  // Callback dari VectorLayer saat data siap — untuk AutoFitBounds
  const handleDataReady = (id: string, data: any) => {
    setGeoData(prev => prev[id] ? prev : { ...prev, [id]: data });
  };

  const toggleGroup = (id: string) => {
    const next = !activeGroups[id];
    setActiveGroups(p => ({ ...p, [id]: next }));
    const g = layerGroups.find(g => g.groupId === id);
    if (g) {
      setActiveSubLayers(p => {
        const s = { ...p };
        g.subLayers.forEach(sub => { s[sub.id] = next; });
        if (id === "dem") {
          Object.entries(DEM_TO_KONTUR).forEach(([, konturId]) => { s[konturId] = next; });
          setActiveGroups(pg => ({ ...pg, kontur: next }));
        }
        return s;
      });
    }
  };

  const toggleSubLayer = (id: string) => {
    setActiveSubLayers(p => {
      const next = !p[id];
      const updated = { ...p, [id]: next };
      if (id in DEM_TO_KONTUR) {
        const konturId = DEM_TO_KONTUR[id];
        updated[konturId] = next;
        const anyKonturActive = Object.values(DEM_TO_KONTUR).some(k => updated[k]);
        setActiveGroups(pg => ({ ...pg, kontur: anyKonturActive }));
      }
      layerGroups.forEach(g => {
        const anyActive = g.subLayers.some(s => updated[s.id]);
        setActiveGroups(pg => ({ ...pg, [g.groupId]: anyActive }));
      });
      return updated;
    });
  };

  if (!mounted) return null;

  const panelW     = winWidth >= 1024 ? PANEL_W.desktop : winWidth >= 768 ? PANEL_W.tablet : PANEL_W.mobile;
  const panelLeft  = winWidth >= 1024 ? '1.5rem' : winWidth >= 768 ? '1rem' : '0.5rem';
  const toggleLeft = isPanelOpen ? `calc(${panelLeft} + ${panelW}px + 0.5rem)` : '0.5rem';

  // Semua sublayer vektor (non-raster)
  const vectorSubLayers = layerGroups
    .flatMap(g => g.subLayers)
    .filter((s): s is typeof s & { filePath: string } => !(s as any).isRaster && !(s as any).isDummy);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 pt-24">
      <div className="absolute top-0 left-0 w-full h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-[10] border-b border-gray-200 dark:border-white/5" />
      <style>{`
        .permanent-label { background-color:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.2); color:white; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; padding:4px 8px; border-radius:8px; backdrop-filter:blur(4px); }
        .permanent-label::before { display:none; }
        .kontur-index-label { background:transparent; border:none; box-shadow:none; color:rgba(255,255,255,0.75); font-size:9px; font-weight:800; font-family:ui-monospace,monospace; letter-spacing:0.05em; white-space:nowrap; text-shadow:0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7); pointer-events:none; }
        .kontur-index-label::before { display:none; }
      `}</style>

      <div className="absolute top-24 bottom-0 left-0 right-0 z-0">
        <MapContainer center={[-5.7435, 106.6081]} zoom={14} maxZoom={24} zoomControl={false} className="h-full w-full">
          <TileLayer url={activeBasemap.url} maxZoom={24} maxNativeZoom={19} />
          <AutoFitBounds geoData={geoData} />

          {/* 1 — GeoTIFF COG raster layers */}
          {layerGroups.flatMap(g => g.subLayers).map(config => {
            if (!(config as any).isRaster) return null;
            return (
              <GeoTIFFLayer
                key={`raster-${config.id}`}
                url={config.filePath}
                elevUrl={(config as any).elevPath}
                isVisible={activeSubLayers[config.id]}
                title={config.title}
              />
            );
          })}

          {/* 2 — Kontur (FlatGeobuf) */}
          <Pane name="kontur-pane" style={{ zIndex: 450 }}>
            {layerGroups.flatMap(g => g.subLayers)
              .filter(c => ["kontur_tabularasa", "kontur_poso"].includes(c.id))
              .map(config => (
                <VectorLayer
                  key={config.id}
                  config={config}
                  isActive={activeSubLayers[config.id]}
                  geoData={geoData}
                  onDataReady={handleDataReady}
                />
              ))}
          </Pane>

          {/* 3 — Area + Survey Lines (FlatGeobuf) */}
          <Pane name="vector-pane" style={{ zIndex: 500 }}>
            {vectorSubLayers
              .filter(c => !["kontur_tabularasa", "kontur_poso"].includes(c.id))
              .map(config => (
                <VectorLayer
                  key={config.id}
                  config={config}
                  isActive={activeSubLayers[config.id]}
                  geoData={geoData}
                  onDataReady={handleDataReady}
                />
              ))}
          </Pane>

          {/* 4 — Pin markers */}
          <PinMarkers />

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {/* BASEMAP — tidak berubah */}
      <div className="absolute top-[120px] right-2 md:right-6 z-[1] flex flex-col items-end">
        <button onClick={() => setIsBaseMapOpen(!isBaseMapOpen)}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 hover:scale-105 transition-all">
          <div className="flex flex-col items-end">
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Basemap</span>
            <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white uppercase italic">{activeBasemap.name}</span>
          </div>
          <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-lg shadow-blue-500/30"><MapIcon size={18}/></div>
        </button>
        <AnimatePresence>
          {isBaseMapOpen && (
            <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:10 }} exit={{ opacity:0,y:-10 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-40 md:w-48 flex flex-col gap-2 md:gap-3 mt-2">
              {baseMaps.map(map => (
                <button key={map.id} onClick={() => { setActiveBasemap(map); setIsBaseMapOpen(false); }}
                  className={`relative overflow-hidden rounded-xl md:rounded-2xl h-12 md:h-16 border-2 transition-all ${activeBasemap.id===map.id?'border-blue-500':'border-transparent'}`}>
                  <img src={map.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={map.name}/>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[9px] md:text-[10px] font-black text-white uppercase">{map.name}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOGGLE — tidak berubah */}
      <div className="absolute top-[120px] z-[10] flex flex-col justify-center h-[calc(100vh-160px)] pointer-events-none transition-all duration-500" style={{ left: toggleLeft }}>
        <button onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="w-10 h-20 md:h-24 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 pointer-events-auto"
          aria-label={isPanelOpen?"Close panel":"Open panel"}>
          {isPanelOpen ? <ChevronLeft size={22}/> : <ChevronRight size={22}/>}
        </button>
      </div>

      {/* SIDE PANEL — tidak berubah */}
      <motion.div animate={{ x: isPanelOpen?0:-(panelW+20) }} transition={{ type:"spring", stiffness:260, damping:25 }}
        style={{ width: panelW, left: panelLeft }}
        className="absolute top-[120px] bottom-10 z-[1] pointer-events-none h-[calc(100vh-160px)]">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-4 md:p-5 lg:p-6 flex flex-col pointer-events-auto overflow-hidden h-full">
          <div className="mb-4 shrink-0">
            <h2 className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-2 md:gap-3">
              <Layers className="text-blue-600" size={20}/> 2D <span className="text-blue-600">Data</span>
            </h2>
            <p className="text-[9px] text-gray-400 mt-1.5 flex items-center gap-1">
              <MousePointer2 size={9} className="text-blue-400"/>
              Hover / tap DEM to inspect depth value
            </p>
          </div>
          <div className="flex-1 space-y-3 md:space-y-4 lg:space-y-5 overflow-y-auto pr-1 custom-scrollbar">
            {layerGroups.map(group => (
              <div key={group.groupId} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <button onClick={() => toggleGroup(group.groupId)}
                    className={`p-1.5 rounded-lg transition-all ${activeGroups[group.groupId]?'bg-blue-100 dark:bg-blue-900/30 text-blue-600':'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                    {activeGroups[group.groupId]?<Eye size={14}/>:<EyeOff size={14}/>}
                  </button>
                  <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    {group.icon} {group.title}
                  </h3>
                </div>
                <div className="pl-3 border-l-2 border-gray-100 dark:border-white/5 ml-3 space-y-1.5">
                  {group.subLayers.map(layer => (
                    <div key={layer.id} className="group bg-gray-50/50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all overflow-hidden">
                      <div className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleSubLayer(layer.id)}
                            className={`p-1.5 rounded-lg transition-all ${activeSubLayers[layer.id]?'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md':'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            {activeSubLayers[layer.id]?<Eye size={12}/>:<EyeOff size={12}/>}
                          </button>
                          <div>
                            <h4 className="text-[9px] md:text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight flex items-center gap-1">
                              {layer.title}
                              {(layer as any).isDummy&&<span className="text-[7px] bg-purple-100 text-purple-600 px-1 rounded-sm">Soon</span>}
                              {Object.values(DEM_TO_KONTUR).includes(layer.id) && (
                                <span className="text-[7px] bg-teal-100 text-teal-600 px-1 rounded-sm">auto</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {(layer as any).isRaster
                                ?<div className="w-4 h-2 rounded-sm" style={{ background:'linear-gradient(to right,#1e3a5f,#3b82f6,#10b981,#fbbf24)' }}/>
                                :<div className="w-4 h-0.5 rounded-full" style={{ backgroundColor:layer.color }}/>}
                              <span className="text-[7px] text-gray-400 font-bold uppercase">{layer.project}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setOpenDesc(openDesc===layer.id?null:layer.id)} className="p-1 text-gray-400 hover:text-blue-500">
                          <Info size={12}/>
                        </button>
                      </div>
                      <AnimatePresence>
                        {openDesc===layer.id&&(
                          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }}
                            className="px-3 pb-3 text-[9px] text-gray-500 italic border-t border-gray-100 dark:border-white/5 pt-2 bg-white/50 dark:bg-black/20">
                            {(layer as any).isRaster
                              ? `COG (Cloud Optimized GeoTIFF) — tile-based lazy load. ${layer.title}.`
                              : Object.values(DEM_TO_KONTUR).includes(layer.id)
                                ? `FlatGeobuf — streaming vektor dengan spatial index. Auto aktif/nonaktif mengikuti DEM.`
                                : "FlatGeobuf — streaming vektor dengan spatial index. Right-click to focus."}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* LEGEND DESKTOP — tidak berubah */}
      <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} className="hidden md:block absolute bottom-10 right-6 z-[1] pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-5 lg:p-6 w-56 lg:w-64 pointer-events-auto">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
            <List size={13} className="text-blue-600"/> Map Legend
          </h5>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {layerGroups.map(group => {
                const subs = group.subLayers.filter(s => activeSubLayers[s.id]);
                if (!subs.length) return null;
                return (
                  <motion.div key={`leg-${group.groupId}`} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-2">
                    <h6 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{group.title}</h6>
                    {subs.map(cfg => (
                      <div key={`leg-${cfg.id}`} className="flex items-center justify-between group pl-2">
                        <div className="flex items-center gap-2.5">
                          {(cfg as any).isPolygon?<div className="w-3 h-3 rounded-sm border-2" style={{ borderColor:cfg.color, backgroundColor:`${cfg.color}30` }}/>
                          :(cfg as any).isRaster?<div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-900 to-yellow-200"/>
                          :<div className="w-5 h-1 rounded-full" style={{ backgroundColor:cfg.color, boxShadow:`0 0 6px ${cfg.color}80` }}/>}
                          <span className="text-[9px] lg:text-[10px] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight">{cfg.title}</span>
                        </div>
                        <MousePointer2 size={9} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* LEGEND MOBILE — tidak berubah */}
      <div className="md:hidden absolute bottom-3 right-2 z-[1] pointer-events-auto">
        <button onClick={() => setIsLegendOpen(!isLegendOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border transition-all text-[10px] font-black uppercase tracking-wider ${isLegendOpen?'bg-blue-600 text-white border-blue-700':'bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-white border-gray-200 dark:border-white/10 backdrop-blur-xl'}`}>
          <List size={12}/> Legend
          <ChevronRight size={11} className={`transition-transform ${isLegendOpen?'rotate-90':''}`}/>
        </button>
        <AnimatePresence>
          {isLegendOpen&&(
            <motion.div initial={{ opacity:0,y:8,scale:.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:8,scale:.95 }} transition={{ duration:.2 }}
              className="absolute bottom-full right-0 mb-2 w-52 bg-white/97 dark:bg-gray-900/97 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"/>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Map Legend</span>
              </div>
              <div className="p-2.5 space-y-3 max-h-64 overflow-y-auto">
                {layerGroups.map(group => {
                  const subs = group.subLayers.filter(s => activeSubLayers[s.id]);
                  if (!subs.length) return null;
                  return (
                    <div key={group.groupId}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/10"/>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{group.title}</span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/10"/>
                      </div>
                      <div className="space-y-1">
                        {subs.map(cfg => (
                          <div key={cfg.id} className="flex items-center gap-2 px-1 py-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex-shrink-0 w-8 flex items-center justify-center">
                              {(cfg as any).isPolygon?<div className="w-4 h-4 rounded border-2" style={{ borderColor:cfg.color, backgroundColor:`${cfg.color}25` }}/>
                              :(cfg as any).isRaster?<div className="w-4 h-4 rounded" style={{ background:'linear-gradient(135deg,#1e3a5f,#3b82f6,#10b981,#fbbf24)' }}/>
                              :<div className="w-5 h-[3px] rounded-full" style={{ backgroundColor:cfg.color, boxShadow:`0 0 6px ${cfg.color}` }}/>}
                            </div>
                            <span className="text-[9px] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight leading-tight">{cfg.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Mapping2D;