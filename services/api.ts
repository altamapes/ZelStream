import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';
// New Dramabox API Base URL
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
  try {
    // USE DRAMABOX API FOR TRENDING
    if (action === 'trending') {
        const url = `${DRAMABOX_BASE}/trending`;
        const data = await fetchWithFallback(url);
        
        // Normalize response from Dramabox API
        // Typically returns { status: true, data: [...] } or just [...]
        const rawItems = Array.isArray(data) ? data : (data.data || data.results || []);
        
        const items = rawItems.map((item: any) => ({
            id: item.title || String(Math.random()),
            title: item.title,
            poster: item.poster || item.image || item.thumb || '',
            rating: item.rating || 'Hot',
            year: item.release || item.year || '',
            type: 'series', // Dramabox is usually short series
            genre: item.genre || 'Drama',
            // Dramabox items usually provide a full link/url to the detail page
            detailPath: item.link || item.url || ''
        }));

        return {
            success: true,
            items: items,
            page: 1, 
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
    // If detailPath is a full URL, it likely comes from the Dramabox API or similar external sources.
    if (detailPath.startsWith('http')) {
        // Construct the detail endpoint for Dramabox
        const url = `${DRAMABOX_BASE}/detail?url=${encodeURIComponent(detailPath)}`;
        const data = await fetchWithFallback(url);
        
        // Normalize Dramabox Detail Response
        // Usually { status: true, data: { ... } }
        const res = data.data || data.result || data;
        
        if (res) {
            // Map episodes if they exist (Dramabox usually has an array of episodes)
            const episodes = (res.episodes || res.list_episode || []).map((ep: any) => ({
                id: ep.url || String(Math.random()),
                title: ep.title || `Episode`,
                url: ep.link || ep.url // The stream link or nested link
            }));

            return {
                success: true,
                result: {
                    title: res.title,
                    poster: res.poster || res.image || res.thumbnail,
                    description: res.synopsis || res.description || 'No description available.',
                    rating: res.rating || 'N/A',
                    genre: res.genre,
                    year: res.release || res.year,
                    // If there are episodes, the playerUrl might be the first episode, 
                    // or a standalone streamUrl if it's a movie
                    playerUrl: res.streamUrl || res.videoUrl || (episodes.length > 0 ? episodes[0].url : ''),
                    episodes: episodes,
                    duration: res.duration,
                    cast: res.cast,
                    director: res.director
                }
            };
        }
    }

    // Fallback to Old API for legacy items (Zeldvorik)
    const url = `${BASE_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`;
    const data = await fetchWithFallback(url);
    return data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};