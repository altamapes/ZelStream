import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDetail } from '../services/api';
import { MovieDetail, Episode } from '../types';
import { DetailSkeleton } from '../components/Skeleton';
import { Play, Calendar, Star, Clock, List, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

const Detail: React.FC = () => {
  const { detailPath } = useParams<{ detailPath: string }>();
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Use a ref to track if component is mounted to prevent state updates on unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => { isMounted.current = false; };
  }, [detailPath]);

  const loadData = () => {
    if (!detailPath) return;
    
    setLoading(true);
    setError(false);
    
    const decodedPath = decodeURIComponent(detailPath);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false);
        if (!detail) setError(true);
      }
    }, 15000); // 15 seconds timeout

    fetchDetail(decodedPath).then((data) => {
      clearTimeout(timeoutId);
      if (!isMounted.current) return;
      
      if (data && data.success) {
        setDetail(data.result);
        
        // Logic to determine initial video URL
        if (data.result.episodes && data.result.episodes.length > 0) {
          setActiveEpisode(data.result.episodes[0]);
          setVideoUrl(processUrl(data.result.episodes[0].url));
        } else if (data.result.playerUrl) {
          setVideoUrl(processUrl(data.result.playerUrl));
        }
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    }).catch(() => {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setError(true);
        setLoading(false);
      }
    });
  };

  const processUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('//')) return `https:${url}`;
    return url;
  };

  const handleEpisodeClick = (episode: Episode) => {
    setActiveEpisode(episode);
    setVideoUrl(processUrl(episode.url));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="pt-20"><DetailSkeleton /></div>;

  if (error || !detail) {
    return (
      <div className="pt-32 pb-20 px-4 text-center min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Gagal Memuat Konten</h2>
        <p className="text-gray-400 mb-6">Terjadi kesalahan saat mengambil data film. Silakan coba lagi.</p>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-10">
      {/* Video Player Section */}
      <div className="w-full bg-black pt-16 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
            <div className="aspect-video bg-black relative w-full border-b border-gray-800">
            {videoUrl ? (
                <iframe
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
                referrerPolicy="no-referrer"
                loading="eager"
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-2">
                  <AlertCircle className="w-10 h-10" />
                  <p>Sumber video tidak tersedia</p>
                </div>
            )}
            </div>
            
            {/* Player Controls */}
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-gray-400 truncate max-w-[50%]">
                    Playing: <span className="text-white font-medium">{activeEpisode ? activeEpisode.title : detail.title}</span>
                </span>
                {videoUrl && (
                  <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs md:text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors border border-gray-700"
                  >
                      <ExternalLink className="w-4 h-4" />
                      Video Error? Buka Tab Baru
                  </a>
                )}
            </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Poster */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <img 
              src={detail.poster} 
              alt={detail.title} 
              className="w-full rounded-lg shadow-2xl border border-gray-800" 
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
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs uppercase bg-gray-800/50">
                {detail.genre?.split(',')[0]}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 text-lg">
              {detail.description || "Deskripsi tidak tersedia."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400 mb-8 p-4 bg-gray-900/50 rounded-lg">
              <div>
                <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Genre</span>
                <span className="text-white">{detail.genre}</span>
              </div>
              {detail.cast && (
                <div>
                  <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Cast</span>
                  <span className="text-white">{detail.cast}</span>
                </div>
              )}
              {detail.director && (
                <div>
                  <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Director</span>
                  <span className="text-white">{detail.director}</span>
                </div>
              )}
            </div>

            {/* Episode List */}
            {detail.episodes && detail.episodes.length > 0 && (
              <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Daftar Episode
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {detail.episodes.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEpisodeClick(ep)}
                      className={`p-3 rounded text-left transition-all flex items-center justify-between group border ${
                        activeEpisode === ep 
                          ? 'bg-brand-red border-brand-red text-white shadow-lg' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="truncate text-sm font-medium pr-2">
                        {ep.title && ep.title.length < 20 ? ep.title : `Episode ${idx + 1}`}
                      </span>
                      {activeEpisode === ep && <Play className="w-3 h-3 fill-current flex-shrink-0" />}
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