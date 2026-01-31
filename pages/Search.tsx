import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { CardSkeleton } from '../components/Skeleton';
import { searchContent } from '../services/api';
import { MovieItem } from '../types';
import { Search as SearchIcon } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    searchContent(debouncedQuery).then((data) => {
      setResults(data.items);
      setLoading(false);
    });
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-brand-dark pt-20 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SearchIcon className="text-brand-red" />
          Results for "{query}"
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {Array(10).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} />
          ))}
        </div>
      ) : (
        query && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
             <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
             <p className="text-lg">No results found for "{query}"</p>
             <p className="text-sm">Try searching for something else.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Search;