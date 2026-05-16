'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Star, Loader2, Globe } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import styles from './PersonModal.module.css';
import Link from 'next/link';

interface PersonModalProps {
  personId: string | null;
  onClose: () => void;
}

// Brand Icons as SVGs since they are missing in the current lucide-react version
// Modern Social Icons with better paths - significantly enlarged
const FacebookIcon = () => (
  <svg width="30" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);

const InstagramIcon = () => (
  <svg width="30" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const TwitterIcon = () => (
  <svg width="24" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.482 3.239H4.293l13.316 17.408z" /></svg>
);

export default function PersonModal({ personId, onClose }: PersonModalProps) {
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      tmdb.getPersonDetails(personId).then((data) => {
        setPerson(data);
        setLoading(false);
      });
    } else {
      setPerson(null);
    }
  }, [personId]);

  useEffect(() => {
    if (personId) {
      document.body.style.overflow = 'hidden';

      const preventScroll = (e: WheelEvent) => {
        const target = e.target as HTMLElement;
        const contentArea = target.closest(`.${styles.content}`);
        
        if (!contentArea) {
          // If scrolling outside the content area (on backdrop), block it
          e.preventDefault();
          return;
        }

        // If scrolling inside the content area, check for boundaries to prevent chaining
        const { scrollTop, scrollHeight, clientHeight } = contentArea;
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;

        if (isScrollingUp && scrollTop <= 0) {
          e.preventDefault();
        } else if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
          e.preventDefault();
        }
      };

      window.addEventListener('wheel', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('wheel', preventScroll);
      };
    }
  }, [personId]);

  const modalContent = (
    <AnimatePresence>
      {personId && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>

            {loading ? (
              <div className={styles.loader}>
                <Loader2 size={40} className={styles.spinner} />
              </div>
            ) : person && (
              <div className={styles.content}>
                <div className={styles.heroSection}>
                  <img
                    src={tmdb.getImageUrl(person.images?.profiles?.[0]?.file_path || person.profile_path, 'original')}
                    alt={person.name}
                    className={styles.heroImage}
                  />
                  <div className={styles.heroOverlay}>
                    <h2 className={styles.name}>{person.name}</h2>

                    <div className={styles.heroInfo}>
                      <div className={styles.personalInfo}>
                        <div className={styles.infoRow}>
                          <Star size={18} />
                          <span>{Math.round(person.popularity * 1000).toLocaleString()} Popularity Index</span>
                        </div>
                        {person.birthday && (
                          <div className={styles.infoRow}>
                            <Calendar size={18} />
                            <span>Born {new Date(person.birthday).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                        {person.place_of_birth && (
                          <div className={styles.infoRow}>
                            <MapPin size={18} />
                            <span>{person.place_of_birth}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.socialLinks}>
                        {person.external_ids?.facebook_id && (
                          <a href={`https://facebook.com/${person.external_ids.facebook_id}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.facebook}`}>
                            <FacebookIcon />
                          </a>
                        )}
                        {person.external_ids?.instagram_id && (
                          <a href={`https://instagram.com/${person.external_ids.instagram_id}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.instagram}`}>
                            <InstagramIcon />
                          </a>
                        )}
                        {person.external_ids?.twitter_id && (
                          <a href={`https://twitter.com/${person.external_ids.twitter_id}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.twitter}`}>
                            <TwitterIcon />
                          </a>
                        )}
                        {person.homepage && (
                          <a href={person.homepage} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.website}`}>
                            <Globe size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.mainLayout}>

                  <div className={styles.mainContent}>
                    {person.biography && (
                      <div className={styles.aboutSection}>
                        <h3 className={styles.sectionTitle}>About</h3>
                        <p className={styles.bioText}>{person.biography}</p>
                      </div>
                    )}

                    <div className={styles.creditsSection}>
                      <h3 className={styles.sectionTitle}>Popular Works</h3>
                      <div className={styles.creditsGrid}>
                        {Array.from(new Map(person.combined_credits?.cast?.map((item: any) => [item.id, item])).values())
                          ?.sort((a: any, b: any) => b.popularity - a.popularity)
                          ?.slice(0, 6)
                          ?.map((item: any) => (
                            <Link
                              key={item.id}
                              href={`/${item.media_type}/${item.id}`}
                              className={styles.creditCard}
                              onClick={onClose}
                            >
                              <div className={styles.creditPosterWrapper}>
                                <img
                                  src={tmdb.getImageUrl(item.poster_path, 'w342') || 'https://via.placeholder.com/342x513?text=No+Poster'}
                                  alt={item.title || item.name}
                                  className={styles.creditPoster}
                                />
                              </div>
                              <div className={styles.creditInfo}>
                                <p className={styles.creditTitle}>{item.title || item.name}</p>
                                <p className={styles.creditYear}>
                                  {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                                </p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
