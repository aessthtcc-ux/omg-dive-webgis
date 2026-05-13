"use client";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';

// --- KUMPULAN SVG ICONS ---
// Icon untuk Pulau Pramuka (Anchor/Base)
const svgBase = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
// Icon untuk Bangkai Kapal
const svgWreck = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

// --- KONFIGURASI ICON ---
const createThemeIcon = (svgContent: string, bgColor: string, glowColor: string) => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    html: `
      <div style="
        background-color: ${bgColor}; 
        color: white; 
        width: 36px; height: 36px; 
        display: flex; align-items: center; justify-content: center; 
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 0 15px ${glowColor};
        backdrop-filter: blur(4px);
      ">
        ${svgContent}
      </div>
    `,
    className: 'bg-transparent border-none',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    tooltipAnchor: [0, 20] // Posisi label agar muncul di bawah icon
  });
};

// Icon Khusus untuk "Lampu Kedip" (Pulsing Wreck Marker)
const pulsingIcon = typeof window !== 'undefined' ? L.divIcon({
  html: `<div class="pulse-ring"></div><div class="pulse-dot"></div>`,
  className: 'custom-pulsing-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
}) : null;

// --- AUTO ZOOM HANDLER ---
const ZoomHandler = ({ targetPos, zoomLevel }: { targetPos: [number, number] | null, zoomLevel: number }) => {
  const map = useMap();
  useEffect(() => {
    if (targetPos) {
      map.flyTo(targetPos, zoomLevel, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [targetPos, zoomLevel, map]);
  return null;
};

// --- KOMPONEN UTAMA ---
const MapContent = () => {
  const [targetView, setTargetView] = useState<[number, number] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Titik Koordinat
  const posPulauPramuka: [number, number] = [-5.745609, 106.612054];
  const posTabularasa: [number, number] = [-5.7507747, 106.617746];
  const posPoso: [number, number] = [-5.702256, 106.598188];

  const icons = useMemo(() => ({
    base: createThemeIcon(svgBase, 'rgba(15, 23, 42, 0.8)', 'rgba(0, 209, 255, 0.5)'), 
    wreck: createThemeIcon(svgWreck, 'rgba(15, 23, 42, 0.9)', 'rgba(239, 68, 68, 0.6)'),
  }), []);

  const handlePramukaClick = () => {
    // Zoom ke area tengah-tengah antara Tabularasa dan Poso
    setTargetView([-5.748517868762723, 106.60845565834137]); 
    setShowDetails(true);
  };

  return (
    <div className="w-full h-screen rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      
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
          display: none; /* Hilangkan segitiga bawaan leaflet */
        }
      `}</style>

      {/* Mengatur posisi awal agar Pulau Pramuka terlihat di tengah */}
      <MapContainer center={posPulauPramuka} zoom={12} className="w-full h-full z-0">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        
        <ZoomHandler targetPos={targetView} zoomLevel={13} />

        {/* Marker Pulau Pramuka (Klik untuk memunculkan target) */}
        {icons.base && (
          <Marker 
            position={posPulauPramuka} 
            icon={icons.base}
            eventHandlers={{ click: handlePramukaClick }}
          >
            {/* Label Selalu Tampil di bawah marker */}
            <Tooltip 
              direction="bottom" 
              offset={[0, 10]} 
              opacity={1} 
              permanent 
              className="permanent-label"
            >
              Pulau Pramuka
            </Tooltip>
            
            {/* Popup Muncul Saat Diklik */}
            <Popup className="custom-popup">
              <div className="font-bold text-sm text-gray-800 border-b border-gray-200 pb-1 mb-1">Pulau Pramuka Base</div>
              <div className="text-xs font-mono text-gray-600 mb-1">{posPulauPramuka[0]}, {posPulauPramuka[1]}</div>
              <div className="text-xs text-blue-500 font-medium italic">Klik untuk melacak bangkai kapal</div>
            </Popup>
          </Marker>
        )}

        {/* Marker Detail (Tabularasa & Poso) Muncul setelah di-klik */}
        {showDetails && pulsingIcon && (
          <>
            {/* Tabularasa */}
            <Marker position={posTabularasa} icon={pulsingIcon} />
            <Marker position={posTabularasa} icon={icons.wreck!}>
                <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="permanent-label">
                  Tabularasa Wreck
                </Tooltip>
                <Popup className="custom-popup">
                  <div className="font-bold text-red-600 border-b border-gray-200 pb-1 mb-1">Tabularasa Wreck</div>
                  <div className="text-xs font-mono text-gray-600">Lat: {posTabularasa[0]}</div>
                  <div className="text-xs font-mono text-gray-600">Lon: {posTabularasa[1]}</div>
                </Popup>
            </Marker>

            {/* Poso */}
            <Marker position={posPoso} icon={pulsingIcon} />
            <Marker position={posPoso} icon={icons.wreck!}>
                <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="permanent-label">
                  Poso Wreck
                </Tooltip>
                <Popup className="custom-popup">
                  <div className="font-bold text-red-600 border-b border-gray-200 pb-1 mb-1">Poso Wreck</div>
                  <div className="text-xs font-mono text-gray-600">Lat: {posPoso[0]}</div>
                  <div className="text-xs font-mono text-gray-600">Lon: {posPoso[1]}</div>
                </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapContent;