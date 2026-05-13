"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, GraduationCap, Globe, Ship,
  Instagram, Linkedin, Layers, Box, 
  History, Anchor, Image as ImageIcon 
} from 'lucide-react';

const ProjectTeam = () => {
  const slideUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { duration: 0.8, ease: "easeOut" }
  };
 
  const supervisors = [
    { 
      name: "Gabriella Alodia, S.T., M.Sc., Ph.D.", 
      role: "Academic Supervisor – Hydrography",
      img: "https://itb.ac.id/files/dosen/5849-8de154254102c070c750f3d34641746f67991317c75b9074d5973254dd7a8cd0.png" 
    },
    { 
      name: "Dr. Alfita Puspa Handayani, S.T., M.T.", 
      role: "Academic Supervisor – Spatial System & Cadastre",
      img: "https://itb.ac.id/files/dosen/4650-59be24fedf1603863d4750f427c1e354e89d3daf40f6e289a971801651577ff5.png"
    },
    { 
      name: "Dr. Ir. Dwi Wisayantono, M.T.", 
      role: "Academic Supervisor – Hydrography",
      img: "https://itb.ac.id/files/dosen/1885-b7258c4cb208029646e76cde9abe3aedd324e8895ab350563013ce308031e590.png"
    },
  ];

  const teamMembers = [
    { 
      name: "Rasya Intishar", 
      role: "Hydrographic Data Acquisition & Processing", 
      ig: "#", ln: "#", img: "/images/team/member1.jpg" 
    },
    { 
      name: "Alena Cansery", 
      role: "3D Visualization, GIS Integration & StoryMap Development", 
      ig: "#", ln: "#", img: "/images/team/member2.jpg" 
    },
    { 
      name: "Raju Imam Syahanafi", 
      role: "Marine Survey Operations & Field Coordination", 
      ig: "#", ln: "#", img: "/images/team/member3.jpg" 
    },
    { 
      name: "Hanif Ramadhan", 
      role: "Data Analysis & Marine Spatial Modeling", 
      ig: "#", ln: "#", img: "/images/team/member4.jpg" 
    },
  ];

  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-IcyBreeze dark:bg-darklight py-24 lg:py-32">
      <div className="container px-6 mx-auto space-y-20">
        
        {/* 🏷️ SECTION TITLE (CENTERED & OUTSIDE) */}
        {/* @ts-ignore */}
        <motion.div {...slideUp} className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
            Behind The <span className="text-primary">Project</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm lg:text-base">
            The dedicated experts and innovators driving the maritime geospatial evolution.
          </p>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* 📘 ABOUT PROJECT (SECONDARY CARD) */}
        {/* @ts-ignore */}
        <motion.div {...slideUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 p-10 lg:p-14 rounded-[4rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Globe className="text-primary" /> Project Overview
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium text-justify">
                  This StoryMap WebGIS was developed as an integrated geospatial platform to visualize, document, and analyze shipwreck heritage sites around Pulau Pramuka using multibeam echosounder data and 3D modeling techniques.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: <Layers size={20} />, label: "Interactive Maps" },
                    { icon: <Box size={20} />, label: "3D Visualization" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary">
                      {item.icon} <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "Combining hydrographic survey methods and spatial storytelling to transform underwater cultural heritage into accessible digital knowledge for education and conservation."
                </p>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-16 -bottom-16 opacity-10 text-white pointer-events-none rotate-12">
              <Ship size={320} />
            </div>
          </div>
        </motion.div>

        {/* 🎓 SUPERVISORS SECTION */}
        <div className="space-y-10">
          <h3 className="text-2xl font-black flex items-center gap-3 justify-center text-gray-900 dark:text-white">
            <GraduationCap className="text-primary" /> Supervisors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supervisors.map((s, i) => (
              <motion.div key={i} {...(slideUp as any)} className="p-10 rounded-[3.5rem] bg-gray-900 border border-white/5 text-white flex flex-col items-center text-center group transition-all duration-500 hover:bg-gray-800 shadow-xl">
                {/* Photo Frame */}
                <div className="w-36 h-36 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/20 mb-8 overflow-hidden group-hover:border-primary/50 transition-colors duration-500">
                  <img 
                    src={s.img} 
                    alt={s.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-700"
                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${s.name}&background=3b82f6&color=fff`)}
                  />
                </div>
                <h4 className="text-lg font-black leading-tight mb-3 group-hover:text-primary transition-colors">{s.name}</h4>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                  {s.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 👩‍💻 TEAM MEMBERS SECTION */}
        <div className="space-y-10">
          <h3 className="text-2xl font-black flex items-center gap-3 justify-center text-gray-900 dark:text-white">
            <Users className="text-primary" /> Project Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((t, i) => (
              <motion.div key={i} {...(slideUp as any)} className="p-8 rounded-[3rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm">
                {/* Photo Frame */}
                <div className="w-28 h-28 rounded-[2rem] bg-IcyBreeze dark:bg-white/10 mb-6 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-500">
                  <img 
                    src={t.img} 
                    alt={t.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${t.name}&background=3b82f6&color=fff`)}
                  />
                </div>
                
                <div className="mb-6 flex-grow">
                  <h4 className="text-base font-black mb-2 text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                    {t.role}
                  </p>
                </div>
                
                {/* Social Links */}
                <div className="flex gap-3 pt-5 border-t border-gray-100 dark:border-white/5 w-full justify-center">
                  <a href={t.ig} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-pink-500 hover:text-white text-gray-400 transition-all">
                    <Instagram size={16} />
                  </a>
                  <a href={t.ln} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-gray-400 transition-all">
                    <Linkedin size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProjectTeam;