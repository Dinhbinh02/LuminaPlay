'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ophim } from '@/lib/ophim';
import { useInfiniteMovies } from '@/hooks/useMovie';
import styles from './MovieSection.module.css';

interface Movie {
  id: string;
  title: string;
  poster: string;
  year?: string;
  slug: string;
}

interface MovieSectionProps {
  title: string;
  type: 'danh-sach' | 'the-loai' | 'quoc-gia';
  slug: string;
  params?: any;
}

// Memory cache for scroll positions during the session
const scrollRegistry: Record<string, number> = {};

export default function MovieSection({ title, type, slug, params = {} }: MovieSectionProps) {
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteMovies(type, slug, memoizedParams);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Restore scroll position
  useEffect(() => {
    if (data && scrollContainerRef.current) {
      const savedPos = scrollRegistry[title];
      if (savedPos) {
        scrollContainerRef.current.scrollLeft = savedPos;
      }
    }
  }, [data, title]);

  // Save scroll position
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollRegistry[title] = scrollContainerRef.current.scrollLeft;
    }
  }, [title]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, {
      root: scrollContainerRef.current,
      rootMargin: '400px' // Load earlier for smoother feel
    });

    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

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

  const allMovies = useMemo(() => (
    data?.pages.flatMap((page: any) =>
      page.data.items.map((item: any) => ({
        id: item._id,
        title: item.name,
        poster: ophim.getImageUrl(item.thumb_url, page.data.APP_DOMAIN_CDN_IMAGE),
        slug: item.slug,
        year: item.year?.toString(),
        quality: item.quality,
        episodeCurrent: item.episode_current,
        episodeTotal: item.episode_total,
        status: item.status
      }))
    ) || []
  ), [data]);

  if (isLoading && allMovies.length === 0) {
    return (
      <div className={styles.section}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Link
          href={`/search?${type === 'danh-sach' ? 'category' : type === 'the-loai' ? 'genre' : 'country'}=${slug}`}
          className={styles.titleWrapper}
        >
          <h2 className={styles.title}>{title}</h2>
          <ChevronRight className={styles.titleChevron} size={20} />
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
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {allMovies.map((movie, index) => (
          <motion.div
            key={movie.id}
            ref={index === allMovies.length - 1 ? lastElementRef : null}
            className={styles.cardWrapper}
          >
            <Link href={`/watch/${movie.slug}`}>
              <div className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className={styles.poster}
                    sizes="(max-width: 768px) 160px, 200px"
                    quality={60}
                    priority={index < 6} // Priority for first 6 items
                  />
                </div>
                <div className={styles.overlay}>
                  {(movie.episodeCurrent || movie.quality || movie.status) && (
                    <div className={`
                      ${styles.badge} 
                      ${movie.status === 'trailer' || movie.episodeCurrent?.toLowerCase() === 'trailer' ? styles.trailer : ''}
                      ${!movie.episodeCurrent || movie.episodeCurrent === 'Đang cập nhật' ? styles.soon : ''}
                    `}>
                      {ophim.formatEpisode(movie.episodeCurrent || movie.quality, movie.episodeTotal, movie.status)}
                    </div>
                  )}
                  <h3 className={styles.movieTitle}>{movie.title}</h3>
                  <div className={styles.meta}>
                    <span>{movie.year}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
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
