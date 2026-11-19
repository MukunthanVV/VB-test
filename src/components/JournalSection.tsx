import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';

const fallbackJournals = [
  {
    id: 'j1',
    date: 'JUN 14, 2026',
    category: 'PRESS RELEASE',
    title: 'VB Associates Announces £1.2B Infrastructure Expansion in the Middle East.',
  },
  {
    id: 'j2',
    date: 'MAY 28, 2026',
    category: 'MARKET INSIGHTS',
    title: 'The Future of High-Performance Engineering in the Era of Sustainability.',
  },
  {
    id: 'j3',
    date: 'MAY 02, 2026',
    category: 'REAL ESTATE',
    title: 'Topping Out Ceremony Held for The Apex Tower in Central London.',
  },
];

const journalFields: FieldConfig[] = [
  { name: 'date', label: 'Date', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'textarea', required: true },
  { name: 'content', label: 'Full Article Content (New lines will be preserved)', type: 'textarea' },
];

const JournalSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'journals'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      
      const activeData = data.filter(d => !d.deleted);
      const deletedIds = new Set(data.filter(d => d.deleted).map(d => d.id));
      
      const activeFallbacks = fallbackJournals.filter(fb => !deletedIds.has(fb.id));

      const mergedData = activeFallbacks.map(fb => {
        const real = activeData.find(d => d.id === fb.id);
        return real || fb;
      });
      const extra = activeData.filter(d => !fallbackJournals.find(fb => fb.id === d.id));
      setJournals([...mergedData, ...extra]);
      setIsLoaded(true);
    }, (error) => {
      console.error(error);
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const displayData = journals.length > 0 ? journals : fallbackJournals;

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this journal entry?')) {
      await setDoc(doc(db, 'journals', id), { deleted: true });
    }
  };

  return (
    <section id="journal" className={`relative py-16 sm:py-24 md:py-section-gap px-4 sm:px-6 md:px-8 xl:px-margin-desktop bg-transparent border-t border-outline overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 max-w-container-max mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-24 gap-6 relative"
        >
          <div>
            <span className="font-label-caps text-xs sm:text-label-caps text-on-surface-variant mb-4 block">05. INSIGHTS</span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-headline-lg-mobile lg:text-headline-lg uppercase text-on-surface break-words">THE <span className="text-primary block md:inline">JOURNAL</span></h2>
          </div>
          
          <div className="flex gap-4 items-center">
            {isAdmin && (
              <button onClick={handleAdd} className="text-xs sm:text-sm bg-primary text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:opacity-90 font-bold">
                + Add Entry
              </button>
            )}
            <button className="group flex items-center gap-3 sm:gap-4 border-b border-on-surface pb-2 text-xs sm:text-sm font-label-caps tracking-widest uppercase hover:text-primary hover:border-primary transition-colors">
              READ ALL ARTICLES
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_right_alt</span>
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col border-t border-on-surface/20">
          {displayData.map((entry, index) => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col md:flex-row md:items-center justify-between py-8 sm:py-10 md:py-14 border-b border-on-surface/20 hover:bg-surface-variant transition-colors duration-500 px-3 sm:px-6 md:px-8 w-full rounded-xl"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 z-50">
                  <InlineEditControls 
                    onEdit={() => handleEdit(entry)} 
                    onDelete={() => handleDelete(entry.id)} 
                  />
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 md:gap-12 lg:gap-16 w-full md:w-auto">
                <div className="w-auto sm:w-32 flex flex-row md:flex-col gap-2 md:gap-1 flex-shrink-0">
                  <span className="font-label-caps text-xs opacity-60">{entry.date}</span>
                  <span className="font-label-caps text-[10px] text-primary">{entry.category}</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight max-w-3xl group-hover:translate-x-2 sm:group-hover:translate-x-4 transition-transform duration-500 pr-4 sm:pr-12 break-words">
                  {entry.title}
                </h3>
              </div>
              
              <div className="pt-4 md:pt-0 mt-2 md:mt-0 flex-shrink-0">
                <a 
                  href={`#/journal/${entry.id}`}
                  className="font-label-caps text-xs sm:text-label-caps text-on-surface uppercase hover:text-primary transition-colors flex items-center gap-2"
                >
                  READ DISPATCH <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <ItemEditorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingItem ? 'Edit Journal Entry' : 'Add Journal Entry'}
          collectionName="journals"
          docId={editingItem?.id}
          initialData={editingItem}
          fields={journalFields}
        />
      )}
    </section>
  );
};

export default JournalSection;
