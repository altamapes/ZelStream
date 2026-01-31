import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';

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
    const url = `${BASE_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`;
    const data = await fetchWithFallback(url);
    return data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};