import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import { CardSkeleton } from '../components/Skeleton';
import { fetchContent } from '../services/api';
import { MovieItem, CategoryAction, CATEGORIES } from '../types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Section: React.FC<{ title: string; action: string; link: string }> = ({ title, action, link }) => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent(action, 1).then((data) => {
      setMovies(data.items.slice(0, 8)); // Show top 8
      setLoading(false);
    });
  }, [action]);

  if (!loading && movies.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white hover:text-brand-red transition-colors">
          <Link to={link}>{title}</Link>
        </h2>
        <Link to={link} className="text-xs md:text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 group">
          See All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading 
            ? Array(5).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : movies.map((movie) => <MovieCard key={movie.id || movie.title} movie={movie} />)
          }
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [trending, setTrending] = useState<MovieItem[]>([]);

  useEffect(() => {
    fetchContent(CategoryAction.TRENDING, 1).then((data) => {
      setTrending(data.items);
    });
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      <Hero movies={trending} />
      
      <div className="relative z-10 -mt-20 md:-mt-32 space-y-4">
        {/* Sections */}
        <Section 
          title="Trending Now" 
          action={CategoryAction.TRENDING} 
          link={`/category/${CategoryAction.TRENDING}`}
        />
        <Section 
          title="Indonesian Movies" 
          action={CategoryAction.INDONESIAN_MOVIES} 
          link={`/category/${CategoryAction.INDONESIAN_MOVIES}`}
        />
        <Section 
          title="K-Drama" 
          action={CategoryAction.KDRAMA} 
          link={`/category/${CategoryAction.KDRAMA}`}
        />
        <Section 
          title="Anime Series" 
          action={CategoryAction.ANIME} 
          link={`/category/${CategoryAction.ANIME}`}
        />
         <Section 
          title="Indonesian Drama" 
          action={CategoryAction.INDONESIAN_DRAMA} 
          link={`/category/${CategoryAction.INDONESIAN_DRAMA}`}
        />
      </div>
    </div>
  );
};

export default Home;