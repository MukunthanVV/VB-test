import { Suspense, lazy } from 'react';
import TopNavBar from '../components/TopNavBar';
import Hero from '../components/Hero';
import AnimatedTopo from '../components/AnimatedTopo';

const AboutSection = lazy(() => import('../components/AboutSection'));
const MindsetSection = lazy(() => import('../components/MindsetSection'));
const DisciplinesSection = lazy(() => import('../components/DisciplinesSection'));
const DivisionsSection = lazy(() => import('../components/DivisionsSection'));
const ProjectsSection = lazy(() => import('../components/ProjectsSection'));
const JournalSection = lazy(() => import('../components/JournalSection'));
const ContactSection = lazy(() => import('../components/ContactSection'));
const MegaFooter = lazy(() => import('../components/MegaFooter'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection'));

const HomePage = () => {
  return (
    <>
      <AnimatedTopo />
      <TopNavBar />
      <main>
        <Hero />
        <Suspense fallback={<div className="h-screen" />}>
          <AboutSection />
          <MindsetSection />
          <DisciplinesSection />
          <DivisionsSection />
          <TestimonialsSection />
          <ProjectsSection />
          <JournalSection />
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={<div />}>
        <MegaFooter />
      </Suspense>
    </>
  );
};

export default HomePage;
