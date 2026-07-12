import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import TopNavBar from './TopNavBar';
import NormalFooter from './NormalFooter';
import AnimatedTopo from './AnimatedTopo';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  order: number;
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
  
  const [heroData, setHeroData] = useState<HeroData>(fallbackHero);
  const [servicesData, setServicesData] = useState<ServiceData[]>(fallbackServices);
  
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceData | null>(null);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  // Fetch Hero Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'division_pages', `${pageId}_hero`), (docSnap) => {
      if (docSnap.exists()) {
        setHeroData(docSnap.data() as HeroData);
      }
      setHeroLoaded(true);
    });
    return () => unsub();
  }, [pageId]);

  // Fetch Services Data
  useEffect(() => {
    const q = query(collection(db, `division_${pageId}_services`), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceData));
        setServicesData(services);
      }
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
    { name: 'title', label: 'Service Title', type: 'text', required: true },
    { name: 'description', label: 'Service Description', type: 'textarea', required: true },
    { name: 'icon', label: 'Material Icon Name', type: 'text' },
    { name: 'image', label: 'Override Image (Optional)', type: 'image' },
    { name: 'order', label: 'Display Order (Number)', type: 'text' }
  ];

  const handleEditService = (service: ServiceData) => {
    setActiveService(service);
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (id.startsWith('s')) {
      alert("This is a default template service. To delete it, first click edit and save it to the database, or just edit it to be the service you want!");
      return;
    }
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, `division_${pageId}_services`, id));
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleAddService = () => {
    setActiveService({
      id: '',
      title: 'New Service',
      description: 'Enter service details here.',
      icon: 'star',
      order: servicesData.length > 0 ? Math.max(...servicesData.map(s => Number(s.order) || 0)) + 1 : 1
    });
    setServiceModalOpen(true);
  };

  return (
    <>
      <AnimatedTopo />
      <TopNavBar />

      {/* Video Hero Section */}
      <div className={`w-full h-[60vh] md:h-[80vh] relative overflow-hidden mt-[65px] md:mt-[73px] group/hero transition-opacity duration-500 ${heroLoaded && servicesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {isAdmin && (
          <div className="absolute top-4 right-4 z-[60]">
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

      <main className={`pt-16 pb-24 px-4 md:px-8 lg:px-12 relative transition-opacity duration-500 ${heroLoaded && servicesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-container-max mx-auto">
          <div className="mb-16">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">
              {heroData.title}
            </h1>
            <p className="text-xl md:text-2xl font-medium tracking-tight text-[#1A1A1A] dark:text-white max-w-3xl">
              {heroData.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-12">
            {servicesData.map((service, index) => {
              const isReverse = index % 2 !== 0;
              const bgClass = isReverse ? 'bg-[#988E8B] dark:bg-neutral-900' : 'bg-[#D7D1C9] dark:bg-neutral-800';
              const imgBgClass = isReverse ? 'bg-[#8F8A8B] dark:bg-neutral-800' : 'bg-[#C1BAB2] dark:bg-neutral-700';

              return (
                <div key={service.id} className={`flex flex-col md:flex-row ${isReverse ? 'md:flex-row-reverse' : ''} ${bgClass} rounded-[2rem] overflow-hidden shadow-xl w-full relative group`}>
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-50">
                      <InlineEditControls 
                        onEdit={() => handleEditService(service)} 
                        onDelete={() => handleDeleteService(service.id)} 
                      />
                    </div>
                  )}

                  <div className={`w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] ${imgBgClass} flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0`}>
                    {service.image ? (
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40 z-10">{service.icon}</span>
                    )}
                  </div>
                  <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
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
                Add New Service
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
        title="Edit Service"
        collectionName={`division_${pageId}_services`}
        docId={activeService?.id.startsWith('s') ? null : activeService?.id}
        initialData={activeService || {}}
        fields={serviceFields}
      />
    </>
  );
};

export default EditableDivisionPage;
