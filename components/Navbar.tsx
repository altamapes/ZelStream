import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Film } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../types';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-brand-dark/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-brand-red font-bold text-2xl tracking-tighter">
              <Film className="w-8 h-8" />
              <span>ZELSTREAM</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
              {CATEGORIES.slice(1, 4).map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {cat.label}
                </Link>
              ))}
              <Link to="/categories" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">All</Link>
            </div>
          </div>

          {/* Search & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-black/40 border border-gray-700 rounded-full px-3 py-1.5 focus-within:border-gray-500 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Titles, people, genres"
                className="bg-transparent border-none focus:outline-none text-sm text-white ml-2 w-48 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <button 
              className="md:hidden text-white p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-dark border-t border-gray-800 absolute w-full px-4 py-4 flex flex-col gap-4 shadow-xl">
           <form onSubmit={handleSearch} className="flex items-center bg-gray-800 rounded px-3 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-white ml-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-300 hover:text-white py-2 border-b border-gray-800">Home</Link>
              {CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="text-gray-300 hover:text-white py-2 border-b border-gray-800"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;