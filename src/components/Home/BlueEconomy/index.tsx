"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { TrendingUp, Users, DollarSign, PieChart, Info } from "lucide-react";

const BlueEconomy = () => {
  // State untuk Key Assumptions (Sliding Bar)
  const [visitors, setVisitors] = useState(1200);
  const [growth, setGrowth] = useState(18);
  const [spending, setSpending] = useState(150);
  const [margin, setMargin] = useState(35);

  // Kalkulasi Data 5 Tahun secara Dinamis
  const projectionData = useMemo(() => {
    let currentVisitors = visitors;
    return Array.from({ length: 5 }, (_, i) => {
      const year = i + 1;
      const netIncome = Math.round(currentVisitors * spending * (margin / 100));
      const data = {
        year: `Year ${year}`,
        tourists: Math.round(currentVisitors),
        income: netIncome,
      };
      currentVisitors *= (1 + growth / 100);
      return data;
    });
  }, [visitors, growth, spending, margin]);

  return (
    <section className="bg-white dark:bg-darkmode py-24 lg:py-32 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Title Section */}
        <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-dark dark:text-white">
          Blue Economy Growth Projection
        </h2>
        <p className="mt-4 text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto text-lg">
          Interactive 5-year financial forecast based on shipwreck visualization impact.
        </p>
      </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mt-16">
          
          {/* LEFT: Key Assumptions (Sliding Bars) */}
          <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-4 h-full"
        >
          <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl h-full flex flex-col">
            <h3 className="flex items-center gap-2 text-xl font-bold text-dark dark:text-white mb-8"> 
              <Info size={20} className="text-primary" /> Key Assumptions
            </h3>
            
            <div className="space-y-10">
              <CustomSlider 
                label="Initial Visitors" 
                value={visitors} 
                min={500} max={5000} step={100}
                unit="" icon={<Users size={16}/>}
                onChange={(val: number) => setVisitors(val)} 
              />
              <CustomSlider 
                label="Annual Growth Rate" 
                value={growth} 
                min={5} max={50} step={1}
                unit="%" icon={<TrendingUp size={16}/>}
                onChange={(val: number) => setGrowth(val)} 
              />
              <CustomSlider 
                label="Avg. Spending" 
                value={spending} 
                min={50} max={500} step={10}
                unit="$" icon={<DollarSign size={16}/>}
                onChange={(val: number) => setSpending(val)} 
              />
              <CustomSlider 
                label="Net Income Margin" 
                value={margin} 
                min={10} max={60} step={1}
                unit="%" icon={<PieChart size={16}/>}
                onChange={(val: number) => setMargin(val)} 
              />
            </div>
          </div>
        </motion.div>

          {/* RIGHT: Dynamic Chart */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              layout
              // Efek Slide Up saat scroll
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }}
              // Animasi hanya jalan sekali & trigger saat elemen 10% terlihat
              viewport={{ once: false}} 
              transition={{ 
                duration: 0.8, 
                delay: 0.4, // Sedikit lebih lambat dari judul & slider agar sekuensial
                ease: [0.21, 0.47, 0.32, 0.98] // Custom cubic-bezier untuk kesan 'smooth' Gen Z
              }}
              className="p-6 lg:p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 shadow-2xl h-full min-h-[550px] relative overflow-hidden flex flex-col"
            >
              {/* Chart Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-dark dark:text-white">Net Income Projection</h3>
                  <p className="text-primary font-medium">Estimated Revenue (USD)</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-SlateBlueText uppercase tracking-widest font-bold">Year 5 Target</span>
                  <div className="text-3xl font-black text-primary">
                    ${projectionData[4].income.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Responsive Chart */}
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    // interval={0} memaksa Year 1 sampai Year 5 muncul semua tanpa dilewati
                    interval={0} 
                    // padding memberikan ruang agar label di ujung tidak mepet ke garis border
                    padding={{ left: 20, right: 20 }}
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                    dy={10} 
                  />
                  <YAxis 
                    hide 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 2 }} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- SUB-COMPONENTS ---

const CustomSlider = ({ label, value, min, max, step, unit, onChange, icon }: any) => (
  <div className="group">
    <div className="flex justify-between mb-4">
      <label className="text-sm font-bold text-dark dark:text-white flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</span>
        {label}
      </label>
      <span className="text-primary font-black">{unit === '$' ? `$${value}` : `${value}${unit}`}</span>
    </div>
    <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        // BAGIAN PENTING:
        // onChange di sini adalah milik HTML input, 
        // kita panggil onChange milik PROPS dengan membawa nilai baru
        onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
    />
  </div>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-darklight p-4 rounded-2xl shadow-2xl border border-primary/20 backdrop-blur-md">
        <p className="font-bold text-dark dark:text-white mb-2">{payload[0].payload.year}</p>
        <div className="space-y-1">
          <p className="text-sm text-primary flex justify-between gap-4">
            <span>Income:</span> <strong>${payload[0].value.toLocaleString()}</strong>
          </p>
          <p className="text-sm text-SlateBlueText dark:text-gray-400 flex justify-between gap-4">
            <span>Visitors:</span> <strong>{payload[0].payload.tourists}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default BlueEconomy;