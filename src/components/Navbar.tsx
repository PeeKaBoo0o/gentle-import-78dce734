import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import tbnClean from '@/assets/tbn-clean.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleNavClick = (link: { label: string; id: string; route?: string }) => {
    if (link.route) {
      navigate(link.route);
    } else {
      scrollTo(link.id);
    }
    setMobileOpen(false);
  };

  const links = [
    { label: 'Kịch bản', id: 'scenarios', route: '/scenarios' },
    { label: 'Tin Tức', id: 'news' },
    { label: 'Phân tích', id: 'analysis' },
    { label: 'Indicators', id: 'indicators' },
    { label: 'Lịch Kinh Tế', id: 'calendar' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 bg-background/60 backdrop-blur-xl border-b border-border/30 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center cursor-pointer -my-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={tbnClean} alt="TBN" className="h-16 w-auto" style={{ filter: 'brightness(1.5) sepia(0.3) saturate(1.2)' }} />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button key={link.id} onClick={() => handleNavClick(link)} className="nav-link">
              {link.label}
            </button>
          ))}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-border/30 pt-4">
          {links.map((link) => (
            <button key={link.id} onClick={() => handleNavClick(link)} className="nav-link text-left">
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
