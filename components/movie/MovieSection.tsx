'use client';

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ophim } from '@/lib/ophim';
import { useInfiniteMovies } from '@/hooks/useMovie';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import styles from './MovieSection.module.css';

interface MovieSectionProps {
  title: string;
  type?: 'danh-sach' | 'the-loai' | 'quoc-gia';
  slug?: string;
  params?: any;
  movies?: any[];
  infiniteData?: any;
  gridMode?: boolean;
  href?: string;
}

// Memory cache for scroll positions during the session
const scrollRegistry: Record<string, number> = {};
// Global set to track already loaded images to skip animations on return
const loadedImagesCache = new Set<string>();

function MovieCard({ movie, index, lastElementRef }: { movie: any, index: number, lastElementRef?: any }) {
  const [isLoaded, setIsLoaded] = useState(loadedImagesCache.has(movie.poster));
  const { setPageLoading } = useLoadingStore();

  const handleClick = (e: React.MouseEvent) => {
    // Show loader immediately
    setPageLoading(true);
  };

  return (
    <motion.div
      ref={lastElementRef}
      className={styles.cardWrapper}
    >
      <Link href={`/${movie.slug}`} className={styles.cardLink} onClick={handleClick} prefetch={true}>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            {!isLoaded && (
              <div className={styles.cardLoader}>
                <div className={styles.cardSpinner}></div>
              </div>
            )}
            <Image
              src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
              alt={movie.title}
              fill
              className={styles.poster}
              style={{
                opacity: isLoaded ? 1 : 0,
                transition: isLoaded && movie.poster && loadedImagesCache.has(movie.poster) ? 'none' : 'opacity 0.3s ease'
              }}
              sizes="(max-width: 768px) 160px, 200px"
              quality={75}
              priority={index < 6}
              onLoad={() => {
                if (movie.poster) {
                  loadedImagesCache.add(movie.poster);
                }
                setIsLoaded(true);
              }}
            />
          </div>
        </div>

      </Link>
    </motion.div>
  );
}

export default function MovieSection({ title, type, slug, params = {}, movies, infiniteData, gridMode, href }: MovieSectionProps) {
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteMovies(type!, slug!, memoizedParams, { enabled: !!type && !!slug && !movies });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const restoredTitles = useRef<Set<string>>(new Set());



  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage || movies || (infiniteData && infiniteData.isFetchingNextPage)) return;
    if (observer.current) observer.current.disconnect();

    const fetchNext = infiniteData ? infiniteData.fetchNextPage : fetchNextPage;
    const hasNext = infiniteData ? infiniteData.hasNextPage : hasNextPage;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        fetchNext();
      }
    }, {
      root: gridMode ? null : scrollContainerRef.current,
      rootMargin: gridMode ? '800px' : '400px'
    });

    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, movies, infiniteData]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;

      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const allMovies = useMemo(() => {
    if (movies) {
      return movies.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : (item.poster || ''),
        slug: item.media_type === 'tv' || (!item.title && item.name) ? `tv/${item.id}` : `movie/${item.id}`,
        year: (item.release_date || item.first_air_date || '')?.split('-')[0],
        quality: item.vote_average?.toFixed(1),
        episodeCurrent: item.media_type === 'tv' ? 'Series' : 'Movie',
        status: 'completed'
      }));
    }

    if (infiniteData?.data) {
      return infiniteData.data.pages.flatMap((page: any) =>
        page.results.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          slug: item.media_type === 'tv' ? `tv/${item.id}` : `movie/${item.id}`,
          year: (item.release_date || item.first_air_date || '')?.split('-')[0],
          quality: item.vote_average?.toFixed(1),
          episodeCurrent: item.media_type === 'tv' ? 'Series' : 'Movie',
          status: 'completed'
        }))
      );
    }

    return data?.pages.flatMap((page: any) =>
      page.data.items.map((item: any) => ({
        id: item._id,
        title: item.origin_name || item.name,
        poster: ophim.getImageUrl(item.thumb_url, page.data.APP_DOMAIN_CDN_IMAGE),
        slug: `movie/${item.slug}`,
        year: item.year?.toString(),
        quality: item.quality,
        episodeCurrent: item.episode_current,
        episodeTotal: item.episode_total,
        status: item.status
      }))
    ) || [];
  }, [data, movies, infiniteData]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && !gridMode) {
      // Restore scroll position ONLY ONCE per title when movies are available
      if (!restoredTitles.current.has(title) && allMovies.length > 0) {
        const savedPos = scrollRegistry[title];
        if (savedPos) {
          el.scrollLeft = savedPos;
        }
        restoredTitles.current.add(title);
      }

      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [gridMode, checkScroll, title, allMovies.length > 0]);

  // Save scroll position
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollRegistry[title] = scrollContainerRef.current.scrollLeft;
      checkScroll();
    }
  }, [title, checkScroll]);

  if ((isLoading || (infiniteData && infiniteData.isLoading)) && allMovies.length === 0 && !movies) {
    return (
      <div className={styles.section}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
      </div>
    );
  }

  const buildSearchUrl = () => {
    let url = `/search?${type === 'danh-sach' ? 'category' : type === 'the-loai' ? 'genre' : 'country'}=${slug}`;
    if (params) {
      Object.keys(params).forEach(key => {
        url += `&${key}=${params[key]}`;
      });
    }
    return url;
  };

  return (
    <section className={styles.section}>
      {title && (
        <div className={styles.header}>
          <Link
            href={href || buildSearchUrl()}
            className={styles.titleWrapper}
          >
            <h2 className={styles.title}>
              {title.startsWith('Because you watched') ? (
                <>
                  <span className={styles.titlePrefix}>Because you watched</span>
                  <span className={styles.titleHighlight}>{title.replace('Because you watched ', '')}</span>
                </>
              ) : title}
            </h2>
          </Link>
          {/* Header controls removed, moved to sliderWrapper */}
        </div>
      )}

      <div className={gridMode ? styles.gridWrapper : styles.sliderWrapper}>
        {!gridMode && canScrollLeft && (
          <button className={`${styles.controlBtn} ${styles.left}`} onClick={() => scroll('left')}>
            <ChevronLeft size={28} />
          </button>
        )}
        <div
          className={gridMode ? styles.gridContainer : styles.sliderContainer}
          ref={scrollContainerRef}
          onScroll={!gridMode ? handleScroll : undefined}
        >
          {allMovies.map((movie: any, index: number) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              lastElementRef={index === allMovies.length - 1 ? lastElementRef : null}
            />
          ))}
          {(isFetchingNextPage || (infiniteData && infiniteData.isFetchingNextPage)) && (
            <div className={gridMode ? styles.gridLoaderWrapper : styles.loaderWrapper}>
              <Loader2 className={styles.spinner} />
            </div>
          )}
        </div>
        {!gridMode && canScrollRight && (
          <button className={`${styles.controlBtn} ${styles.right}`} onClick={() => scroll('right')}>
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </section>
  );
}
