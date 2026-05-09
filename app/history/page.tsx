'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { Play, Trash2, Clock } from 'lucide-react';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const { history, removeFromHistory } = useStore();

  return (
    <main className={styles.main}>
      <Header isSolid />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Clock size={32} color="#e50914" />
          <h1>Watch History</h1>
        </div>

        {history.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven't watched anything yet.</p>
            <Link href="/" className={styles.browseBtn}>Browse Movies</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {history.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.posterWrapper}>
                  <img src={item.poster} alt={item.title} className={styles.poster} />
                  <Link href={`/watch/${item.slug}`} className={styles.playOverlay}>
                    <Play size={48} fill="white" />
                  </Link>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <div className={styles.actions}>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => removeFromHistory(item.id)}
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
