import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { ophim } from '@/lib/ophim';
import { tmdb } from '@/lib/tmdb';

export function useHomeMovies() {
  return useQuery({
    queryKey: ['home-movies'],
    queryFn: () => ophim.getHome(),
  });
}

export function useMovieList(category: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['movie-list', category, page, limit],
    queryFn: () => ophim.getList(category, page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMovieDetail(slug: string) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: () => ophim.getMovieDetail(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
}

export function useMovieCast(slug: string) {
  return useQuery({
    queryKey: ['movie-cast', slug],
    queryFn: () => ophim.getCast(slug),
    enabled: !!slug,
  });
}

export function useMovieImages(slug: string) {
  return useQuery({
    queryKey: ['movie-images', slug],
    queryFn: () => ophim.getImages(slug),
    enabled: !!slug,
  });
}
export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => ophim.getGenres(),
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => ophim.getCountries(),
  });
}

export function useMovies(type: 'the-loai' | 'quoc-gia' | 'danh-sach', slug: string, params: { page?: number; limit?: number; country?: string; category?: string; year?: string } = {}) {
  return useQuery({
    queryKey: ['movies', type, slug, params],
    queryFn: () => ophim.getMovies(type, slug, params),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInfiniteMovies(type: 'the-loai' | 'quoc-gia' | 'danh-sach', slug: string, params: any = {}, options: any = {}) {
  return useInfiniteQuery({
    queryKey: ['infinite-movies', type, slug, params],
    queryFn: ({ pageParam = 1 }) => ophim.getMovies(type, slug, { ...params, page: pageParam }),
    getNextPageParam: (lastPage: any) => {
      const pagination = lastPage.data.params.pagination;
      const currentPage = pagination.currentPage;
      const totalPages = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    placeholderData: keepPreviousData,
    ...options
  });
}
export function useSearch(keyword: string, page = 1) {
  return useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => ophim.search(keyword, page),
    enabled: !!keyword,
    staleTime: 1000 * 60 * 5,
  });
}

// --- TMDB Hooks ---

export function useGeoLocation() {
  return useQuery({
    queryKey: ['geo-location'],
    queryFn: async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          return {
            countryCode: data.country_code || 'VN',
            countryName: data.country_name || 'Vietnam'
          };
        }
      } catch (e) {
        console.error('Failed to get geolocation', e);
      }
      return { countryCode: 'VN', countryName: 'Vietnam' };
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useRegionalTrending(type: 'movie' | 'tv' = 'movie') {
  const { data: geo } = useGeoLocation();
  const countryCode = geo?.countryCode || 'VN';
  const countryName = geo?.countryName || 'Vietnam';

  return useQuery({
    queryKey: ['regional-trending', type, countryCode],
    queryFn: async () => {
      const popular = await tmdb.getPopularByRegion(countryCode, type);
      return {
        ...popular,
        countryCode,
        countryName
      };
    },
    enabled: !!geo,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useTMDBTrending(type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day') {
  return useQuery({
    queryKey: ['tmdb-trending', type, timeWindow],
    queryFn: () => tmdb.getTrending(type, timeWindow),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useTMDBRecommendations(id: string, type: 'movie' | 'tv' = 'movie') {
  return useQuery({
    queryKey: ['tmdb-recommendations', id, type],
    queryFn: () => tmdb.getRecommendations(id, type),
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useTMDBPerson(id: string) {
  return useQuery({
    queryKey: ['tmdb-person', id],
    queryFn: () => tmdb.getPersonDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useTrendingWithLogos(type: 'all' | 'movie' | 'tv' = 'all', limit = 6, region?: string) {
  return useQuery({
    queryKey: ['trending-with-logos', type, limit, region],
    queryFn: async () => {
      let results = [];
      
      if (region) {
        if (type === 'all') {
          const [movies, tv] = await Promise.all([
            tmdb.getPopularByRegion(region, 'movie'),
            tmdb.getPopularByRegion(region, 'tv')
          ]);
          // Merge and sort by popularity
          results = [...(movies.results || []), ...(tv.results || [])]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
        } else {
          const data = await tmdb.getPopularByRegion(region, type as any);
          results = data.results.slice(0, limit);
        }
      } else {
        const trending = await tmdb.getTrending(type, 'day');
        results = trending.results.slice(0, limit);
      }
      
      const itemsWithLogos = await Promise.all(
        results.map(async (item: any) => {
          const itemType = item.media_type || (item.title ? 'movie' : 'tv');
          const images = await (itemType === 'tv'
            ? tmdb.getTVImages(item.id) 
            : tmdb.getMovieImages(item.id));
          return {
            ...item,
            media_type: itemType, // Ensure media_type is set for regional popular
            logo: tmdb.getLogoUrl(images)
          };
        })
      );
      
      return itemsWithLogos;
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get TMDB Upcoming movies
export function useTMDBUpcoming() {
  return useQuery({
    queryKey: ['tmdb', 'upcoming'],
    queryFn: () => tmdb.getUpcoming(),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

// Hook to get TMDB Popular
export function useTMDBPopular(type: 'movie' | 'tv' = 'movie') {
  return useQuery({
    queryKey: ['tmdb', 'popular', type],
    queryFn: () => tmdb.getPopular(type),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

// Hook to get TMDB by Genre
export function useTMDBByGenre(genreId: number, type: 'movie' | 'tv' = 'movie') {
  return useQuery({
    queryKey: ['tmdb', 'genre', genreId, type],
    queryFn: () => tmdb.getMoviesByGenre(genreId, type),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

// Hook to get TMDB details (Movie or TV)
export function useTMDBDetails(id: string | number, type: 'movie' | 'tv') {
  return useQuery({
    queryKey: ['tmdb', type, id],
    queryFn: () => type === 'movie' ? tmdb.getMovieDetails(id) : tmdb.getTVDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get TMDB TV Season details
export function useTMDBSeason(tvId: string | number, seasonNumber: number) {
  return useQuery({
    queryKey: ['tmdb', 'tv', tvId, 'season', seasonNumber],
    queryFn: () => tmdb.getTVSeasonDetails(tvId, seasonNumber),
    enabled: !!tvId && typeof seasonNumber === 'number',
    placeholderData: keepPreviousData,
  });
}

// Hook to find Ophim slug for a TMDB ID
export function useOphimMapping(title: string, year: string | number, originalTitle?: string, type?: 'movie' | 'tv', tmdbId?: string | number, season?: string | number) {
  return useQuery({
    queryKey: ['ophim-mapping', title, year, originalTitle, type, tmdbId, season],
    queryFn: async () => {
      if (!title) return null;
      
      const isTV = !!season || type === 'tv';
      
      // 1. Search with main title only (Ophim search is sensitive)
      const searchRes = await ophim.search(title);
      let items = searchRes.data?.items || [];
      
      // 2. If no items, try searching with original title
      if (items.length === 0 && originalTitle && originalTitle !== title) {
        const searchResOrig = await ophim.search(originalTitle);
        items = searchResOrig.data?.items || [];
      }
      
      if (items.length === 0) return null;

      // 3. Match Priority 1: Exact TMDB ID match
      if (tmdbId) {
        const exactMatch = items.find((item: any) => item.tmdb?.id?.toString() === tmdbId.toString());
        if (exactMatch) return exactMatch.slug;
      }

      // 4. Logic to pick the best match
      if (isTV) {
        const s = (season || '1').toString();
        const targetYear = year?.toString();

        // 1.5 Special: If season > 1, try a specific search for "Title Phần N"
        if (parseInt(s) > 1) {
          const seasonSearchRes = await ophim.search(`${title} Phần ${s}`);
          if (seasonSearchRes.status === 'success' && seasonSearchRes.data?.items?.length > 0) {
            // Check if this result also matches year or TMDB ID
            const exactSeasonMatch = seasonSearchRes.data.items.find((item: any) => 
              (tmdbId && item.tmdb?.id?.toString() === tmdbId.toString()) ||
              (item.year?.toString() === targetYear)
            );
            if (exactSeasonMatch) return exactSeasonMatch.slug;
            return seasonSearchRes.data.items[0].slug;
          }
        }

        // Try to find an item in the original results that mentions the season explicitly
        const seasonMatch = items.find((item: any) => {
          const name = (item.name || '').toLowerCase();
          const origin = (item.origin_name || '').toLowerCase();
          
          const patterns = [
            `phần ${s}`,
            `(phần ${s})`,
            `season ${s}`,
            `ss${s}`,
            `s${s}`,
            `p${s}`
          ];
          
          return patterns.some(p => name.includes(p) || origin.includes(p));
        });

        if (seasonMatch) return seasonMatch.slug;

        // Special case: If season 1, look for items without "phần" and check year
        if (s === '1') {
          const s1Matches = items.filter((item: any) => {
            const name = (item.name || '').toLowerCase();
            return !name.includes('phần') && !name.includes('season');
          });

          if (s1Matches.length > 0) {
            // Pick the one with the closest year
            const yearMatch = s1Matches.find((item: any) => item.year?.toString() === targetYear);
            return yearMatch ? yearMatch.slug : s1Matches[0].slug;
          }
        }
      }

      // 5. Default fallback: matching by original name or name with scoring
      const scoredItems = items.map((item: any) => {
        let score = 0;
        const itemName = (item.name || '').toLowerCase();
        const itemOrigin = (item.origin_name || '').toLowerCase();
        const itemType = item.type; // 'single' or 'series'
        const lowTitle = title.toLowerCase();
        const lowOrig = originalTitle?.toLowerCase() || '';

        // Year match is extremely important
        if (item.year?.toString() === year?.toString()) {
          score += 20;
        } else {
          // Penalty for different year (except if exact name match)
          score -= 5;
        }

        // Type match
        if (type === 'movie' && itemType === 'single') score += 10;
        if (type === 'tv' && itemType === 'series') score += 10;

        // Name match
        if (itemName === lowTitle || itemOrigin === lowOrig) score += 10;
        if (itemName.includes(lowTitle) || itemOrigin.includes(lowOrig)) score += 5;
        
        // For Season 1, prefer items without "Phần" or "Part"
        if (season?.toString() === '1') {
          if (!itemName.includes('phần') && !itemName.includes('season')) score += 5;
          if (!itemName.includes('part')) score += 2;
        }

        return { item, score };
      });

      scoredItems.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
      
      // Threshold: If the best match is still poor, don't return it
      if (scoredItems[0].score < 10) return null;

      return scoredItems[0].item.slug;
    },
    enabled: !!title,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    placeholderData: keepPreviousData,
  });
}
