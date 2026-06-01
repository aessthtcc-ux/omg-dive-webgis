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

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),    { ssr: false });
const GeoJSON      = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON),      { ssr: false });
const ZoomControl  = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl),  { ssr: false });

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

const GeoTIFFLayer = ({ url, isVisible }: { url: string; isVisible: boolean }) => {
  const { useMap: useMapLeaflet } = require("react-leaflet");
  const map = useMapLeaflet();
  const layerRef = useRef<any>(null);
  useEffect(() => {
    if (!map || !isVisible) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      return;
    }
    if (layerRef.current) return;
    let isMounted = true;
    const load = async () => {
      try {
        // @ts-ignore
        const parseGeoraster  = (await import('georaster')).default;
        // @ts-ignore
        const GeoRasterLayer  = (await import('georaster-layer-for-leaflet')).default;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        if (!isMounted) return;
        const gr = await parseGeoraster(buf);
        const [mn, mx] = [gr.mins[0], gr.maxs[0]];
        const layer = new GeoRasterLayer({
          georaster: gr, opacity: 0.9, resolution: 256,
          pixelValuesToColorFn: (v: any) => {
            if (v[0] === gr.noDataValue || v[0] === undefined || isNaN(v[0]) || v[0] === 0) return null;
            if (v.length >= 3) return `rgb(${Math.round(v[0])},${Math.round(v[1])},${Math.round(v[2])})`;
            const p = (v[0] - mn) / (mx - mn);
            let r=0,g=0,b=0;
            if (p<.25){r=0;g=Math.round(4*p*255);b=255;}
            else if(p<.5){r=0;g=255;b=Math.round(255-4*(p-.25)*255);}
            else if(p<.75){r=Math.round(4*(p-.5)*255);g=255;b=0;}
            else{r=255;g=Math.round(255-4*(p-.75)*255);b=0;}
            return `rgba(${r},${g},${b},0.9)`;
          }
        });
        if (isMounted) { layer.addTo(map); layerRef.current = layer; map.fitBounds(layer.getBounds(), { padding: [50,50], maxZoom: 20 }); }
      } catch (e) { console.error("GeoTIFF error:", e); }
    };
    load();
    return () => { isMounted = false; if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [url, map, isVisible]);
  return null;
};

const layerGroups = [
  {
    groupId: "area", title: "Area Boundaries",
    icon: <Box size={18} className="text-red-500" />,
    subLayers: [
      { id: "aoi_poso", filePath: "/data/area/AOI_POSO.geojson",      title: "Poso Wreck",       project: "Poso",       color: "#ef4444", dash: "5, 5", isPolygon: true },
      { id: "aoi_tabu", filePath: "/data/area/AOI_TABULARASA.geojson", title: "Tabularasa Wreck", project: "Tabularasa", color: "#ef4444", dash: "5, 5", isPolygon: true },
    ]
  },
  {
    groupId: "survey_lines", title: "Survey Lines",
    icon: <Activity size={18} className="text-blue-500" />,
    subLayers: [
      { id: "cross_poso",  filePath: "/data/linesurvey/crossline_poso.geojson",       title: "Crossline Poso",        project: "Poso",       color: "#3b82f6", dash: "5, 10" },
      { id: "cross_tabu",  filePath: "/data/linesurvey/crossline_tabularasa.geojson", title: "Crossline Tabularasa",  project: "Tabularasa", color: "#3b82f6", dash: "5, 10" },
      { id: "diag_poso",   filePath: "/data/linesurvey/diagline_poso.geojson",        title: "Diagline Poso",         project: "Poso",       color: "#a855f7", dash: "2, 5" },
      { id: "diag_tabu",   filePath: "/data/linesurvey/diagline_tabularasa.geojson",  title: "Diagline Tabularasa",   project: "Tabularasa", color: "#a855f7", dash: "2, 5" },
      { id: "main_poso",   filePath: "/data/linesurvey/mainline_poso2.geojson",       title: "Mainline Poso",         project: "Poso",       color: "#10b981", dash: "0" },
      { id: "main_tabu",   filePath: "/data/linesurvey/mainline_tabularasa.geojson",  title: "Mainline Tabularasa",   project: "Tabularasa", color: "#10b981", dash: "0" },
      { id: "patch_poso",  filePath: "/data/linesurvey/patchtest_poso.geojson",       title: "Patch Test Poso",       project: "Poso",       color: "#f59e0b", dash: "0" },
      { id: "patch_tabu",  filePath: "/data/linesurvey/patchtest_tabularasa.geojson", title: "Patch Test Tabularasa", project: "Tabularasa", color: "#f59e0b", dash: "0" },
    ]
  },
  {
    groupId: "dem", title: "Digital Elevation Model",
    icon: <ImageIcon size={18} className="text-purple-500" />,
    subLayers: [
      { id: "dem_poso",  filePath: "/data/dem/DTM_Poso_1m.tif",         title: "DEM Poso",       project: "Poso",       color: "#8b5cf6", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_tabu",  filePath: "/data/dem/DEM_Tabularasa_1.5m.tif", title: "DEM Tabularasa", project: "Tabularasa", color: "#ec4899", dash: "0", isDummy: false, isRaster: true },
    ]
  }
];

const baseMaps = [
  { id: 'osm',       name: 'Open Street Map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                        thumbnail: 'https://a.tile.openstreetmap.org/0/0/0.png' },
  { id: 'satellite', name: 'Satellite',       url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',             thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/546/388' },
  { id: 'dark',      name: 'Esri Dark',       url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                                             thumbnail: 'https://a.basemaps.cartocdn.com/dark_all/0/0/0.png' },
];

// ✅ Panel width per breakpoint
const PANEL_W = { mobile: 280, tablet: 300, desktop: 360 };

// Helper: ambil lebar panel sesuai layar saat ini
const getPanelWidth = () => {
  if (typeof window === 'undefined') return PANEL_W.desktop;
  if (window.innerWidth >= 1024) return PANEL_W.desktop;
  if (window.innerWidth >= 768)  return PANEL_W.tablet;
  return PANEL_W.mobile;
};

// Helper: hitung posisi left tombol toggle
const getToggleLeft = (isOpen: boolean) => {
  if (!isOpen) return '0.5rem';
  const w = getPanelWidth();
  const left = window.innerWidth >= 1024 ? '1.5rem' : window.innerWidth >= 768 ? '1rem' : '0.5rem';
  return `calc(${left} + ${w}px + 0.5rem)`;
};

const Mapping2D = () => {
  const [mounted,       setMounted]       = useState(false);
  const [isPanelOpen,   setIsPanelOpen]   = useState(false);
  const [isLegendOpen,  setIsLegendOpen]  = useState(false);
  const [isBaseMapOpen, setIsBaseMapOpen] = useState(false);
  const [openDesc,      setOpenDesc]      = useState<string | null>(null);
  const [activeBasemap, setActiveBasemap] = useState(baseMaps[1]);
  const [geoData,       setGeoData]       = useState<Record<string, any>>({});

  // ✅ Track window width untuk toggle button position
  const [winWidth, setWinWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>(
    layerGroups.reduce((acc, g) => ({ ...acc, [g.groupId]: true }), {})
  );
  const [activeSubLayers, setActiveSubLayers] = useState<Record<string, boolean>>(
    layerGroups.flatMap(g => g.subLayers).reduce((acc, sub) => ({ ...acc, [sub.id]: true }), {})
  );

  useEffect(() => {
    setMounted(true);
    const fetch_ = async () => {
      const dataMap: Record<string, any> = {};
      // @ts-ignore
      const fetchable = layerGroups.flatMap(g => g.subLayers).filter(s => !s.isDummy && !s.isRaster);
      const results = await Promise.all(fetchable.map(async cfg => {
        try {
          const res = await fetch(cfg.filePath);
          if (res.ok) return { id: cfg.id, data: await res.json() };
        } catch {}
        return null;
      }));
      results.forEach(r => { if (r) dataMap[r.id] = r.data; });
      setGeoData(dataMap);
    };
    fetch_();
  }, []);

  const toggleGroup = (id: string) => {
    const next = !activeGroups[id];
    setActiveGroups(p => ({ ...p, [id]: next }));
    const g = layerGroups.find(g => g.groupId === id);
    if (g) setActiveSubLayers(p => { const s={...p}; g.subLayers.forEach(sub => s[sub.id]=next); return s; });
  };

  const toggleSubLayer = (id: string) =>
    setActiveSubLayers(p => ({ ...p, [id]: !p[id] }));

  if (!mounted) return null;

  // ✅ Panel width & slide offset berdasarkan window width saat render
  const panelW      = winWidth >= 1024 ? PANEL_W.desktop : winWidth >= 768 ? PANEL_W.tablet : PANEL_W.mobile;
  const panelLeft   = winWidth >= 1024 ? '1.5rem' : winWidth >= 768 ? '1rem' : '0.5rem';
  const toggleLeft  = isPanelOpen ? `calc(${panelLeft} + ${panelW}px + 0.5rem)` : '0.5rem';

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 pt-24">
      <div className="absolute top-0 left-0 w-full h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-[10] border-b border-gray-200 dark:border-white/5" />

      <style>{`
        .permanent-label {
          background-color: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.2);
          color: white; font-weight: 700; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 4px 8px; border-radius: 8px;
          backdrop-filter: blur(4px);
        }
        .permanent-label::before { display: none; }
      `}</style>

      {/* MAP */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0">
        <MapContainer center={[-5.7435, 106.6081]} zoom={14} maxZoom={24} zoomControl={false} className="h-full w-full">
          <TileLayer url={activeBasemap.url} maxZoom={24} maxNativeZoom={19} />
          <AutoFitBounds geoData={geoData} />

          {layerGroups.flatMap(g => g.subLayers).map(config => {
            // @ts-ignore
            if (config.isRaster) return null;
            const data = geoData[config.id];
            // @ts-ignore
            if (!activeSubLayers[config.id] || !data?.type || config.isDummy) return null;
            return (
              <GeoJSON key={`geojson-${config.id}-${data.features?.length||0}`} data={data}
                style={{
                  color: config.color,
                  // @ts-ignore
                  weight: config.isPolygon ? 2 : 4,
                  opacity: 0.9, dashArray: config.dash,
                  fillColor: config.color,
                  // @ts-ignore
                  fillOpacity: config.isPolygon ? 0.15 : 0,
                }}
                eventHandlers={{ contextmenu: e => {
                  const l=e.target; if(l._map) l._map.flyToBounds(l.getBounds(),{padding:[100,100],duration:1.5,maxZoom:20});
                }}}
                onEachFeature={(feature, layer: any) => {
                  // @ts-ignore
                  if (config.isPolygon) {
                    const c = layer.getBounds().getCenter();
                    layer.bindTooltip(config.title, { permanent: true, direction: 'center', className: 'permanent-label' });
                    layer.bindPopup(`<div class="p-2"><div class="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Area Boundary</div><div class="text-sm font-bold text-gray-800 uppercase">${config.title}</div><div class="text-[11px] text-gray-500 mt-1 italic font-mono">Center: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</div></div>`);
                  } else {
                    layer.bindPopup(`<div class="p-2"><div class="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Survey Segment</div><div class="text-sm font-bold text-gray-800 uppercase italic">${config.title}</div><div class="text-[11px] text-gray-500 mt-1 italic">Project: ${config.project}</div></div>`);
                  }
                }}
              />
            );
          })}

          {layerGroups.flatMap(g => g.subLayers).map(config => {
            // @ts-ignore
            if (!config.isRaster || !activeSubLayers[config.id]) return null;
            return <GeoTIFFLayer key={`raster-${config.id}`} url={config.filePath} isVisible={activeSubLayers[config.id]} />;
          })}

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {/* BASEMAP CONTROLLER */}
      <div className="absolute top-[120px] right-2 md:right-6 z-[1000] flex flex-col items-end">
        <button onClick={() => setIsBaseMapOpen(!isBaseMapOpen)}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 hover:scale-105 transition-all">
          <div className="flex flex-col items-end">
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Basemap</span>
            <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white uppercase italic">{activeBasemap.name}</span>
          </div>
          <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-lg shadow-blue-500/30">
            <MapIcon size={18} />
          </div>
        </button>
        <AnimatePresence>
          {isBaseMapOpen && (
            <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:10 }} exit={{ opacity:0,y:-10 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-40 md:w-48 flex flex-col gap-2 md:gap-3 mt-2">
              {baseMaps.map(map => (
                <button key={map.id} onClick={() => { setActiveBasemap(map); setIsBaseMapOpen(false); }}
                  className={`relative overflow-hidden rounded-xl md:rounded-2xl h-12 md:h-16 border-2 transition-all ${activeBasemap.id===map.id?'border-blue-500':'border-transparent'}`}>
                  <img src={map.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={map.name} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[9px] md:text-[10px] font-black text-white uppercase">{map.name}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ TOMBOL TOGGLE — posisi dinamis berdasarkan winWidth */}
      <div
        className="absolute top-[120px] z-[101] flex flex-col justify-center h-[calc(100vh-160px)] pointer-events-none transition-all duration-500"
        style={{ left: toggleLeft }}
      >
        <button onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="w-10 h-20 md:h-24 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 pointer-events-auto">
          {isPanelOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* ✅ SIDE PANEL — lebar responsif 3 breakpoint */}
      <motion.div
        animate={{ x: isPanelOpen ? 0 : -(panelW + 20) }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        style={{ width: panelW, left: panelLeft }}
        className="absolute top-[120px] bottom-10 z-[100] pointer-events-none h-[calc(100vh-160px)]"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-4 md:p-5 lg:p-6 flex flex-col pointer-events-auto overflow-hidden h-full">
          <div className="mb-4 shrink-0">
            <h2 className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-2 md:gap-3">
              <Layers className="text-blue-600" size={20} /> 2D <span className="text-blue-600">Data</span>
            </h2>
          </div>

          <div className="flex-1 space-y-3 md:space-y-4 lg:space-y-6 overflow-y-auto pr-1 custom-scrollbar">
            {layerGroups.map(group => (
              <div key={group.groupId} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <button onClick={() => toggleGroup(group.groupId)}
                    className={`p-1.5 rounded-lg transition-all ${activeGroups[group.groupId] ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                    {activeGroups[group.groupId] ? <Eye size={14} /> : <EyeOff size={14} />}
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
                            className={`p-1.5 rounded-lg transition-all ${activeSubLayers[layer.id] ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            {activeSubLayers[layer.id] ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>
                          <div>
                            <h4 className="text-[9px] md:text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight flex items-center gap-1">
                              {layer.title}
                              {(layer as any).isDummy && <span className="text-[7px] bg-purple-100 text-purple-600 px-1 rounded-sm">Soon</span>}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: layer.color }} />
                              <span className="text-[7px] text-gray-400 font-bold uppercase">{layer.project}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setOpenDesc(openDesc===layer.id ? null : layer.id)} className="p-1 text-gray-400 hover:text-blue-500">
                          <Info size={12} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {openDesc === layer.id && (
                          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }}
                            className="px-3 pb-3 text-[9px] text-gray-500 italic border-t border-gray-100 dark:border-white/5 pt-2 bg-white/50 dark:bg-black/20">
                            {(layer as any).isRaster ? "Format: GeoTIFF. Represents seabed elevation model." : "Format: WGS84 GeoJSON. Right-click to focus."}
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

      {/* LEGEND DESKTOP (md ke atas) */}
      <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }}
        className="hidden md:block absolute bottom-10 right-6 z-[1] pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-5 lg:p-6 w-56 lg:w-64 pointer-events-auto">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
            <List size={13} className="text-blue-600" /> Map Legend
          </h5>
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
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
                          {(cfg as any).isPolygon ? (
                            <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: cfg.color, backgroundColor: `${cfg.color}30` }} />
                          ) : (cfg as any).isRaster ? (
                            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-900 to-yellow-200" />
                          ) : (
                            <div className="w-5 h-1 rounded-full" style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }} />
                          )}
                          <span className="text-[9px] lg:text-[10px] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight">{cfg.title}</span>
                        </div>
                        <MousePointer2 size={9} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* LEGEND MOBILE (hanya < md) */}
      <div className="md:hidden absolute bottom-3 right-2 z-[100] pointer-events-auto">
        <button onClick={() => setIsLegendOpen(!isLegendOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border transition-all text-[10px] font-black uppercase tracking-wider ${
            isLegendOpen ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-white border-gray-200 dark:border-white/10 backdrop-blur-xl'
          }`}>
          <List size={12} /> Legend
          <ChevronRight size={11} className={`transition-transform ${isLegendOpen ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
          {isLegendOpen && (
            <motion.div initial={{ opacity:0,y:8,scale:.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:8,scale:.95 }} transition={{ duration:.2 }}
              className="absolute bottom-full right-0 mb-2 w-52 bg-white/97 dark:bg-gray-900/97 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Map Legend</span>
              </div>
              <div className="p-2.5 space-y-3 max-h-56 overflow-y-auto">
                {layerGroups.map(group => {
                  const subs = group.subLayers.filter(s => activeSubLayers[s.id]);
                  if (!subs.length) return null;
                  return (
                    <div key={group.groupId}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{group.title}</span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
                      </div>
                      <div className="space-y-1">
                        {subs.map(cfg => (
                          <div key={cfg.id} className="flex items-center gap-2 px-1 py-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex-shrink-0 w-8 flex items-center justify-center">
                              {(cfg as any).isPolygon ? (
                                <div className="w-4 h-4 rounded border-2" style={{ borderColor: cfg.color, backgroundColor: `${cfg.color}25` }} />
                              ) : (cfg as any).isRaster ? (
                                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg,#1e3a5f,#3b82f6,#10b981,#fbbf24)' }} />
                              ) : (
                                <div className="w-5 h-[3px] rounded-full" style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                              )}
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