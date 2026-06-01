"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, Calendar, Info, BarChart3, 
  Thermometer, ArrowDown, FileCode
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const DataAnalytics = () => {
  const [activeTab, setActiveTab] = useState("svp");
  const surveyDates = ["21", "22", "23", "24", "25", "26"];
  const [selectedDay, setSelectedDay] = useState("21");
  const [svpData, setSvpData] = useState<any[]>([]);
  const [svpTimeRange, setSvpTimeRange] = useState({ start: "-", end: "-" });
  const [tideData, setTideData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Detect screen width untuk interval tick responsif
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Generate semua tick per hari
  const generateAllTicks = useCallback(() => {
    const ticks: string[] = [];
    let t = new Date(2025, 8, 19, 13, 0).getTime();
    const end = new Date(2025, 8, 27, 5, 0).getTime();
    while (t <= end) {
      const d = new Date(t);
      ticks.push(
        `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:00`
      );
      t += 24 * 60 * 60 * 1000;
    }
    return ticks;
  }, []);

  const allTicks = generateAllTicks();

  // ✅ Mobile: tiap 2 hari, Desktop: tiap hari — keduanya hanya jam 00:00
  const visibleTicks = allTicks.filter(tick => {
    const hour = parseInt(tick.split(' ')[1]);
    const day  = parseInt(tick.split('-')[0]);
    if (hour !== 0) return false;
    return isMobile ? day % 2 === 1 : true;
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const formatTick = (val: string) => {
    const parts = val.split(' ')[0].split('-');
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    return isMobile ? `${d}/${m}` : `${d} ${months[m-1]}`;
  };

  useEffect(() => {
    const fetchSVP = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/SVP_${selectedDay}092025.txt`);
        const text = await response.text();
        const validData = text.trim().split("\n").map(line => {
          const c = line.split(",").map(s => s.trim());
          return { sv: parseFloat(c[2]), depth: parseFloat(c[3]), time: c[1] };
        }).filter(i => !isNaN(i.sv) && !isNaN(i.depth));

        setSvpTimeRange(validData.length > 0
          ? { start: validData[0].time, end: validData[validData.length-1].time }
          : { start: "-", end: "-" }
        );
        setSvpData([...validData].sort((a,b) => a.depth - b.depth));
      } catch (err) {
        console.error("SVP Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "svp") fetchSVP();
  }, [selectedDay, activeTab]);

  useEffect(() => {
    const fetchTides = async () => {
      try {
        const response = await fetch(`/data/CORRECTED_TIDES.csv`);
        const text = await response.text();
        const hourlyData = text.trim().split("\n").slice(1)
          .map(line => {
            const p = line.split(";").map(s => s.trim());
            return { year: p[0], month: p[1], date: p[2], hour: p[3], minute: p[4], depth: parseFloat(p[6]) };
          })
          .filter(d => d.minute === "0" || d.minute === "00")
          .map(d => ({
            displayTime: `${d.date.padStart(2,'0')}-${d.month.padStart(2,'0')}-${d.year} ${d.hour.padStart(2,'0')}:00`,
            depth: d.depth,
          }));
        setTideData(hourlyData);
      } catch (err) {
        console.error("Tides Error:", err);
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
    <section className="relative overflow-hidden transition-colors duration-300 bg-IcyBreeze dark:bg-darklight pt-24 md:pt-32 pb-16 md:pb-20">
      <div className="container px-4 md:px-6 mx-auto space-y-8 md:space-y-12">
        
        <motion.div {...slideUp} className="text-center space-y-3 md:space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
            Survey <span className="text-primary">Analytics</span>
          </h2>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
            Oceanographic datasets acquired between Sept 21 – 26, 2025.
          </p>
          <div className="w-16 md:w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 md:p-2 bg-gray-900/5 dark:bg-white/5 rounded-[2rem] md:rounded-[2.5rem] border border-gray-200 dark:border-white/10 w-full max-w-xs md:w-auto">
            <button onClick={() => setActiveTab("svp")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "svp" ? "bg-primary text-white shadow-xl" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <Thermometer size={14}/> SVP Profile
            </button>
            <button onClick={() => setActiveTab("tides")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "tides" ? "bg-primary text-white shadow-xl" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <Waves size={14}/> Tides
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ============ SVP TAB ============ */}
          {activeTab === "svp" ? (
            <motion.div key="svp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">

              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                <div className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] bg-gray-900 border border-white/5 shadow-2xl">
                  <h3 className="text-white font-black mb-4 md:mb-6 flex items-center gap-3 uppercase tracking-tighter text-sm md:text-base">
                    <Calendar className="text-primary" size={18} /> Select Date
                  </h3>
                  <div className="grid grid-cols-6 md:grid-cols-3 gap-2 md:gap-3">
                    {surveyDates.map(day => (
                      <button key={day} onClick={() => setSelectedDay(day)}
                        className={`py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-300 ${
                          selectedDay === day ? "bg-primary border-primary text-white scale-105 shadow-lg" : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30"
                        }`}>
                        <span className="block text-[7px] md:text-[8px] font-black opacity-40 uppercase">Sept</span>
                        <span className="text-base md:text-xl font-black leading-none">{day}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 md:mt-8 flex items-center p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-dashed border-white/10">
                    <div className="flex items-center gap-2 text-primary overflow-hidden">
                      <FileCode size={16} className="flex-shrink-0" />
                      <span className="text-[10px] md:text-[12px] font-mono font-bold uppercase tracking-tight truncate">SVP_{selectedDay}092025.txt</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-primary">
                    <Info size={13}/> Interpretation
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 text-justify font-medium">
                    The SVP graph illustrates how acoustic velocity changes with depth. Each day's profile ensures vertical accuracy for multibeam data.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-sm min-h-[400px] md:min-h-[500px] relative">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-6 md:mb-10">
                  <h4 className="text-base md:text-xl font-black flex items-center gap-2 md:gap-3">
                    <BarChart3 className="text-primary" size={20} /> Sound Velocity Profile
                  </h4>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-white/5 rounded-full text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowDown size={10}/> Depth (m) Inverted
                  </div>
                </div>
                <div className="h-[260px] md:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="110%">
                    <LineChart data={svpData} layout="vertical" margin={{ top: 40, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical strokeOpacity={0.05} />
                      <XAxis type="number" dataKey="sv" orientation="top" domain={[1540,1544]} ticks={[1540,1541,1542,1543,1544]}
                        stroke="#64748b" fontSize={9} fontWeight="bold" tickFormatter={v => v.toFixed(0)}
                        label={{ value: 'SOUND VELOCITY (m/s)', position: 'top', offset: 20, fontSize: 9, fontWeight: '900' }} />
                      <YAxis type="number" dataKey="depth" domain={[0,36]} ticks={[0,6,12,18,24,30,36]}
                        stroke="#64748b" fontSize={9} fontWeight="bold" unit=" m" width={45}
                        label={{ value: 'DEPTH (m)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 9, fontWeight: '900' }} />
                      <Tooltip cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                        labelFormatter={v => `Depth: ${v} m`} />
                      <Line type="linear" dataKey="sv" stroke="#3b82f6" strokeWidth={3} dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-10 md:mt-14 flex justify-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium shadow-sm">
                    <Calendar size={13} className="text-primary flex-shrink-0" />
                    <span className="truncate">
                      Time: <strong className="text-gray-900 dark:text-white">{svpTimeRange.start}</strong> – <strong className="text-gray-900 dark:text-white">{svpTimeRange.end}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          ) : (
            /* ============ TIDES TAB ============ */
            <motion.div key="tides" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="p-6 md:p-8 lg:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-gray-900 text-white border border-white/5 shadow-2xl relative overflow-hidden">

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
                  <Waves className="text-primary" size={24} /> Tidal Observation
                </h3>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl">
                  <code className="text-[10px] text-primary font-mono tracking-wider">TIDES.csv</code>
                </div>
              </div>

              {/* ✅ CHART dengan X axis responsif */}
              <div className="h-[260px] md:h-[360px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tideData} margin={{ top: 20, right: 10, left: 5, bottom: 36 }}>
                    <defs>
                      <linearGradient id="colorTide" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />

                    {/* ✅ X Axis responsif: mobile tiap 2 hari, desktop tiap hari */}
                    <XAxis
                      dataKey="displayTime"
                      ticks={visibleTicks}
                      padding={{ left: 12, right: 10 }}
                      axisLine={false}
                      tickLine={{ stroke: '#3b82f620', strokeWidth: 1 }}
                      interval={0}
                      height={36}
                      tick={({ x, y, payload }: any) => (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={14}
                            textAnchor="middle"
                            fill="#666"
                            fontSize={isMobile ? 8 : 9}
                            fontWeight="600"
                            fontFamily="ui-monospace, monospace"
                          >
                            {formatTick(payload.value)}
                          </text>
                        </g>
                      )}
                    />

                    <YAxis domain={[1.6, 2.6]} ticks={[1.6, 1.8, 2.0, 2.2, 2.4, 2.6]}
                      tickFormatter={v => v.toFixed(1)} stroke="#444" fontSize={9} fontWeight="bold"
                      axisLine={false} tickLine={false} unit="m" width={36} tick={{ fill: '#888' }} />

                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                      labelStyle={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#fff' }}
                      labelFormatter={(val: any) => {
                        const str = String(val);
                        const [datePart, timePart] = str.split(' ');
                        const [d, m] = datePart.split('-');
                        return `${parseInt(d)} ${months[parseInt(m)-1]} 2025  ${timePart}`;
                      }}
                    />

                    <Area type="monotone" dataKey="depth" stroke="#3b82f6" strokeWidth={2.5}
                      fill="url(#colorTide)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ✅ Legend bawah chart */}
              <div className="flex items-center justify-between mt-2 px-1 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500/50 border border-blue-400/50" />
                  <span className="text-[9px] text-gray-500 font-mono">Tidal Height (m)</span>
                </div>
                <span className="text-[9px] text-gray-600 font-mono italic">19 – 27 Sep 2025 · Pramuka Island</span>
              </div>

              <div className="mt-5 md:mt-8 p-4 md:p-6 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 flex items-start md:items-center gap-4 relative z-10">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary flex-shrink-0">
                  <Info size={16} />
                </div>
                <p className="text-[10px] md:text-[11px] lg:text-xs text-gray-400 leading-relaxed font-medium italic">
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