import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import dnaImageFallback from '../assets/motor-1.png';

const fallbackData = {
  id: 'disciplines_main',
  subtitle: 'THE DNA',
  title: 'HOW WE WORK.',
  description: 'This is the operational blueprint that drives VB Associates. Our disciplines form the foundational DNA applied across every sector we touch.',
  image: dnaImageFallback,
  trait1_title: 'ARCHITECTURAL INTEGRITY',
  trait1_desc: 'We do not just build structures or businesses; we engineer ecosystems designed to outlast market cycles. Every foundation is laid with uncompromising quality.',
  trait2_title: 'DECISIVE LEADERSHIP',
  trait2_desc: 'Agility meets absolute precision. We operate with a clear chain of command and a strategic mandate, allowing our subsidiaries to move faster than the competition.',
  trait3_title: 'SYNERGISTIC SCALE',
  trait3_desc: 'Our divisions do not operate in silos. The knowledge gained in high-performance motors fuels the engineering in our real estate and construction ventures.',
};

const disciplinesFields: FieldConfig[] = [
  { name: 'subtitle', label: 'Subtitle', type: 'text' },
  { name: 'title', label: 'Main Title', type: 'text', required: true },
  { name: 'description', label: 'Main Description', type: 'textarea' },
  { name: 'image', label: 'Section Image', type: 'image' },
  { name: 'trait1_title', label: 'Trait 1 Title', type: 'text' },
  { name: 'trait1_desc', label: 'Trait 1 Description', type: 'textarea' },
  { name: 'trait2_title', label: 'Trait 2 Title', type: 'text' },
  { name: 'trait2_desc', label: 'Trait 2 Description', type: 'textarea' },
  { name: 'trait3_title', label: 'Trait 3 Title', type: 'text' },
  { name: 'trait3_desc', label: 'Trait 3 Description', type: 'textarea' },
];

const DisciplinesSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(fallbackData);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'disciplines', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsub();
  }, []);

  const handleEdit = () => {
    setModalOpen(true);
  };

  return (
    <section id="disciplines" className="relative py-24 md:py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-variant border-t border-outline overflow-hidden">
      
      {/* Background Architectural Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] select-none flex flex-col justify-center w-full z-0">
        <span className="font-display-xl text-[180px] lg:text-[350px] leading-[0.8] text-primary text-left pl-[5%]">HOW</span>
        <span className="font-display-xl text-[180px] lg:text-[350px] leading-[0.8] text-primary text-right pr-[5%]">WE</span>
        <span className="font-display-xl text-[180px] lg:text-[350px] leading-[0.8] text-primary text-left pl-[5%]">WORK</span>
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
          className="mb-16 md:mb-24"
        >
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-4 block">{data.subtitle}</span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-surface max-w-4xl">
            {data.title.split(' ').map((word: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span className="text-primary block sm:inline">{word}</span> : word + ' '}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-lg md:text-xl lg:text-3xl leading-relaxed mt-6 max-w-3xl text-on-surface-variant font-medium">
            {data.description}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Side: DNA Traits */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-12 lg:gap-16">
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
                  className="group/trait border-t border-outline pt-8"
                >
                  <div className="flex items-start gap-6 lg:gap-10">
                    <span className="font-headline-md text-3xl lg:text-5xl text-outline-variant font-bold transition-colors group-hover/trait:text-primary">
                      0{num}
                    </span>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold uppercase mb-4 tracking-tight">{title}</h3>
                      <p className="text-lg text-on-surface-variant leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side: Large Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-[700px] overflow-hidden rounded-[2rem] shadow-2xl"
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
            <img 
              src={data.image || fallbackData.image} 
              alt="Company DNA" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
            />
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
