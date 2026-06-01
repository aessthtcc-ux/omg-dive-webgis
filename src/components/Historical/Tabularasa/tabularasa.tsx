"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PosoContent from "../Poso/poso";
import WildlifeSightings from "@/components/Historical/Tabularasa";
import {
  Anchor, MapPin, Waves, History,
  Camera, Activity, Info, X, Images,
  ChevronLeft, ChevronRight, Wind, Thermometer,
  CloudRain, BookOpen, AlertCircle,
  Sun, Fish, Star, Eye, Gauge
} from "lucide-react";

// ---------------------------------------------------------------------------
// DATA GALLERY
// ---------------------------------------------------------------------------
const tabularasaImages = [
  "https://cdn.divessi.com/cached/divesites/79/85/6/images/65e580afbcd90_79856_741447.png/800.jpg",
  "https://cdn.divessi.com/cached/divesites/79/85/6/images/65e580f2eccb4_79856_741447.png/800.jpg",
  "https://cdn.divessi.com/cached/divesites/79/85/6/images/65e5816d56e05_79856_741447.png/800.jpg",
  "https://cdn.divessi.com/cached/divesites/79/85/6/images/65e5846d5784f_79856_741447.png/800.jpg",
];

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const Tabularasa = () => {
  const [activeWreck, setActiveWreck] = useState("tabularasa");

  return (
    <div className="min-h-screen text-dark dark:text-white pb-20">
      <section className="pt-24 md:pt-32 pb-10 container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          {/* ✅ MOBILE FIX: judul lebih kecil di mobile */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-6xl font-black mb-6 text-center tracking-tighter"
          >
            HISTORICAL <span className="text-primary">STORIES</span>
          </motion.h1>

          {/* ✅ MOBILE FIX: tab switcher lebih compact di mobile */}
          <div className="inline-flex p-1 md:p-1.5 bg-gray-100 dark:bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-sm md:w-auto">
            <button
              onClick={() => setActiveWreck("tabularasa")}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all duration-300 ${
                activeWreck === "tabularasa"
                  ? "bg-primary text-white shadow-lg"
                  : "hover:bg-primary/10 text-gray-500"
              }`}
            >
              Tabularasa
            </button>
            <button
              onClick={() => setActiveWreck("poso")}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all duration-300 ${
                activeWreck === "poso"
                  ? "bg-primary text-white shadow-lg"
                  : "hover:bg-primary/10 text-gray-500"
              }`}
            >
              Poso Wreck
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeWreck === "tabularasa" ? (
            <TabularasaContent key="tabularasa" />
          ) : (
            <PosoContent key="poso" />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// INTERFACE
// ---------------------------------------------------------------------------
interface MarineData {
  waveHeight: number;
  wavePeriod: number;
  oceanCurrent: number;
  waterTemp: number;
  windSpeed: number;
  precipitation: number;
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// TABULARASA CONTENT
// ---------------------------------------------------------------------------
const TabularasaContent = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [marineWeather, setMarineWeather] = useState<MarineData>({
    waveHeight: 0, wavePeriod: 0, oceanCurrent: 0,
    waterTemp: 0, windSpeed: 0, precipitation: 0,
    loading: true, error: null,
  });

  useEffect(() => {
    const fetchMarineData = async () => {
      try {
        const [marineRes, weatherRes] = await Promise.all([
          fetch("https://marine-api.open-meteo.com/v1/marine?latitude=-5.74&longitude=106.62&current=wave_height,wave_period,ocean_current_velocity&timezone=Asia%2FJakarta"),
          fetch("https://api.open-meteo.com/v1/forecast?latitude=-5.74&longitude=106.62&current=temperature_2m,wind_speed_10m,precipitation&timezone=Asia%2FJakarta"),
        ]);
        if (!marineRes.ok || !weatherRes.ok) throw new Error("API error");
        const marineJson = await marineRes.json();
        const weatherJson = await weatherRes.json();
        setMarineWeather({
          waveHeight: marineJson.current.wave_height,
          wavePeriod: marineJson.current.wave_period,
          oceanCurrent: marineJson.current.ocean_current_velocity,
          waterTemp: weatherJson.current.temperature_2m,
          windSpeed: weatherJson.current.wind_speed_10m,
          precipitation: weatherJson.current.precipitation ?? 0,
          loading: false, error: null,
        });
      } catch {
        setMarineWeather((prev) => ({ ...prev, loading: false, error: "Weather data unavailable" }));
      }
    };
    fetchMarineData();
  }, []);

  const Val = ({ loading, error, value, unit }: { loading: boolean; error: string | null; value: number; unit: string }) => {
    if (loading) return <div className="h-7 w-14 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg mx-auto" />;
    return <span className="text-xl md:text-2xl font-black dark:text-white">{error ? "--" : value} <span className="text-xs md:text-sm font-medium text-gray-400">{unit}</span></span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }} className="space-y-8 md:space-y-12"
    >
      {/* ── HERO BENTO GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* ✅ MOBILE FIX: padding & font lebih kecil di mobile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-primary text-white relative overflow-hidden group flex flex-col justify-center min-h-[260px] md:min-h-[450px]"
        >
          <div className="absolute top-5 md:top-10 left-5 md:left-10 z-20">
            <div className="flex items-center gap-2 bg-white/20 w-fit px-3 md:px-4 py-1 rounded-full backdrop-blur-md border border-white/10">
              <Anchor size={14} />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">National Maritime Legacy</span>
            </div>
          </div>
          <div className="relative z-10 mt-8 md:mt-0">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-6 tracking-tight leading-none">Tabularasa Wreck</h2>
            <p className="text-sm md:text-lg text-blue-50/80 max-w-md leading-relaxed font-medium">
              An STP training ship that found its final resting place in 1995. Now a thriving artificial reef and a symbol of Indonesia's maritime development.
            </p>
          </div>
          <History className="absolute -bottom-10 -right-10 w-40 md:w-64 h-40 md:h-64 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
        </motion.div>

        {/* ✅ MOBILE FIX: gallery lebih pendek di mobile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-3 h-[260px] md:h-[450px]"
        >
          <div className="col-span-2 row-span-1 relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
            <img src={tabularasaImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Site Documentation Main" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white border border-white/20"><Camera size={16} /></div>
          </div>
          <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
            <img src={tabularasaImages[1]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Site Documentation 2" />
          </div>
          <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
            <img src={tabularasaImages[2]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Site Documentation 3" />
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center text-white group-hover:bg-primary/40 transition-all">
              <Images size={20} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">View All</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── LIVE MARINE CONDITIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }} transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-black flex items-center gap-2 dark:text-white">
            <Waves className="text-primary" size={18} /> Current Conditions
          </h3>
          <span className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest">
            Live · Open-Meteo
          </span>
        </div>

        {/* ✅ MOBILE FIX: 2 kolom di mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {[
            { label: "Wave Height",   icon: <Waves size={18} />,       value: marineWeather.waveHeight,    unit: "m",    bg: "bg-blue-50/50 dark:bg-blue-900/10",    border: "border-blue-100 dark:border-blue-800/30",    iconBg: "bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400" },
            { label: "Wave Period",   icon: <Activity size={18} />,    value: marineWeather.wavePeriod,    unit: "s",    bg: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-800/30", iconBg: "bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400" },
            { label: "Current Vel.", icon: <Wind size={18} />,        value: marineWeather.oceanCurrent,  unit: "km/h", bg: "bg-teal-50/50 dark:bg-teal-900/10",     border: "border-teal-100 dark:border-teal-800/30",    iconBg: "bg-teal-100 dark:bg-teal-800/50 text-teal-600 dark:text-teal-400" },
            { label: "Surface Temp", icon: <Thermometer size={18} />, value: marineWeather.waterTemp,     unit: "°C",   bg: "bg-orange-50/50 dark:bg-orange-900/10", border: "border-orange-100 dark:border-orange-800/30", iconBg: "bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400" },
            { label: "Wind Speed",   icon: <Wind size={18} />,        value: marineWeather.windSpeed,     unit: "km/h", bg: "bg-purple-50/50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-800/30", iconBg: "bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400" },
            { label: "Precipitation",icon: <CloudRain size={18} />,   value: marineWeather.precipitation, unit: "mm",   bg: "bg-cyan-50/50 dark:bg-cyan-900/10",     border: "border-cyan-100 dark:border-cyan-800/30",    iconBg: "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-600 dark:text-cyan-400" },
          ].map((card) => (
            <div key={card.label} className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] ${card.bg} border ${card.border} flex flex-col items-center text-center`}>
              <div className={`w-9 h-9 md:w-12 md:h-12 ${card.iconBg} rounded-full flex items-center justify-center mb-2 md:mb-3`}>{card.icon}</div>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</span>
              <Val loading={marineWeather.loading} error={marineWeather.error} value={card.value} unit={card.unit} />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 mt-3">
          <AlertCircle size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed">
            All values are surface/atmospheric measurements from Open-Meteo API. Underwater visibility should be obtained from in-situ measurements.
          </p>
        </div>
      </motion.div>

      {/* ── HISTORICAL BACKGROUND ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }} transition={{ duration: 0.8 }}
        className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm"
      >
        <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 flex items-center gap-3 text-dark dark:text-white">
          <History className="text-primary" /> Historical Background
        </h3>
        <div className="space-y-3 md:space-y-4">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
            The Tabularasa wreck was an STP training ship that sank in the waters of Pramuka Island in 1995. Damage in the engine room was identified as the primary cause of the sinking.
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
            Although the wreck is under 50 years old, Tabularasa holds national maritime historical value — particularly related to Indonesia's post-independence maritime education — giving the site sufficient significance to be developed as a marine ecotourism attraction.
          </p>
        </div>
      </motion.div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[
          { icon: <MapPin className="text-primary mb-3" size={20} />, label: "Location", value: "Eastern Pramuka Island" },
          { icon: <Waves className="text-primary mb-3" size={20} />, label: "Depth", value: "20 – 33 Meters" },
        ].map(({ icon, label, value }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }} transition={{ duration: 0.6, delay: i * 0.1 }}
            className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col justify-center"
          >
            {icon}
            <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</h4>
            <p className="text-base md:text-xl font-bold dark:text-white mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── SITE POTENTIAL ── */}
      <SitePotential />

      {/* ── DIVE ENVIRONMENT PROFILE ── */}
      <DiveEnvironmentProfile />

      {/* ── POTENTIAL WILDLIFE ── */}
      <motion.div
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-br from-amber-500 to-orange-700 p-6 md:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Fish size={16} className="text-white/80" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/80">Marine Biodiversity</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1">Potential Wildlife</h3>
              <p className="text-white/70 font-medium text-xs md:text-sm">Species recorded at Tabularasa Wreck Site</p>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Fish size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="p-5 md:p-8 lg:p-10">
          <WildlifeSightings />
        </div>
      </motion.div>

      {/* ── LIGHTBOX GALLERY ── */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setIsGalleryOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsGalleryOpen(false)}
                className="absolute top-3 right-3 z-[1010] p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md border border-white/10">
                <X size={18} />
              </button>
              <div className="relative aspect-video flex items-center justify-center bg-[#0a0a0a]">
                <AnimatePresence mode="wait">
                  <motion.img key={currentSlide} src={tabularasaImages[currentSlide]}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain" alt="Shipwreck Documentation" />
                </AnimatePresence>
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <button onClick={() => setCurrentSlide((p) => (p === 0 ? tabularasaImages.length - 1 : p - 1))}
                    className="p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all"><ChevronLeft size={20} /></button>
                  <button onClick={() => setCurrentSlide((p) => (p === tabularasaImages.length - 1 ? 0 : p + 1))}
                    className="p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all"><ChevronRight size={20} /></button>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-3 px-4 md:p-4 md:px-6 flex justify-between items-center border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Frame {currentSlide + 1} of {tabularasaImages.length}</span>
                </div>
                <p className="text-[10px] text-white/40 font-medium hidden sm:block">© INSTRUMENT DIVE ADVENTURE</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// SITE POTENTIAL
// ---------------------------------------------------------------------------
interface CriterionItem {
  label: string;
  score: number;
  max: number;
  category: "archaeological" | "ecological";
  description: string;
}

const criteriaData: CriterionItem[] = [
  { label: "Period / Historical",    score: 1, max: 3, category: "archaeological", description: "Post-independence era, under 50 years old (sunk 1995)" },
  { label: "Educational Value",      score: 2, max: 3, category: "archaeological", description: "STP Training Ship — national maritime & regional history" },
  { label: "Site Depth",            score: 1, max: 3, category: "archaeological", description: "Depth 27 – 35 meters" },
  { label: "Data Quantity",         score: 3, max: 3, category: "archaeological", description: "Structure in complete & intact condition" },
  { label: "Distribution Pattern",  score: 3, max: 3, category: "archaeological", description: "Above 50% of wreck structure visible" },
  { label: "Seabed Morphology",     score: 2, max: 3, category: "ecological",     description: "Relatively flat, slightly sloping in some areas" },
  { label: "Sediment Substrate",    score: 3, max: 3, category: "ecological",     description: "Sandy substrate, less affected by currents" },
  { label: "Coral Cover",           score: 2, max: 3, category: "ecological",     description: "34.92% cover; 22% living coral" },
  { label: "Water Quality",         score: 2, max: 3, category: "ecological",     description: "Temp 30–31.6°C; pH 7.82–8.11; Salinity 33.4‰" },
  { label: "Marine Regional Issue", score: 3, max: 3, category: "ecological",     description: "Marine tourism in RZWP3K DKI Jakarta zoning plan" },
];

const scoreColor = (score: number, max: number) => {
  const pct = score / max;
  if (pct >= 1)   return { dot: "bg-emerald-500", bar: "bg-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" };
  if (pct >= 0.6) return { dot: "bg-blue-500",    bar: "bg-blue-500",    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" };
  return             { dot: "bg-amber-500",   bar: "bg-amber-500",   badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" };
};

const SitePotential = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | "archaeological" | "ecological">("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalScore = criteriaData.reduce((s, c) => s + c.score, 0);
  const totalMax   = criteriaData.reduce((s, c) => s + c.max, 0);
  const archScore  = criteriaData.filter(c => c.category === "archaeological").reduce((s, c) => s + c.score, 0);
  const ecoScore   = criteriaData.filter(c => c.category === "ecological").reduce((s, c) => s + c.score, 0);
  const archMax = 15; const ecoMax = 15;
  const pct = Math.round((totalScore / totalMax) * 100);
  const filtered = criteriaData.filter(c => activeCategory === "all" || c.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }} transition={{ duration: 0.8, ease: "easeOut" }}
      className="rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
    >
      {/* ✅ MOBILE FIX: Header compact */}
      <div className="bg-gradient-to-br from-primary to-blue-700 p-6 md:p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-white/80" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/80">Ecotourism Suitability Assessment</span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1">Site Potential</h3>
            <p className="text-white/70 font-medium text-xs md:text-sm">Based on criteria by I. Dillenia et al. (2021)</p>
          </div>

          {/* ✅ MOBILE FIX: circular + score dalam satu row */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - pct / 100) }}
                  viewport={{ once: false }} transition={{ duration: 1.2, ease: "easeOut" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl md:text-2xl font-black text-white leading-none">{totalScore}</span>
                <span className="text-white/60 text-[9px] md:text-[10px] font-bold">/ {totalMax}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {[{ label: "Archaeological", score: archScore, max: archMax, delay: 0 }, { label: "Ecological", score: ecoScore, max: ecoMax, delay: 0.15 }].map(({ label, score, max, delay }) => (
                <div key={label} className="px-3 py-2 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${(score / max) * 100}%` }} viewport={{ once: false }} transition={{ duration: 1, ease: "easeOut", delay }} className="h-full bg-white rounded-full" />
                    </div>
                    <span className="text-white font-black text-sm">{score}<span className="text-white/50 text-[10px]">/{max}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-8 lg:p-10">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(["all", "archaeological", "ecological"] as const).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeCategory === cat ? "bg-primary text-white shadow-md" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"}`}>
              {cat === "all" ? "All Criteria" : cat}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-gray-400 font-bold">{filtered.length} criteria shown</span>
        </div>

        <div className="space-y-2 md:space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const c = scoreColor(item.score, item.max);
              const isHovered = hoveredIndex === i;
              return (
                <motion.div key={item.label} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] hover:border-primary/30 transition-all duration-200 cursor-default overflow-hidden"
                >
                  <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${item.category === "archaeological" ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold text-dark dark:text-white">{item.label}</p>
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: isHovered ? "auto" : 0, opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.2 }} className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed overflow-hidden">
                      {item.description}
                    </motion.p>
                  </div>
                  <div className="flex gap-1 items-center flex-shrink-0">
                    {Array.from({ length: item.max }).map((_, idx) => (
                      <div key={idx} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${idx < item.score ? c.dot : "bg-gray-200 dark:bg-white/10"}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] md:text-xs font-black px-2 py-1 rounded-lg flex-shrink-0 ${c.badge}`}>{item.score}/{item.max}</span>
                  <motion.div className={`absolute bottom-0 left-0 h-0.5 rounded-b-2xl ${c.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    initial={{ width: 0 }} animate={{ width: isHovered ? `${(item.score / item.max) * 100}%` : 0 }} transition={{ duration: 0.4, ease: "easeOut" }} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          {[{ dot: "bg-blue-400", label: "Archaeological" }, { dot: "bg-emerald-400", label: "Ecological" }, { dot: "bg-emerald-500", label: "Full (3/3)" }, { dot: "bg-blue-500", label: "Partial (2/3)" }, { dot: "bg-amber-500", label: "Low (1/3)" }].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[10px] font-bold text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Info footer */}
        <div className="mt-6 p-4 md:p-5 bg-primary/5 border border-primary/20 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row items-start gap-3">
          <div className="bg-primary/20 p-2.5 rounded-xl text-primary flex-shrink-0"><Info size={18} /></div>
          <div>
            <p className="text-xs md:text-sm font-bold text-primary leading-snug">
              A total score of <span className="underline decoration-2 underline-offset-4">{totalScore} out of {totalMax} ({pct}%)</span> indicates strong potential for marine ecotourism and underwater archaeological park development.
            </p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <BookOpen size={11} />
              Source: I. Dillenia et al. (2021). Suitability assessment for underwater cultural heritage tourism, Pramuka Island.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// DIVE ENVIRONMENT PROFILE
// ---------------------------------------------------------------------------
type Season = "west" | "transition" | "east";

interface SeasonData {
  key: Season;
  label: string;
  period: string;
  gradientFrom: string;
  gradientTo: string;
  bgCard: string;
  borderCard: string;
  accentColor: string;
  icon: React.ReactNode;
  overallRating: number;
  badge: string;
  temp: { min: number; max: number };
  visibility: { min: number; max: number };
  current: { label: string; level: number };
  wave: { label: string; level: number };
  diverLevel: string;
  diverLevelColor: string;
  highlights: string[];
}

const seasonData: SeasonData[] = [
  {
    key: "west", label: "West Monsoon", period: "November – March",
    gradientFrom: "from-blue-600", gradientTo: "to-indigo-700",
    bgCard: "bg-blue-50/60 dark:bg-blue-950/20", borderCard: "border-blue-200 dark:border-blue-800/40",
    accentColor: "text-blue-600 dark:text-blue-400", icon: <CloudRain size={18} />,
    overallRating: 3, badge: "Challenging",
    temp: { min: 28, max: 30 }, visibility: { min: 5, max: 8 },
    current: { label: "Moderate", level: 2 }, wave: { label: "Choppy", level: 3 },
    diverLevel: "Advanced", diverLevelColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    highlights: ["Unique low-visibility exploration experience", "Fewer divers — more solitary dives", "Rich pelagic fish presence due to upwelling"],
  },
  {
    key: "transition", label: "Transition Season", period: "April – May",
    gradientFrom: "from-emerald-500", gradientTo: "to-teal-600",
    bgCard: "bg-emerald-50/60 dark:bg-emerald-950/20", borderCard: "border-emerald-200 dark:border-emerald-800/40",
    accentColor: "text-emerald-600 dark:text-emerald-400", icon: <Sun size={18} />,
    overallRating: 5, badge: "Best Time",
    temp: { min: 29, max: 31 }, visibility: { min: 7, max: 10 },
    current: { label: "Mild", level: 1 }, wave: { label: "Calm", level: 1 },
    diverLevel: "All Levels", diverLevelColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    highlights: ["Peak water clarity — ideal wreck photography", "Warmest surface temperatures of the year", "Suitable for beginners & Open Water certified"],
  },
  {
    key: "east", label: "East Monsoon", period: "June – October",
    gradientFrom: "from-amber-500", gradientTo: "to-orange-600",
    bgCard: "bg-amber-50/60 dark:bg-amber-950/20", borderCard: "border-amber-200 dark:border-amber-800/40",
    accentColor: "text-amber-600 dark:text-amber-400", icon: <Waves size={18} />,
    overallRating: 4, badge: "Recommended",
    temp: { min: 28, max: 29 }, visibility: { min: 8, max: 12 },
    current: { label: "Mild–Moderate", level: 2 }, wave: { label: "Calm", level: 1 },
    diverLevel: "All Levels", diverLevelColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    highlights: ["Best underwater visibility of the year", "Stable conditions for wreck penetration dives", "High biodiversity — coral spawning season"],
  },
];

const MeterBar = ({ level, max = 3, from, to }: { level: number; max?: number; from: string; to: string }) => (
  <div className="flex gap-1 items-center">
    {Array.from({ length: max }).map((_, i) => (
      <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${i < level ? `bg-gradient-to-r ${from} ${to}` : "bg-gray-200 dark:bg-white/10"}`} />
    ))}
  </div>
);

const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star key={i} size={14} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-white/20"} />
    ))}
  </div>
);

const DiveEnvironmentProfile = () => {
  const [activeSeason, setActiveSeason] = useState<Season>("transition");
  const season = seasonData.find((s) => s.key === activeSeason)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }} transition={{ duration: 0.8, ease: "easeOut" }}
      className="rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
    >
      {/* ✅ MOBILE FIX: header compact */}
      <div className={`bg-gradient-to-br ${season.gradientFrom} ${season.gradientTo} p-6 md:p-8 lg:p-10 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-white/80" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/80">Dive Environment Profile</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1">{season.label}</h3>
              <p className="text-white/70 font-medium text-xs md:text-sm">{season.period}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/20">{season.badge}</span>
              <StarRating rating={season.overallRating} />
            </div>
          </div>

          {/* ✅ MOBILE FIX: season tabs compact */}
          <div className="flex gap-2 flex-wrap">
            {seasonData.map((s) => (
              <button key={s.key} onClick={() => setActiveSeason(s.key)}
                className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${activeSeason === s.key ? "bg-white text-gray-900 shadow-lg" : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20"}`}>
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.period.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSeason} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}
          className="p-5 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Kiri: Metric Cards */}
            <div className="space-y-3">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Environmental Conditions</p>

              {[
                { label: "Water Temperature", icon: <Thermometer size={18} className={season.accentColor} />, value: `${season.temp.min}°C – ${season.temp.max}°C`, bar: false },
                { label: "Underwater Visibility*", icon: <Eye size={18} className={season.accentColor} />, value: `${season.visibility.min} – ${season.visibility.max} m`, bar: false, progress: season.visibility.max / 15 },
              ].map(({ label, icon, value, progress }) => (
                <div key={label} className={`p-4 rounded-xl md:rounded-2xl border ${season.bgCard} ${season.borderCard} flex items-center gap-3`}>
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${season.bgCard} border ${season.borderCard}`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                    <p className={`text-base md:text-xl font-black ${season.accentColor}`}>{value}</p>
                    {progress !== undefined && (
                      <div className="mt-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6 }}
                          className={`h-full rounded-full bg-gradient-to-r ${season.gradientFrom} ${season.gradientTo}`} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {[
                { label: "Current Speed", icon: <Gauge size={18} className={season.accentColor} />, value: season.current.label, level: season.current.level },
                { label: "Wave Condition", icon: <Waves size={18} className={season.accentColor} />, value: season.wave.label, level: season.wave.level },
              ].map(({ label, icon, value, level }) => (
                <div key={label} className={`p-4 rounded-xl md:rounded-2xl border ${season.bgCard} ${season.borderCard}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${season.bgCard} border ${season.borderCard}`}>{icon}</div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                      <p className={`text-sm md:text-base font-black ${season.accentColor}`}>{value}</p>
                    </div>
                  </div>
                  <MeterBar level={level} from={season.gradientFrom} to={season.gradientTo} />
                </div>
              ))}
            </div>

            {/* Kanan: Highlights */}
            <div className="flex flex-col gap-4 md:gap-6">
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Recommended Diver Level</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black ${season.diverLevelColor}`}>
                  <Fish size={14} />{season.diverLevel}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Season Highlights</p>
                <div className="space-y-2 md:space-y-3">
                  {season.highlights.map((h, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border ${season.bgCard} ${season.borderCard}`}>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${season.gradientFrom} ${season.gradientTo} text-white text-[9px] md:text-[10px] font-black mt-0.5`}>{i + 1}</div>
                      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{h}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Visibility Comparison</p>
                {seasonData.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 mb-2 last:mb-0">
                    <span className="text-[10px] font-bold text-gray-500 w-20 truncate">{s.label.split(" ")[0]}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(s.visibility.max / 15) * 100}%` }} transition={{ duration: 0.7 }}
                        className={`h-full rounded-full bg-gradient-to-r ${s.gradientFrom} ${s.gradientTo} ${activeSeason === s.key ? "opacity-100" : "opacity-40"}`} />
                    </div>
                    <span className={`text-[10px] font-black w-10 text-right ${activeSeason === s.key ? season.accentColor : "text-gray-400"}`}>{s.visibility.max}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2">
            <AlertCircle size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed">
              * Underwater visibility estimated from field survey data. Individual dive conditions may vary depending on tidal cycle and weather.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Tabularasa;