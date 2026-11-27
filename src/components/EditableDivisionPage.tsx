import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import TopNavBar from './TopNavBar';
import NormalFooter from './NormalFooter';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage, { type ResponsiveImageSource } from './ResponsiveImage';

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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  const [heroLoaded, setHeroLoaded] = useState(true);
  const [servicesLoaded, setServicesLoaded] = useState(true);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setStatusDropdownOpen(null);
    if (statusDropdownOpen) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [statusDropdownOpen]);

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
        
        // Filter out services marked as deleted in Firestore
        const activeServices = services.filter(s => !s.deleted);
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
      label: 'Vehicle Status Sticker',
      type: 'select',
      options: [
        { label: 'Live (Available)', value: 'Live' },
        { label: 'Booked', value: 'Booked' },
        { label: 'Sold', value: 'Sold' },
        { label: 'None (Hide Sticker)', value: '' },
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
    setActiveService(service);
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

  // Quick 1-click status change directly from the card badge
  const handleQuickStatusChange = async (serviceId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusDropdownOpen(null);
    try {
      await setDoc(
        doc(db, `division_${pageId}_services`, serviceId), 
        { status: newStatus }, 
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Determine effective status (defaults to 'Live' for Pre-Owned car listings if unset)
  const getEffectiveStatus = (service: ServiceData) => {
    if (service.status !== undefined && service.status !== '') {
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

                  {/* Image Column */}
                  <div className={`w-full md:w-[60%] relative min-h-[360px] sm:min-h-[420px] md:min-h-[480px] ${imgBgClass} flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0 overflow-hidden`}>
                    {service.image ? (
                      <div className="w-full h-full absolute inset-0 flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                        {(Array.isArray(service.image) ? service.image : [service.image]).map((img, i) => (
                          <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
                            <ResponsiveImage src={img} alt={`${service.title} - ${i + 1}`} focus={(service as any).image_focus} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40 z-10">{service.icon}</span>
                    )}

                    {/* Status Sticker Badge on the image */}
                    {effectiveStatus && (
                      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              if (isAdmin) {
                                e.stopPropagation();
                                setStatusDropdownOpen(statusDropdownOpen === service.id ? null : service.id);
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-2xl text-xs font-black uppercase tracking-widest border transition-all duration-200 ${
                              isAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
                            } ${
                              effectiveStatus === 'Sold'
                                ? 'bg-red-950/90 border-red-500/70 text-red-200'
                                : effectiveStatus === 'Booked'
                                ? 'bg-amber-950/90 border-amber-500/70 text-amber-300'
                                : 'bg-neutral-950/90 border-emerald-500/60 text-emerald-400'
                            }`}
                            title={isAdmin ? "Admin: Click to change car status (Live / Booked / Sold)" : undefined}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                effectiveStatus === 'Sold'
                                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                                  : effectiveStatus === 'Booked'
                                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                                  : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                              }`}
                            />
                            <span>{effectiveStatus}</span>
                            {isAdmin && (
                              <span className="material-symbols-outlined text-[15px] opacity-70 -ml-0.5">
                                expand_more
                              </span>
                            )}
                          </button>

                          {/* Admin Quick Status Dropdown Menu */}
                          {isAdmin && statusDropdownOpen === service.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-11 left-0 z-50 bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-outline/30 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[155px]"
                            >
                              <div className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant px-3 py-1.5 border-b border-outline/10">
                                Set Status
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(service.id, 'Live', e)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                  effectiveStatus === 'Live'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-on-surface hover:bg-emerald-500/10 hover:text-emerald-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Live</span>
                                </div>
                                {effectiveStatus === 'Live' && <span className="text-[10px]">✓</span>}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(service.id, 'Booked', e)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                  effectiveStatus === 'Booked'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-on-surface hover:bg-amber-500/10 hover:text-amber-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                                  <span>Booked</span>
                                </div>
                                {effectiveStatus === 'Booked' && <span className="text-[10px]">✓</span>}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(service.id, 'Sold', e)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                  effectiveStatus === 'Sold'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'text-on-surface hover:bg-red-500/10 hover:text-red-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-400" />
                                  <span>Sold</span>
                                </div>
                                {effectiveStatus === 'Sold' && <span className="text-[10px]">✓</span>}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(service.id, '', e)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:bg-neutral-500/10 transition-colors border-t border-outline/10 mt-0.5"
                              >
                                <span>None (Hide)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Classy "SOLD" stamp watermark overlay when Sold */}
                    {effectiveStatus === 'Sold' && (
                      <div className="absolute inset-0 bg-black/25 pointer-events-none flex items-center justify-center z-10">
                        <div className="border-4 border-red-500/90 text-red-500/95 font-black text-4xl sm:text-5xl md:text-6xl tracking-widest uppercase px-6 py-2 -rotate-12 rounded-xl backdrop-blur-[2px] shadow-2xl select-none">
                          SOLD
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                    {effectiveStatus && (
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            effectiveStatus === 'Sold'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                              : effectiveStatus === 'Booked'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              effectiveStatus === 'Sold'
                                ? 'bg-red-500'
                                : effectiveStatus === 'Booked'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500 animate-pulse'
                            }`}
                          />
                          {effectiveStatus}
                        </span>
                      </div>
                    )}
                    <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">{service.title}</h3>
                    <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed whitespace-pre-line">
                      {service.description}
                    </p>
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
