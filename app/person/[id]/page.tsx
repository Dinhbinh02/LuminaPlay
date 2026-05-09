'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useTMDBPerson } from '@/hooks/useMovie';
import { tmdb } from '@/lib/tmdb';
import styles from './PersonPage.module.css';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: person, isLoading } = useTMDBPerson(id as string);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className={styles.container}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h1>Person not found</h1>
        </div>
      </div>
    );
  }

  const credits = person.combined_credits?.cast?.sort((a: any, b: any) => {
    const dateA = a.release_date || a.first_air_date || '0';
    const dateB = b.release_date || b.first_air_date || '0';
    return dateB.localeCompare(dateA);
  }) || [];

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.content}>
        <div className={styles.leftCol}>
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={tmdb.getImageUrl(person.profile_path, 'h632' as any) || 'https://via.placeholder.com/500x750?text=No+Image'} 
            alt={person.name} 
            className={styles.profileImage}
          />
          
          <div className={styles.infoList}>
            {person.birthday && (
              <div className={styles.infoItem}>
                <h4>Birthday</h4>
                <p>{person.birthday}</p>
              </div>
            )}
            {person.place_of_birth && (
              <div className={styles.infoItem}>
                <h4>Place of Birth</h4>
                <p>{person.place_of_birth}</p>
              </div>
            )}
            {person.known_for_department && (
              <div className={styles.infoItem}>
                <h4>Known For</h4>
                <p>{person.known_for_department}</p>
              </div>
            )}
            {person.deathday && (
              <div className={styles.infoItem}>
                <h4>Deathday</h4>
                <p>{person.deathday}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightCol}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.name}
          >
            {person.name}
          </motion.h1>
          
          <div className={styles.biography}>
            {person.biography || 'No biography available.'}
          </div>

          <div className={styles.sectionTitle}>
            <div className={styles.sectionBar} />
            Known For
          </div>

          <div className={styles.creditsGrid}>
            {credits.slice(0, 24).map((item: any) => (
              <Link 
                key={`${item.id}-${item.credit_id}`}
                href={item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
                className={styles.creditCard}
              >
                <div className={styles.posterWrapper}>
                  <img 
                    src={tmdb.getImageUrl(item.poster_path, 'w342')} 
                    alt={item.title || item.name} 
                    className={styles.poster}
                    loading="lazy"
                  />
                </div>
                <h4 className={styles.creditTitle}>{item.title || item.name}</h4>
                <p className={styles.creditRole}>{item.character || 'Actor'}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
