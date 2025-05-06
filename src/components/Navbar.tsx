import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, GitCompare, Brain } from 'lucide-react';
import SearchBar from './SearchBar';
import auteurLogo from '@/assets/auteureye-logo.svg'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = useMemo(() => [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/quiz', icon: Brain, label: 'Quiz' },
    { path: '/compare', icon: GitCompare, label: 'Compare' },
  ], []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav 
        initial={false}
        animate={{ y: isOpen ? 0 : -5, opacity: 1 }}
        className="fixed top-6 z-50 hidden md:flex w-full px-6 justify-center items-center gap-4"
      >
        {/* Logo and Left Nav Items */}
        <motion.div
          className="backdrop-blur-md bg-auteur-bg-card/80 px-4 py-1.5 rounded-2xl 
                     shadow-lg border border-auteur-neutral/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Link to="/">
              <img src={auteurLogo} alt="AuteurEye Logo"
                className="h-6 transition-all duration-300 ease-in-out hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              />
            </Link>
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 group ml-4"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      size={18}
                      className={`transition-colors duration-200
                        ${isActive(item.path) 
                          ? 'text-white' 
                          : 'text-auteur-primary group-hover:text-white'}`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors duration-200
                        ${isActive(item.path)
                          ? 'text-white'
                          : 'text-auteur-primary group-hover:text-white'}`}
                    >
                      {item.label}
                    </span>
                  </span>
                  
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-indicator-left"
                      className="absolute inset-0 bg-auteur-accent rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="backdrop-blur-md bg-auteur-bg-card/80 p-1.5 rounded-2xl 
                     shadow-lg border border-auteur-neutral/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <SearchBar />
        </motion.div>

        {/* Right Nav Items */}
        <motion.div
          className="backdrop-blur-md bg-auteur-bg-card/80 p-1.5 rounded-2xl 
                     shadow-lg border border-auteur-neutral/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      size={18}
                      className={`transition-colors duration-200
                        ${isActive(item.path) 
                          ? 'text-white' 
                          : 'text-auteur-primary group-hover:text-white'}`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors duration-200
                        ${isActive(item.path)
                          ? 'text-white'
                          : 'text-auteur-primary group-hover:text-white'}`}
                    >
                      {item.label}
                    </span>
                  </span>
                  
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-indicator-right"
                      className="absolute inset-0 bg-auteur-accent rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="fixed inset-x-0 bottom-6 z-50 px-4 md:hidden">
        <motion.div
          initial={false}
          animate={{ 
            y: isOpen ? -20 : 0,
            scale: isOpen ? 0.95 : 1
          }}
          className="backdrop-blur-xl bg-auteur-bg-card/40 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] 
                     border border-white/10 p-4"
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={auteurLogo} alt="AuteurEye Logo" 
                className="h-6 transition-all duration-300 ease-in-out hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
              />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? (
                    <X className="text-auteur-primary" />
                  ) : (
                    <Menu className="text-auteur-primary" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <div className="px-2">
                    <SearchBar />
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                          ${isActive(item.path)
                            ? 'bg-auteur-accent/90 text-white shadow-lg'
                            : 'hover:bg-white/10 text-auteur-primary'}`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;