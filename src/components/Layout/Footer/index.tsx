"use client";

import React, { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Youtube, ExternalLink, BookOpen, Anchor,
  MapPin, ArrowUpRight, Waves, ChevronRight
} from "lucide-react";
import { useTranslationContext } from "@/context/TranslationContext";

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
  { label: "DiveDepeer", href: "/divedepeer" },
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
  { value: "2",    labelKey: "Wreck Sites",        icon: <Anchor size={16} /> },
  { value: "80%",  labelKey: "Coral Cover (Poso)", icon: <Waves size={16} /> },
  { value: "33m",  labelKey: "Max Survey Depth",   icon: <MapPin size={16} /> },
  { value: "1970", labelKey: "Oldest Wreck",        icon: <BookOpen size={16} /> },
];

// ---------------------------------------------------------------------------
// MAIN FOOTER
// ---------------------------------------------------------------------------
const Footer: FC = () => {
  const { t } = useTranslationContext();

  return (
    <footer className="relative bg-secondary border-t border-white/5 overflow-hidden">

      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-32 -left-32 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full bg-blue-600/6 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[clamp(60px,12vw,180px)] font-black text-white/[0.02] tracking-tighter leading-none whitespace-nowrap select-none pointer-events-none">
          OMG-DIVE
        </div>
      </div>

      <div className="relative z-10 container px-4 sm:px-6">

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 py-10 sm:py-14 border-b border-white/5">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-5 sm:gap-6">
            <Link href="/">
              <Image
                src="/images/footer/logo-white.svg"
                alt={t("OMG-DIVE Logo")}
                width={140}
                height={40}
                quality={100}
                className="h-auto w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t("Exploring underwater shipwreck sites through hydrographic survey, spatial analysis, and marine archaeology.")}
            </p>

            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
              <MapPin size={13} className="text-primary flex-shrink-0" />
              <span>{t("Pramuka Island, Kepulauan Seribu, DKI Jakarta")}</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-5 sm:mb-6">
              {t("Table of Contents")}
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-y-2.5 gap-x-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <ChevronRight
                      size={12}
                      className="text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0"
                    />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* References Column */}
          <div className="sm:col-span-2 lg:col-span-6">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <BookOpen size={14} className="text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{t("References")}</p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="group relative pl-4 border-l border-white/10 hover:border-primary/50 transition-colors duration-300 py-1"
                >
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-secondary border border-white/20 group-hover:border-primary group-hover:bg-primary transition-all duration-300" />
                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-white/40 italic">
                    <span className="not-italic font-bold text-white/60">{t(ref.authors)}</span>{" "}
                    ({ref.year}).{" "}
                    {t(ref.title)}{" "}
                    <span className="not-italic font-semibold text-white/50">{ref.journal}</span>
                    {ref.volume  && <span className="not-italic">, {ref.volume}</span>}
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
                </div>
              ))}
            </div>

            {/* Data disclaimer */}
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/8">
              <p className="text-[9px] sm:text-[10px] text-white/30 leading-relaxed">
                <span className="font-bold text-white/50">{t("Data Notice:")}</span>{" "}
                {t("Live marine conditions sourced from Open-Meteo API (open-meteo.com). Wildlife sighting counts reference from Scubago.com User Generated Content, used as supplementary reference with explicit attribution. Site assessment scores based on I. Dillenia et al. (2021).")}
              </p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[11px] text-white/30 font-medium">
              © 2026 OMG-DIVE · {t("All rights reserved")}
            </p>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/20 font-medium text-center sm:text-right">
            {t("Underwater Mapping & Geospatial Data Integration")} ·{" "}
            <span className="text-white/30">{t("Marine Archaeological Survey")}</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;