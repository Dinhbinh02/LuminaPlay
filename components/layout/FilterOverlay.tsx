'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid, Globe, Tag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGenres, useCountries } from '@/hooks/useMovie';
import styles from './FilterOverlay.module.css';

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CATEGORIES = [
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
  const searchParams = useSearchParams();

  const category = searchParams.get('category');
  const genre = searchParams.get('genre');
  const country = searchParams.get('country');

  const [selected, setSelected] = useState<{
    category: string;
    genre: string[];
    country: string[];
  }>({
    category: category || '',
    genre: genre ? genre.split(',') : [],
    country: country ? country.split(',') : [],
  });

  const genres = genresData?.data?.items?.filter((g: any) => g.slug !== 'phim-18') || [];
  const countries = countriesData?.data?.items || [];

  const handleToggle = (type: 'category' | 'genre' | 'country', slug: string) => {
    setSelected(prev => {
      if (type === 'category') {
        return { ...prev, category: prev.category === slug ? '' : slug };
      }
      
      const current = prev[type] as string[];
      const next = current.includes(slug)
        ? current.filter(s => s !== slug)
        : [...current, slug];
      
      return { ...prev, [type]: next };
    });
  };

  const handleClear = () => {
    setSelected({ category: '', genre: [], country: [] });
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (selected.category) params.set('category', selected.category);
    if (selected.genre.length > 0) params.set('genre', selected.genre.join(','));
    if (selected.country.length > 0) params.set('country', selected.country.join(','));
    
    router.push(`/search?${params.toString()}`);
    onClose();
  };

  const hasSelection = selected.category || selected.genre.length > 0 || selected.country.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <h2 className={styles.title}>Filters</h2>
              <button onClick={onClose} className={styles.closeBtn}>
                Close
              </button>
            </div>

            <div className={styles.scrollContent}>
              <div className={styles.grid}>
                {/* Categories */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <Grid size={20} className={styles.icon} />
                      <h3>Lists</h3>
                    </div>
                    {selected.category && (
                      <button 
                        className={styles.sectionClear}
                        onClick={() => handleToggle('category', selected.category)}
                      >
                        1 selected
                      </button>
                    )}
                  </div>
                  <div className={styles.options}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.slug}
                        className={`${styles.option} ${selected.category === cat.slug ? styles.active : ''}`}
                        onClick={() => handleToggle('category', cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Genres */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <Tag size={20} className={styles.icon} />
                      <h3>Genres</h3>
                    </div>
                    {selected.genre.length > 0 && (
                      <button 
                        className={styles.sectionClear}
                        onClick={() => setSelected(prev => ({ ...prev, genre: [] }))}
                      >
                        {selected.genre.length} selected
                      </button>
                    )}
                  </div>
                  <div className={styles.options}>
                    {genres.map((genre: any) => (
                      <button
                        key={genre.slug}
                        className={`${styles.option} ${selected.genre.includes(genre.slug) ? styles.active : ''}`}
                        onClick={() => handleToggle('genre', genre.slug)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Countries */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <Globe size={20} className={styles.icon} />
                      <h3>Countries</h3>
                    </div>
                    {selected.country.length > 0 && (
                      <button 
                        className={styles.sectionClear}
                        onClick={() => setSelected(prev => ({ ...prev, country: [] }))}
                      >
                        {selected.country.length} selected
                      </button>
                    )}
                  </div>
                  <div className={styles.options}>
                    {countries.map((country: any) => (
                      <button
                        key={country.slug}
                        className={`${styles.option} ${selected.country.includes(country.slug) ? styles.active : ''}`}
                        onClick={() => handleToggle('country', country.slug)}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {hasSelection && (
              <div className={styles.footer}>
                <button className={styles.clearBtn} onClick={handleClear}>
                  Clear
                </button>
                <button className={styles.applyBtn} onClick={handleApply}>
                  Apply
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
