"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Youtube, ExternalLink, BookOpen, Anchor, MapPin, Mail, ArrowUpRight, Waves, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
const navLinks = [
  { label: "Home",       href: "/" },
  { label: "Historical", href: "/historical" },
  { label: "Data",       href: "/data" },
  { label: "2D Map",     href: "/map2d" },
  { label: "3D Map",     href: "/pointcloud" },
  { label: "Overview",   href: "/overview" },
  { label: "Document",   href: "/document" },
];

const references = [
  {
    id: "ref1",
    authors: "Dillenia, I., et al.",
    year: "2021",
    title: "Suitability assessment for underwater cultural heritage tourism at Pramuka Island, Kepulauan Seribu.",
    journal: "IOP Conference Series: Earth and Environmental Science",
    volume: "925(1)",
    article: "012028",
    href: "#",
  },
  {
    id: "ref2",
    authors: "Scubago.",
    year: "n.d.",
    title: "Poso Wreck & Tabularasa Wreck dive site profiles.",
    journal: "Scubago.com",
    volume: null,
    article: null,
    href: "https://www.scubago.com/id/explore/divesite/poso-wreck-79979",
  },
  {
    id: "ref3",
    authors: "Kemenparekraf.",
    year: "n.d.",
    title: "Desa Wisata Pulau Pramuka.",
    journal: "Jadesta — Kementerian Pariwisata dan Ekonomi Kreatif",
    volume: null,
    article: null,
    href: "https://jadesta.kemenpar.go.id/desa/pulau_pramuka",
  },
];

const stats = [
  { value: "2",    label: "Wreck Sites",       icon: <Anchor size={16} /> },
  { value: "80%",  label: "Coral Cover (Poso)", icon: <Waves size={16} /> },
  { value: "33m",  label: "Max Survey Depth",   icon: <MapPin size={16} /> },
  { value: "1970", label: "Oldest Wreck",        icon: <BookOpen size={16} /> },
];

// ---------------------------------------------------------------------------
// ANIMATED COUNTER
// ---------------------------------------------------------------------------
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 transition-all duration-300 group"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <span className="text-2xl font-black text-white tracking-tighter leading-none mb-1">{value}</span>
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">{label}</span>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// MAIN FOOTER
// ---------------------------------------------------------------------------
const Footer: FC = () => {
  const footerRef = useRef(null);
  const inView = useInView(footerRef, { once: true, margin: "-80px" });

  return (
    <footer ref={footerRef} className="relative bg-secondary border-t border-white/5 overflow-hidden">

      {/* ── Background decorative elements ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Radial glow top-left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        {/* Radial glow bottom-right */}
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-600/6 blur-[100px]" />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Large watermark text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[clamp(80px,15vw,180px)] font-black text-white/[0.02] tracking-tighter leading-none whitespace-nowrap select-none pointer-events-none">
          OMG-DIVE
        </div>
      </div>

      <div className="relative z-10 container">

        

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid lg:grid-cols-12 grid-cols-1 gap-10 py-14 border-b border-white/5">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-4 col-span-1 flex flex-col gap-6"
          >
            <Link href="/">
              <Image
                src="/images/footer/logo-white.svg"
                alt="OMG-DIVE Logo"
                width={150}
                height={42}
                quality={100}
                className="h-auto w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              A WebGIS StoryMap platform documenting underwater shipwreck heritage in Kepulauan Seribu through high-resolution multibeam sonar and geospatial data integration.
            </p>

            {/* Location tag */}
            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
              <MapPin size={13} className="text-primary flex-shrink-0" />
              <span>Pramuka Island, Kepulauan Seribu, DKI Jakarta</span>
            </div>

            {/* YouTube CTA */}
            <Link
              href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
              target="_blank"
              className="inline-flex items-center gap-3 self-start bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/25 hover:border-[#FF0000]/50 px-5 py-3 rounded-2xl transition-all duration-300 group"
            >
              <div className="bg-[#FF0000] p-1.5 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Youtube size={16} color="white" fill="white" />
              </div>
              <div>
                <p className="text-white text-xs font-black leading-none mb-0.5">Watch How We Build the WebGIS</p>
                <p className="text-white/40 text-[10px] font-medium">WebGIS Storymap Tutorial</p>
              </div>
              <ArrowUpRight size={14} className="text-white/30 group-hover:text-white/70 ml-auto transition-colors" />
            </Link>
          </motion.div>

          {/* Navigation Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 col-span-1"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Table of Contents</p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <ChevronRight size={12} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* References Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-6 col-span-1"
          >
            <div className="flex items-center gap-2 mb-6">
              <BookOpen size={14} className="text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">References</p>
            </div>

            <div className="flex flex-col gap-4">
              {references.map((ref, i) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                  className="group relative pl-4 border-l border-white/10 hover:border-primary/50 transition-colors duration-300 py-1"
                >
                  {/* Ref number dot */}
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-secondary border border-white/20 group-hover:border-primary group-hover:bg-primary transition-all duration-300" />

                  <p className="text-[11px] leading-relaxed text-white/40 italic">
                    <span className="not-italic font-bold text-white/60">{ref.authors}</span>{" "}
                    ({ref.year}).{" "}
                    {ref.title}{" "}
                    <span className="not-italic font-semibold text-white/50">{ref.journal}</span>
                    {ref.volume && <span className="not-italic">, {ref.volume}</span>}
                    {ref.article && <span className="not-italic">, {ref.article}</span>}
                    {ref.href !== "#" && (
                      <>
                        {". "}
                        <Link
                          href={ref.href}
                          target="_blank"
                          className="not-italic inline-flex items-center gap-1 text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
                        >
                          {ref.href.replace("https://", "").split("/")[0]}
                          <ExternalLink size={9} className="flex-shrink-0" />
                        </Link>
                      </>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Data disclaimer */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
              <p className="text-[10px] text-white/30 leading-relaxed">
                <span className="font-bold text-white/50">Data Notice:</span> Live marine conditions sourced from Open-Meteo API (open-meteo.com).
                Wildlife sighting counts reference from Scubago.com User Generated Content, used as supplementary reference with explicit attribution.
                Site assessment scores based on I. Dillenia et al. (2021).
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[11px] text-white/30 font-medium">
              © 2026 OMG-DIVE · All rights reserved
            </p>
          </div>

          <p className="text-[11px] text-white/20 font-medium text-center sm:text-right">
            Underwater Mapping & Geospatial Data Integration ·{" "}
            <span className="text-white/30">Marine Archaeological Survey</span>
          </p>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;