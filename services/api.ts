import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';
const PROXY_URL = 'https://corsproxy.io/?';

// Helper to handle fetching with a proxy fallback
const fetchWithFallback = async (url: string) => {
  try {
    // Try direct fetch first
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.warn('Direct fetch failed, retrying with proxy...', error);
    try {
      // Fallback to proxy
      const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Proxy response was not ok');
      }
      return await response.json();
    } catch (proxyError) {
      console.error('Proxy fetch failed:', proxyError);
      throw proxyError;
    }
  }
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