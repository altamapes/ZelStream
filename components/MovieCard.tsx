import React from 'react';
import { Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieItem } from '../types';

interface MovieCardProps {
  movie: MovieItem;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link 
      to={`/detail/${encodeURIComponent(movie.detailPath)}`}
      className="group relative block bg-brand-card rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-xl"
    >
      <div className="aspect-poster relative overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-60"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-brand-red rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
             <Play className="w-6 h-6 text-white fill-current" />
           </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          {movie.rating || 'N/A'}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
          <span>{movie.year || 'Unknown'}</span>
          <span className="border border-gray-700 px-1 rounded">{movie.type || 'TV'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;