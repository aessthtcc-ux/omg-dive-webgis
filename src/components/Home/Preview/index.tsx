"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // REVISI: Untuk cegah error window
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud } from 'lucide-react';

// REVISI: Memanggil konten peta hanya di sisi client
const MapContent = dynamic(() => import('./MapContent'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-200 animate-pulse" />
});

const Mapprev = () => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div id="mapprev-section">
    <section 
      className="relative w-full min-h-screen flex items-center overflow-hidden py-20 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/Pulau-Seribu.webp')" }} // <-- Arahkan ke folder public
    >
      {/* --- LAYER OVERLAY (WARNA TERTENTU) --- */}
      {/* Ganti 'bg-black' dengan 'bg-blue-900' atau warna lain sesuai keinginan */}
      {/* Ubah '/50' (opacity 50%) menjadi '/70' jika ingin lebih gelap lagi */}
      <div className="absolute inset-0 bg-black/80 z-0"></div>
      <div className="container relative z-10">
        
        {/* --- Tambahkan Bagian Judul Di Sini --- */}
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-4">
            Preview Shipwreck Location
          </h2>
        </div>
        {/* --- End of Title --- */}

        {/* REVISI: Trigger animasi saat scroll masuk ke viewport */}
        <motion.div 
          // 1. Posisi awal: Transparan (opacity 0) dan bergeser ke bawah (y: 50)
          initial={{ opacity: 0, y: 50 }} 
          
          // 2. Posisi saat masuk layar: Terlihat penuh (opacity 1) dan kembali ke posisi asli (y: 0)
          whileInView={{ opacity: 1, y: 0 }} 
          
          // 3. Kontrol Viewport
          viewport={{ once: false, amount: 0.4 }} 
          onViewportEnter={() => setIsRevealed(true)}
          
          // 4. Pengaturan durasi dan kehalusan animasi
          transition={{ 
            duration: 0.8, 
            ease: "easeOut" 
          }}
          
          className="relative w-full h-[400px] lg:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800"
        >
          
          {/* 1. LAYER ANIMASI AWAN (Overlay) */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div 
                // Animasi masuk
                initial={{ opacity: 1 }} 
                // Animasi yang langsung dijalankan untuk menghilang
                animate={{ opacity: 0 }} 
                // Pengaturan durasi dan delay
                transition={{ 
                  duration: 1.5, // Waktu proses menghilang
                  delay: 2.5,    // Waktu awan menutupi peta sebelum mulai hilang
                  ease: "easeInOut" 
                }}
                // Penting: Agar layer tidak menghalangi klik saat sudah transparan
                className="absolute inset-0 z-[100] bg-LightSkyBlue flex flex-col items-center justify-center pointer-events-none"
              >
                {/* Konten Awan & Teks kamu tetap di sini */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                      animate={{ x: [-20, 20] }} 
                      transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
                      className="absolute top-10 left-10 text-white/50"
                    >
                    </motion.div>
                </div>
                
                <h2 className="text-white text-4xl font-black italic tracking-widest animate-pulse">
                  STARTING ADVENTURE...
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. AREA PETA */}
          <div className="w-full h-full relative z-10">
            <MapContent />
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  );
};

export default Mapprev;