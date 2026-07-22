import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import mindsetImageFallback from '../assets/founder-mindset-new.jpg';

const fallbackData = {
  id: 'mindset_main',
  title: 'THE MINDSET',
  image: mindsetImageFallback,
  val1_title: 'PRECISION',
  val1_desc: 'Every decision is intentional.',
  val2_title: 'INNOVATION',
  val2_desc: 'Progress through adaptation.',
  val3_title: 'LONGEVITY',
  val3_desc: 'Building for generations.',
  val4_title: 'INTEGRITY',
  val4_desc: 'Trust before growth.',
  quoteText: '— Founder & Managing Director'
};

const mindsetFields: FieldConfig[] = [
  { name: 'title', label: 'Section Title', type: 'text', required: true },
  { name: 'image', label: 'Section Images (Gallery)', type: 'image-gallery' },
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
  const [data, setData] = useState<any>(fallbackData);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mindset', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() });
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
    <section id="about" className={`relative py-24 md:py-section-gap px-margin-mobile md:px-margin-desktop bg-transparent overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 max-w-container-max mx-auto flex flex-col lg:flex-row border border-outline rounded-[24px] overflow-hidden shadow-2xl bg-surface/80 backdrop-blur-2xl group">
        
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
          className="lg:w-5/12 border-b lg:border-b-0 lg:border-r border-outline relative min-h-[400px] lg:min-h-[600px] group/imgslider overflow-hidden"
        >
          <div className="w-full h-full absolute inset-0 flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
            {(Array.isArray(data.image || fallbackData.image) ? data.image || fallbackData.image : [data.image || fallbackData.image]).map((img: string, i: number) => (
              <img 
                key={i}
                src={img} 
                alt={`${data.title} ${i+1}`} 
                className="w-full h-full flex-shrink-0 snap-center object-cover object-top transition-transform duration-1000 group-hover/imgslider:scale-105"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </motion.div>

        {/* Text Column */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="lg:w-7/12 flex flex-col justify-center h-auto p-6 md:p-12 lg:p-16 relative z-20"
        >
          <motion.h2 variants={itemVariants} className="font-headline-lg text-4xl md:text-headline-lg-mobile lg:text-headline-lg mb-8 uppercase leading-tight text-on-surface">
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
                  <h3 className="font-label-caps text-label-caps text-primary uppercase mb-2">{title}</h3>
                  <p className="font-body-lg text-body-lg text-on-surface">{desc}</p>
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
