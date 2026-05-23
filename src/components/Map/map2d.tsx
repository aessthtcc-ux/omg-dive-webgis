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

// --- DYNAMIC IMPORTS ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false });

// --- HELPER: AUTO ZOOM COMPONENT ---
const AutoFitBounds = ({ geoData }: { geoData: Record<string, any> }) => {
  const { useMap: useMapLeaflet } = require("react-leaflet"); 
  const map = useMapLeaflet();

  useEffect(() => {
    const layerIds = Object.keys(geoData);
    if (layerIds.length === 0 || !map) return;

    const group = new L.FeatureGroup();
    layerIds.forEach((id) => {
      if (geoData[id]?.features) {
        try {
          const layer = L.geoJSON(geoData[id]);
          group.addLayer(layer);
        } catch (e) { console.error(`Error bounds ${id}:`, e); }
      }
    });

    const bounds = group.getBounds();
    if (bounds.isValid()) {
      // REVISI: Tingkatkan maxZoom otomatis saat fitBounds dari 16 ke 20
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 20 });
    }
  }, [geoData, map]);

  return null;
};

// --- KOMPONEN BARU: GEOTIFF LAYER RENDERER ---
const GeoTIFFLayer = ({ url, isVisible }: { url: string, isVisible: boolean }) => {
  const { useMap: useMapLeaflet } = require("react-leaflet"); 
  const map = useMapLeaflet();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !isVisible) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    if (layerRef.current) return;
    let isMounted = true;

    const loadRaster = async () => {
      try {
        console.log(`[DEBUG] 1. Mulai mengambil file dari: ${url}`);
        // @ts-ignore
        const parseGeoraster = (await import('georaster')).default;
        // @ts-ignore
        const GeoRasterLayer = (await import('georaster-layer-for-leaflet')).default;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`[DEBUG] 2. File berhasil diunduh. Ukuran: ${Math.round(arrayBuffer.byteLength / 1024 / 1024)} MB`);
        
        if (!isMounted) return;

        const georaster = await parseGeoraster(arrayBuffer);
        console.log("[DEBUG] 3. Metadata GeoTIFF berhasil dibaca:", georaster); 

        const minVal = georaster.mins[0];
        const maxVal = georaster.maxs[0];

        const layer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 0.9,
          resolution: 256,
          pixelValuesToColorFn: (values: any) => {
            // REVISI: Tambahkan kondisi || values[0] === 0 untuk menghilangkan nilai 0
            if (
              values[0] === georaster.noDataValue || 
              values[0] === undefined || 
              isNaN(values[0]) ||
              values[0] === 0
            ) {
              return null;
            }
            
            // SKENARIO 1: RGB
            if (values.length >= 3) {
              const r = Math.round(values[0]);
              const g = Math.round(values[1]);
              const b = Math.round(values[2]);
              return `rgb(${r}, ${g}, ${b})`;
            }
            
            // SKENARIO 2: Single-band (Elevasi)
            const val = values[0];
            if (maxVal === minVal) return 'rgb(150, 150, 150)';
            
            const pct = (val - minVal) / (maxVal - minVal);
            let r = 0, g = 0, b = 0;

            if (pct < 0.25) {
              r = 0; g = Math.round(4 * pct * 255); b = 255;
            } else if (pct < 0.5) {
              r = 0; g = 255; b = Math.round(255 - 4 * (pct - 0.25) * 255);
            } else if (pct < 0.75) {
              r = Math.round(4 * (pct - 0.5) * 255); g = 255; b = 0;
            } else {
              r = 255; g = Math.round(255 - 4 * (pct - 0.75) * 255); b = 0;
            }

            return `rgba(${r}, ${g}, ${b}, 0.9)`; 
          }
        });

        if (isMounted) {
          layer.addTo(map);
          layerRef.current = layer;
          
          console.log("[DEBUG] 4. Memaksa peta zoom ke lokasi raster...");
          map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 20 });
        }
      } catch (error) {
        console.error("[DEBUG ERROR] Gagal memuat GeoTIFF:", error);
      }
    };

    loadRaster();

    return () => {
      isMounted = false;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [url, map, isVisible]);

  return null;
};

// --- HIERARCHICAL CONFIGURATION DATA ---
const layerGroups = [
  {
    groupId: "area",
    title: "Area Boundaries",
    icon: <Box size={18} className="text-red-500" />,
    subLayers: [
      { id: "aoi_poso", filePath: "/data/area/AOI_POSO.geojson", title: "Poso Wreck", project: "Poso", color: "#ef4444", dash: "5, 5", isPolygon: true },
      { id: "aoi_tabu", filePath: "/data/area/AOI_TABULARASA.geojson", title: "Tabularasa Wreck", project: "Tabularasa", color: "#ef4444", dash: "5, 5", isPolygon: true },
    ]
  },
  {
    groupId: "survey_lines",
    title: "Survey Lines",
    icon: <Activity size={18} className="text-blue-500" />,
    subLayers: [
      { id: "cross_poso", filePath: "/data/linesurvey/crossline_poso.geojson", title: "Crossline Poso", project: "Poso", color: "#3b82f6", dash: "5, 10" },
      { id: "cross_tabu", filePath: "/data/linesurvey/crossline_tabularasa.geojson", title: "Crossline Tabularasa", project: "Tabularasa", color: "#3b82f6", dash: "5, 10" },
      { id: "diag_poso", filePath: "/data/linesurvey/diagline_poso.geojson", title: "Diagline Poso", project: "Poso", color: "#a855f7", dash: "2, 5" },
      { id: "diag_tabu", filePath: "/data/linesurvey/diagline_tabularasa.geojson", title: "Diagline Tabularasa", project: "Tabularasa", color: "#a855f7", dash: "2, 5" },
      { id: "main_poso", filePath: "/data/linesurvey/mainline_poso2.geojson", title: "Mainline Poso", project: "Poso", color: "#10b981", dash: "0" },
      { id: "main_tabu", filePath: "/data/linesurvey/mainline_tabularasa.geojson", title: "Mainline Tabularasa", project: "Tabularasa", color: "#10b981", dash: "0" },
      { id: "patch_poso", filePath: "/data/linesurvey/patchtest_poso.geojson", title: "Patch Test Poso", project: "Poso", color: "#f59e0b", dash: "0" },
      { id: "patch_tabu", filePath: "/data/linesurvey/patchtest_tabularasa.geojson", title: "Patch Test Tabularasa", project: "Tabularasa", color: "#f59e0b", dash: "0" },
    ]
  },
  {
    groupId: "dem",
    title: "Digital Elevation Model",
    icon: <ImageIcon size={18} className="text-purple-500" />,
    subLayers: [
      // Perbaikan title untuk dem_poso dan penambahan dem_tabu
      { id: "dem_poso", filePath: "/data/dem/DTM_Poso_1m.tif", title: "DEM Poso", project: "Poso", color: "#8b5cf6", dash: "0", isDummy: false, isRaster: true },
      { id: "dem_tabu", filePath: "/data/dem/DEM_Tabularasa_1.5m.tif", title: "DEM Tabularasa", project: "Tabularasa", color: "#ec4899", dash: "0", isDummy: false, isRaster: true }
    ]
  }
];

const baseMaps = [
  { id: 'osm', name: 'Open Street Map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', thumbnail: 'https://a.tile.openstreetmap.org/0/0/0.png' },
  { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/546/388' },
  { id: 'dark', name: 'Esri Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', thumbnail: 'https://a.basemaps.cartocdn.com/dark_all/0/0/0.png' }
];

const Mapping2D = () => {
  const [mounted, setMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isBaseMapOpen, setIsBaseMapOpen] = useState(false);
  const [openDesc, setOpenDesc] = useState<string | null>(null);
  const [activeBasemap, setActiveBasemap] = useState(baseMaps[1]);
  const [geoData, setGeoData] = useState<Record<string, any>>({});
  
  // State Hierarkis
  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>(
    layerGroups.reduce((acc, g) => ({ ...acc, [g.groupId]: true }), {})
  );
  const [activeSubLayers, setActiveSubLayers] = useState<Record<string, boolean>>(
    layerGroups.flatMap(g => g.subLayers).reduce((acc, sub) => ({ ...acc, [sub.id]: true }), {})
  );

  // Fetch GeoJSON Data
  useEffect(() => {
    setMounted(true);
    const fetchAllData = async () => {
      const dataMap: Record<string, any> = {};
      // @ts-ignore
      const fetchableLayers = layerGroups.flatMap(g => g.subLayers).filter(s => !s.isDummy && !s.isRaster);
      
      const requests = fetchableLayers.map(async (config) => {
        try {
          const res = await fetch(config.filePath);
          if (res.ok) {
            const json = await res.json();
            return { id: config.id, data: json };
          }
        } catch (e) { console.error(`Error loading ${config.filePath}:`, e); }
        return null;
      });
      
      const results = await Promise.all(requests);
      results.forEach(res => { if (res) dataMap[res.id] = res.data; });
      setGeoData(dataMap);
    };
    fetchAllData();
  }, []);

  const toggleGroup = (groupId: string) => {
    const nextState = !activeGroups[groupId];
    setActiveGroups(prev => ({ ...prev, [groupId]: nextState }));
    
    const group = layerGroups.find(g => g.groupId === groupId);
    if (group) {
      setActiveSubLayers(prev => {
        const nextSubs = { ...prev };
        group.subLayers.forEach(sub => {
          nextSubs[sub.id] = nextState;
        });
        return nextSubs;
      });
    }
  };

  const toggleSubLayer = (subId: string) => {
    setActiveSubLayers(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  if (!mounted) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 pt-24">
      <div className="absolute top-0 left-0 w-full h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-[10] border-b border-gray-200 dark:border-white/5" />

      {/* GLOBAL CSS UNTUK LABEL PERMANEN */}
      <style>{`
        .permanent-label {
          background-color: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 8px;
          border-radius: 8px;
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .permanent-label::before {
          display: none;
        }
      `}</style>

      {/* 1. MAP AREA */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0">
        {/* REVISI: Tambahkan maxZoom={24} agar map container mengizinkan zoom lebih dalam */}
        <MapContainer center={[-5.7435, 106.6081]} zoom={14} maxZoom={24} zoomControl={false} className="h-full w-full">
          {/* REVISI: maxZoom={24} dan maxNativeZoom={19} agar basemap di-stretch setelah zoom 19 tanpa blank */}
          <TileLayer url={activeBasemap.url} maxZoom={24} maxNativeZoom={19} />
          <AutoFitBounds geoData={geoData} />

          {/* Render Active GeoJSON Layers */}
          {layerGroups.flatMap(g => g.subLayers).map((config) => {
            // @ts-ignore
            if (config.isRaster) return null; 

            const data = geoData[config.id];
            // @ts-ignore
            if (!activeSubLayers[config.id] || !data || !data.type || config.isDummy) return null;

            return (
              <GeoJSON 
                key={`geojson-${config.id}-${data.features?.length || 0}`} 
                data={data} 
                style={{
                  color: config.color,
                  // @ts-ignore
                  weight: config.isPolygon ? 2 : 4,
                  opacity: 0.9,
                  dashArray: config.dash,
                  fillColor: config.color,
                  // @ts-ignore
                  fillOpacity: config.isPolygon ? 0.15 : 0
                }}
                eventHandlers={{
                  contextmenu: (e) => {
                    const layer = e.target;
                    const map = layer._map;
                    if (map) map.flyToBounds(layer.getBounds(), { padding: [100, 100], duration: 1.5, maxZoom: 20 });
                  }
                }}
                onEachFeature={(feature, layer: any) => {
                  // @ts-ignore
                  if (config.isPolygon) {
                    const bounds = layer.getBounds();
                    const center = bounds.getCenter();
                    const lat = center.lat.toFixed(5);
                    const lng = center.lng.toFixed(5);

                    layer.bindTooltip(config.title, {
                      permanent: true,
                      direction: 'center',
                      className: 'permanent-label'
                    });

                    layer.bindPopup(`
                      <div class="p-2 font-sans">
                        <div class="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Area Boundary</div>
                        <div class="text-sm font-bold text-gray-800 uppercase">${config.title}</div>
                        <div class="text-[11px] text-gray-500 mt-1 italic font-mono">Center: ${lat}, ${lng}</div>
                      </div>
                    `);
                  } else {
                    layer.bindPopup(`
                      <div class="p-2 font-sans">
                        <div class="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-100 mb-2 pb-1">Survey Segment</div>
                        <div class="text-sm font-bold text-gray-800 uppercase italic">${config.title}</div>
                        <div class="text-[11px] text-gray-500 mt-1 italic">Project: ${config.project}</div>
                        <div class="mt-3 text-[9px] bg-blue-50 text-blue-600 p-1 rounded text-center font-bold">
                          ${feature.properties?.description || 'Line segment recorded during survey'}
                        </div>
                      </div>
                    `);
                  }
                }}
              />
            );
          })}

          {/* Render Active RASTER (GeoTIFF) Layers */}
          {layerGroups.flatMap(g => g.subLayers).map((config) => {
            // @ts-ignore
            if (!config.isRaster || !activeSubLayers[config.id]) return null;
            return (
              <GeoTIFFLayer 
                key={`raster-${config.id}`}
                url={config.filePath} 
                isVisible={activeSubLayers[config.id]} 
              />
            );
          })}

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {/* 2. BASEMAP CONTROLLER */}
      <div className="absolute top-[120px] right-6 z-[1000] flex flex-col items-end">
        <button onClick={() => setIsBaseMapOpen(!isBaseMapOpen)} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3 hover:scale-105 transition-all pointer-events-auto">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Basemap</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase italic">{activeBasemap.name}</span>
          </div>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <MapIcon size={20} />
          </div>
        </button>

        <AnimatePresence>
          {isBaseMapOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 10 }} exit={{ opacity: 0, y: -10 }} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-4 rounded-[2rem] shadow-2xl w-48 flex flex-col gap-3 mt-2 pointer-events-auto">
              {baseMaps.map((map) => (
                <button key={map.id} onClick={() => { setActiveBasemap(map); setIsBaseMapOpen(false); }} className={`relative overflow-hidden rounded-2xl h-16 border-2 transition-all ${activeBasemap.id === map.id ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={map.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={map.name} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white uppercase">{map.name}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. SIDE PANEL */}
      <motion.div 
        animate={{ x: isPanelOpen ? 0 : -345 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="absolute top-[120px] left-6 bottom-10 w-[360px] z-[1] flex pointer-events-none h-[calc(100vh-160px)]"
      >
        <div className="flex-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-6 flex flex-col pointer-events-auto overflow-hidden">
          <div className="mb-6 shrink-0 px-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
              <Layers className="text-blue-600" /> 2D <span className="text-blue-600">Data</span>
            </h2>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {layerGroups.map((group) => (
              <div key={group.groupId} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleGroup(group.groupId)} className={`p-1.5 rounded-lg transition-all ${activeGroups[group.groupId] ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                      {activeGroups[group.groupId] ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      {group.icon} {group.title}
                    </h3>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-gray-100 dark:border-white/5 ml-4 space-y-2">
                  {group.subLayers.map((layer) => (
                    <div key={layer.id} className="group bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent transition-all overflow-hidden hover:border-gray-200 dark:hover:border-white/10">
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleSubLayer(layer.id)}
                            className={`p-2 rounded-xl transition-all ${activeSubLayers[layer.id] ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}
                          >
                            {activeSubLayers[layer.id] ? <Eye size={14}/> : <EyeOff size={14}/>}
                          </button>
                          <div>
                            <h4 className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight flex items-center gap-2">
                              {layer.title} {(layer as any).isDummy && <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 rounded-sm">Coming Soon</span>}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: layer.color }} />
                               <span className="text-[8px] text-gray-400 font-bold uppercase">{layer.project}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setOpenDesc(openDesc === layer.id ? null : layer.id)} className="p-1.5 text-gray-400 hover:text-blue-500">
                          <Info size={14}/>
                        </button>
                      </div>
                      <AnimatePresence>
                        {openDesc === layer.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 text-[10px] text-gray-500 italic border-t border-gray-100 dark:border-white/5 pt-3 bg-white/50 dark:bg-black/20">
                            {(layer as any).isRaster ? "Format: GeoTIFF. Represents seabed elevation model." : "Format: WGS84 GeoJSON. Right-click segment on map to focus."}
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

        <div className="flex flex-col justify-center ml-2 pointer-events-auto h-full">
          <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="w-10 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-blue-700 transition-colors">
            {isPanelOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24}/>}
          </button>
        </div>
      </motion.div>

      {/* 4. DYNAMIC LEGEND */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-10 right-20 z-[1] pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 w-64 pointer-events-auto">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
            <List size={14} className="text-blue-600"/> Map Legend
          </h5>
          <div className="space-y-5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {layerGroups.map((group) => {
                const activeSubs = group.subLayers.filter(sub => activeSubLayers[sub.id]);
                if (activeSubs.length === 0) return null;

                return (
                  <motion.div key={`leg-group-${group.groupId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    <h6 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{group.title}</h6>
                    {activeSubs.map((config) => (
                      <div key={`leg-${config.id}`} className="flex items-center justify-between group pl-2">
                        <div className="flex items-center gap-3">
                          {(config as any).isPolygon ? (
                            <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: config.color, backgroundColor: `${config.color}30` }} />
                          ) : (config as any).isRaster ? (
                             <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-900 to-yellow-200" />
                          ) : (
                            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}80` }} />
                          )}
                          <span className="text-[10px] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight">{config.title}</span>
                        </div>
                        <MousePointer2 size={10} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Mapping2D;