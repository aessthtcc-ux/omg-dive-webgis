"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars, Center } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, ChevronRight, ChevronLeft, Eye, EyeOff, 
  List, Globe, Wind, Loader2, Sliders, Layers
} from 'lucide-react';
import WebGLCheck from "../WebGLCheck";

interface PointCloudProps {
  id: string;
  url: string;
  active: boolean;
  density: number;
  onDataLoaded: (id: string, count: number, minZ: number, maxZ: number) => void;
  onLoadingChange: (id: string, isLoading: boolean) => void;
}

const PointCloudModel = ({ id, url, active, density, onDataLoaded, onLoadingChange }: PointCloudProps) => {
  const [fullGeoData, setFullGeoData] = useState<{ positions: Float32Array, colors: Float32Array } | null>(null);
  const [zBounds, setZBounds] = useState({ min: 0, max: 0 });
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!active && !hasFetched) return; 
    if (fullGeoData) return; 

    async function loadLasFile() {
      setHasFetched(true);
      onLoadingChange(id, true);
      try {
        const { load } = await import('@loaders.gl/core');
        const { LASLoader } = await import('@loaders.gl/las');
        const rawData = await load(url, LASLoader);
        const positions = rawData.attributes.POSITION.value;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (let i = 0; i < positions.length; i += 3) {
          if (positions[i] < minX) minX = positions[i];
          if (positions[i] > maxX) maxX = positions[i];
          if (positions[i+1] < minY) minY = positions[i+1];
          if (positions[i+1] > maxY) maxY = positions[i+1];
          if (positions[i+2] < minZ) minZ = positions[i+2];
          if (positions[i+2] > maxZ) maxZ = positions[i+2];
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const range = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
        const scale = 20 / (range || 1);

        const centeredPositions = new Float32Array(positions.length);
        let finalMinY = Infinity, finalMaxY = -Infinity;

        for (let i = 0; i < positions.length; i += 3) {
          centeredPositions[i]   = (positions[i]   - centerX) * scale;
          centeredPositions[i+1] = (positions[i+2] - centerZ) * scale;
          centeredPositions[i+2] = -(positions[i+1] - centerY) * scale;
          const h = centeredPositions[i+1];
          if (h < finalMinY) finalMinY = h;
          if (h > finalMaxY) finalMaxY = h;
        }

        const colors = new Float32Array(positions.length);
        const c1 = new THREE.Color("#081d58");
        const c2 = new THREE.Color("#1d91c0");
        const c3 = new THREE.Color("#7fcdbb");
        const c4 = new THREE.Color("#ffffd9");
        const tmp = new THREE.Color();

        for (let i = 0; i < centeredPositions.length; i += 3) {
          const t = finalMaxY === finalMinY ? 0 : Math.max(0, Math.min(1, (centeredPositions[i+1] - finalMinY) / (finalMaxY - finalMinY)));
          if (t < 0.33) tmp.lerpColors(c1, c2, t / 0.33);
          else if (t < 0.66) tmp.lerpColors(c2, c3, (t - 0.33) / 0.33);
          else tmp.lerpColors(c3, c4, (t - 0.66) / 0.34);
          colors[i] = tmp.r; colors[i+1] = tmp.g; colors[i+2] = tmp.b;
        }

        setFullGeoData({ positions: centeredPositions, colors });
        setZBounds({ min: minZ, max: maxZ });
      } catch (error) {
        console.error(`Gagal memuat file LAS (${id}):`, error);
      } finally {
        onLoadingChange(id, false);
      }
    }
    loadLasFile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hasFetched, id, url]);

  const displayData = useMemo(() => {
    if (!fullGeoData) return null;
    const { positions, colors } = fullGeoData;
    const reducedCount = Math.floor((positions.length / 3) / density);
    const newPos = new Float32Array(reducedCount * 3);
    const newCol = new Float32Array(reducedCount * 3);
    let pIndex = 0;
    for (let i = 0; i < positions.length; i += 3 * density) {
      newPos[pIndex] = positions[i]; newPos[pIndex+1] = positions[i+1]; newPos[pIndex+2] = positions[i+2];
      newCol[pIndex] = colors[i];   newCol[pIndex+1] = colors[i+1];   newCol[pIndex+2] = colors[i+2];
      pIndex += 3;
    }
    return { positions: newPos, colors: newCol, count: reducedCount };
  }, [fullGeoData, density]);

  useEffect(() => {
    if (displayData && zBounds.min !== 0) onDataLoaded(id, displayData.count, zBounds.min, zBounds.max);
  }, [displayData, zBounds, id, onDataLoaded]);

  if (!active || !displayData) return null;

  return (
    <points frustumCulled={false}>
      <bufferGeometry key={`${id}-${displayData.count}`} onUpdate={(self) => self.computeBoundingSphere()}>
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-position" count={displayData.count} array={displayData.positions} itemSize={3} />
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-color"    count={displayData.count} array={displayData.colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={2} sizeAttenuation={false} transparent={false} depthWrite />
    </points>
  );
};

// --- MAIN COMPONENT ---
const Mapping3D = () => {
  const [mounted,       setMounted]       = useState(false);
  const [isPanelOpen,   setIsPanelOpen]   = useState(false);
  const [isLegendOpen,  setIsLegendOpen]  = useState(false);

  const [activeLayers, setActiveLayers] = useState({
    tabularasa: true,
    poso:       false,
    hanafi:     false,
    grid:       true,
  });

  const [pointDensity,  setPointDensity]  = useState<number>(4);
  const [layerStats,    setLayerStats]    = useState<Record<string, { count: number; minZ: number; maxZ: number }>>({});
  const [loadingLayers, setLoadingLayers] = useState<Record<string, boolean>>({});

  const isAnyLoading = Object.values(loadingLayers).some(Boolean);

  const engineStats = useMemo(() => {
    if (isAnyLoading) return { points: "Loading...", status: "Parsing Data", statusColor: "text-primary bg-primary/10", minZ: 0, maxZ: 0, hasActiveCloud: false };
    let totalPoints = 0, minZ = Infinity, maxZ = -Infinity, count = 0;
    for (const [key, on] of Object.entries(activeLayers)) {
      if (on && layerStats[key]) {
        totalPoints += layerStats[key].count;
        minZ = Math.min(minZ, layerStats[key].minZ);
        maxZ = Math.max(maxZ, layerStats[key].maxZ);
        count++;
      }
    }
    return {
      points:        count > 0 ? `${totalPoints.toLocaleString()} pts` : "0 pts",
      status:        count > 0 ? "Optimal" : (activeLayers.grid ? "Standby" : "Idle"),
      statusColor:   count > 0 ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10",
      minZ:          minZ === Infinity ? 0 : minZ,
      maxZ:          maxZ === -Infinity ? 0 : maxZ,
      hasActiveCloud: count > 0,
    };
  }, [activeLayers, layerStats, isAnyLoading]);

  useEffect(() => { setMounted(true); }, []);

  const handleDataLoaded   = useCallback((id: string, c: number, mn: number, mx: number) => setLayerStats(p => ({ ...p, [id]: { count: c, minZ: mn, maxZ: mx } })), []);
  const handleLoadingChange = useCallback((id: string, loading: boolean) => setLoadingLayers(p => ({ ...p, [id]: loading })), []);
  const toggleLayer = (k: keyof typeof activeLayers) => setActiveLayers(p => ({ ...p, [k]: !p[k] }));

  if (!mounted) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Globe className="text-primary w-10 h-10 opacity-20" />
      </motion.div>
    </div>
  );

  const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const panelWidth = w >= 1024 ? 360 : w >= 768 ? 300 : 280;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-darklight pt-24">
      <div className="absolute top-0 left-0 w-full h-24 bg-white dark:bg-secondary z-40 border-b border-gray-100 dark:border-white/5" />

      {/* Loading indicator */}
      {isAnyLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[50] flex flex-col items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <Loader2 className="text-primary w-8 h-8 animate-spin" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">Decrypting Point Cloud...</span>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0 cursor-move">
        <WebGLCheck>
          <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: false, logarithmicDepthBuffer: true }}>
            <color attach="background" args={["#050505"]} />
            <PerspectiveCamera makeDefault position={[15, 15, 15]} near={0.1} far={1000} />
            <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Suspense fallback={null}>
              <Center>
                {activeLayers.grid && <gridHelper args={[30, 30, "#1e1e1e", "#121212"]} position={[0, -2, 0]} />}
                <PointCloudModel id="tabularasa" url="/data/3D/PointCloud_Tabularasa.las" active={activeLayers.tabularasa} density={pointDensity} onDataLoaded={handleDataLoaded} onLoadingChange={handleLoadingChange} />
                <PointCloudModel id="poso"       url="/data/3D/PointCloud_Poso.las"      active={activeLayers.poso}       density={pointDensity} onDataLoaded={handleDataLoaded} onLoadingChange={handleLoadingChange} />
              </Center>
              <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
            </Suspense>
          </Canvas>
        </WebGLCheck>
      </div>

      {/* ✅ FIX: Tombol toggle TERPISAH dari motion.div */}
      <div
        className="absolute top-[120px] left-2 md:left-4 lg:left-6 bottom-10 w-[280px] md:w-[300px] lg:w-[360px] z-[100] pointer-events-none h-[calc(100vh-160px)]"
        style={{
          left: isPanelOpen
            ? typeof window !== 'undefined' && window.innerWidth >= 1024
              ? 'calc(1.5rem + 360px + 0.5rem)'   // lg: desktop
              : typeof window !== 'undefined' && window.innerWidth >= 768
                ? 'calc(1rem + 300px + 0.5rem)'    // md: tablet  
                : 'calc(0.5rem + 280px + 0.5rem)'  // mobile
            : '0.5rem',
        }}
      >
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="w-10 h-20 md:h-24 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 pointer-events-auto"
        >
          {isPanelOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* Side panel */}
      <motion.div
        animate={{ x: isPanelOpen ? 0 : -(panelWidth + 20) }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="absolute top-[120px] left-2 md:left-6 bottom-10 w-[calc(100vw-60px)] md:w-[360px] z-[1] pointer-events-none h-[calc(100vh-160px)]"
      >
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-5 md:p-8 flex flex-col pointer-events-auto overflow-hidden h-full">
          <div className="mb-4 md:mb-6 shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
              <Box className="text-primary" /> 3D<span className="text-primary">Data</span>
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Layers size={12} /> Multiple Survey Data
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {/* Layer: Tabularasa */}
            <div className={`rounded-2xl md:rounded-3xl border p-3 md:p-4 transition-all ${activeLayers.tabularasa ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => toggleLayer('tabularasa')} disabled={isAnyLoading}
                    className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all ${activeLayers.tabularasa ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {activeLayers.tabularasa ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Tabularasa Shipwreck</h4>
                    <span className="text-[9px] text-gray-500 font-bold">Wreck Site 1</span>
                  </div>
                </div>
                <Wind size={16} className={`${activeLayers.tabularasa ? 'text-primary' : 'text-gray-400'} opacity-50`} />
              </div>
            </div>

            {/* Layer: Poso */}
            <div className={`rounded-2xl md:rounded-3xl border p-3 md:p-4 transition-all ${activeLayers.poso ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => toggleLayer('poso')} disabled={isAnyLoading}
                    className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all ${activeLayers.poso ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {activeLayers.poso ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Poso Shipwreck</h4>
                    <span className="text-[9px] text-gray-500 font-bold">Wreck Site 2</span>
                  </div>
                </div>
                <Wind size={16} className={`${activeLayers.poso ? 'text-primary' : 'text-gray-400'} opacity-50`} />
              </div>
            </div>

            {/* Render quality */}
            <div className="mt-4 border-t border-gray-200 dark:border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={14} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Render Quality</span>
              </div>
              <div className="flex gap-2 bg-gray-100 dark:bg-black/30 p-1.5 rounded-2xl">
                {[{ label: 'Low', value: 10 }, { label: 'Med', value: 4 }, { label: 'High', value: 1 }].map((p) => (
                  <button key={p.label} onClick={() => setPointDensity(p.value)}
                    disabled={isAnyLoading || !engineStats.hasActiveCloud}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${pointDensity === p.value ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ✅ MOBILE LEGEND: floating card pojok kanan bawah */}
      <div className="md:hidden absolute bottom-3 right-2 z-[1] pointer-events-auto">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border transition-all text-[10px] font-black uppercase tracking-wider ${
            isLegendOpen
              ? 'bg-primary text-white border-primary/80'
              : 'bg-gray-900/95 text-white border-white/10 backdrop-blur-xl'
          }`}
        >
          <List size={12} className={isLegendOpen ? 'text-white' : 'text-primary'} />
          Diagnostics
          <ChevronRight size={11} className={`transition-transform ${isLegendOpen ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {isLegendOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 w-52 bg-gray-900/97 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Engine Diagnostics</span>
              </div>

              {/* Stats */}
              <div className="p-3 space-y-2 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">System Status</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${engineStats.statusColor}`}>
                    {engineStats.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Active Points</span>
                  <span className="text-[9px] font-black text-blue-400">{engineStats.points}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{
                      width: engineStats.hasActiveCloud && !isAnyLoading ? "100%" : (isAnyLoading ? "60%" : "30%"),
                      backgroundColor: isAnyLoading ? "#3b82f6" : (engineStats.hasActiveCloud ? "#10b981" : "#eab308"),
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>

              {/* Depth scale */}
              {engineStats.hasActiveCloud && !isAnyLoading && (
                <div className="p-3">
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-2 text-center">Depth Scale (Z)</p>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-16 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to top, #081d58, #1d91c0, #7fcdbb, #ffffd9)' }} />
                    <div className="flex flex-col justify-between h-16 py-0.5">
                      <span className="text-[9px] font-mono font-bold text-gray-300">{engineStats.maxZ.toFixed(1)} m</span>
                      <span className="text-[9px] font-mono text-gray-500">{((engineStats.minZ + engineStats.maxZ) / 2).toFixed(1)} m</span>
                      <span className="text-[9px] font-mono font-bold text-gray-300">{engineStats.minZ.toFixed(1)} m</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP LEGEND: pojok kanan bawah */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="hidden md:block absolute bottom-10 right-6 z-[1] pointer-events-none"
      >
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 w-64 pointer-events-auto">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-5 tracking-[0.2em] flex items-center gap-2">
            <List size={14} className="text-primary" /> Engine Diagnostics
          </h5>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">System Status</span>
              <AnimatePresence mode="wait">
                <motion.span key={engineStats.status}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className={`text-[9px] font-black px-2 py-1 rounded-lg italic ${engineStats.statusColor}`}>
                  {engineStats.status}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Active Points</span>
              <motion.span animate={{ color: engineStats.hasActiveCloud ? "#3b82f6" : "#6b7280" }} className="text-[10px] font-black italic">
                {engineStats.points}
              </motion.span>
            </div>
            <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{
                  width: engineStats.hasActiveCloud && !isAnyLoading ? "100%" : (isAnyLoading ? "60%" : (activeLayers.grid ? "30%" : "0%")),
                  backgroundColor: isAnyLoading ? "#3b82f6" : (engineStats.hasActiveCloud ? "#10b981" : "#eab308"),
                }}
                className="h-full"
              />
            </div>
          </div>

          <AnimatePresence>
            {engineStats.hasActiveCloud && !isAnyLoading && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mt-5 border-t border-gray-100 dark:border-white/10 pt-4 overflow-hidden">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-3 block text-center">Depth Scale (Z-Axis)</span>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-4 h-32 rounded-full shadow-inner border border-white/10"
                    style={{ background: 'linear-gradient(to top, #081d58, #1d91c0, #7fcdbb, #ffffd9)' }} />
                  <div className="flex flex-col justify-between h-32 py-1">
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">{engineStats.maxZ.toFixed(2)} m</span>
                    <span className="text-[11px] font-mono font-bold text-gray-500">{((engineStats.minZ + engineStats.maxZ) / 2).toFixed(2)} m</span>
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">{engineStats.minZ.toFixed(2)} m</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Mapping3D;