'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.css';
import { useLoadingStore } from '@/hooks/useLoadingStore';

export default function LoadingScreen({ isForcedVisible }: { isForcedVisible?: boolean }) {
  const [isVisible, setIsVisible] = useState(true);
  const { isPageLoading } = useLoadingStore();

  useEffect(() => {
    // Initial mount loading
    const handleLoad = () => {
      setIsVisible(false);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      const timer = setTimeout(handleLoad, 3000); // Fail-safe
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timer);
      };
    }
  }, []);

  const show = isForcedVisible !== undefined ? isForcedVisible : (isVisible || isPageLoading);

  return (
    <AnimatePresence mode="wait">
      {show && (
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
