import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';
import ResponsiveImage from './ResponsiveImage';

import project1 from '../assets/motor-2.webp';
import project2 from '../assets/motor-3.webp';
import project3 from '../assets/motor-4.webp';

// Fallback Data
const fallbackDivisions = [
  {
    id: 'motors',
    title: 'MOTORS DIVISION',
    featured: { id: 'p_m_f', title: 'Vantage Bespoke R', desc: 'High-Performance Automotive • Global', year: '2026', images: [project2] },
    secondary: [
      { id: 'p_m_s1', title: 'Apex V8 Engine', desc: 'Powertrain R&D • Stuttgart, DE', images: [project1] },
      { id: 'p_m_s2', title: 'Aero Dynamics Lab', desc: 'Testing Facility • Silverstone, UK', images: [project3] }
    ]
  },
  {
    id: 'real-estate',
    title: 'REAL ESTATE',
    featured: { id: 'p_r_f', title: 'The Apex Tower', desc: 'Commercial Real Estate • London, UK', year: '2027', images: [project1] },
    secondary: [
      { id: 'p_r_s1', title: 'Azure Coast Villas', desc: 'Luxury Residential • Monaco', images: [project3] },
      { id: 'p_r_s2', title: 'Monolith Hub', desc: 'Mixed-Use Development • New York, USA', images: [project2] }
    ]
  },
  {
    id: 'constructions',
    title: 'CONSTRUCTIONS',
    featured: { id: 'p_c_f', title: 'Neo-Infrastructure Link', desc: 'Civil Engineering • Dubai, UAE', year: '2025', images: [project3] },
    secondary: [
      { id: 'p_c_s1', title: 'Subterranean Network', desc: 'Transit System • Tokyo, JP', images: [project2] },
      { id: 'p_c_s2', title: 'Desert Bloom Highway', desc: 'Infrastructure • Saudi Arabia', images: [project1] }
    ]
  }
];

const projectFields: FieldConfig[] = [
  { name: 'title', label: 'Project Title', type: 'text', required: true },
  { name: 'desc', label: 'Description', type: 'textarea', required: true },
  { name: 'year', label: 'Year (for Featured only)', type: 'text' },
  { name: 'images', label: 'Project Images (Upload multiple)', type: 'image-gallery' },
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

const divisionFields: FieldConfig[] = [
  { name: 'title', label: 'Division Title', type: 'text', required: true }
];

const ProjectsSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  
  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cache_projects');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [divisionsDb, setDivisionsDb] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cache_project_divisions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [divModalOpen, setDivModalOpen] = useState(false);
  const [editingDiv, setEditingDiv] = useState<any>(null);

  const [activeDivision, setActiveDivision] = useState<string>('motors');
  const [isActiveFeatured, setIsActiveFeatured] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    // Sort by title or keep original order
    const q = query(collection(db, 'projects'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProjects(data);
      try { localStorage.setItem('cache_projects', JSON.stringify(data)); } catch {}
      setIsLoaded(true);
    });

    const unsubDivs = onSnapshot(collection(db, 'project_divisions'), (snapshot) => {
      const divs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setDivisionsDb(divs);
      try { localStorage.setItem('cache_project_divisions', JSON.stringify(divs)); } catch {}
    });

    return () => {
      unsub();
      unsubDivs();
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAdd = (divisionId: string, isFeatured: boolean) => {
    setActiveDivision(divisionId);
    setIsActiveFeatured(isFeatured);
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setActiveDivision(item.divisionId);
    setIsActiveFeatured(item.isFeatured);
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await setDoc(doc(db, 'projects', id), { deleted: true });
    }
  };

  const handleEditDiv = (divItem: any) => {
    setEditingDiv(divItem);
    setDivModalOpen(true);
  };

  // Group projects by division
  const groupedData = fallbackDivisions.map(div => {
    const dbDiv = divisionsDb.find(d => d.id === div.id);
    const title = dbDiv?.title || div.title;

    const divProjects = projects.filter(p => p.divisionId === div.id && !p.deleted);
    const deletedIds = new Set(projects.filter(p => p.deleted).map(p => p.id));
    
    const isFeaturedDeleted = deletedIds.has(div.featured.id);
    const activeFallbackFeatured = isFeaturedDeleted ? null : div.featured;
    
    const realFeatured = divProjects.find(p => p.id === div.featured.id) || divProjects.find(p => p.isFeatured);
    const featured = realFeatured || (activeFallbackFeatured ? { ...activeFallbackFeatured, divisionId: div.id, isFeatured: true } : null);
    
    const activeFallbackSecondary = div.secondary.filter(fbSec => !deletedIds.has(fbSec.id));
    
    const mergedSecondary = activeFallbackSecondary.map(fbSec => {
      const realSec = divProjects.find(p => p.id === fbSec.id);
      return realSec || { ...fbSec, divisionId: div.id, isFeatured: false };
    });
    
    const extraSecondary = divProjects.filter(p => !p.isFeatured && !div.secondary.find(fb => fb.id === p.id));
    const secondary = [...mergedSecondary, ...extraSecondary];

    return { 
      ...div, 
      title,
      featured, 
      secondary
    };
  });

  return (
    <section id="projects" className={`relative py-16 md:py-24 bg-surface-container-high border-t border-outline overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Architectural Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] select-none flex flex-col justify-center w-full z-0">
        <span className="font-display-xl text-[120px] lg:text-[250px] leading-[0.8] text-primary text-left pl-[2%]">SELECTED</span>
        <span className="font-display-xl text-[120px] lg:text-[250px] leading-[0.8] text-primary text-right pr-[2%]">PROJECTS</span>
      </div>

      <div className="relative z-10 w-full">
        {/* Header Container */}
        <div className="w-full z-20 px-4 sm:px-6 md:px-8 xl:px-margin-desktop max-w-container-max mx-auto mb-8 lg:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div>
              <span className="font-label-caps text-xs sm:text-label-caps text-on-surface-variant mb-4 block">04. PORTFOLIO</span>
              <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl lg:text-headline-lg uppercase text-on-surface break-words">SELECTED <span className="text-primary block md:inline">PROJECTS</span></h2>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <button onClick={() => scroll('left')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-colors cursor-pointer" aria-label="Scroll left"><span className="material-symbols-outlined">arrow_back</span></button>
              <button onClick={() => scroll('right')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-colors cursor-pointer" aria-label="Scroll right"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </motion.div>
        </div>

        {/* Swipeable Horizontal Gallery */}
        <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 xl:px-margin-desktop pb-12 pt-4 hide-scrollbar">
          <div className="w-[calc((100vw-min(100vw,1600px))/2)] flex-shrink-0 hidden xl:block"></div>

          {groupedData.map((division, index) => (
            <motion.div 
              key={division.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex-shrink-0 w-[88vw] sm:w-[82vw] md:w-[75vw] lg:w-[70vw] xl:w-[1200px] snap-center bg-surface border border-outline rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline relative group/div">
                <div className="flex items-center gap-4">
                  <h3 className="font-headline-md text-xl sm:text-2xl md:text-3xl uppercase tracking-tighter break-words">{division.title}</h3>
                  {isAdmin && (
                    <div className="opacity-0 group-hover/div:opacity-100 transition-opacity">
                      <InlineEditControls onEdit={() => handleEditDiv({ id: division.id, title: division.title })} />
                    </div>
                  )}
                </div>
                <span className="font-label-caps text-on-surface-variant text-sm">0{index + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Featured Project */}
                {division.featured && (
                  <div className="relative md:col-span-7 group cursor-pointer border border-transparent hover:border-outline/50 p-2 -m-2 rounded-2xl transition-colors">
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-30">
                        <InlineEditControls 
                          onEdit={() => handleEdit(division.featured)}
                          onDelete={division.featured.id ? () => handleDelete(division.featured.id) : undefined}
                        />
                      </div>
                    )}
                    <div className="relative overflow-hidden aspect-[16/9] mb-4 rounded-2xl flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                      {division.featured.images?.map((imgUrl: any, idx: number) => (
                        <div key={idx} className="w-full flex-shrink-0 snap-center relative">
                          <ResponsiveImage src={imgUrl} alt={division.featured.title} focus={division.featured.image_focus} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
                        </div>
                      ))}
                      {(!division.featured.images || division.featured.images.length === 0) && (
                         <div className="absolute inset-0 w-full h-full bg-surface-variant flex items-center justify-center">No image</div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mt-2 gap-2">
                      <div>
                        <h4 className="text-lg sm:text-xl md:text-2xl font-bold uppercase mb-2 break-words">{division.featured.title}</h4>
                        <p className="text-on-surface-variant text-xs sm:text-sm whitespace-pre-wrap break-words">{division.featured.desc}</p>
                      </div>
                      {division.featured.year && <span className="font-label-caps text-xs opacity-60 bg-surface-variant px-3 py-1 rounded-full flex-shrink-0 ml-2">{division.featured.year}</span>}
                    </div>
                  </div>
                )}

                {/* Secondary Projects */}
                <div className="md:col-span-5 flex flex-col gap-4 md:gap-6 justify-end relative">
                  {isAdmin && (
                    <div className="absolute -top-12 right-0 z-30">
                       <button onClick={() => handleAdd(division.id, false)} className="text-sm bg-primary text-on-primary px-4 py-2 rounded-full hover:opacity-90 shadow-lg">Add Secondary Project</button>
                    </div>
                  )}
                  {division.secondary.map((sec: any, idx: number) => (
                    <div key={sec.id || idx} className="relative group cursor-pointer border border-transparent hover:border-outline/50 p-2 -m-2 rounded-xl transition-colors">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 z-30">
                          <InlineEditControls 
                            onEdit={() => handleEdit(sec)}
                            onDelete={sec.id ? () => handleDelete(sec.id) : undefined}
                          />
                        </div>
                      )}
                      <div className="relative overflow-hidden aspect-[2/1] mb-3 rounded-xl flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                        {sec.images?.map((imgUrl: any, i: number) => (
                          <div key={i} className="w-full flex-shrink-0 snap-center relative">
                            <ResponsiveImage src={imgUrl} alt={sec.title} focus={sec.image_focus} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                          </div>
                        ))}
                        {(!sec.images || sec.images.length === 0) && (
                          <div className="absolute inset-0 w-full h-full bg-surface-variant flex items-center justify-center">No image</div>
                        )}
                      </div>
                      <h4 className="text-lg md:text-xl font-bold uppercase mb-1">{sec.title}</h4>
                      <p className="text-on-surface-variant text-xs whitespace-pre-wrap">{sec.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
          <div className="w-[10vw] flex-shrink-0"></div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Project' : 'Add New Project'}
        collectionName="projects"
        docId={editingItem?.id}
        initialData={editingItem ? editingItem : { divisionId: activeDivision, isFeatured: isActiveFeatured }}
        fields={projectFields}
      />
      
      <ItemEditorModal
        isOpen={divModalOpen}
        onClose={() => setDivModalOpen(false)}
        title="Edit Division Title"
        collectionName="project_divisions"
        docId={editingDiv?.id}
        initialData={editingDiv || {}}
        fields={divisionFields}
      />
    </section>
  );
};

export default ProjectsSection;
