import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PremiumToggle from './PremiumToggle';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAdmin } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-margin-desktop py-2.5 sm:py-3 w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <a 
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 cursor-pointer select-none group" 
          onClick={handleLogoClick}
          aria-label="VB Associates Home"
        >
          <picture className="flex-shrink-0">
            <source srcSet={`${import.meta.env.BASE_URL}logo.webp`} type="image/webp" />
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="VB Associates Logo" 
              width="48"
              height="48"
              fetchPriority="high"
              decoding="async"
              className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105 flex-shrink-0" 
            />
          </picture>
          <span className="font-headline-md text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-headline-md text-on-surface tracking-tighter whitespace-nowrap">
            VB ASSOCIATES
          </span>
        </a>

        {/* Desktop Navigation Links (Visible on lg and above: 1024px+) */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8 2xl:gap-10 min-w-0">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id && location.pathname === '/';
            return (
              <a 
                key={link.id}
                className={`font-label-caps text-xs xl:text-label-caps uppercase tracking-wider xl:tracking-widest whitespace-nowrap transition-all duration-200 ease-in-out cursor-pointer py-1 ${
                  isActive 
                    ? 'text-on-surface font-bold border-b-2 border-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`} 
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            );
          })}
          {isAdmin && (
            <a 
              className={`font-label-caps text-xs xl:text-label-caps uppercase tracking-wider xl:tracking-widest whitespace-nowrap transition-all duration-200 ease-in-out cursor-pointer py-1 ${
                location.pathname === '/admin' 
                  ? 'text-on-surface font-bold border-b-2 border-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`} 
              onClick={() => navigate('/admin')}
            >
              ADMIN
            </a>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
          <a 
            onClick={(e) => handleNavClick(e, 'contact')} 
            className="inline-block font-label-caps text-xs xl:text-label-caps uppercase tracking-wider xl:tracking-widest bg-on-surface text-background px-4 py-2 xl:px-8 xl:py-2.5 hover:bg-primary hover:text-on-primary transition-colors duration-300 text-center whitespace-nowrap cursor-pointer shadow-sm"
          >
            CONTACT GROUP
          </a>
          <PremiumToggle />
        </div>

        {/* Mobile & Tablet Hamburger Toggle (Visible below lg: foldables, phones, portrait & small tablets) */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="scale-90 origin-right">
            <PremiumToggle />
          </div>
          <button 
            ref={buttonRef}
            className="text-on-surface p-1.5 rounded-md hover:bg-surface-variant transition-colors flex items-center justify-center focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      <div 
        ref={menuRef}
        className={`lg:hidden absolute top-full left-0 w-full bg-surface/98 backdrop-blur-xl border-b border-outline-variant shadow-2xl transition-all duration-300 ease-in-out origin-top overflow-y-auto ${
          isMobileMenuOpen 
            ? 'max-h-[calc(100vh-65px)] opacity-100 py-6 px-6 pointer-events-auto' 
            : 'max-h-0 opacity-0 py-0 px-6 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-4 items-center max-w-sm mx-auto text-center">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id && location.pathname === '/';
            return (
              <a 
                key={link.id}
                className={`font-label-caps text-sm uppercase tracking-widest transition-all duration-200 cursor-pointer py-2 w-full rounded-md ${
                  isActive 
                    ? 'text-on-surface font-bold bg-surface-variant' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                }`} 
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            );
          })}
          {isAdmin && (
            <a 
              className={`font-label-caps text-sm uppercase tracking-widest transition-all duration-200 cursor-pointer py-2 w-full rounded-md ${
                location.pathname === '/admin' 
                  ? 'text-on-surface font-bold bg-surface-variant' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
              }`} 
              onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
            >
              ADMIN
            </a>
          )}
          <a 
            onClick={(e) => handleNavClick(e, 'contact')} 
            className="font-label-caps text-sm uppercase tracking-widest bg-on-surface text-background px-8 py-3.5 hover:bg-primary hover:text-on-primary transition-colors duration-300 text-center w-full mt-2 cursor-pointer shadow-md"
          >
            CONTACT GROUP
          </a>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
