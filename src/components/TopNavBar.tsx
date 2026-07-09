import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PremiumToggle from './PremiumToggle';

const navLinks = [
  { id: 'about', label: 'ABOUT' },
  { id: 'disciplines', label: 'DISCIPLINES' },
  { id: 'services', label: 'SERVICES' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'journal', label: 'JOURNAL' },
];

const TopNavBar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== '/') return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // offset for navbar
      
      for (const link of navLinks) {
        const element = document.getElementById(link.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(link.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-3 w-full max-w-container-max mx-auto">
        <a className="flex items-center gap-3 font-headline-md text-3xl md:text-headline-md text-on-surface tracking-tighter whitespace-nowrap cursor-pointer" onClick={handleLogoClick}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VB Associates Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm" />
          VB ASSOCIATES
        </a>
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id && location.pathname === '/';
            return (
              <a 
                key={link.id}
                className={`font-label-caps text-label-caps uppercase tracking-widest transition-all duration-300 ease-in-out cursor-pointer ${isActive ? 'text-on-surface font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`} 
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            );
          })}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <a onClick={(e) => handleNavClick(e, 'contact')} className="inline-block font-label-caps text-label-caps uppercase tracking-widest bg-on-surface text-background px-8 py-2 hover:bg-primary hover:text-on-primary transition-colors duration-300 text-center mt-1 cursor-pointer">
            CONTACT GROUP
          </a>
          <PremiumToggle />
        </div>
        <button 
          className="md:hidden text-on-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-lg py-6 px-margin-mobile flex flex-col gap-6 items-center overflow-hidden transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
      >
        {navLinks.map((link) => {
          const isActive = activeSection === link.id && location.pathname === '/';
          return (
            <a 
              key={link.id}
              className={`font-label-caps text-label-caps uppercase tracking-widest transition-all duration-300 ease-in-out cursor-pointer ${isActive ? 'text-on-surface font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`} 
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          );
        })}
        <a 
          onClick={(e) => handleNavClick(e, 'contact')} 
          className="font-label-caps text-label-caps uppercase tracking-widest bg-on-surface text-background px-8 py-3 hover:bg-primary hover:text-on-primary transition-colors duration-300 text-center w-full max-w-xs mt-2 cursor-pointer"
        >
          CONTACT GROUP
        </a>
        <PremiumToggle />
      </div>
    </nav>
  );
};

export default TopNavBar;
