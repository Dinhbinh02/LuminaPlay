'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import styles from './TopTrendingSection.module.css';

interface TopTrendingSectionProps {
  movies: any[];
  title?: string;
}

// Memory cache for scroll positions during the session
const scrollRegistry: Record<string, number> = {};

export default function TopTrendingSection({ movies, title = "TOP 10" }: TopTrendingSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { setPageLoading } = useLoadingStore();

    // Save scroll position
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        scrollRegistry[title] = scrollContainerRef.current.scrollLeft;
      }
    };

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

    const handleCardClick = (e: React.MouseEvent, movieUrl: string) => {
      e.preventDefault();
      setPageLoading(true);
      router.push(movieUrl);
    };

    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={() => scroll('left')}>
              <ChevronLeft size={24} />
            </button>
            <button className={styles.controlBtn} onClick={() => scroll('right')}>
              <ChevronRight size={24} />
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
          {movies.slice(0, 10).map((movie, index) => {
            const movieUrl = movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;
            return (
              <motion.div
                key={movie.id}
                className={styles.cardWrapper}
              >
                <div className={`${styles.rankNumber} ${index === 9 ? styles.doubleDigit : ''}`}>
                  {index + 1}
                </div>
                <Link 
                  className={styles.cardLink} 
                  href={movieUrl}
                  onClick={() => setPageLoading(true)}
                  prefetch={true}
                >
                  <div className={styles.card}>
                    <Image
                      src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                      alt={movie.title || movie.name}
                      fill
                      className={styles.poster}
                      sizes="200px"
                      priority={index < 5}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
}
