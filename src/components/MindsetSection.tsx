import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage from './ResponsiveImage';

const fallbackData = {
  id: 'mindset_main',
  title: 'Managing Director and CEO',
  image: [
    'https://res.cloudinary.com/dgssrfsli/image/upload/v1795289854/vrcjopflsoz8nrueyjbt.jpg'
  ],
  val1_title: 'PRECISION',
  val1_desc: "Precision is not a choice , it's our standard.",
  val2_title: 'INNOVATION',
  val2_desc: 'Where ideas evolve into excellence.',
  val3_title: 'LONGEVITY',
  val3_desc: 'Crafting a legacy for generations.',
  val4_title: 'INTEGRITY',
  val4_desc: 'Trust is the foundation of everything we build.',
  quoteText: '"A leader\'s true influence is reflected not in titles, but in the lives they inspire."'
};

const getObjectPosition = (focus?: string): string => {
  switch (focus) {
    case 'top': return 'center top';
    case 'upper': return 'center 35%';
    case 'lower': return 'center 65%';
    case 'bottom': return 'center bottom';
    case 'center':
    default: return 'center 45%';
  }
};

const mindsetFields: FieldConfig[] = [
  { name: 'title', label: 'Section Title', type: 'text', required: true },
  { name: 'image', label: 'Section Images (Gallery)', type: 'image-gallery' },
  {
    name: 'image_focus',
    label: 'Image Framing Focus',
    type: 'select',
    options: [
      { label: 'Upper-Center (Face & Torso Focus - Recommended)', value: 'upper' },
      { label: 'Center (Balanced)', value: 'center' },
      { label: 'Top (Roof / Sky / Upper)', value: 'top' },
      { label: 'Lower-Center (Body & Car)', value: 'lower' },
      { label: 'Bottom', value: 'bottom' },
    ],
  },
  { name: 'val1_title', label: 'Value 1 Title', type: 'text' },
  { name: 'val1_desc', label: 'Value 1 Description', type: 'textarea' },
  { name: 'val2_title', label: 'Value 2 Title', type: 'text' },
  { name: 'val2_desc', label: 'Value 2 Description', type: 'textarea' },
  { name: 'val3_title', label: 'Value 3 Title', type: 'text' },
  { name: 'val3_desc', label: 'Value 3 Description', type: 'textarea' },
  { name: 'val4_title', label: 'Value 4 Title', type: 'text' },
  { name: 'val4_desc', label: 'Value 4 Description', type: 'textarea' },
  { name: 'quoteText', label: 'Quote / Signoff', type: 'text' },
];

const MindsetSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('cache_mindset');
      return cached ? JSON.parse(cached) : fallbackData;
    } catch {
      return fallbackData;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mindset', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const docData = { id: docSnap.id, ...docSnap.data() };
        setData(docData);
        try { localStorage.setItem('cache_mindset', JSON.stringify(docData)); } catch {}
      }
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const handleEdit = () => {
    setModalOpen(true);
  };

  return (
    <section id="mindset" className={`relative py-16 sm:py-24 md:py-section-gap px-4 sm:px-6 md:px-8 xl:px-margin-desktop bg-transparent overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 max-w-container-max mx-auto flex flex-col md:flex-row border border-outline rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl bg-surface/80 backdrop-blur-2xl group">
        
        {isAdmin && (
          <div className="absolute top-4 right-4 z-50">
            <InlineEditControls onEdit={handleEdit} />
          </div>
        )}

        {/* Image Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="md:w-5/12 border-b md:border-b-0 md:border-r border-outline relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[640px] group/imgslider overflow-hidden"
        >
          <div className="w-full h-full absolute inset-0 flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
            {(Array.isArray(data.image || fallbackData.image) ? data.image || fallbackData.image : [data.image || fallbackData.image]).map((img: any, i: number) => (
              <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
                <ResponsiveImage 
                  src={img} 
                  alt={`${data.title} ${i+1}`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/imgslider:scale-105"
                  style={{ objectPosition: getObjectPosition(data.image_focus) }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Text Column */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="md:w-7/12 flex flex-col justify-center h-auto p-5 sm:p-8 md:p-10 lg:p-16 relative z-20"
        >
          <motion.h2 variants={itemVariants} className="font-headline-lg text-3xl sm:text-4xl md:text-headline-lg-mobile lg:text-headline-lg mb-8 uppercase leading-tight text-on-surface break-words">
            {data.title.split(' ').map((word: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span className="text-primary block sm:inline">{word}</span> : word + ' '}
              </React.Fragment>
            ))}
          </motion.h2>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((num) => {
              const title = data[`val${num}_title`];
              const desc = data[`val${num}_desc`];
              if (!title && !desc) return null;
              return (
                <motion.div key={num} variants={itemVariants} className="border-b border-outline pb-6">
                  <h3 className="font-label-caps text-label-caps text-primary uppercase mb-2 break-words">{title}</h3>
                  <p className="font-body-lg text-base sm:text-body-lg text-on-surface break-words">{desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={itemVariants} className="mt-10">
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              {data.quoteText}
            </p>
          </motion.div>
        </motion.div>
      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Mindset Section"
        collectionName="mindset"
        docId="main"
        initialData={data}
        fields={mindsetFields}
      />
    </section>
  );
};

export default MindsetSection;
