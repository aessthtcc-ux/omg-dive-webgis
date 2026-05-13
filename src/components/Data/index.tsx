"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, Calendar, Info, BarChart3, 
  Thermometer, ArrowDown, FileCode, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const DataAnalytics = () => {
  const [activeTab, setActiveTab] = useState("svp");
  // Definisikan daftar tanggal survey
  const surveyDates = ["21", "22", "23", "24", "25", "26"];
  const [selectedDay, setSelectedDay] = useState("21"); // Simpan hari saja agar mudah di-map
  const [svpData, setSvpData] = useState<any[]>([]);
  const [svpTimeRange, setSvpTimeRange] = useState({ start: "-", end: "-" }); // State baru
  const [tideData, setTideData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Helper untuk membuat interval waktu tiap 5 jam untuk sumbu X Tides
  const generateTideTicks = () => {
    const ticks = [];
    // Bulan di JavaScript dimulai dari 0 (8 = September)
    let currentTime = new Date(2025, 8, 19, 13, 0).getTime(); 
    const endTime = new Date(2025, 8, 27, 5, 0).getTime();

    while (currentTime <= endTime) {
      const d = new Date(currentTime);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      
      ticks.push(`${dd}-${mm}-${yyyy} ${hh}:00`);
      currentTime += 24 * 60 * 60 * 1000; // Tambah 5 jam
    }
    return ticks;
  };

  const tideTicks = generateTideTicks();

  // 1. Fetch & Parse SVP Data (.txt)
  useEffect(() => {
    const fetchSVP = async () => {
      setLoading(true);
      try {
        const fileName = `SVP_${selectedDay}092025.txt`;
        const response = await fetch(`/data/${fileName}`);
        const text = await response.text();
        
        const lines = text.trim().split("\n");
        
        // Tahap 1: Parse dan Filter data valid
        const validData = lines.map((line) => {
          const columns = line.split(",").map(col => col.trim());
          return {
            sv: parseFloat(columns[2]), 
            depth: parseFloat(columns[3]),
            time: columns[1] // Kolom waktu
          };
        }).filter(item => !isNaN(item.sv) && !isNaN(item.depth));

        // Tahap 2: Ambil waktu awal (index 0) dan akhir (index terakhir) dari data yang valid
        if (validData.length > 0) {
          setSvpTimeRange({
            start: validData[0].time,
            end: validData[validData.length - 1].time
          });
        } else {
          setSvpTimeRange({ start: "-", end: "-" });
        }

        // Tahap 3: Urutkan data berdasarkan kedalaman untuk keperluan Recharts
        const sortedData = [...validData].sort((a, b) => a.depth - b.depth);

        setSvpData(sortedData);
      } catch (err) {
        console.error("Data Parsing Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "svp") fetchSVP();
  }, [selectedDay, activeTab]);

  // 2. Fetch & Parse Tides Data (.csv) - Satu kali load saja
  useEffect(() => {
    const fetchTides = async () => {
    try {
      const response = await fetch(`/data/CORRECTED_TIDES.csv`);
      const text = await response.text();
      const lines = text.trim().split("\n");
      
      // Melewati baris pertama (header)
      const hourlyData = lines.slice(1).map((line) => {
        const p = line.split(";").map(col => col.trim());
        return {
          year: p[0],
          month: p[1],
          date: p[2],
          hour: p[3],
          minute: p[4],
          depth: parseFloat(p[6])
        };
      })
      // Filter hanya menit ke-0 agar label tidak terlalu banyak
      .filter(d => d.minute === "0" || d.minute === "00")
      .map(d => ({
        // Format: 19-09-2025 08:00
        displayTime: `${d.date.padStart(2, '0')}-${d.month.padStart(2, '0')}-${d.year} ${d.hour.padStart(2, '0')}:00`,
        depth: d.depth
      }));

      setTideData(hourlyData);
    } catch (err) {
      console.error("Tidal data error:", err);
    }
  };
    
    fetchTides();
  }, []);

  const slideUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-IcyBreeze dark:bg-darklight pt-32 pb-20">
      <div className="container px-6 mx-auto space-y-12">
        
        <motion.div {...slideUp} className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
            Survey <span className="text-primary">Analytics</span>
          </h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
            Oceanographic datasets acquired between Sept 21 – 26, 2025.
          </p>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mt-6" />
        </motion.div>

        {/* TAB SWITCHER */}
        <div className="flex justify-center">
          <div className="inline-flex p-2 bg-gray-900/5 dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab("svp")}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "svp" ? "bg-primary text-white shadow-xl" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Thermometer size={16}/> SVP Profile
            </button>
            <button
              onClick={() => setActiveTab("tides")}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "tides" ? "bg-primary text-white shadow-xl" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Waves size={16}/> Tides
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "svp" ? (
            <motion.div 
              key="svp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* DATE SELECTOR (Left Side) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-8 rounded-[3.5rem] bg-gray-900 border border-white/5 shadow-2xl">
                  <h3 className="text-white font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
                    <Calendar className="text-primary" size={20} /> Select Date
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {surveyDates.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`py-4 rounded-2xl border transition-all duration-300 ${
                          selectedDay === day 
                          ? "bg-primary border-primary text-white scale-105 shadow-lg" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30"
                        }`}
                      >
                        <span className="block text-[8px] font-black opacity-40 uppercase">Sept</span>
                        <span className="text-xl font-black leading-none">{day}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <div className="flex items-center gap-3 text-primary">
                      <FileCode size={18} />
                      <span className="text-[12px] font-mono font-bold uppercase tracking-tight">SVP_{selectedDay}092025.txt</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                   <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-primary">
                     <Info size={14}/> Interpretation
                   </h4>
                   <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 text-justify font-medium">
                    The SVP graph illustrates how acoustic velocity changes with depth. Each day's profile ensures vertical accuracy for multibeam data.
                  </p>
                </div>
              </div>

              {/* SVP GRAPH AREA */}
              <div className="lg:col-span-8 p-10 rounded-[4rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-sm min-h-[500px] relative">
                <div className="flex justify-between items-start mb-10">
                  <h4 className="text-xl font-black flex items-center gap-3">
                    <BarChart3 className="text-primary" /> Sound Velocity Profile 
                  </h4>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ArrowDown size={12}/> Depth (m) Inverted
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="110%">
                    <LineChart 
                      data={svpData} 
                      layout="vertical" 
                      margin={{ top: 40, right: 30, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} strokeOpacity={0.05} />
                      
                      {/* X-Axis: Sound Velocity (m/s) */}
                    <XAxis 
                      type="number" 
                      dataKey="sv" 
                      orientation="top"
                      // Memaksa domain dari 1540 hingga 1544
                      domain={[1540, 1544]} 
                      // Memaksa interval 1 dan angka bulat
                      ticks={[1540, 1541, 1542, 1543, 1544]} 
                      stroke="#64748b" 
                      fontSize={11} 
                      fontWeight="bold"
                      // Menghilangkan desimal (angka bulat)
                      tickFormatter={(value) => value.toFixed(0)}
                      label={{ value: 'SOUND VELOCITY (m/s)', position: 'top', offset: 20, fontSize: 10, fontWeight: '900' }}
                    />

                    {/* Y-Axis: Depth (m) - Dibalik agar 0 di atas */}
                    <YAxis 
                      type="number"
                      dataKey="depth" 
                      // Memaksa domain dari 0 hingga 36 meter
                      domain={[0, 36]} 
                      // Memaksa interval 8 (0, 8, 16, 24, 32) dan menutup di 36
                      ticks={[0, 6, 12, 18, 24, 30, 36]} 
                      // Diubah ke true agar kedalaman 0 berada di paling atas grafik
                      reversed={false} 
                      stroke="#64748b" 
                      fontSize={11} 
                      fontWeight="bold"
                      unit=" m"
                      label={{ value: 'DEPTH (m)', angle: -90, position: 'insideLeft', offset: -10, fontSize: 10, fontWeight: '900' }}
                    />

                      <Tooltip 
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          color: '#fff' 
                        }}
                        labelFormatter={(value) => `Depth: ${value} m`}
                      />

                      {/* Line dengan type linear agar fluktuasi data terlihat realistik */}
                      <Line 
                        type="linear" 
                        dataKey="sv" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        // Ubah baris ini menjadi false mutlak agar tidak ada dot di tanggal manapun
                        dot={false} 
                        // Active dot tetap dibiarkan agar saat mouse menempel (hover) titiknya muncul sebagai penanda
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* TAMPILAN WAKTU PENGUKURAN DI BAWAH GRAFIK */}
                <div className="mt-14 flex justify-center relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 font-medium shadow-sm">
                    <Calendar size={16} className="text-primary" />
                    <span>
                      Measurement Time: <strong className="text-gray-900 dark:text-white">{svpTimeRange.start}</strong> to <strong className="text-gray-900 dark:text-white">{svpTimeRange.end}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
           /* TIDES GRAPH (Optimized for Hourly Data) */
            <motion.div 
              key="tides" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="p-8 lg:p-12 rounded-[4rem] bg-gray-900 text-white border border-white/5 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black flex items-center gap-4 mb-2 tracking-tighter uppercase">
                    <Waves className="text-primary" size={32} /> Tidal Observation
                  </h3>
                </div>
                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <code className="text-[10px] text-primary font-mono tracking-wider">TIDES.csv</code>
                </div>
              </div>

              {/* Container Grafik dengan Tinggi yang Pas (h-[380px]) untuk meminimalkan margin bawah */}
              <div className="h-[380px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="110%">
                  <AreaChart data={tideData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                    <defs>
                      <linearGradient id="colorTide" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                    
                    <XAxis 
                      dataKey="displayTime" 
                      ticks={tideTicks} 
                      // TAMBAHKAN PADDING DI SINI: Memberikan jarak 30px di kiri dan kanan grafik
                      padding={{ left: 30, right: 20 }} 
                      stroke="#666" 
                      fontSize={9} 
                      fontWeight="bold" 
                      axisLine={false} 
                      tickLine={false}
                      interval={0} 
                      tick={{ fill: '#666'}} // dy ditambah agar tidak tabrakan dengan sumbu X
                    />

                    <YAxis 
                      // Batasi sumbu Y dari 1.6 hingga 2.6
                      domain={[1.6, 2.6]} 
                      // Paksa interval per 0.2
                      ticks={[1.6, 1.8, 2.0, 2.2, 2.4, 2.6]} 
                      // Pastikan formatnya selalu memiliki 1 angka desimal (misal 2.0, bukan 2)
                      tickFormatter={(val) => val.toFixed(1)} 
                      stroke="#444" 
                      fontSize={10} 
                      fontWeight="bold" 
                      axisLine={false} 
                      tickLine={false} 
                      unit="m"
                    />
                    
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111', 
                        border: 'none', 
                        borderRadius: '15px',
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      labelStyle={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    
                    <Area 
                      type="monotone" 
                      dataKey="depth" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fill="url(#colorTide)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bagian Info yang lebih rapat */}
              <div className="mt-8 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-6 relative z-10">
                <div className="p-3 bg-primary/20 rounded-xl text-primary flex-shrink-0">
                  <Info size={20}/>
                </div>
                <p className="text-[11px] lg:text-xs text-gray-400 leading-relaxed text-justify font-medium italic">
                  This tidal curve represents the periodic oscillation used as a vertical correction. Data has been downsampled to a 1-hour interval for clarity, ensuring precise bathymetric depth corrections.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DataAnalytics;