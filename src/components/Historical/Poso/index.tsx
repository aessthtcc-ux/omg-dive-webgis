import React, { useState, useRef, useEffect } from 'react';
import { Info, Star, Fish, ChevronRight, ChevronLeft, Waves, Anchor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// DATA WILDLIFE — POSO WRECK
// Spesies 1–4: likelihood berdasarkan karakteristik ekologi umum & habitat wreck.
// Spesies 5–10: data penampakan dari Scubago (scubago.com) — platform dive log
// berbasis User Generated Content. Digunakan hanya sebagai referensi kuantitatif
// dengan atribusi eksplisit, bukan reproduksi tampilan/layout platform asli.
// ---------------------------------------------------------------------------
interface WildlifeItem {
  id: number;
  name: string;
  scientificName: string;
  image: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  likelihoodLabel: string;
  bestSeason: string;
  depth: string;
  behavior: string;
  tags: string[];
  scubagoSightings?: number;
  scubagoSource?: boolean;
}

const wildlifeData: WildlifeItem[] = [
  // ── Spesies 1–4: estimasi ekologi, tanpa data pihak ketiga ──
  {
    id: 1,
    name: "Green Sea Turtle",
    scientificName: "Chelonia mydas",
    image: "https://cdn.divessi.com/cached/Wildlife_Green_Sea_Turtle_Shutterstock-Shane-Myers-Photography.jpg/400.jpg",
    likelihood: 4,
    likelihoodLabel: "Common",
    bestSeason: "Apr – Oct",
    depth: "5 – 30 m",
    behavior: "Frequently observed resting on the wreck bow or grazing on algae along the hull. The high coral cover of Poso (80%) provides ideal resting habitat.",
    tags: ["Protected", "IUCN Endangered"],
  },
  {
    id: 2,
    name: "Hawksbill Turtle",
    scientificName: "Eretmochelys imbricata",
    image: "https://cdn.divessi.com/cached/Wildlife_Hawksbill_Turtle_Shutterstock-Ed-Jenkins.jpg/400.jpg",
    likelihood: 3,
    likelihoodLabel: "Occasional",
    bestSeason: "May – Sep",
    depth: "10 – 30 m",
    behavior: "Feeds on sponges colonising the wreck structure. More active during morning dives before current picks up.",
    tags: ["Critically Endangered", "Sponge Feeder"],
  },
  {
    id: 3,
    name: "Moray Eel",
    scientificName: "Gymnothorax spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Moray_Eel_Alamy-WaterFrame.jpg/400.jpg",
    likelihood: 5,
    likelihoodLabel: "Very Common",
    bestSeason: "Year-round",
    depth: "20 – 30 m",
    behavior: "Permanent resident in the engine room and cargo hold crevices. Multiple individuals often spotted simultaneously during penetration dives.",
    tags: ["Resident", "Nocturnal", "Wreck Dweller"],
  },
  {
    id: 4,
    name: "Nudibranch",
    scientificName: "Nudibranchia spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Nudy01_SSI-Peter-Schinck.jpg/300.jpg",
    likelihood: 4,
    likelihoodLabel: "Common",
    bestSeason: "Year-round",
    depth: "15 – 30 m",
    behavior: "Found across coral-encrusted surfaces of the hull and deck. The 80% coral cover of Poso supports exceptionally high nudibranch diversity.",
    tags: ["Macro Subject", "Photogenic"],
  },
  // ── Spesies 5–10: referensi data Scubago UGC ──
  {
    id: 5,
    name: "Butterfly Fish",
    scientificName: "Chaetodontidae spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Butterfly_Fish_Shutterstock_Krzysztof-Odziomek.jpg/300.jpg",
    likelihood: 4,
    likelihoodLabel: "Common",
    bestSeason: "May – Oct",
    depth: "3 – 25 m",
    behavior: "Pairs patrol the coral-encrusted upper deck and railings, feeding on polyps. More abundant here than Tabularasa due to higher coral cover.",
    tags: ["Reef Fish", "Photogenic"],
    scubagoSightings: 37,
    scubagoSource: true,
  },
  {
    id: 6,
    name: "Clownfish",
    scientificName: "Amphiprion ocellaris",
    image: "https://cdn.divessi.com/cached/Wildlife_Clownfish_Udo_Kefrig.jpg/300.jpg",
    likelihood: 4,
    likelihoodLabel: "Common",
    bestSeason: "May – Nov",
    depth: "3 – 15 m",
    behavior: "Found in anemones growing on shallow sections of the wreck deck. The flat-lying structure of Poso creates ideal shallow anemone habitat.",
    tags: ["Anemone Host", "Resident"],
    scubagoSightings: 36,
    scubagoSource: true,
  },
  {
    id: 7,
    name: "Lionfish",
    scientificName: "Pterois volitans",
    image: "https://cdn.divessi.com/cached/Wildlife_Lionfish_iStock-cinoby.jpg/300.jpg",
    likelihood: 3,
    likelihoodLabel: "Occasional",
    bestSeason: "Feb, May, Aug – Oct",
    depth: "20 – 30 m",
    behavior: "Lurks in shadowed overhangs and under the wreck hull. Approach with caution — venomous spines. Best spotted during twilight dives.",
    tags: ["Venomous", "Ambush Predator"],
    scubagoSightings: 11,
    scubagoSource: true,
  },
  {
    id: 8,
    name: "Surgeonfish",
    scientificName: "Acanthurus spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Surgeonfish_iStock-mirecca.jpg/300.jpg",
    likelihood: 3,
    likelihoodLabel: "Occasional",
    bestSeason: "Sep – Oct",
    depth: "5 – 25 m",
    behavior: "Schools form around the upper structure during feeding periods. The sharp caudal spine is used defensively — maintain respectful distance.",
    tags: ["Schooling", "Reef Grazer"],
    scubagoSightings: 6,
    scubagoSource: true,
  },
  {
    id: 9,
    name: "Stingray",
    scientificName: "Dasyatis spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Stingray_iStock-Extreme-Photographer.jpg/300.jpg",
    likelihood: 2,
    likelihoodLabel: "Uncommon",
    bestSeason: "Aug – Nov",
    depth: "25 – 30 m",
    behavior: "Rests camouflaged on the sandy seabed surrounding the wreck base. Best spotted on slow circumnavigation dives around the hull perimeter.",
    tags: ["Benthic", "Sandy Bottom"],
    scubagoSightings: 22,
    scubagoSource: true,
  },
  {
    id: 10,
    name: "Parrotfish",
    scientificName: "Scaridae spp.",
    image: "https://cdn.divessi.com/cached/Wildlife_Parrotfish_iStock-burnsboxco.jpg/300.jpg",
    likelihood: 3,
    likelihoodLabel: "Occasional",
    bestSeason: "Mar, Jul, Sep – Oct",
    depth: "5 – 25 m",
    behavior: "Grazes on algae and encrusting coral on the hull. The biting sound is often audible underwater. Produces fine white sand as a feeding byproduct.",
    tags: ["Reef Grazer", "Sand Producer"],
    scubagoSightings: 13,
    scubagoSource: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const likelihoodConfig: Record<number, { color: string; bg: string; border: string; bar: string }> = {
  1: { color: "text-gray-500",    bg: "bg-gray-100 dark:bg-white/10",         border: "border-gray-200 dark:border-white/10",        bar: "bg-gray-400" },
  2: { color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20",      border: "border-amber-200 dark:border-amber-800/30",   bar: "bg-amber-400" },
  3: { color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",        border: "border-blue-200 dark:border-blue-800/30",     bar: "bg-blue-400" },
  4: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20",  border: "border-emerald-200 dark:border-emerald-800/30", bar: "bg-emerald-500" },
  5: { color: "text-primary",     bg: "bg-primary/10",                         border: "border-primary/20",                           bar: "bg-primary" },
};

const LikelihoodBar = ({ level }: { level: number }) => {
  const cfg = likelihoodConfig[level];
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
          style={{ originY: 1 }}
          className={`flex-1 h-2 rounded-full ${i < level ? cfg.bar : "bg-gray-200 dark:bg-white/10"}`}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Modal Popup Detail
// ---------------------------------------------------------------------------
const DetailModal = ({ animal, onClose }: { animal: WildlifeItem; onClose: () => void }) => {
  const cfg = likelihoodConfig[animal.likelihood];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-sm bg-white dark:bg-darklight rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-52 overflow-hidden">
          <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Likelihood badge */}
          <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {animal.likelihoodLabel}
          </div>

          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-white font-black text-xl leading-tight">{animal.name}</p>
            <p className="text-white/60 text-[11px] italic">{animal.scientificName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Likelihood bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sighting Likelihood</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={i < animal.likelihood ? `${cfg.color} fill-current` : "text-gray-300 dark:text-white/20"} />
                ))}
              </div>
            </div>
            <LikelihoodBar level={animal.likelihood} />
          </div>

          {/* Behavior */}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-2 border-primary/30 pl-3">
            "{animal.behavior}"
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Best Season</p>
              <p className="text-sm font-bold text-dark dark:text-white">{animal.bestSeason}</p>
            </div>
            <div className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Depth Range</p>
              <p className="text-sm font-bold text-dark dark:text-white">{animal.depth}</p>
            </div>
          </div>

          {/* Scubago badge — hanya jika ada data */}
          {animal.scubagoSource && animal.scubagoSightings !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <Fish size={12} className="text-primary flex-shrink-0" />
              <span className="text-[10px] font-black text-dark dark:text-white">{animal.scubagoSightings} sightings logged</span>
              <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-gray-300 dark:text-white/20">Scubago UGC</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {animal.tags.map((tag) => (
              <span key={tag} className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main Component — Carousel
// ---------------------------------------------------------------------------
const WildlifeSightings = () => {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex,    setActiveIndex]    = useState(0);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<WildlifeItem | null>(null);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // IntersectionObserver — real-time dots
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let max = 0; let idx = 0;
        entries.forEach((e) => {
          const i = cardRefs.current.indexOf(e.target as HTMLElement);
          if (i !== -1 && e.intersectionRatio > max) { max = e.intersectionRatio; idx = i; }
        });
        if (max > 0) setActiveIndex(idx);
      },
      { root: el, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    cardRefs.current.forEach((c) => { if (c) observer.observe(c); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollByCard = (dir: "left" | "right") => {
    const target = dir === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(wildlifeData.length - 1, activeIndex + 1);
    cardRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Fish size={15} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marine Biodiversity</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-[9px] font-black tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 flex-shrink-0">
            TAP FOR DETAIL <ChevronRight size={11} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Tombol Kiri */}
        <button
          onClick={() => scrollByCard("left")} disabled={!canScrollLeft} aria-label="Previous"
          className={`absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-white/10 shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-200 ${
            canScrollLeft ? "opacity-100 hover:bg-primary hover:border-primary hover:text-white cursor-pointer" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={18} className="text-dark dark:text-white" />
        </button>

        {/* Tombol Kanan */}
        <button
          onClick={() => scrollByCard("right")} disabled={!canScrollRight} aria-label="Next"
          className={`absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-white/10 shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-200 ${
            canScrollRight ? "opacity-100 hover:bg-primary hover:border-primary hover:text-white cursor-pointer" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={18} className="text-dark dark:text-white" />
        </button>

        {/* Track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory px-1 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {wildlifeData.map((animal, idx) => {
            const cfg = likelihoodConfig[animal.likelihood];
            return (
              <button
                key={animal.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                onClick={() => setSelectedAnimal(animal)}
                aria-label={`View ${animal.name}`}
                className="group flex-shrink-0 snap-center focus:outline-none w-[42%] sm:w-[28%] md:w-[20%] lg:w-[16%]"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-transparent group-hover:border-primary group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300 aspect-[3/4]">
                  <img
                    src={animal.image} alt={animal.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Likelihood dot */}
                  <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${cfg.bar} shadow-md`} />

                  {/* Scubago count pill */}
                  {animal.scubagoSource && animal.scubagoSightings !== undefined && (
                    <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                      <span className="text-[8px] font-black text-white">{animal.scubagoSightings}×</span>
                    </div>
                  )}

                  {/* Name + stars */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-black text-[11px] leading-tight line-clamp-2">{animal.name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={8} className={i < animal.likelihood ? `${cfg.color} fill-current` : "text-white/20"} />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {wildlifeData.map((_, i) => (
            <button
              key={i}
              onClick={() => cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })}
              aria-label={`Go to ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-6 bg-primary" : "w-1.5 bg-gray-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-start gap-1.5">
          <Info size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400">
            <span className="font-bold text-gray-500"></span> Likelihood estimated from species ecology, Poso wreck depth profile & coral cover characteristics.
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedAnimal && (
          <DetailModal animal={selectedAnimal} onClose={() => setSelectedAnimal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WildlifeSightings;