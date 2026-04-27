import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ophim } from '@/lib/ophim';

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

export function useInfiniteMovies(type: 'the-loai' | 'quoc-gia' | 'danh-sach', slug: string, params: any = {}) {
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
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
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
