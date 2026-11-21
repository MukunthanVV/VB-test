import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage from './ResponsiveImage';

const fallbackTestimonials = [
  {
    id: 't1',
    quote: "Success is built on the courage to dream, the discipline to act, and the commitment to keep moving forward.",
    name: "Suriya",
    title: "ENTREPRENEUR • BUSINESSMAN",
    division: "VB ASSOCIATES",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80"
  }
];

const testimonialFields: FieldConfig[] = [
  { name: 'quote', label: 'Quote', type: 'textarea', required: true },
  { name: 'name', label: 'Person Name', type: 'text', required: true },
  { name: 'title', label: 'Job Title', type: 'text' },
  { name: 'division', label: 'Division / Company', type: 'text' },
  { name: 'image', label: 'Person Images (Gallery)', type: 'image-gallery' },
];

const TestimonialsSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cache_testimonials');
      return cached ? JSON.parse(cached) : fallbackTestimonials;
    } catch {
      return fallbackTestimonials;
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const services = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      
      const activeData = services.filter(d => !d.deleted);
      const deletedIds = new Set(services.filter(d => d.deleted).map(d => d.id));
      
      const activeFallbacks = fallbackTestimonials.filter(fb => !deletedIds.has(fb.id));

      const mergedDisplayData = activeFallbacks.map(fb => {
        const real = activeData.find(s => s.id === fb.id);
        return real || fb;
      });
      const extra = activeData.filter(s => !fallbackTestimonials.find(fb => fb.id === s.id));
      const finalTestimonials = [...mergedDisplayData, ...extra];
      setTestimonials(finalTestimonials);
      try { localStorage.setItem('cache_testimonials', JSON.stringify(finalTestimonials)); } catch {}
      setIsLoaded(true);
      setCurrentIndex(0);
    });
    return () => unsub();
  }, []);

  const displayData = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const currentItem = displayData[currentIndex];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === displayData.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayData.length - 1 : prev - 1));
  };

  const handleDragEnd = (_: any, { offset }: any) => {
    const swipe = offset.x;
    if (swipe < -50) nextTestimonial();
    else if (swipe > 50) prevTestimonial();
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this testimonial?')) {
      await setDoc(doc(db, 'testimonials', id), { deleted: true });
    }
  };

  if (!currentItem) return null;

  const images = currentItem.image ? (Array.isArray(currentItem.image) ? currentItem.image : [currentItem.image]) : [];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Reset image index when testimonial changes
  useEffect(() => {
    setCurrentImgIndex(0);
  }, [currentIndex]);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };
  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  return (
    <section id="testimonials" className={`relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 xl:px-margin-desktop bg-[#1a1a1a] text-white overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 max-w-container-max mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-20 gap-6 relative"
        >
          <div>
            <span className="font-label-caps text-xs sm:text-label-caps text-[#C5A059] mb-4 block">CLIENT VOICES</span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-headline-lg-mobile lg:text-headline-lg uppercase text-left break-words">TRUSTED <span className="text-white block md:inline">WORLDWIDE</span></h2>
          </div>
          <div className="flex gap-4 items-center">
            {isAdmin && (
              <button onClick={handleAdd} className="text-xs sm:text-sm bg-primary text-on-primary px-3 sm:px-4 py-2 rounded-full hover:opacity-90 font-bold mr-2 sm:mr-4">
                + Add Testimonial
              </button>
            )}
             <button onClick={prevTestimonial} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-20" aria-label="Previous testimonial">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button onClick={nextTestimonial} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-20" aria-label="Next testimonial">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </motion.div>

        <div className="relative min-h-[350px] sm:min-h-[400px] flex items-stretch">
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
              className="w-full relative cursor-grab active:cursor-grabbing group"
            >
              {isAdmin && (
                <div className="absolute top-0 right-0 z-30">
                  <InlineEditControls 
                    onEdit={() => handleEdit(currentItem)} 
                    onDelete={currentItem.id ? () => handleDelete(currentItem.id) : undefined} 
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 h-full items-stretch">
                <div className="flex flex-col justify-center relative py-6 sm:py-8 pointer-events-none">
                  <span className="material-symbols-outlined text-5xl sm:text-6xl md:text-8xl text-white opacity-10 absolute -top-4 -left-4 md:-top-8 md:-left-8 -z-10 select-none">format_quote</span>
                  <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.3] tracking-tight mb-8 sm:mb-10 break-words">
                    "{currentItem.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 sm:gap-6 mt-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#C5A059] flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-xl sm:text-2xl">{currentItem.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg md:text-xl uppercase break-words">{currentItem.name}</h4>
                      <p className="text-[#C5A059] text-xs sm:text-sm font-label-caps uppercase tracking-wider">{currentItem.title} • {currentItem.division}</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-end justify-center md:justify-end md:pl-12 group/imgslider">
                  {images.length > 0 && (
                    <div className="relative w-full max-w-md h-[280px] sm:h-[350px] md:h-[450px]">
                      <AnimatePresence initial={false}>
                        <motion.div 
                          key={currentImgIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 w-full h-full flex items-end justify-center md:justify-end"
                        >
                          <ResponsiveImage 
                            src={images[currentImgIndex]} 
                            alt={currentItem.name} 
                            className="max-h-full max-w-full object-contain object-bottom grayscale-[30%] hover:grayscale-0 transition-all duration-700 drop-shadow-2xl" 
                          />
                        </motion.div>
                      </AnimatePresence>
                      {images.length > 1 && (
                        <>
                          <div className="absolute top-1/2 -left-4 -right-4 flex justify-between -translate-y-1/2 z-20 opacity-0 group-hover/imgslider:opacity-100 transition-opacity duration-300">
                            <button onClick={prevImg} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors cursor-pointer">
                              <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button onClick={nextImg} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors cursor-pointer">
                              <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                          </div>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {images.map((_: any, idx: number) => (
                              <div key={idx} className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentImgIndex ? 'w-6 bg-[#C5A059]' : 'w-2 bg-white/40'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        collectionName="testimonials"
        docId={editingItem?.id}
        initialData={editingItem || {}}
        fields={testimonialFields}
      />
    </section>
  );
};

export default TestimonialsSection;
