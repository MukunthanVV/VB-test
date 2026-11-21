import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import megaFooterBg from '../assets/new_mega_footer_bg.webp';
import mobileMegaFooterBg from '../assets/mobile-mega-footer.webp';

const MegaFooter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Parallax subtle scale for the background image
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <>
      <section ref={containerRef} className="relative w-full h-[100vh] bg-background overflow-hidden flex flex-col items-center justify-center z-0 border-t border-outline">
      
      {/* Layer 0: Text Overlay (Mobile Only) - Hidden because the image has this baked in */}
      {/*
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden md:hidden">
        <h2 className="font-display-xl text-[140px] leading-[0.8] text-[#F3C19D] opacity-60 uppercase flex w-full justify-between px-4 whitespace-nowrap">
          <span className="relative left-[-10%]">VICKY</span>
          <span className="relative right-0">BOND</span>
        </h2>
      </div>
      */}

      {/* Layer 1 & 3: Background Asset */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {/* The central asset */}
        <motion.div 
          style={{ scale, y }}
          className="relative w-full h-full md:h-[105%] md:-top-[5%]"
        >
          <picture className="w-full h-full block">
            <source media="(max-width: 767px)" srcSet={mobileMegaFooterBg} />
            <source media="(min-width: 768px)" srcSet={megaFooterBg} />
            <img 
              src={megaFooterBg} 
              alt="Mega Footer Background" 
              className="w-full h-full object-cover object-top md:object-center"
            />
          </picture>
        </motion.div>
      </div>



      {/* Layer 4: Corner Metadata */}
      <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 hidden lg:block">
        <p className="font-label-caps text-label-caps text-[#F3C19D] tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F3C19D] animate-pulse"></span>
          VB Associates
        </p>
      </div>

      <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 hidden lg:block">
        <p className="font-body-lg text-[#F3C19D] font-bold">
          Global Strategic Advisory
        </p>
        <p className="font-body-md text-[#F3C19D] max-w-[300px] mt-2 hidden lg:block">
          Architects of diversified excellence since 2019. 
          Building the future of infrastructure and real estate.
        </p>
      </div>
      

      </section>

      {/* Final Copyright Footer */}
      <footer className="w-full bg-[#0a0a0a] py-6 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 z-10">
        
        <p className="font-label-caps text-[11px] leading-[16px] tracking-[0.15em] font-medium text-[#888888] uppercase text-center md:text-left">
          © 2026 VB ASSOCIATES. All rights reserved.
        </p>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full md:w-auto">
          <p className="font-label-caps text-[10px] leading-[16px] tracking-[0.15em] font-medium text-[#888888] uppercase text-center whitespace-normal sm:whitespace-nowrap w-full md:w-auto border-t border-[#222] md:border-0 pt-4 md:pt-0">
            Designed & developed by <span className="text-[#F3C19D]">Acala Solutions</span>.
          </p>

          <div className="flex gap-6 items-center opacity-70">
            {/* Facebook */}
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#888888] hover:text-[#F3C19D] transition-colors" aria-label="Facebook">
              <svg viewBox="0 0 320 512" fill="currentColor" className="h-[14px] w-auto">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="https://wa.me/918678910444" target="_blank" rel="noopener noreferrer" className="text-[#888888] hover:text-[#F3C19D] transition-colors" aria-label="WhatsApp">
              <svg viewBox="0 0 448 512" fill="currentColor" className="h-[18px] w-auto">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/_vickybond_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-[#888888] hover:text-[#F3C19D] transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 448 512" fill="currentColor" className="h-[18px] w-auto">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MegaFooter;
