'use client';

import React, { useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ContinueWatching.module.css';

interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  progress: number;
  currentTime: number;
  episodeNum?: number;
  seasonNum?: number;
  slug?: string;
  watched_at?: string;
}

interface ContinueWatchingProps {
  movies: WatchHistoryItem[];
}

export default function ContinueWatching({ movies }: ContinueWatchingProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

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

  const getWatchLink = (movie: WatchHistoryItem) => {
    // If it's a TMDB ID (numeric), use type/id format
    const isNumeric = /^\d+$/.test(movie.id);
    if (isNumeric) {
      const type = movie.seasonNum ? 'tv' : 'movie';
      return `/${type}/${movie.id}`;
    }
    // If it's an Ophim slug or ID
    return `/movie/${movie.id}`;
  };

  const formatSubTitle = (movie: WatchHistoryItem) => {
    if (movie.seasonNum && movie.episodeNum) {
      return `S${movie.seasonNum} : E${movie.episodeNum}`;
    }
    if (movie.progress > 95) return 'Finished';
    return `${Math.round(movie.progress)}% watched`;
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>Continue Watching</h2>
        </div>
        {movies.length > 3 && (
          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={() => scroll('left')}>
              <ChevronLeft size={18} />
            </button>
            <button className={styles.controlBtn} onClick={() => scroll('right')}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.sliderContainer} ref={scrollContainerRef}>
        {movies
          .filter((item, index, self) => 
            index === self.findIndex((t) => (
              String(t.id) === String(item.id) && 
              t.seasonNum === item.seasonNum && 
              t.episodeNum === item.episodeNum
            ))
          )
          .map((movie) => (
            <motion.div
              key={`${movie.id}-${movie.seasonNum || 0}-${movie.episodeNum || 0}`}
              className={styles.cardWrapper}
            >
              <Link href={getWatchLink(movie)} className={styles.card}>
                <div className={styles.thumbnailWrapper}>
                  <Image
                    src={getImageUrl(movie.poster)}
                    alt={movie.title}
                    fill
                    className={styles.thumbnail}
                    sizes="(max-width: 768px) 240px, 300px"
                    quality={70}
                  />
                  <div className={styles.overlay}>
                    <Play size={32} fill="white" className={styles.playIcon} />
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${movie.progress}%` }}
                    />
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.movieTitle}>{movie.title}</h3>
                  <div className={styles.metaRow}>
                    <p className={styles.meta}>
                      {formatSubTitle(movie)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
}
