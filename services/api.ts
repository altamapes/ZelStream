import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';
const DRAMABOX_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

// List of proxies to try in order
const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Helper to handle fetching with multiple proxy fallbacks
const fetchWithFallback = async (url: string) => {
  // 1. Try Direct
  try {
    const response = await fetch(url);
    if (response.ok) {
        const contentType = response.headers.get("content-type");
        // Ensure we actually got JSON, not an HTML error page masked as 200 OK
        if (contentType && contentType.includes("application/json")) {
             return await response.json();
        }
    }
  } catch (e) {
    console.warn('Direct fetch failed, trying proxies...', e);
  }

  // 2. Try Proxies Loop
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
         return await response.json();
      }
    } catch (e) {
      console.warn(`Proxy ${proxy} failed:`, e);
    }
  }

  throw new Error('All fetch methods failed');
};

export const fetchContent = async (action: string, page: number = 1): Promise<ApiResponse> => {
  // PRIORITIZE DRAMABOX FOR TRENDING
  if (action === 'trending') {
      try {
        const url = `${DRAMABOX_BASE}/trending`;
        const data = await fetchWithFallback(url);
        
        // Normalize Dramabox Response
        const rawItems = Array.isArray(data) ? data : (data.data || data.results || []);
        
        const items = rawItems.map((item: any) => ({
            id: item.title || String(Math.random()),
            title: item.title,
            poster: item.poster || item.image || item.thumb || '',
            rating: item.rating || 'Hot',
            year: item.release || item.year || new Date().getFullYear().toString(),
            type: 'Series', 
            genre: item.genre || 'Drama',
            // Dramabox returns full links usually
            detailPath: item.link || item.url || ''
        }));

        return {
            success: true,
            items: items,
            page: 1, 
            hasMore: false 
        };
      } catch (error) {
          console.error(`Error fetching trending from Dramabox:`, error);
          // Return empty but success to avoid crashing UI, allowing legacy fallbacks if implemented later
          return { success: false, items: [], page: 1, hasMore: false };
      }
  }

  // LEGACY API for other specific categories (Indonesian Movies, etc.)
  // We keep this so the other tabs in your Navbar still work if possible.
  try {
    const url = `${BASE_URL}?action=${action}&page=${page}`;
    const data = await fetchWithFallback(url);
    
    if (!data.items) {
      data.items = [];
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    return { success: false, items: [], page: 1, hasMore: false };
  }
};

export const searchContent = async (query: string): Promise<ApiResponse> => {
  // USE DRAMABOX FOR SEARCH
  try {
    const url = `${DRAMABOX_BASE}/search?q=${encodeURIComponent(query)}`;
    const data = await fetchWithFallback(url);
    
    const rawItems = Array.isArray(data) ? data : (data.data || data.results || []);

    const items = rawItems.map((item: any) => ({
        id: item.title || String(Math.random()),
        title: item.title,
        poster: item.poster || item.image || item.thumb || '',
        rating: 'Search',
        year: item.year || '',
        type: 'Series',
        genre: 'Drama',
        detailPath: item.link || item.url || ''
    }));

    return {
        success: true,
        items: items,
        page: 1,
        hasMore: false
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { success: false, items: [], page: 1, hasMore: false };
  }
};

export const fetchDetail = async (detailPath: string): Promise<DetailResponse | null> => {
  try {
    // INTELLIGENT ROUTING: 
    // If detailPath is a full URL, it matches Dramabox pattern
    if (detailPath.startsWith('http')) {
        const url = `${DRAMABOX_BASE}/detail?url=${encodeURIComponent(detailPath)}`;
        const data = await fetchWithFallback(url);
        
        // Normalize Dramabox Detail Response
        const res = data.data || data.result || data;
        
        if (res) {
            // Map episodes logic for Dramabox
            const episodes = (res.episodes || res.list_episode || []).map((ep: any) => ({
                id: ep.url || String(Math.random()),
                title: ep.title || `Episode`,
                url: ep.link || ep.url 
            }));

            // Determine player URL
            // Sometimes streamUrl is directly available, otherwise take first episode
            const playerUrl = res.streamUrl || res.videoUrl || (episodes.length > 0 ? episodes[0].url : '');

            return {
                success: true,
                result: {
                    title: res.title,
                    poster: res.poster || res.image || res.thumbnail,
                    description: res.synopsis || res.description || 'No description available.',
                    rating: res.rating || 'N/A',
                    genre: res.genre,
                    year: res.release || res.year,
                    playerUrl: playerUrl,
                    episodes: episodes,
                    duration: res.duration,
                    cast: res.cast,
                    director: res.director
                }
            };
        }
    }

    // LEGACY: Fallback to Old API for legacy items (if any exist in other categories)
    const url = `${BASE_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`;
    const data = await fetchWithFallback(url);
    return data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};