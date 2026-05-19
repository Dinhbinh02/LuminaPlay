'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStore, useModalStore } from '@/store/useStore';
import PinOverlay from "@/components/auth/PinOverlay";
import Sidebar from "@/components/layout/Sidebar";
import HomeView from "@/components/views/HomeView";
import SearchView from "@/components/views/SearchView";
import MyListView from "@/components/views/MyListView";
import DetailsView from "@/components/movie/DetailsView";
import { AnimatePresence, motion } from 'framer-motion';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const { 
    activeTab, 
    setActiveTab, 
    activeDetailId, 
    activeDetailType, 
    setActiveDetail 
  } = useModalStore();
  
  const { history, setHistory } = useStore();

  // Clean up legacy duplicates in history on initial load
  useEffect(() => {
    if (history && history.length > 0) {
      const seen = new Set<string>();
      const uniqueHistory = history.filter((item) => {
        const episodeKey = `${item.title?.trim().toLowerCase()}_s${item.seasonNum || 0}_e${item.episodeNum || 0}`;
        if (seen.has(episodeKey)) {
          return false;
        }
        seen.add(episodeKey);
        return true;
      });
      
      if (uniqueHistory.length !== history.length) {
        setHistory(uniqueHistory);
      }
    }
  }, [history, setHistory]);

  // Sync Next.js pathname changes to Zustand state (handles initial load & dynamic page routing)
  useEffect(() => {
    if (pathname) {
      const match = pathname.match(/^\/(movie|tv)\/([^/?#]+)/);
      if (match) {
        const type = match[1] as 'movie' | 'tv';
        const id = match[2];
        setActiveDetail(id, type);
      } else {
        setActiveDetail(null, null);
        if (['/', '/search', '/mylist', '/history'].includes(pathname)) {
          setActiveTab(pathname);
        }
      }
    }
  }, [pathname, setActiveTab, setActiveDetail]);

  // Sync browser back/forward buttons with activeTab and activeDetail states
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      // Update details overlay if active
      const match = path.match(/^\/(movie|tv)\/([^/?#]+)/);
      if (match) {
        const type = match[1] as 'movie' | 'tv';
        const id = match[2];
        setActiveDetail(id, type);
      } else {
        setActiveDetail(null, null);
      }

      if (['/', '/search', '/mylist'].includes(path)) {
        setActiveTab(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, setActiveDetail]);

  // Universal Click Interceptor to open Details page as an overlay instead of navigating
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      while (target && target.tagName !== 'A') {
        target = target.parentElement as HTMLElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      const match = href.match(/^\/(movie|tv)\/([^/?#]+)/);
      if (!match) return;

      // Ignore modifiers or non-left-clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // Do not intercept watch pages
      if (href.includes('/watch/')) return;

      e.preventDefault();

      const type = match[1] as 'movie' | 'tv';
      const id = match[2];

      window.history.pushState({ isOverlay: true }, '', href);
      setActiveDetail(id, type);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [setActiveDetail]);

  // Prevent background body scrolling when the overlay is open
  useEffect(() => {
    if (activeDetailId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDetailId]);

  const isMainTab = ['/', '/search', '/mylist'].includes(activeTab);

  return (
    <>
      <PinOverlay />
      <Sidebar />
      
      {/* Persistent Keep-Alive Views */}
      <div style={{ display: activeTab === '/' ? 'block' : 'none' }}>
        <HomeView />
      </div>
      <div style={{ display: activeTab === '/search' ? 'block' : 'none' }}>
        <SearchView />
      </div>
      <div style={{ display: activeTab === '/mylist' ? 'block' : 'none' }}>
        <MyListView />
      </div>

      {/* Render children for all other pages */}
      {!isMainTab && children}

      {/* Fullscreen Details Overlay (Tab Keep-Alive / Instant back navigation) */}
      <AnimatePresence>
        {activeDetailId && activeDetailType && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: '#000',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <DetailsView id={activeDetailId} type={activeDetailType} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
