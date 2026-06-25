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

// ── Panel widths ─────────────────────────────────────────
const PANEL_W = { mobile: 280, tablet: 300, desktop: 360 };

// ── Interfaces ───────────────────────────────────────────
interface PointCloudProps {
  id: string;
  url: string;
  active: boolean;
  density: number;
  onDataLoaded: (id: string, count: number, minZ: number, maxZ: number) => void;
  onLoadingChange: (id: string, isLoading: boolean) => void;
}

interface MeshModelProps {
  url: string;
  active: boolean;
  onLoadingChange: (id: string, isLoading: boolean) => void;
  id: string;
}

// ── PLY MESH COMPONENT ───────────────────────────────────
// PLY lebih stabil dari OBJ: binary format, tidak geter, support vertex color
const PLYMeshModel = ({ url, active, onLoadingChange, id }: MeshModelProps) => {
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!active && !hasFetched) return;
    if (mesh) return;

    let cancelled = false;
    setHasFetched(true);
    onLoadingChange(id, true);

    const load = async () => {
      try {
        // ✅ PLYLoader dari three-stdlib — stabil, sudah include di @react-three/drei
        const { PLYLoader } = await import("three-stdlib");
        if (cancelled) return;

        const loader = new PLYLoader();
        loader.load(
          url,
          (geometry) => {
            if (cancelled) return;

            // PLY load sebagai BufferGeometry langsung (bukan Group seperti OBJ)
            geometry.computeVertexNormals();

            // Step 1: Hitung bounding box & scale agar sesuai dengan scene LAS
            geometry.computeBoundingBox();
            const box    = geometry.boundingBox!;
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size   = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 20 / (maxDim || 1);

            // Step 2: Center geometry ke origin (translate vertices langsung)
            // Ini lebih stabil dari manipulasi position mesh
            geometry.translate(-center.x, -center.y, -center.z);
            geometry.scale(scale, scale, scale);

            // Step 3: Cek apakah PLY punya vertex color (dari CloudCompare SF to RGB)
            const hasVertexColor = geometry.hasAttribute('color');

            let material: THREE.Material;

            if (hasVertexColor) {
              // ✅ Jika ada vertex color dari CloudCompare → pakai langsung
              material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                shininess:    30,
                transparent:  true,
                opacity:      0.92,
                side:         THREE.DoubleSide,
              });
            } else {
              // ✅ Fallback: depth-based ShaderMaterial jika tidak ada vertex color
              const depthColorVert = `
                varying float vHeight;
                void main() {
                  vec4 worldPos = modelMatrix * vec4(position, 1.0);
                  vHeight = worldPos.y;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `;
              const depthColorFrag = `
                uniform float uMinY;
                uniform float uMaxY;
                varying float vHeight;
                void main() {
                  float t = clamp((vHeight - uMinY) / max(uMaxY - uMinY, 0.001), 0.0, 1.0);
                  vec3 c0 = vec3(0.031, 0.114, 0.345); // #081d58 deep blue
                  vec3 c1 = vec3(0.114, 0.569, 0.753); // #1d91c0 cyan
                  vec3 c2 = vec3(0.498, 0.804, 0.733); // #7fcdbb teal
                  vec3 c3 = vec3(1.0,   1.0,   0.851); // #ffffd9 pale yellow
                  vec3 col;
                  if      (t < 0.33) col = mix(c0, c1, t / 0.33);
                  else if (t < 0.66) col = mix(c1, c2, (t - 0.33) / 0.33);
                  else               col = mix(c2, c3, (t - 0.66) / 0.34);
                  gl_FragColor = vec4(col, 0.90);
                }
              `;
              // Hitung Y range geometry setelah translate+scale
              geometry.computeBoundingBox();
              const minY = geometry.boundingBox!.min.y;
              const maxY = geometry.boundingBox!.max.y;

              material = new THREE.ShaderMaterial({
                vertexShader:   depthColorVert,
                fragmentShader: depthColorFrag,
                uniforms: {
                  uMinY: { value: minY },
                  uMaxY: { value: maxY },
                },
                transparent: true,
                side:        THREE.DoubleSide,
                depthWrite:  true,
              });
            }

            // Step 4: Buat mesh dan terapkan rotasi axis swap
            // identik dengan cara LAS memproses koordinat geo → Three.js
            const loadedMesh = new THREE.Mesh(geometry, material);
            loadedMesh.rotation.set(-Math.PI / 2, 0, 0);

            setMesh(loadedMesh);
            onLoadingChange(id, false);
          },
          undefined,
          (error) => {
            if (!cancelled) {
              console.error(`Gagal memuat PLY (${id}):`, error);
              onLoadingChange(id, false);
            }
          }
        );
      } catch (err) {
        if (!cancelled) {
          console.error(`PLYLoader import error (${id}):`, err);
          onLoadingChange(id, false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [active, hasFetched, id, url]);

  if (!active || !mesh) return null;

  return <primitive object={mesh} />;
};

// ── POINT CLOUD COMPONENT ────────────────────────────────
const PointCloudModel = ({ id, url, active, density, onDataLoaded, onLoadingChange }: PointCloudProps) => {
  const [fullGeoData, setFullGeoData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);
  const [zBounds,     setZBounds]     = useState({ min: 0, max: 0 });
  const [hasFetched,  setHasFetched]  = useState(false);

  useEffect(() => {
    if (!active && !hasFetched) return;
    if (fullGeoData) return;

    async function loadLasFile() {
      setHasFetched(true);
      onLoadingChange(id, true);
      try {
        const { load }      = await import('@loaders.gl/core');
        const { LASLoader } = await import('@loaders.gl/las');
        const rawData       = await load(url, LASLoader);
        const positions     = rawData.attributes.POSITION.value;

        let minX = Infinity, maxX = -Infinity,
            minY = Infinity, maxY = -Infinity,
            minZ = Infinity, maxZ = -Infinity;

        for (let i = 0; i < positions.length; i += 3) {
          if (positions[i]   < minX) minX = positions[i];
          if (positions[i]   > maxX) maxX = positions[i];
          if (positions[i+1] < minY) minY = positions[i+1];
          if (positions[i+1] > maxY) maxY = positions[i+1];
          if (positions[i+2] < minZ) minZ = positions[i+2];
          if (positions[i+2] > maxZ) maxZ = positions[i+2];
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const range   = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
        const scale   = 20 / (range || 1);

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
        const cShallow = new THREE.Color("#ff0000"); // merah  → dangkal
        const cMid     = new THREE.Color("#00ff00"); // hijau  → tengah
        const cDeep    = new THREE.Color("#0000ff"); // biru   → dalam
        const tmp = new THREE.Color();

        for (let i = 0; i < centeredPositions.length; i += 3) {
          const t = finalMaxY === finalMinY
            ? 0
            : Math.max(0, Math.min(1, (centeredPositions[i+1] - finalMinY) / (finalMaxY - finalMinY)));
          if (t < 0.5) tmp.lerpColors(cDeep, cMid, t / 0.5);
          else         tmp.lerpColors(cMid, cShallow, (t - 0.5) / 0.5);
          colors[i] = tmp.r; colors[i+1] = tmp.g; colors[i+2] = tmp.b;
        }

        setFullGeoData({ positions: centeredPositions, colors });
        setZBounds({ min: minZ, max: maxZ });
      } catch (error) {
        console.error(`Gagal memuat LAS (${id}):`, error);
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
      newPos[pIndex]   = positions[i];   newPos[pIndex+1] = positions[i+1]; newPos[pIndex+2] = positions[i+2];
      newCol[pIndex]   = colors[i];      newCol[pIndex+1] = colors[i+1];   newCol[pIndex+2] = colors[i+2];
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

// ── LAYER CONFIG ─────────────────────────────────────────
// Tipe layer: 'pointcloud' | 'mesh'
type LayerType = 'pointcloud' | 'mesh';

interface LayerConfig {
  id: string;
  label: string;
  subtitle: string;
  type: LayerType;
  url: string;
  group: 'tabularasa' | 'poso'; // untuk exclusive toggle per wreck
}

const LAYERS: LayerConfig[] = [
  {
    id: 'pc_tabularasa',
    label: 'Tabularasa Point Cloud',
    subtitle: 'Wreck Site 1 · LAS',
    type: 'pointcloud',
    url: '/data/3D/PointCloud_Tabularasa.las',
    group: 'tabularasa',
  },
  {
    id: 'mesh_tabularasa',
    label: 'Tabularasa 3D Mesh',
    subtitle: 'Wreck Site 1 · PLY',
    type: 'mesh',
    url: '/data/3D/PLY_Mesh_Tabularasa.ply',
    group: 'tabularasa',
  },
  {
    id: 'pc_poso',
    label: 'Poso Point Cloud',
    subtitle: 'Wreck Site 2 · LAS',
    type: 'pointcloud',
    url: '/data/3D/PointCloud_Poso.las',
    group: 'poso',
  },
  {
    id: 'mesh_poso',
    label: 'Poso 3D Mesh',
    subtitle: 'Wreck Site 2 · PLY',
    type: 'mesh',
    url: '/data/3D/PLY_Mesh_Poso.ply',
    group: 'poso',
  },
];

// ── MAIN COMPONENT ───────────────────────────────────────
const Mapping3D = () => {
  const [mounted,      setMounted]      = useState(false);
  const [isPanelOpen,  setIsPanelOpen]  = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [winWidth,     setWinWidth]     = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Active layers: set of layer IDs
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['pc_tabularasa']));
  const [showGrid,     setShowGrid]     = useState(true);
  const [pointDensity, setPointDensity] = useState<number>(4);

  const [layerStats,    setLayerStats]    = useState<Record<string, { count: number; minZ: number; maxZ: number }>>({});
  const [loadingLayers, setLoadingLayers] = useState<Record<string, boolean>>({});

  const isAnyLoading = Object.values(loadingLayers).some(Boolean);

  // ✅ Global radio: hanya 1 layer aktif di seluruh scene
  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      // Kalau sudah aktif → deselect (kosong)
      if (prev.has(id)) return new Set<string>();
      // Kalau belum aktif → matikan semua, aktifkan hanya ini
      return new Set<string>([id]);
    });
  };

  const engineStats = useMemo(() => {
    if (isAnyLoading) return {
      points: "Loading...", status: "Parsing Data",
      statusColor: "text-primary bg-primary/10", minZ: 0, maxZ: 0, hasActiveCloud: false
    };

    let totalPoints = 0, minZ = Infinity, maxZ = -Infinity, count = 0;
    activeLayers.forEach(id => {
      if (layerStats[id]) {
        totalPoints += layerStats[id].count;
        minZ = Math.min(minZ, layerStats[id].minZ);
        maxZ = Math.max(maxZ, layerStats[id].maxZ);
        count++;
      }
    });

    const hasActive = activeLayers.size > 0;
    return {
      points:         hasActive ? `${totalPoints > 0 ? totalPoints.toLocaleString() : '—'} pts` : "0 pts",
      status:         hasActive ? "Optimal" : (showGrid ? "Standby" : "Idle"),
      statusColor:    hasActive ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10",
      minZ:           minZ === Infinity  ? 0 : minZ,
      maxZ:           maxZ === -Infinity ? 0 : maxZ,
      hasActiveCloud: count > 0,
    };
  }, [activeLayers, layerStats, isAnyLoading, showGrid]);

  useEffect(() => { setMounted(true); }, []);

  const handleDataLoaded    = useCallback((id: string, c: number, mn: number, mx: number) =>
    setLayerStats(p => ({ ...p, [id]: { count: c, minZ: mn, maxZ: mx } })), []);
  const handleLoadingChange = useCallback((id: string, loading: boolean) =>
    setLoadingLayers(p => ({ ...p, [id]: loading })), []);

  if (!mounted) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Globe className="text-primary w-10 h-10 opacity-20" />
      </motion.div>
    </div>
  );

  const panelW     = winWidth >= 1024 ? PANEL_W.desktop : winWidth >= 768 ? PANEL_W.tablet : PANEL_W.mobile;
  const panelLeft  = winWidth >= 1024 ? '1.5rem' : winWidth >= 768 ? '1rem' : '0.5rem';
  const toggleLeft = isPanelOpen ? `calc(${panelLeft} + ${panelW}px + 0.5rem)` : '0.5rem';

  // Group layers untuk tampilan panel
  const tabularasaLayers = LAYERS.filter(l => l.group === 'tabularasa');
  const posoLayers       = LAYERS.filter(l => l.group === 'poso');

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-darklight pt-24">
      <div className="absolute top-0 left-0 w-full h-24 bg-white dark:bg-secondary z-40 border-b border-gray-100 dark:border-white/5" />

      {/* Loading overlay */}
      {isAnyLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 bg-black/70 px-6 py-4 rounded-2xl border border-white/10">
          <Loader2 className="text-primary w-8 h-8 animate-spin" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">Loading 3D Data...</span>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0 cursor-move">
        <WebGLCheck>
          <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: false, logarithmicDepthBuffer: true }}>
            <color attach="background" args={["#050505"]} />
            <PerspectiveCamera makeDefault position={[15, 15, 15]} near={0.1} far={1000} />
            <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -5, -10]} intensity={0.5} color="#1d91c0" />
            <Suspense fallback={null}>
              <Center>
                {showGrid && <gridHelper args={[30, 30, "#1e1e1e", "#121212"]} position={[0, -2, 0]} />}

                {/* Point Cloud Layers */}
                <PointCloudModel
                  id="pc_tabularasa" url="/data/3D/PointCloud_Tabularasa.las"
                  active={activeLayers.has('pc_tabularasa')} density={pointDensity}
                  onDataLoaded={handleDataLoaded} onLoadingChange={handleLoadingChange}
                />
                <PointCloudModel
                  id="pc_poso" url="/data/3D/PointCloud_Poso.las"
                  active={activeLayers.has('pc_poso')} density={pointDensity}
                  onDataLoaded={handleDataLoaded} onLoadingChange={handleLoadingChange}
                />

                {/* PLY Mesh Layers */}
                <PLYMeshModel
                  id="mesh_tabularasa" url="/data/3D/PLY_Mesh_Tabularasa.ply"
                  active={activeLayers.has('mesh_tabularasa')}
                  onLoadingChange={handleLoadingChange}
                />
                <PLYMeshModel
                  id="mesh_poso" url="/data/3D/PLY_Mesh_Poso.ply"
                  active={activeLayers.has('mesh_poso')}
                  onLoadingChange={handleLoadingChange}
                />
              </Center>
              <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
            </Suspense>
          </Canvas>
        </WebGLCheck>
      </div>

      {/* Toggle button */}
      <div
        className="absolute top-[120px] z-[10] flex flex-col justify-center h-[calc(100vh-160px)] pointer-events-none transition-all duration-500"
        style={{ left: toggleLeft }}
      >
        <button onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="w-10 h-20 md:h-24 bg-primary hover:bg-primary/90 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 pointer-events-auto">
          {isPanelOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* Side panel */}
      <motion.div
        animate={{ x: isPanelOpen ? 0 : -(panelW + 20) }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        style={{ width: panelW, left: panelLeft }}
        className="absolute top-[120px] bottom-10 z-[1] pointer-events-none h-[calc(100vh-160px)]"
      >
        <div className="bg-white/90 dark:bg-gray-900/95 border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-4 md:p-5 lg:p-6 flex flex-col pointer-events-auto overflow-hidden h-full">

          <div className="mb-4 shrink-0">
            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-2">
              <Box className="text-primary" size={19} /> 3D<span className="text-primary">Data</span>
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <Layers size={11} /> Select one layer per wreck
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">

            {/* ── TABULARASA GROUP ── */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Tabularasa Wreck</span>
              </div>
              <div className="space-y-2 pl-1">
                {tabularasaLayers.map(layer => {
                  const isActive = activeLayers.has(layer.id);
                  const isLoading = loadingLayers[layer.id];
                  return (
                    <div key={layer.id}
                      className={`rounded-xl md:rounded-2xl border p-3 transition-colors ${isActive ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggleLayer(layer.id)} disabled={isAnyLoading}
                            className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading
                              ? <Loader2 size={14} className="animate-spin" />
                              : isActive ? <Eye size={14} /> : <EyeOff size={14} />
                            }
                          </button>
                          <div>
                            <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{layer.label}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {/* Badge tipe layer */}
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                                layer.type === 'mesh'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }`}>
                                {layer.type === 'mesh' ? '3D Mesh' : 'Point Cloud'}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold">{layer.subtitle.split('·')[1]?.trim()}</span>
                            </div>
                          </div>
                        </div>
                        {layer.type === 'mesh'
                          ? <Box size={14} className={`${isActive ? 'text-primary' : 'text-gray-400'} opacity-50 flex-shrink-0`} />
                          : <Wind size={14} className={`${isActive ? 'text-primary' : 'text-gray-400'} opacity-50 flex-shrink-0`} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── POSO GROUP ── */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Poso Wreck</span>
              </div>
              <div className="space-y-2 pl-1">
                {posoLayers.map(layer => {
                  const isActive = activeLayers.has(layer.id);
                  const isLoading = loadingLayers[layer.id];
                  return (
                    <div key={layer.id}
                      className={`rounded-xl md:rounded-2xl border p-3 transition-colors ${isActive ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggleLayer(layer.id)} disabled={isAnyLoading}
                            className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 dark:bg-white/10 text-gray-400'} ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading
                              ? <Loader2 size={14} className="animate-spin" />
                              : isActive ? <Eye size={14} /> : <EyeOff size={14} />
                            }
                          </button>
                          <div>
                            <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{layer.label}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                                layer.type === 'mesh'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }`}>
                                {layer.type === 'mesh' ? '3D Mesh' : 'Point Cloud'}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold">{layer.subtitle.split('·')[1]?.trim()}</span>
                            </div>
                          </div>
                        </div>
                        {layer.type === 'mesh'
                          ? <Box size={14} className={`${isActive ? 'text-primary' : 'text-gray-400'} opacity-50 flex-shrink-0`} />
                          : <Wind size={14} className={`${isActive ? 'text-primary' : 'text-gray-400'} opacity-50 flex-shrink-0`} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RENDER QUALITY + GRID ── */}
            <div className="border-t border-gray-200 dark:border-white/10 pt-3 space-y-3">
              {/* Grid toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grid Helper</span>
                <button onClick={() => setShowGrid(g => !g)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${showGrid ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                  {showGrid ? 'On' : 'Off'}
                </button>
              </div>

              {/* Render quality — hanya untuk point cloud */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Sliders size={12} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Point Cloud Quality</span>
                </div>
                <div className="flex gap-1.5 bg-gray-100 dark:bg-black/30 p-1.5 rounded-2xl">
                  {[{ label: 'Low', value: 10 }, { label: 'Med', value: 4 }, { label: 'High', value: 1 }].map(p => (
                    <button key={p.label} onClick={() => setPointDensity(p.value)}
                      disabled={isAnyLoading}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors ${pointDensity === p.value ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Mobile legend */}
      <div className="md:hidden absolute bottom-3 right-2 z-[1] pointer-events-auto">
        <button onClick={() => setIsLegendOpen(!isLegendOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border transition-colors text-[10px] font-black uppercase tracking-wider ${
            isLegendOpen ? 'bg-primary text-white border-primary/80' : 'bg-gray-900/95 text-white border-white/10'
          }`}>
          <List size={12} className={isLegendOpen ? 'text-white' : 'text-primary'} />
          Diagnostics
          <ChevronRight size={11} className={`transition-transform ${isLegendOpen ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {isLegendOpen && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 w-52 bg-gray-900/97 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Engine Diagnostics</span>
              </div>
              <div className="p-3 space-y-2 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">System Status</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${engineStats.statusColor}`}>{engineStats.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Active Points</span>
                  <span className="text-[9px] font-black text-blue-400">{engineStats.points}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div animate={{
                    width: engineStats.hasActiveCloud && !isAnyLoading ? "100%" : (isAnyLoading ? "60%" : "30%"),
                    backgroundColor: isAnyLoading ? "#3b82f6" : (engineStats.hasActiveCloud ? "#10b981" : "#eab308"),
                  }} className="h-full rounded-full" />
                </div>
              </div>
              {engineStats.hasActiveCloud && !isAnyLoading && (
                <div className="p-3">
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-2 text-center">Depth Scale (Z)</p>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-16 rounded-full flex-shrink-0"
                      style={{ background: 'linear-gradient(to top, #0000ff, #00ff00, #ff0000)' }}
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

      {/* Desktop legend */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="hidden md:block absolute bottom-10 right-6 z-[1] pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/95 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 w-64 pointer-events-auto">
          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <List size={13} className="text-primary" /> Engine Diagnostics
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase">System Status</span>
              <AnimatePresence mode="wait">
                <motion.span key={engineStats.status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`text-[9px] font-black px-2 py-1 rounded-lg italic ${engineStats.statusColor}`}>
                  {engineStats.status}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Active Points</span>
              <motion.span animate={{ color: engineStats.hasActiveCloud ? "#3b82f6" : "#6b7280" }} className="text-[10px] font-black italic">
                {engineStats.points}
              </motion.span>
            </div>
            <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{
                width: engineStats.hasActiveCloud && !isAnyLoading ? "100%" : (isAnyLoading ? "60%" : (showGrid ? "30%" : "0%")),
                backgroundColor: isAnyLoading ? "#3b82f6" : (engineStats.hasActiveCloud ? "#10b981" : "#eab308"),
              }} className="h-full" />
            </div>
          </div>

          <AnimatePresence>
            {engineStats.hasActiveCloud && !isAnyLoading && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mt-4 border-t border-gray-100 dark:border-white/10 pt-4 overflow-hidden">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-3 block text-center">Depth Scale (Z-Axis)</span>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-4 h-28 rounded-full border border-white/10"
                    style={{ background: 'linear-gradient(to top, #0000ff, #00ff00, #ff0000)' }}
                  <div className="flex flex-col justify-between h-28 py-1">
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">{engineStats.maxZ.toFixed(2)} m</span>
                    <span className="text-[11px] font-mono font-bold text-gray-500">{((engineStats.minZ + engineStats.maxZ) / 2).toFixed(2)} m</span>
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">{engineStats.minZ.toFixed(2)} m</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer type legend */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Point Cloud</span>
              <span className="text-[9px] text-gray-400">Raw LAS sonar data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">3D Mesh</span>
              <span className="text-[9px] text-gray-400">Reconstructed OBJ surface</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Mapping3D;