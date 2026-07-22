import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';

const fallbackData = {
  id: 'main',
  label_caps: 'ESTABLISHED LEGACY',
  title_p1: 'A MONOLITH OF',
  title_italic: 'STRATEGIC',
  title_p2: 'PRECISION',
  desc_1: 'Founded on the principles of architectural integrity and decisive market leadership, VB Associates operates at the intersection of performance and permanence.',
  desc_2: 'Our group empowers specialized subsidiaries to redefine their respective industries through engineering excellence and visionary development. We do not just build companies; we engineer legacies designed to withstand the test of time and market volatility.',
  stat1_num: '35+',
  stat1_label: 'YEARS OF GROWTH',
  stat2_num: '3.2B',
  stat2_label: 'ASSETS UNDER MGMT',
};

const aboutFields: FieldConfig[] = [
  { name: 'label_caps', label: 'Top Small Label', type: 'text' },
  { name: 'title_p1', label: 'Title Line 1', type: 'text' },
  { name: 'title_italic', label: 'Title Italic Word', type: 'text' },
  { name: 'title_p2', label: 'Title Line 3', type: 'text' },
  { name: 'desc_1', label: 'First Description Paragraph', type: 'textarea' },
  { name: 'desc_2', label: 'Second Description Paragraph', type: 'textarea' },
  { name: 'stat1_num', label: 'Stat 1 Number', type: 'text' },
  { name: 'stat1_label', label: 'Stat 1 Label', type: 'text' },
  { name: 'stat2_num', label: 'Stat 2 Number', type: 'text' },
  { name: 'stat2_label', label: 'Stat 2 Label', type: 'text' },
];

const AboutSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(fallbackData);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'about', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() });
      }
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleEdit = () => {
    setModalOpen(true);
  };

  return (
    <section id="about" className={`relative py-24 md:py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-variant overflow-hidden border-t border-outline transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Architectural Watermark */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-[0.03] select-none">
        <span className="font-display-xl text-[400px] leading-none text-primary">LEGACY</span>
      </div>

      <div className="relative z-10 max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch group">
        
        {isAdmin && (
          <div className="absolute top-0 right-0 z-50">
            <InlineEditControls onEdit={handleEdit} />
          </div>
        )}
        
        {/* Left Column: Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:col-span-5 md:pr-12 md:border-r border-outline flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-primary"></div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{data.label_caps}</p>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase leading-[1.1] text-on-surface tracking-tight">
              {data.title_p1} <br/>
              <span className="text-primary italic">{data.title_italic}</span><br/>
              {data.title_p2}
            </h2>
          </div>
          
          <div className="hidden md:block mt-24">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 20H40M20 0V40" stroke="#D7D1C9" strokeWidth="1"/>
              <circle cx="20" cy="20" r="4" fill="#1F2A44"/>
            </svg>
          </div>
        </motion.div>
        
        {/* Right Column: Content & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="md:col-span-6 md:col-start-7 flex flex-col justify-center mt-12 md:mt-0"
        >
          <div className="prose prose-lg">
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed mb-6 font-semibold whitespace-pre-wrap">
              {data.desc_1}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-12 whitespace-pre-wrap">
              {data.desc_2}
            </p>
          </div>

          {/* Stats Grid - Blueprint Style */}
          <div className="grid grid-cols-2 border border-outline relative">
            {/* Center crosshair */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-outline"></div>
            
            <motion.div 
              className="p-6 md:p-12 transition-colors duration-500"
            >
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-display-xl text-5xl md:text-[80px] leading-none text-primary mb-4"
              >
                {data.stat1_num}
              </motion.p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{data.stat1_label}</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="p-6 md:p-12 transition-colors duration-500"
            >
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="font-display-xl text-5xl md:text-[80px] leading-none text-primary mb-4"
              >
                {data.stat2_num}
              </motion.p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{data.stat2_label}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit About Section"
        collectionName="about"
        docId="main"
        initialData={data}
        fields={aboutFields}
      />
    </section>
  );
};

export default AboutSection;
