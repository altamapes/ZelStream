import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDetail } from '../services/api';
import { MovieDetail, Episode } from '../types';
import { DetailSkeleton } from '../components/Skeleton';
import { Play, Calendar, Star, Clock, User, List } from 'lucide-react';

const Detail: React.FC = () => {
  const { detailPath } = useParams<{ detailPath: string }>();
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (detailPath) {
      setLoading(true);
      // Decode the URL encoded path coming from React Router
      const decodedPath = decodeURIComponent(detailPath);
      fetchDetail(decodedPath).then((data) => {
        if (data && data.success) {
          setDetail(data.result);
          // Set initial video URL
          if (data.result.episodes && data.result.episodes.length > 0) {
            setActiveEpisode(data.result.episodes[0]);
            setVideoUrl(data.result.episodes[0].url);
          } else if (data.result.playerUrl) {
            setVideoUrl(data.result.playerUrl);
          }
        }
        setLoading(false);
      });
    }
  }, [detailPath]);

  const handleEpisodeClick = (episode: Episode) => {
    setActiveEpisode(episode);
    setVideoUrl(episode.url);
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="pt-20"><DetailSkeleton /></div>;
  if (!detail) return <div className="pt-20 text-center text-white">Content not found</div>;

  return (
    <div className="min-h-screen bg-brand-dark pb-10">
      {/* Video Player Section */}
      <div className="w-full bg-black pt-16">
        <div className="max-w-7xl mx-auto aspect-video bg-black relative">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allowFullScreen
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
              <p>Video source unavailable</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Poster (Hidden on mobile, shown on tablet+) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <img 
              src={detail.poster} 
              alt={detail.title} 
              className="w-full rounded-lg shadow-2xl" 
            />
          </div>

          {/* Text Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{detail.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              {detail.rating && (
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <Star className="w-4 h-4 fill-current" /> {detail.rating}
                </span>
              )}
              {detail.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {detail.year}
                </span>
              )}
              {detail.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {detail.duration}
                </span>
              )}
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs uppercase">
                {detail.genre?.split(',')[0]}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 text-lg">
              {detail.description || "No description available."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400 mb-8">
              <div>
                <span className="block text-gray-500 mb-1">Genre</span>
                <span className="text-white">{detail.genre}</span>
              </div>
              {detail.cast && (
                <div>
                  <span className="block text-gray-500 mb-1">Cast</span>
                  <span className="text-white">{detail.cast}</span>
                </div>
              )}
              {detail.director && (
                <div>
                  <span className="block text-gray-500 mb-1">Director</span>
                  <span className="text-white">{detail.director}</span>
                </div>
              )}
            </div>

            {/* Episode List for TV Series */}
            {detail.episodes && detail.episodes.length > 0 && (
              <div className="mt-8 bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Episodes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {detail.episodes.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEpisodeClick(ep)}
                      className={`p-3 rounded text-left transition-colors flex items-center justify-between group ${
                        activeEpisode === ep 
                          ? 'bg-brand-red text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="truncate text-sm font-medium">{ep.title || `Episode ${idx + 1}`}</span>
                      {activeEpisode === ep && <Play className="w-3 h-3 fill-current" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;