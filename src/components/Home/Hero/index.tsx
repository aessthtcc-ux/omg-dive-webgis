"use client";

import Link from "next/link";
import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { ArrowRight, Palmtree } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-darkmode pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32"> 
            
            <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-[-50px] left-[10%] w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-[2px] animate-water-bubble" />
                <div className="absolute bottom-[-50px] left-[30%] w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 bg-white/5 backdrop-blur-[3px] animate-water-bubble animation-delay-2000" />
                <div className="absolute bottom-[-50px] left-[55%] w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/40 bg-white/20 animate-water-bubble animation-delay-1000" />
                <div className="absolute bottom-[-50px] left-[80%] w-10 h-10 md:w-16 md:h-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-[2px] animate-water-bubble animation-delay-4000" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 dark:opacity-100" />
            </div>

            <div className="container">
                <div className="grid lg:grid-cols-12 grid-cols-1 items-center gap-8 md:gap-30">
                    
                    {/* TEXT CONTENT */}
                    <div className="col-span-6">
                        <p
                            data-aos="fade-up"
                            data-aos-delay="200"
                            data-aos-duration="1000"
                            className="relative z-0 inline-block text-primary text-sm md:text-lg font-bold before:absolute before:content-[''] before:bg-primary/20 before:w-full before:h-2 before:-z-1 dark:before:-z-1 before:bottom-0"
                        >
                            Let's Diving Into Vessel Exploration
                        </p>

                        {/* ✅ MOBILE FIX: h1 lebih kecil di mobile */}
                        <h1
                            className="py-3 md:py-4 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight"
                            data-aos="fade-up"
                            data-aos-delay="300"
                            data-aos-duration="1000"
                        >
                            What's Hiding Under Pramuka Island?
                        </h1>

                        {/* ✅ MOBILE FIX: deskripsi lebih kecil di mobile */}
                        <p
                            data-aos="fade-up"
                            data-aos-delay="400"
                            data-aos-duration="1000"
                            className="text-base md:text-xl text-SlateBlueText dark:text-opacity-80 font-normal pb-6 md:pb-14"
                        >
                            Exploring underwater shipwreck sites through hydrographic survey, spatial analysis, and marine archaeology.
                        </p>

                        {/* ✅ MOBILE FIX: tombol tidak full width, lebih compact */}
                        <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            data-aos-duration="1000"
                            className="flex items-center justify-start flex-wrap gap-3"
                        >
                            <Link
                                href="#mapprev-section"
                                className="btn btn-1 hover-filled-slide-down rounded-lg overflow-hidden text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3"
                            >
                                <span className="!flex !items-center gap-2">
                                    Ready to Explore?
                                    <ArrowRight size={18} className="inline-block transition-colors duration-300" />
                                </span>
                            </Link>

                            <Link
                                href="/overview"
                                className="btn_outline btn-2 hover-outline-slide-down group text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3"
                            >
                                <span className="!flex !items-center gap-2"> 
                                    <Palmtree 
                                        className="w-4 h-4 md:w-5 md:h-5 text-current transition-colors duration-300 group-hover:text-white" 
                                        strokeWidth={2}
                                    />
                                    Island Overview
                                </span>
                            </Link>
                        </div>
                    </div>
                    
                    {/* LOTTIE ANIMATION — hanya muncul di lg ke atas */}
                    <div
                        data-aos="fade-left"
                        data-aos-delay="200"
                        data-aos-duration="1000"
                        className="col-span-6 lg:flex hidden items-center gap-3"
                    >
                        <div className="w-full mt-32 flex justify-end">
                            <div className="w-full md:w-[120%] lg:w-[150%] xl:w-[180%] h-auto -mr-10 lg:-mr-32">
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
            </div>
        </section>
    );
};

export default Hero;