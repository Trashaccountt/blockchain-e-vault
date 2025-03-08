
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if user is on authentication pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Check if user is logged in - to be connected with Auth context later
  const isLoggedIn = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = isLoggedIn
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Documents', path: '/documents' },
        { name: 'Upload', path: '/upload' },
        { name: 'Profile', path: '/profile' },
      ]
    : [
        { name: 'Features', path: '/#features' },
        { name: 'How it Works', path: '/#how-it-works' },
        { name: 'About', path: '/#about' },
      ];

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'py-2 bg-white/80 backdrop-blur-lg shadow-sm'
          : 'py-4 bg-transparent'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-primary flex items-center gap-2"
        >
          <span className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
            E
          </span>
          <span className="hidden sm:inline-block">E-Vault</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'px-4 py-2 rounded-md text-gray-700 hover:text-primary transition-colors',
                location.pathname === item.path && 'text-primary font-medium'
              )}
            >
              {item.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <Button
              variant="ghost"
              onClick={() => {/* Handle logout */}}
              className="ml-2"
            >
              Log Out
            </Button>
          ) : (
            <div className="flex space-x-2 ml-2">
              <Button
                variant="ghost"
                asChild
                className="text-gray-700 hover:text-primary"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="animate-fade-in">
                <Link to="/signup" className="flex items-center gap-1">
                  <LogIn className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-down">
          <div className="container-custom py-4 flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-md text-gray-700 hover:text-primary transition-colors',
                  location.pathname === item.path && 'text-primary font-medium'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={() => {
                  /* Handle logout */
                  setIsMobileMenuOpen(false);
                }}
              >
                Log Out
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  asChild
                  className="text-gray-700 hover:text-primary justify-start"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start"
                >
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-1"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
