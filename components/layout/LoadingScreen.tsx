'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styles from './LoadingScreen.module.css';
import { useLoadingStore } from '@/hooks/useLoadingStore';

export default function LoadingScreen({ isForcedVisible }: { isForcedVisible?: boolean }) {
  const { isPageLoading, setPageLoading } = useLoadingStore();
  const pathname = usePathname();

  // 1. Initial Fullscreen Loading Screen (Only on first load of homepage '/')
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  useEffect(() => {
    // Check if we are landing on the homepage and haven't shown it yet
    const hasLoaded = sessionStorage.getItem('hasLoadedInitial');
    if (pathname === '/' && !hasLoaded) {
      setIsInitialLoad(true);

      const handleLoadComplete = () => {
        setIsInitialLoad(false);
        sessionStorage.setItem('hasLoadedInitial', 'true');
      };

      if (document.readyState === 'complete') {
        // Add a tiny delay so the beautiful loading animation is visible to the user
        const timer = setTimeout(handleLoadComplete, 1500);
        return () => clearTimeout(timer);
      } else {
        window.addEventListener('load', handleLoadComplete);
        const timer = setTimeout(handleLoadComplete, 4000); // Fail-safe
        return () => {
          window.removeEventListener('load', handleLoadComplete);
          clearTimeout(timer);
        };
      }
    }
  }, [pathname]);

  // 2. Top Progress Bar Loading (For all internal page changes)
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    // Auto-reset page loading state on route change
    setPageLoading(false);
  }, [pathname, setPageLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPageLoading) {
      setShowProgressBar(true);
      setProgress(10);

      // Gradually increase progress up to 90%
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          const diff = (90 - prev) * 0.15;
          return prev + Math.max(diff, 1);
        });
      }, 300);

      return () => {
        clearInterval(interval);
      };
    } else {
      if (showProgressBar) {
        setProgress(100);
        timer = setTimeout(() => {
          setShowProgressBar(false);
          setProgress(0);
        }, 300); // Wait for the transition to 100% to complete
      }
    }
    return () => clearTimeout(timer);
  }, [isPageLoading, showProgressBar]);

  // Determine whether to show the fullscreen overlay (only on forced visibility or initial landing homepage load)
  const showOverlay = isForcedVisible !== undefined ? isForcedVisible : isInitialLoad;

  return (
    <>
      {/* Top progress bar for internal page routing */}
      <AnimatePresence>
        {showProgressBar && (
          <motion.div
            className={styles.topProgressBarContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={styles.topProgressBar}
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen overlay only on first homepage visit */}
      <AnimatePresence mode="wait">
        {showOverlay && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className={styles.content}>
              <div className={styles.logo}>
                <span className={styles.lumina}>Lumina</span>
                <span className={styles.play}>Play</span>
              </div>
              <div className={styles.loader}>
                <div className={styles.bar}></div>
              </div>
              <div className={styles.loadingText}>
                Getting things ready for you...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
