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
            className={`md:hidden p-2 -mr-2 ${showTransparent ? 'text-gray-300' : 'text-text'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-safe pb-safe">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-bold text-lg text-text">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-text-muted hover:text-text transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-white/10">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={isAdultMode ? "Search videos..." : "Search movies..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface transition-all"
              />
            </form>
          </div>

          {/* Mobile Links */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/livetv"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-text-muted hover:text-red-500 hover:bg-white/5 transition-colors"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Live TV
              </Link>
              {isAdmin && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-surface/30">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{user.username}</p>
                    <p className="text-xs text-text-muted">Member</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
