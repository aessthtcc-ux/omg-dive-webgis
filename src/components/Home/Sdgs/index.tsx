"use client";

import React, { useRef, useState, useEffect } from "react";
import { Anchor, GraduationCap, Briefcase, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslationContext } from "@/context/TranslationContext"; // ← tambah

interface SDGItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  category: "Primary" | "Supporting";
  color: string;
  image: string;
}

const sdgData: SDGItem[] = [
  {
    id: 14,
    icon: Anchor,
    title: "SDG 14 – Life Below Water",
    description:
      "The core focus of this project is to support life below water by mapping underwater shipwreck sites. This contributes to marine heritage preservation and helps monitor the health of the seabed ecosystem in the Pramuka Island region using high-resolution multibeam data.",
    category: "Primary",
    color: "bg-[#0A97D9]",
    image: "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-14.jpg",
  },
  {
    id: 4,
    icon: GraduationCap,
    title: "SDG 4 – Quality Education",
    description:
      "Providing an open-access platform for students and researchers to learn about hydrography and marine archaeology. This project transforms raw survey data into interactive educational tools that foster a deeper understanding of Indonesia's maritime history.",
    category: "Supporting",
    color: "bg-[#C5192D]",
    image: "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-04.jpg",
  },
  {
    id: 8,
    icon: Briefcase,
    title: "SDG 8 – Decent Work & Economic Growth",
    description:
      "Enhancing local maritime tourism by identifying potential diving sites and historical attractions. This survey promotes sustainable economic growth for the local community of Pramuka Island through responsible underwater heritage tourism.",
    category: "Supporting",
    color: "bg-[#A21942]",
    image: "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-08.jpg",
  },
  {
    id: 11,
    icon: Building2,
    title: "SDG 11 – Sustainable Cities & Communities",
    description:
      "Safeguarding underwater cultural heritage to build a more resilient and culturally aware community. By documenting these hidden structures, we contribute to the sustainable development and cultural identity of coastal settlements.",
    category: "Supporting",
    color: "bg-[#FD9D24]",
    image: "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-11.jpg",
  },
];

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center mb-10 md:mb-12">
    <h2
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark dark:text-white max-w-2xl mx-auto"
      data-aos="fade-up" data-aos-duration="1000"
    >
      {title}
    </h2>
    <p
      className="mt-3 md:mt-4 text-sm md:text-base lg:text-lg text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto font-normal"
      data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000"
    >
      {description}
    </p>
  </div>
);

const Sdgs = () => {
  const { t } = useTranslationContext(); // ← tambah

  const scrollRef  = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex,    setActiveIndex]    = useState(0);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0, mostVisible = 0;
        entries.forEach(e => {
          const idx = cardRefs.current.indexOf(e.target as HTMLDivElement);
          if (idx !== -1 && e.intersectionRatio > maxRatio) {
            maxRatio = e.intersectionRatio;
            mostVisible = idx;
          }
        });
        if (maxRatio > 0) setActiveIndex(mostVisible);
      },
      { root: el, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    cardRefs.current.forEach(c => { if (c) observer.observe(c); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scrollByCard = (dir: "left" | "right") => {
    const target = dir === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(sdgData.length - 1, activeIndex + 1);
    cardRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const scrollToIndex = (i: number) =>
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });

  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-IcyBreeze dark:bg-darklight py-16 md:py-20 lg:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <SectionTitle
          title={t("Sustainable Development Goals Focus")}
          description={t("Our mission is deeply rooted in the United Nations' vision for a sustainable future, focusing on marine preservation and community growth.")}
        />

        <div className="relative" data-aos="fade-up" data-aos-duration="1000">

          {/* Nav: kiri */}
          <button
            onClick={() => scrollByCard("left")} disabled={!canScrollLeft}
            aria-label="Previous"
            className={[
              "absolute left-0 lg:-left-5 top-1/2 -translate-y-1/2 z-20",
              "w-9 h-9 md:w-11 md:h-11 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm shadow-lg",
              "flex items-center justify-center transition-all duration-300",
              canScrollLeft
                ? "opacity-100 hover:bg-primary hover:text-white hover:scale-110 cursor-pointer"
                : "opacity-20 cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronLeft size={20} className="text-dark dark:text-white" />
          </button>

          {/* Nav: kanan */}
          <button
            onClick={() => scrollByCard("right")} disabled={!canScrollRight}
            aria-label="Next"
            className={[
              "absolute right-0 lg:-right-5 top-1/2 -translate-y-1/2 z-20",
              "w-9 h-9 md:w-11 md:h-11 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm shadow-lg",
              "flex items-center justify-center transition-all duration-300",
              canScrollRight
                ? "opacity-100 hover:bg-primary hover:text-white hover:scale-110 cursor-pointer"
                : "opacity-20 cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronRight size={20} className="text-dark dark:text-white" />
          </button>

          {/* Carousel track */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-5 pb-4 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {sdgData.map((sdg, idx) => (
              <div
                key={sdg.id}
                ref={el => { cardRefs.current[idx] = el; }}
                className={[
                  "group relative flex-shrink-0 snap-center flex flex-col",
                  "w-[92vw] sm:w-[70vw] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]",
                  "p-5 md:p-6 rounded-2xl md:rounded-3xl",
                  "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10",
                  "shadow-md hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300",
                ].join(" ")}
              >
                {/* Top row: image + icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-md flex-shrink-0">
                    <img
                      src={sdg.image} alt={sdg.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className={`p-2.5 md:p-3 rounded-xl text-white ${sdg.color} shadow-md group-hover:rotate-6 transition-transform duration-300`}>
                    {React.createElement(sdg.icon, { size: 18 })}
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-2.5">
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    sdg.category === "Primary"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                  }`}>
                    {t(sdg.category)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm md:text-base lg:text-lg font-bold text-dark dark:text-white mb-2.5 group-hover:text-primary transition-colors leading-tight">
                  {sdg.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-SlateBlueText dark:text-opacity-80 leading-relaxed text-justify">
                  {t(sdg.description)}
                </p>

                {/* Watermark number */}
                <div className="absolute bottom-2 right-4 text-5xl md:text-6xl font-black text-dark dark:text-white opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-all duration-500 select-none">
                  {sdg.id}
                </div>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-5">
            {[0, 1].map(page => {
              const active = page === 0 ? activeIndex <= 1 : activeIndex >= 2;
              return (
                <button
                  key={page}
                  onClick={() => scrollToIndex(page === 0 ? 0 : 2)}
                  aria-label={`Page ${page + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active
                      ? "w-8 bg-primary"
                      : "w-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sdgs;