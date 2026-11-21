import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage from './ResponsiveImage';

const fallbackData = {
  id: 'disciplines_main',
  subtitle: 'THE DNA',
  title: 'HOW WE WORK',
  description: 'These are the principles that guide VB Associates every day. They shape how we work, how we make decisions, and how we bring every project to life.',
  image: [
    'https://res.cloudinary.com/dgssrfsli/image/upload/v1784734012/hi7ogcnmwgs2oo0ekaxc.png'
  ],
  trait1_title: 'ARCHITECTURAL INTEGRITY ',
  trait1_desc: 'For us, integrity begins with doing things right. We pay attention to every detail, choose quality over shortcuts, and build spaces we can be proud of for years to come.',
  trait2_title: 'DECISIVE LEADERSHIP',
  trait2_desc: 'Agility meets absolute precision. We operate with a clear chain of command and a strategic mandate, allowing our subsidiaries to move faster than the competition.',
  trait3_title: 'SYNERGISTIC SCALE ',
  trait3_desc: 'When different strengths come together, they create something greater. We bring knowledge and experience from across our ventures to drive growth and innovation.',
};

const disciplinesFields: FieldConfig[] = [
  { name: 'subtitle', label: 'Subtitle', type: 'text' },
  { name: 'title', label: 'Main Title', type: 'text', required: true },
  { name: 'description', label: 'Main Description', type: 'textarea' },
  { name: 'image', label: 'Section Images (Gallery)', type: 'image-gallery' },
  { name: 'trait1_title', label: 'Trait 1 Title', type: 'text' },
  { name: 'trait1_desc', label: 'Trait 1 Description', type: 'textarea' },
  { name: 'trait2_title', label: 'Trait 2 Title', type: 'text' },
  { name: 'trait2_desc', label: 'Trait 2 Description', type: 'textarea' },
  { name: 'trait3_title', label: 'Trait 3 Title', type: 'text' },
  { name: 'trait3_desc', label: 'Trait 3 Description', type: 'textarea' },
];

const DisciplinesSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('cache_disciplines');
      return cached ? JSON.parse(cached) : fallbackData;
    } catch {
      return fallbackData;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'disciplines', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const docData = { id: docSnap.id, ...docSnap.data() };
        setData(docData);
        try { localStorage.setItem('cache_disciplines', JSON.stringify(docData)); } catch {}
      }
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleEdit = () => {
    setModalOpen(true);
  };

  return (
    <section id="disciplines" className={`relative py-16 sm:py-24 md:py-section-gap px-4 sm:px-6 md:px-8 xl:px-margin-desktop bg-surface-variant border-t border-outline overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Architectural Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] select-none flex flex-col justify-center w-full z-0 max-w-full overflow-hidden">
        <span className="font-display-xl text-[120px] sm:text-[180px] lg:text-[350px] leading-[0.8] text-primary text-left pl-[5%]">HOW</span>
        <span className="font-display-xl text-[120px] sm:text-[180px] lg:text-[350px] leading-[0.8] text-primary text-right pr-[5%]">WE</span>
        <span className="font-display-xl text-[120px] sm:text-[180px] lg:text-[350px] leading-[0.8] text-primary text-left pl-[5%]">WORK</span>
      </div>

      <div className="relative z-10 max-w-container-max mx-auto group">
        
        {isAdmin && (
          <div className="absolute -top-12 right-0 z-50">
            <InlineEditControls onEdit={handleEdit} />
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-20"
        >
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-4 block">{data.subtitle}</span>
          <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl lg:text-headline-lg uppercase text-on-surface max-w-4xl break-words">
            {data.title.split(' ').map((word: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span className="text-primary block sm:inline">{word}</span> : word + ' '}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mt-6 max-w-3xl text-on-surface-variant font-medium">
            {data.description}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Side: DNA Traits */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-8 lg:gap-16">
            {[1, 2, 3].map((num) => {
              const title = data[`trait${num}_title`];
              const desc = data[`trait${num}_desc`];
              if (!title && !desc) return null;
              
              return (
                <motion.div 
                  key={num}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: num * 0.2 }}
                  className="group/trait border-t border-outline pt-6 sm:pt-8"
                >
                  <div className="flex items-start gap-4 sm:gap-6 lg:gap-10">
                    <span className="font-headline-md text-2xl sm:text-3xl lg:text-5xl text-outline-variant font-bold transition-colors group-hover/trait:text-primary flex-shrink-0">
                      0{num}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold uppercase mb-3 tracking-tight break-words">{title}</h3>
                      <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant leading-relaxed break-words">
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side: Large Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative min-h-[280px] sm:min-h-[400px] lg:min-h-[700px] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl group/imgslider"
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10 pointer-events-none" />
            
            <div className="w-full h-full absolute inset-0 flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
              {(Array.isArray(data.image || fallbackData.image) ? data.image || fallbackData.image : [data.image || fallbackData.image]).map((img: any, i: number) => (
                <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
                  <ResponsiveImage 
                    src={img} 
                    alt={`Company DNA ${i+1}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/imgslider:scale-105" 
                  />
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Disciplines Section"
        collectionName="disciplines"
        docId="main"
        initialData={data}
        fields={disciplinesFields}
      />
    </section>
  );
};

export default DisciplinesSection;
