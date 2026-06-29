"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, Calendar, Info, BarChart3, 
  Thermometer, ArrowDown, FileCode
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useTranslationContext } from "@/context/TranslationContext";

// ✅ PERF: konstanta di luar komponen — tidak pernah dihitung ulang
const SURVEY_DATES = ["21", "22", "23", "24", "25", "26"];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ✅ PERF: generate ticks SEKALI saat modul load, bukan tiap render
const ALL_TICKS: string[] = (() => {
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
})();

// ✅ PERF: pre-compute ticks per mode juga di luar komponen
const TICKS_DESKTOP = ALL_TICKS.filter(t => t.includes('00:00'));
const TICKS_MOBILE  = TICKS_DESKTOP.filter(t => {
  const day = parseInt(t.split('-')[0]);
  return day % 2 === 1;
});

// ✅ PERF: format function di luar komponen
const formatTick = (val: string, mobile: boolean) => {
  const parts = val.split(' ')[0].split('-');
  const d = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  return mobile ? `${d}/${m}` : `${d} ${MONTHS[m-1]}`;
};

// ✅ PERF: memo-ize komponen berat agar tidak re-render tanpa alasan
const SVPChart = memo(({ svpData, svpTimeRange }: {
  svpData: any[];
  svpTimeRange: { start: string; end: string };
}) => (
  <>
    <div className="h-[240px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="110%">
        <LineChart data={svpData} layout="vertical" margin={{ top: 40, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal vertical strokeOpacity={0.05} />
          <XAxis
            type="number" dataKey="sv" orientation="top"
            domain={[1540, 1544]} ticks={[1540, 1541, 1542, 1543, 1544]}
            stroke="#64748b" fontSize={9} fontWeight="bold"
            tickFormatter={v => v.toFixed(0)}
            label={{ value: 'SOUND VELOCITY (m/s)', position: 'top', offset: 20, fontSize: 9, fontWeight: '900' }}
          />
          <YAxis
            type="number" dataKey="depth" domain={[0, 36]} ticks={[0, 6, 12, 18, 24, 30, 36]}
            stroke="#64748b" fontSize={9} fontWeight="bold" unit=" m" width={45}
            label={{ value: 'DEPTH (m)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 9, fontWeight: '900' }}
          />
          <Tooltip
            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
            labelFormatter={v => `Depth: ${v} m`}
          />
          <Line
            type="linear" dataKey="sv" stroke="#3b82f6" strokeWidth={2.5} dot={false}
            activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false} // ✅ PERF: matikan animasi chart = lebih ringan
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-8 md:mt-12 flex justify-center">
      <div className="inline-flex items-center gap-2 px-3 md:px-5 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        <Calendar size={13} className="text-primary flex-shrink-0" />
        <span className="truncate">
          Time: <strong className="text-gray-900 dark:text-white">{svpTimeRange.start}</strong> – <strong className="text-gray-900 dark:text-white">{svpTimeRange.end}</strong>
        </span>
      </div>
    </div>
  </>
));
SVPChart.displayName = 'SVPChart';

// ✅ PERF: memo TideChart juga
const TideChart = memo(({ tideData, isMobile }: { tideData: any[]; isMobile: boolean }) => {
  const ticks = isMobile ? TICKS_MOBILE : TICKS_DESKTOP;

  return (
    <>
      <div className="h-[240px] md:h-[340px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tideData} margin={{ top: 20, right: 10, left: 5, bottom: 32 }}>
            <defs>
              <linearGradient id="colorTide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
            <XAxis
              dataKey="displayTime"
              ticks={ticks}
              padding={{ left: 12, right: 10 }}
              axisLine={false}
              tickLine={{ stroke: '#3b82f620', strokeWidth: 1 }}
              interval={0}
              height={32}
              tick={({ x, y, payload }: any) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={13}
                    textAnchor="middle" fill="#666"
                    fontSize={isMobile ? 8 : 9}
                    fontWeight="600"
                    fontFamily="ui-monospace, monospace"
                  >
                    {formatTick(payload.value, isMobile)}
                  </text>
                </g>
              )}
            />
            <YAxis
              domain={[-1, 1]} ticks={[-1, -0.5, -0.25, 0, 0.25, 0.5, 1]}
              tickFormatter={v => v.toFixed(1)}
              stroke="#444" fontSize={9} fontWeight="bold"
              axisLine={false} tickLine={false} unit="m" width={36} tick={{ fill: '#888' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '11px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
              labelStyle={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: '#fff' }}
              labelFormatter={(val: any) => {
                const [datePart, timePart] = String(val).split(' ');
                const [d, m] = datePart.split('-');
                return `${parseInt(d)} ${MONTHS[parseInt(m)-1]} 2025  ${timePart}`;
              }}
            />
            <Area
              type="monotone" dataKey="depth" stroke="#3b82f6" strokeWidth={2}
              fill="url(#colorTide)"
              isAnimationActive={false} // ✅ PERF: matikan animasi
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500/50 border border-blue-400/50" />
          <span className="text-[9px] text-gray-500 font-mono">Tidal Variation (m)</span>
        </div>
        <span className="text-[9px] text-gray-600 font-mono italic">19 – 27 Sep 2025</span>
      </div>
    </>
  );
});
TideChart.displayName = 'TideChart';

// ── MAIN COMPONENT ────────────────────────────────────────
const DataAnalytics = () => {
  const { t } = useTranslationContext(); 
  const [activeTab,     setActiveTab]     = useState("svp");
  const [selectedDay,   setSelectedDay]   = useState("21");
  const [svpData,       setSvpData]       = useState<any[]>([]);
  const [svpTimeRange,  setSvpTimeRange]  = useState({ start: "-", end: "-" });
  const [tideData,      setTideData]      = useState<any[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);

  // ✅ PERF: debounce resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    let timer: ReturnType<typeof setTimeout>;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(check, 150); };
    window.addEventListener('resize', debounced);
    return () => { window.removeEventListener('resize', debounced); clearTimeout(timer); };
  }, []);

  // ✅ PERF: fetch SVP dengan AbortController agar tidak ada memory leak
  useEffect(() => {
    if (activeTab !== "svp") return;
    const controller = new AbortController();
    setLoading(true);

    fetch(`/data/SVP_${selectedDay}092025.txt`, { signal: controller.signal })
      .then(r => r.text())
      .then(text => {
        const validData = text.trim().split("\n")
          .map(line => {
            const c = line.split(",").map(s => s.trim());
            return { sv: parseFloat(c[2]), depth: parseFloat(c[3]), time: c[1] };
          })
          .filter(i => !isNaN(i.sv) && !isNaN(i.depth));

        setSvpTimeRange(validData.length > 0
          ? { start: validData[0].time, end: validData[validData.length-1].time }
          : { start: "-", end: "-" }
        );
        // ✅ PERF: downsample data jika terlalu banyak (max 200 titik cukup untuk chart)
        const sorted = [...validData].sort((a, b) => a.depth - b.depth);
        const step = Math.max(1, Math.floor(sorted.length / 200));
        setSvpData(sorted.filter((_, i) => i % step === 0));
      })
      .catch(err => { if (err.name !== 'AbortError') console.error("SVP:", err); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedDay, activeTab]);

  // ✅ PERF: fetch tides sekali saja, AbortController
  useEffect(() => {
    const controller = new AbortController();

    fetch('/data/CORRECTED_TIDES.csv', { signal: controller.signal })
      .then(r => r.text())
      .then(text => {
        const data = text.trim().split("\n").slice(1)
          .map(line => {
            // ✅ separator sekarang KOMA, bukan titik koma
            const p = line.split(",").map(s => s.trim());
            // p[0]=year(25), p[1]=month, p[2]=date, p[3]=hour, p[4]=minute, p[5]=second, p[6]=depth
            const yr = p[0];
            return {
              year:   yr.length === 2 ? `20${yr}` : yr, // ✅ 25 → 2025
              month:  p[1],
              date:   p[2],
              hour:   p[3],
              minute: p[4],
              depth:  parseFloat(p[6]),
            };
          })
          .filter(d => !isNaN(d.depth))
          // ✅ PERF: data sekarang per-menit (jauh lebih padat).
          // Ambil hanya pada menit 0 dan tiap 2 jam — kurangi titik data drastis
          .filter(d => d.minute === "0" && parseInt(d.hour) % 2 === 0)
          .map(d => ({
            displayTime: `${d.date.padStart(2,'0')}-${d.month.padStart(2,'0')}-${d.year} ${d.hour.padStart(2,'0')}:00`,
            depth: d.depth,
          }));
        setTideData(data);
      })
      .catch(err => { if (err.name !== 'AbortError') console.error("Tides:", err); });

    return () => controller.abort();
  }, []);

  // ✅ PERF: slideUp tidak buat object baru setiap render
  const slideUp = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }), []);

  return (
    <section className="relative overflow-hidden bg-IcyBreeze dark:bg-darklight pt-24 md:pt-32 pb-16 md:pb-20">
      <div className="container px-4 md:px-6 mx-auto space-y-8 md:space-y-12">

        {/* Header */}
        <motion.div {...slideUp} className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
            {t("Survey")} <span className="text-primary">{t("Analytics")}</span>
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
            {t("Oceanographic datasets acquired between Sept 21 – 26, 2025.")}
          </p>
          <div className="w-16 md:w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-gray-900/5 dark:bg-white/5 rounded-[2rem] border border-gray-200 dark:border-white/10 w-full md:w-auto">
            {[
              { id: "svp",   icon: <Thermometer size={14}/>, label: t("SVP Profile") },
              { id: "tides", icon: <Waves size={14}/>,       label: t("Tides")       },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 md:px-8 py-3 md:py-4 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ PERF: ganti AnimatePresence + motion dengan conditional render biasa
            AnimatePresence berat karena keep komponen di DOM saat exit */}
        {activeTab === "svp" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">

            {/* Date selector */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <div className="p-6 md:p-8 rounded-[2.5rem] bg-gray-900 border border-white/5 shadow-2xl">
                <h3 className="text-white font-black mb-4 flex items-center gap-3 uppercase tracking-tighter text-sm md:text-base">
                  <Calendar className="text-primary" size={18} /> {t("Select Date")}
                </h3>
                <div className="grid grid-cols-6 md:grid-cols-3 gap-2">
                  {SURVEY_DATES.map(day => (
                    <button key={day} onClick={() => setSelectedDay(day)}
                      className={`py-3 md:py-4 rounded-xl md:rounded-2xl border transition-colors ${
                        selectedDay === day ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30"
                      }`}>
                      <span className="block text-[7px] font-black opacity-40 uppercase">Sept</span>
                      <span className="text-base md:text-xl font-black leading-none">{day}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 md:p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-primary">
                  <Info size={13}/> {t("Interpretation")}
                </h4>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
                  {t("The SVP graph illustrates how acoustic velocity changes with depth. Each day's profile ensures vertical accuracy for multibeam data.")}
                </p>
              </div>
            </div>

            {/* SVP Graph */}
            <div className="lg:col-span-8 p-5 md:p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-sm relative">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-5 md:mb-8">
                <h4 className="text-base md:text-xl font-black flex items-center gap-2">
                  <BarChart3 className="text-primary" size={18} /> {t("Sound Velocity Profile")}
                </h4>
                <div className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ArrowDown size={10}/> {t("Depth Inverted")}
                </div>
              </div>

              {loading ? (
                <div className="h-[240px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <SVPChart svpData={svpData} svpTimeRange={svpTimeRange} />
              )}
            </div>
          </div>

        ) : (
          /* TIDES TAB */
          <div className="p-5 md:p-8 lg:p-10 rounded-[2.5rem] bg-gray-900 text-white border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 md:mb-8 gap-3">
              <h3 className="text-xl md:text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
                <Waves className="text-primary" size={22} /> {t("Tidal Observation")}
              </h3>
            </div>

            <TideChart tideData={tideData} isMobile={isMobile} />

            <div className="mt-5 p-4 md:p-5 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary flex-shrink-0">
                <Info size={14} />
              </div>
              <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed italic">
                {t("Tidal curve used as vertical correction reference. Downsampled to 2-hour intervals for display performance. Precise correction applies full-resolution data.")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DataAnalytics;