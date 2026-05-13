"use client";

import React, { useState } from "react";
import { ExternalLinkIcon, X } from "lucide-react";

interface StepItem {
  id: number;
  title: string;
  description: string; // Deskripsi singkat di halaman utama
  fullDesc: string;  // Deskripsi lengkap di dalam pop-up
  link: string;
  image: string;
}

interface FullDescContent {
  intro?: string;
  points: {
    icon: string; // Bisa emoji atau nama Lucide icon
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
  fullDesc: JSON.stringify({ // Gunakan JSON.stringify untuk menyimpan objek di string
    intro: "Line survey planning is structured in three progressive stages to ensure hydrographic accuracy and high-resolution shipwreck documentation.",
    points: [
      {
        icon: "✨", // Emoji atau bisa juga Lucide icon string
        title: "Stage 1: Patch Test Calibration",
        details: "Dedicated lines are designed for patch test calibration. These lines are arranged in reciprocal and crossing patterns over identifiable seabed features to resolve systematic biases in roll, pitch, yaw, and latency between sensors. Proper patch test planning ensures angular alignment, timing synchronization, and compliance with IHO S-44 calibration requirements before full acquisition begins.",
        tags: ["IHO S-44", "Sensor Calibration"]
      },
      {
        icon: "🌊",
        title: "Stage 2: General Coverage Lines",
        details: "General coverage lines are planned for the broader shipwreck area. Line spacing is calculated based on water depth and expected swath width to achieve sufficient overlap and full seabed coverage. Survey order specifications follow IHO S-44 standards to maintain controlled Total Horizontal Uncertainty (THU) and Total Vertical Uncertainty (TVU). This stage confirms wreck presence, maps surrounding morphology, and identifies debris distribution or sediment anomalies.",
        tags: ["Seabed Mapping", "IHO S-44", "THU/TVU"]
      },
      {
        icon: "🔎",
        title: "Stage 3: Detailed Feature Documentation",
        details: "The survey design is refined for detailed feature documentation of the shipwreck itself. Moving beyond standard IHO coverage, the configuration adopts a feature-based approach inspired by Westley (2019), modifying the line pattern to maximize 3D reconstruction quality. The survey integrates parallel lines for consistent coverage, perpendicular lines to strengthen geometric definition of vertical structures, and oblique lines to minimize acoustic shadowing and improve structural perspective. This multi-directional configuration enhances point cloud density, improves hull curvature representation, and supports high-resolution 3D visualization of the submerged structure.",
        tags: ["3D Reconstruction", "Marine Archaeology", "Westley (2019)"]
      }
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
    intro: "Multibeam data acquisition is conducted under IHO S-44 Special Order requirements to ensure high positional accuracy, controlled uncertainty, and complete seabed coverage for shipwreck documentation in Panggang District, Pramuka Island.",
    points: [
      {
        icon: "📍",
        title: "Positioning System & Horizontal Accuracy",
        details: "Positioning is achieved using RT-PPP and RTK GNSS methodologies. RT-PPP provides horizontal accuracy within 5–15 cm, while RTK achieves 1–5 cm accuracy within a 10 km baseline. Horizontal uncertainty (THU) is controlled within 2 meters as specified under IHO S-44 standards. Continuous positioning monitoring ensures reliable georeferencing of all multibeam soundings.",
        tags: ["RTK", "RT-PPP", "THU Control", "IHO S-44"]
      },
      {
        icon: "📏",
        title: "Vertical Uncertainty & Depth Control",
        details: "Vertical accuracy is managed according to IHO S-44 Special Order Total Vertical Uncertainty (TVU) formula: TVU = √(a² + (b × d)²), where a = 0.25 m and b = 0.0075. Sound Velocity Profile (SVP) measurements and tidal observations collected on the survey day are applied to correct acoustic refraction and water level variations. This ensures depth measurements remain within allowable vertical tolerance limits.",
        tags: ["TVU", "SVP Correction", "Tidal Reduction", "Special Order"]
      },
      {
        icon: "🌊",
        title: "Full Seabed Coverage Requirement",
        details: "The survey ensures 100% seabed coverage as required under Special Order classification. Swath width is dynamically adjusted according to water depth to maintain overlap and avoid data gaps. Survey speed is optimized to preserve sounding density and reduce motion-induced noise.",
        tags: ["100% Coverage", "Sounding Density", "Special Order"]
      },
      {
        icon: "📐",
        title: "Swath Angle & Feature Resolution",
        details: "Swath angle configuration follows geometric considerations expressed as AS = 2 × tan⁻¹ (WW / WD), where AS represents angular spread, WW is swath width, and WD is water depth. For detailed shipwreck feature detection, survey lines are modified into parallel, perpendicular, and oblique orientations. This multi-directional acquisition enhances point cloud density, reduces acoustic shadowing, and improves 3D structural definition of the wreck.",
        tags: ["Swath Geometry", "Feature Survey", "Westley (2019)", "3D Visualization"]
      }
    ],
    conclusion: "By integrating precise GNSS positioning, strict uncertainty control, full seabed coverage, and feature-oriented swath configuration, the multibeam acquisition stage produces high-quality bathymetric datasets suitable for detailed 3D shipwreck reconstruction and marine archaeological interpretation."
  }),
  link: "#acquisition",
  image: "/images/world-class-speakers/acquisition.jpg",
},
{
  id: 3,
  title: "Data Processing & 3D Visualization",
  description: "Raw multibeam data is processed through tidal correction, sound velocity correction, motion compensation, and outlier filtering. The cleaned dataset is used to generate Digital Terrain Models (DTM), bathymetric grids, and detailed seafloor morphology maps. Final outputs include high-resolution shipwreck detection and 3D visualization models representing the submerged structure around Pramuka Island.",
  fullDesc: JSON.stringify({
    intro: "Post-processing transforms raw multibeam soundings into accurate and interpretable seafloor models. This stage ensures data quality control, uncertainty compliance, and high-resolution 3D reconstruction of the shipwreck site in Panggang District, Pramuka Island.",
    points: [
      {
        icon: "🧹",
        title: "Line-by-Line Data Cleaning (NaviEdit)",
        details: "Each survey line is individually reviewed and cleaned using NaviEdit. Spikes, outliers, and noise caused by motion instability, acoustic interference, or water column anomalies are identified and removed. Beam angle artifacts and edge-of-swath distortions are carefully filtered to maintain consistent sounding density. This manual and semi-automatic cleaning process ensures that each line meets IHO S-44 quality control standards before surface generation.",
        tags: ["NaviEdit", "Data Cleaning", "Quality Control", "IHO S-44"]
      },
      {
        icon: "⚙️",
        title: "Patch Test & Sensor Parameter Integration",
        details: "Calibration results obtained from the patch test are applied during processing. Roll, pitch, yaw, and latency corrections are inserted into the dataset to eliminate systematic angular and timing errors. Sensor offset measurements between GNSS antenna, IMU, and transducer are verified to maintain geometric consistency. This correction phase ensures proper alignment of overlapping survey lines and minimizes positional bias.",
        tags: ["Patch Test", "Sensor Offsets", "Calibration", "Alignment Correction"]
      },
      {
        icon: "🌊",
        title: "Tidal Correction & Vertical Referencing",
        details: "Tidal observations recorded during acquisition are applied to each sounding according to its timestamp. Depth values are reduced to the designated vertical datum using observed water level data. Sound Velocity Profile (SVP) corrections are also applied to compensate for acoustic beam refraction. These corrections ensure compliance with IHO S-44 Total Vertical Uncertainty (TVU) requirements.",
        tags: ["Tidal Reduction", "SVP Correction", "TVU Control", "Vertical Datum"]
      },
      {
        icon: "🗺️",
        title: "DEM Generation & Surface Modeling",
        details: "After cleaning and corrections, validated soundings are gridded to generate a Digital Elevation Model (DEM) of the seafloor. Grid resolution is selected based on depth and sounding density to preserve fine-scale wreck morphology. The DEM serves as the primary surface for bathymetric contour extraction, shaded relief mapping, and slope analysis.",
        tags: ["DEM", "Gridding", "Bathymetry Surface", "Seafloor Modeling"]
      },
      {
        icon: "🔷",
        title: "3D Visualization with NaviModel",
        details: "The finalized bathymetric surface is imported into NaviModel to generate a 3D visualization of the shipwreck structure. Shaded relief rendering, vertical exaggeration, and perspective views are applied to enhance structural interpretation. This visualization allows identification of hull curvature, structural collapse patterns, sediment interaction, and debris distribution. The resulting 3D model supports detailed morphological analysis and marine archaeological documentation.",
        tags: ["NaviModel", "3D Reconstruction", "Shipwreck Visualization", "Marine Archaeology"]
      }
    ],
    conclusion: "Through systematic cleaning, calibration integration, tidal correction, and surface modeling, the processing stage converts raw acoustic measurements into a high-resolution Digital Elevation Model and immersive 3D representation of the submerged shipwreck. This ensures both hydrographic reliability and detailed feature interpretation."
  }),
  link: "#processing",
  image: "/images/world-class-speakers/dataprocess.webp",
},
{
  id: 4,
  title: "Instrument Installation Guideline",
  description: "A technical guideline is developed to standardize multibeam instrument installation for future surveys. This includes sensor alignment procedures, offset measurement documentation, calibration steps (patch test), and mounting configuration recommendations. The guideline ensures repeatability, accuracy, and compliance with hydrographic survey standards in shallow coastal environments.",
  fullDesc: JSON.stringify({
    intro: "A structured installation guideline is developed to ensure consistent system performance, minimize systematic errors, and maintain compliance with IHO S-44 hydrographic survey standards during multibeam operations in Panggang District, Pramuka Island.",
    points: [
      {
        icon: "🛠️",
        title: "Sensor Mounting Configuration",
        details: "The multibeam transducer, GNSS antenna, and Inertial Measurement Unit (IMU) must be securely mounted on a rigid structure to minimize vibration and mechanical movement. Alignment between sensors must be verified to ensure that the reference frames of positioning, motion, and depth measurement systems remain geometrically consistent. Proper mounting reduces angular bias and improves data stability in shallow coastal environments.",
        tags: ["Mechanical Stability", "Sensor Alignment", "Mounting Structure"]
      },
      {
        icon: "📏",
        title: "Offset Measurement & Documentation",
        details: "Precise offset measurements between the GNSS antenna, IMU, and multibeam transducer are recorded in three dimensions (X, Y, Z). All measurements must reference a clearly defined vessel coordinate system. Accurate offset documentation is critical to control Total Horizontal Uncertainty (THU) and Total Vertical Uncertainty (TVU) under IHO S-44 standards. Measurement logs must be archived for reproducibility and future validation.",
        tags: ["Offset Survey", "THU Control", "TVU Control", "Vessel Reference System"]
      },
      {
        icon: "⚙️",
        title: "Patch Test Calibration Requirement",
        details: "Following installation, a patch test must be conducted to resolve systematic biases in roll, pitch, yaw, and latency. Calibration lines are designed to quantify angular misalignment and timing delays between sensors. The resulting correction parameters are applied during data processing to eliminate systematic depth and positional errors. Patch test verification ensures compliance with IHO S-44 calibration and uncertainty limits.",
        tags: ["Patch Test", "System Calibration", "IHO S-44 Compliance"]
      },
      {
        icon: "📋",
        title: "Operational Verification & Quality Control",
        details: "Before full acquisition, system performance checks are performed, including GNSS accuracy validation (RTK/RT-PPP status), motion sensor diagnostics, and sound velocity sensor verification. Swath angle configuration and ping rate settings are adjusted according to survey depth and feature requirements. Continuous monitoring during acquisition ensures stable positioning and depth integrity.",
        tags: ["System Check", "GNSS Validation", "Swath Optimization", "Operational QC"]
      },
      {
        icon: "📚",
        title: "Standardization & Repeatability",
        details: "All installation configurations, calibration results, and verification procedures are documented as part of a standardized hydrographic workflow. This guideline ensures that future surveys maintain consistency in positioning accuracy, uncertainty control, and feature resolution. Standardization enhances data comparability across survey campaigns and supports long-term shipwreck monitoring.",
        tags: ["Documentation", "Repeatability", "Hydrographic Standardization"]
      }
    ],
    conclusion: "By formalizing installation procedures, calibration protocols, and quality control checks, this guideline minimizes systematic uncertainty and ensures reliable multibeam performance. The framework supports accurate shipwreck mapping and long-term marine archaeological documentation under internationally recognized hydrographic standards."
  }),
  link: "#guideline",
  image: "/images/world-class-speakers/guideline.webp",
}
];

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center mb-16">
    <h2 
      className="text-3xl lg:text-4xl font-bold text-dark dark:text-white max-w-2xl mx-auto"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      {title}
    </h2>
    <p 
      className="mt-4 text-xl text-SlateBlueText dark:text-opacity-80 max-w-2xl mx-auto font-normal"
      data-aos="fade-up"
      data-aos-delay="200"
      data-aos-duration="1000"
    >
      {description}
    </p>
  </div>
);

const WorkflowSteps: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<StepItem | null>(null);

  const openModal = (step: StepItem) => setSelectedStep(step);
  const closeModal = () => setSelectedStep(null);
  return (
    <section className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-darkmode py-24 lg:py-32">
      <div className="container">
        <SectionTitle
          title="Turning Ocean Data into Underwater Discovery."
          description="An integrated hydrographic survey process that captures, corrects, and reconstructs the seafloor to uncover shipwreck features around Pramuka Island."
        />

        <div className="relative mt-20">
          {/* Timeline Line (Hanya muncul di Desktop) */}
          <div className="hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2 h-full z-0">
            <div className="w-[1px] h-full bg-primary/20 dark:bg-white/10" />
          </div>

          <div className="space-y-24 lg:space-y-40">
            {steps.map((step, index) => {
              const isEven = index % 2 !== 0;
              return (
                <div 
                  key={step.id} 
                  className={`grid lg:grid-cols-12 grid-cols-1 items-center gap-10 lg:gap-30`}
                >
                  {/* Bagian Gambar */}
                  <div 
                    className={`lg:col-span-6 ${isEven ? 'lg:order-last lg:pl-20' : 'lg:pr-20'}`}
                    data-aos={isEven ? "fade-left" : "fade-right"}
                    data-aos-duration="1000"
                  >
                    <div className="relative p-2 bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl shadow-xl">
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        className="rounded-xl w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  {/* Bagian Nomor Tengah (Dot) */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 justify-center items-center z-10">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-darkmode">
                      {step.id}
                    </div>
                  </div>

                  {/* Bagian Teks */}
                  <div 
                    className={`lg:col-span-6 flex flex-col gap-4 
                      ${isEven ? 'lg:pr-16 lg:pl-0' : 'lg:pl-16 lg:pr-0'} 
                      text-left justify-center`}
                    data-aos={isEven ? "fade-right" : "fade-left"}
                    data-aos-duration="1000"
                  >
                    <h3 className="text-2xl lg:text-3xl font-bold text-dark dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-lg text-SlateBlueText dark:text-opacity-80 font-normal leading-relaxed text-justify">
                      {step.description}
                    </p>
                    < 
                      button
                      onClick={() => openModal(step)}
                      className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all w-fit"
                    >
                      Explore details
                      <ExternalLinkIcon size={20} className="transition-transform group-hover:scale-110" />
                      </button>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- MODAL POP-UP --- */}
      {selectedStep && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeModal} />
          
          {/* Modal Content - Mengatur Max Height agar tidak melebihi layar */}
          <div 
            className="relative bg-white dark:bg-darkmode w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]" 
            data-aos="zoom-in" 
            data-aos-duration="300"
          >
            {/* Header Modal - Tetap Diam (Sticky) */}
            <div className="p-6 lg:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-darkmode">
              <div>
                <span className="text-primary font-bold text-xs tracking-widest uppercase">Stage {selectedStep.id}</span>
                <h2 className="text-2xl lg:text-3xl font-bold text-dark dark:text-white mt-1">{selectedStep.title}</h2>
              </div>
              <button onClick={closeModal} className="p-2 text-SlateBlueText hover:text-primary transition-colors bg-gray-100 dark:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Area - Tempat Deskripsi Panjang */}
            <div className="p-6 lg:p-10 overflow-y-auto custom-scrollbar flex-1">
              {/* Gambar di dalam Modal 
              <div className="w-full h-auto rounded-2xl mb-8 overflow-hidden shadow-lg">
                <img 
                  src={selectedStep.image} 
                  alt={selectedStep.title} 
                  className="w-full h-full object-cover" 
                />
              </div> */}

              {/* --- Area Full Description 1 Kolom 3 Baris --- */}
              {(() => {
                try {
                  const content: FullDescContent = JSON.parse(selectedStep.fullDesc);

                  return (
                    <div className="space-y-10">
                      {content.intro && (
                        <p className="text-xl font-medium text-dark dark:text-white mb-6 leading-relaxed">
                          {content.intro}
                        </p>
                      )}

                      {/* Stack Vertical (1 Kolom) */}
                      <div className="flex flex-col gap-8">
                        {content.points.map((point, idx) => (
                          <div 
                            key={idx} 
                            className="group relative bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-primary/5"
                          >
                            {/* Nomor Urut Mengambang (Ala Gen Z) */}
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-lg rotate-[-10deg] group-hover:rotate-0 transition-transform">
                              {idx + 1}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Icon Section */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-4xl">
                                  {point.icon}
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold text-dark dark:text-white mb-3">
                                  {point.title}
                                </h4>
                                <p className="text-lg text-SlateBlueText dark:text-opacity-80 leading-relaxed text-justify mb-5">
                                  {point.details}
                                </p>

                                {/* Tags / Pills */}
                                {point.tags && (
                                  <div className="flex flex-wrap gap-2">
                                    {point.tags.map((tag, tIdx) => (
                                      <span 
                                        key={tIdx} 
                                        className="px-4 py-1.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-primary dark:text-primary-light text-xs font-bold rounded-full uppercase tracking-wider"
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
                        <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-2xl italic text-lg text-SlateBlueText dark:text-opacity-90">
                          "{content.conclusion}"
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return (
                    <p className="text-lg text-SlateBlueText dark:text-opacity-90 leading-relaxed text-justify whitespace-pre-line">
                      {selectedStep.fullDesc}
                    </p>
                  );
                }
              })()}
              {/* --- Akhir Area Full Description yang Diperbarui --- */}
            </div>

            {/* Footer Modal - Tetap Diam (Sticky) */}
            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-end">
              <button 
                onClick={closeModal} 
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Close Exploration
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WorkflowSteps;