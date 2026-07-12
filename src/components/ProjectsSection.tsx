import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';

import project1 from '../assets/motor-2.png';
import project2 from '../assets/motor-3.png';
import project3 from '../assets/motor-4.png';

// Fallback Data
const fallbackDivisions = [
  {
    id: 'motors',
    title: 'MOTORS DIVISION',
    featured: { title: 'Vantage Bespoke R', desc: 'High-Performance Automotive • Global', year: '2026', images: [project2] },
    secondary: [
      { title: 'Apex V8 Engine', desc: 'Powertrain R&D • Stuttgart, DE', images: [project1] },
      { title: 'Aero Dynamics Lab', desc: 'Testing Facility • Silverstone, UK', images: [project3] }
    ]
  },
  {
    id: 'real-estate',
    title: 'REAL ESTATE',
    featured: { title: 'The Apex Tower', desc: 'Commercial Real Estate • London, UK', year: '2027', images: [project1] },
    secondary: [
      { title: 'Azure Coast Villas', desc: 'Luxury Residential • Monaco', images: [project3] },
      { title: 'Monolith Hub', desc: 'Mixed-Use Development • New York, USA', images: [project2] }
    ]
  },
  {
    id: 'constructions',
    title: 'CONSTRUCTIONS',
    featured: { title: 'Neo-Infrastructure Link', desc: 'Civil Engineering • Dubai, UAE', year: '2025', images: [project3] },
    secondary: [
      { title: 'Subterranean Network', desc: 'Transit System • Tokyo, JP', images: [project2] },
      { title: 'Desert Bloom Highway', desc: 'Infrastructure • Saudi Arabia', images: [project1] }
    ]
  }
];

const projectFields: FieldConfig[] = [
  { name: 'title', label: 'Project Title', type: 'text', required: true },
  { name: 'desc', label: 'Description', type: 'textarea', required: true },
  { name: 'year', label: 'Year (for Featured only)', type: 'text' },
  { name: 'images', label: 'Project Images (Upload multiple)', type: 'image-gallery' },
];

const ProjectsSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeDivision, setActiveDivision] = useState<string>('motors');
  const [isActiveFeatured, setIsActiveFeatured] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    });
    return () => unsub();
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
      await deleteDoc(doc(db, 'projects', id));
    }
  };

  // Group projects by division
  const groupedData = fallbackDivisions.map(div => {
    const divProjects = projects.filter(p => p.divisionId === div.id);
    const featured = divProjects.find(p => p.isFeatured) || { ...div.featured, divisionId: div.id, isFeatured: true };
    const secondary = divProjects.filter(p => !p.isFeatured);
    return { 
      ...div, 
      featured, 
      secondary: secondary.length > 0 ? secondary : div.secondary.map(s => ({ ...s, divisionId: div.id, isFeatured: false })) 
    };
  });

  return (
    <section id="projects" className="relative py-16 md:py-24 bg-surface-container-high border-t border-outline overflow-hidden">
      
      {/* Background Architectural Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] select-none flex flex-col justify-center w-full z-0">
        <span className="font-display-xl text-[120px] lg:text-[250px] leading-[0.8] text-primary text-left pl-[2%]">SELECTED</span>
        <span className="font-display-xl text-[120px] lg:text-[250px] leading-[0.8] text-primary text-right pr-[2%]">PROJECTS</span>
      </div>

      <div className="relative z-10 w-full">
        {/* Header Container */}
        <div className="w-full z-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-8 lg:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-4 block">04. PORTFOLIO</span>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-surface">SELECTED <span className="text-primary block md:inline">PROJECTS</span></h2>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
              <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-colors"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </motion.div>
        </div>

        {/* Swipeable Horizontal Gallery */}
        <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory gap-8 px-margin-mobile md:px-margin-desktop pb-12 pt-4 hide-scrollbar">
          <div className="w-[calc((100vw-min(100vw,1600px))/2)] flex-shrink-0 hidden xl:block"></div>

          {groupedData.map((division, index) => (
            <motion.div 
              key={division.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex-shrink-0 w-[85vw] md:w-[75vw] lg:w-[70vw] xl:w-[1200px] snap-center bg-surface border border-outline rounded-[2.5rem] p-6 md:p-8 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline">
                <h3 className="font-headline-md text-2xl md:text-3xl uppercase tracking-tighter">{division.title}</h3>
                <span className="font-label-caps text-on-surface-variant text-sm">0{index + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Featured Project */}
                <div className="relative md:col-span-7 group cursor-pointer border border-transparent hover:border-outline/50 p-2 -m-2 rounded-2xl transition-colors">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-50">
                      <InlineEditControls 
                        onEdit={() => handleEdit(division.featured)}
                        onDelete={division.featured.id ? () => handleDelete(division.featured.id) : undefined}
                      />
                    </div>
                  )}
                  <div className="relative overflow-hidden aspect-[16/9] mb-4 rounded-2xl flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                    {division.featured.images?.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="w-full flex-shrink-0 snap-center relative">
                        <img src={imgUrl} alt={division.featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                      </div>
                    ))}
                    {(!division.featured.images || division.featured.images.length === 0) && (
                       <div className="absolute inset-0 w-full h-full bg-surface-variant flex items-center justify-center">No image</div>
                    )}
                  </div>
                  <div className="flex justify-between items-start mt-2">
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold uppercase mb-2">{division.featured.title}</h4>
                      <p className="text-on-surface-variant text-sm whitespace-pre-wrap">{division.featured.desc}</p>
                    </div>
                    {division.featured.year && <span className="font-label-caps text-xs opacity-60 bg-surface-variant px-3 py-1 rounded-full flex-shrink-0 ml-4">{division.featured.year}</span>}
                  </div>
                </div>

                {/* Secondary Projects */}
                <div className="md:col-span-5 flex flex-col gap-4 md:gap-6 justify-end relative">
                  {isAdmin && (
                    <div className="absolute -top-12 right-0 z-50">
                       <button onClick={() => handleAdd(division.id, false)} className="text-sm bg-primary text-on-primary px-4 py-2 rounded-full hover:opacity-90 shadow-lg">Add Secondary Project</button>
                    </div>
                  )}
                  {division.secondary.map((sec: any, idx: number) => (
                    <div key={sec.id || idx} className="relative group cursor-pointer border border-transparent hover:border-outline/50 p-2 -m-2 rounded-xl transition-colors">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 z-50">
                          <InlineEditControls 
                            onEdit={() => handleEdit(sec)}
                            onDelete={sec.id ? () => handleDelete(sec.id) : undefined}
                          />
                        </div>
                      )}
                      <div className="relative overflow-hidden aspect-[2/1] mb-3 rounded-xl flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                        {sec.images?.map((imgUrl: string, i: number) => (
                          <img key={i} src={imgUrl} alt={sec.title} className="w-full flex-shrink-0 snap-center object-cover transition-transform duration-1000 group-hover:scale-105" />
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
    </section>
  );
};

export default ProjectsSection;
