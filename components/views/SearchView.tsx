'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ophim } from "@/lib/ophim";
import { tmdb } from "@/lib/tmdb";
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from "@/components/ui/Pagination";
import { useGenres, useCountries } from "@/hooks/useMovie";
import PersonModal from "@/components/movie/PersonModal";
import { Info, Star, Calendar, Users, Film, Tv, Search, ChevronLeft } from 'lucide-react';
import styles from '@/app/search/SearchPage.module.css';

interface MovieResult {
  _id: string | number;
  name: string;
  type?: string;
  slug: string;
  thumb_url: string;
  year?: string;
  quality?: string;
  episode_current?: string;
  overview?: string;
  vote_average?: number;
}

const DEFAULT_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'%3E%3Crect width='100' height='150' fill='%23181818'/%3E%3Ccircle cx='50' cy='55' r='26' fill='%23333'/%3E%3Cellipse cx='50' cy='120' rx='36' ry='24' fill='%23333'/%3E%3C/svg%3E`;
const DEFAULT_POSTER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23111'/%3E%3Crect x='30' y='80' width='140' height='100' rx='8' fill='%231a1a1a' stroke='%23333' stroke-width='2'/%3E%3Ccircle cx='100' cy='130' r='28' fill='%23222' stroke='%23444' stroke-width='2'/%3E%3Cpolygon points='90%2C118 90%2C142 114%2C130' fill='%23555'/%3E%3Crect x='50' y='210' width='100' height='8' rx='4' fill='%23222'/%3E%3Crect x='65' y='228' width='70' height='6' rx='3' fill='%231a1a1a'/%3E%3C/svg%3E`;

function HorizontalSearchCard({
  movie,
  cdnDomain,
  index,
  onPersonClick
}: {
  movie: MovieResult,
  cdnDomain: string,
  index: number,
  onPersonClick: (id: string) => void
}) {
  if (!movie) return null;

  const isPerson = movie.type === 'person';
  const defaultFallback = isPerson ? DEFAULT_AVATAR : DEFAULT_POSTER;

  let posterUrl = movie.thumb_url;
  if (!posterUrl) {
    posterUrl = defaultFallback;
  } else if (!posterUrl.startsWith('http')) {
    posterUrl = ophim.getImageUrl(movie.thumb_url, cdnDomain);
  }

  const finalSrc = posterUrl || defaultFallback;

  const cardInner = (
    <div className={`${styles.posterCard} ${isPerson ? styles.posterCardPerson : ''}`}>
      <div className={styles.posterImageContainer}>
        {finalSrc ? (
          <Image
            src={finalSrc}
            alt={movie.name || 'Poster'}
            fill
            loading="lazy"
            className={styles.posterImage}
            sizes="(max-width: 640px) 44vw, (max-width: 1024px) 22vw, 200px"
            unoptimized={finalSrc.startsWith('https://') || finalSrc.startsWith('data:')}
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      className={styles.posterCardWrapper}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index % 10) * 0.04 }}
    >
      {isPerson ? (
        <div onClick={() => onPersonClick(movie._id.toString())} style={{ cursor: 'pointer' }}>
          {cardInner}
        </div>
      ) : (
        <Link href={`/${movie.slug}`}>
          {cardInner}
        </Link>
      )}
    </motion.div>
  );
}

function SearchSidebar({
  counts,
  activeType,
  onTypeChange
}: {
  counts: any,
  activeType: string,
  onTypeChange: (type: string) => void
}) {
  const categories = [
    { id: 'multi', name: 'All Results', icon: <Search size={18} /> },
    { id: 'movie', name: 'Movies', icon: <Film size={18} />, count: counts.movie },
    { id: 'tv', name: 'TV Shows', icon: <Tv size={18} />, count: counts.tv },
    { id: 'person', name: 'People', icon: <Users size={18} />, count: counts.person },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <div className={styles.sidebarHeader}>
          <h3>Search Results</h3>
        </div>
        <div className={styles.categoryList}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryItem} ${activeType === cat.id ? styles.categoryItemActive : ''}`}
              onClick={() => onTypeChange(cat.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cat.icon}
                <span>{cat.name}</span>
              </div>
              {cat.count !== undefined && (
                <span className={styles.countBadge}>{cat.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tipCard}>
        <Info size={18} className={styles.tipIcon} />
        <p>Tip: Focus on the sidebar to filter results by type. Movies and TV shows often have higher quality posters.</p>
      </div>
    </aside>
  );
}

const GENRE_MAP: Record<string, string> = {
  '28': 'Action',
  '12': 'Adventure',
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '14': 'Fantasy',
  '36': 'History',
  '27': 'Horror',
  '10402': 'Music',
  '9648': 'Mystery',
  '10749': 'Romance',
  '878': 'Sci-Fi',
  '53': 'Thriller',
  '10752': 'War',
  '37': 'Western',
  '10759': 'Action & Adventure',
  '10762': 'Kids',
  '10763': 'News',
  '10764': 'Reality',
  '10765': 'Sci-Fi & Fantasy',
  '10766': 'Soap',
  '10767': 'Talk',
  '10768': 'War & Politics'
};

const PREMIUM_COLORS = [
  '#006400', '#0D73EC', '#E1118C', '#7D4B32', '#509BF5',
  '#27856A', '#8D67AB', '#D84040', '#4B0082', '#A153A1',
  '#BC5900', '#E8115B', '#1DB954', '#E50914', '#009B72',
  '#2A4B7C', '#8F3939', '#5B7C99', '#7F6B58', '#477A7A'
];

function getGenreColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PREMIUM_COLORS[hash % PREMIUM_COLORS.length];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: genresData } = useGenres();
  const { data: countriesData } = useCountries();

  // Redirect legacy search page category parameters to new provider pages
  useEffect(() => {
    const compId = searchParams.get('company');
    const netId = searchParams.get('network');
    const genreId = searchParams.get('genre');
    const isTrending = searchParams.get('trending') === 'true';
    const isTopRated = searchParams.get('top_rated') === 'true';

    if (genreId) {
      router.replace(`/provider/${genreId}?type=genre`);
    } else if (compId) {
      router.replace(`/provider/${compId}?type=company`);
    } else if (netId) {
      router.replace(`/provider/${netId}?type=network`);
    } else if (isTrending) {
      router.replace(`/provider/trending?type=special`);
    } else if (isTopRated) {
      router.replace(`/provider/top_rated?type=special`);
    }
  }, [searchParams, router]);

  const keyword = searchParams.get('q') || searchParams.get('keyword');
  const country = searchParams.get('country');
  const genre = searchParams.get('genre');
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const activeType = searchParams.get('type') || 'multi';

  const isSearchActive = !!(
    keyword ||
    country ||
    category ||
    searchParams.get('year') ||
    searchParams.get('rating') ||
    searchParams.get('runtime') ||
    searchParams.get('mode')
  );

  const [results, setResults] = useState<any[]>([]);
  const [counts, setCounts] = useState({ movie: 0, tv: 0, person: 0 });
  const [cdnDomain, setCdnDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const [currentQuery, setCurrentQuery] = useState(searchParams.toString());
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(keyword || '');

  const [browseCategories, setBrowseCategories] = useState<{
    special: any[];
    studios: any[];
    networks: any[];
    movieGenres: any[];
    tvGenres: any[];
  }>({ special: [], studios: [], networks: [], movieGenres: [], tvGenres: [] });
  const [isBrowseLoading, setIsBrowseLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(keyword || '');
  }, [keyword]);

  useEffect(() => {
    if (isSearchActive || browseCategories.movieGenres.length > 0) return;

    const fetchBrowseData = async () => {
      setIsBrowseLoading(true);
      try {
        const studiosList = [
          { id: 3, name: 'Pixar Animation', color: '#009B72' },
          { id: 420, name: 'Marvel Studios', color: '#E50914' },
          { id: 174, name: 'Warner Bros.', color: '#0D73EC' },
          { id: 2, name: 'Walt Disney Pictures', color: '#113CCF' },
          { id: 33, name: 'Universal Pictures', color: '#BC5900' },
          { id: 10342, name: 'Studio Ghibli', color: '#477A7A' },
          { id: 41077, name: 'A24', color: '#27856A' },
          { id: 7, name: 'DreamWorks Pictures', color: '#8D67AB' }
        ];

        const networksList = [
          { id: 213, name: 'Netflix', color: '#E50914' },
          { id: 49, name: 'HBO', color: '#509BF5' },
          { id: 2739, name: 'Disney+', color: '#113CCF' },
          { id: 2552, name: 'Apple TV+', color: '#0D73EC' },
          { id: 1024, name: 'Amazon Prime', color: '#BC5900' },
          { id: 453, name: 'Hulu', color: '#27856A' },
          { id: 129, name: 'AMC Network', color: '#8F3939' },
          { id: 3353, name: 'Peacock', color: '#8D67AB' }
        ];

        const [
          movieGenresData,
          tvGenresData,
          popularMovies,
          trendingMovies,
          popularTV,
          trendingTV,
          ...companyAndNetworkResults
        ] = await Promise.all([
          tmdb.fetch('/genre/movie/list', { language: 'en-US' }),
          tmdb.fetch('/genre/tv/list', { language: 'en-US' }),
          tmdb.getPopular('movie'),
          tmdb.getTrending('movie', 'week'),
          tmdb.getPopular('tv'),
          tmdb.getTrending('tv', 'week'),
          // Fetch top movies for studios
          ...studiosList.map(s => tmdb.discover('movie', { with_companies: s.id.toString(), sort_by: 'popularity.desc', language: 'en-US' })),
          // Fetch top shows for networks
          ...networksList.map(n => tmdb.discover('tv', { with_networks: n.id.toString(), sort_by: 'popularity.desc', language: 'en-US' }))
        ]);

        const movieGenresList = movieGenresData?.genres || [];
        const tvGenresList = tvGenresData?.genres || [];

        // Merge popular and trending to have a larger pool of movies (up to 40 unique movies)
        const popularMoviesList: any[] = [];
        const seenMovieIds = new Set<number>();
        [...(popularMovies?.results || []), ...(trendingMovies?.results || [])].forEach((m: any) => {
          if (m && m.id && !seenMovieIds.has(m.id)) {
            seenMovieIds.add(m.id);
            popularMoviesList.push(m);
          }
        });

        // Merge popular and trending to have a larger pool of TV shows (up to 40 unique shows)
        const popularTVList: any[] = [];
        const seenTVIds = new Set<number>();
        [...(popularTV?.results || []), ...(trendingTV?.results || [])].forEach((t: any) => {
          if (t && t.id && !seenTVIds.has(t.id)) {
            seenTVIds.add(t.id);
            popularTVList.push(t);
          }
        });

        const usedStudioPosters = new Set<string>();
        // Map studios
        const mappedStudios = studiosList.map((studio, idx) => {
          const results = companyAndNetworkResults[idx]?.results || [];
          let bestMovie = results.find((m: any) => m.poster_path && !usedStudioPosters.has(m.poster_path));
          if (!bestMovie) {
            bestMovie = results[0];
          }
          const posterPath = bestMovie?.poster_path || '';
          if (posterPath) {
            usedStudioPosters.add(posterPath);
          }
          return {
            id: studio.id.toString(),
            name: studio.name,
            poster: posterPath,
            color: studio.color,
            href: `/provider/${studio.id}?type=company`
          };
        }).filter((s: any) => s.poster);

        const usedNetworkPosters = new Set<string>();
        // Map networks
        const mappedNetworks = networksList.map((network, idx) => {
          const results = companyAndNetworkResults[studiosList.length + idx]?.results || [];
          let bestShow = results.find((t: any) => t.poster_path && !usedNetworkPosters.has(t.poster_path));
          if (!bestShow) {
            bestShow = results[0];
          }
          const posterPath = bestShow?.poster_path || '';
          if (posterPath) {
            usedNetworkPosters.add(posterPath);
          }
          return {
            id: network.id.toString(),
            name: network.name,
            poster: posterPath,
            color: network.color,
            href: `/provider/${network.id}?type=network`
          };
        }).filter((n: any) => n.poster);

        const usedMovieGenrePosters = new Set<string>();
        // Map movie genres dynamically
        const mappedMovieGenres = movieGenresList.map((genre: any) => {
          let matchingMovie = popularMoviesList.find((m: any) => m.genre_ids?.includes(genre.id) && m.poster_path && !usedMovieGenrePosters.has(m.poster_path));
          if (!matchingMovie) {
            matchingMovie = popularMoviesList.find((m: any) => m.genre_ids?.includes(genre.id));
          }
          const posterPath = matchingMovie?.poster_path || '';
          if (posterPath) {
            usedMovieGenrePosters.add(posterPath);
          }
          return {
            id: genre.id.toString(),
            name: genre.name,
            poster: posterPath,
            color: getGenreColor(genre.name),
            href: `/provider/${genre.id}?type=genre`
          };
        }).filter((g: any) => g.poster);

        const usedTvGenrePosters = new Set<string>();
        // Map TV genres dynamically
        const mappedTvGenres = tvGenresList.map((genre: any) => {
          let matchingShow = popularTVList.find((t: any) => t.genre_ids?.includes(genre.id) && t.poster_path && !usedTvGenrePosters.has(t.poster_path));
          if (!matchingShow) {
            matchingShow = popularTVList.find((t: any) => t.genre_ids?.includes(genre.id));
          }
          const posterPath = matchingShow?.poster_path || '';
          if (posterPath) {
            usedTvGenrePosters.add(posterPath);
          }
          return {
            id: genre.id.toString(),
            name: genre.name,
            poster: posterPath,
            color: getGenreColor(genre.name + 'tv'),
            href: `/provider/${genre.id}?type=genre`
          };
        }).filter((g: any) => g.poster);

        // Special collections
        const special = [
          {
            id: 'trending',
            name: 'Trending Now',
            color: '#E8115B',
            poster: popularMoviesList[0]?.poster_path || '',
            href: '/provider/trending?type=special'
          },
          {
            id: 'top_rated',
            name: 'Top Rated',
            color: '#1DB954',
            poster: popularMoviesList[1]?.poster_path || '',
            href: '/provider/top_rated?type=special'
          }
        ];

        setBrowseCategories({
          special,
          studios: mappedStudios,
          networks: mappedNetworks,
          movieGenres: mappedMovieGenres,
          tvGenres: mappedTvGenres
        });
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsBrowseLoading(false);
      }
    };

    fetchBrowseData();
  }, [isSearchActive, browseCategories.movieGenres.length]);

  useEffect(() => {
    setSearchQuery(keyword || '');
  }, [keyword]);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (keyword) {
      const fetchCounts = async () => {
        const tmdb = (await import('@/lib/tmdb')).tmdb;
        const data = await tmdb.getSearchCounts(keyword);
        setCounts(data);
      };
      fetchCounts();
    }
  }, [keyword]);

  if (searchParams.toString() !== currentQuery) {
    setCurrentQuery(searchParams.toString());
    setResults([]);
    setIsLoading(isSearchActive);
    setTitle('');
  }

  useEffect(() => {
    if (!isSearchActive) {
      setResults([]);
      setPagination(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const mode = searchParams.get('mode');
        const source = searchParams.get('source');
        const year = searchParams.get('year');
        const rating = searchParams.get('rating');
        const runtime = searchParams.get('runtime');
        const company = searchParams.get('company');
        const trending = searchParams.get('trending');
        const top_rated = searchParams.get('top_rated');

        if (mode === 'history') {
          setTitle('Watch History');
          if (typeof window !== 'undefined') {
            const watchHistory = localStorage.getItem('watch_history');
            if (watchHistory) {
              const parsed = JSON.parse(watchHistory);
              const sorted = parsed.sort((a: any, b: any) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
              setResults(sorted.map((item: any) => ({
                _id: item.id || item.slug,
                name: item.title,
                slug: item.slug,
                thumb_url: item.poster,
                year: item.year,
                quality: item.quality,
                type: 'history'
              })));
            }
          }
          setIsLoading(false);
          return;
        }

        // TMDB DISCOVERY / SEARCH
        if (source === 'tmdb' || year || rating || runtime || keyword || (country && country.length < 5)) {
          const tmdb = (await import('@/lib/tmdb')).tmdb;
          let tmdbData;

          const mediaType = activeType === 'tv' ? 'tv' : 'movie';

          if (keyword) {
            setTitle(`Search results for: "${keyword}"`);
            tmdbData = await tmdb.search(keyword, activeType as any, page, {
              language: 'en-US',
              include_image_language: 'en,null'
            });
          } else {
            setTitle('Discovery Results');

            const discoverParams: Record<string, string> = {
              page: page.toString(),
              language: 'en-US',
              include_image_language: 'en,null'
            };
            if (year) discoverParams[year.endsWith('s') ? 'primary_release_date.gte' : 'primary_release_year'] = year;
            if (rating) discoverParams['vote_average.gte'] = rating;
            if (country) discoverParams['with_origin_country'] = country;

            tmdbData = await tmdb.discover(mediaType, discoverParams);
          }

          if (tmdbData) {
            setResults(tmdbData.results.map((item: any) => ({
              _id: item.id,
              name: item.title || item.name,
              type: item.media_type || (activeType === 'multi' ? 'movie' : activeType),
              slug: (item.media_type || activeType) === 'tv' ? `tv/${item.id}` : `movie/${item.id}`,
              thumb_url: tmdb.getImageUrl(item.poster_path || item.profile_path),
              year: (item.release_date || item.first_air_date || '').split('-')[0],
              vote_average: item.vote_average,
              overview: item.overview,
              quality: 'TMDB'
            })));
            setPagination({
              totalItems: tmdbData.total_results,
              totalItemsPerPage: 20,
              currentPage: page
            });
          }
          setIsLoading(false);
          return;
        }

        // OPHIM FALLBACK
        const baseSlug = category || 'phim-moi';
        const data = await ophim.getMovies('danh-sach', baseSlug, {
          page,
          category: genre || undefined,
          country: country || undefined
        });

        if (data?.data) {
          setResults(data.data.items || []);
          setCdnDomain(data.data.APP_DOMAIN_CDN_IMAGE || '');
          setPagination(data.data.params?.pagination);
          setTitle(data.data.titlePage || 'Search Results');
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [keyword, country, genre, category, page, activeType, searchParams, isSearchActive]);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', type);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
     const params = new URLSearchParams(searchParams.toString());
     params.set('page', newPage.toString());
     router.push(`/search?${params.toString()}`);
     window.scrollTo(0, 0);
  };

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.resultsArea}>
        <form
          className={styles.searchBarWrapper}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInputField}
            placeholder="Search movies, TV shows, actors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setSearchQuery('');
                const params = new URLSearchParams(window.location.search);
                params.delete('q');
                params.set('page', '1');
                router.push(`/search?${params.toString()}`);
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>

        {isSearchActive ? (
          <>
            {/* Mobile filter tabs - replaces sidebar on mobile */}
            {keyword && (
              <div className={styles.mobileFilterTabs}>
                {[
                  { id: 'multi', name: 'All' },
                  { id: 'movie', name: 'Movies', count: counts.movie },
                  { id: 'tv', name: 'TV Shows', count: counts.tv },
                  { id: 'person', name: 'People', count: counts.person },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.mobileFilterTab} ${activeType === tab.id ? styles.mobileFilterTabActive : ''}`}
                    onClick={() => handleTypeChange(tab.id)}
                  >
                    {tab.name}
                    {tab.count !== undefined && (
                      <span className={styles.mobileFilterCount}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.titleWrapper}>
              {isLoading ? (
                <div className={styles.skeletonTitle} />
              ) : (
                <div 
                  className={`${styles.titleContainer} ${!keyword ? styles.clickableTitleGroup : ''}`}
                  onClick={() => {
                    if (!keyword) {
                      router.push('/search');
                    }
                  }}
                >
                  {!keyword && (
                    <ChevronLeft size={28} className={styles.backArrow} />
                  )}
                  <h1 className={styles.title}>{title}</h1>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className={styles.grid}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  <AnimatePresence mode="popLayout">
                    {results.map((movie, index) => (
                      <HorizontalSearchCard
                        key={movie._id || index}
                        movie={movie}
                        cdnDomain={cdnDomain}
                        index={index}
                        onPersonClick={(id) => setSelectedPersonId(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <PersonModal
                  personId={selectedPersonId}
                  onClose={() => setSelectedPersonId(null)}
                />

                {totalPages > 1 && (
                  <div style={{ marginTop: '0', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      currentPage={page}
                      totalItems={pagination?.totalItems || 0}
                      itemsPerPage={pagination?.totalItemsPerPage || 20}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className={styles.noResults}>
                    No results found matching your criteria.
                  </div>
                )}
              </>
            )}
          </>
        ) : !isSearchActive && isBrowseLoading ? (
          <div className={styles.browseAllWrapper}>
            <h2 className={styles.browseAllTitle}>Browse all</h2>
            <div className={styles.categoryGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.categorySkeletonCard} />
              ))}
            </div>
          </div>
        ) : !isSearchActive ? (
          <div className={styles.browseAllWrapper}>
            {browseCategories.special.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 className={styles.browseAllTitle}>Featured</h2>
                <div className={styles.categoryGrid}>
                  {browseCategories.special.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={styles.categoryCard}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className={styles.categoryName}>{cat.name}</span>
                      {cat.poster && (
                        <img
                          src={tmdb.getImageUrl(cat.poster, 'w300')}
                          alt={cat.name}
                          className={styles.categoryPoster}
                          loading="lazy"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {browseCategories.studios.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 className={styles.browseAllTitle}>Famous Studios</h2>
                <div className={styles.categoryGrid}>
                  {browseCategories.studios.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={styles.categoryCard}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className={styles.categoryName}>{cat.name}</span>
                      {cat.poster && (
                        <img
                          src={tmdb.getImageUrl(cat.poster, 'w300')}
                          alt={cat.name}
                          className={styles.categoryPoster}
                          loading="lazy"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {browseCategories.networks.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 className={styles.browseAllTitle}>Popular Networks</h2>
                <div className={styles.categoryGrid}>
                  {browseCategories.networks.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={styles.categoryCard}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className={styles.categoryName}>{cat.name}</span>
                      {cat.poster && (
                        <img
                          src={tmdb.getImageUrl(cat.poster, 'w300')}
                          alt={cat.name}
                          className={styles.categoryPoster}
                          loading="lazy"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {browseCategories.movieGenres.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 className={styles.browseAllTitle}>Movie Genres</h2>
                <div className={styles.categoryGrid}>
                  {browseCategories.movieGenres.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={styles.categoryCard}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className={styles.categoryName}>{cat.name}</span>
                      {cat.poster && (
                        <img
                          src={tmdb.getImageUrl(cat.poster, 'w300')}
                          alt={cat.name}
                          className={styles.categoryPoster}
                          loading="lazy"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {browseCategories.tvGenres.length > 0 && (
              <div>
                <h2 className={styles.browseAllTitle}>TV Genres</h2>
                <div className={styles.categoryGrid}>
                  {browseCategories.tvGenres.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={styles.categoryCard}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className={styles.categoryName}>{cat.name}</span>
                      {cat.poster && (
                        <img
                          src={tmdb.getImageUrl(cat.poster, 'w300')}
                          alt={cat.name}
                          className={styles.categoryPoster}
                          loading="lazy"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.resultsArea}>
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInputField}
            placeholder="Search movies, TV shows, actors..."
            disabled
          />
        </div>
        <div className={styles.browseAllWrapper}>
          <h2 className={styles.browseAllTitle}>Browse All</h2>
          <div className={styles.categoryGrid}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={styles.categorySkeletonCard} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchView() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
