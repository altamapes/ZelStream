export interface MovieItem {
  id: string;
  title: string;
  poster: string;
  rating?: number | string;
  year?: string;
  type?: 'movie' | 'tv' | string;
  genre?: string;
  detailPath: string;
}

export interface ApiResponse {
  success: boolean;
  items: MovieItem[];
  page: number;
  hasMore: boolean;
}

export interface Episode {
  id?: string;
  title: string;
  url: string; // The detailPath or direct video url for the episode
}

export interface MovieDetail {
  title: string;
  poster: string;
  description: string;
  rating?: string;
  genre?: string;
  year?: string;
  playerUrl?: string; // Main video URL
  episodes?: Episode[]; // For TV series
  duration?: string;
  cast?: string;
  director?: string;
}

export interface DetailResponse {
  success: boolean;
  result: MovieDetail;
}

export enum CategoryAction {
  TRENDING = 'trending',
  INDONESIAN_MOVIES = 'indonesian-movies',
  INDONESIAN_DRAMA = 'indonesian-drama',
  KDRAMA = 'kdrama',
  SHORT_TV = 'short-tv',
  ANIME = 'anime',
}

export const CATEGORIES = [
  { id: CategoryAction.TRENDING, label: 'Trending' },
  { id: CategoryAction.INDONESIAN_MOVIES, label: 'Indonesian Movies' },
  { id: CategoryAction.INDONESIAN_DRAMA, label: 'Indonesian Drama' },
  { id: CategoryAction.KDRAMA, label: 'K-Drama' },
  { id: CategoryAction.ANIME, label: 'Anime' },
  { id: CategoryAction.SHORT_TV, label: 'Short TV' },
];