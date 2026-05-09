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
  if (!movie) return null;

  const fallbackImage = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a76141859359722521fd48c5a093.svg';
  
  let posterUrl = movie.thumb_url;
  if (!posterUrl) {
    posterUrl = fallbackImage;
  } else if (!posterUrl.startsWith('http')) {
    posterUrl = ophim.getImageUrl(movie.thumb_url, cdnDomain);
  }

  // Double check posterUrl is not empty after processing
  const finalSrc = posterUrl || fallbackImage;

  return (
    <motion.div
      className={styles.cardWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.05 }}
    >
      <Link href={`/${movie.slug}`}>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <Image
              src={finalSrc}
              alt={movie.name || 'Movie Poster'}
              fill
              loading="lazy"
              className={styles.poster}
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 18vw, 200px"
              unoptimized={finalSrc.startsWith('https://image.tmdb.org')}
            />
          </div>
        </div>
        <div className={styles.movieInfo}>
          <h3 className={styles.movieTitle}>{movie.name || 'Untitled'}</h3>
          <div className={styles.movieMeta}>
            <span>{movie.year || 'N/A'}</span>
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
        const source = searchParams.get('source');
        const year = searchParams.get('year');
        const rating = searchParams.get('rating');
        const runtime = searchParams.get('runtime');
        const company = searchParams.get('company');

        let data;

        if (mode === 'history') {
          setTitle('Watch History');
          if (typeof window !== 'undefined') {
            try {
              const watchHistory = localStorage.getItem('watch_history');
              if (watchHistory) {
                const parsed = JSON.parse(watchHistory);
                const sorted = parsed.sort((a: any, b: any) => {
                  const timeA = a.lastUpdated || (a.lastWatched ? new Date(a.lastWatched).getTime() : 0);
                  const timeB = b.lastUpdated || (b.lastWatched ? new Date(b.lastWatched).getTime() : 0);
                  return timeB - timeA;
                });

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

        // SMART DISCOVERY (TMDB)
        if (source === 'tmdb' || year || rating || runtime || company || (genre && genre.length < 5) || (country && country.length < 5)) {
          setTitle('Discovery Results');
          const tmdb = (await import('@/lib/tmdb')).tmdb;
          const discoverParams: Record<string, string> = {
            page: page.toString()
          };

          if (year) {
            if (year.endsWith('s')) {
              const decade = parseInt(year);
              discoverParams['primary_release_date.gte'] = `${decade}-01-01`;
              discoverParams['primary_release_date.lte'] = `${decade + 9}-12-31`;
            } else {
              discoverParams['primary_release_year'] = year;
            }
          }

          if (rating) discoverParams['vote_average.gte'] = rating;
          if (runtime) {
            if (runtime === 'short') discoverParams['with_runtime.lte'] = '90';
            else if (runtime === 'medium') {
              discoverParams['with_runtime.gte'] = '90';
              discoverParams['with_runtime.lte'] = '120';
            }
            else if (runtime === 'long') discoverParams['with_runtime.gte'] = '120';
          }
          if (company) discoverParams['with_companies'] = company;
          if (genre) discoverParams['with_genres'] = genre;
          if (country) discoverParams['with_origin_country'] = country;

          const tmdbData = await tmdb.discover('movie', discoverParams);
          if (tmdbData) {
            const normalized = tmdbData.results.map((item: any) => ({
              _id: item.id,
              name: item.title || item.name,
              slug: item.media_type === 'tv' ? `tv/${item.id}` : `movie/${item.id}`,
              thumb_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
              year: (item.release_date || item.first_air_date || '').split('-')[0],
              quality: item.vote_average?.toFixed(1) || '',
              episode_current: 'TMDB'
            }));
            setResults(normalized);
            setCdnDomain('');
            setPagination({
              totalItems: tmdbData.total_results,
              totalItemsPerPage: 20,
              currentPage: page
            });
          }
          setIsLoading(false);
          return;
        }

        if (keyword) {
          setTitle(`Search results for: "${keyword}"`);
          const tmdb = (await import('@/lib/tmdb')).tmdb;
          const tmdbData = await tmdb.search(keyword, 'multi', page);

          if (tmdbData) {
            const normalized = tmdbData.results.map((item: any) => ({
              _id: item.id,
              name: item.title || item.name,
              slug: item.media_type === 'tv' ? `tv/${item.id}` : `movie/${item.id}`,
              thumb_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
              year: (item.release_date || item.first_air_date || '').split('-')[0],
              quality: item.vote_average?.toFixed(1) || '',
              episode_current: 'TMDB'
            }));
            setResults(normalized);
            setCdnDomain('');
            setPagination({
              totalItems: tmdbData.total_results,
              totalItemsPerPage: 20,
              currentPage: page
            });
          }
          setIsLoading(false);
          return;
        }

        // FALLBACK: OPHIM (For homepage "View All" links and categories)
        const baseSlug = category || 'phim-moi';
        let customTitle = '';
        const parts = [];

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
          const catObj = CATEGORIES.find(c => c.slug === baseSlug);
          customTitle = catObj ? catObj.name : baseSlug;
        }

        setTitle(customTitle);

        data = await ophim.getMovies('danh-sach', baseSlug, {
          page,
          category: genre || undefined,
          country: country || undefined
        });

        if (data && data.data) {
          setResults(data.data.items || []);
          setCdnDomain(data.data.APP_DOMAIN_CDN_IMAGE || '');
          setPagination(data.data.params?.pagination);

          if (!genre && !country) {
            if (data.data.titlePage) {
              setTitle(data.data.titlePage);
            } else if ((data.data as any).seoOnPage?.titleHead) {
              setTitle((data.data as any).seoOnPage.titleHead);
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
  }, [keyword, country, genre, category, page, genresData, countriesData, searchParams]);

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
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {results.map((movie, index) => (
              <SearchCard
                key={movie._id || index}
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
              itemsPerPage={pagination?.totalItemsPerPage || 20}
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
            {Array.from({ length: 15 }).map((_, i) => (
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
