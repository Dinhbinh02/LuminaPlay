'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Trash2, Clock } from 'lucide-react';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const { history, removeFromHistory } = useStore();
  
  // Group history items by ID to only show the most recent episode/movie entry
  const uniqueHistory = history.filter((item, index, self) =>
    index === self.findIndex((t) => String(t.id) === String(item.id))
  );

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const formatSubTitle = (item: any) => {
    if (item.seasonNum && item.episodeNum) {
      return `S${item.seasonNum} : E${item.episodeNum}`;
    }
    if (item.progress > 95) return 'Finished';
    return `${Math.round(item.progress)}% watched`;
  };

  const getWatchLink = (item: any) => {
    if (item.slug) return `/watch/${item.slug}`;
    const type = item.seasonNum ? 'tv' : 'movie';
    return `/${type}/${item.id}`;
  };

  return (
    <main className={styles.main}>
      <Header isSolid />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Clock size={32} color="#e50914" />
          <h1>Watch History</h1>
        </div>

        {uniqueHistory.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven't watched anything yet.</p>
            <Link href="/" className={styles.browseBtn}>Browse Movies</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {uniqueHistory.map((item) => (
              <div key={`${item.id}-${item.seasonNum || 0}-${item.episodeNum || 0}`} className={styles.cardWrapper}>
                <div className={styles.card}>
                  <div className={styles.thumbnailWrapper}>
                    <Image 
                      src={getImageUrl(item.poster)} 
                      alt={item.title} 
                      fill
                      className={styles.thumbnail}
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <Link href={getWatchLink(item)} className={styles.overlay}>
                      <Play size={40} fill="white" className={styles.playIcon} />
                    </Link>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${item.progress}%` }} 
                      />
                    </div>
                  </div>
                  <div className={styles.info}>
                    <div className={styles.textInfo}>
                      <h3 className={styles.movieTitle}>{item.title}</h3>
                      <p className={styles.meta}>{formatSubTitle(item)}</p>
                    </div>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => removeFromHistory(item.id, item.seasonNum, item.episodeNum)}
                      title="Remove from history"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
