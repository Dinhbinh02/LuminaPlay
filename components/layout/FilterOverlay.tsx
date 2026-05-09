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
    year: string;
    rating: string;
    runtime: string;
    company: string;
  }>({
    category: category || '',
    genre: genre ? genre.split(',') : [],
    country: country ? country.split(',') : [],
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
    runtime: searchParams.get('runtime') || '',
    company: searchParams.get('company') || '',
  });

  const genres = genresData?.data?.items?.filter((g: any) => g.slug !== 'phim-18') || [];
  const countries = countriesData?.data?.items || [];

  const RATINGS = [
    { label: '8.0+', value: '8' },
    { label: '7.0+', value: '7' },
    { label: '6.0+', value: '6' }
  ];
  const RUNTIMES = [
    { label: '< 90 min', value: 'short' },
    { label: '90 - 120 min', value: 'medium' },
    { label: '> 120 min', value: 'long' }
  ];
  const COMPANIES = [
    { name: 'Marvel', id: '420' },
    { name: 'DC', id: '9993' },
    { name: 'Pixar', id: '3' },
    { name: 'Disney', id: '2' },
    { name: 'Studio Ghibli', id: '10342' },
    { name: 'A24', id: '41028' },
    { name: 'Blumhouse', id: '3172' },
    { name: 'HBO', id: '3268' },
    { name: 'Netflix', id: '213' },
    { name: 'Lucasfilm', id: '1' },
    { name: 'Warner Bros', id: '174' },
    { name: 'Universal', id: '33' },
    { name: 'Paramount', id: '4' },
    { name: 'Sony Pictures', id: '34' },
    { name: 'Columbia', id: '5' },
    { name: 'DreamWorks', id: '521' },
    { name: 'Lionsgate', id: '1632' },
    { name: 'MGM', id: '21' }
  ];

  const YEARS = [
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '90s', value: '1990s' },
    { label: '80s', value: '1980s' },
    { label: '70s', value: '1970s' }
  ];

  const GENRES = [
    { name: 'Action', id: '28' },
    { name: 'Adventure', id: '12' },
    { name: 'Animation', id: '16' },
    { name: 'Comedy', id: '35' },
    { name: 'Crime', id: '80' },
    { name: 'Documentary', id: '99' },
    { name: 'Drama', id: '18' },
    { name: 'Family', id: '10751' },
    { name: 'Fantasy', id: '14' },
    { name: 'History', id: '36' },
    { name: 'Horror', id: '27' },
    { name: 'Music', id: '10402' },
    { name: 'Mystery', id: '9648' },
    { name: 'Romance', id: '10749' },
    { name: 'Sci-Fi', id: '878' },
    { name: 'Thriller', id: '53' },
    { name: 'War', id: '10752' },
    { name: 'Western', id: '37' }
  ];

  const COUNTRIES = [
    { name: 'United States', id: 'US' },
    { name: 'South Korea', id: 'KR' },
    { name: 'Japan', id: 'JP' },
    { name: 'Vietnam', id: 'VN' },
    { name: 'China', id: 'CN' },
    { name: 'Thailand', id: 'TH' },
    { name: 'France', id: 'FR' },
    { name: 'United Kingdom', id: 'GB' }
  ];

  const handleToggle = (type: keyof typeof selected, value: string) => {
    setSelected(prev => {
      if (type === 'rating' || type === 'runtime' || type === 'year' || type === 'company') {
        return { ...prev, [type]: prev[type as keyof typeof selected] === value ? '' : value };
      }
      const current = prev[type] as string[];
      const next = current.includes(value)
        ? current.filter(s => s !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const handleClear = () => {
    setSelected({ category: '', genre: [], country: [], year: '', rating: '', runtime: '', company: '' });
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    params.set('source', 'tmdb');
    if (selected.genre.length > 0) params.set('genre', selected.genre.join(','));
    if (selected.country.length > 0) params.set('country', selected.country.join(','));
    if (selected.year) params.set('year', selected.year);
    if (selected.rating) params.set('rating', selected.rating);
    if (selected.runtime) params.set('runtime', selected.runtime);
    if (selected.company) params.set('company', selected.company);
    
    router.push(`/search?${params.toString()}`);
    onClose();
  };

  const hasSelection = Object.values(selected).some(v => Array.isArray(v) ? v.length > 0 : v !== '');

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
              <div className={styles.titleGroup}>
                <h2 className={styles.title}>Discovery</h2>
                <p className={styles.subtitle}>Explore movies using TMDB precision filters</p>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                Close
              </button>
            </div>

            <div className={styles.scrollContent}>
              <div className={styles.grid}>
                {/* Advanced: Rating & Runtime */}
                <div className={styles.row}>
                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Minimum Rating</h3>
                    </div>
                    <div className={styles.options}>
                      {RATINGS.map(r => (
                        <button
                          key={r.value}
                          className={`${styles.option} ${selected.rating === r.value ? styles.active : ''}`}
                          onClick={() => handleToggle('rating', r.value)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Duration</h3>
                    </div>
                    <div className={styles.options}>
                      {RUNTIMES.map(r => (
                        <button
                          key={r.value}
                          className={`${styles.option} ${selected.runtime === r.value ? styles.active : ''}`}
                          onClick={() => handleToggle('runtime', r.value)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Studios */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Production Studios</h3>
                  </div>
                  <div className={styles.options}>
                    {COMPANIES.map(comp => (
                      <button
                        key={comp.id}
                        className={`${styles.option} ${selected.company === comp.id ? styles.active : ''}`}
                        onClick={() => handleToggle('company', comp.id)}
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Release Period */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Release Period</h3>
                  </div>
                  <div className={styles.options}>
                    {YEARS.map(y => (
                      <button
                        key={y.value}
                        className={`${styles.option} ${selected.year === y.value ? styles.active : ''}`}
                        onClick={() => handleToggle('year', y.value)}
                      >
                        {y.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Genres */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Genres</h3>
                  </div>
                  <div className={styles.options}>
                    {GENRES.map(genre => (
                      <button
                        key={genre.id}
                        className={`${styles.option} ${selected.genre.includes(genre.id) ? styles.active : ''}`}
                        onClick={() => handleToggle('genre', genre.id)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Origin Country */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Origin Country</h3>
                  </div>
                  <div className={styles.options}>
                    {COUNTRIES.map(country => (
                      <button
                        key={country.id}
                        className={`${styles.option} ${selected.country.includes(country.id) ? styles.active : ''}`}
                        onClick={() => handleToggle('country', country.id)}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className={styles.footer}>
              {hasSelection && (
                <button className={styles.clearBtn} onClick={handleClear}>
                  Clear All
                </button>
              )}
              <button className={styles.applyBtn} onClick={handleApply}>
                Explore Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
