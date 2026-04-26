'use client';

import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export default function Skeleton({ width, height, borderRadius, className }: SkeletonProps) {
  return (
    <div 
      className={`${styles.skeleton} ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '100%', 
        borderRadius: borderRadius || 'var(--radius-sm)' 
      }}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton height="100%" borderRadius="var(--radius-md)" />
      <div className={styles.meta}>
        <Skeleton width="80%" height="16px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
  );
}

export function MovieSectionSkeleton() {
  return (
    <div className={styles.sectionSkeleton}>
      <Skeleton width="200px" height="28px" className={styles.title} />
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function MovieGridSkeleton() {
  return (
    <div className={styles.sectionSkeleton}>
      <Skeleton width="300px" height="40px" className={styles.title} />
      <div className={styles.grid} style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px',
        marginTop: '40px'
      }}>
        {[...Array(12)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

