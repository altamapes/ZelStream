import { ApiResponse, DetailResponse } from '../types';

const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';

export const fetchContent = async (action: string, page: number = 1): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}?action=${action}&page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
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
    const response = await fetch(`${BASE_URL}?action=search&q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
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
    // detailPath needs to be encoded properly as a query param
    const response = await fetch(`${BASE_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};