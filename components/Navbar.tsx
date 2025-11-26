import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Tv, Heart, AlertCircle, Menu, X, LogOut, Shield, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdultMode = location.pathname.startsWith('/adult');

  // Pages where the navbar should be transparent at the top
  const isTransparentPage = ['/', '/adult'].includes(location.pathname) || location.pathname.startsWith('/watch') || location.pathname.startsWith('/movies/');
  const showTransparent = isTransparentPage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const route = isAdultMode ? '/adult/search' : '/search';
    navigate(`${route}?q=${encodeURIComponent(searchQuery)}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = isAdultMode
    ? [
      { name: 'Home', path: '/adult' },
      { name: 'Latest', path: '/adult/latest' },
      { name: 'Categories', path: '/adult/categories' },
    ]
    : [
      { name: 'Home', path: '/' },
      { name: 'Movies', path: '/movies' },
      { name: 'Genres', path: '/genres' },
      { name: 'Web Series', path: '/webseries' },
      { name: 'Favorites', path: '/favorites' },
      { name: 'History', path: '/history' },
    ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${showTransparent
      ? 'bg-transparent'
      : 'bg-background/95 backdrop-blur-md border-b border-white/5 shadow-sm'
      }`}>
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl ${isAdultMode ? 'bg-secondary' : 'bg-primary'}`}>
            {isAdultMode ? 'X' : 'C'}
          </div>
          <span className={`font-bold text-xl tracking-tight hidden sm:block ${showTransparent ? 'text-white' : 'text-text'
            }`}>
            {isAdultMode ? 'AfterDark' : 'CineStream Pro AfterDark'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${showTransparent
                ? 'text-gray-300 hover:text-white'
                : 'text-text-muted hover:text-primary'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/livetv"
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${showTransparent
              ? 'text-gray-300 hover:text-red-500'
              : 'text-text-muted hover:text-red-500'
              }`}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Live TV
          </Link>
          {isAdmin && (
            <Link to="/admin-dashboard" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex relative items-center">
            <Search className={`absolute left-3 w-4 h-4 ${showTransparent ? 'text-gray-400' : 'text-text-muted'}`} />
            <input
              type="text"
              placeholder={isAdultMode ? "Search videos..." : "Search movies..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`border rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none transition-all w-48 lg:w-64 ${showTransparent
                ? 'bg-white/10 border-white/10 focus:border-white/30 focus:bg-white/20 text-white placeholder-gray-400'
                : 'bg-surface border-white/10 focus:border-primary/50 focus:bg-surface text-text placeholder-text-muted'
                }`}
            />
          </form>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${showTransparent
              ? 'text-gray-300 hover:bg-white/10'
              : 'text-text-muted hover:bg-surface'
              }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => navigate(isAdultMode ? '/' : '/adult')}
            className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${isAdultMode
              ? 'border-primary text-primary hover:bg-primary hover:text-black'
              : 'border-secondary text-secondary hover:bg-secondary hover:text-white'
              }`}
          >
            {isAdultMode ? 'SAFE MODE' : '18+'}
          </button>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${showTransparent
                ? 'bg-white/10 border-white/10'
                : 'bg-surface border-white/10'
                }`}>
                <User className={`w-4 h-4 ${showTransparent ? 'text-gray-400' : 'text-text-muted'}`} />
                <span className={`text-sm ${showTransparent ? 'text-gray-300' : 'text-text'}`}>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="Logout"
              >
                <LogOut className={`w-4 h-4 ${showTransparent ? 'text-gray-400' : 'text-text-muted'} group-hover:text-red-400`} />
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className={`md:hidden ${showTransparent ? 'text-gray-300' : 'text-text'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl animate-slide-up">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-text placeholder-text-muted"
            />
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-text-muted hover:text-primary py-2 border-b border-white/5"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-purple-400 hover:text-purple-300 py-2 border-b border-white/5 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
          {user && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
