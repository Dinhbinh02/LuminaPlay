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
  genres?: { name: string; slug: string }[];
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
  }, [movies.length, currentIndex]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <section className={styles.hero}>
      <AnimatePresence mode="wait">
        <motion.div 
          className={styles.slideContainer} 
          key={movie.slug}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            const swipe = info.offset.x;
            if (swipe > 50) {
              prevSlide();
            } else if (swipe < -50) {
              nextSlide();
            }
          }}
        >
          {/* Main Background Link */}
          <Link 
            href={`/watch/${movie.slug}`} 
            className={styles.heroLink}
            aria-label={`Watch ${movie.title}`}
          >
            <div className={styles.heroBg}>
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
              <div className={styles.reflection}>
                <Image 
                  src={movie.backdrop} 
                  alt="reflection" 
                  fill
                  className={styles.reflectionImg}
                  quality={10}
                />
              </div>
            </div>
          </Link>

          {/* Interactive Content Layer */}
          <div className={styles.heroContent}>
            <motion.div>
              {movie.rank && (
                <div className={styles.rankBadge}>
                  <span className={styles.rankNumber}>#{movie.rank}</span>
                  <span className={styles.rankText}>Trending Today</span>
                </div>
              )}

              <Link href={`/watch/${movie.slug}`} className={styles.titleLink}>
                <h1 className={styles.title}>{movie.title}</h1>
              </Link>
              
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
                  <Link 
                    key={idx} 
                    href={`/search?genre=${genre.slug}`}
                    className={styles.genreTag}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {movies.length > 1 && (
                <div className={styles.dots}>
                  {movies.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

    </section>
  );
}
