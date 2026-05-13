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

// --- SUB-COMPONENT: REUSABLE POINT CLOUD RENDERER ---
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

  // 1. FETCH DATA (Hanya dijalankan jika layer diaktifkan pertama kali)
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
          centeredPositions[i] = (positions[i] - centerX) * scale;
          centeredPositions[i+1] = (positions[i+2] - centerZ) * scale; 
          centeredPositions[i+2] = -(positions[i+1] - centerY) * scale; 
          
          const currentHeight = centeredPositions[i+1];
          if (currentHeight < finalMinY) finalMinY = currentHeight;
          if (currentHeight > finalMaxY) finalMaxY = currentHeight;
        }

        const colors = new Float32Array(positions.length);
        const color1 = new THREE.Color("#081d58"); 
        const color2 = new THREE.Color("#1d91c0"); 
        const color3 = new THREE.Color("#7fcdbb"); 
        const color4 = new THREE.Color("#ffffd9"); 
        const tempColor = new THREE.Color();

        for (let i = 0; i < centeredPositions.length; i += 3) {
          const height = centeredPositions[i+1];
          const t = finalMaxY === finalMinY ? 0 : Math.max(0, Math.min(1, (height - finalMinY) / (finalMaxY - finalMinY)));
          if (t < 0.33) tempColor.lerpColors(color1, color2, t / 0.33);
          else if (t < 0.66) tempColor.lerpColors(color2, color3, (t - 0.33) / 0.33);
          else tempColor.lerpColors(color3, color4, (t - 0.66) / 0.34);

          colors[i] = tempColor.r; colors[i+1] = tempColor.g; colors[i+2] = tempColor.b;
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

  // 2. DOWNSAMPLING (Pemotongan Kerapatan)
  const displayData = useMemo(() => {
    if (!fullGeoData) return null;
    const { positions, colors } = fullGeoData;
    const reducedCount = Math.floor((positions.length / 3) / density);
    const newPos = new Float32Array(reducedCount * 3);
    const newCol = new Float32Array(reducedCount * 3);

    let pIndex = 0;
    for (let i = 0; i < positions.length; i += 3 * density) {
      newPos[pIndex] = positions[i]; newPos[pIndex+1] = positions[i+1]; newPos[pIndex+2] = positions[i+2];
      newCol[pIndex] = colors[i]; newCol[pIndex+1] = colors[i+1]; newCol[pIndex+2] = colors[i+2];
      pIndex += 3;
    }
    return { positions: newPos, colors: newCol, count: reducedCount };
  }, [fullGeoData, density]);

  // 3. KIRIM STATISTIK KE PARENT
  useEffect(() => {
    if (displayData && zBounds.min !== 0) {
      onDataLoaded(id, displayData.count, zBounds.min, zBounds.max);
    }
  }, [displayData, zBounds, id, onDataLoaded]);

  if (!active || !displayData) return null;

  return (
    <points frustumCulled={false}>
      <bufferGeometry key={`${id}-${displayData.count}`} onUpdate={(self) => self.computeBoundingSphere()}>
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-position" count={displayData.count} array={displayData.positions} itemSize={3} />
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-color" count={displayData.count} array={displayData.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial vertexColors={true} transparent={false} depthWrite={true} sizeAttenuation={false} size={2} />
    </points>
  );
};

// --- MAIN COMPONENT ---
const Mapping3D = () => {
  const [mounted, setMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // STATE: Multi-Layer Control (TAMBAH HANAFI DI SINI)
  const [activeLayers, setActiveLayers] = useState({
    tabularasa: true, // Default ON
    poso: false,      // Default OFF 
    hanafi: false,    // Default OFF 
    grid: true,
  });
  
  // STATE KUALITAS RENDER (10 = Low, 4 = Medium, 1 = High)
  const [pointDensity, setPointDensity] = useState<number>(4);

  // STATE: Statistik & Loading Multi-Layer
  const [layerStats, setLayerStats] = useState<Record<string, { count: number, minZ: number, maxZ: number }>>({});
  const [loadingLayers, setLoadingLayers] = useState<Record<string, boolean>>({});

  // Mengecek apakah ada layer yang sedang loading
  const isAnyLoading = Object.values(loadingLayers).some(status => status === true);

  // Kalkulasi Total Statistik untuk Legenda (TAMBAH KALKULASI HANAFI DI SINI)
  const engineStats = useMemo(() => {
    if (isAnyLoading) return { points: "Loading...", status: "Parsing Data", statusColor: "text-primary bg-primary/10" };
    
    let totalPoints = 0;
    let absoluteMinZ = Infinity;
    let absoluteMaxZ = -Infinity;
    let activeCloudCount = 0;

    // Layer 1: Tabularasa
    if (activeLayers.tabularasa && layerStats['tabularasa']) {
      totalPoints += layerStats['tabularasa'].count;
      absoluteMinZ = Math.min(absoluteMinZ, layerStats['tabularasa'].minZ);
      absoluteMaxZ = Math.max(absoluteMaxZ, layerStats['tabularasa'].maxZ);
      activeCloudCount++;
    }
    // Layer 2: Poso Rasya
    if (activeLayers.poso && layerStats['poso']) {
      totalPoints += layerStats['poso'].count;
      absoluteMinZ = Math.min(absoluteMinZ, layerStats['poso'].minZ);
      absoluteMaxZ = Math.max(absoluteMaxZ, layerStats['poso'].maxZ);
      activeCloudCount++;
    }
    // Layer 3: Poso Hanafi
    if (activeLayers.hanafi && layerStats['hanafi']) {
      totalPoints += layerStats['hanafi'].count;
      absoluteMinZ = Math.min(absoluteMinZ, layerStats['hanafi'].minZ);
      absoluteMaxZ = Math.max(absoluteMaxZ, layerStats['hanafi'].maxZ);
      activeCloudCount++;
    }

    return {
      points: activeCloudCount > 0 ? `${totalPoints.toLocaleString()} pts` : "0 pts",
      status: activeCloudCount > 0 ? "Optimal" : (activeLayers.grid ? "Standby" : "Idle"),
      statusColor: activeCloudCount > 0 ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10",
      minZ: absoluteMinZ === Infinity ? 0 : absoluteMinZ,
      maxZ: absoluteMaxZ === -Infinity ? 0 : absoluteMaxZ,
      hasActiveCloud: activeCloudCount > 0
    };
  }, [activeLayers, layerStats, isAnyLoading]);

  useEffect(() => { setMounted(true); }, []);

  const handleDataLoaded = useCallback((id: string, count: number, minZ: number, maxZ: number) => {
    setLayerStats(prev => ({ ...prev, [id]: { count, minZ, maxZ } }));
  }, []);

  const handleLoadingChange = useCallback((id: string, isLoading: boolean) => {
    setLoadingLayers(prev => ({ ...prev, [id]: isLoading }));
  }, []);

  const toggleLayer = (layerName: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  if (!mounted) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
         <Globe className="text-primary w-10 h-10 opacity-20" />
       </motion.div>
    </div>
  );

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-darklight pt-24">
      
      <div className="absolute top-0 left-0 w-full h-24 bg-white dark:bg-secondary z-40 border-b border-gray-100 dark:border-white/5" />

      {/* INDIKATOR LOADING */}
      {isAnyLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[50] flex flex-col items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <Loader2 className="text-primary w-8 h-8 animate-spin" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">Decrypting Point Cloud...</span>
        </div>
      )}

      {/* 3D SCENE AREA */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0 cursor-move">
        <Canvas frameloop="demand" dpr={[1, 2]} gl={{ antialias: false, logarithmicDepthBuffer: true }}>
          <color attach="background" args={["#050505"]} />
          <PerspectiveCamera makeDefault position={[15, 15, 15]} near={0.1} far={1000} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <Suspense fallback={null}>
            <Center>
              {activeLayers.grid && <gridHelper args={[30, 30, "#1e1e1e", "#121212"]} position={[0, -2, 0]} />}
              
              {/* RENDERER LAYER 1: TABULARASA */}
              <PointCloudModel 
                id="tabularasa"
                url="/data/3D/Day5_Tabularasa.las"
                active={activeLayers.tabularasa} 
                density={pointDensity}
                onDataLoaded={handleDataLoaded}
                onLoadingChange={handleLoadingChange}
              />
              
              {/* RENDERER LAYER 2: POSO RASYA */}
              <PointCloudModel 
                id="poso"
                url="/data/3D/Poso_hanafi.las"
                active={activeLayers.poso} 
                density={pointDensity}
                onDataLoaded={handleDataLoaded}
                onLoadingChange={handleLoadingChange}
              />
            </Center>
            <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI LEFT PANEL: MULTI-LAYER CONTROLS */}
      <motion.div 
        animate={{ x: isPanelOpen ? 0 : -345 }}
        className="absolute top-[120px] left-6 bottom-10 w-[360px] z-[1] flex pointer-events-none h-[calc(100vh-160px)]"
      >
        <div className="flex-1 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col pointer-events-auto overflow-hidden">
          <div className="mb-6 shrink-0">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
              <Box className="text-primary" /> 3D<span className="text-primary">Data</span>
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Layers size={12}/> Multiple Survey Data
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* TOGGLE LAYER 1: TABULARASA */}
             <div className={`rounded-3xl border p-4 transition-all ${activeLayers.tabularasa ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleLayer('tabularasa')}
                      disabled={isAnyLoading}
                      className={`p-2.5 rounded-2xl transition-all ${activeLayers.tabularasa ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {activeLayers.tabularasa ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>
                    <div>
                      <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Tabularasa Shipwreck</h4>
                      <span className="text-[9px] text-gray-500 font-bold">Wreck Site 1</span>
                    </div>
                 </div>
                 <Wind size={16} className={`${activeLayers.tabularasa ? 'text-primary' : 'text-gray-400'} opacity-50`} />
               </div>
             </div>

             {/* TOGGLE LAYER 2: POSO RASYA */}
             <div className={`rounded-3xl border p-4 transition-all ${activeLayers.poso ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleLayer('poso')}
                      disabled={isAnyLoading}
                      className={`p-2.5 rounded-2xl transition-all ${activeLayers.poso ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {activeLayers.poso ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>
                    <div>
                      <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Poso Shipwreck</h4>
                      <span className="text-[9px] text-gray-500 font-bold">Wreck Site 2</span>
                    </div>
                 </div>
                 <Wind size={16} className={`${activeLayers.poso ? 'text-primary' : 'text-gray-400'} opacity-50`} />
               </div>
             </div>

             {/* UI KONTROL KUALITAS RENDER */}
             <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sliders size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Render Quality</span>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-black/30 p-1.5 rounded-2xl">
                  {[
                    { label: 'Low', value: 10 },   
                    { label: 'Med', value: 4 },    
                    { label: 'High', value: 1 }    
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPointDensity(preset.value)}
                      disabled={isAnyLoading || !engineStats.hasActiveCloud}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${pointDensity === preset.value ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
             </div>

          </div>
        </div>
        <div className="flex flex-col justify-center ml-2 pointer-events-auto">
          <button 
            onClick={() => setIsPanelOpen(!isPanelOpen)} 
            className="w-10 h-24 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95"
          >
            {isPanelOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24}/>}
          </button>
        </div>
      </motion.div>

      {/* BOTTOM RIGHT LEGEND & ELEVATION SCALE */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-10 right-20 z-[1000] pointer-events-none"
      >
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 w-64 pointer-events-auto transition-all duration-500">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-5 tracking-[0.2em] flex items-center gap-2">
            <List size={14} className="text-primary"/> Engine Diagnostics
          </h5>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">System Status</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={engineStats.status}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className={`text-[9px] font-black px-2 py-1 rounded-lg italic transition-colors ${engineStats.statusColor}`}
                >
                  {engineStats.status}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Active Points</span>
              <motion.span animate={{ color: engineStats.hasActiveCloud ? "#3b82f6" : "#6b7280" }} className="text-[10px] font-black italic transition-colors">
                {engineStats.points}
              </motion.span>
            </div>

            <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ 
                  width: engineStats.hasActiveCloud && !isAnyLoading ? "100%" : (isAnyLoading ? "60%" : (activeLayers.grid ? "30%" : "0%")),
                  backgroundColor: isAnyLoading ? "#3b82f6" : (engineStats.hasActiveCloud ? "#10b981" : "#eab308")
                }}
                className="h-full"
              />
            </div>
          </div>

          {/* COLOR RAMP LEGEND (Skala Ketinggian) */}
          <AnimatePresence>
            {engineStats.hasActiveCloud && !isAnyLoading && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mt-5 border-t border-gray-100 dark:border-white/10 pt-4 overflow-hidden"
              >
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-3 block text-center">Depth Scale (Z-Axis)</span>
                
                <div className="flex items-center justify-center gap-4">
                  <div 
                    className="w-4 h-32 rounded-full shadow-inner border border-white/10" 
                    style={{ background: 'linear-gradient(to top, #081d58, #1d91c0, #7fcdbb, #ffffd9)' }}
                  />
                  <div className="flex flex-col justify-between h-32 py-1">
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                      {engineStats.maxZ.toFixed(2)} m <span className="text-[9px] text-gray-400 font-sans italic ml-1"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-500">
                      {((engineStats.minZ + engineStats.maxZ) / 2).toFixed(2)} m
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                      {engineStats.minZ.toFixed(2)} m <span className="text-[9px] text-gray-400 font-sans italic ml-1"></span>
                    </span>
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