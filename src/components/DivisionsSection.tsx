import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage from './ResponsiveImage';


const fallbackServices = [
  {
    id: 'zKNi37OfWQFhk27pQXCR',
    number: '01',
    category: 'VB Used Cars',
    title: 'PRE-OWNED EXCELLENCE',
    description: 'Making Every Pre-Owned Car Feel Like the Right Choice',
    images: ['https://res.cloudinary.com/dgssrfsli/image/upload/v1786272021/ae0zm55l6ewnyngadkvl.webp']
  },
  {
    id: 's1_fb',
    number: '02',
    category: 'VB AUTOMOTIVE CUSTOMIZATION',
    title: 'Built to Stand Apart',
    description: 'We give every vehicle a unique character through thoughtful modifications tailored to your style.',
    images: ['https://res.cloudinary.com/dgssrfsli/image/upload/v1786270844/ijbuegynlc9a3hkqh7rl.jpg']
  },
  {
    id: 'PCuKhjgp3ZJZnwUeqwyM',
    number: '03',
    category: 'VB Real Estates',
    title: 'Spaces Made for Living',
    description: 'We bring together thoughtfully chosen properties, strong value, and opportunities designed to feel right for the future.',
    images: ['https://res.cloudinary.com/dgssrfsli/image/upload/v1786271065/nuwmplzpniwbdvqp7c6n.jpg']
  },
  {
    id: 'IkvD92RBXH35H2dalCji',
    number: '04',
    category: 'VB EVENTS',
    title: 'Creating Moments Worth Remembering',
    description: 'From lively celebrations to meaningful milestones, we bring people together and turn every occasion into an experience worth remembering.',
    images: ['https://res.cloudinary.com/dgssrfsli/image/upload/v1786271307/lvsldfdiauaiyffyyj0e.jpg']
  },
  {
    id: 'W52BZp1rioWXgLBkHMVQ',
    number: '05',
    category: 'VB Crackers',
    title: 'Light Up Every Celebration',
    description: 'Bringing colour, excitement, and joy to every celebration with crackers made for memorable moments.',
    images: ['https://res.cloudinary.com/dgssrfsli/image/upload/v1786271582/i7pheqvcpn3xdseduzlz.png']
  }
];

const serviceFields: FieldConfig[] = [
  { name: 'number', label: 'List Number (e.g. 01)', type: 'text', required: true },
  { name: 'category', label: 'Category (e.g. PERFORMANCE)', type: 'text', required: true },
  { name: 'title', label: 'Service Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'images', label: 'Gallery Images', type: 'image-gallery' },
  {
    name: 'image_focus',
    label: 'Image Framing Focus',
    type: 'select',
    options: [
      { label: 'Center (Balanced / Default)', value: 'center' },
      { label: 'Upper-Center (Upper Focus)', value: 'upper' },
      { label: 'Top (Upper Focus)', value: 'top' },
      { label: 'Lower-Center (Lower Focus)', value: 'lower' },
      { label: 'Bottom', value: 'bottom' },
    ],
  },
];

const textVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const DivisionCard = ({ item, index, isAdmin, onEdit, onDelete }: any) => {
  const [currentMotorImage, setCurrentMotorImage] = useState(0);
  const isReversed = index % 2 !== 0;

  const images = item.images && item.images.length > 0 ? item.images : [];
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMotorImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMotorImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} overflow-hidden rounded-[2rem] bg-[#988E8B] dark:bg-neutral-900 shadow-xl w-full relative group`}>
      {isAdmin && (
        <div className="absolute top-4 right-4 z-50">
          <InlineEditControls onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
        </div>
      )}

      {/* Image Slider Container (40% Width) */}
      <motion.div 
        variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className={`w-full md:w-[40%] relative min-h-[340px] sm:min-h-[400px] md:min-h-[460px] lg:min-h-[560px] xl:min-h-[620px] bg-[#8F8A8B] dark:bg-neutral-800 flex flex-col justify-center items-center group/slider flex-shrink-0 ${isReversed ? 'border-l border-outline' : 'border-r border-outline'}`}
      >
        {images.length > 0 ? (
          <>
            <AnimatePresence initial={false}>
              <motion.div 
                key={currentMotorImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <ResponsiveImage 
                  src={images[currentMotorImage]}
                  alt={item.title}
                  focus={item.image_focus}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              </motion.div>
            </AnimatePresence>
            
            {images.length > 1 && (
              <>
                <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                  <button onClick={prevImage} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={nextImage} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                  {images.map((_: any, idx: number) => (
                    <div key={idx} className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentMotorImage ? 'w-8 bg-white' : 'w-2.5 bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="material-symbols-outlined text-5xl text-[#1A1A1A]/40 dark:text-white/40">
            {item.icon || 'domain'}
          </span>
        )}
      </motion.div>

      {/* Text Container */}
      <motion.div 
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full md:w-[60%] flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-16 xl:px-24 py-8 sm:py-12 md:py-14 text-[#1A1A1A] dark:text-white min-w-0"
      >
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <span className="font-label-caps text-xs sm:text-label-caps opacity-60 text-[#1A1A1A] dark:text-white">{item.number}. {item.category}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-8 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm break-words">{item.title}</h3>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-[24px] xl:text-[30px] leading-relaxed md:leading-[1.4] font-medium mb-8 sm:mb-12 md:mb-16 tracking-tight text-[#1A1A1A] dark:text-white break-words">
          {item.description}
        </p>
        
        <Link 
          to={`/division/${item.id}`}
          className="group flex justify-between items-center w-full max-w-xs border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white py-3.5 sm:py-4 px-5 sm:px-6 text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-[#988E8B] dark:hover:text-neutral-900 transition-colors duration-300"
        >
          ENTER DIVISION
          <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
        </Link>
      </motion.div>
    </div>
  );
};

const DivisionsSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cache_services');
      return cached ? JSON.parse(cached) : fallbackServices;
    } catch {
      return fallbackServices;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    // Sort by number field
    const q = query(collection(db, 'services'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      
      const activeData = data.filter(d => !d.deleted);
      const deletedIds = new Set(data.filter(d => d.deleted).map(d => d.id));
      
      const activeFallbacks = fallbackServices.filter(fb => !deletedIds.has(fb.id));
      
      // If we have custom items in the DB, or if fallbacks are deleted/modified
      if (activeData.some(d => !fallbackServices.some(fb => fb.id === d.id)) || data.length > 0) {
        // Merge fallbacks with DB overrides
        const merged = activeFallbacks.map(fb => {
          const real = activeData.find(d => d.id === fb.id);
          return real || fb;
        });
        const extra = activeData.filter(d => !fallbackServices.some(fb => fb.id === d.id));
        const finalSet = [...merged, ...extra];
        setServices(finalSet);
        try { localStorage.setItem('cache_services', JSON.stringify(finalSet)); } catch {}
      } else {
        setServices(activeFallbacks);
        try { localStorage.setItem('cache_services', JSON.stringify(activeFallbacks)); } catch {}
      }
      setIsLoaded(true);
    }, (error) => {
      console.error(error);
      setServices(fallbackServices);
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const rawData = services;
  const finalDisplayData = [...rawData].sort((a, b) => {
      const numA = parseInt(a.number, 10) || 0;
      const numB = parseInt(b.number, 10) || 0;
      return numA - numB;
    });

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service division?')) {
      await setDoc(doc(db, 'services', id), { deleted: true });
    }
  };

  return (
    <section id="services" className={`relative py-16 sm:py-24 md:py-section-gap px-4 sm:px-6 md:px-8 xl:px-margin-desktop bg-transparent w-full overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 max-w-container-max mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 relative"
        >
          <div>
            <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-headline-lg-mobile lg:text-headline-lg uppercase text-on-surface text-left break-words">OUR <span className="text-primary block md:inline">SPECIALIZATIONS</span></h2>
            <p className="font-label-caps text-xs sm:text-label-caps text-on-surface-variant max-w-xs text-left mt-3 sm:mt-4">DYNAMIC SYNERGY ACROSS HIGH-STAKES INDUSTRIES</p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-4">
              <button onClick={handleAdd} className="text-sm bg-primary text-on-primary px-6 py-3 rounded-full hover:opacity-90 font-bold">
                + Add Service
              </button>
            </div>
          )}
        </motion.div>
        
        <div className="flex flex-col gap-16 w-full">
          {finalDisplayData.map((item, index) => (
            <DivisionCard 
              key={item.id} 
              item={item} 
              index={index} 
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Service' : 'Add Service'}
        collectionName="services"
        docId={editingItem?.id}
        initialData={editingItem || {}}
        fields={serviceFields}
      />
    </section>
  );
};

export default DivisionsSection;
