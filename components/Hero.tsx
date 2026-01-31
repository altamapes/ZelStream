import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieItem } from '../types';

interface HeroProps {
  movies: MovieItem[];
}

const Hero: React.FC<HeroProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate hero slider
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5)); // Cycle through top 5
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  if (movies.length === 0) {
    return (
      <div className="w-full h-[50vh] md:h-[70vh] bg-brand-card animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const movie = movies[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent z-10" />
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-80" 
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-16 md:mt-0">
          <div className="max-w-xl space-y-4">
            <span className="inline-block px-2 py-1 bg-brand-red text-white text-xs font-bold rounded uppercase tracking-wider">
              Trending #{currentIndex + 1}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg line-clamp-2">
              {movie.title}
            </h1>
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-200">
               <span className="text-green-400 font-bold">{movie.rating} Rating</span>
               <span>{movie.year}</span>
               <span className="capitalize">{movie.type}</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base line-clamp-3 md:line-clamp-4">
              {movie.genre}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Link 
                to={`/detail/${encodeURIComponent(movie.detailPath)}`}
                className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Now
              </Link>
              <Link 
                to={`/detail/${encodeURIComponent(movie.detailPath)}`}
                className="flex items-center gap-2 bg-gray-500/40 backdrop-blur-sm text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-gray-500/60 transition-colors"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        {movies.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-4 bg-gray-500 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;