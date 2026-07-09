import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "Working with VB Associates on our commercial development completely elevated the final outcome. Their attention to detail is unparalleled.",
    name: "James Harrington",
    title: "CEO, Harrington Holdings",
    division: "REAL ESTATE",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80"
  },
  {
    quote: "The engine performance upgrades exceeded our wildest expectations on the track. A true partner in high-performance engineering.",
    name: "Elena Rostova",
    title: "Team Principal, Apex Racing",
    division: "MOTORS",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
  },
  {
    quote: "From the initial infrastructure planning to execution, their team maintained impeccable safety and quality standards.",
    name: "Marcus Chen",
    title: "Director of Urban Planning",
    division: "CONSTRUCTIONS",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
  },
  {
    quote: "The event management team flawlessly executed our annual gala. Their professionalism and creative vision made it our most memorable event yet.",
    name: "Sophia Martinez",
    title: "VP of Communications, Global Tech",
    division: "EVENTS",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80"
  },
  {
    quote: "Purchasing a premium pre-owned vehicle through VB Auto Sales was a seamless, transparent, and truly luxurious experience.",
    name: "David Al-Sayed",
    title: "Private Collector",
    division: "USED CAR SALES",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
  }
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleDragEnd = (_: any, { offset }: any) => {
    const swipe = offset.x;
    if (swipe < -50) {
      nextTestimonial();
    } else if (swipe > 50) {
      prevTestimonial();
    }
  };

  return (
    <section id="testimonials" className="relative py-20 md:py-24 px-margin-mobile md:px-margin-desktop bg-[#1a1a1a] text-white overflow-hidden">
      <div className="relative z-10 max-w-container-max mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-6"
        >
          <div>
            <span className="font-label-caps text-label-caps text-[#C5A059] mb-4 block">CLIENT VOICES</span>
            <h2 className="font-headline-lg text-4xl md:text-headline-lg-mobile lg:text-headline-lg uppercase text-left">TRUSTED <span className="text-white block md:inline">WORLDWIDE</span></h2>
          </div>
          <div className="flex gap-4">
             <button onClick={prevTestimonial} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-20">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button onClick={nextTestimonial} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-20">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </motion.div>

        <div className="relative min-h-[400px] flex items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="w-full relative cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 h-full items-stretch">
                <div className="flex flex-col justify-center relative py-8 pointer-events-none">
                  <span className="material-symbols-outlined text-6xl md:text-8xl text-white opacity-10 absolute -top-4 -left-4 md:-top-8 md:-left-8 -z-10">format_quote</span>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.3] tracking-tight mb-10">
                    "{testimonials[currentIndex].quote}"
                  </p>
                  
                  <div className="flex items-center gap-6 mt-auto">
                    <div className="w-14 h-14 rounded-full bg-[#C5A059] flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-2xl">{testimonials[currentIndex].name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg md:text-xl uppercase">{testimonials[currentIndex].name}</h4>
                      <p className="text-[#C5A059] text-sm font-label-caps uppercase tracking-wider">{testimonials[currentIndex].title} • {testimonials[currentIndex].division}</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-end justify-center md:justify-end md:pl-12">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name} 
                    className="w-full max-w-md h-auto max-h-[450px] object-contain object-bottom grayscale-[30%] hover:grayscale-0 transition-all duration-700 drop-shadow-2xl" 
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
