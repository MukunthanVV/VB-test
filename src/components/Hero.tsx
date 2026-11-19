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
  title: 'VB ASSOCIATES',
  subtitle: 'PERFORMANCE & AUTO MODIFICATION GARAGE',
  btn1_text: 'EXPLORE PORTFOLIO',
  btn2_text: 'VIEW INVESTOR RELATIONS',
};

const heroFields: FieldConfig[] = [
  { name: 'title', label: 'Main Title', type: 'text', required: true },
  { name: 'subtitle', label: 'Subtitle (Primary Color)', type: 'text', required: true },
  { name: 'btn1_text', label: 'Primary Button Text', type: 'text' },
  { name: 'btn2_text', label: 'Secondary Button Text', type: 'text' },
];

const Hero: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(fallbackData);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'hero', 'main'), (docSnap) => {
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
    <section className={`relative min-h-screen flex items-center justify-center pt-32 pb-16 overflow-hidden bg-transparent transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      <div className="relative z-10 px-4 sm:px-6 md:px-8 xl:px-margin-desktop max-w-container-max w-full text-center pointer-events-auto">
        {isAdmin && (
          <div className="absolute top-0 right-0 z-50">
            <InlineEditControls onEdit={handleEdit} />
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display-xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-display-xl leading-[0.95] tracking-tighter mb-12 max-w-6xl mx-auto uppercase break-words"
        >
          <span 
            className="bg-clip-text text-transparent bg-gradient-to-br from-neutral-600 via-neutral-900 to-black transition-all duration-500" 
            style={{ 
              WebkitTextStroke: '1px var(--hero-stroke-color)' 
            }}
          >
            {data.title}
          </span> <span className="text-primary">{data.subtitle}</span>
        </motion.h1>


      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Hero Section"
        collectionName="hero"
        docId="main"
        initialData={data}
        fields={heroFields}
      />
    </section>
  );
};

export default Hero;
