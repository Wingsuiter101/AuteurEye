import React from 'react';
import tmdbLogo from '@/assets/tmdb-logo.svg';
import { Link } from 'react-router-dom';

interface FooterProps {
  onNavLinkClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavLinkClick }) => (
  <footer className="w-full text-center py-4 text-xs select-none text-auteur-primary/70 md:text-auteur-primary/80 md:bg-neutral-900 md:border-t md:border-white/10 md:shadow-lg flex flex-col md:flex-row md:items-center md:justify-center md:gap-6 gap-2 z-30 relative">
    {/* Mobile layout: stacked */}
    <div className="flex flex-col items-center gap-1 md:hidden">
      <span>&copy; 2025 SD Studios. AuteurEye™. All rights reserved.</span>
      <div className="flex flex-row items-center justify-center gap-4">
        <Link to="/about" className="text-auteur-accent hover:underline" onClick={onNavLinkClick}>About</Link>
        <span>|</span>
        <Link to="/privacy" className="text-auteur-accent hover:underline" onClick={onNavLinkClick}>Privacy</Link>
      </div>
      <div className="w-full flex justify-center my-2">
        <div className="w-2/3 border-t border-white/10" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <img src={tmdbLogo} alt="TMDB Logo" className="h-3" />
        <span className="text-[9px] text-auteur-primary/50">This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
      </div>
    </div>
    {/* Desktop layout: row (already handled) */}
    <div className="hidden md:flex flex-row items-center justify-center gap-6 w-full">
      <span>&copy; 2025 SD Studios. AuteurEye™. All rights reserved.</span>
      <span>|</span>
      <Link to="/about" className="text-auteur-accent hover:underline mx-2">About</Link>
      <span>|</span>
      <Link to="/privacy" className="text-auteur-accent hover:underline mx-2">Privacy</Link>
      <span>|</span>
      <span className="flex items-center gap-2 mx-2">
        <img src={tmdbLogo} alt="TMDB Logo" className="h-4 md:h-4" />
        <span className="text-[10px] text-auteur-primary/50">This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
      </span>
    </div>
  </footer>
);

export default Footer; 