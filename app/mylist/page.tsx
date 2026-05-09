'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { Play, Trash2, Heart } from 'lucide-react';
import styles from './MyListPage.module.css';
import { useFavorites } from '@/hooks/useFavorites';

export default function MyListPage() {
  const { favorites, removeFromFavorites } = useStore();
  const { removeFavoriteFromCloud } = useFavorites();

  const handleRemove = (id: string) => {
    removeFromFavorites(id);
    removeFavoriteFromCloud(id);
  };

  return (
    <main className={styles.main}>
      <Header isSolid />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Heart size={32} color="#e50914" fill="#e50914" />
          <h1>My List</h1>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.empty}>
            <p>Your list is empty. Add some movies to watch them later!</p>
            <Link href="/" className={styles.browseBtn}>Browse Movies</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((item) => (
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
                      onClick={() => handleRemove(item.id)}
                      title="Remove from list"
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
