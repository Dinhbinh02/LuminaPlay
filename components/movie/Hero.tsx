'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import { Play, Info, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface HeroMovie {
  id: number;
  title: string;
  description: string;
  backdrop: string;
  poster: string;
  textless_poster?: string | null;
  logo?: string | null;
  media_type?: 'movie' | 'tv';
  year?: number | string;
  rating?: number;
  rank?: number;
  genres?: { name: string; slug: string }[];
}

interface HeroProps {
  movies?: HeroMovie[];
}

export default function Hero({ movies = [] }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlayDisabled, setIsAutoPlayDisabled] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const handleManualAction = (action: () => void) => {
    setIsAutoPlayDisabled(true);
    action();
  };

  useEffect(() => {
    if (movies.length <= 1 || isAutoPlayDisabled) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [movies.length, isAutoPlayDisabled, nextSlide]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  return (
    <section className={styles.hero}>
      {/* Invisible preloader for all backdrops */}
      <div style={{ display: 'none' }}>
        {movies.map(m => (
          <img key={`preload-${m.id}`} src={m.backdrop} alt="" />
        ))}
      </div>

      <div className={styles.slidesContainer}>
        <AnimatePresence initial={false}>
          <motion.div
            key={movie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className={styles.slide}
          >
            <div className={styles.heroBg}>
                          <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet={movie.textless_poster || movie.poster || movie.backdrop}
                />
                <img
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  className={styles.heroImg}
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              <div className={styles.heroOverlay}></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Story-style Navigation Zones */}
      <div className={styles.storyNavZones}>
        <div
          className={styles.navZoneLeft}
          onClick={() => handleManualAction(prevSlide)}
        />
        <div
          className={styles.navZoneRight}
          onClick={() => handleManualAction(nextSlide)}
        />
      </div>

      <motion.div
        className={styles.heroContent}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`content-${movie.id}`}
      >
        <motion.div variants={itemVariants}>
          {movie.logo ? (
            <div className={styles.logoWrapper}>
              <Image
                src={movie.logo}
                alt={movie.title}
                width={600}
                height={200}
                className={styles.logoImg}
                priority
              />
            </div>
          ) : (
            <h1 className={styles.title}>{movie.title}</h1>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className={styles.metaInfo}>
          <div className={styles.ratingBadge}>
            <span className={styles.imdbText}>IMDb</span>
            <div className={styles.ratingValue}>
              <Star size={14} fill="currentColor" />
              <span>{movie.rating?.toFixed(1)}</span>
            </div>
          </div>
          <span>{movie.year}</span>
          <span>{movie.media_type?.toUpperCase()}</span>
          {movie.genres?.[0] && <span>{movie.genres[0].name}</span>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className={styles.description}>
            {movie.description}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.actions}>
          <Link href={`/${movie.media_type}/${movie.id}`} className={styles.btnPlay}>
            <Play size={20} fill="currentColor" />
            Watch Now
          </Link>
        </motion.div>
      </motion.div>

      {/* Pagination & Navigation (Grouped at bottom) */}
      <div className={styles.pagination}>
        <div className={styles.barsWrapper}>
          {movies.map((_, idx) => (
            <div
              key={idx}
              className={styles.pageBarContainer}
              onClick={() => handleManualAction(() => setCurrentIndex(idx))}
            >
              <div className={styles.pageBar}>
                <div
                  key={`${idx}-${currentIndex}-${isAutoPlayDisabled}`}
                  className={`${styles.pageBarFill} ${idx === currentIndex
                    ? (isAutoPlayDisabled ? styles.pageBarFillComplete : styles.pageBarFillActive)
                    : (idx < currentIndex ? styles.pageBarFillComplete : '')
                    }`}
                  style={{
                    animationPlayState: isAutoPlayDisabled ? 'paused' : 'running',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            onClick={() => window.scrollTo({ top: window.innerHeight - 22, behavior: 'smooth' })}
          >
            <ChevronDown size={28} className={styles.scrollArrow} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
