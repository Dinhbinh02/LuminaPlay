'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Search, Users, User, Sliders } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import SearchOverlay from './SearchOverlay';
import FilterOverlay from './FilterOverlay';
import WatchPartyModal from '../movie/WatchPartyModal';

import UserMenu from './UserMenu';

export default function Header({ isSolid = false }: { isSolid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(isSolid);
  const [scrollOpacity, setScrollOpacity] = useState(isSolid ? 1 : 0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  // Determine content context for Watch Party
  const contentId = params?.id as string;
  const contentType = pathname?.startsWith('/tv/') ? 'tv' : 'movie';

  useEffect(() => {
    if (isSolid) {
      setIsScrolled(true);
      setScrollOpacity(1);
      return;
    }
    const handleScroll = () => {
      // Transition to solid black over 400px of scroll
      const opacity = Math.min(window.scrollY / 400, 1);
      setScrollOpacity(opacity);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSolid]);

  // Overlays are now responsible for their own scroll locking logic
  // to avoid duplication and conflicts.

  return (
    <>
      <header 
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : styles.headerTransparent} ${isSolid ? styles.headerSolid : ''}`}
        style={!isSolid ? { backgroundColor: `rgba(0, 0, 0, ${scrollOpacity})`, backdropFilter: `blur(${scrollOpacity * 12}px)`, WebkitBackdropFilter: `blur(${scrollOpacity * 12}px)` } : {}}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" className={styles.logo}>
            <img src="/icons/logo_square_v4.png" alt="Lumina Play Logo" className={styles.logoIcon} />
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

          <button 
            className={styles.actionBtn} 
            onClick={() => setIsPartyModalOpen(true)}
            aria-label="Watch Party"
            title="Watch Party"
          >
            <Users size={20} />
          </button>

          <UserMenu />
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

      <WatchPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        peerId={contentId}
        onJoin={(roomId) => {
          if (contentId) {
            router.push(`/watch/${contentType}/${contentId}?partyId=${roomId}`);
          } else {
            // If not on a detail page, we need to know what content to join.
            // For now, redirect to a search or show a message?
            // Actually, the WatchPartyModal could handle this or we can just redirect if we have context.
            // If we don't have contentId, we can't really join a specific watch page yet.
            // But usually, Room IDs are tied to content.
            console.log("No content context for Watch Party join");
          }
          setIsPartyModalOpen(false);
        }}
      />
    </>
  );
}
