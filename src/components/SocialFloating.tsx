import { Facebook, Instagram, Youtube, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const XIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
  </svg>
);

const SocialFloating = () => {
  const [rotation, setRotation] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const delta = window.scrollY - lastScrollY.current;
      setRotation((prev) => prev + delta * 0.2);
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-[55%] -translate-y-1/2 right-2 z-50 flex flex-col items-center gap-2 rounded-2xl px-1.5 py-3 backdrop-blur-md border border-border/40" style={{ backgroundColor: 'hsl(210 55% 12% / 0.9)' }}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border border-secondary/40"
        style={{ transform: `rotate(${rotation}deg)`, backgroundColor: 'hsl(210 55% 20%)' }}
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-secondary font-bold text-[8px] tracking-tight">TBN</span>
      </div>
      {[
        { icon: <Send size={15} />, href: 'https://t.me/Alphanetvn' },
        { icon: <Facebook size={17} />, href: 'https://www.facebook.com/AlphanetLab/' },
        { icon: <Instagram size={17} />, href: 'https://www.instagram.com/alphanet_lab/' },
        { icon: <XIcon size={15} />, href: 'https://x.com/alphanet01' },
        { icon: <TikTokIcon size={17} />, href: 'https://www.tiktok.com/@alphanetvn' },
        { icon: <Youtube size={17} />, href: 'https://www.youtube.com/channel/UCd-uO6N5PAt9vSnJfQcWscA' },
      ].map((item, i) => (
        <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
          {item.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialFloating;
