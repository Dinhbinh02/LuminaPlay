const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://media.themoviedb.org/t/p';

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
  fetch: async (endpoint: string, params: Record<string, string | number> = {}) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${BASE_URL}${cleanEndpoint}`);

    // Only add api_key to URL if we don't have a Bearer Token
    if (TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
      url.searchParams.append('api_key', TMDB_API_KEY);
    }
    const searchParams = { language: 'en-US', ...params };
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const headers: Record<string, string> = {};
    if (TMDB_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${TMDB_ACCESS_TOKEN}`;
    }

    try {
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
    } catch (error) {
      console.error(`TMDB Fetch Exception for ${endpoint}:`, error instanceof Error ? error.message : error);
      return null;
    }
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

  search: async (query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page = 1, params: Record<string, string> = {}) => {
    return tmdb.fetch(`/search/${type}`, { query, page: page.toString(), ...params });
  },

  getMovieDetails: async (id: number | string) => {
    return tmdb.fetch(`/movie/${id}`, {
      append_to_response: 'images,videos,credits,external_ids,recommendations,release_dates,watch/providers',
      include_video_language: 'vi,ja,en',
      include_image_language: 'en,vi,null'
    });
  },

  getTVDetails: async (id: number | string) => {
    return tmdb.fetch(`/tv/${id}`, {
      append_to_response: 'images,videos,credits,external_ids,recommendations,content_ratings,watch/providers',
      include_video_language: 'vi,ja,en',
      include_image_language: 'en,vi,null'
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

  getRecommendations: async (id: number | string, type: 'movie' | 'tv' = 'movie', page: number | string = 1) => {
    return tmdb.fetch(`/${type}/${id}/recommendations`, { page: String(page) });
  },

  getPersonDetails: async (id: number | string) => {
    return tmdb.fetch(`/person/${id}`, { append_to_response: 'images,combined_credits,external_ids' });
  },

  getTVImages: async (id: number | string) => {
    return tmdb.fetch(`/tv/${id}/images`);
  },

  getSearchCounts: async (query: string) => {
    const [movies, tv, people] = await Promise.all([
      tmdb.fetch('/search/movie', { query }),
      tmdb.fetch('/search/tv', { query }),
      tmdb.fetch('/search/person', { query })
    ]);
    return {
      movie: movies?.total_results || 0,
      tv: tv?.total_results || 0,
      person: people?.total_results || 0
    };
  },
  getCollectionDetails: async (id: number | string) => {
    return tmdb.fetch(`/collection/${id}`);
  },
  getCompanyImages: async (id: number | string) => {
    return tmdb.fetch(`/company/${id}/images`);
  },
  getNetworkImages: async (id: number | string) => {
    return tmdb.fetch(`/network/${id}/images`);
  },
  getWatchProviders: async (type: 'movie' | 'tv' = 'movie', region = 'US') => {
    return tmdb.fetch(`/watch/providers/${type}`, { watch_region: region });
  },

  getImageUrl: (path: string | null, size: 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500', filter?: string) => {
    if (!path) return '';
    // Use a fixed size like w500 instead of original when filtering to ensure the filter is applied reliably
    const effectiveSize = filter && size === 'original' ? 'w500' : size;
    const sizeWithFilter = filter ? `${effectiveSize}_filter(${filter})` : effectiveSize;
    return `${IMAGE_BASE_URL}/${sizeWithFilter}${path}`;
  },

  // Get Logo URL (improved to find best logo)
  getLogoUrl(images: any) {
    const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en' || !l.iso_639_1);
    if (!logo) return null;
    return tmdb.getImageUrl(logo.file_path, 'w500');
  },

  // Get Textless Poster URL
  getTextlessPosterUrl(images: any) {
    if (!images?.posters) return null;
    const textless = images.posters.find((p: any) => p.iso_639_1 === null || p.iso_639_1 === 'xx');
    if (!textless) return null;
    return `${IMAGE_BASE_URL}/original${textless.file_path}`;
  },

  // Map common Watch Provider IDs to Company IDs
  getCompanyIdFromProvider(providerId: string | number): string {
    const id = providerId.toString();
    const map: Record<string, string> = {
      '283': '198847', // Crunchyroll
      '2411': '198847',
      '213': '178464', // Netflix
      '8': '178464',
      '49': '3186',   // HBO
      '1899': '3186',
      '350': '2552',   // Apple
      '337': '2739',   // Disney
      '1024': '1024',  // Amazon
      '9': '1024',
      '119': '1024',
      '15': '453',     // Hulu
      '4330': '531',    // Paramount
      '386': '3353',   // Peacock
    };
    return map[id] || id;
  },

  // Get Textless Backdrop URL
  getTextlessBackdropUrl(images: any) {
    if (!images?.backdrops) return null;
    const textless = images.backdrops.find((b: any) => b.iso_639_1 === null || b.iso_639_1 === 'xx');
    if (!textless) return null;
    return `${IMAGE_BASE_URL}/original${textless.file_path}`;
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
