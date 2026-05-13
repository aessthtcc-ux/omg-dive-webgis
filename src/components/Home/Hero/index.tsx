"use client"; // Wajib untuk Next.js App Router

import Link from "next/link";
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ArrowRight, Palmtree } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-darkmode py-24 lg:py-32"> 
            
            <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
                {/* Gelembung 1 */}
                <div className="absolute bottom-[-50px] left-[10%] w-12 h-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-[2px] animate-water-bubble" />
                
                {/* Gelembung 2 */}
                <div className="absolute bottom-[-50px] left-[30%] w-20 h-20 rounded-full border border-white/20 bg-white/5 backdrop-blur-[3px] animate-water-bubble animation-delay-2000" />
                
                {/* Gelembung 3 */}
                <div className="absolute bottom-[-50px] left-[55%] w-8 h-8 rounded-full border border-white/40 bg-white/20 animate-water-bubble animation-delay-1000" />
                
                {/* Gelembung 4 */}
                <div className="absolute bottom-[-50px] left-[80%] w-16 h-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-[2px] animate-water-bubble animation-delay-4000" />

                {/* Efek Cahaya Dasar (Glow) agar gelembung terlihat mengkilap */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 dark:opacity-100" />
            </div>

            <div className="container">
                <div className="grid lg:grid-cols-12 grid-cols-1 items-center gap-30">
                    <div className="col-span-6">
                        <p
                            data-aos="fade-up"
                            data-aos-delay="200"
                            data-aos-duration="1000"
                            className="relative z-0 inline-block text-primary text-lg font-bold before:absolute before:content-[''] before:bg-primary/20 before:w-full before:h-2 before:-z-1 dark:before:-z-1 before:bottom-0"
                        >
                            Let's Diving Into Vessel Exploration
                        </p>
                        <h1
                            className="py-4"
                            data-aos="fade-up"
                            data-aos-delay="300"
                            data-aos-duration="1000"
                        >
                            What’s Hiding Under Pramuka Island?
                        </h1>
                        <p
                            data-aos="fade-up"
                            data-aos-delay="400"
                            data-aos-duration="1000"
                            className="text-xl text-SlateBlueText dark:text-opacity-80 font-normal md:pb-14 pb-6"
                        >
                            Exploring underwater shipwreck sites through hydrographic survey, spatial analysis, and marine archaeology.
                        </p>
                        <div className="flex items-center md:justify-normal lg:justify-center justify-start flex-wrap gap-4">
                            <Link
                                href="#mapprev-section"
                                data-aos="fade-up"
                                data-aos-delay="500"
                                data-aos-duration="1000"
                                className="btn btn-1 hover-filled-slide-down rounded-lg overflow-hidden"
                            >
                                <span className="!flex !items-center gap-2">
                                    Ready to Explore?
                                    <ArrowRight 
                                        size={22} 
                                        className="lucide lucide-arrow-right w-6 h-6 inline-block transition-colors duration-300" 
                                    />
                                </span>
                            </Link>

                            {/* REVISI LINK ADA DI SINI */}
                            <Link
                                href="/overview"
                                data-aos="fade-up"
                                data-aos-delay="600"
                                data-aos-duration="1000"
                                className="btn_outline btn-2 hover-outline-slide-down group"
                            >
                                <span className="!flex !items-center gap-3"> 
                                    <Palmtree 
                                        className="w-6 h-6 text-current transition-colors duration-300 group-hover:text-white" 
                                        strokeWidth={2}
                                    />
                                    Island Overview
                                </span>
                            </Link>
                        </div>
                    </div>
                    
                    <div
                        data-aos="fade-left"
                        data-aos-delay="200"
                        data-aos-duration="1000"
                        className="col-span-6 lg:flex hidden items-center gap-3"
                    >
                        <div className="w-full mt-32 flex justify-end">
                            <div className="w-full md:w-[120%] lg:w-[150%] xl:w-[180%] h-auto -mr-10 lg:-mr-32">
                                <DotLottieReact
                                    src="https://lottie.host/5fc4c8fb-c464-4b3e-bca6-f2d6a9bd0731/x8q17jgJ56.lottie"
                                    loop
                                    autoplay
                                    className="w-full h-full object-contain" 
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