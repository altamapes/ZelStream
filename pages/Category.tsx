import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { CardSkeleton } from '../components/Skeleton';
import { fetchContent } from '../services/api';
import { MovieItem, CATEGORIES } from '../types';

const Category: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categoryLabel = CATEGORIES.find(c => c.id === id)?.label || 'Category';

  useEffect(() => {
    // Reset state when category changes
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    if (id) {
      fetchContent(id, 1).then((data) => {
        setMovies(data.items);
        setHasMore(data.items.length > 0); // Basic check, better if API returned total pages
        setLoading(false);
      });
    }
  }, [id]);

  const loadMore = async () => {
    if (!id || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchContent(id, nextPage);
    
    if (data.items.length === 0) {
      setHasMore(false);
    } else {
      setMovies(prev => [...prev, ...data.items]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-20 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">{categoryLabel}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} />
        ))}
        {loading && Array(10).fill(0).map((_, i) => <CardSkeleton key={i} />)}
      </div>

      {!loading && movies.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No content found in this category.
        </div>
      )}

      {/* Load More Trigger */}
      {!loading && hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-brand-red text-white px-8 py-3 rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;