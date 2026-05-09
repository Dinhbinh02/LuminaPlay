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
              src={movie.poster}
              alt={movie.title}
              fill
              className={styles.poster}
              style={{ 
                opacity: isLoaded ? 1 : 0,
                transition: isLoaded && loadedImagesCache.has(movie.poster) ? 'none' : 'opacity 0.3s ease'
              }}
              sizes="(max-width: 768px) 160px, 200px"
              quality={75}
              priority={index < 6}
              onLoad={() => {
                loadedImagesCache.add(movie.poster);
                setIsLoaded(true);
              }}
            />
            {(movie.episodeCurrent || movie.quality || movie.status) && (
              <div className={`
                ${styles.badge} 
                ${movie.status === 'trailer' || movie.episodeCurrent?.toLowerCase() === 'trailer' ? styles.trailer : ''}
                ${!movie.episodeCurrent || movie.episodeCurrent === 'Đang cập nhật' ? styles.soon : ''}
              `}>
                {ophim.formatEpisode(movie.episodeCurrent || movie.quality, movie.episodeTotal, movie.status)}
              </div>
            )}
          </div>
        </div>
        <div className={styles.movieInfo}>
          <h3 className={styles.movieTitle}>{movie.title}</h3>
          <div className={styles.movieMeta}>
            <span>{movie.year}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MovieSection({ title, type, slug, params = {}, movies }: MovieSectionProps) {
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


  // Save scroll position
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollRegistry[title] = scrollContainerRef.current.scrollLeft;
    }
  }, [title]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage || movies) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, {
      root: scrollContainerRef.current,
      rootMargin: '400px'
    });

    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, movies]);

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
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.poster,
        slug: item.media_type === 'tv' || (!item.title && item.name) ? `tv/${item.id}` : `movie/${item.id}`,
        year: (item.release_date || item.first_air_date || '')?.split('-')[0],
        quality: item.vote_average?.toFixed(1),
        episodeCurrent: item.media_type === 'tv' ? 'Series' : 'Movie',
        status: 'completed'
      }));
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
  }, [data, movies]);

  if (isLoading && allMovies.length === 0 && !movies) {
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
      <div className={styles.header}>
        <Link
          href={buildSearchUrl()}
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
        <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={() => scroll('left')}>
            <ChevronLeft size={20} />
          </button>
          <button className={styles.controlBtn} onClick={() => scroll('right')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        className={styles.sliderContainer}
        ref={(el) => {
          if (el) {
            (scrollContainerRef as any).current = el;
            const savedPos = scrollRegistry[title];
            if (savedPos) {
              el.scrollLeft = savedPos;
            }
          }
        }}
        onScroll={handleScroll}
      >
        {allMovies.map((movie, index) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            index={index}
            lastElementRef={index === allMovies.length - 1 ? lastElementRef : null}
          />
        ))}
        {isFetchingNextPage && (
          <div className={styles.loaderWrapper}>
            <Loader2 className={styles.spinner} />
          </div>
        )}
      </div>
    </section>
  );
}
