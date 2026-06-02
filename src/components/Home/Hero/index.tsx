"use client";

import Link from "next/link";
import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { ArrowRight, Palmtree } from "lucide-react";

const Hero = () => {
    return (
        // ✅ FIX: kurangi pt agar judul tidak jauh dari header
        // mobile: pt-20 (navbar ~64px + 16px gap), tablet: pt-24, desktop: pt-28
        // pb dikurangi agar tidak terlalu besar
        <section className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-darkmode pt-20 pb-10 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20">
            
            {/* Bubble background */}
            <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-[-50px] left-[10%] w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 bg-white/10 animate-water-bubble" />
                <div className="absolute bottom-[-50px] left-[30%] w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 bg-white/5 animate-water-bubble animation-delay-2000" />
                <div className="absolute bottom-[-50px] left-[55%] w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/40 bg-white/20 animate-water-bubble animation-delay-1000" />
                <div className="absolute bottom-[-50px] left-[80%] w-10 h-10 md:w-16 md:h-16 rounded-full border border-white/20 bg-white/10 animate-water-bubble animation-delay-4000" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 dark:opacity-100" />
            </div>

            <div className="container">
                {/* ✅ FIX: gap dikurangi, alignment tengah di semua ukuran */}
                <div className="grid lg:grid-cols-12 grid-cols-1 items-center gap-6 md:gap-8 lg:gap-10">
                    
                    {/* TEXT CONTENT */}
                    <div className="col-span-6 flex flex-col">

                        {/* Tagline */}
                        <p
                            data-aos="fade-up"
                            data-aos-delay="200"
                            data-aos-duration="1000"
                            className="relative z-0 inline-block text-primary text-xs sm:text-sm md:text-base font-bold
                                       before:absolute before:content-[''] before:bg-primary/20 before:w-full before:h-2
                                       before:-z-1 dark:before:-z-1 before:bottom-0 w-fit"
                        >
                            Let's Diving Into Vessel Exploration
                        </p>

                        {/* ✅ FIX: ukuran judul lebih proporsional di tiap breakpoint */}
                        <h1
                            className="mt-2 md:mt-3 mb-3 md:mb-4
                                       text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                                       font-black leading-tight tracking-tight"
                            data-aos="fade-up"
                            data-aos-delay="300"
                            data-aos-duration="1000"
                        >
                            What's Hiding Under Pramuka Island?
                        </h1>

                        {/* Deskripsi */}
                        <p
                            data-aos="fade-up"
                            data-aos-delay="400"
                            data-aos-duration="1000"
                            className="text-sm sm:text-base md:text-lg text-SlateBlueText dark:text-opacity-80
                                       font-normal mb-6 md:mb-8 lg:mb-10 max-w-lg leading-relaxed"
                        >
                            Exploring underwater shipwreck sites through hydrographic survey, spatial analysis, and marine archaeology.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            data-aos-duration="1000"
                            className="flex items-center justify-start flex-wrap gap-3"
                        >
                            <Link
                                href="#mapprev-section"
                                className="btn btn-1 hover-filled-slide-down rounded-lg overflow-hidden
                                           text-xs sm:text-sm md:text-base
                                           px-4 md:px-5 lg:px-6
                                           py-2 md:py-2.5 lg:py-3"
                            >
                                <span className="!flex !items-center gap-2">
                                    Ready to Explore?
                                    <ArrowRight size={16} className="inline-block transition-colors duration-300 md:w-[18px] md:h-[18px]" />
                                </span>
                            </Link>

                            <Link
                                href="/overview"
                                className="btn_outline btn-2 hover-outline-slide-down group
                                           text-xs sm:text-sm md:text-base
                                           px-4 md:px-5 lg:px-6
                                           py-2 md:py-2.5 lg:py-3"
                            >
                                <span className="!flex !items-center gap-2">
                                    <Palmtree
                                        className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-current transition-colors duration-300 group-hover:text-white"
                                        strokeWidth={2}
                                    />
                                    Island Overview
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* LOTTIE — hanya di lg ke atas, posisi lebih dekat ke teks */}
                    <div
                        data-aos="fade-left"
                        data-aos-delay="200"
                        data-aos-duration="1000"
                        className="col-span-6 lg:flex hidden items-center justify-end"
                    >
                        {/* ✅ FIX: hapus mt-32 yang bikin lottie drop ke bawah */}
                        {/* Pakai negative margin kanan agar tetap overflow ke kanan secara estetis */}
                        <div className="w-full flex justify-end">
                            <div className="w-[110%] xl:w-[130%] h-auto -mr-8 xl:-mr-20">
                                <DotLottiePlayer
                                    src="https://lottie.host/5fc4c8fb-c464-4b3e-bca6-f2d6a9bd0731/x8q17jgJ56.lottie"
                                    loop
                                    autoplay
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Mobile-only: animasi Lottie muncul di bawah teks, lebih kecil */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="400"
                    data-aos-duration="1000"
                    className="lg:hidden flex justify-center mt-6 md:mt-8"
                >
                    <div className="w-4/5 sm:w-3/4 md:w-2/3 max-w-sm">
                        <DotLottiePlayer
                            src="https://lottie.host/5fc4c8fb-c464-4b3e-bca6-f2d6a9bd0731/x8q17jgJ56.lottie"
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;