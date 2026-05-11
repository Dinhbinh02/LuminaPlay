const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
}

export const tmdb = {
  fetch: async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    // Only add api_key to URL if we don't have a Bearer Token
    if (TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
      url.searchParams.append('api_key', TMDB_API_KEY);
    }
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const headers: Record<string, string> = {};
    if (TMDB_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${TMDB_ACCESS_TOKEN}`;
    }

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status !== 404 && res.status !== 502) {
        console.error(`TMDB API Error [${res.status}] for ${endpoint}:`, errorData);
      }
      return null; 
    }

    const data = await res.json();
    return data;
  },

  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day') => {
    return tmdb.fetch(`/trending/${type}/${timeWindow}`);
  },

  getPopularByRegion: async (region: string, type: 'movie' | 'tv' = 'movie') => {
    return tmdb.fetch(`/${type}/popular`, { region });
  },
  
  getPopular: async (type: 'movie' | 'tv' = 'movie', page = 1) => {
    return tmdb.fetch(`/${type}/popular`, { page: page.toString() });
  },

  getUpcoming: async (page = 1) => {
    return tmdb.fetch(`/movie/upcoming`, { page: page.toString() });
  },

  getMoviesByGenre: async (genreId: number, type: 'movie' | 'tv' = 'movie', page = 1) => {
    return tmdb.fetch(`/discover/${type}`, { 
      with_genres: genreId.toString(),
      sort_by: 'popularity.desc',
      page: page.toString()
    });
  },

  getTopRated: async (type: 'movie' | 'tv' = 'movie', page = 1) => {
    return tmdb.fetch(`/${type}/top_rated`, { page: page.toString() });
  },

  discover: async (type: 'movie' | 'tv', params: Record<string, string> = {}) => {
    return tmdb.fetch(`/discover/${type}`, {
      sort_by: 'popularity.desc',
      include_adult: 'false',
      ...params
    });
  },

  search: async (query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page = 1) => {
    return tmdb.fetch(`/search/${type}`, { query, page: page.toString() });
  },

  getMovieDetails: async (id: number | string) => {
    return tmdb.fetch(`/movie/${id}`, { 
      append_to_response: 'images,videos,credits,external_ids,recommendations',
      include_video_language: 'vi,ja,en'
    });
  },

  getTVDetails: async (id: number | string) => {
    return tmdb.fetch(`/tv/${id}`, { 
      append_to_response: 'images,videos,credits,external_ids,recommendations,content_ratings',
      include_video_language: 'vi,ja,en'
    });
  },

  getTVSeasonDetails: async (tvId: number | string, seasonNumber: number) => {
    return tmdb.fetch(`/tv/${tvId}/season/${seasonNumber}`);
  },

  getMovieImages: async (id: number | string) => {
    return tmdb.fetch(`/movie/${id}/images`);
  },

  getTVSeason: async (id: number | string, season: number | string) => {
    return tmdb.fetch(`/tv/${id}/season/${season}`);
  },

  getRecommendations: async (id: number | string, type: 'movie' | 'tv' = 'movie') => {
    return tmdb.fetch(`/${type}/${id}/recommendations`);
  },

  getPersonDetails: async (id: number | string) => {
    return tmdb.fetch(`/person/${id}`, { append_to_response: 'images,combined_credits' });
  },

  getTVImages: async (id: number | string) => {
    return tmdb.fetch(`/tv/${id}/images`);
  },

  getImageUrl: (path: string | null, size: 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
    if (!path) return '';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },

  // Get Logo URL (improved to find best logo)
  getLogoUrl(images: any) {
    const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en' || !l.iso_639_1);
    if (!logo) return null;
    return `${IMAGE_BASE_URL}/original${logo.file_path}`;
  },

  getPersonImage(path: string) {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/w185${path}`;
  },

  getEpisodeImage(path: string) {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/w300${path}`;
  }
};
