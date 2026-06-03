"use client";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';

// --- SVG ICONS ---
const svgBase = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
const svgWreck = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

const createThemeIcon = (svgContent: string, bgColor: string, glowColor: string) => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    html: `<div style="background-color:${bgColor};color:white;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid white;box-shadow:0 0 12px ${glowColor};backdrop-filter:blur(4px);">${svgContent}</div>`,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    tooltipAnchor: [0, 18]
  });
};

const pulsingIcon = typeof window !== 'undefined' ? L.divIcon({
  html: `<div class="pulse-ring"></div><div class="pulse-dot"></div>`,
  className: 'custom-pulsing-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
}) : null;

// ✅ FIX UTAMA: paksa Leaflet recalculate ukuran container setelah render
// Ini yang menyebabkan tile hitam/gap di mobile
const InvalidateSize = () => {
  const map = useMap();
  useEffect(() => {
    // Delay sedikit agar DOM sudah stabil
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const ZoomHandler = ({ targetPos, zoomLevel }: { targetPos: [number, number] | null; zoomLevel: number }) => {
  const map = useMap();
  useEffect(() => {
    if (targetPos) map.flyTo(targetPos, zoomLevel, { duration: 2.5, easeLinearity: 0.25 });
  }, [targetPos, zoomLevel, map]);
  return null;
};

const MapContent = () => {
  const [targetView,   setTargetView]   = useState<[number, number] | null>(null);
  const [showDetails,  setShowDetails]  = useState(false);

  const posPulauPramuka: [number, number] = [-5.745609,   106.612054];
  const posTabularasa:   [number, number] = [-5.7507747,  106.617746];
  const posPoso:         [number, number] = [-5.702256,   106.598188];

  const icons = useMemo(() => ({
    base:  createThemeIcon(svgBase,  'rgba(15,23,42,0.8)', 'rgba(0,209,255,0.5)'),
    wreck: createThemeIcon(svgWreck, 'rgba(15,23,42,0.9)', 'rgba(239,68,68,0.6)'),
  }), []);

  const handlePramukaClick = () => {
    setTargetView([-5.748517868762723, 106.60845565834137]);
    setShowDetails(true);
  };

  return (
    <div
      style={{ borderRadius: '1.25rem', overflow: 'hidden' }}
      className="w-full h-[55vw] min-h-[240px] max-h-[340px] md:max-h-none md:h-[440px] lg:h-[520px] border border-white/10 shadow-2xl relative bg-slate-900"
    >
      <style>{`
        /* ✅ FIX: Leaflet container harus 100% width & height tanpa gap */
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          background: #0f172a !important;
        }

        /* ✅ FIX: Paksa tile layer mengisi penuh tanpa area kosong */
        .leaflet-tile-container,
        .leaflet-layer {
          width: 100% !important;
        }

        .permanent-label {
          background-color: rgba(15,23,42,0.8) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          padding: 3px 7px !important;
          border-radius: 7px !important;
          backdrop-filter: blur(4px) !important;
          white-space: nowrap !important;
          box-shadow: none !important;
        }
        .permanent-label::before { display: none !important; }
        .leaflet-tooltip.permanent-label { border: 1px solid rgba(255,255,255,0.2) !important; }

        /* Popup styling */
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
          max-width: 190px !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          min-width: 160px !important;
        }
        .leaflet-popup-tip { box-shadow: none !important; }

        /* Pulsing marker */
        .custom-pulsing-icon { position: relative; }
        .pulse-ring {
          position: absolute; width: 20px; height: 20px;
          border-radius: 50%; border: 2px solid #ef4444;
          animation: pulse-ring 1.5s ease-out infinite;
          top: 0; left: 0;
        }
        .pulse-dot {
          position: absolute; width: 10px; height: 10px;
          border-radius: 50%; background: #ef4444;
          top: 5px; left: 5px;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        /* Zoom control lebih kecil di mobile */
        .leaflet-control-zoom {
          border-radius: 10px !important;
          overflow: hidden !important;
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
          font-size: 16px !important;
        }
      `}</style>

      <MapContainer
        center={posPulauPramuka}
        zoom={12}
        // ✅ FIX: style langsung di sini, bukan hanya className
        style={{ width: '100%', height: '100%' }}
        className="z-0"
        zoomControl={true}
        scrollWheelZoom={false}
        // ✅ FIX: whenReady untuk invalidate size segera setelah map init
        whenReady={() => {
          // akan di-handle oleh InvalidateSize component
        }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={20}
          maxNativeZoom={19}
          // ✅ FIX: keepBuffer lebih besar agar tile tidak kosong
          keepBuffer={4}
        />

        {/* ✅ FIX: InvalidateSize harus ada di dalam MapContainer */}
        <InvalidateSize />
        <ZoomHandler targetPos={targetView} zoomLevel={13} />

        {icons.base && (
          <Marker
            position={posPulauPramuka}
            icon={icons.base}
            eventHandlers={{ click: handlePramukaClick }}
          >
            <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="permanent-label">
              Pulau Pramuka
            </Tooltip>
            <Popup>
              <div className="p-3">
                <div className="font-bold text-xs text-gray-800 border-b border-gray-100 pb-1.5 mb-1.5">
                  Pulau Pramuka 
                </div>
                <div className="text-[10px] font-mono text-gray-500 mb-1">
                  {posPulauPramuka[0]}, {posPulauPramuka[1]}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {showDetails && pulsingIcon && icons.wreck && (
          <>
            <Marker position={posTabularasa} icon={pulsingIcon} />
            <Marker position={posTabularasa} icon={icons.wreck}>
              <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="permanent-label">
                Tabularasa Wreck
              </Tooltip>
              <Popup>
                <div className="p-3">
                  <div className="font-bold text-xs text-red-600 border-b border-gray-100 pb-1.5 mb-1.5">Tabularasa Wreck</div>
                  <div className="text-[10px] font-mono text-gray-500">Lat: {posTabularasa[0]}</div>
                  <div className="text-[10px] font-mono text-gray-500">Lon: {posTabularasa[1]}</div>
                </div>
              </Popup>
            </Marker>

            <Marker position={posPoso} icon={pulsingIcon} />
            <Marker position={posPoso} icon={icons.wreck}>
              <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="permanent-label">
                Poso Wreck
              </Tooltip>
              <Popup>
                <div className="p-3">
                  <div className="font-bold text-xs text-red-600 border-b border-gray-100 pb-1.5 mb-1.5">Poso Wreck</div>
                  <div className="text-[10px] font-mono text-gray-500">Lat: {posPoso[0]}</div>
                  <div className="text-[10px] font-mono text-gray-500">Lon: {posPoso[1]}</div>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapContent;