'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid, Globe, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGenres, useCountries } from '@/hooks/useMovie';
import styles from './FilterOverlay.module.css';

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Phim Mới', slug: 'phim-moi' },
  { name: 'Phim Bộ', slug: 'phim-bo' },
  { name: 'Phim Lẻ', slug: 'phim-le' },
  { name: 'TV Shows', slug: 'tv-shows' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Phim Chiếu Rạp', slug: 'phim-chieu-rap' },
];

export default function FilterOverlay({ isOpen, onClose }: FilterOverlayProps) {
  const { data: genresData } = useGenres();
  const { data: countriesData } = useCountries();
  const router = useRouter();

  const genres = genresData?.data?.items?.filter((g: any) => g.slug !== 'phim-18') || [];
  const countries = countriesData?.data?.items || [];

  const handleSelect = (type: string, slug: string) => {
    if (type === 'category') {
      if (slug === 'phim-le') router.push('/movies');
      else if (slug === 'phim-bo') router.push('/series');
      else router.push(`/search?category=${slug}`);
    } else {
      router.push(`/search?${type}=${slug}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.overlay}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <h2 className={styles.title}>Choose Categories</h2>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={28} />
              </button>
            </div>

            <div className={styles.grid}>
              {/* Categories */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Grid size={20} className={styles.icon} />
                  <h3>Lists</h3>
                </div>
                <div className={styles.options}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.slug}
                      className={styles.option}
                      onClick={() => handleSelect('category', cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Genres */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Tag size={20} className={styles.icon} />
                  <h3>Genres</h3>
                </div>
                <div className={styles.options}>
                  {genres.map((genre: any) => (
                    <button
                      key={genre.slug}
                      className={styles.option}
                      onClick={() => handleSelect('genre', genre.slug)}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Countries */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Globe size={20} className={styles.icon} />
                  <h3>Countries</h3>
                </div>
                <div className={styles.options}>
                  {countries.map((country: any) => (
                    <button
                      key={country.slug}
                      className={styles.option}
                      onClick={() => handleSelect('country', country.slug)}
                    >
                      {country.name}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
