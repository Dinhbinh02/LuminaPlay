'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import { useStore } from '@/store/useStore';
import { useFavorites } from '@/hooks/useFavorites';
import { Plus, Check, Info } from 'lucide-react';

export interface HeroMovie {
  id: number;
  title: string;
  description: string;
  backdrop: string;
  poster: string;
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
  const [isPaused, setIsPaused] = useState(false);
  
  const { favorites, addToFavorites, removeFromFavorites } = useStore();
  const { addFavoriteToCloud, removeFavoriteFromCloud } = useFavorites();

  useEffect(() => {
    if (movies.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [movies.length, isPaused]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  return (
    <section
      className={styles.hero}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={movie.id || currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={styles.slide}
        >
          {/* Main Background Link */}
          <Link
            href={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`}
            className={styles.heroLink}
            aria-label={`Watch ${movie.title}`}
          >
            <div className={styles.heroBg}>
              <div className={styles.desktopOnly}>
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  sizes="100vw"
                  className={styles.heroImg}
                  priority
                  quality={90}
                />
              </div>
              <div className={styles.mobileOnly}>
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  sizes="100vw"
                  className={styles.heroImg}
                  priority
                  quality={90}
                />
              </div>
              <div className={styles.heroOverlay}></div>
            </div>
          </Link>

          {/* Interactive Content Layer */}
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {movie.logo ? (
                <div className={styles.logoWrapper}>
                  <Image
                    src={movie.logo}
                    alt={movie.title}
                    width={400}
                    height={150}
                    className={styles.logoImg}
                    priority
                  />
                </div>
              ) : (
                <Link href={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`} className={styles.titleLink}>
                  <h1 className={styles.title}>{movie.title}</h1>
                </Link>
              )}

              <div className={styles.watchNowDesktop}>Watch Now</div>

              <p className={styles.description}>
                {movie.description}
              </p>

              {/* Genres list for Mobile Netflix style */}
              {movie.genres && movie.genres.length > 0 && (
                <div className={styles.genresList}>
                  {movie.genres.slice(0, 4).map((g, i) => (
                    <React.Fragment key={g.slug || i}>
                      <span className={styles.genreItem}>{g.name}</span>
                      {i < Math.min(movie.genres!.length, 4) - 1 && <span className={styles.genreDot}>•</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className={styles.actions}>
                <button 
                  className={styles.btnMyList}
                  onClick={(e) => {
                    e.preventDefault();
                    const item = {
                      id: movie.id.toString(),
                      title: movie.title,
                      poster: movie.poster,
                      progress: 0,
                      slug: movie.media_type === 'tv' ? `tv/${movie.id}` : `movie/${movie.id}`
                    };

                    if (favorites.some(f => f.id === item.id)) {
                      removeFromFavorites(item.id);
                      removeFavoriteFromCloud(item.id);
                    } else {
                      addToFavorites(item);
                      addFavoriteToCloud(item);
                    }
                  }}
                >
                  <div className={styles.actionIcon}>
                    {favorites.some(f => f.id === movie.id.toString()) ? <Check size={24} /> : <Plus size={24} />}
                  </div>
                  <span>My List</span>
                </button>

                <Link href={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`} className={styles.btnPlay}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </div>
                  <span>Play</span>
                </Link>

                <Link href={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`} className={styles.btnInfo}>
                  <div className={styles.actionIcon}>
                    <Info size={24} />
                  </div>
                  <span>Info</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
