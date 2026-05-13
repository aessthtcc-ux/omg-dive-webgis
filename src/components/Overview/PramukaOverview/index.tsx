"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Landmark, Info, CreditCard, MapPin, Anchor, TrendingUp, TreePalm, ShieldCheck,
  Fish, Bike, Sun, Utensils, Home 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import dynamic from 'next/dynamic';

// Import Leaflet secara dinamis untuk menghindari error SSR di Next.js
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });

const adwiData = [
  { year: '2021', rank: 0 },
  { year: '2022', rank: 300 },
  { year: '2023', rank: 300 },
  { year: '2024', rank: 50 },
];

const heroImages = [
  "https://www.brenggo-id.com/wp-content/uploads/2023/03/27.-5-Hal-Menarik-Untuk-Liburan-di-Pulau-Pramuka-Kepulauan-Seribu-1.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgJk09HmVdm2Bprphyphenhyphen_kaUqwP65Br_TrnEhoRiwIELo5XRnn9VBcvhuLJbYo6ZUw9vwU9TDkaN1KL0InB6GydMP1eYFmFv7iml68h9exwfAosSsmI-aJVrrPXlWOM-V84y-9lnkXymCEmxRCyLTk55Sw9JqaiLOtw-Lsyii0eWt4H6DBJzoYW94ynM8YSxM/s850/wisata-pulau-harapan.jpg",
  "https://www.mldspot.com/storage/generated/June2021/Suka%20Diving2.jpg"
];

const PramukaOverview = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const position: [number, number] = [-5.7461, 106.6139];

  const slideUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-dark dark:text-white pb-20">
      <div className="pt-32 container mx-auto px-6 space-y-12">
        
        {/* 🏝️ HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* @ts-ignore */}
          <motion.section 
            {...slideUp}
            className="lg:col-span-12 relative p-10 lg:p-12 rounded-[3rem] bg-gray-900 text-white overflow-hidden min-h-[500px] lg:min-h-[550px] flex flex-col justify-center shadow-sm"
          >
            {/* --- BACKGROUND SLIDESHOW LAYER --- */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIdx}
                  src={heroImages[currentIdx]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full h-full object-cover"
                  alt="Pulau Pramuka Footage"
                />
              </AnimatePresence>
              
              {/* Layer Warna Biru Opacity 20% */}
              <div className="absolute inset-0 bg-blue-600/40 z-10" />

              {/* Overlay Gradient untuk Kontras Teks */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-20" />
            </div>

            {/* --- LOGO (Sesuai Permintaan: Statis, Folder Public, No Circle) --- */}
            <div className="absolute top-10 right-10 z-30">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center"
              >
                <img 
                  src="/images/logodesa.png" 
                  alt="Logo Desa Pramuka" 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                />
              </motion.div>
            </div>

            <div className="relative z-30 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-6 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10"
              >
                <TreePalm size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">National Tourism Hub</span>
              </motion.div>
              
              <h1 className="text-6xl lg:text-8xl font-black mb-6 tracking-tight leading-none drop-shadow-2xl">
                Pramuka Island
              </h1>
              
              <p className="text-lg lg:text-xl text-blue-50/90 max-w-md leading-relaxed font-medium drop-shadow-lg">
                The gateway to nature, history, and underwater wonders. Where beauty meets adventure in the heart of Kepulauan Seribu.
              </p>
            </div>

            {/* Indikator Slideshow */}
            <div className="absolute bottom-10 right-12 z-30 flex gap-2">
              {heroImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentIdx === i ? "w-8 bg-primary" : "w-2 bg-white/30"}`}
                />
              ))}
            </div>
          </motion.section>
        </div>

        {/* 📍 LOCATION & ADWI RANKING CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* @ts-ignore */}
          <motion.div 
            {...slideUp}
            className="lg:col-span-7 p-10 rounded-[3rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex flex-col justify-between shadow-sm min-h-[400px]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Kolom Kiri: Teks & Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-3 mb-6">
                      <MapPin className="text-primary" /> Location
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify font-medium">
                      Situated in North Jakarta, it serves as the administrative center of the Thousand Islands Regency. Strategically located between bustling city life and pristine marine nature.
                    </p>
                  </div>
                  
                  <div className="mt-8 bg-white dark:bg-white/10 p-5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/20 shadow-inner">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Coordinates</span>
                    <code className="text-sm font-mono font-bold dark:text-white">5.7461° S, 106.6139° E</code>
                  </div>
                </div>

                {/* SISI KANAN: PETA (FIXED ASPECT RATIO) */}
                <div className="relative w-full min-h-[300px] md:min-h-full">
                  <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-white/10 shadow-xl z-0">
                    <MapContainer 
                      center={position} 
                      zoom={15} 
                      scrollWheelZoom={false}
                      className="h-full w-full"
                      style={{ height: "100%", width: "100%", position: "absolute" }} 
                    >
                      <TileLayer
                        attribution='&copy; OSM'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Overlay Custom Marker (Floating Pin) */}
                      <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center">
                        <div className="bg-primary p-2.5 rounded-full shadow-2xl animate-bounce border-2 border-white">
                          <MapPin size={24} color="white" fill="white" />
                        </div>
                      </div>
                    </MapContainer>
                    
                    {/* Tint Biru Halus agar senada dengan Hero Section */}
                    <div className="absolute inset-0 pointer-events-none bg-blue-500/5 mix-blend-multiply z-[400]" />
                  </div>
                </div>
            </div>
          </motion.div>

          
          {/* ADWI Ranking Chart */}
          <motion.div 
            {...slideUp}
            transition={{ ...(slideUp.transition as any).transition, delay: 0.2 }}
            className="lg:col-span-5 p-10 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-white/5"
          >
            <div className="relative z-10">
              {/* Header Section */}
              <div>
                <h3 className="text-xl font-black mb-1 flex items-center gap-2 text-white">
                  <TrendingUp className="text-primary" size={20} /> ADWI Achievement
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">National Award Journey</p>
              </div>

              {/* Chart Section - Margin mt-4 lebih rapat dengan title */}
              <div className="h-[200px] w-full mt-4 -ml-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    // Filter data agar mulai dari 2022
                    data={adwiData.filter(d => d.year !== '2021')} 
                    margin={{ top: 30, right: 35, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#4b5563', fontSize: 11, fontWeight: '900' }}
                      dy={10}
                      // Memberikan padding agar label 2022 tidak terpotong di kiri
                      padding={{ left: 20, right: 20 }} 
                    />
                    
                    {/* YAxis REVERSED agar rank 50 di atas rank 300 */}
                    <YAxis reversed hide domain={[-50, 350]} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="rank" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fill="url(#colorRank)"
                      animationDuration={2000}
                      dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      label={{ 
                        position: 'top', 
                        fill: '#fff', 
                        fontSize: 11, 
                        fontWeight: '900',
                        offset: 15,
                        // Format label hanya angka ranking
                        formatter: (value: any) => `#${value}` 
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Footer Section */}
            <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-4xl font-black text-white leading-none tracking-tight">
                  TOP 50
                </span>
                <p className="text-[9px] font-bold uppercase text-gray-500 tracking-[0.2em] mt-1">
                  National Milestone 2024
                </p>
              </div>
              
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="text-primary" size={20} />
              </div>
            </div>

            {/* Glow Decor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[60px]" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 blur-[80px]" />
          </motion.div>
        </div>

        {/* 🌟 STRENGTHS GRID */}
        {/* @ts-ignore */}
        <motion.div {...slideUp} className="space-y-8">
          <h3 className="text-3xl font-black tracking-tighter uppercase">
            Why Visit <span className="text-primary">Pramuka?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Natural Beauty", icon: <Sun />, desc: "Pristine beaches and crystal-clear waters untouched by mass tourism." },
              { title: "Diverse Activities", icon: <Fish />, desc: "From snorkeling to island hopping, adventure is everywhere." },
              { title: "Comprehensive", icon: <ShieldCheck />, desc: "Well-equipped infrastructure with homestays and restaurants." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  {item.icon}
                </div>
                <h4 className="text-xl font-black mb-3">{item.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🛠️ FACILITIES QUICK BAR */}
        {/* @ts-ignore */}
        <motion.div 
          {...slideUp}
          className="bg-primary/[0.03] dark:bg-white/5 p-10 lg:p-12 rounded-[3.5rem] flex flex-wrap gap-y-10 justify-center items-start border border-primary/10 shadow-inner"
        >
          {[
            { icon: <Home />, label: "Homestays" },
            { icon: <Utensils />, label: "Seafood" },
            { icon: <Bike />, label: "Bicycles" },
            { icon: <Anchor />, label: "Dive Gear" },
            
            { icon: <Info />, label: "Info Center" },
            { icon: <CreditCard />, label: "ATM Center" }
          ].map((fac, idx) => (
            /* Wadah dengan lebar tetap (w-28 atau w-32) agar jarak antar pusat ikon selalu sama */
            <div key={idx} className="flex flex-col items-center w-28 lg:w-32 group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-5 bg-white dark:bg-gray-800 rounded-full shadow-md text-primary border border-gray-100 dark:border-white/10 cursor-pointer group-hover:bg-primary group-hover:text-white transition-colors duration-300"
              >
                {React.cloneElement(fac.icon as React.ReactElement, { size: 24 })}
              </motion.div>
              
              {/* Label dengan tinggi tetap (h-10) agar tidak mendorong container jika teks lebih dari 1 baris */}
              <span className="mt-4 text-[10px] font-black uppercase tracking-[0.1em] opacity-60 dark:text-white group-hover:opacity-100 group-hover:text-primary transition-all duration-300 text-center leading-tight h-5">
                {fac.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default PramukaOverview;