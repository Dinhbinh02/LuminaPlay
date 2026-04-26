'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ophim } from '@/lib/ophim';
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
  const [cdnDomain, setCdnDomain] = useState('');
  
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
          const res = await ophim.search(query, page);
          const items = res.data?.items || [];
          
          setCdnDomain(res.data?.APP_DOMAIN_CDN_IMAGE || '');
          
          setResults(prev => page === 1 ? items : [...prev, ...items]);
          setHasMore(items.length > 0);
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

  const handleSelect = (slug: string) => {
    router.push(`/watch/${slug}`);
    onClose();
    setQuery('');
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
              <div className={styles.searchBar}>
                <Search size={24} className={styles.searchIcon} />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search for movies, TV shows..."
                  className={styles.input}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                  {results.map((movie, index) => (
                    <motion.div 
                      key={`${movie._id}-${index}`}
                      ref={index === results.length - 1 ? lastElementRef : null}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.resultItem}
                      onClick={() => handleSelect(movie.slug)}
                    >
                      <div className={styles.posterWrapper}>
                        <img 
                          src={ophim.getImageUrl(movie.thumb_url, cdnDomain)} 
                          alt={movie.name} 
                          className={styles.poster} 
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.info}>
                        <h4 className={styles.title}>{movie.name}</h4>
                        <div className={styles.meta}>
                          <span>{movie.year}</span>
                          <span className={styles.dot}>•</span>
                          <span>{movie.quality}</span>
                          <span className={styles.dot}>•</span>
                          <span>{movie.lang}</span>
                        </div>
                      </div>
                      <div className={styles.playIcon}>
                        <Play size={20} fill="white" />
                      </div>
                    </motion.div>
                  ))}
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
