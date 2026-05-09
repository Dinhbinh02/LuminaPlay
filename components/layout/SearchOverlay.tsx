'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import styles from './SearchOverlay.module.css';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isMoreLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isMoreLoading, hasMore]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset when query changes
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        if (page === 1) setIsLoading(true);
        else setIsMoreLoading(true);

        try {
          const res = await tmdb.search(query, 'multi', page);
          // Filter out people from multi-search results
          const items = res?.results?.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') || [];
          
          setResults(prev => page === 1 ? items : [...prev, ...items]);
          setHasMore(page < (res?.total_pages || 1));
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
          setIsMoreLoading(false);
        }
      } else {
        setResults([]);
        setHasMore(false);
      }
    }, page === 1 ? 400 : 0);

    return () => clearTimeout(timer);
  }, [query, page]);

  const handleSelect = (movie: any) => {
    const type = movie.media_type || 'movie';
    router.push(`/${type}/${movie.id}`);
    onClose();
    setQuery('');
  };

  const handleSearchEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

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
              <div className={styles.searchBar}>
                <Search size={24} className={styles.searchIcon} />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search for movies, TV shows..."
                  className={styles.input}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchEnter}
                />
                {query && (
                  <button onClick={() => setQuery('')} className={styles.clearBtn}>
                    <X size={20} />
                  </button>
                )}
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                Close
              </button>
            </div>

            <div className={styles.resultsContainer}>
              {isLoading && page === 1 ? (
                <div className={styles.loader}>Searching...</div>
              ) : results.length > 0 ? (
                <div className={styles.resultsList}>
                  {results.map((movie, index) => {
                    const title = movie.title || movie.name;
                    const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
                    const poster = movie.poster_path || movie.backdrop_path;
                    
                    return (
                      <motion.div 
                        key={`${movie.id}-${index}`}
                        ref={index === results.length - 1 ? lastElementRef : null}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.resultItem}
                        onClick={() => handleSelect(movie)}
                      >
                        <div className={styles.posterWrapper}>
                          {poster ? (
                            <img 
                              src={tmdb.getImageUrl(poster, 'w342')} 
                              alt={title} 
                              className={styles.poster} 
                              loading="lazy"
                            />
                          ) : (
                            <div className={styles.posterPlaceholder}>
                              <Search size={24} opacity={0.3} />
                            </div>
                          )}
                        </div>
                        <div className={styles.info}>
                          <h4 className={styles.title}>{title}</h4>
                          <div className={styles.meta}>
                            {year && <span>{year}</span>}
                            {year && <span className={styles.dot}>•</span>}
                            <span>{movie.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                            <span className={styles.dot}>•</span>
                            <span>⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        <div className={styles.playIcon}>
                          <Play size={20} fill="white" />
                        </div>
                      </motion.div>
                    );
                  })}
                  {isMoreLoading && (
                    <div className={styles.moreLoader}>Loading more...</div>
                  )}
                </div>
              ) : query.length >= 2 ? (
                <div className={styles.noResults}>No results found for "{query}"</div>
              ) : (
                <div className={styles.placeholder}></div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
