"use client";

import React, { useRef, useState, useEffect } from "react";
import { Anchor, GraduationCap, Briefcase, Building2, ChevronLeft, ChevronRight } from "lucide-react";

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
      "Safeguarding underwater cultural heritage to build a more resilient and culturally aware community. By documenting these 'hidden' structures, we contribute to the sustainable development and cultural identity of coastal settlements.",
    category: "Supporting",
    color: "bg-[#FD9D24]",
    image: "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-11.jpg",
  },
];

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center mb-12">
    <h2
      className="text-3xl lg:text-4xl font-bold text-dark dark:text-white max-w-2xl mx-auto"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      {title}
    </h2>
    <p
      className="mt-4 text-lg text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto font-normal"
      data-aos="fade-up"
      data-aos-delay="200"
      data-aos-duration="1000"
    >
      {description}
    </p>
  </div>
);

const Sdgs = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // IntersectionObserver — deteksi card paling terlihat secara real-time
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisibleIndex = 0;
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1 && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleIndex = index;
          }
        });
        if (maxRatio > 0) setActiveIndex(mostVisibleIndex);
      },
      { root: el, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    cardRefs.current.forEach((card) => { if (card) observer.observe(card); });
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

  const scrollByCard = (direction: "left" | "right") => {
    const targetIndex = direction === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(sdgData.length - 1, activeIndex + 1);
    cardRefs.current[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-IcyBreeze dark:bg-darklight py-20 lg:py-24">
      <div className="container px-6 mx-auto">
        <SectionTitle
          title="Sustainable Development Goals Focus"
          description="Our mission is deeply rooted in the United Nations' vision for a sustainable future, focusing on marine preservation and community growth."
        />

        <div className="relative" data-aos="fade-up" data-aos-duration="1000">
          {/* Tombol Kiri */}
          <button
            onClick={() => scrollByCard("left")}
            disabled={!canScrollLeft}
            aria-label="Previous SDG"
            className={[
              "absolute left-0 lg:-left-5 top-1/2 -translate-y-1/2 z-20",
              "w-11 h-11 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm shadow-lg",
              "flex items-center justify-center transition-all duration-300",
              canScrollLeft
                ? "opacity-100 hover:bg-primary hover:text-white hover:scale-110 cursor-pointer"
                : "opacity-30 cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronLeft size={22} className="text-dark dark:text-white" />
          </button>

          {/* Tombol Kanan */}
          <button
            onClick={() => scrollByCard("right")}
            disabled={!canScrollRight}
            aria-label="Next SDG"
            className={[
              "absolute right-0 lg:-right-5 top-1/2 -translate-y-1/2 z-20",
              "w-11 h-11 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm shadow-lg",
              "flex items-center justify-center transition-all duration-300",
              canScrollRight
                ? "opacity-100 hover:bg-primary hover:text-white hover:scale-110 cursor-pointer"
                : "opacity-30 cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronRight size={22} className="text-dark dark:text-white" />
          </button>

          {/* Track Carousel */}
          {/* Scrollbar disembunyikan via inline style — menghindari styled-jsx yang error di App Router */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 px-2 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
          >
            {sdgData.map((sdg, idx) => (
              <div
                key={sdg.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className={[
                  "group relative flex-shrink-0 snap-center flex flex-col p-6 rounded-3xl",
                  "w-[85%] sm:w-[60%] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]",
                  "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10",
                  "shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300",
                ].join(" ")}
              >
                {/* Top Section */}
                <div className="flex justify-between items-start mb-5">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-md flex-shrink-0">
                    <img
                      src={sdg.image}
                      alt={sdg.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className={`p-3 rounded-xl text-white ${sdg.color} shadow-md group-hover:rotate-6 transition-transform duration-300`}>
                    {React.createElement(sdg.icon, { size: 22 })}
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    sdg.category === "Primary"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                  }`}>
                    {sdg.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-dark dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {sdg.title}
                </h3>

                {/* Description */}
                <p className="text-SlateBlueText dark:text-opacity-80 text-sm leading-relaxed text-justify line-clamp-5">
                  {sdg.description}
                </p>

                {/* Watermark */}
                <div className="absolute bottom-2 right-4 text-6xl font-black text-dark dark:text-white opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-all duration-500 select-none">
                  {sdg.id}
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator — 2 dots mewakili 2 halaman (0-1 dan 2-3) */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1].map((pageIndex) => {
              const isActivePage = pageIndex === 0 ? activeIndex <= 1 : activeIndex >= 2;
              return (
                <button
                  key={pageIndex}
                  onClick={() => scrollToIndex(pageIndex === 0 ? 0 : 2)}
                  aria-label={`Go to page ${pageIndex + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActivePage
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