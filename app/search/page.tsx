'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from "@/components/ui/Pagination";
import { useGenres, useCountries } from "@/hooks/useMovie";
import { CATEGORIES } from "@/components/layout/FilterOverlay";
import PersonModal from "@/components/movie/PersonModal";
import { Info, Star, Calendar, Users, Film, Tv, Search } from 'lucide-react';
import styles from './SearchPage.module.css';

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
  const fallbackImage = isPerson 
    ? 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe9573754b761ca248618f7737233857d9760777498c4d32e92c68612185c7.svg'
    : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a76141859359722521fd48c5a093.svg';
  
  let posterUrl = movie.thumb_url;
  if (!posterUrl) {
    posterUrl = fallbackImage;
  } else if (!posterUrl.startsWith('http')) {
    posterUrl = ophim.getImageUrl(movie.thumb_url, cdnDomain);
  }

  const finalSrc = posterUrl || fallbackImage;

  const content = (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={finalSrc}
          alt={movie.name || 'Poster'}
          fill
          loading="lazy"
          className={styles.poster}
          sizes="110px"
          unoptimized={finalSrc.startsWith('https://image.tmdb.org')}
        />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h2 className={styles.movieTitle}>{movie.name}</h2>
          {movie.year && <span className={styles.year}>{movie.year}</span>}
        </div>
        
        {movie.overview && (
          <p className={styles.description}>{movie.overview}</p>
        )}

        <div className={styles.cardFooter}>
          {movie.vote_average ? (
            <div className={styles.rating}>
              <Star size={14} fill="currentColor" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          ) : movie.quality && (
            <div className={styles.badge}>{movie.quality}</div>
          )}
          
          <div className={`${styles.badge} ${isPerson ? styles.personBadge : ''}`}>
            {movie.type?.toUpperCase() || 'MOVIE'}
          </div>
          
          {movie.episode_current && movie.episode_current !== 'TMDB' && (
            <span>{movie.episode_current}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className={styles.cardWrapper}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 10) * 0.05 }}
    >
      {isPerson ? (
        <div onClick={() => onPersonClick(movie._id.toString())} style={{ cursor: 'pointer' }}>
          {content}
        </div>
      ) : (
        <Link href={`/${movie.slug}`}>
          {content}
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

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: genresData } = useGenres();
  const { data: countriesData } = useCountries();

  const keyword = searchParams.get('q') || searchParams.get('keyword');
  const country = searchParams.get('country');
  const genre = searchParams.get('genre');
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const activeType = searchParams.get('type') || 'multi';

  const [results, setResults] = useState<any[]>([]);
  const [counts, setCounts] = useState({ movie: 0, tv: 0, person: 0 });
  const [cdnDomain, setCdnDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const [currentQuery, setCurrentQuery] = useState(searchParams.toString());
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

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
    setIsLoading(true);
    setTitle('');
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const mode = searchParams.get('mode');
        const source = searchParams.get('source');
        const year = searchParams.get('year');
        const rating = searchParams.get('rating');
        const runtime = searchParams.get('runtime');
        const company = searchParams.get('company');

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
        if (source === 'tmdb' || year || rating || runtime || company || keyword || (genre && genre.length < 5) || (country && country.length < 5)) {
          const tmdb = (await import('@/lib/tmdb')).tmdb;
          let tmdbData;

          if (keyword) {
            setTitle(`Search results for: "${keyword}"`);
            tmdbData = await tmdb.search(keyword, activeType as any, page, {
              language: 'vi-VN',
              include_image_language: 'vi,en,null'
            });
          } else {
            setTitle('Discovery Results');
            const discoverParams: Record<string, string> = {
              page: page.toString(),
              language: 'vi-VN',
              include_image_language: 'vi,en,null'
            };
            if (year) discoverParams[year.endsWith('s') ? 'primary_release_date.gte' : 'primary_release_year'] = year;
            if (rating) discoverParams['vote_average.gte'] = rating;
            if (genre) discoverParams['with_genres'] = genre;
            if (country) discoverParams['with_origin_country'] = country;
            
            tmdbData = await tmdb.discover('movie', discoverParams);
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
  }, [keyword, country, genre, category, page, activeType, searchParams]);

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
  };

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) : 0;

  return (
    <div className={styles.container}>
      {keyword && (
        <SearchSidebar 
          counts={counts} 
          activeType={activeType} 
          onTypeChange={handleTypeChange} 
        />
      )}

      <div className={styles.resultsArea}>
        <div className={styles.titleWrapper}>
          {isLoading ? (
            <div className={styles.skeletonTitle} />
          ) : (
            <>
              <h1 className={styles.title}>{title}</h1>
              {pagination && (
                <p className={styles.subtitle}>
                  Showing {results.length} of {pagination.totalItems.toLocaleString()} results
                </p>
              )}
            </>
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
              <div style={{ marginTop: '40px' }}>
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
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header isSolid />
      <main className={styles.main}>
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
      </main>
    </>
  );
}
