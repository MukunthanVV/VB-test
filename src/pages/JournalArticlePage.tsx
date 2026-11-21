import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import TopNavBar from '../components/TopNavBar';
import NormalFooter from '../components/NormalFooter';

const AnimatedTopo = lazy(() => import('../components/AnimatedTopo'));

const fallbackMap: Record<string, any> = {
  'j1': {
    date: 'JUN 14, 2025',
    category: 'PASSION FOR AUTOMOBILES',
    title: 'The Passion Behind the Drive',
    content: "My interest in automobiles has been a part of my life for as long as I can remember. From an early age, I was naturally drawn to cars—not just as machines that get you from one place to another, but for the engineering, craftsmanship, and thought that goes into creating them. Over the years, that curiosity grew into a deep and lasting passion.\n\nThere is something uniquely satisfying about a well-maintained car, a beautifully designed machine, or a drive on an open road where you can simply enjoy the moment. These are the little things that make my passion for automobiles so enjoyable.\n\nFor me, driving is also a way to step away from the pace of business and everyday responsibilities. A good drive gives me the opportunity to clear my mind, enjoy the road, and appreciate something I have always been genuinely interested in. Whether it is exploring a new car, taking a long drive, or simply spending time around automobiles, this passion continues to remain a meaningful part of my life beyond work.",
  },
  'j2': {
    date: 'MAY 28, 2024',
    category: 'PUBLIC LIFE & CONNECTIONS',
    title: 'A Commitment to Public Life',
    content: "My journey in business has never been about limiting myself to a single industry or following one defined path. I have always been curious about new ideas, different markets, and the opportunities that come with stepping into something unfamiliar. Every new venture has brought its own challenges, lessons, and experiences, shaping the way I look at business and growth.\n\nOver time, that curiosity has developed into a diverse portfolio of ventures across different fields. Each business has its own identity, purpose, and way of operating, but they are all connected by the same ambition—to create something valuable and build it with a sense of responsibility. I believe that entering a new industry is not simply about finding another opportunity; it is about understanding the people, the market, and what it takes to make that venture genuinely meaningful.\n\nRunning multiple businesses has also taught me that growth is never a straight line. Every venture comes with its own learning curve, decisions, successes, and setbacks. These experiences have strengthened my ability to adapt, think differently, and keep moving forward even when the path is uncertain.\n\nWhile the businesses may be different, the principles behind them remain consistent. Quality, trust, commitment, and long-term thinking continue to guide every decision I make. For me, diversification is not about being involved in many things simply for the sake of it—it is about exploring possibilities, creating opportunities, and continuing to grow without losing sight of the values that started the journey.",
  },
  'j3': {
    date: 'MAY 02, 2023',
    category: 'ENTREPRENEURSHIP',
    title: 'A Journey Across Industries',
    content: "My journey in business has never been about staying within a single industry or limiting myself to one particular field. I have always been drawn to new ideas, new challenges, and the possibility of turning a simple thought into something meaningful. For me, every new venture begins with curiosity—the desire to understand a different industry, explore its possibilities, and discover where I can create something valuable. That mindset has encouraged me to step beyond familiar territory and take on opportunities that have brought new experiences and perspectives along the way.\n\nOver time, this curiosity has grown into a diverse portfolio of businesses, each with its own purpose, identity, and character. Some ventures have come from opportunities I recognised along the way, while others have grown from ideas that I believed were worth pursuing. Although the industries and day-to-day operations may be different, I see each venture as part of the same larger journey. Every business has taught me something different about people, markets, decision-making, leadership, and the importance of adapting when circumstances change.\n\nBuilding and managing different businesses has also taught me that success does not come from simply entering a new market. It comes from understanding what that market needs, earning the confidence of people, and consistently delivering on what you promise. There are always challenges when building something from the ground up, but those challenges are also what make the journey rewarding. They push you to think differently, make better decisions, and keep improving with every experience.\n\nWhile the businesses may be different, the values behind them remain the same. Quality, trust, consistency, commitment, and a willingness to keep moving forward continue to shape the way I approach every opportunity. I believe that diversification is not simply about being involved in multiple industries; it is about staying open to possibilities while remaining grounded in the principles that matter most.\n\nFor me, every venture represents another chapter in an ongoing journey—a chance to learn, create, grow, and build something that has lasting value. The industries may continue to evolve and new opportunities may come along, but the ambition remains constant: to keep building, keep learning, and keep moving forward.",
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
      <Suspense fallback={null}>
        <AnimatedTopo />
      </Suspense>
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
