import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDetail } from '../services/api';
import { MovieDetail, Episode } from '../types';
import { DetailSkeleton } from '../components/Skeleton';
import { Play, Calendar, Star, Clock, List, ExternalLink, AlertCircle, RefreshCw, Home } from 'lucide-react';

const Detail: React.FC = () => {
  const { detailPath } = useParams<{ detailPath: string }>();
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => { isMounted.current = false; };
  }, [detailPath]);

  const loadData = () => {
    if (!detailPath) return;
    
    setLoading(true);
    setError(null);
    setDetail(null);
    
    const decodedPath = decodeURIComponent(detailPath);
    
    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (isMounted.current && loading) {
        setLoading(false);
        setError('Koneksi timeout. Server tidak merespon.');
      }
    }, 20000); 

    fetchDetail(decodedPath).then((data) => {
      clearTimeout(timeoutId);
      if (!isMounted.current) return;
      
      if (data && data.success && data.result) {
        setDetail(data.result);
        
        // Setup initial player
        if (data.result.episodes && data.result.episodes.length > 0) {
          setActiveEpisode(data.result.episodes[0]);
          setVideoUrl(processUrl(data.result.episodes[0].url));
        } else if (data.result.playerUrl) {
          setVideoUrl(processUrl(data.result.playerUrl));
        }
        setLoading(false);
      } else {
        setError('Data tidak ditemukan atau struktur respon API tidak valid.');
        setLoading(false);
      }
    }).catch((err) => {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setError('Gagal menghubungi server. Periksa koneksi internet Anda.');
        setLoading(false);
        console.error(err);
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
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Masalah</h2>
            <p className="text-gray-400 mb-6 text-sm">{error || 'Konten tidak dapat dimuat.'}</p>
            
            <div className="flex flex-col gap-3">
                <button 
                onClick={loadData}
                className="flex items-center justify-center gap-2 bg-brand-red text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition-colors w-full"
                >
                <RefreshCw className="w-5 h-5" />
                Coba Lagi
                </button>
                <Link 
                to="/"
                className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded font-bold hover:bg-gray-600 transition-colors w-full"
                >
                <Home className="w-5 h-5" />
                Kembali ke Home
                </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-10">
      {/* Video Player Section */}
      <div className="w-full bg-black pt-16 sticky top-0 z-40 shadow-2xl">
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
                  <p>Video tidak tersedia untuk konten ini</p>
                </div>
            )}
            </div>
            
            {/* Player Controls */}
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Now Playing</span>
                    <span className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                        {activeEpisode ? activeEpisode.title : detail.title}
                    </span>
                </div>
                {videoUrl && (
                  <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs md:text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors border border-gray-700 whitespace-nowrap"
                  >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Buka di</span> Tab Baru
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
              onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster';
              }} 
            />
          </div>

          {/* Text Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{detail.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mb-6">
              {detail.rating && (
                <span className="flex items-center gap-1 text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-current" /> {detail.rating}
                </span>
              )}
              {detail.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {detail.year}
                </span>
              )}
              {detail.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {detail.duration}
                </span>
              )}
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs uppercase bg-gray-800/50">
                {detail.genre?.split(',')[0] || 'Movie'}
              </span>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800 mb-6">
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {detail.description || "Deskripsi tidak tersedia."}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400 mb-8">
              <div>
                <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Genre</span>
                <span className="text-white">{detail.genre || '-'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Cast</span>
                <span className="text-white line-clamp-2">{detail.cast || '-'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1 font-semibold uppercase text-xs">Director</span>
                <span className="text-white">{detail.director || '-'}</span>
              </div>
            </div>

            {/* Episode List */}
            {detail.episodes && detail.episodes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-brand-red pl-3">
                  <List className="w-5 h-5" />
                  Daftar Episode
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {detail.episodes.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEpisodeClick(ep)}
                      className={`px-3 py-2 rounded text-left transition-all flex items-center justify-between group border text-xs sm:text-sm ${
                        activeEpisode === ep 
                          ? 'bg-brand-red border-brand-red text-white shadow-lg' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <span className="truncate pr-1">
                        {ep.title || `Episode ${idx + 1}`}
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