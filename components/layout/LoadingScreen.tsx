'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styles from './LoadingScreen.module.css';
import { useLoadingStore } from '@/hooks/useLoadingStore';

export default function LoadingScreen({ isForcedVisible }: { isForcedVisible?: boolean }) {
  const {
    isPageLoading,
    setPageLoading,
    isInitialLoading,
    markInitialLoaded,
    hasLoadedInitial,
    initialProgress,
    setInitialProgress
  } = useLoadingStore();
  const pathname = usePathname();

  useEffect(() => {
    if (hasLoadedInitial) return;

    // Fail-safe: Always hide the loading screen after a maximum of 6 seconds to prevent lockups
    const fallbackTimer = setTimeout(() => {
      markInitialLoaded();
    }, 6000);

    let progressInterval: NodeJS.Timeout;

    if (pathname !== '/') {
      // If we are not on the homepage, there are no hero images to preload.
      // Auto-hide the loading overlay when the page completes loading or after a fallback timeout.
      setInitialProgress(10);

      progressInterval = setInterval(() => {
        setInitialProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          const diff = (90 - prev) * 0.15;
          return prev + Math.max(diff, 1);
        });
      }, 200);

      const handleLoadComplete = () => {
        clearInterval(progressInterval);
        markInitialLoaded();
      };

      if (document.readyState === 'complete') {
        const timer = setTimeout(handleLoadComplete, 1000);
        return () => {
          clearTimeout(timer);
          clearInterval(progressInterval);
          clearTimeout(fallbackTimer);
        };
      } else {
        window.addEventListener('load', handleLoadComplete);
        return () => {
          window.removeEventListener('load', handleLoadComplete);
          clearInterval(progressInterval);
          clearTimeout(fallbackTimer);
        };
      }
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [pathname, hasLoadedInitial, markInitialLoaded, setInitialProgress]);

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
  const showOverlay = isForcedVisible !== undefined ? isForcedVisible : (isInitialLoading && !hasLoadedInitial);

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
                <div className={styles.bar} style={{ width: `${initialProgress}%` }}></div>
              </div>
              <div className={styles.loadingText}>
                Getting things ready... {initialProgress}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
