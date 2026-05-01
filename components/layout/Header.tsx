'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Sliders, Play } from 'lucide-react';
import styles from './Header.module.css';
import SearchOverlay from './SearchOverlay';
import FilterOverlay from './FilterOverlay';

export default function Header({ isSolid = false }: { isSolid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(isSolid);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (isSolid) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSolid]);

  // Prevent scroll when overlays are open
  useEffect(() => {
    if (isSearchOpen || isFilterOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
  }, [isSearchOpen, isFilterOpen]);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : styles.headerTransparent} ${isSolid ? styles.headerSolid : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Play size={16} color="white" fill="white" />
            </div>
            <span className={styles.logoText}>LUMINA</span>
          </Link>

        </div>

        <div className={styles.actions}>
          <button 
            className={styles.actionBtn} 
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button 
            className={styles.actionBtn}
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filters"
          >
            <Sliders size={20} />
          </button>

          <button className={styles.actionBtn} style={{ position: 'relative' }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #000'
            }}></span>
          </button>

          <div className={styles.avatar}>
            <div className={styles.avatarInner}>
              <User size={22} color="white" />
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
      <Suspense fallback={null}>
        <FilterOverlay 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
        />
      </Suspense>
    </>
  );
}
