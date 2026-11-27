import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import TopNavBar from './TopNavBar';
import NormalFooter from './NormalFooter';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage, { type ResponsiveImageSource } from './ResponsiveImage';
import { CarStatusStamp } from './CarStatusStamp';
import { SwipeDots } from './SwipeDots';

const AnimatedTopo = React.lazy(() => import('./AnimatedTopo'));

interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: ResponsiveImageSource | ResponsiveImageSource[];
  order: number;
  status?: string;
  image_focus?: string;
}

interface HeroData {
  title: string;
  description: string;
  videoUrl: string;
}

interface EditableDivisionPageProps {
  pageId: string;
  fallbackHero: HeroData;
  fallbackServices: ServiceData[];
}

interface DivisionCardGalleryProps {
  images: any;
  title: string;
  focus?: string;
  imgBgClass: string;
  fallbackIcon?: string;
}

const DivisionCardGallery: React.FC<DivisionCardGalleryProps> = ({
  images,
  title,
  focus,
  imgBgClass,
  fallbackIcon = 'directions_car'
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageList = Array.isArray(images) ? images : images ? [images] : [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth > 0) {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      if (idx !== activeIdx && idx >= 0 && idx < imageList.length) {
        setActiveIdx(idx);
      }
    }
  };

  const scrollTo = (idx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: idx * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveIdx(idx);
    }
  };

  const nextImage = () => {
    const next = activeIdx >= imageList.length - 1 ? 0 : activeIdx + 1;
    scrollTo(next);
  };

  const prevImage = () => {
    const prev = activeIdx <= 0 ? imageList.length - 1 : activeIdx - 1;
    scrollTo(prev);
  };

  if (imageList.length === 0) {
    return (
      <div className={`w-full md:w-[60%] relative min-h-[360px] sm:min-h-[420px] md:min-h-[480px] ${imgBgClass} flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0`}>
        <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40 z-10">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <div className={`w-full md:w-[60%] relative min-h-[360px] sm:min-h-[420px] md:min-h-[480px] ${imgBgClass} flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0 overflow-hidden group/gallery`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="w-full h-full absolute inset-0 flex snap-x snap-mandatory overflow-x-auto hide-scrollbar scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {imageList.map((img: any, i: number) => (
          <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
            <ResponsiveImage src={img} alt={`${title} - ${i + 1}`} focus={focus} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {imageList.length > 1 && (
        <>
          <div className="absolute top-1/2 left-3 right-3 flex justify-between -translate-y-1/2 z-20 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-all cursor-pointer pointer-events-auto shadow-lg hover:scale-110"
              title="Previous Photo"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-all cursor-pointer pointer-events-auto shadow-lg hover:scale-110"
              title="Next Photo"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <SwipeDots
              total={imageList.length}
              activeIndex={activeIdx}
              onSelect={scrollTo}
            />
          </div>
        </>
      )}
    </div>
  );
};

const EditableDivisionPage: React.FC<EditableDivisionPageProps> = ({ pageId, fallbackHero, fallbackServices }) => {
  const { isAdmin } = useAuth();
  
  const [heroData, setHeroData] = useState<HeroData>(() => {
    try {
      const cached = localStorage.getItem(`cache_div_hero_${pageId}`);
      return cached ? JSON.parse(cached) : fallbackHero;
    } catch {
      return fallbackHero;
    }
  });
  const [servicesData, setServicesData] = useState<ServiceData[]>(() => {
    try {
      const cached = localStorage.getItem(`cache_div_services_${pageId}`);
      return cached ? JSON.parse(cached) : fallbackServices;
    } catch {
      return fallbackServices;
    }
  });
  
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceData | null>(null);

  const [heroLoaded, setHeroLoaded] = useState(true);
  const [servicesLoaded, setServicesLoaded] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('918678910444');

  // Fetch WhatsApp Number from Contact Info
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'contact', 'info'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().whatsappPhone) {
        setWhatsappPhone(docSnap.data().whatsappPhone);
      }
    });
    return () => unsub();
  }, []);

  // Fetch Hero Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'division_pages', `${pageId}_hero`), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data() as HeroData;
        setHeroData(d);
        try { localStorage.setItem(`cache_div_hero_${pageId}`, JSON.stringify(d)); } catch {}
      }
      setHeroLoaded(true);
    });
    return () => unsub();
  }, [pageId]);

  // Fetch Services Data
  useEffect(() => {
    const q = query(collection(db, `division_${pageId}_services`));
    const unsub = onSnapshot(q, (snapshot) => {
      let finalServices = fallbackServices;
      if (!snapshot.empty) {
        const services = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
        
        // Filter out services marked as deleted in Firestore or empty drafts
        const activeServices = services.filter(s => {
          if (s.deleted) return false;
          if (s.title === 'New Service' && s.description === 'Enter service details here.') return false;
          return true;
        });
        const deletedIds = new Set(services.filter(s => s.deleted).map(s => s.id));
        
        // Only include fallbacks that are not explicitly deleted
        const activeFallbacks = fallbackServices.filter(fb => !deletedIds.has(fb.id));

        const mergedDisplayData = activeFallbacks.map(fb => {
          const realService = activeServices.find(s => s.id === fb.id);
          return realService || fb;
        });
        const extraServices = activeServices.filter(s => !fallbackServices.find(fb => fb.id === s.id));
        finalServices = [...mergedDisplayData, ...extraServices].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      }
      setServicesData(finalServices);
      try { localStorage.setItem(`cache_div_services_${pageId}`, JSON.stringify(finalServices)); } catch {}
      setServicesLoaded(true);
    });
    return () => unsub();
  }, [pageId]);

  const heroFields: FieldConfig[] = [
    { name: 'title', label: 'Page Title', type: 'text', required: true },
    { name: 'description', label: 'Page Description', type: 'textarea', required: true },
    { name: 'videoUrl', label: 'Background Video URL (mp4)', type: 'text' }
  ];

  const serviceFields: FieldConfig[] = [
    { name: 'title', label: 'Title / Vehicle Name', type: 'text', required: true },
    {
      name: 'status',
      label: 'Vehicle Status Stamp',
      type: 'select',
      options: [
        { label: 'Live (Available)', value: 'Live' },
        { label: 'Booked', value: 'Booked' },
        { label: 'Sold', value: 'Sold' },
        { label: 'None (Hide Stamp)', value: 'none' },
      ],
    },
    { name: 'description', label: 'Description & Details', type: 'textarea', required: true },
    { name: 'icon', label: 'Material Icon Name', type: 'text' },
    { name: 'image', label: 'Override Images (Gallery)', type: 'image-gallery' },
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
    { name: 'order', label: 'Display Order (Number)', type: 'text' }
  ];

  const handleEditService = (service: ServiceData) => {
    setActiveService({
      ...service,
      status: getEffectiveStatus(service) || 'Live'
    });
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await setDoc(doc(db, `division_${pageId}_services`, id), { deleted: true }, { merge: true });
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleAddService = () => {
    setActiveService({
      id: '',
      title: 'New Vehicle',
      description: 'Enter vehicle specifications, mileage, and price.',
      icon: 'directions_car',
      status: (pageId === 'zKNi37OfWQFhk27pQXCR' || pageId === 's2') ? 'Live' : '',
      order: servicesData.length > 0 ? Math.max(...servicesData.map(s => Number(s.order) || 0)) + 1 : 1
    });
    setServiceModalOpen(true);
  };

  // Determine effective status (defaults to 'Live' for Pre-Owned car listings if unset)
  const getEffectiveStatus = (service: ServiceData) => {
    if (service.status !== undefined && service.status !== '') {
      if (service.status.toLowerCase() === 'none') return '';
      return service.status;
    }
    if (service.status === '') {
      return ''; // Explicitly hidden by admin
    }
    // Default to 'Live' for Pre-Owned Excellence listings
    if (pageId === 'zKNi37OfWQFhk27pQXCR' || pageId === 's2') {
      return 'Live';
    }
    return '';
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <AnimatedTopo />
      </React.Suspense>
      <TopNavBar />

      {/* Video Hero Section */}
      <div className={`w-full h-[60vh] md:h-[80vh] relative overflow-hidden mt-[65px] md:mt-[73px] group/hero transition-opacity duration-500 ${heroLoaded && servicesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {isAdmin && (
          <div className="absolute top-4 right-4 z-30">
            <InlineEditControls onEdit={() => setHeroModalOpen(true)} />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
          <span className="material-symbols-outlined text-white/70 text-7xl drop-shadow-lg pointer-events-auto cursor-pointer hover:text-white transition-colors duration-300">play_circle</span>
        </div>
        
        <video 
          key={heroData.videoUrl} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroData.videoUrl} type="video/mp4" />
        </video>
      </div>

      <main className={`pt-12 sm:pt-16 pb-24 px-4 sm:px-6 md:px-8 lg:px-12 relative transition-opacity duration-500 ${heroLoaded && servicesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-container-max mx-auto">
          <div className="mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm break-words">
              {heroData.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-[#1A1A1A] dark:text-white max-w-3xl break-words">
              {heroData.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-12">
            {servicesData.map((service, index) => {
              const isReverse = index % 2 !== 0;
              const bgClass = isReverse ? 'bg-[#988E8B] dark:bg-neutral-900' : 'bg-[#D7D1C9] dark:bg-neutral-800';
              const imgBgClass = isReverse ? 'bg-[#8F8A8B] dark:bg-neutral-800' : 'bg-[#C1BAB2] dark:bg-neutral-700';
              const effectiveStatus = getEffectiveStatus(service);
              const normalizedStatus = (effectiveStatus || '').trim().toLowerCase();
              const isEnquireActive = normalizedStatus === 'live' || normalizedStatus === 'booked';
              
              const whatsappMessage = encodeURIComponent(
                `Hello VB Associates, I am interested in inquiring about the ${service.title} currently listed as ${normalizedStatus.toUpperCase()} in your Pre-Owned collection. Could you please share more details?`
              );
              const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

              return (
                <div key={service.id} className={`flex flex-col md:flex-row ${isReverse ? 'md:flex-row-reverse' : ''} ${bgClass} rounded-[2rem] overflow-hidden shadow-xl w-full relative group`}>
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-30">
                      <InlineEditControls 
                        onEdit={() => handleEditService(service)} 
                        onDelete={() => handleDeleteService(service.id)} 
                      />
                    </div>
                  )}

                  {/* Image Column with Swipe Dots and Navigation Controls */}
                  <DivisionCardGallery
                    images={service.image}
                    title={service.title}
                    focus={(service as any).image_focus}
                    imgBgClass={imgBgClass}
                    fallbackIcon={service.icon}
                  />

                  {/* Content Column */}
                  <div className="w-full md:w-[40%] flex flex-col justify-between p-8 md:p-12 lg:p-16 relative">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">{service.title}</h3>
                      <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed whitespace-pre-line">
                        {service.description}
                      </p>
                    </div>

                    {/* Status & Parallel Enquire Now CTA Row (strictly single line, no overlapping) */}
                    {effectiveStatus && (
                      <div className="mt-8 pt-2 flex items-center justify-between gap-3 sm:gap-4 w-full flex-nowrap">
                        <div className="flex-shrink-0">
                          <CarStatusStamp status={effectiveStatus} />
                        </div>
                        {isEnquireActive && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-black/80 dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-neutral-200 transition-all duration-300 font-label-caps text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase shadow-sm group/enquire hover:scale-105 flex-shrink-0 cursor-pointer whitespace-nowrap"
                          >
                            <span>Enquire Now</span>
                            <span className="material-symbols-outlined text-[13px] sm:text-[15px] transition-transform duration-200 group-hover/enquire:translate-x-0.5 group-hover/enquire:-translate-y-0.5">
                              north_east
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {isAdmin && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={handleAddService}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors shadow-lg font-label-caps uppercase tracking-widest text-sm"
              >
                <span className="material-symbols-outlined">add</span>
                Add New Service / Car
              </button>
            </div>
          )}
        </div>
      </main>

      <NormalFooter />

      {/* Hero Editor Modal */}
      <ItemEditorModal
        isOpen={heroModalOpen}
        onClose={() => setHeroModalOpen(false)}
        title="Edit Header Section"
        collectionName="division_pages"
        docId={`${pageId}_hero`}
        initialData={heroData}
        fields={heroFields}
      />

      {/* Service Editor Modal */}
      <ItemEditorModal
        isOpen={serviceModalOpen}
        onClose={() => { setServiceModalOpen(false); setActiveService(null); }}
        title="Edit Vehicle / Service Details"
        collectionName={`division_${pageId}_services`}
        docId={activeService?.id}
        initialData={activeService || {}}
        fields={serviceFields}
      />
    </>
  );
};

export default EditableDivisionPage;
