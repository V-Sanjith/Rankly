import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: "Today's Race", path: '/leaderboard#race' },
    { name: 'Explore', path: '/explore' },
    { name: 'Transparency', path: '/about#transparency' },
    { name: 'Rules & FAQ', path: '/about#faq' },
    { name: 'Owner Portal', path: '/owner' },
  ];

  const isActive = (path: string) => {
    if (path === '/leaderboard') return (location.pathname === '/leaderboard' || location.pathname === '/') && !location.hash;
    if (path.startsWith('/leaderboard#')) {
      const hash = path.substring('/leaderboard'.length);
      return (location.pathname === '/leaderboard' || location.pathname === '/') && location.hash === hash;
    }
    if (path.includes('#')) {
      const [p, hash] = path.split('#');
      return location.pathname === p && location.hash === `#${hash}`;
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/leaderboard" className="flex items-center gap-1 group">
            <span className="font-display text-2xl font-black tracking-tight text-white group-hover:text-lime transition-colors">
              RANKLY
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-lime shadow-[0_0_12px_#d4ff32]" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-lime font-semibold'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout} className="rounded-full px-5">
                    Logout
                  </Button>
                </>
              ) : (
                <a href="/leaderboard#promote">
                  <Button variant="lime" size="sm" className="rounded-full px-6 py-2 text-xs tracking-wider uppercase font-extrabold shadow-[0_0_20px_rgba(212,255,50,0.25)]">
                    Promote Project
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text-muted hover:text-white p-2" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-surface"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                    isActive(link.path)
                      ? 'text-lime bg-lime/10 font-bold'
                      : 'text-text-muted hover:text-white hover:bg-elevated'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 text-base font-medium text-white hover:bg-elevated rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-base font-medium text-text-muted hover:text-white hover:bg-elevated rounded-xl">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 px-2 pt-2">
                    <a href="/leaderboard#promote" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="lime" className="w-full justify-center rounded-full uppercase font-bold">
                        Promote Project
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
