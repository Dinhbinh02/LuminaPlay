'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './MovieGrid.module.css';

interface Movie {
  id: string;
  title: string;
  poster: string;
  year?: string;
  slug: string;
  quality?: string;
}

interface MovieGridProps {
  movies: Movie[];
  title: string;
}

export default function MovieGrid({ movies, title }: MovieGridProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.grid}>
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            className={styles.cardWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 12) * 0.05 }}
          >
            <Link href={`/watch/${movie.slug}`}>
              <div className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image 
                    src={movie.poster} 
                    alt={movie.title} 
                    fill
                    className={styles.poster}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    quality={60}
                  />
                  {movie.quality && (
                    <span className={styles.quality}>{movie.quality}</span>
                  )}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.movieTitle}>{movie.title}</h3>
                  <p className={styles.movieYear}>{movie.year}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
