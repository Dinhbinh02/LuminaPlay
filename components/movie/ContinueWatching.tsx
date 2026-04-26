'use client';

import React, { useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ContinueWatching.module.css';

interface WatchHistoryItem {
  id: string;
  slug: string;
  title: string;
  backdrop: string;
  currentTime: number;
  duration: number;
  lastUpdated: number;
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

  const calculateProgress = (current: number, duration: number) => {
    if (!duration) return 0;
    return Math.min((current / duration) * 100, 100);
  };

  const formatTimeLeft = (current: number, duration: number) => {
    const left = duration - current;
    if (left <= 0) return 'Finished';
    const mins = Math.ceil(left / 60);
    return `${mins}m left`;
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Continue Watching</h2>
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
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            className={styles.cardWrapper}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/watch/${movie.slug}`} className={styles.card}>
              <div className={styles.thumbnailWrapper}>
                <Image 
                  src={movie.backdrop} 
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
                    style={{ width: `${calculateProgress(movie.currentTime, movie.duration)}%` }}
                  />
                </div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
                <p className={styles.meta}>
                  {formatTimeLeft(movie.currentTime, movie.duration)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
