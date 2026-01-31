import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';
const NEW_API_BASE = 'https://melolo-api-azure.vercel.app/api/melolo';

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
  try {
    // USE NEW API FOR TRENDING / LATEST CONTENT
    if (action === 'trending') {
        const url = `${NEW_API_BASE}/latest`;
        const data = await fetchWithFallback(url);
        
        // Normalize response from new API
        // Checks for various array containers usually found in APIs
        const rawItems = Array.isArray(data) ? data : (data.result || data.results || []);
        
        const items = rawItems.map((item: any) => ({
            id: item.id || item.title || String(Math.random()),
            title: item.title,
            poster: item.poster || item.image || item.thumb || '',
            rating: item.rating || 'New',
            year: item.year || '',
            type: item.type || 'movie',
            genre: item.genre || '',
            // New API uses full links, we store them as detailPath
            detailPath: item.link || item.url || item.detailPath || ''
        }));

        return {
            success: true,
            items: items,
            page: 1, // Reset page as latest endpoint usually isn't paginated the same way
            hasMore: false 
        };
    }

    // OLD API for other categories (Legacy)
    const url = `${BASE_URL}?action=${action}&page=${page}`;
    const data = await fetchWithFallback(url);
    
    // Ensure items is always an array
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
  try {
    const url = `${BASE_URL}?action=search&q=${encodeURIComponent(query)}`;
    const data = await fetchWithFallback(url);
    
    if (!data.items) {
      data.items = [];
    }
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    return { success: false, items: [], page: 1, hasMore: false };
  }
};

export const fetchDetail = async (detailPath: string): Promise<DetailResponse | null> => {
  try {
    // INTELLIGENT ROUTING: 
    // If detailPath is a full URL (from New API), use the new Detail endpoint.
    if (detailPath.startsWith('http')) {
        const url = `${NEW_API_BASE}/detail?link=${encodeURIComponent(detailPath)}`;
        const data = await fetchWithFallback(url);
        
        // Normalize New API Detail Response
        const res = data.result || data;
        if (res) {
            return {
                success: true,
                result: {
                    title: res.title,
                    poster: res.poster || res.image || res.thumbnail,
                    description: res.synopsis || res.description || '',
                    rating: res.rating,
                    genre: res.genre,
                    year: res.year,
                    // Map various video field names to playerUrl
                    playerUrl: res.streamUrl || res.videoUrl || res.url || res.link,
                    episodes: res.episodes,
                    duration: res.duration,
                    cast: res.cast,
                    director: res.director
                }
            };
        }
    }

    // Fallback to Old API for legacy items
    const url = `${BASE_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`;
    const data = await fetchWithFallback(url);
    return data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};