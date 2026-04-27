'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Pagination from "@/components/ui/Pagination";
import { useGenres, useCountries } from "@/hooks/useMovie";
import { CATEGORIES } from "@/components/layout/FilterOverlay";
import styles from './SearchPage.module.css';

function SearchCard({ movie, cdnDomain, index }: { movie: any, cdnDomain: string, index: number }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/watch/${movie.slug}`}>
        <div className={styles.card}>
          {!isLoaded && <div className={styles.skeleton} />}
          <Image
            src={ophim.getImageUrl(movie.thumb_url, cdnDomain)}
            alt={movie.name}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 18vw, 200px"
            style={{
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease'
            }}
            onLoadingComplete={() => setIsLoaded(true)}
            quality={70}
          />
          <div className={styles.cardInfo}>
            <h3>{movie.name}</h3>
            <div className={styles.meta}>
              <span>{movie.year}</span>
              {(movie.episode_current || movie.quality) && (
                <span className={`${styles.quality} ${(movie.quality === 'Trailer' || movie.episode_current === 'Trailer') ? styles.trailer : ''}`}>
                  {ophim.formatEpisode(movie.episode_current || movie.quality)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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

  const [results, setResults] = useState<any[]>([]);
  const [cdnDomain, setCdnDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const [currentQuery, setCurrentQuery] = useState(searchParams.toString());

  if (searchParams.toString() !== currentQuery) {
    setCurrentQuery(searchParams.toString());
    setResults([]);
    setIsLoading(true);
    setTitle('');
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setTitle('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const mode = searchParams.get('mode');
        let data;

        if (mode === 'history') {
          setTitle('Watch History');
          if (typeof window !== 'undefined') {
            try {
              const watchHistory = localStorage.getItem('watch_history');
              if (watchHistory) {
                const parsed = JSON.parse(watchHistory);
                // Sort by lastUpdated descending to match home page
                const sorted = parsed.sort((a: any, b: any) => {
                  const timeA = a.lastUpdated || (a.lastWatched ? new Date(a.lastWatched).getTime() : 0);
                  const timeB = b.lastUpdated || (b.lastWatched ? new Date(b.lastWatched).getTime() : 0);
                  return timeB - timeA;
                });

                // Transform history items to match the expected structure
                const historyItems = sorted.map((item: any) => ({
                  _id: item.id || item.slug,
                  name: item.title,
                  slug: item.slug,
                  thumb_url: item.poster,
                  year: item.year,
                  quality: item.quality,
                  episode_current: item.episodeName ? `EP ${item.episodeName}` : item.quality
                }));
                
                setResults(historyItems);
              } else {
                setResults([]);
              }
            } catch (e) {
              console.error("Failed to load history in SearchPage", e);
              setResults([]);
            }
          }
          setIsLoading(false);
          return;
        }

        if (keyword) {
          setTitle(`Search results for: "${keyword}"`);
          data = await ophim.search(keyword, page);
        } else {
          const baseSlug = category || 'phim-moi';

          // Determine the title based on filters
          let customTitle = '';
          const parts = [];

          if (category && category !== 'phim-moi') {
            const catObj = CATEGORIES.find((c: { name: string; slug: string }) => c.slug === category);
            parts.push(catObj ? catObj.name : category);
          }

          if (genre) {
            const genreNames = genre.split(',').map(s => {
              const g = genresData?.data?.items?.find((i: any) => i.slug === s);
              return g ? g.name : s;
            });
            parts.push(genreNames.join(', '));
          }

          if (country) {
            const countryNames = country.split(',').map(s => {
              const c = countriesData?.data?.items?.find((i: any) => i.slug === s);
              return c ? c.name : s;
            });
            parts.push(countryNames.join(', '));
          }

          if (parts.length > 0) {
            customTitle = parts.join(' • ');
          } else {
            customTitle = 'Phim Mới';
          }

          setTitle(customTitle);

          data = await ophim.getMovies('danh-sach', baseSlug, {
            page,
            category: genre || undefined,
            country: country || undefined
          });
        }

        if (data) {
          setResults(data.data?.items || []);
          setCdnDomain(data.data?.APP_DOMAIN_CDN_IMAGE || '');
          setPagination(data.data?.params?.pagination);

          // Only use API title if we don't have specific filters 
          // (because API doesn't know how to title multi-filters correctly)
          if (!genre && !country) {
            if (data.data?.titlePage) {
              setTitle(data.data.titlePage);
            } else if (data.data?.seoOnPage?.titleHead) {
              setTitle(data.data.seoOnPage.titleHead);
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [keyword, country, genre, category, page, genresData, countriesData]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) : 0;

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.skeletonTitle} />
      ) : (
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
          {page > 1 && <span className={styles.pageLabel}>Page {page}</span>}
        </div>
      )}

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {results.map((movie, index) => (
              <SearchCard
                key={movie._id}
                movie={movie}
                cdnDomain={cdnDomain}
                index={index}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalItems={pagination?.totalItems || 0}
              itemsPerPage={pagination?.totalItemsPerPage || 24}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {!isLoading && results.length === 0 && (
        <div className={styles.noResults}>
          {searchParams.get('mode') === 'history' 
            ? 'No watch history found.' 
            : 'No movies found matching your criteria.'}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className={styles.main}>
      <Header />
      <Suspense fallback={
        <div className={styles.container}>
          <div className={styles.skeletonTitle} />
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}
