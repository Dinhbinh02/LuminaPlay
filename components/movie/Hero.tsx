'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';

interface HeroMovie {
  title: string;
  description: string;
  backdrop: string;
  poster: string;
  slug: string;
  quality?: string;
  year?: number;
  lang?: string;
  genres?: string[];
  rating?: number;
  rank?: number;
  episode?: string;
}

interface HeroProps {
  movies?: HeroMovie[];
}

export default function Hero({ movies = [] }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <section className={styles.hero}>
      <AnimatePresence mode="wait">
        <Link 
          href={`/watch/${movie.slug}`} 
          className={styles.heroLink}
          key={movie.slug}
        >
          <motion.div 
            className={styles.heroBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onPanEnd={(e, info) => {
              if (info.offset.x > 50) {
                prevSlide();
              } else if (info.offset.x < -50) {
                nextSlide();
              }
            }}
          >
            {/* Desktop Backdrop */}
            <div className={styles.desktopOnly}>
              <Image 
                src={movie.backdrop} 
                alt={movie.title} 
                fill
                sizes="(max-width: 768px) 100vw, 100vw"
                className={styles.heroImg}
                priority
                loading="eager"
                quality={85}
              />
            </div>
            {/* Mobile Poster */}
            <div className={styles.mobileOnly}>
              <Image 
                src={movie.poster} 
                alt={movie.title} 
                fill
                sizes="(max-width: 768px) 100vw, 100vw"
                className={styles.heroImg}
                priority
                loading="eager"
                quality={85}
              />
            </div>
            <div className={styles.heroOverlay}></div>
          </motion.div>

          <div className={styles.heroContent}>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {movie.rank && (
                <div className={styles.rankBadge}>
                  <span className={styles.rankNumber}>#{movie.rank}</span>
                  <span className={styles.rankText}>Trending Today</span>
                </div>
              )}

              <h1 className={styles.title}>{movie.title}</h1>
              
              <div className={styles.metaInfo}>
                {movie.rating ? movie.rating > 0 ? (
                  <div className={styles.rating}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                ) : null : null}
                <span className={styles.metaItem}>{movie.year}</span>
                <span className={styles.qualityBadge}>{movie.quality}</span>
                <span className={styles.langBadge}>{movie.lang}</span>
                {movie.episode && <span className={styles.metaItem}>{movie.episode}</span>}
              </div>

              <p className={styles.description}>
                {movie.description}
              </p>

              <div className={styles.genres}>
                {movie.genres?.slice(0, 3).map((genre, idx) => (
                  <span key={idx} className={styles.genreTag}>{genre}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </Link>
      </AnimatePresence>

      {movies.length > 1 && (
        <>
          <button className={`${styles.sliderBtn} ${styles.prev}`} onClick={prevSlide}>
            <ChevronLeft size={30} />
          </button>
          <button className={`${styles.sliderBtn} ${styles.next}`} onClick={nextSlide}>
            <ChevronRight size={30} />
          </button>
          
          <div className={styles.dots}>
            {movies.map((_, idx) => (
              <div 
                key={idx} 
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
