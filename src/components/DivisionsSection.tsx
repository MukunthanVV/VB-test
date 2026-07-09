import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

import motor1 from '../assets/motor-1.png';
import motor2 from '../assets/motor-2.png';
import motor3 from '../assets/motor-3.png';
import motor4 from '../assets/motor-4.png';

const motorImages = [motor1, motor2, motor3, motor4];

const DivisionsSection: React.FC = () => {
  const [currentMotorImage, setCurrentMotorImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMotorImage((prev) => (prev === motorImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMotorImage((prev) => (prev === 0 ? motorImages.length - 1 : prev - 1));
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="services" className="relative py-24 md:py-section-gap px-margin-mobile md:px-margin-desktop bg-transparent w-full overflow-hidden">
      <div className="relative z-10 max-w-container-max mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6"
        >
          <h2 className="font-headline-lg text-4xl md:text-headline-lg-mobile lg:text-headline-lg uppercase text-on-surface text-left">OUR <span className="text-primary block md:inline">SPECIALIZATIONS</span></h2>
          <p className="font-label-caps text-label-caps text-on-surface-variant max-w-xs text-left md:text-right">DYNAMIC SYNERGY ACROSS HIGH-STAKES INDUSTRIES</p>
        </motion.div>
        
        <div className="flex flex-col gap-16 w-full">
          
          <div className="flex flex-col md:flex-row overflow-hidden rounded-[2rem] bg-[#988E8B] dark:bg-neutral-900 shadow-xl w-full">
            
            {/* Image Slider Container (40% Width) */}
            <motion.div 
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[40%] relative min-h-[300px] md:min-h-[600px] group flex-shrink-0"
            >
              <AnimatePresence initial={false}>
                <motion.img 
                  key={currentMotorImage}
                  src={motorImages[currentMotorImage]}
                  alt="VB Motors"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                />
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={prevImage} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={nextImage} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Slider Pagination Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                {motorImages.map((_, idx) => (
                  <div key={idx} className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentMotorImage ? 'w-8 bg-white' : 'w-2.5 bg-white/60'}`} />
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[60%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-16 text-[#1A1A1A] dark:text-white flex-shrink-0"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-label-caps text-label-caps opacity-60 text-[#1A1A1A] dark:text-white">01. PERFORMANCE</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">VB MOTORS</h3>
              
              <p className="text-lg md:text-[28px] lg:text-[32px] leading-[1.4] font-medium mb-12 md:mb-16 tracking-tight text-[#1A1A1A] dark:text-white">
                Engineering the future of automotive luxury and competitive performance sports. Nothing is built before precision is ensured.
              </p>
              
              <a 
                href="#/motors"
                className="group flex justify-between items-center w-full max-w-xs border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-4 px-6 text-sm font-semibold tracking-widest uppercase hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-[#988E8B] dark:hover:text-neutral-900 transition-colors duration-300"
              >
                ENTER DIVISION
                <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
              </a>
            </motion.div>
          </div>

          {/* Used Car Sales - Placeholder (Alternating Layout) */}
          <div className="flex flex-col md:flex-row-reverse overflow-hidden rounded-[2rem] bg-[#D7D1C9] dark:bg-neutral-800 shadow-xl w-full">
            
            <motion.div 
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[40%] relative min-h-[300px] md:min-h-[600px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 md:border-l border-outline flex-shrink-0"
            >
               <span className="material-symbols-outlined text-5xl text-[#1A1A1A]/40 dark:text-white/40">directions_car</span>
            </motion.div>

            <motion.div 
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[60%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-16 text-[#1A1A1A] dark:text-white flex-shrink-0"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-label-caps text-label-caps opacity-60 text-[#1A1A1A] dark:text-white">02. AUTO SALES</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">USED CAR SALES</h3>
              
              <p className="text-lg md:text-[28px] lg:text-[32px] leading-[1.4] font-medium mb-12 md:mb-16 tracking-tight text-[#1A1A1A] dark:text-white">
                Discover a curated selection of premium pre-owned vehicles. Uncompromising quality, rigorous inspection, and unmatched value.
              </p>
              
              <a 
                href="#/used-cars"
                className="group flex justify-between items-center w-full max-w-xs border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-4 px-6 text-sm font-semibold tracking-widest uppercase hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-[#D7D1C9] dark:hover:text-neutral-800 transition-colors duration-300"
              >
                ENTER DIVISION
                <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
              </a>
            </motion.div>
          </div>

          {/* VB Event Management - Placeholder */}
          <div className="flex flex-col md:flex-row overflow-hidden rounded-[2rem] bg-[#988E8B] dark:bg-neutral-900 shadow-xl w-full">
            
            <motion.div 
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[40%] relative min-h-[300px] md:min-h-[600px] bg-[#8F8A8B] dark:bg-neutral-800 flex items-center justify-center border-b md:border-b-0 md:border-r border-outline flex-shrink-0"
            >
               <span className="material-symbols-outlined text-5xl text-[#1A1A1A]/40 dark:text-white/40">celebration</span>
            </motion.div>

            <motion.div 
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[60%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-16 text-[#1A1A1A] dark:text-white flex-shrink-0"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-label-caps text-label-caps opacity-60 text-[#1A1A1A] dark:text-white">03. EVENTS</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">VB EVENT MANAGEMENT</h3>
              
              <p className="text-lg md:text-[28px] lg:text-[32px] leading-[1.4] font-medium mb-12 md:mb-16 tracking-tight text-[#1A1A1A] dark:text-white">
                Orchestrating unforgettable experiences. From corporate gatherings to grand celebrations, we deliver flawless event execution.
              </p>
              
              <a 
                href="#/events"
                className="group flex justify-between items-center w-full max-w-xs border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-4 px-6 text-sm font-semibold tracking-widest uppercase hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-[#988E8B] dark:hover:text-neutral-900 transition-colors duration-300"
              >
                ENTER DIVISION
                <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
              </a>
            </motion.div>
          </div>

          {/* VB Real Estate & Constructions */}
          <div className="flex flex-col md:flex-row-reverse overflow-hidden rounded-[2rem] bg-[#D7D1C9] dark:bg-neutral-800 shadow-xl w-full">
            
            <motion.div 
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[40%] relative min-h-[300px] md:min-h-[600px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 md:border-l border-outline flex-shrink-0"
            >
               <span className="material-symbols-outlined text-5xl text-[#1A1A1A]/40 dark:text-white/40">domain</span>
            </motion.div>

            <motion.div 
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="w-full md:w-[60%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-16 text-[#1A1A1A] dark:text-white flex-shrink-0"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-label-caps text-label-caps opacity-60 text-[#1A1A1A] dark:text-white">04. PORTFOLIO & INFRASTRUCTURE</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">VB REAL ESTATE & CONSTRUCTIONS</h3>
              
              <p className="text-lg md:text-[28px] lg:text-[32px] leading-[1.4] font-medium mb-12 md:mb-16 tracking-tight text-[#1A1A1A] dark:text-white">
                Curating a legacy of iconic properties globally. Delivering complex infrastructure with an unwavering commitment to safety and innovation.
              </p>
              
              <a 
                href="#/real-estate-constructions"
                className="group flex justify-between items-center w-full max-w-xs border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-4 px-6 text-sm font-semibold tracking-widest uppercase hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-[#D7D1C9] dark:hover:text-neutral-800 transition-colors duration-300"
              >
                ENTER DIVISION
                <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DivisionsSection;
