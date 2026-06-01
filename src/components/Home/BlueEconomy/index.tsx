"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, DollarSign, PieChart, Info } from "lucide-react";

const BlueEconomy = () => {
  const [visitors, setVisitors] = useState(1200);
  const [growth, setGrowth] = useState(18);
  const [spending, setSpending] = useState(150);
  const [margin, setMargin] = useState(35);

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

  const slideUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { duration: 0.7, ease: "easeOut" },
  };

  return (
    <section className="bg-white dark:bg-darkmode py-16 sm:py-24 lg:py-32 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ── TITLE ───────────────────────────────────────── */}
        {/* @ts-ignore */}
        <motion.div {...slideUp} className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark dark:text-white">
            Blue Economy Growth Projection
          </h2>
          <p className="mt-3 sm:mt-4 text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto text-base sm:text-lg">
            Interactive 5-year financial forecast based on shipwreck visualization impact.
          </p>
        </motion.div>

        {/*
          Layout:
            mobile  → stacked (sliders on top, chart below)
            lg      → side by side (4 + 8 cols)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-stretch">

          {/* ── LEFT: Key Assumptions ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-4"
          >
            <div className="p-6 sm:p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl h-full flex flex-col">
              <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-dark dark:text-white mb-6 sm:mb-8">
                <Info size={20} className="text-primary shrink-0" /> Key Assumptions
              </h3>

              {/*
                Mobile: 2×2 grid so all 4 sliders visible without massive scroll
                sm+  : single column (full width sliders are easier to drag)
              */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8 lg:gap-10 flex-1">
                <CustomSlider
                  label="Initial Visitors"
                  value={visitors}
                  min={500} max={5000} step={100}
                  unit="" icon={<Users size={16} />}
                  onChange={(val: number) => setVisitors(val)}
                />
                <CustomSlider
                  label="Annual Growth"
                  value={growth}
                  min={5} max={50} step={1}
                  unit="%" icon={<TrendingUp size={16} />}
                  onChange={(val: number) => setGrowth(val)}
                />
                <CustomSlider
                  label="Avg. Spending"
                  value={spending}
                  min={50} max={500} step={10}
                  unit="$" icon={<DollarSign size={16} />}
                  onChange={(val: number) => setSpending(val)}
                />
                <CustomSlider
                  label="Income Margin"
                  value={margin}
                  min={10} max={60} step={1}
                  unit="%" icon={<PieChart size={16} />}
                  onChange={(val: number) => setMargin(val)}
                />
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Chart ────────────────────────────── */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-8"
          >
            <div className="p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 shadow-2xl flex flex-col h-full">

              {/* Chart header */}
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-dark dark:text-white leading-tight">
                    Net Income Projection
                  </h3>
                  <p className="text-primary font-medium text-sm sm:text-base">Estimated Revenue (USD)</p>
                </div>
                <div className="text-left xs:text-right shrink-0">
                  <span className="text-[10px] sm:text-sm text-SlateBlueText uppercase tracking-widest font-bold">
                    Year 5 Target
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-primary">
                    ${projectionData[4].income.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Chart — fixed height so it never collapses on mobile */}
              <div className="flex-1 min-h-[240px] sm:min-h-[320px] lg:min-h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      padding={{ left: 16, right: 16 }}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary pills — quick stats below chart */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-white/10">
                {projectionData.map((d) => (
                  <div key={d.year} className="text-center p-2 sm:p-3 rounded-xl bg-primary/5 dark:bg-primary/10">
                    <p className="text-[9px] sm:text-[10px] text-SlateBlueText dark:text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                      {d.year}
                    </p>
                    <p className="text-[11px] sm:text-xs font-black text-primary">
                      ${d.income.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ── SUB-COMPONENTS ───────────────────────────────────────

const CustomSlider = ({ label, value, min, max, step, unit, onChange, icon }: any) => (
  <div className="group">
    <div className="flex justify-between items-center mb-2 sm:mb-3">
      <label className="text-xs sm:text-sm font-bold text-dark dark:text-white flex items-center gap-1.5 sm:gap-2">
        <span className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </span>
        {label}
      </label>
      <span className="text-primary font-black text-xs sm:text-sm shrink-0 ml-2">
        {unit === '$' ? `$${value}` : `${value}${unit}`}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
    />
  </div>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-darklight p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-primary/20 backdrop-blur-md">
        <p className="font-bold text-dark dark:text-white mb-1.5 sm:mb-2 text-sm">
          {payload[0].payload.year}
        </p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-primary flex justify-between gap-4">
            <span>Income:</span>
            <strong>${payload[0].value.toLocaleString()}</strong>
          </p>
          <p className="text-xs sm:text-sm text-SlateBlueText dark:text-gray-400 flex justify-between gap-4">
            <span>Visitors:</span>
            <strong>{payload[0].payload.tourists.toLocaleString()}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default BlueEconomy;