"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ExternalLinkIcon, X } from "lucide-react";

interface StepItem {
  id: number;
  title: string;
  description: string;
  fullDesc: string;
  link: string;
  image: string;
}

interface FullDescContent {
  intro?: string;
  points: {
    icon: string;
    title: string;
    details: string;
    tags?: string[];
  }[];
  conclusion?: string;
}

const steps: StepItem[] = [
  {
    id: 1,
    title: "Planning the Survey Lines",
    description: "The survey begins with detailed planning of multibeam line configuration and acquisition parameters. Survey lines are designed based on expected wreck location, water depth, and coverage requirements. Swath width, overlap percentage, vessel speed, and navigation control are defined to ensure full seabed coverage and optimal data density in the Panggang District waters of Pramuka Island.",
    fullDesc: JSON.stringify({
      intro: "Line survey planning is structured in three progressive stages to ensure hydrographic accuracy and high-resolution shipwreck documentation.",
      points: [
        { icon: "✨", title: "Stage 1: Patch Test Calibration", details: "Dedicated lines are designed for patch test calibration. These lines are arranged in reciprocal and crossing patterns over identifiable seabed features to resolve systematic biases in roll, pitch, yaw, and latency between sensors. Proper patch test planning ensures angular alignment, timing synchronization, and compliance with IHO S-44 calibration requirements before full acquisition begins.", tags: ["IHO S-44", "Sensor Calibration"] },
        { icon: "🌊", title: "Stage 2: General Coverage Lines", details: "General coverage lines are planned for the broader shipwreck area. Line spacing is calculated based on water depth and expected swath width to achieve sufficient overlap and full seabed coverage. Survey order specifications follow IHO S-44 standards to maintain controlled Total Horizontal Uncertainty (THU) and Total Vertical Uncertainty (TVU).", tags: ["Seabed Mapping", "IHO S-44", "THU/TVU"] },
        { icon: "🔎", title: "Stage 3: Detailed Feature Documentation", details: "The survey design is refined for detailed feature documentation of the shipwreck itself. The configuration adopts a feature-based approach inspired by Westley (2019), integrating parallel lines for consistent coverage, perpendicular lines to strengthen geometric definition of vertical structures, and oblique lines to minimize acoustic shadowing.", tags: ["3D Reconstruction", "Marine Archaeology", "Westley (2019)"] }
      ],
      conclusion: "This structured approach ensures comprehensive and high-fidelity data acquisition for accurate underwater mapping."
    }),
    link: "#planning",
    image: "/images/world-class-speakers/linesurvey.png"
  },
  {
    id: 2,
    title: "Multibeam Data Acquisition",
    description: "Bathymetric data is collected using a Multibeam Echosounder (MBES) system. During acquisition, supporting parameters are simultaneously recorded, including Sound Velocity Profile (SVP), tidal observations on the survey day, and precise sensor offset measurements (GNSS antenna, IMU, transducer). These parameters ensure geometric accuracy and depth correction for reliable shipwreck mapping.",
    fullDesc: JSON.stringify({
      intro: "Multibeam data acquisition is conducted under IHO S-44 Special Order requirements to ensure high positional accuracy, controlled uncertainty, and complete seabed coverage for shipwreck documentation.",
      points: [
        { icon: "📍", title: "Positioning System & Horizontal Accuracy", details: "Positioning is achieved using RT-PPP and RTK GNSS methodologies. RT-PPP provides horizontal accuracy within 5–15 cm, while RTK achieves 1–5 cm accuracy within a 10 km baseline. Horizontal uncertainty (THU) is controlled within 2 meters as specified under IHO S-44 standards.", tags: ["RTK", "RT-PPP", "THU Control", "IHO S-44"] },
        { icon: "📏", title: "Vertical Uncertainty & Depth Control", details: "Vertical accuracy is managed according to IHO S-44 Special Order Total Vertical Uncertainty (TVU) formula: TVU = √(a² + (b × d)²), where a = 0.25 m and b = 0.0075. SVP measurements and tidal observations are applied to correct acoustic refraction and water level variations.", tags: ["TVU", "SVP Correction", "Tidal Reduction", "Special Order"] },
        { icon: "🌊", title: "Full Seabed Coverage Requirement", details: "The survey ensures 100% seabed coverage as required under Special Order classification. Swath width is dynamically adjusted according to water depth to maintain overlap and avoid data gaps. Survey speed is optimized to preserve sounding density and reduce motion-induced noise.", tags: ["100% Coverage", "Sounding Density", "Special Order"] },
        { icon: "📐", title: "Swath Angle & Feature Resolution", details: "For detailed shipwreck feature detection, survey lines are modified into parallel, perpendicular, and oblique orientations. This multi-directional acquisition enhances point cloud density, reduces acoustic shadowing, and improves 3D structural definition of the wreck.", tags: ["Swath Geometry", "Feature Survey", "Westley (2019)", "3D Visualization"] }
      ],
      conclusion: "By integrating precise GNSS positioning, strict uncertainty control, full seabed coverage, and feature-oriented swath configuration, the multibeam acquisition stage produces high-quality bathymetric datasets suitable for detailed 3D shipwreck reconstruction."
    }),
    link: "#acquisition",
    image: "/images/world-class-speakers/acquisition.jpg",
  },
  {
    id: 3,
    title: "Data Processing & 3D Visualization",
    description: "Raw multibeam data is processed through tidal correction, sound velocity correction, motion compensation, and outlier filtering. The cleaned dataset is used to generate Digital Terrain Models (DTM), bathymetric grids, and detailed seafloor morphology maps. Final outputs include high-resolution shipwreck detection and 3D visualization models representing the submerged structure around Pramuka Island.",
    fullDesc: JSON.stringify({
      intro: "Post-processing transforms raw multibeam soundings into accurate and interpretable seafloor models.",
      points: [
        { icon: "🧹", title: "Line-by-Line Data Cleaning (NaviEdit)", details: "Each survey line is individually reviewed and cleaned using NaviEdit. Spikes, outliers, and noise caused by motion instability, acoustic interference, or water column anomalies are identified and removed. Beam angle artifacts and edge-of-swath distortions are carefully filtered.", tags: ["NaviEdit", "Data Cleaning", "Quality Control", "IHO S-44"] },
        { icon: "⚙️", title: "Patch Test & Sensor Parameter Integration", details: "Calibration results obtained from the patch test are applied during processing. Roll, pitch, yaw, and latency corrections are inserted into the dataset. Sensor offset measurements between GNSS antenna, IMU, and transducer are verified to maintain geometric consistency.", tags: ["Patch Test", "Sensor Offsets", "Calibration", "Alignment Correction"] },
        { icon: "🌊", title: "Tidal Correction & Vertical Referencing", details: "Tidal observations recorded during acquisition are applied to each sounding according to its timestamp. Depth values are reduced to the designated vertical datum using observed water level data. SVP corrections are also applied to compensate for acoustic beam refraction.", tags: ["Tidal Reduction", "SVP Correction", "TVU Control", "Vertical Datum"] },
        { icon: "🗺️", title: "DEM Generation & Surface Modeling", details: "Validated soundings are gridded to generate a Digital Elevation Model (DEM) of the seafloor. Grid resolution is selected based on depth and sounding density to preserve fine-scale wreck morphology. The DEM serves as the primary surface for bathymetric contour extraction and slope analysis.", tags: ["DEM", "Gridding", "Bathymetry Surface", "Seafloor Modeling"] },
        { icon: "🔷", title: "3D Visualization with NaviModel", details: "The finalized bathymetric surface is imported into NaviModel to generate a 3D visualization of the shipwreck structure. Shaded relief rendering, vertical exaggeration, and perspective views are applied to enhance structural interpretation and support marine archaeological documentation.", tags: ["NaviModel", "3D Reconstruction", "Shipwreck Visualization", "Marine Archaeology"] }
      ],
      conclusion: "Through systematic cleaning, calibration integration, tidal correction, and surface modeling, the processing stage converts raw acoustic measurements into a high-resolution DEM and immersive 3D representation of the submerged shipwreck."
    }),
    link: "#processing",
    image: "/images/world-class-speakers/dataprocess.webp",
  },
];

// ---------------------------------------------------------------------------
// SECTION TITLE
// ---------------------------------------------------------------------------
const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center mb-10 md:mb-16">
    <h2
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark dark:text-white max-w-2xl mx-auto"
      data-aos="fade-up" data-aos-duration="1000"
    >
      {title}
    </h2>
    <p
      className="mt-3 md:mt-4 text-sm md:text-base lg:text-xl text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto font-normal"
      data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000"
    >
      {description}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// MODAL — dirender via Portal ke document.body agar selalu center di viewport
// ---------------------------------------------------------------------------
const Modal = ({
  step,
  onClose,
}: {
  step: StepItem;
  onClose: () => void;
}) => {
  // Lock body scroll saat modal terbuka
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const content = (() => {
    try { return JSON.parse(step.fullDesc) as FullDescContent; }
    catch { return null; }
  })();

  return createPortal(
    /*
      ✅ Portal ke document.body:
      - position: fixed + inset-0 sekarang relatif ke viewport window, bukan elemen parent
      - Modal selalu tepat di tengah layar apapun konteks scroll/stacking yang ada
    */
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        relative bg-white dark:bg-darkmode
        w-full sm:max-w-2xl lg:max-w-3xl
        rounded-t-[2rem] sm:rounded-3xl
        shadow-2xl overflow-hidden
        border border-white/10
        flex flex-col
        max-h-[92dvh] sm:max-h-[88dvh]
        mx-0 sm:mx-4
      ">

        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 md:p-6 lg:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-start gap-4 shrink-0">
          <div>
            <span className="text-primary font-bold text-[10px] md:text-xs tracking-widest uppercase">
              Stage {step.id}
            </span>
            <h2
              id="modal-title"
              className="text-lg md:text-2xl lg:text-3xl font-bold text-dark dark:text-white mt-0.5 md:mt-1 leading-tight"
            >
              {step.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 text-SlateBlueText hover:text-primary transition-colors bg-gray-100 dark:bg-white/5 rounded-full flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-4 py-5 md:p-6 lg:p-10 overflow-y-auto flex-1 overscroll-contain">
          {content ? (
            <div className="space-y-5 md:space-y-8">
              {content.intro && (
                <p className="text-sm md:text-base lg:text-lg font-medium text-dark dark:text-white leading-relaxed">
                  {content.intro}
                </p>
              )}

              <div className="flex flex-col gap-4 md:gap-6">
                {content.points.map((point, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gray-50 dark:bg-white/5 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-lg"
                  >
                    {/* Floating number */}
                    <div className="absolute -top-3 -left-3 w-7 h-7 md:w-9 md:h-9 bg-primary text-white rounded-lg flex items-center justify-center font-bold shadow-lg text-xs md:text-sm rotate-[-10deg] group-hover:rotate-0 transition-transform">
                      {idx + 1}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-5">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 dark:bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl">
                          {point.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-lg lg:text-xl font-bold text-dark dark:text-white mb-1.5 md:mb-2 leading-snug">
                          {point.title}
                        </h4>
                        <p className="text-xs md:text-sm lg:text-base text-SlateBlueText dark:text-opacity-80 leading-relaxed text-justify mb-2 md:mb-4">
                          {point.details}
                        </p>
                        {point.tags && (
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {point.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 md:px-3 py-0.5 md:py-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-primary text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-wider"
                              >
                                # {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {content.conclusion && (
                <div className="p-3 md:p-5 bg-primary/5 border-l-4 border-primary rounded-r-xl md:rounded-r-2xl italic text-xs md:text-sm lg:text-base text-SlateBlueText dark:text-opacity-90">
                  "{content.conclusion}"
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-SlateBlueText dark:text-opacity-90 leading-relaxed text-justify whitespace-pre-line">
              {step.fullDesc}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 md:px-8 py-2 md:py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm md:text-base"
          >
            Close Exploration
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const WorkflowSteps: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<StepItem | null>(null);

  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-darkmode py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <SectionTitle
          title="Turning Ocean Data into Underwater Discovery."
          description="An integrated hydrographic survey process that captures, corrects, and reconstructs the seafloor to uncover shipwreck features around Pramuka Island."
        />

        <div className="relative mt-12 md:mt-20">
          {/* Timeline line — desktop only */}
          <div className="hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2 h-full z-0">
            <div className="w-[1px] h-full bg-primary/20 dark:bg-white/10" />
          </div>

          <div className="space-y-12 md:space-y-24 lg:space-y-40">
            {steps.map((step, index) => {
              const isEven = index % 2 !== 0;
              return (
                <div
                  key={step.id}
                  className="grid lg:grid-cols-12 grid-cols-1 items-center gap-6 md:gap-10 lg:gap-30"
                >
                  {/* Image */}
                  <div
                    className={`lg:col-span-6 ${isEven ? 'lg:order-last lg:pl-20' : 'lg:pr-20'}`}
                    data-aos={isEven ? "fade-left" : "fade-right"} data-aos-duration="1000"
                  >
                    <div className="relative p-1.5 md:p-2 bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl md:rounded-2xl shadow-xl">
                      <img
                        src={step.image} alt={step.title}
                        className="rounded-lg md:rounded-xl w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  {/* Dot — desktop only */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 justify-center items-center z-10">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-darkmode">
                      {step.id}
                    </div>
                  </div>

                  {/* Text */}
                  <div
                    className={`lg:col-span-6 flex flex-col gap-3 md:gap-4 
                      ${isEven ? 'lg:pr-16 lg:pl-0' : 'lg:pl-16 lg:pr-0'} 
                      text-left justify-center`}
                    data-aos={isEven ? "fade-right" : "fade-left"} data-aos-duration="1000"
                  >
                    {/* Step badge — mobile only */}
                    <div className="flex items-center gap-2 lg:hidden">
                      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow">
                        {step.id}
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-widest">Step {step.id}</span>
                    </div>

                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-dark dark:text-white">
                      {step.title}
                    </h3>

                    <p className="text-sm md:text-base lg:text-lg text-SlateBlueText dark:text-opacity-80 font-normal leading-relaxed text-justify">
                      {step.description}
                    </p>

                    <button
                      onClick={() => setSelectedStep(step)}
                      className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all w-fit text-sm md:text-base mt-1"
                    >
                      Explore details
                      <ExternalLinkIcon size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal dirender via Portal — selalu center di viewport */}
      {selectedStep && (
        <Modal step={selectedStep} onClose={() => setSelectedStep(null)} />
      )}
    </section>
  );
};

export default WorkflowSteps;