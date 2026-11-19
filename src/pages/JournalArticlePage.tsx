import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import TopNavBar from '../components/TopNavBar';
import NormalFooter from '../components/NormalFooter';
import AnimatedTopo from '../components/AnimatedTopo';

const fallbackMap: Record<string, any> = {
  'j1': {
    date: 'JUN 14, 2026',
    category: 'PRESS RELEASE',
    title: 'VB Associates Announces £1.2B Infrastructure Expansion in the Middle East.',
    content: 'We are thrilled to announce a landmark £1.2B expansion in the Middle East, cementing our position as a global leader in complex infrastructure. This comprehensive project will span multiple sectors including commercial development, advanced logistics hubs, and sustainable energy facilities.\n\nOver the next five years, this initiative will create thousands of local jobs and introduce state-of-the-art engineering practices to the region. We are working closely with regional governments to ensure that all developments meet the highest standards of environmental sustainability and cultural integration.\n\nThis expansion represents a significant milestone in our global growth strategy and underscores our commitment to delivering unparalleled excellence on a massive scale.',
  },
  'j2': {
    date: 'MAY 28, 2026',
    category: 'MARKET INSIGHTS',
    title: 'The Future of High-Performance Engineering in the Era of Sustainability.',
    content: 'As the global push for sustainability intensifies, high-performance engineering is undergoing a radical transformation. The challenge is no longer just about speed, power, or structural integrity; it is about achieving these metrics while drastically reducing carbon footprints.\n\nOur latest research indicates a massive shift towards advanced composite materials that offer superior strength-to-weight ratios compared to traditional steel, while requiring significantly less energy to produce. Furthermore, AI-driven aerodynamic modeling is allowing us to achieve unprecedented efficiency in automotive and aerospace applications.\n\nThe future belongs to those who can seamlessly blend peak performance with environmental responsibility.',
  },
  'j3': {
    date: 'MAY 02, 2026',
    category: 'REAL ESTATE',
    title: 'Topping Out Ceremony Held for The Apex Tower in Central London.',
    content: 'Today marked a historic moment for VB Associates as we celebrated the topping out of The Apex Tower, our flagship commercial development in the heart of Central London. Standing at 65 stories, it is poised to become one of the most iconic silhouettes on the city skyline.\n\nThe ceremony was attended by the Mayor of London, our chief architects, and key stakeholders. The Apex Tower sets a new standard for modern workspaces, featuring fully integrated smart-building technologies, vertical gardens, and a platinum LEED certification.\n\nInterior fit-outs will commence next month, with the grand opening scheduled for Q3 2027.',
  }
};

const genericFallback = {
  date: 'RECENT',
  category: 'UPDATE',
  title: 'Journal Entry Not Found',
  content: 'The article you are looking for does not exist or has been removed.'
};

const JournalArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const docRef = doc(db, 'journals', id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() });
      } else {
        setArticle(fallbackMap[id] || genericFallback);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setArticle(fallbackMap[id] || genericFallback);
      setLoading(false);
    });
    
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <>
      <AnimatedTopo />
      <TopNavBar />
      
      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-8 xl:px-margin-desktop relative min-h-screen max-w-container-max mx-auto">
        <div className="max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-caps tracking-widest text-xs sm:text-sm mb-8 sm:mb-12">
            <span className="material-symbols-outlined">arrow_back</span>
            BACK TO HOME
          </Link>
          
          <div className="flex flex-col gap-4 mb-8 sm:mb-12">
            <div className="flex items-center gap-4">
              <span className="font-label-caps text-xs sm:text-sm opacity-60">{article.date}</span>
              <span className="w-1 h-1 rounded-full bg-primary"></span>
              <span className="font-label-caps text-xs sm:text-sm text-primary">{article.category}</span>
            </div>
            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-tight break-words">
              {article.title}
            </h1>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-p:font-body-lg prose-p:leading-relaxed whitespace-pre-wrap">
            {article.content || 'No content has been added to this article yet.'}
          </div>
        </div>
      </main>
      
      <NormalFooter />
    </>
  );
};

export default JournalArticlePage;
