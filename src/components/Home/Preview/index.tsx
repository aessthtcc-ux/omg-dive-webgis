"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslationContext } from "@/context/TranslationContext"; // ← tambah

const MapContent = dynamic(() => import('./MapContent'), { 
  ssr: false,
  loading: () => {
    const { t } = useTranslationContext(); // ← tambah
    return (
      <div className="w-full h-full bg-slate-800 animate-pulse rounded-[1.25rem] flex items-center justify-center">
        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">{t("Loading map...")}</span>
      </div>
    );
  }
});

const Mapprev = () => {
  const { t } = useTranslationContext(); // ← tambah
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div id="mapprev-section">
      <section
        className="relative w-full flex items-center overflow-hidden py-14 md:py-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Pulau-Seribu.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80 z-0" />

        <div className="container relative z-10">
          {/* Title */}
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">
              {t("Preview Shipwreck Location")}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            onViewportEnter={() => setIsRevealed(true)}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full rounded-[1.5rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/20 md:border-white dark:border-gray-800"
          >
            {/* Overlay animasi */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.5, delay: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 z-[100] bg-LightSkyBlue flex flex-col items-center justify-center pointer-events-none"
                >
                  <h2 className="text-white text-2xl md:text-4xl font-black italic tracking-widest animate-pulse text-center px-4">
                    STARTING ADVENTURE...
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full">
              <MapContent />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Mapprev;